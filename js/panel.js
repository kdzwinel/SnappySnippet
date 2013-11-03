(function () {
	"use strict";

	var lastSnapshot,

		cssStringifier = new CSSStringifier(),
		shorthandPropertyFilter = new ShorthandPropertyFilter(),
		webkitPropertiesFilter = new WebkitPropertiesFilter(),
		defaultValueFilter = new DefaultValueFilter(),
		sameRulesCombiner = new SameRulesCombiner(),
		borderRadiusWorkaround = new BorderRadiusWorkaround(),

		loader = $('#loader'),
		createButton = $('#create'),

		codepenForm = $('#codepen-form'),
		jsfiddleForm = $('#jsfiddle-form'),
		jsbinForm = $('#jsbin-form'),

		propertiesCleanUpInput = $('#properties-clean-up'),
		removeDefaultValuesInput = $('#remove-default-values'),
		removeWebkitPropertiesInput = $('#remove-webkit-properties'),
		combineSameRulesInput = $('#combine-same-rules'),
		fixHTMLIndentationInput = $('#fix-html-indentation'),
		includeAncestors = $('#include-ancestors'),

		htmlTextarea = $('#html'),
		cssTextarea = $('#css'),

		errorBox = $('#error-box');

	codepenForm.on('submit', function () {
		var dataInput = codepenForm.find('input[name=data]');

		dataInput.val(JSON.stringify({
			html: htmlTextarea.val(),
			css: cssTextarea.val()
		}));
	});

	jsfiddleForm.on('submit', function () {
		var htmlInput = jsfiddleForm.find('input[name=html]');
		var cssInput = jsfiddleForm.find('input[name=css]');

		htmlInput.val(htmlTextarea.val());
		cssInput.val(cssTextarea.val());
	});

	jsbinForm.on('submit', function () {
		var htmlInput = jsbinForm.find('input[name=html]');
		var cssInput = jsbinForm.find('input[name=css]');

		htmlInput.val(encodeURIComponent(htmlTextarea.val()));
		cssInput.val(encodeURIComponent(cssTextarea.val()));
	});

	propertiesCleanUpInput.on('change', processSnapshot);
	removeDefaultValuesInput.on('change', processSnapshot);
	removeWebkitPropertiesInput.on('change', processSnapshot);
	fixHTMLIndentationInput.on('change', processSnapshot);
	combineSameRulesInput.on('change', processSnapshot);

	createButton.on('click', makeSnapshot);

	htmlTextarea.on('click', function() {
		$(this).select();
	});
	cssTextarea.on('click', function() {
		$(this).select();
	});

	$('input[type="checkbox"]').each(function () {
		$(this).checkbox();
	});

	function findTargetFrameURL(callback) {
		chrome.devtools.inspectedWindow.eval("(" + inThisFrame.toString() + ")($0)", function (result) {
			if (result) {
				callback(null);
				return;
			}

			chrome.devtools.inspectedWindow.getResources(resourcesCallback);
		});

		function resourcesCallback(resources) {
			var i, currentURL,
				resourcesLeft = resources.length,
				targetURL = null;
			for (i=0; i<resources.length; i++) {
				currentURL = resources[i].url;
				// Check if an iframe with given URL exists.
				chrome.devtools.inspectedWindow.eval("(" + isValidIframeSrc.toString() + ")('" + currentURL + "')", function(url, result) {
					if (!result) {
						stepCompleted();
						return;
					}

					// Now check if the current node belongs in the iframe.
					chrome.devtools.inspectedWindow.eval("(" + inThisFrame.toString() + ")($0)", {frameURL: url}, function(url, result) {
						if (result)
							targetURL = url;
						stepCompleted();
					}.bind(this, url));
				}.bind(this, currentURL));
			}

			function stepCompleted() {
				if (!--resourcesLeft)
					callback(targetURL);
			}
		}

		function inThisFrame(node) {
			return node ? true : false;
		}

		function isValidIframeSrc(url) {
			return !!document.querySelector("iframe[src='" + url + "']");
		}
	}

	function makeSnapshot() {
		loader.addClass('creating');
		errorBox.removeClass('active');

		findTargetFrameURL(function(url) {
			if (url)
				chrome.devtools.inspectedWindow.eval("(" + Snapshooter.toString() + ")($0)", {frameURL: url}, callback);
			else
				chrome.devtools.inspectedWindow.eval("(" + Snapshooter.toString() + ")($0)", callback);
		});

		function callback(result) {
			try {
				lastSnapshot = JSON.parse(result);
			} catch (e) {
				errorBox.find('.error-message').text('DOM snapshot could not be created. Make sure that you have inspected some element.');
				errorBox.addClass('active');
			}

			processSnapshot();

			loader.removeClass('creating');
		}
	}

	function processSnapshot() {
		if(!lastSnapshot) {
			return;
		}

		var styles = lastSnapshot.css,
			html = lastSnapshot.html;

		if (includeAncestors.is(':checked')) {
		  styles = lastSnapshot.ancestorCss.concat(styles);
		  html = lastSnapshot.leadingAncestorHtml + html + lastSnapshot.trailingAncestorHtml;
		}

		loader.addClass('processing');

		if(removeDefaultValuesInput.is(':checked')) {
			styles = defaultValueFilter.process(styles);
		}

		borderRadiusWorkaround.process(styles);

		if(propertiesCleanUpInput.is(':checked')) {
			styles = shorthandPropertyFilter.process(styles);
		}
		if(removeWebkitPropertiesInput.is(':checked')) {
			styles = webkitPropertiesFilter.process(styles);
		}
		if(combineSameRulesInput.is(':checked')) {
			styles = sameRulesCombiner.process(styles);
		}

		if(fixHTMLIndentationInput.is(':checked')) {
			html = $.htmlClean(html, {
				removeAttrs: ['class'],
				allowedAttributes: [['id']],
				format: true,
				replace: [],
				replaceStyles: [],
				allowComments: true
			});
		}

		htmlTextarea.val(html);
		cssTextarea.val(cssStringifier.process(styles));

		loader.removeClass('processing');
	}
})();