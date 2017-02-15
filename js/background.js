var options = {
	debugState: false,
	useUserAgent: true,
	firePHPVersion: '0.7.4'
};

function update(state) {
	console.log('update' + state);
	options.debugState = state;
}

chrome.runtime.onConnect.addListener(function (port) {
  	// Tab更新
  	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    	if (port.name == tabId) {
      		if (changeInfo.status == 'loading') {
        		port.postMessage('tabUpdate', tabId);
      		}
    	}
  	});
  	// 添加FirePHP的请求头
	chrome.webRequest.onBeforeSendHeaders.addListener(
	    function(details) {
	    	if (options.debugState) {
				if (options.useUserAgent) {
					for (var i=0;i<details.requestHeaders.length;i++) {
						if (details.requestHeaders[i].name.toLowerCase() == 'user-agent') {
							if (details.requestHeaders[i].value.indexOf('FirePHP') < 0) {
								details.requestHeaders[i].value += ' FirePHP/' + options.firePHPVersion;
							}
							break;
						}
					}
				} else {
					details.requestHeaders.push({name: 'X-FirePHP-Version', value: options.firePHPVersion});
				}
	      	}
	      	return {requestHeaders: details.requestHeaders};
	    },
	    {urls: ["<all_urls>"]},
	    ["blocking", "requestHeaders"]
	);

});
