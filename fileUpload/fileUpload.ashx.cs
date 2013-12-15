using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Threading;
using System.Runtime.Serialization;

namespace fileUpload
{
    public class UploadException : Exception
    {
        private Exception parent;
        int typeCode;
        public UploadException(string Msg, int TypeCode = 404)
        {
            parent = new Exception(Msg);
            typeCode = TypeCode;
        }
        public void DefaultCatch(HttpContext Handler, UploadDetail Detail)
        {
            //Handler.Response.StatusCode = typeCode;
            Handler.Response.ContentType = "Application/JSON";
            Handler.Response.Write(Detail.toJSON("error", parent.Message));
            Handler.Response.End();
        }
    }
    public class UploadDetail
    {
        public bool isReady { get; set; }
        public int total { get; set; }
        public int sofar { get; set; }

        public UploadDetail()
        {
            this.isReady = false;
            this.total = 0;
            this.sofar = 0;
        }

        public string toJSON(string statues = "success", string msg = "progressing")
        {
            string json = "{ ";
            json += "'statues': '" + statues + "', ";
            json += "'msg': '" + msg + "', ";
            json += "'total': " + total.ToString() + ", ";
            json += "'sofar': " + sofar.ToString();
            json += " }";
            return json;
        }
    }




    public class fileUpload1 : IHttpHandler
    {
        // 最大上传大小
        public const int maxUploadSize = 209715200;    // 200MB
        // 分块大小
        public const int bufferSize = 10240;    // 10KB
        // 上传延时(Debug用)
        public const int bufferTime = 20;    // 20ms




        // 处理请求主函数
        public void ProcessRequest(HttpContext context)
        {
            string method = "";
            UploadDetail detail = null;
            try
            {
                detail = (UploadDetail)context.Session["UploadDetail"];
            }
            catch (Exception e)
            {
                detail = new UploadDetail();
                context.Session["UploadDetail"] = detail;
                detail = (UploadDetail)context.Session["UploadDetail"];
            }



            try // 总异常捕捉
            {



                // 过滤空请求
                try
                {
                    method = context.Request.QueryString["method"];
                }
                catch (Exception)
                {
                    throw new UploadException("请求为空！"/*, 400*/);
                }



                switch (method)
                {



                    case "doUpload":
                        HttpRequest request = context.Request;
                        HttpPostedFile fileHandler = null;
                        try
                        {
                            fileHandler = request.Files[0];
                        }
                        catch(Exception)
                        {
                            throw new UploadException("获取上传文件流失败！"/*, 411*/);
                        }

                        if (fileHandler.ContentLength <= 0)
                        {
                            throw new UploadException("没有选择文件！"/*, 411*/);
                        }

                        else if (!formatCheck(fileHandler))
                        {
                            throw new UploadException("文件格式不妥。请上传正常的文档！"/*, 406*/);
                        }

                        else if (request.ContentLength > maxUploadSize)
                        {
                            throw new UploadException("文件过大，上传失败！"/*, 413*/);
                        }

                        else if (detail.isReady)
                        {
                            throw new UploadException("正在进行另一上传进程，请稍后再试。"/*, 409*/);
                        }
                        else
                        {
                            detail.isReady = true;
                            detail.total = fileHandler.ContentLength;
                            string savePath = (new Random().Next(100000).ToString()) + System.IO.Path.GetExtension(fileHandler.FileName);
                            savePath = context.Server.MapPath("~/uploadTemp/" + savePath);
                            fileWriter(savePath, fileHandler.InputStream, detail);
                        }
                        break;




                    case "getStat":
                        if (!detail.isReady)
                            throw new UploadException("您还没有上传，不能获取进度！"/*, 403*/);
                        else
                        {
                            context.Response.ContentType = "Application/JSON";
                            context.Response.Write(detail.toJSON());
                            context.Response.End();
                        }
                        break;
                    default: break;
                }
            }
            catch (UploadException e)
            {
                e.DefaultCatch(context, detail);
            }
        }




        /**
         * 文件类型及安全性检查
         * @param HttpPostedFile fileHandler 一个Http文件对象
         */
        protected bool formatCheck(HttpPostedFile fileHandler)
        {
            //string type = fileHandler.ContentType;
            //string ext = System.IO.Path.GetExtension(fileHandler.FileName);
            return true;
        }




        /**
         * 文件写入方法
         * @param string savePath 服务器保存路径
         * @param Stream reader 一个数据流对象，一般是HTTP POST中获取的文件流
         * @param UploadDetail detail 上传信息对象，用于实时修改状态
         */
        public void fileWriter(string savePath, Stream reader, UploadDetail detail)
        {
            lock (reader)
            {
                int bufferSize = Default.bufferSize;
                FileStream fs = new FileStream(savePath, FileMode.Create);
                byte[] buffer = new byte[bufferSize];
                int len = reader.Read(buffer, 0, bufferSize);
                while (len > 0 /*&& sofar < total*/)
                {
                    fs.Write(buffer, 0, len);
                    Thread.Sleep(bufferTime);
                    detail.sofar += len;
                    len = reader.Read(buffer, 0, bufferSize);
                }
                detail.sofar = detail.total;
                detail.isReady = false;
                reader.Close();
                fs.Close();
            }
        }




        // IsReusable暂时弃用
        public bool IsReusable
        {
            get
            {
                return false;
            }
        }


    }
}