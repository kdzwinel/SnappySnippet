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

	var shorthands = {
		"animation": ["animation-name", "animation-duration", "animation-timing-function", "animation-delay", "animation-iteration-count", "animation-direction", "animation-fill-mode", "animation-play-state"],
		"background": ["background-image", "bakcground-position", "background-position-x", "background-position-y", "background-size", "background-repeat", "background-repeat-x", "background-repeat-y", "background-attachment", "background-origin", "background-clip", "background-color"],
//		"background-position": ["background-position-x", "background-position-y"],
//		"background-repeat": ["background-repeat-x", "background-repeat-y"],
		"border": ["border-left", "border-right", "border-bottom", "border-top", "border-color", "border-style", "border-width", "border-top-color", "border-top-style", "border-top-width", "border-right-color", "border-right-style", "border-right-width", "border-bottom-color", "border-bottom-style", "border-bottom-width", "border-left-color", "border-left-style", "border-left-width"],
		"border-bottom": ["border-color", "border-style", "border-width", "border-bottom-width", "border-bottom-style", "border-bottom-color"],
//		"border-color": ["border-top-color", "border-right-color", "border-bottom-color", "border-left-color"],
//		"border-image": ["border-image-source", "border-image-slice", "border-image-width", "border-image-outset", "border-image-repeat"],
		"border-left": ["border-color", "border-style", "border-width", "border-left-width", "border-left-style", "border-left-color"],
		"border-radius": ["border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius"],
		"border-right": ["border-color", "border-style", "border-width", "border-right-width", "border-right-style", "border-right-color"],
//		"border-spacing": ["-webkit-border-horizontal-spacing", "-webkit-border-vertical-spacing"],
//		"border-style": ["border-top-style", "border-right-style", "border-bottom-style", "border-left-style"],
		"border-top": ["border-color", "border-style", "border-width", "border-top-width", "border-top-style", "border-top-color"],
//		"border-width": ["border-top-width", "border-right-width", "border-bottom-width", "border-left-width"],
		"flex": ["flex-grow", "flex-shrink", "flex-basis"],
		"flex-flow": ["flex-direction", "flex-wrap"],
		"font": ["font-family", "font-size", "font-style", "font-variant", "font-weight", "line-height"],
		"grid-area": ["grid-row-start", "grid-column-start", "grid-row-end", "grid-column-end"],
		"grid-column": ["grid-column-start", "grid-column-end"],
		"grid-row": ["grid-row-start", "grid-row-end"],
//		"height": ["min-height", "max-height"],
		"list-style": ["list-style-type", "list-style-position", "list-style-image"],
		"margin": ["margin-top", "margin-right", "margin-bottom", "margin-left"],
		"marker": ["marker-start", "marker-mid", "marker-end"],
		"outline": ["outline-color", "outline-style", "outline-width"],
		"overflow": ["overflow-x", "overflow-y"],
		"padding": ["padding-top", "padding-right", "padding-bottom", "padding-left"],
		"text-decoration": ["text-decoration-line", "text-decoration-style", "text-decoration-color"],
		"transition": ["transition-property", "transition-duration", "transition-timing-function", "transition-delay"],
//		"-webkit-animation": ["-webkit-animation-name", "-webkit-animation-duration", "-webkit-animation-timing-function", "-webkit-animation-delay", "-webkit-animation-iteration-count", "-webkit-animation-direction", "-webkit-animation-fill-mode", "-webkit-animation-play-state"],
		"-webkit-border-after": ["-webkit-border-after-width", "-webkit-border-after-style", "-webkit-border-after-color"],
		"-webkit-border-before": ["-webkit-border-before-width", "-webkit-border-before-style", "-webkit-border-before-color"],
		"-webkit-border-end": ["-webkit-border-end-width", "-webkit-border-end-style", "-webkit-border-end-color"],
		"-webkit-border-start": ["-webkit-border-start-width", "-webkit-border-start-style", "-webkit-border-start-color"],
//		"-webkit-border-radius": ["border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius"],
		"-webkit-columns": ["-webkit-column-width", "-webkit-column-count"],
		"-webkit-column-rule": ["-webkit-column-rule-width", "-webkit-column-rule-style", "-webkit-column-rule-color"],
		"-webkit-margin-collapse": ["-webkit-margin-before-collapse", "-webkit-margin-after-collapse"],
		"-webkit-mask": ["-webkit-mask-image", "-webkit-mask-position-x", "-webkit-mask-position-y", "-webkit-mask-size", "-webkit-mask-repeat-x", "-webkit-mask-repeat-y", "-webkit-mask-origin", "-webkit-mask-clip"],
		"-webkit-mask-position": ["-webkit-mask-position-x", "-webkit-mask-position-y"],
		"-webkit-mask-repeat": ["-webkit-mask-repeat-x", "-webkit-mask-repeat-y"],
		"-webkit-text-emphasis": ["-webkit-text-emphasis-style", "-webkit-text-emphasis-color"],
		"-webkit-text-stroke": ["-webkit-text-stroke-width", "-webkit-text-stroke-color"],
		"-webkit-transition": ["-webkit-transition-property", "-webkit-transition-duration", "-webkit-transition-timing-function", "-webkit-transition-delay"],
		"-webkit-transform-origin": ["-webkit-transform-origin-x", "-webkit-transform-origin-y", "-webkit-transform-origin-z"],
	};

	function keepOnlyShorthandProperties(style) {
		var property,
			output = {},
			shorthand,
			longhands,
			blacklist = {},
			i, l;

		for (shorthand in shorthands) {
			// We need to build a 'blacklist' of redundant properties that can be safely removed.
			// We can't safely remove all longhand properties because there are edge cases where
			// these can't be replaced by shorthands (when shorthands are not expressive enough).
			// e.g
			// We can't remove 'overflow-x' and 'overflow-y' if their values are different ('overflow-x: auto; overflow-y: scroll')
			// because 'overflow' property takes only one value ('overflow: auto, scroll' is invalid).
			//
			// If shorthand property isn't expressive enough to describe the longhand properties it will be empty
			// and we can safely remove it leaving only longhand properties.

			if (style.hasOwnProperty(shorthand) && style[shorthand]) {
				longhands = shorthands[shorthand];

				for (i = 0, l = longhands.length; i < l; i++) {
					blacklist[longhands[i]] = true;
				}
			} else if (!style[shorthand]) {
				blacklist[shorthand] = true;
			}
		}

		for (property in style) {
			if (style.hasOwnProperty(property) && !blacklist.hasOwnProperty(property)) {
				output[property] = style[property];
			}
		}

		return output;
	}

	this.process = function (styles) {
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
			});
		}

		return output;
	};
}
