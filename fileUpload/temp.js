$.ajax(
	{
		url: "/fileUpload.ashx?method=getStat",
		dataType: "json",
		cache: false,
		//context: document.body,
		success: function(data) {
			uploadPanel_UI.progressAnimate(data.total, data.sofar);
		},
	}
).done(function() {
	//$( this ).addClass( "done" );
});

//beforeSend: uploadPanel_UI;

var uploadOptions = {
	url: '/fileUpload.ashx?method=doUpload',
	type: 'POST',
	dataType: 'json',
	//target: '',
	xhr: function(obj) { uploadPanel_UI.ajaxObj = obj; }
	beforeSubmit = function() {
		//
	},
	uploadProgress: function( event, position, total, percentComplete ) {
	},
	success: function(data, textStatus, jqXHR) {
		//
	},
	error: function() {
		//
	}
	//iframeTarget: '#uploadCompatibility',
	resetForm: true,
	clearForm: true
}

$('#fileUpload').submit(function() { 
    $(this).ajaxSubmit();
    return false;
});