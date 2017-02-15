function showRequest(request) {
  document.write(JSON.stringify(request));
}

var bus = new Vue();

/**
Vue components
*/
var Modal = Vue.extend({
  template: '#modal',
  props:['data', 'show', 'r', 'b', 'json'],
  methods: {
    closeModal: function () {
      bus.$emit('close-modal');
    }
  }
});

var vm = new Vue({
  el:'#app',
  data: {
    requests: [],

    jsonHTML: '',
    isJson: false,
    modalHide:true,
    right:10,
    bottom:10
  },
  created: function(){
    bus.$on('close-modal', this.closeModal);
  },
  mounted: function () {
    
  },
  methods: {
    // 清空
    trash: function() {
      this.requests = [];
    },
    // 刷新当前页面
    refresh: function() {
      chrome.devtools.inspectedWindow.reload();
    },
    // 关闭弹层
    closeModal: function () {
      this.modalHide = true;
    },
    // 格式化数据
    render: function(data) {
      data = JSON.parse(data); // 片段是JSON字符串，需要先解析

      /**
       * data => [[typeInfo], ["some intro info", [...]]]
       */
      var table = data[1][1];
      // 下面是将每个输出item转化为格式化的数据，方便打印
      for(var i in table) {
        for(var j in table[i]) {
          if (table[i][j] !== null) {
            table[i][j] = {type:typeof(table[i][j]), val:table[i][j]};
            if (JSON.stringify(table[i][j]['val']).length > 200) {
              table[i][j]['omit'] = true;
            } else {
              table[i][j]['omit'] = false;
            }
          }
        }
      }
      return {"title": data[1][0], "table": table};
    },
    // 表格收放
    toggleTable: function(event) {
      $(event.target).toggleClass("collapse");
      $(event.target).next("table").toggle();
    },
    // 查看日志详情
    showDetail: function(data, event) {
      // TODO: JSON beauty
      this.modalHide = false;

      var json_regex = /^\s*([\[\{].*[\}\]])\s*$/; 
      var is_json = json_regex.test(data);
      if (is_json) {
        var jsonFormatter = new JSONFormatter();
        this.jsonHTML = jsonFormatter.jsonToHTML(data, null, 'JSONViewer');
        this.isJson = true;
      } else {
        this.jsonHTML = data;
        this.isJson = false;
      }
    },
  },
  components: {
    'v-modal': Modal
  }
});

// 添加请求到面板
vm.$on('add-request', function(data) {
  // alert('add-request');
  var item = [];
  var seeds = data['data'];
  // 排序
  seeds.sort(function(a,b){
    return (a.index > b.index)?1:-1;
  });

  // 数据处理，将header片段拼接成完整的JSON段
  var json = '';
  for (var i in seeds) {
    if (seeds[i]['isFrag']) {
      json += seeds[i]['val'];
    } else {
      if (json != '') {
        item.push(json);
      }
      json = seeds[i]['val'];
    }
  }
  if (json != '') {
    item.push(json);
  }

  var map = {'url': data['url'], 'collection': []};
  for (var i in item) {
    map['collection'].push(this.render(item[i]));
  }
  // document.write(JSON.stringify(map));
  this.requests.push(map);
});

vm.$on('tab-update', function(data) {
  this.requests = [];

});

$(function() {
  var draggableDiv = $('.modal');
  draggableDiv.draggable({
    handle: $('.header', draggableDiv)
  });
});
