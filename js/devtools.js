var PHPLog = {
  panel: null,
  panelWindow: null,
  vm: null
};

// connect background.js
var port = chrome.runtime.connect({
  name: chrome.devtools.inspectedWindow.tabId.toString()
});
port.onMessage.addListener(function(msg){
  if (msg == 'tabUpdate') {
    PHPLog.vm.$emit('tab-update', {tabId: msg});
  }
});

// create panel
chrome.devtools.panels.create("FireLog","FontPicker.png","panel.html", function (panel) {
  PHPLog.panel = panel;
  PHPLog.panel.onShown.addListener(function(panelWindow){
    panelWindow.chrome = chrome;
    PHPLog.panelWindow = panelWindow;
    PHPLog.vm = PHPLog.panelWindow.vm;
  });
});

// init response after request
chrome.devtools.network.onRequestFinished.addListener(function(request){
  var key = 'X-Wf-1-1-1-';

  var responseHeaders = request.response.headers;
  // 对于存在firephp的响应才发送
  var tmp = [];
  var json = '';
  var flag = false;
  for(var i in responseHeaders) {
    if (responseHeaders[i]['name'].indexOf(key) >= 0) {
      flag = true;
      var value = responseHeaders[i];
      var fragment = value['value'].substring(value['value'].indexOf('|') + 1, value['value'].lastIndexOf('|'));
      var index = parseInt(value['name'].substring(key.length));
      if (value['value'].indexOf('|') > 0) {
        var isFrag = false;
      } else {
        var isFrag = true;
      }
      tmp.push({'index':index, 'val':fragment, 'isFrag': isFrag});
    }
  }
  if (flag) {
    PHPLog.vm.$emit('add-request', {url: request.request.url, data:tmp});
    // PHPLog.panelWindow.showRequest(request);
  }
});
