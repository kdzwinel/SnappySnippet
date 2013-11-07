/*
Allows to read, change and override settings kept in localStorage
 */
chrome.runtime.onMessage.addListener(function(message, sender, callback){
	if(message.name === 'getSettings') {
		callback(localStorage);
	} else if(message.name === 'setSettings') {
		localStorage = message.data;
	} else if(message.name === 'changeSetting') {
		localStorage[message.item] = message.value;
	}
});