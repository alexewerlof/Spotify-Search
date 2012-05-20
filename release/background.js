//{{OPTIONS:
//**maximum number of suggestions that omnibox will show
const MAX_OMNIBOX_SUGGESTIONS = 5;
//}}OPTIONS
/**
 * Opens a new tab optionally showing the result of a query
 */
function openSpotifySearchTab(query) {
	var url="index.html";
	if (query) {
		url+="?userString="+escape(query);
	}
	chrome.tabs.create({
		"url":url
	});
}

/**
 * This event is fired with the user accepts the input in the omnibox.
 */
chrome.omnibox.onInputEntered.addListener(function(text) {
	chrome.tabs.create({
		"url":"results.html?" + escape( text )
	});
});

/**
 * This even is fired everytime the search string changes
 */
chrome.omnibox.onInputChanged.addListener( function( txt, suggestFn) {
	//we only use tracks to guess what the user has typed. It's faster and less likely to cause a problem when the user types too fast
	ajaxCall( "http://ws.spotify.com/search/1/track.json?q=" + escape( txt ), function(trackResults) {
		var ret = new Array();
		if ( trackResults.tracks && trackResults.info.num_results) {
			for ( var t = 0; ( t < trackResults.info.num_results ) && ( ret.length < MAX_OMNIBOX_SUGGESTIONS ); t++ ) {
				var track = trackResults.tracks[t];
				if ( !track.name ){
					console.log( "Track doesn't have a name!" );
					continue;
				}
				if ( ! /[\w\s]/.test(track.name) ) {
					console.log( "Track contains non-alphanumerical characters" );
					continue;
				}
				//if a another track with the same title exists, don't repeat it in the suggestion list
				var repeated = false;
				for (var r = 0; r < ret.length; r++) {
					if ( ret[r].content == track.name ) {
						repeated = true;
					}
				}
				if ( repeated ) {
					continue;
				}
				//get the list of artists for this track
				var artists = "by ";
				if ( track.artists ) {
					for ( var j = 0; j < track.artists.length; j++ ){
						if ( !track.artists[j].name ) {//if there is no name for this artist, skip it
							continue;
						}
						if ( ! /[\w\s]/.test( track.artists[j].name ) ) {//if the name contains invalid characters, skip it
							continue;
						}
						artists += track.artists[j].name;
						if ( j < track.artists.length - 1 ){
							artists += " ";
						}
					}
				}
				ret.push({
					content: track.name,
					description: sanitize( track.name ) + " <dim>" + sanitize( artists ) + "</dim>"
				});
			}
		} else {
			console.log( "Could not read one or more of the essential loop arguments: trackResults.info.num_results is not defined or is 0 or trackResults.tracks is not defined" );
		}
		suggestFn( ret );
	});
});

/**
 * This even is fires when user clicks on the little Spotify Search button on Chrome interface
 */
chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.create({
		"url":"results.html"
	});
});

/**
 * This sets up the "Search Spotify" context menu
 */
chrome.contextMenus.create(
	{
		contexts: [ "selection" ],
		type: "normal",
		title: "Search Spotify",
		onclick: function ( info, tab ){
			if ( info.selectionText ) {
				chrome.tabs.create({
					"url":"results.html?" + escape( info.selectionText )
				});
			} else {
				alert( "Please select a text to search" );
			}
		}
	},function(){ if ( chrome.extension.lastError ) alert( "Could not create Spotify Search context menu: " + chrome.extension.lastError ) }
);