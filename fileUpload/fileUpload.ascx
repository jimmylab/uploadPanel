<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="fileUpload.ascx.cs" Inherits="fileUpload.fileUpload" %>
<asp:ScriptManager runat="server" ID="scriptManager" EnablePageMethods="true">
    <Scripts>
        <asp:ScriptReference Path="~/jquery-1.9.0.min.js" />
        <asp:ScriptReference Path="~/jquery.form.min.js" />
        <asp:ScriptReference Path="~/uploadPanel.js" />
    </Scripts>
</asp:ScriptManager>

<script type="text/javascript"></script>
<link href="uploadPanel.css" rel="stylesheet" type="text/css" />
<form method="post" id="fileUpload" action="/fileUpload.ashx?method=doUpload">
	<input type="file" name="upload" />
    <input type="submit" />
    <iframe class="uploadCompatibility" id="uploadCompatibility" src="#" />
</form>
