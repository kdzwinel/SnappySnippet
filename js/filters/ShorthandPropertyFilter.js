function ShorthandPropertyFilter() {
	"use strict";

	function keepOnlyShorthandProperties(style) {
		var property,
			output={},
			blacklist = [
				"backgroundPosition","backgroundColor","backgroundImage","backgroundPositionX","backgroundPositionY","backgroundRepeat",
				"backgroundClip","backgroundOrigin","backgroundRepeatX","backgroundRepeatY",
				"marginLeft","marginRight","marginTop","marginBottom",
				"paddingLeft","paddingRight","paddingTop","paddingBottom",
				"borderLeft","borderRight","borderTop","borderBottom",
				"borderImageOutset","borderImageRepeat","borderImageSlice","borderImageSource","borderImageWidth",
				"borderBottomLeftRadius","borderBottomRightRadius","borderTopLeftRadius","borderTopRightRadius",
				"borderLeftColor","borderRightColor","borderTopColor","borderBottomColor",
				"borderLeftStyle","borderRightStyle","borderTopStyle","borderBottomStyle",
				"borderLeftWidth","borderRightWidth","borderTopWidth","borderBottomWidth",
				"borderColor","borderWidth","borderStyle",
				"outlineColor","outlineOffset","outlineStyle","outlineWidth",
				"overflowX","overflowY",
				"fontFamily", "fontSize", "fontStreach", "fontVariant", "fontWeight",
				"listStyleType","listStyleImage","listStylePosition",
				"transitionDelay","transitionProperty","transitionDuration","transitionTimingFunction",
				"webkitBorderAfter","webkitBorderAfterColor","webkitBorderBefore","webkitBorderBeforeColor","webkitBorderEnd","webkitBorderEndColor","webkitBorderStart","webkitBorderStartColor",
				"webkitBorderAfterWidth","webkitBorderAfterStyle","webkitBorderBeforeWidth","webkitBorderBeforeStyle","webkitBorderEndWidth","webkitBorderEndStyle","webkitBorderStartWidth","webkitBorderStartStyle",
				"webkitLogicalHeight","webkitLogicalWidth",
				"webkitMinLogicalHeight","webkitMinLogicalWidth","webkitMaxLogicalHeight","webkitMaxLogicalWidth",
				"webkitColumnRuleColor",
				"webkitPaddingBefore","webkitPaddingAfter","webkitPaddingStart","webkitPaddingEnd",
				"webkitMarginBefore","webkitMarginAfter","webkitMarginStart","webkitMarginEnd"
			];

		for(property in style) {
			if( style.hasOwnProperty(property) && blacklist.indexOf(property) === -1 ) {
				output[property] = style[property];
			}
		}

		return output;
	}

	this.process = function(styles) {
		var i, l,
			style,
			output = [];

		for (i = 0, l = styles.length; i < l; i++) {
			style = styles[i];

			output.push({
				id: style.id,
				tagName: style.tagName,
				node: keepOnlyShorthandProperties(style.node),
				before: style.before ? keepOnlyShorthandProperties(style.before) : null,
				after: style.after ? keepOnlyShorthandProperties(style.after) : null
			})
		}

		return output;
	};
}