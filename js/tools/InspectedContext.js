/**
 * Utility that evals code in the right context (either window or specific iFrame) depending on where last inspected element is located.
 *
 * @constructor
 */
function InspectedContext() {
	"use strict";

	function scanResources(callback, resources) {
		var i, currentURL,
			resourcesLeft = resources.length,
			targetURL = null;

		for (i = 0; i < resources.length; i++) {
			currentURL = resources[i].url;

			// Check if an iframe with given URL exists.
			chrome.devtools.inspectedWindow.eval("(" + isValidIframeSrc.toString() + ")('" + currentURL + "')", function (url, result) {
				if (!result) {
					stepCompleted();
					return;
				}

				// Now check if the current node belongs in the iframe.
				chrome.devtools.inspectedWindow.eval("(" + inThisFrame.toString() + ")($0)", {frameURL: url}, function (url, result) {
					if (result) {
						targetURL = url;
					}
					stepCompleted();
				}.bind(null, url));
			}.bind(null, currentURL));
		}

		function stepCompleted() {
			if (!--resourcesLeft) {
				callback(targetURL);
			}
		}
	}

	function inThisFrame(node) {
		return node ? true : false;
	}

	function isValidIframeSrc(url) {
		return !!document.querySelector("iframe[src='" + url + "']");
	}

	function findTargetFrameURL(callback) {
		chrome.devtools.inspectedWindow.eval("(" + inThisFrame.toString() + ")($0)", function (result) {
			if (result) {
				callback(null);
				return;
			}

			chrome.devtools.inspectedWindow.getResources(scanResources.bind(this, callback));
		});
	}

	this.eval = function (code, callback) {
		findTargetFrameURL(function (url) {
			var settings = url ? {frameURL: url} : {};

			chrome.devtools.inspectedWindow.eval(code, settings, callback);
		});
	};
}
