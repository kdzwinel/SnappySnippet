/*
 Allows to read, change and override settings kept in localStorage
 */
chrome.runtime.onMessage.addListener((message, sender, callback) => {
	"use strict";

	if(message.name === 'getSettings')
		callback(localStorage);
	
	else if(message.name === 'setSettings')
		chrome.storage.local.set(message.data);
	
	else if(message.name === 'changeSetting') {
		let data = {};
		data[message.item] = message.value;
		
		chrome.storage.local.set(data);
	}
});
