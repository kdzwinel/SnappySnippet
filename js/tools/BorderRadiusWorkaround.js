/**
 * Utility that works around a border-radius bug in getComputedStyle ( http://crbug.com/298972, fixed in Chrome 32 )
 *
 * @constructor
 */
function BorderRadiusWorkaround() {
	"use strict";

	function getRadius(value, idx) {
		if (value) {
			value = value.split(' ');
			return value[idx] || 0;
		}

		return 0;
	}

	function fixBorderRadius(properties) {
		var borderFirstRadius = [], borderSecondRadius = [];

		borderFirstRadius[0] = getRadius(properties['border-top-left-radius'], 0);
		borderFirstRadius[1] = getRadius(properties['border-top-right-radius'], 0);
		borderFirstRadius[2] = getRadius(properties['border-bottom-right-radius'], 0);
		borderFirstRadius[3] = getRadius(properties['border-bottom-left-radius'], 0);

		borderSecondRadius[0] = getRadius(properties['border-top-left-radius'], 1);
		borderSecondRadius[1] = getRadius(properties['border-top-right-radius'], 1);
		borderSecondRadius[2] = getRadius(properties['border-bottom-right-radius'], 1);
		borderSecondRadius[3] = getRadius(properties['border-bottom-left-radius'], 1);

		properties['border-radius'] = borderFirstRadius.join(' ');

		//if borderSecondRadius != [0,0,0,0] then we need to add information about second radius
		if (!borderSecondRadius.every(function (a) {
			return (a === 0);
		})) {
			properties['border-radius'] += ' / ' + borderSecondRadius.join(' ');
		}
	}

	this.process = function (styles) {
		var i;

		for (i = 0; i < styles.length; i++) {
			var style = styles[i];

			if (style.node.hasOwnProperty('border-radius')) {
				fixBorderRadius(style.node);
			}
			if (style.before && style.before.hasOwnProperty('border-radius')) {
				fixBorderRadius(style.before);
			}
			if (style.after && style.after.hasOwnProperty('border-radius')) {
				fixBorderRadius(style.after);
			}
		}
	};
}