/**
 * Snapshooter is responsible for returning HTML and computed CSS of all nodes from selected DOM subtree.
 *
 * @param HTMLElement root Root node for the subtree that will be processed
 * @returns {*} object with HTML as a string and CSS as an array of arrays of css properties
 */
function Snapshooter(root) {
	"use strict";
	var idCounter = 1;

	/**
	 * Changes CSSStyleDeclaration to simple Object removing unwanted properties in the process.
	 *
	 * @param CSSStyleDeclaration style
	 * @returns {}
	 */
	function styleDeclarationToSimpleObject(style) {
		var i, l,
			output = {};

		for(i=0, l=style.length; i<l; i++) {
			output[style[i]] = style[style[i]];
		}

		// Work around http://crbug.com/313670 (the "content" property is not present as a computed style indexed property value).
		output.content = style.content;

		return output;
	}

	function createID(node) {
		return node.tagName + '_' + idCounter++;
	}

	function dumpCSS(node, pseudoElement) {
		var styles;

		styles = node.ownerDocument.defaultView.getComputedStyle(node, pseudoElement);

		if(pseudoElement) {
			//if we are dealing with pseudoelement, check if 'content' property isn't empty
			//if it is, then we can ignore the whole element
			if(!styles.getPropertyValue('content')) {
				return null;
			}
		}

		return styleDeclarationToSimpleObject(styles);
	}

	function init() {
		var css = [],
			descendants,
			descendant,
			i,l,
			clone;

		// First we go through all nodes and dump all CSS
		descendants = root.getElementsByTagName('*');

		css.push({
			id: createID(root),
			tagName: root.tagName,
			node: dumpCSS(root, null),
			before: dumpCSS(root, ':before'),
			after: dumpCSS(root, ':after')
		});

		for(i=0, l=descendants.length; i<l; i++) {
			descendant = descendants[i];

			css.push({
				id: createID(descendant),
				tagName: descendant.tagName,
				node: dumpCSS(descendant, null),
				before: dumpCSS(descendant, ':before'),
				after: dumpCSS(descendant, ':after')
			});
		}

		// Next we dump all HTML and update IDs
		// Since we don't want to touch original DOM and we want to change IDs, we clone the original DOM subtree
		clone = root.cloneNode(true);
		descendants = clone.getElementsByTagName('*');
		idCounter = 1;

		clone.setAttribute('id', createID(clone));

		for(i=0, l=descendants.length; i<l; i++) {
			descendant = descendants[i];

			descendant.setAttribute('id', createID(descendant));
		}

		return JSON.stringify({
			html: clone.outerHTML,
			css: css
		});
	}

	return init();
}
