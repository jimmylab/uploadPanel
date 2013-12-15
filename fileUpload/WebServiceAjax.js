/**
 * 获取ASP.NET之WebService资源
 * @release:  Nov 23, 2013
 * @license: GPL, LGPL
 * 
 * @version 1.0.0
 * @author Jimmy Liu
 * 
 * @param (String) method WebService方法名
 * @param (String/JSON) data JSON格式的参数列表，键名为后台方法的参数名，键值为相应参数值
 * @param (Function) 请求成功时的回调函数，回调函数若有第一个参数将得到JSON格式的返回值
 * @param (Function) 请求失败时的回调函数，回调函数若有第一个参数将得到错误
 * @return (Object/JSON & Object/Error) 请求成功则返回值，失败返回异常对象
 */
function getService( method, param/*, success, failed*/ ) {
	$.ajax({
		type: "Post",
		url: method,
		data: param,
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function(data) {
			  alert(data.d);
		},
		error: function(err) {
			alert("出错啦");
		}
	});
}