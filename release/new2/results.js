/**
 * Every latManager, manages a lat.
 * It will take care of automatically making the Ajax calls for paging
 * @param latId can be one of these three strings: "artists", "albums" or "tracks"
 */
latManager = function ( latId, searchUrl ) {
	this.latId = latId;
	this.$title = $( "#" + this.latId + "-title" );
	this.$contents = $( "#" + this.latId + "-contents" );
	this.$resultList = $( "#" + this.latId + "-result-list" );

	this.searchUrl = searchUrl;
	
	this.lastSearchQuery = null;
	this.currentPage = 0;
	this.maxPages = 0;
	this.ajaxCallPending = false;
	

	//** this function is externally used to search for an item
	this.search = function ( query ) {
		this.currentPage = 1;
		//this.maxPages will be set by the function
		this.lastSearchQuery = query;
		this.$resultList.empty();
		this.$title.setTextAndTooltip( "Searching '" + this.lastSearchQuery + "'..." );
		this.ajaxCallPending = true;//this flag should be set to false in the callback
		this.$resultList.append( '<li class="loading"><div class="line1"><img src="waiting.gif" />Loading page ' + this.currentPage + '</div></li>' );
		ajaxCall( this.searchUrl + "?q=" + escape(this.lastSearchQuery) + "&page=" + this.currentPage, this.searchCallback, this);
	}

	//**this is called when the results come back from ajax call
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
			//process artist, album, track (the main items in the result)
			//TODO: instead of lookup.html, we should use artist.html, album.html or track.html
			var name = $( '<a class="main-item" href="lookup.html?uri=' + item.href + '">' + item.name + '</a>' );
			line1.append( name );
			//additional info: process albums in the results (it exists for queries for tracks)
			if ( item.album ) {
				line1.append( '<br/><div class="icon album" title="Album"></div><a href="album.html?uri=' + item.album.href + '">' + item.album.name + '</a>' );
			}
			//additional info: process artists in the result (it exists for queries for tracks and albums)
			if ( item.artists ) {
				line1.append( '<br/><div class="icon artist" title="Artist(s)"></div>' );
				for ( var a = 0; a < item.artists.length; a++ ) {
					var artist = $( '<a href="artist.html?uri=' + item.artists[a].href + '">' + item.artists[a].name + '</a>' );
					line1.append( artist );
					//add a comma between artist names if necessary
					if ( a < item.artists.length -1 ) {
						line1.append( ", " );
					}
				}
			}
			line2.append( '<div class="stars p' + Math.floor( ( parseFloat( item.popularity ) || 0 ) * 10 ) + '" title="Popularity"></div>' +
						  '<div class="icon links" title="See links (URI, HTTP, Embed code)"></div>' +
						  '<div class="icon share" title="Share item"></div>' +
						  '<div class="icon in-spotify" title="See item in Spotify application"></div>' );
			//append the list item to the result list
			li.append( line1, line2 );
			latMan.$resultList.append( li )
		}
	}

	//**takes care of when the user reachs the end of scrollbar and more items are remaining to be loaded
	this.$contents.scroll( (function(latMan){
		return function (e) {
			//if it is the end of the scroll
			if ( $(this).prop( "offsetHeight" ) + $(this).prop( "scrollTop" ) >= $(this).prop( "scrollHeight" ) ) {
				//this is already waiting for some results
				if ( this.lastSearchQuery == null || latMan.ajaxCallPending ) {
					return;
				}
				if ( latMan.currentPage + 1 <= latMan.maxPages ) {
					latMan.currentPage++;
					ajaxCall( latMan.searchUrl + "?q=" + escape(latMan.lastSearchQuery) + "&page=" + latMan.currentPage, latMan.searchCallback, latMan );
				}
			}
		};
	})(this));	
}

var artistManager;
var albumManager;
var trackManager;

/**
 * Search for artists, albums and tracks
 */
function searchAll( query ) {
	artistManager.search( query );
	albumManager.search( query );
	trackManager.search( query );
}
	
$( document ).ready( function() {
	artistManager = new latManager("artists", "http://ws.spotify.com/search/1/artist.json");
	albumManager  = new latManager( "albums", "http://ws.spotify.com/search/1/album.json" );
	trackManager  = new latManager( "tracks", "http://ws.spotify.com/search/1/track.json" );
	
	searchAll( "test" );
});