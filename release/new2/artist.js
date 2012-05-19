$(document).ready(function() {
	var params = unescape( window.location.search );
	if ( params ) {
		var uri_e = params.match(/(spotify:artist:\w+)/);
		if (! uri_e ) {
			console.log( "Can't parse the parameter to get uri" );
			return;
		}
		var uri = uri_e[1];
		$( "#uri-code-copyable" ).val( uri );

		var digits = uri.match(/spotify:artist:(\w+)/);
		if (! digits ) {
			console.log( "Can't extract the digits from uri: " + uri );
			return;
		}
		var http = "http://open.spotify.com/artist/" + digits[1];
		$( "#http-code-copyable" ).val( http );
		$( "#open-spotify" ).attr( "src", http );
	}
});