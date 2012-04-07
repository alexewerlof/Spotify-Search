function ajaxCall(url,callback) {
	var xmlhttp=new XMLHttpRequest();
	xmlhttp.onreadystatechange=function() {
		if (xmlhttp.readyState==4 && xmlhttp.status==200) {
			if (callback) {
				callback(xmlhttp.responseText,null);
			}
		} else {
			if (callback) {
				callback(null,xmlhttp.status);
			}
		}
	}
	xmlhttp.open("GET",url,true);
	xmlhttp.send();
}

/**
 * Read a page's GET URL variables and return them as an associative array
 */
function getUrlVars() {
	if (!this.ret) {
		this.ret = {};
		console.log("window.location.href = '" + window.location.href + "'");
		var queryIndex=window.location.href.indexOf("?");
		console.log("No query string in the url");
		if (queryIndex > -1) {
			var hashes = window.location.href.slice(queryIndex + 1).split('&');
			for (var i = 0; i < hashes.length; i++) {
				var hash = hashes[i].split("=");
				console.log("Query parameter: '" + hash[0] + "' = '" + hash[1] + "'");
				this.ret[hash[0]] = hash[1];
			}
		}
	}
    return this.ret;
}

/**
 * Detects the type of a query and fetches the result
 */
function queryFromSpotify(query) {
	var colon=query.indexOf(":");
	var searchType=query.substr(0,colon);
	var searchTerms=query.substr(colon + 1);
	searchTerms=unescape(searchTerms);
	console.log("searchType = '" + searchType + "' searchTerms = '" + searchTerms + "'");
	switch (searchType.toLowerCase()) {
		case "artist":
			ajaxCall("http://ws.spotify.com/search/1/artist?q=" + searchTerms);
		break;
		case "album":
			ajaxCall("http://ws.spotify.com/search/1/album?q=" + searchTerms);
		break;
		case "track":
			ajaxCall("http://ws.spotify.com/search/1/track?q=" + searchTerms);
		break;
		default:
			console.log("Search type not understandable: '" + searchType + "'");
	}
}

window.onload=function() {
	//window.location
	//a.push(20);
	var urlVars=new getUrlVars();
	if (urlVars["userString"]) {
		console.log("There is a userString: '" + urlVars["userString"] + "'");
		queryFromSpotify(urlVars["userString"]);
	} else {
		console.log("There is no userString");
	}
}