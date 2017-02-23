var PHPLog = {
  portState:false,
  panel: null,
  panelWindow: null,
  bus: null
};

// connect background.js
var port = chrome.runtime.connect({
  name: chrome.devtools.inspectedWindow.tabId.toString()
});
PHPLog.portState = true;
port.onMessage.addListener(function(data){
  if (data.msg == 'tabUpdate') {
    PHPLog.bus.$emit('tab-update', data);
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
    PHPLog.bus = panelWindow.bus;
  });
});

// init response after request
chrome.devtools.network.onRequestFinished.addListener(function(request){
  // alert('receive');
  var key = 'X-Wf-1-1-1-';
  
  var responseHeaders = request.response.headers;
  
  // 对于存在firephp的响应才发送
  for(var i in responseHeaders) {
    if (responseHeaders[i].name.indexOf('X-Wf-Protocol') >= 0) {
      // PHPLog.bus.$emit('request-debug', {url: request.request.url, data:responseHeaders}); 
      port.postMessage({"msg": "emit request", "data": responseHeaders});
      PHPLog.bus.$emit('add-request', {url: request.request.url, headers: responseHeaders, connect: PHPLog.portState});
      return true;
    }
  }
  if (PHPLog.portState == false) {
    PHPLog.bus.$emit('add-request', {connect: false});
  }
});
