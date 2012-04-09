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
 * This event is fired each time the user updates the text in the omnibox as long as the extension's keyword mode is still active.
 */
chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
	console.log('inputChanged: ' + text);
	suggest([
		{content: text, description: "Search for " + text + " on Spotify"}
	]);
});

/**
 * This event is fired with the user accepts the input in the omnibox.
 */
chrome.omnibox.onInputEntered.addListener(function(text) {
	console.log('inputEntered: ' + text);
	openSpotifySearchTab(text);
});

/**
 * This even is fires when user clicks on the little Spotify Search button on Chrome interface
 */
chrome.browserAction.onClicked.addListener(function(tab) {
	openSpotifySearchTab();
});