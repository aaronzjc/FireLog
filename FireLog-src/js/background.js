// 调试方法
function cclog(from, msg) {
	console.log('from -> ' + from);
	if (msg) {
		console.log(msg);
	}
}

var options = {
	debugState: false,
	useUserAgent: true,
	firePHPVersion: '0.7.4',
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
	var callbacks = {
		tabId: parseInt(port.name),
		onMessage: function(msg) {
			// 方便调试
			cclog(msg.from, msg.msg);
		},
		tabUpdate: function(tabId, changeInfo, tab){
	    	if (callbacks.tabId == tabId) {
	    		console.log('tab updated');
	      		if (changeInfo.status == 'loading') {
	        		port.postMessage({msg:'tabUpdate',tabId:tabId});
	        		return true;
	      		}
	    	}
	  	},
	  	beforeRequest: function(details) {
	  		console.log('add header');
	    	if (options.debugState) {
				if (options.useUserAgent) {
					for (var i=0;i<details.requestHeaders.length;i++) {
						if (details.requestHeaders[i].name.toLowerCase() == 'user-agent') {
							if (details.requestHeaders[i].value.indexOf('FirePHP') < 0) {
								console.log('add header');
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
	    disconnect: function() {
	    	chrome.webRequest.onBeforeSendHeaders.removeListener(callbacks.beforeRequest);
			chrome.tabs.onUpdated.removeListener(callbacks.tabUpdate);
			port.onDisconnect.removeListener(callbacks.disconnect);
	    }
	};

	port.onMessage.addListener(callbacks.onMessage);
  	// Tab更新
  	chrome.tabs.onUpdated.addListener(callbacks.tabUpdate);
  	// 添加FirePHP的请求头
	chrome.webRequest.onBeforeSendHeaders.addListener(callbacks.beforeRequest,{urls: ["<all_urls>"]},["blocking", "requestHeaders"]);
	// 连接断了的时候
	port.onDisconnect.addListener(callbacks.disconnect);
});
