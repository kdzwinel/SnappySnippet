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

	restoreSettings();

	/*
	 SUBMITTING THE CODE TO CodePen/jsFiddle/jsBin
	 */

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

	/*
	Event listeners
	 */

	propertiesCleanUpInput.on('change', persistSettingAndProcessSnapshot);
	removeDefaultValuesInput.on('change', persistSettingAndProcessSnapshot);
	removeWebkitPropertiesInput.on('change', persistSettingAndProcessSnapshot);
	fixHTMLIndentationInput.on('change', persistSettingAndProcessSnapshot);
	combineSameRulesInput.on('change', persistSettingAndProcessSnapshot);
	includeAncestors.on('change', persistSettingAndProcessSnapshot);

	createButton.on('click', makeSnapshot);

	htmlTextarea.on('click', function () {
		$(this).select();
	});
	cssTextarea.on('click', function () {
		$(this).select();
	});

	$('input[type="checkbox"]').each(function () {
		$(this).checkbox();
	});

	/*
	Settings - saving & restoring
	 */

	function restoreSettings() {
		// Since we can't access localStorage from here, we need to ask background page to handle the settings.
		// Communication with background page is based on sendMessage/onMessage.
		chrome.runtime.sendMessage({
			name: 'getSettings'
		}, function(settings) {
			for (var prop in settings) {
				var el = $("#" + prop);

				if (!el.length) {
					// Make sure we don't leak any settings when changing/removing id's.
					delete settings[prop];
					continue;
				}

				//updating flat UI checkbox
				el.data('checkbox').setCheck(settings[prop] === "true" ? 'check' : 'uncheck');
			}

			chrome.runtime.sendMessage({
				name: 'setSettings',
				data: settings
			})
		});

	}

	function persistSettingAndProcessSnapshot() {
		console.assert(this.id);
		chrome.runtime.sendMessage({
			name: 'changeSetting',
			item: this.id,
			value: this.checked
		});
		processSnapshot();
	}

	/*
	Making & processing snippets
	 */

	function makeSnapshot() {
		loader.addClass('creating');
		errorBox.removeClass('active');

		chrome.devtools.inspectedWindow.eval("(" + Snapshooter.toString() + ")($0)", function (result) {
			try {
				lastSnapshot = JSON.parse(result);
			} catch (e) {
				errorBox.find('.error-message').text('DOM snapshot could not be created. Make sure that you have inspected some element.');
				errorBox.addClass('active');
			}

			processSnapshot();

			loader.removeClass('creating');
		});
	}

	function processSnapshot() {
		if (!lastSnapshot) {
			return;
		}

		var styles = lastSnapshot.css,
			html = lastSnapshot.html;

		if (includeAncestors.is(':checked')) {
			styles = lastSnapshot.ancestorCss.concat(styles);
			html = lastSnapshot.leadingAncestorHtml + html + lastSnapshot.trailingAncestorHtml;
		}

		loader.addClass('processing');

		if (removeDefaultValuesInput.is(':checked')) {
			styles = defaultValueFilter.process(styles);
		}

		borderRadiusWorkaround.process(styles);

		if (propertiesCleanUpInput.is(':checked')) {
			styles = shorthandPropertyFilter.process(styles);
		}
		if (removeWebkitPropertiesInput.is(':checked')) {
			styles = webkitPropertiesFilter.process(styles);
		}
		if (combineSameRulesInput.is(':checked')) {
			styles = sameRulesCombiner.process(styles);
		}

		if (fixHTMLIndentationInput.is(':checked')) {
			html = $.htmlClean(html, {
				removeTags: ['class'],
				allowedAttributes: [
					['id'],
					['placeholder', ['input', 'textarea']],
					['disabled', ['input', 'textarea', 'select', 'option', 'button']],
					['value', ['input', 'button']],
					['readonly', ['input', 'textarea', 'option']],
					['label', ['option']],
					['selected', ['option']],
					['checked', ['input']]
				],
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