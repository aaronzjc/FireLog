var options = {
	debugState: false,
	useUserAgent: true,
	firePHPVersion: '0.7.4'
};

// 更新调试状态时，同步更新图标
function update(state) {
	options.debugState = state;
	if (state) {
		chrome.browserAction.setIcon({
			'path':"icon/icon64.png"
		});
	} else {
		chrome.browserAction.setIcon({
			'path':"icon/icon64-dark.png"
		});
	}
}

// 初始化调试状态，图标
chrome.storage.local.get('active', function(state) {
    update(state.active);
});

// 初始化连接
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
