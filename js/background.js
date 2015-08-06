/*
 Allows to read, change and override settings kept in localStorage

 FIXME Can be replaced with chrome.storage.local as soon as http://crbug.com/178618 will be resolved
 FIXME Can be replaced with localStorage on the panel page as soon as http://crbug.com/319328 will be resolved
 */
chrome.runtime.onMessage.addListener(function (message, sender, callback) {
	"use strict";

	if (message.name === 'getSettings') {
		callback(localStorage);
	} else if (message.name === 'setSettings') {
		localStorage = message.data;
	} else if (message.name === 'changeSetting') {
		localStorage[message.item] = message.value;
	}
});
