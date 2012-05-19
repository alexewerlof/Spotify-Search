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
		for ( var i = 0; i < Math.min( MAX_OMNIBOX_SUGGESTIONS, trackResults.info.num_results); i++) {
			ret.push({
				content: trackResults.tracks[i].name,
				description: trackResults.tracks[i].name + " <dim>(press enter to see more)</dim>"
			});
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