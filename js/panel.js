(function () {
	"use strict";

	var lastSnapshot,
		cssStringifier = new CSSStringifier(),
		shorthandPropertyFilter = new ShorthandPropertyFilter(),
		webkitPropertiesFilter = new WebkitPropertiesFilter(),
		defaultValueFilter = new DefaultValueFilter(),
		sameRulesCombiner = new SameRulesCombiner(),

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

		htmlInput.val(htmlTextarea.val());
		cssInput.val(cssTextarea.val());
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
		if(!lastSnapshot) {
			return;
		}

		var styles = lastSnapshot.css,
			html = lastSnapshot.html;

		loader.addClass('processing');

		if(removeDefaultValuesInput.is(':checked')) {
			styles = defaultValueFilter.process(styles);
		}
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
				removeTags: ['class'],
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