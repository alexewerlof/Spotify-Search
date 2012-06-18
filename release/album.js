$(document).ready(function() {
	var params = unescape( window.location.search );
	if ( params ) {
		var uri_e = params.match(/(spotify:album:\w+)/);
		if (! uri_e ) {
			console.log( "Can't parse the parameter to get uri" );
			return;
		}
		var uri = uri_e[1];
		ajaxCall("http://ws.spotify.com/lookup/1/.json?uri="+uri,function(output){
			$("#youtube-search-link").attr("href", "http://www.youtube.com/results?search_query="+output.album.name);
			$("#google-search-link").attr("href", "https://www.google.com/search?q="+output.album.name);
		});
		$( "#uri-code-copyable" ).val( uri );

		var digits = uri.match(/spotify:album:(\w+)/);
		if (! digits ) {
			console.log( "Can't extract the digits from uri: " + uri );
			return;
		}
		var http = "http://open.spotify.com/album/" + digits[1];
		$( "#http-code-copyable" ).val( http );
		$( "#open-spotify" ).attr( "src", http );
		
		//<iframe src="https://embed.spotify.com/?uri=spotify:album:49LA20VMk65fQyEaIzYdvf" width="300" height="380" frameborder="0" allowtransparency="true"></iframe>
		var embed = '<iframe src="https://embed.spotify.com/?uri=' + uri + '" width="300" height="380" frameborder="0" allowtransparency="true"></iframe>';
		$( "#embed-code-copyable" ).val( embed );
		//scale the embeded preview from 300x380 that is used by default
		$( "#embed-preview" ).height( ( $( "#embed-preview" ).width() * 1.2 ) + "px");
		$( "#embed-preview" ).attr( "src", "https://embed.spotify.com/?uri=" + uri );
	}
});