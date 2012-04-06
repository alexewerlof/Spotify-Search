/**
 * This event is fired each time the user updates the text in the omnibox as long as the extension's keyword mode is still active.
 */
chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
	console.log('inputChanged: ' + text);
	suggest([
		{content: "Artist:" + text, description: "Search Spotify Artists"},
		{content: "Album:"  + text, description: "Search Spotify Albums"},
		{content: "Track:"  + text, description: "Search Spotify Tracks"}
	]);
});

/**
 * This event is fired with the user accepts the input in the omnibox.
 */
chrome.omnibox.onInputEntered.addListener(function(text) {
	console.log('inputEntered: ' + text);
	var colon=text.indexOf(":");
	if(colon!=-1){
		var searchType=text.substr(0,colon);
		var searchTerms=text.substr(colon + 1);
		console.log("Specific search. Type: " + searchType + ", Terms: " + searchTerms);
		switch(searchType.toLowerCase()) {
			case "artist":
				chrome.tabs.create({
					"url":"http://ws.spotify.com/search/1/artist?q="+searchTerms
				});
			break;
			case "album":
				chrome.tabs.create({
					"url":"http://ws.spotify.com/search/1/album?q="+searchTerms
				});
			break;
			case "track":
				chrome.tabs.create({
					"url":"http://ws.spotify.com/search/1/track?q="+searchTerms
				});
			break;
			default:
				console.log("Search type not understandable: " + searchType);
		}
	}
	//http://ws.spotify.com/search/1/artist
	//http://ws.spotify.com/search/1/album
	//http://ws.spotify.com/search/1/track
});
