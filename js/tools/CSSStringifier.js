function CSSStringifier() {
	"use strict";

	function propertiesToString(properties) {
		var property,
			output = "";

		for (property in properties) {
			if (properties.hasOwnProperty(property)) {
				output += "    " + property + ": " + properties[property] + ";\n";
			}
		}

		return output;
	}

	function printIDs(ids, pseudoElement) {
		var i, l,
			idString,
			output = [];

		if(!(ids instanceof Array)) {
			ids = [ids];
		}

		for(i= 0, l = ids.length; i<l; i++) {
			idString = '#' + ids[i];
			if(pseudoElement) {
				idString += pseudoElement;
			}

			output.push(idString);
		}

		return output.join(', ');
	}

	this.process = function (styles) {
		var i, l,
			style,
			output = "";

		for (i = 0, l = styles.length; i < l; i++) {
			style = styles[i];

			output += printIDs(style.id) + ' {\n';
			output += propertiesToString(style.node);
			output += '}/*' + printIDs(style.id)+ '*/\n\n';

			if (style.after) {
				output += printIDs(style.id, ':after') + ' {\n';
				output += propertiesToString(style.after);
				output += '}/*' + printIDs(style.id, ':after') + '*/\n\n';
			}

			if (style.before) {
				output += printIDs(style.id, ':before') + ' {\n';
				output += propertiesToString(style.before);
				output += '}/*' + printIDs(style.id, ':before') + '*/\n\n';
			}
		}

		return output;
	}
}