/* IE fix for Fade In */
$.fn.fade_in = function( speed, callback ) {
	return this.each( function(e) {
		$(this).fadeIn( speed, function(e) {
			/msie/.test(navigator.userAgent.toLowerCase()) ? $(this).get(0).style.removeAttribute('filter') : '';
			(typeof(eval(callback)) == 'function') ? eval(callback)() : '';
		});
	});
}

/* IE fix for Fade Out */
$.fn.fade_out = function( speed, callback ) {
	return this.each( function(e) {
		$(this).fadeOut( speed, function(e) {
			/msie/.test(navigator.userAgent.toLowerCase()) ? $(this).get(0).style.removeAttribute('filter') : '';
			(typeof(eval(callback)) == 'function') ? eval(callback)() : '';
		});
	});
}


/* IE fix for Fade To */
$.fn.fade_to = function( opacity, speed, callback ) {
	return this.each( function(e) {
		$(this).fadeTo( opacity, speed, function(e) {
			/msie/.test(navigator.userAgent.toLowerCase()) ? $(this).get(0).style.removeAttribute('filter') : '';
			(typeof(eval(callback)) == 'function') ? eval(callback)() : '';
		});
	});
}