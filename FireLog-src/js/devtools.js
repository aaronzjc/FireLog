var PHPLog = {
  portState:false,
  panel: null,
  panelWindow: null,
  vm: null
};

// connect background.js
var port = chrome.runtime.connect({
  name: chrome.devtools.inspectedWindow.tabId.toString()
});
PHPLog.portState = true;
port.onMessage.addListener(function(data){
  if (data.msg == 'tabUpdate') {
    PHPLog.vm.$emit('tab-update', data);
  }
});
port.onDisconnect.addListener(function(){
  PHPLog.portState = false;
});

// 调试方法，向background发送消息，控制台输出信息
function postMessage(from,msg) {
  port.postMessage({from:from, msg:msg});
}

// create panel
chrome.devtools.panels.create("FireLog","FontPicker.png","panel.html", function (panel) {
  PHPLog.panel = panel;
  PHPLog.panel.onShown.addListener(function(panelWindow){
    PHPLog.panelWindow = panelWindow;
    PHPLog.vm = panelWindow.vm;
  });
});

// init response after request
chrome.devtools.network.onRequestFinished.addListener(function(request){
  // alert('receive');
  var key = 'X-Wf-1-1-1-';
  
  var responseHeaders = request.response.headers;
  
  // 对于存在firephp的响应才发送
  var tmp = [];
  var flag = false;
  // PHPLog.vm.$emit('request-debug', {url: request.request.url, data:responseHeaders}); 
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
    PHPLog.vm.$emit('request-debug', tmp);
    PHPLog.vm.$emit('add-request', {url: request.request.url, data:tmp, connect: PHPLog.portState}); 
  } else {
    if (PHPLog.portState == false) {
      PHPLog.vm.$emit('add-request', {connect: false});
    }
  }
});
