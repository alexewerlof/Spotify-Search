$(document).ready(function() {
	var params = unescape( window.location.search );
	if ( params ) {
		var uri_e = params.match(/(spotify:artist:\w+)/);
		if (! uri_e ) {
			console.log( "Can't parse the parameter to get uri" );
			return;
		}
		var uri = uri_e[1];
		ajaxCall("http://ws.spotify.com/lookup/1/.json?uri="+uri,function(output){
			$("#youtube-search-link").attr("href", "http://www.youtube.com/results?search_query="+output.artist.name);
			$("#google-search-link").attr("href", "https://www.google.com/search?q="+output.artist.name);
		});
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