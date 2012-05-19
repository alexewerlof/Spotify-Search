//a simple plugin that sets the tooltip of an element besides its text
(function( $ ){
	$.fn.setTextAndTooltip = function( text ) {
		return this.each(function() {
			$( this ).text( text ).attr( "title", text );
		});
	};
})( jQuery );


// This plugin fills the text with Lorem Ipsum
(function( $ ){
	$.loremIpsum = function ( length ) {
		if ( typeof this.loremString == "undefined" ) {
			this.loremString = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec id enim sed eros imperdiet rutrum molestie " + 
			"quis ante. Proin lobortis bibendum mi vitae commodo. Aenean malesuada nisi at lorem malesuada ac posuere nulla molestie. Cura" + 
			"bitur mi nibh, gravida id sollicitudin nec, faucibus vitae mi. In quis mauris in nunc interdum tincidunt. Nullam placerat vol" + 
			"utpat lacus, sed blandit dui vulputate eu. Sed lectus lacus, luctus sed pellentesque eget, mollis vel nisi. Etiam ut convalli" + 
			"s augue. Nunc viverra vestibulum auctor. Mauris id risus vitae mi egestas consequat. Cras in ante ac nisl volutpat faucibus. " + 
			"Donec blandit suscipit enim. Fusce consectetur odio id orci laoreet sed pretium purus sodales. Vivamus a nisl lorem. Nulla la" + 
			"oreet ornare risus, eget sodales sem vehicula varius. Etiam aliquet luctus eros eget rhoncus. Donec semper arcu non dui facil" + 
			"isis sed pellentesque dolor posuere. Etiam sit amet congue erat. Vivamus porttitor feugiat diam quis commodo. Nullam congue, " + 
			"tortor vitae nullam.";
		}

		if ( typeof length == "undefined" ) {
			length = this.loremString.length;
		}

		if ( length <= this.loremString.length ) {
			return this.loremString.substr( 0, length );
		} else {
			//it's longer than the string we have, repeat it to generate the result string
			var ret = "";
			for ( var i = 0; i < length / this.loremString.length; i++ ) {
				ret += this.loremString;
			}
			ret += this.loremString.substr( 0, ( length % this.loremString.length ) );
			return ret;
		}
	};
})( jQuery );

/**
 * A utility function that creates a HTML DOM based on the descriptor. This function may be called recursively if the
 * descriptor.contents exists and is a descriptor or an array of descriptors.
 * @param descriptor The descriptor is an object that has the following members:
 *   tag:       (mandatory) string, the name of the HTML tag to be created. Example: "li" for creating a <li> element
 *   attr:      (optional) object, all the key-value pairs of this object will be added as attributes to the created element. 
 *               Example: {href:"#",name:"badLink"} in an <a> element will be <a href="#" name:"badLink"></a>
 *   contents:  (optional) string, object or an array of objects. If it's string, it will go directly to the element text.
 *              If it is an object, it will be treated as a descriptor itself and passed to this function recursively. If it is
 *              an array, it will be supposed to be an array of descriptors
 * @return a DOM structure that can be used with appendChild() function to insert
 */
(function( $ ){
	$.createTree = function (descriptor) {
		var ret=document.createElement(descriptor.tag);
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
								ret.appendChild( $.createTree( descriptor.contents[i] ) );
							}
						}
					} else {
						//it is an object
						ret.appendChild( $.createTree( descriptor.contents ) );
					}
					break;
			}
		}
		return ret;
	};
})( jQuery );

//a powerful plugin that creates an element tree and appends it to the selected jQuery nodes
(function( $ ){
	function createTree(descriptor) {
		var ret = $( document.createElement(descriptor.tag) );
		if ( descriptor.attr ) {
			for ( var a in descriptor.attr ) {
				ret.attr( a, descriptor.attr[a] );
			}
		}
		if ( descriptor.contents ) {
			switch (typeof descriptor.contents ) {
			case "string":
				//it is simply a string
				ret.html( descriptor.contents );
				break;
			case "object":
				if ( Array.isArray( descriptor.contents ) ) {
					//it is an array of objects
					for( var i = 0; i < descriptor.contents.length; i++ ) {
						if ( typeof descriptor.contents[i] == "string" ) {
							//it is a string
							ret.append( descriptor.contents[i] );
						} else {
							//it is a node descriptor object (can't be an array)
							ret.append( createTree( descriptor.contents[i] ) );
						}
					}
				} else {
					//it is an object
					ret.append( createTree( descriptor.contents ) );
				}
				break;
			}
		}
		return ret;
	}

	$.fn.appendTree = function( descriptor ) {
		return this.each(function() {
			$( this ).append( createTree(descriptor) );
		});
	};
})( jQuery );