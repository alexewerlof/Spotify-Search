var artistManager;
var albumManager;
var trackManager;
var suggestions;
var searchBox;

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
		this.$resultList.append( '<li class="loading"><div class="line1"><div class="waiting-animation"></div>Loading results...</div></li>' );
		ajaxCall( this.searchUrl + "?q=" + escape(this.lastSearchQuery), this.searchCallback, this);
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
			var name = '<a class="main-item" href="';
			switch( latMan.latId ) {
				case "artists": name += 'artist.html'; break;
				case "albums": name += 'album.html'; break;
				case "tracks": name += 'track.html'; break;
				default:console.log("Could not identify latMan.latId");return;
			}
			name += '?uri=' + item.href + '">' + item.name + '</a>';
			line1.append( name );
			//additional info: process albums in the results (it exists for queries for tracks)
			if ( item.album ) {
				line2.append( '<div class="icon album" title="Album"></div><a href="album.html?uri=' + item.album.href + '">' + item.album.name + '</a>' );
			}
			//additional info: process artists in the result (it exists for queries for tracks and albums)
			if ( item.artists ) {
				//if there is already something in line2, make a new line with <br/>
				if ( line2.children().length > 0 ) {
					line2.append( "<br/>" );
				}
				line2.append( '<div class="icon artist" title="Artist(s)"></div>' );
				for ( var a = 0; a < item.artists.length; a++ ) {
					var artist = $( '<a href="artist.html?uri=' + item.artists[a].href + '">' + item.artists[a].name + '</a>' );
					line2.append( artist );
					//add a comma between artist names if necessary
					if ( a < item.artists.length -1 ) {
						line2.append( ", " );
					}
				}
			}
			var $stars = $( '<div class="stars p' + Math.floor( ( parseFloat( item.popularity ) || 0 ) * 10 ) + '" title="Popularity"></div>' );
			//append the list item to the result list
			li.append( line1, line2, $stars );
			latMan.$resultList.append( li );
		}
	}

	//**takes care of when the user reachs the end of scrollbar and more items are remaining to be loaded
	this.$contents.scroll( (function(latMan){
		return function (e) {
			//if it is the end of the scroll
			if ( $(this).prop( "offsetHeight" ) + $(this).prop( "scrollTop" ) >= $(this).prop( "scrollHeight" ) ) {
				//this is already waiting for some results
				if ( latMan.lastSearchQuery == null || latMan.ajaxCallPending ) {
					return;
				}
				if ( latMan.currentPage + 1 <= latMan.maxPages ) {
					latMan.currentPage++;
					latMan.$resultList.append( '<li class="loading"><div class="line1"><div class="waiting-animation"></div>Loading page ' + latMan.currentPage + '</div></li>' );
					ajaxCall( latMan.searchUrl + "?q=" + escape( latMan.lastSearchQuery ) + "&page=" + latMan.currentPage, latMan.searchCallback, latMan );
				}
			}
		};
	})(this));	
}

/**
 * Search for artists, albums and tracks
 */
function searchAll( query ) {
	artistManager.search( query );
	albumManager.search( query );
	trackManager.search( query );
}

//** maximum number of items suggested from each category (artists, albums, tracks) for auto-complete
const MAX_ITEMS = 7;
//** returns an array of completions for the txt
function autoComplete (){
	var txt = $.trim( $( "#search-box").val() );
	if ( txt == "" ) {
		suggestions.empty().hide();
		return;//nothing to do!
	}
	ajaxCall( "http://ws.spotify.com/search/1/artist.json?q=" + escape( txt ), function(artistResults) {
		ajaxCall( "http://ws.spotify.com/search/1/album.json?q=" + escape( txt ), function(albumResults) {
			ajaxCall( "http://ws.spotify.com/search/1/track.json?q=" + escape( txt ), function(trackResults) {
				var ret = new Array();
				suggestions.empty();
				for ( var i = 0; i < Math.min( MAX_ITEMS, artistResults.info.num_results); i++) {
					suggestions.append( "<li>" + artistResults.artists[i].name + "</li>" );
				}
				for ( var i = 0; i < Math.min( MAX_ITEMS, albumResults.info.num_results); i++) {
					suggestions.append( "<li>" + albumResults.albums[i].name + "</li>" );
				}
				for ( var i = 0; i < Math.min( MAX_ITEMS, trackResults.info.num_results); i++) {
					suggestions.append( "<li>" + trackResults.tracks[i].name + "</li>" );
				}
				//what happens when a suggestion is clicked
				$( "#suggestions li" ).click(function(){
					$( "#suggestions li.selected" ).removeClass( "selected" );
					$(this).addClass( "selected" );
					searchBox.val( $(this).text() );
					searchAll( searchBox.val() );
					suggestions.hide();
				});
				if ( suggestions.children( "li" ).length > 0 ) {//if there's any suggestion in the list, show it
					suggestions.show();
				} else {
					suggestions.hide();
				}
			});
		});
	});
}
	
$( document ).ready( function() {
	searchBox = $( "#search-box" )
	suggestions = $( "#suggestions" );
	artistManager = new latManager("artists", "http://ws.spotify.com/search/1/artist.json");
	albumManager  = new latManager( "albums", "http://ws.spotify.com/search/1/album.json" );
	trackManager  = new latManager( "tracks", "http://ws.spotify.com/search/1/track.json" );
	
	suggestions.click( function(e) {
		event.stopPropagation();
	});
	$( document ).click( function(e) {
		suggestions.hide();
	});
	searchBox.click( function (e) {
		autoComplete();
	});

	searchBox.keyup( function(e) {
		//console.log( String.fromCharCode( e.which ) );
		var txt = $( "#search-box").val();
		switch ( e.which ) {
		case 13://enter key
			window.location = "results.html?" + escape( txt );
			//suggestions.hide();
			//searchAll( escape( txt ) );
			e.preventDefault();
			return false;
		case 38://up arrow key
			suggestions.children( "li" ).each( function(index, Element) {
				if( $(this).hasClass( "selected" ) ) {
					if ( index == 0 ) {//can't go upper than the first element!
						return false;
					}
					$(this).removeClass( "selected" );
					//add ".selected" class to previous child
					var newSel = $(this).prev();
					newSel.addClass( "selected" );
					searchBox.val( newSel.text() );
					return false;
				}
			});
			e.preventDefault();
			return false;
		case 40://down arrow key
			if ( suggestions.children( "li.selected" ).length > 0 ){//if there is at least one selected item
				suggestions.children( "li" ).each( function(index, Element) {
					if( $(this).hasClass( "selected" ) ) {
						if ( $(this).next().length == 0 ) {//can't go lower than the last element!
							return false;
						}
						$(this).removeClass( "selected" );
						//add ".selected" class to previous child
						var newSel = $(this).next();
						newSel.addClass( "selected" );
						searchBox.val( newSel.text() );
						return false;
					}
				});
			} else {
				//just select the first item in the list
				var newSel = suggestions.children( "li:first-child" );
				newSel.addClass( "selected" );
				searchBox.val( newSel.text() );
			}
			e.preventDefault();
			return false;
		default:
			autoComplete();
		}
	});
	
	var params = unescape( window.location.search );
	var query = params.match(/\?(.+)/);
	if ( !query ){
		console.log( "No query" );
	} else {
		$( "#search-box" ).val( query[1] );
		searchAll( query[1] );
	}
	suggestions.hide();
	searchBox.focus();
});