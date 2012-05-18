function ajaxCall( url, callback, thisRef ) {
	function errorCallback(jqXHR, textStatus, errorThrown){
		console.log( "Ajax call failed: " + url);
	}
	function successCallback(data, textStatus, jqXHR){
		if ( callback ) {
			callback( data, thisRef );
		}
	}
	$.ajax({
		type: "GET",
		url: url,
		dataType: "json",
		success: successCallback,
		error: errorCallback
	});
}

/**
 * Every latManager, manages a lat.
 * It will take care of automatically making the Ajax calls for paging
 * @param latId can be one of these three strings: "artists", "albums" or "tracks"
 */
latManager = function ( latId, searchUrl ) {
	this.latId = latId;
	this.searchUrl = searchUrl;
	this.lookupUrl = "http://ws.spotify.com/lookup/1/.json";

	this.currentPage = 1;
	this.maxPages = 0;
	this.lastSearchQuery = null;
	this.ajaxCallPending = false;
	
	this.$title = $( "#" + this.latId + "-title" );
	this.$contents = $( "#" + this.latId + "-contents" );
	this.$resultList = $( "#" + this.latId + "-result-list" );

	this.search = function ( query ) {
		this.currentPage = 1;
		//this.maxPages will be set by the function
		this.lastSearchQuery = query;
		this.$resultList.empty();
		this.$title.setTextAndTooltip( "Searching '" + this.lastSearchQuery + "'..." );
		this.ajaxCallPending = true;//this flag should be set to false in the callback
		ajaxCall( this.searchUrl + "?q=" + escape(this.lastSearchQuery) + "&page=" + this.currentPage, this.searchCallback, this);
	}

	this.$contents.scroll( (function(latMan){
		return function (e) {
			//if it is the end of the scroll
			if ( $(this).prop( "offsetHeight" ) + $(this).prop( "scrollTop" ) >= $(this).prop( "scrollHeight" ) ) {
				//this lat is not being used for searching (it's a lookup probably or just empty) or already waiting for some results
				if ( latMan.lastSearchQuery == null || latMan.ajaxCallPending ) {
					return;
				}
				if ( latMan.currentPage + 1 <= latMan.maxPages ) {
					latMan.currentPage++;
					latMan.$resultList.append( '<li class="loading"><div class="line1"><img src="waiting.gif" />Loading page ' + latMan.currentPage + '</div></li>' );
					ajaxCall( latMan.searchUrl + "?q=" + escape(latMan.lastSearchQuery) + "&page=" + latMan.currentPage, latMan.searchCallback, latMan );
				}
			}
		};
	})(this));
	
	this.searchCallback = function ( results, latMan ) {
		latMan.ajaxCallPending = false;
		latMan.$resultList.children( "li.loading" ).remove();
		latMan.maxPages = Math.ceil( results.info.num_results / results.info.limit );
		latMan.$title.setTextAndTooltip( results.info.num_results + " " + latMan.latId + " for '" + latMan.lastSearchQuery + "'" );
		var items = results[latMan.latId];
		for ( var i = 0; i < items.length; i++ ) {
			// create the list item and the two lines in it
			var li = $( '<li></li>' );
			var line1 = $( '<div class="line1"></div>' );
			var line2 = $( '<div class="line2"></div>' );
			//process the results based on the type
			var item = items[i];
			var name = $( '<a class="main-item" href="javascript:void(0)" title="Lookup the album and artist(s) for this track">' + item.name + '</a>' );
			name.click(function() {
				latMan.lookup( item.href );
			});
			line1.append( name );
			if ( item.album ) {
				line1.append( '<br/><div class="icon album" title="Album"></div>' );
				var album = $( '<a href="javascript:void(0)" title="Lookup artist(s) and tracks from this album">' + item.album.name + '</a>' );
				album.click(function() {
					latMan.lookup( item.album.href );
				});
				line1.append( album );
			}
			if ( item.artists ) {
				line1.append( '<br/><div class="icon artist" title="Artist"></div>' );
				for ( var a = 0; a < item.artists.length; a++ ) {
					var artist = $( '<a href="javascript:void(0)" title="Lookup all albums and tracks from artist">' + item.artists[a].name + '</a>' );
					console.log( item.artists[a].href );
					artist.click( (function(a) {
						return function(){
							latMan.lookup( item.artists[a].href );
						}
					})(a));
					line1.append( artist );
				}				
			}
			line2.append( '<div class="stars p' + Math.floor( ( parseFloat( item.popularity ) || 0 ) * 10 ) + '" title="Popularity"></div>' +
						  '<div class="icon links" title="See links (URI, HTTP, Embed code)"></div>' +
						  '<div class="icon share" title="Share item"></div>' +
						  '<div class="icon in-spotify" title="See item in Spotify application"></div>' );
			//append the list item to the result list
			latMan.$resultList.append( li.append( line1, line2 ) );
		}
	}
	
	this.lookup = function ( uri ) {
		this.currentPage = 1;
		this.lastSearchQuery = null;
		artistManager.$resultList.empty();
		albumManager .$resultList.empty();
		trackManager .$resultList.empty();
		artistManager.$title.setTextAndTooltip( "Looking up " + latId + "..." );
		albumManager.$title.setTextAndTooltip ( "Looking up " + latId + "..." );
		trackManager.$title.setTextAndTooltip ( "Looking up " + latId + "..." );
		this.ajaxCallPending = true;//this flag should be set to false in the callback
		ajaxCall( this.lookupUrl + "?uri=" + uri, this.lookupCallback, this);
	}
	
	this.lookupCallback = function ( results, latMan ) {
		latMan.ajaxCallPending = false;
		alert("yo:" +results );
	}
}

var artistManager = new latManager( "artists", "http://ws.spotify.com/search/1/artist.json" );
var albumManager = new latManager( "albums", "http://ws.spotify.com/search/1/album.json" );
var trackManager = new latManager( "tracks", "http://ws.spotify.com/search/1/track.json" );
	
$( document ).ready( function() {
	var artistManager = new latManager( "artists", "http://ws.spotify.com/search/1/artist" );
	var albumManager = new latManager( "albums", "http://ws.spotify.com/search/1/album" );
	var trackManager = new latManager( "tracks", "http://ws.spotify.com/search/1/track" );

	artistManager.search( "jackson" );
	albumManager.search( "jackson" );
	trackManager.search( "jackson" );
});