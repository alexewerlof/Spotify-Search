//this centrally manages all ajax calls
function ajaxCall( url, callback, dataVar ) {
	function errorCallback(jqXHR, textStatus, errorThrown){
		console.log( "Ajax call failed: " + url);
	}
	function successCallback(data, textStatus, jqXHR){
		if ( callback ) {
			callback( data, dataVar );
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

/**
 * This function replaces XML character entities. '&', '<' and '>' with '&amp;', '&lt;' and '&gt;' respectively.
 * It is particularly useful for the XML format in Chrome's Omnibox
 */
function sanitize ( str ) {
	if ( !str ) {
		return str;
	}
	return str.replace( '&', '&amp;' ).replace( '<', '&lt;').replace( '>', '&gt;');
}