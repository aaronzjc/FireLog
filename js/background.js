chrome.runtime.onConnect.addListener(function (port) {
  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    if (port.name == tabId) {
      if (changeInfo.status == 'loading') {
        port.postMessage('tabUpdate', tabId);
      }
    }
  });
});
