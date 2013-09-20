function SameRulesCombiner() {
	"use strict";

	function compareRules(rulesA, rulesB) {
		return JSON.stringify(rulesA) === JSON.stringify(rulesB);
	}

	this.process = function(styles) {
		var i, j,
			stylesA, stylesB,
			ids,
			output = [];

		for (i = 0; i < styles.length; i++) {
			stylesA = styles[i];
			ids = [stylesA.id];

			for (j = i+1; j < styles.length; j++) {
				stylesB = styles[j];

				if(compareRules(stylesA.node, stylesB.node) &&
					compareRules(stylesA.after, stylesB.after) &&
					compareRules(stylesA.before, stylesB.before)) {

					ids.push(stylesB.id);
					styles.splice(j,1);
				}
			}

			output.push({
				id: ids,
				node: stylesA.node,
				before: stylesA.before,
				after: stylesA.after
			})
		}

		return output;
	};
}