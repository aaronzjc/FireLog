function showRequest(request) {
    document.write(JSON.stringify(request));
}

var ConsoleLog = {
    exception: function(meta, body) {
        return {
            "title": body['Message'],
            'type': 'exception',
            "table": [[
                {'type': 'number', 'val': meta['Line'], 'omit': false}, 
                {'type': 'string', 'val': meta['File'], 'omit': false},
                {'type': 'object', 'val': body['Trace'], 'omit': true}
            ]]
        };
        
    },
    table: function(meta, body) {
        var table = body[1];
        // 下面是将每个输出item转化为格式化的数据，方便打印
        for (var i in table) {
            for (var j in table[i]) {
                if (table[i][j] !== null) {
                    table[i][j] = {
                        type: typeof(table[i][j]),
                        val: table[i][j]
                    };
                    if (JSON.stringify(table[i][j]['val']).length > 200) {
                        table[i][j]['omit'] = true;
                    } else {
                        table[i][j]['omit'] = false;
                    }
                }
            }
        }
        // // document.write(JSON.stringify(table));
        return {
            "title": body[0],
            'type': 'table',
            "table": table
        };
    }
};

var bus = new Vue();

/**
Vue components
*/
var Modal = Vue.extend({
    template: '#modal',
    props: ['data', 'show', 'r', 'b', 'json'],
    methods: {
        closeModal: function() {
            bus.$emit('close-modal');
        }
    }
});

var vm = new Vue({
    el: '#app',
    data: {
        requests: [],

        jsonHTML: '',
        // 弹层的HTML内容
        isJson: false,
        // 弹层展示的数据是否是JSON
        modalHide: true,
        // 是否隐藏弹层
        right: 10,
        // 弹层位置。起初是想，初始化一个位置，后来发现算了。
        bottom: 10 // 弹层位置
    },
    created: function() {
        bus.$on('close-modal', this.closeModal);
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
        closeModal: function() {
            this.modalHide = true;
        },
        // 格式化数据
        render: function(data) {
            // document.write(data);
            data = JSON.parse(data); // 片段是JSON字符串，需要先解析
            /**
             * data => [[typeInfo], ["some intro info", [...]]]
             */
            switch (data[0]['Type']) {
            case 'INFO':
                break;
            case 'LOG':
                break;
            case 'WARN':
                break;
            case 'ERROR':
                break;
            case 'TRACE':
                break;
            case 'EXCEPTION':
                return ConsoleLog.exception(data[0], data[1]);
                break;
            case 'TABLE':
                return ConsoleLog.table(data[0], data[1]);
                break;
            }
            return false;
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
vm.$on('add-request',
function(data) {
    // alert('add-request');
    var item = [];
    var seeds = data['data'];
    // 排序
    seeds.sort(function(a, b) {
        return (a.index > b.index) ? 1 : -1;
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

    var map = {
        'url': data['url'],
        'collection': []
    };
    for (var i in item) {
        var formatData = this.render(item[i]);
        if (formatData != false) {
            map['collection'].push(formatData);
        }
    }
    this.requests.push(map);
});

vm.$on('tab-update',
function(data) {
    this.requests = [];

});

$(function() {
    var draggableDiv = $('.modal');
    draggableDiv.draggable({
        handle: $('.header', draggableDiv)
    });
});