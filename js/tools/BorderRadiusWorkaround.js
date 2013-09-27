function BorderRadiusWorkaround() {
	"use strict";

	function getRadius(value, idx) {
		if(value) {
			value = value.split(' ');
			return value[idx] || 0;
		}

		return 0;
	}

	//fixes a bug in getComputedStyle ( https://code.google.com/p/chromium/issues/detail?id=298972 )
	function fixBorderRadius(properties) {
		var borderFirstRadius = [], borderSecondRadius = [];

		borderFirstRadius[0] = getRadius(properties['borderTopLeftRadius'], 0);
		borderFirstRadius[1] = getRadius(properties['borderTopRightRadius'], 0);
		borderFirstRadius[2] = getRadius(properties['borderBottomRightRadius'], 0);
		borderFirstRadius[3] = getRadius(properties['borderBottomLeftRadius'], 0);

		borderSecondRadius[0] = getRadius(properties['borderTopLeftRadius'], 1);
		borderSecondRadius[1] = getRadius(properties['borderTopRightRadius'], 1);
		borderSecondRadius[2] = getRadius(properties['borderBottomRightRadius'], 1);
		borderSecondRadius[3] = getRadius(properties['borderBottomLeftRadius'], 1);

		properties['borderRadius'] = borderFirstRadius.join(' ');

		//if borderSecondRadius != [0,0,0,0] then we need to add information about second radius
		if(!borderSecondRadius.every(function(a){
			return (a === 0);
		})) {
			properties['borderRadius'] += ' / ' + borderSecondRadius.join(' ');
		}
	}

	this.process = function(styles) {
		var i;

		for (i = 0; i < styles.length; i++) {
			var style = styles[i];

			if(style.node.hasOwnProperty('borderRadius')) {
				fixBorderRadius(style.node);
			}
			if(style.before && style.before.hasOwnProperty('borderRadius')) {
				fixBorderRadius(style.before);
			}
			if(style.after && style.after.hasOwnProperty('borderRadius')) {
				fixBorderRadius(style.after);
			}
		}
	};
}