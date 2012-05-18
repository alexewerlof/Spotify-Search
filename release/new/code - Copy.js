function ajaxCall( url, params, callback ) {
	function errorCallback(jqXHR, textStatus, errorThrown){
		console.log( "Ajax call failed: " + url);
	}
	function successCallback(data, textStatus, jqXHR){
		if ( callback ) {
			callback( data );
		}
	}
	$.ajax({
		type: "GET",
		url: url + ".json",
		data: params,
		dataType: "json",
		success: successCallback,
		error: errorCallback
	});
}

//searches the artists
function searchArtist( query, p) {
	$( "#artists-result-list" ).data( "query", query )
	if ( typeof p == "undefined" ) {
		p = 1;
	}
	if ( p == 1) {
		$( "#artists-title" ).empty();
	}
	$( "#artists-title" ).setTextAndTooltip( "Searching for artists with '" + query + "' in their name..." );
	$( "#artists-result-list" ).data( "inProgress", true );
	ajaxCall( "http://ws.spotify.com/search/1/artist", { q: query, page: p }, function ( results ) {
		$( "#artists-result-list" ).data( "inProgress", false );
		$( "#artists-result-list li.loading" ).remove();
		$( "#artists-result-list" ).data( "maxPages", (results.info.num_results / results.info.limit ) + 1 );
		$( "#artists-title" ).setTextAndTooltip( results.info.num_results + " artists with '" + query + "' in their name" );
		for ( var i = 0; i < results.artists.length; i++ ) {
			var artist = results.artists[i];
			/* URI digits
			var uri = artist.href;
			var digits = uri.match( /:([^:]+)$/ );
			*/
			$( "#artists-result-list" ).append(
				'<li>' +
				'  <div class="line1" title="' + (results.info.offset + i +1 ) + ". " + artist.name + '">' + artist.name + '</div>' +
				'  <div class="line2">' +
				'    <div class="stars p' + Math.floor( ( parseFloat( artist.popularity ) || 0 ) * 10 ) + '" title="Popularity"></div>' +
				'    <div class="icon links" title="See links (URI, HTTP, Embed code)"></div>' +
				'    <div class="icon share" title="Share item"></div>' +
				'    <div class="icon in-spotify" title="See item in Spotify application"></div>' +
				'  </div>' +
				'</li>'
			);
		}
	});
}

function searchAlbum(query) {
}

function searchTrack(query) {
}

function lookupArtist(uri) {
}

function lookupAlbum(uri) {
}

function lookupTrack(uri) {
}

/**
 * Every latManager, manages a lat.
 * It will take care of automatically making the Ajax calls for paging
 */
latManager = function ( latId, searchUrl, lookupUrl) {
	this.latId = latId;
	this.searchUrl = searchUrl;
	this.lookupUrl = lookupUrl;
	this.search = function ( query, callback ) {
	}
	this.lookup = function ( uri, callback ) {
	}
}

$( document ).ready( function() {
	searchArtist( "Jackson" );
	$( "#artists-contents" ).scroll( function (e) {
		var $c = $( this );
		//if it is the end of the scroll
		if ( $c.prop( "offsetHeight" ) + $c.prop( "scrollTop" ) >= $c.prop( "scrollHeight" ) ) {
			if ( $( "#artists-result-list" ).data( "inProgress" ) ) {
				return;
			}
			var p = $( "#artists-result-list" ).data( "page" ) || 1;
			p++;
			if ( p <= $( "#artists-result-list" ).data( "maxPages" ) ) {
				$( "#artists-result-list" ).data( "page", p ).append( '<li class="loading"><div class="line1"><img src="waiting.gif" />Loading page ' + p + '</div></li>' );
				searchArtist( $( "#artists-result-list" ).data( "query" ), p );
			}
		}
	});
});