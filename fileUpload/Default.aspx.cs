using System;
using System.Collections.Generic;
using System.IO;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Web.Script.Services;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Threading;

namespace fileUpload
{
    [ScriptService]
    public partial class Default : System.Web.UI.Page
    {
        public static int sofar = 0;
        public static int total = 0;
        public static int bufferSize = 10000;
        public static int bufferTime = 20;
        public static string stat = "idle";
        public static string msg = "";
        protected void Page_Load(object sender, EventArgs e)
        {
            if (IsCallback || IsPostBack)
            {
                postBackTest.InnerText = "Post back!";
            }
        }


        [WebMethod]
        public static int[] getProgress()
        {
            int[] progress = { sofar, total };
            return progress;
        }

        [WebMethod]
        public static string[] getStatues()
        {
            string[] tmp = { stat, msg };
            return tmp;
        }

        [WebMethod]
        public static string finish()
        {
            stat = "idle";
            msg = "";
            return "";
        }

        protected bool format_security(HttpPostedFile fileObj)
        {
            //System.IO.Path.GetFileName(fileObj.FileName);
            //System.IO.Path.GetExtension(fileObj.FileName);
            return true;
        }
        public delegate void fileWriterDelegate(MemoryStream reader, string savePath);
        protected void uploader_submit_Click(object sender, EventArgs e)
        {
            stat = "idle";
            HttpPostedFile up = uploader.PostedFile;
            total = up.ContentLength;
            if ( !format_security(up) )
            {
                msg = "您的文件格式不正确！";
                stat = "error";
            }
            else if (total <= 0)
            {
                msg = "没有选择文件，或者文件无效！";
                stat = "error";
            }
            else
            {
                string savePath = (new Random().Next(100000).ToString()) + System.IO.Path.GetExtension(up.FileName);
                stat = "progressing";
                msg = "正在上传" + savePath+"，请稍候……";
                savePath = MapPath("~/uploadTemp/" + savePath);
                fileWriter(savePath, up.InputStream);
                updateTest.InnerText = "Updated!";
                //ScriptManager.RegisterStartupScript(UpdatePanel1, this.GetType(), "block", "uploadPanel_UI.keepUI(); uploadPanel_UI.finish();", true);
                //Response.End();
            }
            total = 0;
            sofar = 0;
        }
        public void fileWriter(string savePath, Stream reader)
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
                    Default.sofar += len;
                    //try
                    //{
                        len = reader.Read(buffer, 0, bufferSize);
                    //}
                    //catch (Exception e)
                    //{
                    //}
                }
                sofar = total;
                stat = "success";
                reader.Close();
                fs.Close();
            }
        }
    }
}