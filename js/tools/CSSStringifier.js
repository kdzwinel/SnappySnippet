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

	function printIDs(ids, prefix, pseudoElement) {
		var i, l,
			idString,
			output = [];

		if (!(ids instanceof Array)) {
			ids = [ids];
		}

		prefix = prefix || "";

		for (i = 0, l = ids.length; i < l; i++) {
			idString = '#' + prefix + ids[i];
			if (pseudoElement) {
				idString += pseudoElement;
			}

			output.push(idString);
		}

		return output.join(', ');
	}

	this.process = function (styles, prefix) {
		var i, l,
			style,
			output = "";

		for (i = 0, l = styles.length; i < l; i++) {
			style = styles[i];

			output += printIDs(style.id, prefix) + ' {\n';
			output += propertiesToString(style.node);
			output += '}/*' + printIDs(style.id, prefix) + '*/\n\n';

			if (style.after) {
				output += printIDs(style.id, prefix, ':after') + ' {\n';
				output += propertiesToString(style.after);
				output += '}/*' + printIDs(style.id, prefix, ':after') + '*/\n\n';
			}

			if (style.before) {
				output += printIDs(style.id, prefix, ':before') + ' {\n';
				output += propertiesToString(style.before);
				output += '}/*' + printIDs(style.id, prefix, ':before') + '*/\n\n';
			}
		}

		return output;
	}
}