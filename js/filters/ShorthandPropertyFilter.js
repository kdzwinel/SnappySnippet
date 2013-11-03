/**
 * Filter that removes all non-shorthand properties (where possible) resulting in more concise and readable code.
 * e.g.
 * {border-color: red; border-width: 2px; border-style: solid; border: red 2px solid;}
 * ->
 * {border: red 2px solid;}
 *
 * @constructor
 */
function ShorthandPropertyFilter() {
	"use strict";

	var blacklist = keySet([
		"background-position","background-color","background-image","background-position-x","background-position-y","background-repeat",
		"background-clip","background-origin","background-repeat-x","background-repeat-y",
		"margin-left","margin-right","margin-top","margin-bottom",
		"padding-left","padding-right","padding-top","padding-bottom",
		"border-left","border-right","border-top","border-bottom",
		"border-image-outset","border-image-repeat","border-image-slice","border-image-source","border-image-width",
		"border-bottom-left-radius","border-bottom-right-radius","border-top-left-radius","border-top-right-radius",
		"border-left-color","border-right-color","border-top-color","border-bottom-color",
		"border-left-style","border-right-style","border-top-style","border-bottom-style",
		"border-left-width","border-right-width","border-top-width","border-bottom-width",
		"border-color","border-width","border-style",
		"outline-color","outline-offset","outline-style","outline-width",
		"overflow-x","overflow-y",
		"font-family", "font-size", "font-stretch", "font-variant", "font-weight",
		"list-style-type","list-style-image","list-style-position",
		"transition-delay","transition-property","transition-duration","transition-timing-function",
		"-webkit-border-after","-webkit-border-after-color","-webkit-border-before","-webkit-border-before-color","-webkit-border-end","-webkit-border-end-color","-webkit-border-start","-webkit-border-start-color",
		"-webkit-border-after-width","-webkit-border-after-style","-webkit-border-before-width","-webkit-border-before-style","-webkit-border-end-width","-webkit-border-end-style","-webkit-border-start-width","-webkit-border-start-style",
		"-webkit-logical-height","-webkit-logical-width",
		"-webkit-min-logical-height","-webkit-min-logical-width","-webkit-max-logical-height","-webkit-max-logical-width",
		"-webkit-column-rule-color",
		"-webkit-padding-before","-webkit-padding-after","-webkit-padding-start","-webkit-padding-end",
		"-webkit-margin-before","-webkit-margin-after","-webkit-margin-start","-webkit-margin-end"
	]);

	function keySet(array) {
		var i, l, obj = {};

		for (i = 0, l = array.length; i < l; i++) {
			obj[array[i]] = true;
		}

		return obj;
	}

	function keepOnlyShorthandProperties(style) {
		var property,
			output={};

		for(property in style) {
			if( style.hasOwnProperty(property) && !blacklist.hasOwnProperty(property) ) {
				output[property] = style[property];
			}
		}

		return output;
	}

	this.process = function(styles) {
		var i, l,
			style,
			output = [];

		for (i = 0, l = styles.length; i < l; i++) {
			style = styles[i];

			output.push({
				id: style.id,
				tagName: style.tagName,
				node: keepOnlyShorthandProperties(style.node),
				before: style.before ? keepOnlyShorthandProperties(style.before) : null,
				after: style.after ? keepOnlyShorthandProperties(style.after) : null
			})
		}

		return output;
	};
}