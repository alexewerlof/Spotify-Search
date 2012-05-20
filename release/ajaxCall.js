//this centrally manages all ajax calls
function ajaxCall( url, callback, thisRef ) {
	function errorCallback(jqXHR, textStatus, errorThrown){
		console.log( "Ajax call failed: " + url);
	}
	function successCallback(data, textStatus, jqXHR){
		if ( callback ) {
			callback( data, thisRef );
		}
	}
	$.ajax({
		type: "GET",
		url: url,
		cache: true,
		dataType: "json",
		success: successCallback,
		error: errorCallback
	});
}