function ajaxCall(url,callback) {
	var xmlhttp=new XMLHttpRequest();
	xmlhttp.onreadystatechange=function() {
		if (xmlhttp.readyState==4) {
			if (xmlhttp.status==200) {
				if (callback) {
					callback(xmlhttp.responseXML,null);
				}
			}else {
				if (callback) {
					callback(null,xmlhttp.status);
				}
			}
		}
	}
	xmlhttp.open("GET",url,true);
	xmlhttp.send();
}

function newElement(tag,name,classes,attrs,contents) {
	var ret=document.createElement(tag);
	ret.className=classes;
	switch ( typeof contents ) {
	case "string":
		ret.innerHTML=contents;
		break;
	case "object"://it must be an array of elements
		for ( var i = 0; i < contents.length; i++ ) {
			ret.appendChild(contents[i]);
		}
		break;
	default:
		console.log("Unknown type of contents passed to newElement: " + typeof contents);
	}
	return ret;
}

function createTree(descriptor) {
	var ret=document.createElement(descriptor.tag);
	ret.id=descriptor.id;
	ret.className=descriptor.className;
	if ( descriptor.attr ) {
		for ( var a in descriptor.attr ) {
			ret.setAttribute( a, descriptor.attr[a] );
		}
	}
	if ( descriptor.contents ) {
		switch (typeof descriptor.contents ) {
			case "string":
				ret.innerHTML=descriptor.contents;
				break;
			case "object":
				ret.appendChild(createTree(descriptor.contents));
				break;
		}
	}
	return ret;
}

/**
 * This method searches for artists and parses the results and puts them in a designated area in the HTML
 */
function searchArtist(query) {
	artistSearchTerm.innerText = query;
	ajaxCall("http://ws.spotify.com/search/1/artist?q=" + query,function (result , err) {
		if (err) {
			console.log("Error happened: "+err);
			return;
		}

		var artists = result.childNodes[0].getElementsByTagName("artist");
		for ( var i = 0; i < artists.length ; i++ ) {
			var header = document.createElement("h3");
			header.className = "title";
			var headerLink = document.createElement("a");
			headerLink.setAttribute( "href", artists[i].getAttribute("href") );
			headerLink.innerHTML = artists[i].getElementsByTagName("name")[0].textContent;
			header.appendChild( headerLink );
			var listItem = document.createElement( "li" );
			listItem.appendChild( header );
			artistResults.appendChild(
				newElement("li",null,null,null,[
					newElement("h3",null,null,"title",[
						newElement("a",null,null,{href:artists[i].getAttribute("href")},
							artists[i].getElementsByTagName("name")[0].textContent
						)
					])
				])
			);
		}
	});
}

/**
 * Read a page's GET URL variables and return them as an associative array
 */
function getUrlVars() {
	if (!this.ret) {
		this.ret = {};
		console.log("window.location.href = '" + window.location.href + "'");
		var queryIndex=window.location.href.indexOf("?");
		if (queryIndex > -1) {
			var hashes = window.location.href.slice(queryIndex + 1).split('&');
			for (var i = 0; i < hashes.length; i++) {
				var hash = unescape(hashes[i]).split("=");
				console.log("Query parameter: '" + hash[0] + "' = '" + hash[1] + "'");
				this.ret[hash[0]] = hash[1];
			}
		} else {
			console.log("No query string in the url");
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
	console.log("searchType = '" + searchType + "' searchTerms = '" + searchTerms + "'");
	switch (searchType.toLowerCase()) {
		case "artist":
			ajaxCall("http://ws.spotify.com/search/1/artist?q=" + searchTerms,function(result,err) {
				if(err) {
					console.log("Error happened: "+err);
				} else {
					console.log("Success: " + result);
					console.log("XML node name: " + result.nodeName);
					console.log("XML children: " + result.childNodes.length);
				}
			});
		break;
		case "album":
			ajaxCall("http://ws.spotify.com/search/1/album?q=" + searchTerms);
		break;
		case "track":
			ajaxCall("http://ws.spotify.com/search/1/track?q=" + searchTerms);
		break;
		default:
			console.log("Search type not understandable: '" + searchType + "'");
			searchArtist(searchTerms);
	}
}

window.onload=function() {
	searchButton.addEventListener("click" , function(e) {
		queryFromSpotify(searchField.value);
	});
	searchField.addEventListener("keypress" , function(e) {
		if (e.which == 13) {
			queryFromSpotify(searchField.value);
		}
	});
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