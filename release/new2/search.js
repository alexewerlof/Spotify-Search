//** maximum number of items suggested from each category (artists, albums, tracks) for auto-complete
const MAX_ITEMS = 5;
//** returns an array of completions for the txt
function autoComplete ( txt ){
	var ret = new Array();
	var suggestions = $( "#suggestions" );
	ajaxCall( "http://ws.spotify.com/search/1/artist.json?q=" + escape( txt ), function(artistResults) {
		ajaxCall( "http://ws.spotify.com/search/1/album.json?q=" + escape( txt ), function(albumResults) {
			ajaxCall( "http://ws.spotify.com/search/1/track.json?q=" + escape( txt ), function(trackResults) {
				suggestions.empty();
				for ( var i = 0; i < Math.min( MAX_ITEMS, artistResults.info.num_results); i++) {
					suggestions.append( "<li>" + artistResults.artists[i].name + "</li>" );
				}
				for ( var i = 0; i < Math.min( MAX_ITEMS, albumResults.info.num_results); i++) {
					suggestions.append( "<li>" + albumResults.albums[i].name + "</li>" );
				}
				for ( var i = 0; i < Math.min( MAX_ITEMS, trackResults.info.num_results); i++) {
					suggestions.append( "<li>" + trackResults.tracks[i].name + "</li>" );
				}
			}, ret);
		},ret);
	}, ret);
}

$( document ).ready( function() {
	$( "#search-box" ).keyup( function(e) {
		//console.log( String.fromCharCode( e.which ) );
		var txt = $( "#search-box").val();
		if ( txt.length > 0 ) {
			if ( e.which == 13 ) {
				window.location = "results.html?" + escape( txt )
			}
			autoComplete( txt );
		} else{ //there is no string, hence no suggestion
			$( "#suggestions" ).empty();
		}		
	});
});