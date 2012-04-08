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

/**
 * This is a simple utility function that takes a number of seconds as input and gives a string that contains the number of
 * minutes and seconds in MM:SS format
 */
function formatTime(sec){
	sec=parseInt(sec);
	if( typeof sec != "number" ) {
		//invalid number format
		return "N/A";
	} else {
		var s=sec % 60;
		var m=Math.floor(sec / 60);
		return m + ":" + s + "s";
	}
}

/**
 * Creates the class name for a popularity number
 */
function getPupularityClass(popularity) {
	var p=parseFloat(popularity);
	if ( typeof p != "number" ) {
		return "";
	} else {
		return "popularity popularity-" + Math.floor(p*12);
	}
}

/**
 * A utility function that creates a HTML DOM based on the descriptor.
 * The descriptor is an object that has the following members:
 * tag: (mandatory) string, the name of the HTML tag to be created. Example: "li" for creating a <li> element
 * id: (optional) string, the id that will be assigned to the element's id attribute. Example: "searchButton"
 * className: (optional) string, the name(s) that will be assigned to the element's className. If there are multiple classes, they should be separated by space. Example: "artist popularity"
 * attr: (optional) object, all the key-value pairs of this object will be added as attributes to the created element. Example: {href:"#",name:"badLink"} in an <a> element will be <a href="#" name:"badLink"></a>
 * contents: (optional) string, object or an array of objects. If it's string, it will go directly to the element text. If it is an object, it will be treated as a descriptor itself and passed to this function recursively. If it is an array, it will be supposed to be an array of descriptors
 * @return a DOM structure that can be used with appendChild() function to insert
 */
function createTree(descriptor) {
	var ret=document.createElement(descriptor.tag);
	if ( descriptor.id ) {
		ret.id=descriptor.id;
	}
	if ( descriptor.className ) {
		ret.className=descriptor.className;
	}
	if ( descriptor.attr ) {
		for ( var a in descriptor.attr ) {
			ret.setAttribute( a, descriptor.attr[a] );
		}
	}
	if ( descriptor.contents ) {
		switch (typeof descriptor.contents ) {
			case "string":
				//it is simply a string
				ret.innerHTML = descriptor.contents;
				break;
			case "object":
				if ( Array.isArray( descriptor.contents ) ) {
					//it is an array of objects
					for( var i = 0; i < descriptor.contents.length; i++ ) {
						if ( typeof descriptor.contents[i] == "string" ) {
							//it is a string
							ret.appendChild( document.createTextNode( descriptor.contents[i] ) );
						} else {
							//it is a node descriptor object (can't be an array)
							ret.appendChild( createTree( descriptor.contents[i] ) );
						}
					}
				} else {
					//it is an object
					ret.appendChild( createTree( descriptor.contents ) );
				}
				break;
		}
	}
	return ret;
}

/**
 * This method searches for artists and parses the results and puts them in a designated area in the HTML
 */
function searchArtist(query) {
	if ( !query ) {
		return;
	}
	artistSearchTerm.innerText = query;
	ajaxCall( "http://ws.spotify.com/search/1/artist?q=" + escape(query),function ( result, err ) {
		if (err) {
			console.log( "Error happened while searching for artist: "+err );
			return;
		}

		var artists = result.childNodes[0].getElementsByTagName("artist");
		artistResults.innerHTML="";
		artistPanel.className="";//show it
		for ( var i = 0; i < artists.length ; i++ ) {
			artistResults.appendChild(
				createTree({
					tag:"li",
					contents:[
						{
							tag:"h3",
							className:"title",
							contents:{
								tag:"a",
								attr:{
									href:artists[i].getAttribute("href"),
										title:"Show artist in spotify"
								},
								contents:artists[i].getElementsByTagName("name")[0].textContent
							}
						},
						{
							tag:"div",
							className:"link",
							contents:artists[i].getAttribute("href")
						},
						{
							tag:"div",
							className:"details",
							contents:[
								"Popularity: ",
								{
									 tag:"div",
									 className:getPupularityClass(artists[i].getElementsByTagName("popularity")[0].textContent)
								}
							]
						}
					]
				})
			);
		}
	});
}


/**
 * This method searches for album and parses the results and puts them in a designated area in the HTML
 */
function searchAlbum(query) {
	if ( !query ) {
		return;
	}
	albumSearchTerm.innerText = query;
	ajaxCall( "http://ws.spotify.com/search/1/album?q=" + escape(query),function ( result, err ) {
		if (err) {
			console.log( "Error happened while searching for album: "+err );
			return;
		}

		var albums = result.childNodes[0].getElementsByTagName("album");
		albumResults.innerHTML="";
		albumPanel.className="";//show it
		for ( var i = 0; i < albums.length ; i++ ) {
			albumResults.appendChild(
				createTree({
					tag:"li",
					contents:[
						{
							tag:"h3",
							className:"title",
							contents:[
								{
									tag:"a",
									attr:{
										href:albums[i].getAttribute("href"),
										title:"Show album in spotify"
									},
									contents:albums[i].getElementsByTagName("name")[0].textContent
								},
								" by ",
								{
									tag:"a",
									attr:{
										href:albums[i].getElementsByTagName("artist")[0].getAttribute("href"),
										title:"Show artist in spotify"
									},
									contents:albums[i].getElementsByTagName("artist")[0].getElementsByTagName("name")[0].textContent
								}
							]
						},
						{
							tag:"div",
							className:"link",
							contents:albums[i].getAttribute("href")
						},
						{
							tag:"div",
							className:"details",
							contents:[
								"Popularity: ",
								{
									 tag:"div",
									 className:getPupularityClass(albums[i].getElementsByTagName("popularity")[0].textContent)
								}
							]
						}
					]
				})
			);
		}
	});
}

/**
 * This method searches for tracks and parses the results and puts them in a designated area in the HTML
 */
function searchTrack(query) {
	if ( !query ) {
		return;
	}
	trackSearchTerm.innerText = query;
	ajaxCall( "http://ws.spotify.com/search/1/track?q=" + escape(query),function ( result, err ) {
		if (err) {
			console.log( "Error happened while searching for track: "+err );
			return;
		}

		var tracks = result.childNodes[0].getElementsByTagName("track");
		trackResults.innerHTML="";
		trackPanel.className="";//show it
		for ( var i = 0; i < tracks.length ; i++ ) {
			trackResults.appendChild(
				createTree({
					tag:"li",
					contents:[
						{
							tag:"h3",
							className:"title",
							contents:[
								{
									tag:"a",
									attr:{
										href:tracks[i].getAttribute("href"),
										title:"Play track in spotify"
									},
									contents:tracks[i].getElementsByTagName("name")[0].textContent
								},
								/* uncomment this part to show track number too
								{
									tag:"span",
									className:"trackNumber",
									attr:{
										title:"Track number " + tracks[i].getElementsByTagName("track-number")[0].textContent
									},
									contents:tracks[i].getElementsByTagName("track-number")[0].textContent
								},
								*/
								" from ",
								{
									tag:"a",
									attr:{
										href:tracks[i].getElementsByTagName("album")[0].getAttribute("href"),
										title:"Show album in spotify"
									},
									contents:tracks[i].getElementsByTagName("album")[0].getElementsByTagName("name")[0].textContent									    
								},
								" by ",
								{
									tag:"a",
									attr:{
										href:tracks[i].getElementsByTagName("artist")[0].getAttribute("href"),
										title:"Show artist in spotify"
									},
									contents:tracks[i].getElementsByTagName("artist")[0].getElementsByTagName("name")[0].textContent
								}
							]
						},
						{
							tag:"div",
							className:"link",
							contents:tracks[i].getAttribute("href")
						},
						{
							tag:"div",
							className:"details",
							contents:[
								"Popularity: ",
								{
									 tag:"div",
									 className:getPupularityClass(tracks[i].getElementsByTagName("popularity")[0].textContent)
								},
						         ", Length: "+formatTime(tracks[i].getElementsByTagName("length")[0].textContent)
							]
						}
					]
				})
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
			searchAlbum(searchTerms);
			searchTrack(searchTerms);
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