/**
 * Utility that transforms object representing CSS rules to actual CSS code.
 *
 * @constructor
 */
function CSSStringifier() {
	"use strict";

	function propertiesToString(properties) {
		var propertyName,
			output = "";

		for (propertyName in properties) {
			if (properties.hasOwnProperty(propertyName)) {
				output += "    " + propertyName + ": " + properties[propertyName] + ";\n";
			}
		}

		return output;
	}

	function printIDs(ids, pseudoElement) {
		var i, l,
			idString,
			output = [];

		if (!(ids instanceof Array)) {
			ids = [ids];
		}

		for (i = 0, l = ids.length; i < l; i++) {
			idString = '#' + ids[i];
			if (pseudoElement) {
				idString += pseudoElement;
			}

			output.push(idString);
		}

		return output.join(', ');
	}

	function generateStyle(selector, node) {
		var output = "";

		output += selector + ' {\n';
		output += propertiesToString(node);
		output += '}/*' + selector + '*/\n\n';

		return output;
	}

	this.process = function (styles) {
		var i, l,
			style,
			output = "";

		for (i = 0, l = styles.length; i < l; i++) {
			style = styles[i];

			output += generateStyle(printIDs(style.id), style.node);

			if (style.after) {
				output += generateStyle(printIDs(style.id, ':after'), style.after);
			}

			if (style.before) {
				output += generateStyle(printIDs(style.id, ':before'), style.before);
			}
		}

		return output;
	};
}
