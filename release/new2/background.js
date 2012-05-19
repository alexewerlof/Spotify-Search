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
	ajaxCall( "http://ws.spotify.com/search/1/artist.json?q=" + escape( txt ), function(artistResults) {
		ajaxCall( "http://ws.spotify.com/search/1/album.json?q=" + escape( txt ), function(albumResults) {
			ajaxCall( "http://ws.spotify.com/search/1/track.json?q=" + escape( txt ), function(trackResults) {
				var ret = new Array();
				//maximum 1 artist is enough
				for ( var i = 0; i < Math.min( 1, artistResults.info.num_results); i++) {
					ret.push({
						content: artistResults.artists[i].name,
						description: artistResults.artists[i].name + " <dim>(artist)</dim>"
					});
				}
				//up to two albums
				for ( var i = 0; i < Math.min( 2, albumResults.info.num_results); i++) {
					ret.push({
						content: albumResults.albums[i].name,
						description: albumResults.albums[i].name + " <dim>(album)</dim>"
					});
				}
				//and the rest of the quota can go to tracks. Currently Chrome shows up to 5 suggestions, that's why.
				for ( var i = 0; i < Math.min( 5 - ret.length, trackResults.info.num_results); i++) {
					ret.push({
						content: trackResults.tracks[i].name,
						description: trackResults.tracks[i].name + " <dim>(track)</dim>"
					});
				}
				suggestFn( ret );
			});
		});
	});
});

/**
 * This even is fires when user clicks on the little Spotify Search button on Chrome interface
 */
chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.create({
		"url":"search.html"
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