/**
 * Injects the CSS into the HTML as Style attributes.
 *
 * @constructor
 */
function HTMLStylesCombiner() {
	"use strict";
	var cursor = 0,
		stylesMap,

	// constants
		ATTRIBUTE_ENCLOSING_CHARACTERS = ['"', "'"],
		ESCAPING_CHARACTER = '\\',
		ID_ATTRIBUTE = "id=",
		STYLE_ATTRIBUTE = "style=";

	/**
	 * Looks for the next 'id' attribute inside a tag. Returns -1 if not found.
	 */
	function getNextIdAttributePosition(html, lastCursor) {
		var currentCursor,
			tagStartCursor,
			tagEndCursor,
			idCursor;

		while (lastCursor >= 0) {
			tagStartCursor = html.indexOf("<", lastCursor);
			if (tagStartCursor < 0) {
				return -1;
			}
			tagEndCursor = html.indexOf(">", tagStartCursor);
			if (tagEndCursor < 0) {
				return -1;
			}
			currentCursor = tagStartCursor;
			do {
				idCursor = html.indexOf(ID_ATTRIBUTE, currentCursor);
				if (idCursor < 0) {
					return -1;
				} else if (ATTRIBUTE_ENCLOSING_CHARACTERS.indexOf(html.charAt(idCursor + ID_ATTRIBUTE.length)) < 0) {
					// Not the right 'id=', look for the next
					currentCursor++;
				} else if (idCursor < tagEndCursor) {
					// Finally!
					return idCursor;
				}
			} while (idCursor < tagEndCursor);
			lastCursor = tagEndCursor;
		}
	}

	/**
	 * Extracts the attribute value that is in the current position.
	 * @param html the text to extract from.
	 * @param attributeEnclosingChar the string/character that encloses the value.
	 * @returns {*} The value that relates to the closest attribute, or null if not found.
	 */
	function extractValueInCurrentPosition(html, attributeEnclosingChar) {
		var idStartIndex,
			idEndIndex;

		idStartIndex = html.indexOf(attributeEnclosingChar, cursor) + 1;
		idEndIndex = html.indexOf(attributeEnclosingChar, idStartIndex + 1);
		if (idStartIndex < 0 || idEndIndex < 0) {
			return null;
		}

		return html.substring(idStartIndex, idEndIndex);
	}

	/**
	 * Converts SnappySnippet's CSS object into a string of CSS properties.
	 * @param properties The CSS object to extort.
	 * @param attributeEnclosingChar The string/character that encloses values.
	 * @returns {string} CSS properties contained in the given object.
	 */
	function propertiesToString(properties, attributeEnclosingChar) {
		var propertyName,
			output = "";

		for (propertyName in properties) {
			if (properties.hasOwnProperty(propertyName)) {
				// Treat those special url() functionals, that sometimes have quotation marks although they are not required
				var propertyValue =
					properties[propertyName].replace(/url\("(.*)"\)/g, "url($1)").replace(/url\('(.*)'\)/g, "url($1)")
						.replace(attributeEnclosingChar, ESCAPING_CHARACTER + attributeEnclosingChar);
				output += propertyName + ": " + propertyValue + "; ";
			}
		}

		return output;
	}

	/**
	 * Injects style attribute to the current position in the HTML.
	 * @param html The text to use.
	 * @param styleId What key we are currently on.
	 * @param attributeEnclosingChar The string/character that encloses values.
	 * @returns {*} the modified string.
	 */
	function insertStyleAtIndex(html, styleId, attributeEnclosingChar) {
		var cssStyles = stylesMap[styleId] && stylesMap[styleId].node;

		if (!cssStyles) {
			return html;
		}
		return html.substring(0, cursor) + // The head of the string
			STYLE_ATTRIBUTE + attributeEnclosingChar + // The attribute key
			propertiesToString(stylesMap[styleId].node, attributeEnclosingChar) + // The attribute value
			attributeEnclosingChar + " " + // Closing the value just before the next attribute
			html.substring(cursor); // The tail of the string
	}

	this.process = function (html, styles) {
		var currentId,
			attributeEnclosingChar;

		// Sanity check
		if (Boolean(html) && Boolean(styles)) {
			// Prepare a lookup dictionary of styles by the respective element id
			stylesMap = styles.map(function (styleObj) {
				var keyValuePair = {};
				keyValuePair[styleObj.id] = styleObj;
				return keyValuePair;
			}).reduce(function (mergedObj, currentObj) {
				return $.extend(mergedObj, currentObj);
			});

			cursor = getNextIdAttributePosition(html, 0);
			while (cursor >= 0) {
				// Make use of the fact that attribute value is always enclosed with the same char (either " or ')
				attributeEnclosingChar = html.charAt(cursor + ID_ATTRIBUTE.length);
				currentId = extractValueInCurrentPosition(html, attributeEnclosingChar);
				if (currentId === null)
					break;
				html = insertStyleAtIndex(html, currentId, attributeEnclosingChar);

				cursor = getNextIdAttributePosition(html, cursor);
			}
		}

		return html;
	};
}
