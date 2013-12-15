/**
 * uploadPanel UI界面对象
 * @release:  Nov 24, 2013
 * @license: GPL, LGPL
 * 
 * @version 2.8.1
 * @author Jimmy Liu
 */
var uploadPanel_UI = {
	// UI定时器
	"timer": null,

	// 全局失败次数
	"failedTimes": 0,

	// 总进度宽度
	"progressWidth": 0,
	
	// 是否已经初始化（防止发生意外）
	"initialized": false,

	// 上传是否已经开始
	"upload_started": false,

	// 是否正在进行动画
	"animating": false,

	// 上次的进度
	"last_far": 0,
	"last_total": 0,



	/**
	 * UI初始化方法
	 * @param 无
	 * @return 无
	 * @exception this.jQueryErr()
	 */
	"init": function() {
	    if (this.jQueryErr()) return;
		this.failedTimes = 0;
		this.progressWidth = parseInt( $("#progress_bar").css("width") );
		if (!this.initialized) $("#black_mask").fadeTo(800,0.5);    // 显示黑幕
		this.initialized = true;
		$("#finish_indicator").hide(0);    // 隐藏完成提示符
		$("#upload_dialog_button").hide(0);    // 隐藏按钮
		$("#upload_dialog").show(0);    // 显示对话框
		$("#progress_inner").css("width", "0px");     // 进度条置零
		$("#percentage_indicator").show(0);    // 显示进度提示
		$("#percentage_num").text("0.0");     // 将其中百分比置零
		document.getElementById("upload_dialog_text").innerHTML="&nbsp; 正在上传，请稍候……";
	},


	"jQueryErr": function () {
	    if ( !window.jQuery ) {
	        alert("UI模块错误: 未能加载jQuery!");
	        return 1;
	    } else if ( "undefined" == typeof(window.jQuery.fn.ajaxSubmit) ) {
	        alert("上传组件错误: 未能加载jQuery.form!");
	        return 2;
	    }
	    return 0;
	},



	/**
	 * 进度开始
	 * @param 无
	 * @return 无
	 */
	"begin": function() {
		if (this.upload_started) return;
		if ( !this.initialized ) this.init();
		if ( this.failedTimes > 20 ) {
			this.timerCancel();
			this.showMsg("服务器异常，上传失败！");
			return;
		}
		/* 轮询直到状态不为idle（空闲） */
		PageMethods.getStatues(
			function(statues) {
				switch(statues[0]) {
					//case "success": uploadPanel_UI.finish(true); break;
					case "progressing":
						uploadPanel_UI.failedTimes = 0;
						uploadPanel_UI.upload_started = true;
						document.getElementById("upload_dialog_text").innerHTML="&nbsp; "+statues[1];
						uploadPanel_UI.timer = setInterval( "uploadPanel_UI.polling()", 1000 );
						break;
					case "error": uploadPanel_UI.showMsg(statues[1]); break;
					case "idle": uploadPanel_UI.failedTimes++;
						setTimeout( "uploadPanel_UI.begin()", 100 );
						break;
				}
			},
			function () {
			    uploadPanel_UI.failedTimes++;
			    setTimeout("uploadPanel_UI.begin()", 100);
			}
		);
	},



	/**
	 * 进度开始（异步调用）
	 * @param 无
	 * @return 无
	 */
	"beginAsync": function() {
		if ( this.upload_started ) return;
		setTimeout( "uploadPanel_UI.begin()", 100 );
	},



	/**
	 * 轮询当前上传进度
	 * @param 无
	 * @return 无
	 */
	"polling": function() {
		if ( this.failedTimes > 20 ) {
			this.timerCancel();
			this.showMsg("服务器异常，上传失败！");
			return;
		}
		PageMethods.getProgress(
			function(percent) {
				uploadPanel_UI.failedTimes = 0;
				uploadPanel_UI.progressAnimate(percent[0], percent[1]);
			},
			function() {
				uploadPanel_UI.failedTimes++;
			}
		);
		if ( this.last_far >= this.last_total && this.total>0 ) {
			/*uploadPanel_UI.progressAnimate(this.last_total, this.last_total);
			PageMethods.getStatues(
				function(statues) {
				    if ( statues[0]=="success" ) {*/
				        //uploadPanel_UI.finish(true);
		                this.timerCancel();
				    /*}
					else uploadPanel_UI.failedTimes++;
				},
				function() { uploadPanel_UI.failedTimes++; }
			);*/
		}
	},



	/**
	 * 以动画形式更新百分比
	 * @param sofar 已下载字节
	 * @param total 总字节数
	 * @return 无
	 * @exception if ( !initialized ) return;
	 * @exception clearInterval(this.timer);
	 */
	"progressAnimate": function( sofar, total ) {
		this.last_far = sofar; this.last_total = total;
		if (this.animating) return;
		this.animating = true;
		$("#progress_inner").animate(
			{ width: ""+(sofar/total*uploadPanel_UI.progressWidth) },
			{   duration: 500,
			step: function () {
			    $("#percentage_num").text(
                    ( parseInt( $(this).css("width") ) / uploadPanel_UI.progressWidth*100 ).toFixed(1)
                );
			},
				complete: function () { uploadPanel_UI.animating = false; }
			}
		);
	},



	/**
	 * 利用UI对象显示一个提示框并退出
	 * @param msgStr 提示信息
	 * @return 无
	 * @exception 若发生任何异常，将使用alert替代
	 */
	"showMsg": function( msgStr ) {
		//
		if ( !window.jQuery ) {
			alert( msgStr+"(无jQuery提示)" );
			return;
		}
		//try {
			this.init();
			this.dispose();
			$("#percentage_num").hide(0);
			$("#progress_bar").hide(0);
			$("#percentage_indicator").hide(0);
			$("#upload_dialog_text").text(msgStr);
			$("#upload_dialog_button").show(0);    // 显示按钮
			this.exit(3000);
		//} catch (e) {
			//alert( msgStr );
			//return;
		//}
	},



	/**
	 * 取消计时器
	 * @param 无
	 * @return 无
	 */
	"timerCancel": function() {
		try { clearInterval(this.timer); }
		catch(e) {}
		this.timer = null;
	},



	/**
	 * 发出操作完成的提示并退出
	 * @param 无
	 * @return 无
	 */
	"finish": function() {
	    this.dispose();
	    this.progressWidth = parseInt($("#progress_bar").css("width"));
	    $("#progress_inner").animate(
			{ width: "" + uploadPanel_UI.progressWidth },
			{   duration: 500,
			    step: function () {
			        var i = parseInt($(this).css("width"), 10);
			        var j = uploadPanel_UI.progressWidth;
			        $("#percentage_num").text(
                        ( i/j ).toFixed(1)
                    );
			    },
			    complete: function () {
			        $("#percentage_num").text("100.0");
			        $("#finish_indicator").show(0);
			        $("#percentage_indicator").hide(0);
			        document.getElementById("upload_dialog_text").innerHTML = "&nbsp; 上传完毕！";
			        uploadPanel_UI.exit(1500);
			    }
			}
		);
	},



	/**
	 * 取消PostBack动作
	 * @param 无
	 * @return 无
	 */
	"serverAbort": function() {
		try {
			var prm = Sys.WebForms.PageRequestManager.getInstance();
			if ( prm.get_isInAsyncPostBack() ) prm.abortPostBack();
		} catch (e) { }
	},


	/**
	 * 清理UI对象的资源
	 * @param 无
	 * @return 无
	 */
	"dispose": function() {
		try { clearInterval(this.timer); } catch(e) {}
		this.timer = null;
		this.failedTimes = 0;
		this.initialized = false;
		this.upload_started = false;
		this.last_far = 0;
		this.last_total = 0;
	},



	/**
	 * 退出UI
	 * @param 无
	 * @return 无
	 */
	"exit": function(time) {
		//this.dispose();
		setTimeout( "$('#upload_dialog').fadeOut(); $('#black_mask').fadeOut();", time );
	},



    /**
	 * 保持显示UI
	 * @param 无
	 * @return 无
	 */
	"keepUI": function (time) {
	    document.getElementById("black_mask").style.display = "block";
	    document.getElementById("upload_dialog").style.display = "block";
	},



	/**
	 * 取消上传操作
	 * @param 无
	 * @return 无
	 */
	"cancel": function() {
		if ( this.initialized ) {
			document.getElementById("upload_dialog_text").innerHTML="&nbsp; 正在取消……";
			this.initialized = false;
			this.serverAbort();
			$("#progress_inner").stop(true);
			$("#progress_inner").animate(
				{ width: "0" },
				{ duration: 2000,
					step: function () { $("#percentage_num").text( (parseInt($(this).css("width"))/uploadPanel_UI.progressWidth*100).toFixed(1) ); },
					complete: function() {
					    document.getElementById("upload_dialog_text").innerHTML = "&nbsp; 已取消";
					    uploadPanel_UI.dispose();
					    uploadPanel_UI.exit(1000);
					}
				}
			); // End Animate
		} //End Initialization Check
	}, // End Method Cancel



	/**
	 * 提示是否取消
	 * @param 无
	 * @return 无
	 */
	"cancelComfirm": function() {
		if( confirm('确实要取消吗？') ) this.cancel();
	}

}; // End UI Object