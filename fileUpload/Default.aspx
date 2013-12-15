<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="fileUpload.Default" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="zh-CN">
<head runat="server">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>上传测试页</title>
    <link href="uploadPanel.css" rel="stylesheet" type="text/css" />
</head>
<body>
    <form id="form1" runat="server">
    <asp:ScriptManager runat="server" ID="scriptManager" EnablePageMethods="true">
        <Scripts>
            <asp:ScriptReference Path="~/jquery-1.9.1.min.js" />
            <asp:ScriptReference Path="~/jquery.form.min.js" />
            <asp:ScriptReference Path="~/uploadPanel.js" />
        </Scripts>
    </asp:ScriptManager>
    <div>
        <asp:UpdatePanel ID="UpdatePanel1" runat="server" UpdateMode="Conditional">
            <ContentTemplate>
                <asp:FileUpload ID="uploader" runat="server" />
                <asp:Button ID="uploader_submit" runat="server" Text="上传" OnClientClick="uploadPanel_UI.beginAsync()" OnClick="uploader_submit_Click" />
            </ContentTemplate>
            <Triggers>
                <asp:PostBackTrigger ControlID="uploader_submit" />
            </Triggers> 
        </asp:UpdatePanel>
        <div id="postBackTest" runat="server">Not posted back.</div>
        <div id="updateTest" runat="server">Not updated.</div>
        <div class="black_mask" id="black_mask"></div>
		<div class="upload_dialog" id="upload_dialog" onselectstart="return false" unselectable="on">
			<div class="dialog_title">
				<p style="width:150px;float:left" id="upload_dialog_title">正在上传</p>
				<div class="upload_dialog_close" id="upload_dialog_close" onclick="uploadPanel_UI.cancelComfirm()"></div>
			</div>
			<p style="line-height:10px">&nbsp;</p>
			<p id="upload_dialog_text">&nbsp; 正在上传，请稍候……</p>
			<div class="progress_bar" id="progress_bar">
				<span class="progress_inner" id="progress_inner"></span>
			</div>
			<div class="percentage_indicator" id="percentage_indicator">
				已上传
				<span id="percentage_num">100.0</span>%
			</div>
			<div class="finish_indicator" id="finish_indicator">&nbsp; 上传完毕！</div>
			<div class="upload_dialog_button" id="upload_dialog_button" onclick="uploadPanel_UI.exit(0)">确定</div>
		</div>

    </div>
    </form>
</body>
</html>
