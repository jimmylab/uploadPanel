/**
 * uploadPanel UI界面对象
 * @release:  Nov 24, 2013
 * @license: GPL, LGPL
 * 
 * @version 3.0.2
 * @author Jimmy Liu
 * 
 * @TODO: 引用目录改为相对于项目根目录而不是站点根目录
 * @TODO: 改成function型的模拟class，并使用prototype链继承
 * @TODO: 允许移动
 * @TODO: 检查可能导致在低版本IE中内存泄露的问题
 */
window.uploadPanel_UI = {
	// UI定时器
	"timer": null,
	
	// UI是否已经打开
	"initialized": false,

	// 是否正在上传
	"uploading": false,

	// jQuery Ajax 对象
	"ajaxObj": null,

	// jQuery.form 选项数组
	"uploadOptions": null,

	// 文件检查回调API，由用户定义，若返回false则提交被取消
	"fileCheck": null,




	"setMsg": function(caption) {
		var Changer = document.getElementById("upload_dialog_title").innerHTML;
		Changer( (!caption) ? '' : caption );
	},

	"setTitle": function(caption) {
		var Changer = document.getElementById("upload_dialog_text").innerHTML;
		Changer( (!caption) ? '文件上传' : caption );
	},






	/**
	 * UI初始化方法
	 * @param 无
	 * @return 无
	 * @exception this.jQueryErr()
	 */
	"init": function() {
		if ( jQueryErr() ) return;
		$("#black_mask").fadeTo(800,0.5);    // 显示黑幕
		$("#upload_dialog").fadeIn(750);    // 显示对话框
		button.show("取消");
		progressBar.init("&nbsp; 正在上传，请稍候……");
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
	"prepare": function() {
		var base = window.uploadPanel_UI;
		this.uploadOptions = {
			url: '/fileUpload.ashx?method=doUpload',
			type: 'POST',
			dataType: 'json',
			//target: '',
			xhr: function(obj) { base.ajaxObj = obj; }
			beforeSubmit: function() {
				if ( base.fileCheck ) {
					if ( base.fileCheck() ) { return false; }
				}
				base.init();
			},
			uploadProgress: function( event, position, total, percentComplete ) {
				// For debug only in this version.
			},
			success: function(data, textStatus, jqXHR) {
				base.timerCancel();
				if ( data.statues == "success" ) {
					finish();
				} else {
					showMsg(data.msg);
				}
			},
			error: function() {
				//
			},
			//iframeTarget: '#uploadCompatibility',
			resetForm: true
		}
	},



	/**
	 * 进度开始
	 * @param 无
	 * @return 无
	 */
	"begin": function() {
	},




	/**
	 * 轮询当前上传进度
	 * @param 无
	 * @return 无
	 */
	"polling": function() {
	},




	/**
	 * 利用UI对象显示一个提示框并退出
	 * @param msgStr 提示信息
	 * @param title 提示框标题
	 * @return 无
	 */
	"showMsg": function( msgStr, title ) {
		this.progressBar.stop().hide();
		this.setMsg(msgStr);
		title = title ? title : '发生错误';
		this.setTitle(title);
		this.button.show();
		this.exit(3000);
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
		this.timerCancel();
		this.progressBar.finish();
	},




	/**
	 * 取消PostBack动作
	 * @param 无
	 * @return 无
	 */
	"serverAbort": function() {
		try {
		} catch (e) { }
	},




	/**
	 * 清理UI对象的资源
	 * @param 无
	 * @return 无
	 */
	"clean": function() {
		try { clearInterval(this.timer); } catch(e) {}
		this.timer = null;
		this.failedTimes = 0;
		this.initialized = false;
		this.upload_started = false;
	},




	/**
	 * 退出UI
	 * @param 无
	 * @return 无
	 */
	"exit": function(time) {
		this.clean();
		setTimeout( "$('#upload_dialog').fadeOut(); $('#black_mask').fadeOut();", time );
	},




	/**
	 * 取消上传操作
	 * @param 无
	 * @return 无
	 */
	"cancel": function() {
		if( !confirm('确实要取消吗？') ) return;
		if ( this.uploading ) {
			this.uploading = false;
			this.serverAbort();
			this.progressBar.stop("&nbsp; 正在取消……").rollBack("&nbsp; 取消成功！");
		}
	},







	// UI之按钮对象
	"button": {
		"disabled": false;


		"hide": function() {
			document.getElementById("upload_dialog_button").style.display = "none";
		},

		"show": function(caption) {
			document.getElementById("upload_dialog_button").style.display = "block";
			caption = (!caption) ? "确定" : caption;
			document.getElementById("upload_dialog_button").innerHTML = caption;
		},

		"enable": function() {
			document.getElementById("upload_dialog_button").className = "upload_dialog_button";
			this.disabled = false;
		}

		"disable": function() {
			if ( !this.disabled )
				document.getElementById("upload_dialog_button").className += " upload_dialog_button_disabled";
			this.disabled = true;
		},

	},






	/**
	 * UI之进度条对象
	 */
	"progressBar": {
		// 总进度宽度
		"fullWidth": 300,
		// 改变进度数字的方法（DOM对象的innerHTML方法）
		"numberChange": null,
		// 改变状态提示的方法



		"init": function() {
			this.numberChange = document.getElementById("percentage_num").innerHTML;
			$("#progress_bar").show(0); // 显示进度条
			$("#progress_inner").css("width", "0px");     // 进度条置零
			$("#percentage_indicator").show(0);    // 显示进度提示
			$("#percentage_num").text("0.0");     // 将其中数字置零
			$("#finish_indicator").hide(0);    // 隐藏完成提示符
		},


		
		/**
		 * 以动画形式更新百分比
		 * @param progress 进度，值域[0,1]
		 * @param time 时间，默认500ms
		 * @param callback 回调函数
		 * @return 无
		 */
		"animate": function( progress, time, callback ) {
			var changeNum = this.numberChange;
			time = (!time) ? 500 : time;
			var fullWidth = this.fullWidth;
			$("#progress_inner").animate(
				{ width: ""+Math.round(progress*fullWidth) },
				{   duration: time,
					progress: function(animation, progress, remainingMs) { changeNum( (progress*100).toFixed(1) ); },
					complete: callback;
				}
			);
		},



		"finish": function() {
			this.animate(100/100, 100, function() {
				$("#percentage_num").text("100.0");
				$("#finish_indicator").show(0);
				$("#percentage_indicator").hide(0);
			});
		},

		"stop": function() {
			$("#progress_inner").stop(true);
			return this;
		},

		"rollBack": function(callback) {
			this.animate( 0, 2000, callback );
		},

		"hide": function() {
			this.stop();
			$("#progress_bar").hide(0);
			$("#percentage_indicator").hide(0);
			$("#finish_indicator").show(0);    // 隐藏完成提示符
		}
	},


}; // End UI Object