/**
 * Filter that removes all properties that use default browser values.
 *
 * @constructor
 */
function DefaultValueFilter() {
	"use strict";
	var iframe;

	function init() {
		iframe = document.createElement('iframe');
		document.body.appendChild(iframe);
	}

	init();

	function removeDefaultValues(style, tagName, pseudoElement) {
		var property,
			avalue,
			bvalue,
			cloneStyle,
			output = {},
			clone = document.createElement(tagName);

		if (tagName === 'A') {
			//when <a> doesn't have href attribute, default browser styles for this element are different
			clone.setAttribute('href', '#');
		}

		iframe.contentWindow.document.body.appendChild(clone);

		if (pseudoElement) {
			cloneStyle = clone.ownerDocument.defaultView.getComputedStyle(clone, pseudoElement);
		} else {
			cloneStyle = clone.ownerDocument.defaultView.getComputedStyle(clone);
		}

		for (property in style) {
			avalue = cloneStyle[property];
			bvalue = style[property];

			if (!style.hasOwnProperty(property) || avalue === bvalue) {
				continue;
			}

			output[property] = bvalue;
		}

		iframe.contentWindow.document.body.removeChild(clone);

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
				node: removeDefaultValues(style.node, style.tagName),
				before: style.before ? removeDefaultValues(style.before, style.tagName, ':before') : null,
				after: style.after ? removeDefaultValues(style.after, style.tagName, ':after') : null
			});
		}

		return output;
	};
}
