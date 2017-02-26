function showRequest(request) {
    document.write(JSON.stringify(request));
}

function renderJSON(data) {
    var json_regex = /^\s*([\[\{].*[\}\]])\s*$/;
    var is_json = json_regex.test(data);
    if (is_json) {
        var jsonFormatter = new JSONFormatter();
        var jsonHTML = jsonFormatter.jsonToHTML(data, null, 'JSONViewer');
        return {'isJson':true, 'data':jsonHTML};
    }
    return {'isJson':false,'data':data};
}

// 响应头数据解析
var ConsoleLog = {
    exception: function(meta, body) {
        return {
            "title": body['Message'],
            'type': 'exception',
            "table": [
                [
                    {'type': 'string', 'val': 'Line', 'omit': false}, 
                    {'type': 'string', 'val': 'File', 'omit': false},
                    {'type': 'string', 'val': 'Trace', 'omit': false}
                ],
                [
                    {'type': 'number', 'val': meta['Line'], 'omit': false}, 
                    {'type': 'string', 'val': meta['File'], 'omit': false},
                    {'type': 'object', 'val': body['Trace'], 'omit': true}
                ]
            ]
        };
        
    },
    table: function(meta, body) {
        var table = body[1];
        // 下面是将每个输出item转化为格式化的数据，方便打印
        for (var i in table) {
            for (var j in table[i]) {
                if (table[i][j] !== null) {
                    if (Array.isArray(table[i][j])) {
                        var type = 'array';
                    } else {
                        var type = typeof(table[i][j]);
                    }
                    table[i][j] = {
                        type: type,
                        val: table[i][j],
                        omit: false
                    };
                    if (JSON.stringify(table[i][j]['val']).length > 200) {
                        table[i][j]['omit'] = true;
                    }
                } else {
                    table[i][j] = {
                        type: "null",
                        val: table[i][j],
                        omit: false
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
    props: ['data', 'show', 'isJson', 'json'],
    data: function() {
        return {
            showTxt: false
        }
    },
    created: function() {
        this.showTxt = this.isJson;
    },
    watch: {
        data: function(newVal, oldVal) {
            if (newVal) {
                document.querySelector(".modal .body").innerHTML = newVal;
                if (this.isJson) {
                    prettyJSON();
                }
            }
        }
    },
    methods: {
        closeModal: function() {
            bus.$emit('close-modal');
        },
        copy: function() {
            this.showTxt = !this.showTxt;
            if (this.showTxt) {
                document.querySelector(".modal .body").innerHTML = JSON.stringify(this.json);
            } else {
                document.querySelector(".modal .body").innerHTML = this.data;
                prettyJSON();
            }
        },
    }
});

var vm = new Vue({
    el: '#app',
    data: {
        requests: [], // 请求
        debug: '', // 调试日志
        pause: false, // Tab刷新时是否阻止清空

        jsonHTML: '',
        // 弹层的HTML内容
        isJson: false,
        json:"",
        // 弹层展示的数据是否是JSON
        modalHide: true, // 是否隐藏弹层
        showTxt: false,
    },
    created: function() {
        bus.$on('close-modal', this.closeModal);
        bus.$on('tab-update', this.tabUpdate);
        bus.$on('add-request', this.addRequest);
        bus.$on('disconnect', this.disconnect);
        bus.$on('request-debug', this.debugLog);
        this.addRequest({"headers": [{"name":"Date","value":"Thu, 23 Feb 2017 15:24:07 GMT"},{"name":"Content-Encoding","value":"gzip"},{"name":"X-Wf-1-1-1-7","value":"|son\":\"{\\\"begin\\\":\\\"\\\",\\\"end\\\":\\\"\\\"}\",\"limit_money\":null,\"limit_city\":\"0\",\"limit_plat\":\"0\",\"begin_time\":\"2016-12-26 00:00:00\",\"end_time\":\"2017-02-09 00:00:00\",\"int_life_time\":\"5184000\",\"limit_total\":\"150\",\"person_limit\":\"2\",\"send_number\":\"108\",\"card_number\":\"0\",\"ex_number\":\"0\",\"... ...\":\"** More sub-items **\"},\"... ...\":\"** More sub-items **\"},\"2272156\":{\"id\":\"2272156\",\"user_id\":\"226462\",\"coupon_id\":\"2830\",\"coupon_json\":\"{\\\"id\\\":\\\"2830\\\",\\\"coupon_name\\\":\\\"200\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\\\",\\\"coupon_limit_des\\\":\\\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\\\",\\\"coupon_des\\\":\\\"\\u516c\\u53f8\\u5458\\u5de512\\u6708\\u798f\\u5229\\\",\\\"coupon_type\\\":\\\"2\\\",\\\"coupon_money\\\":\\\"200.00\\\",\\\"discount_percent\\\":null,\\\"limit_project_json\\\":\\\"\\\\\\\"\\\\\\\"\\\",\\\"limit_week_json\\\":\\\"\\\\\\\"\\\\\\\"\\\",\\\"limit_time_json\\\":\\\"{\\\\\\\"begin\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"end\\\\\\\":\\\\\\\"\\\\\\\"}\\\",\\\"limit_money\\\":null,\\\"limit_city\\\":\\\"0\\\",\\\"limit_plat\\\":\\\"0\\\",\\\"begin_time\\\":\\\"2016-12-26 00:00:00\\\",\\\"end_time\\\":\\\"2017-02-09 00:00:00\\\",\\\"int_life_time\\\":\\\"5184000\\\",\\\"limit_total\\\":\\\"150\\\",\\\"person_limit\\\":\\\"1\\\",\\\"send_number\\\":\\\"37\\\",\\\"card_number\\\":\\\"0\\\",\\\"ex_number\\\":\\\"0\\\",\\\"wx_card_id\\\":\\\"\\\",\\\"status\\\":\\\"1\\\",\\\"admin_id\\\":\\\"217\\\",\\\"manager_name\\\":\\\"\\u7ba1\\u7406\\u540e\\u53f0\\\",\\\"remark\\\":\\\"\\\",\\\"input_time\\\":\\\"2016-12-26 17:54:27\\\",\\\"update_time\\\":\\\"2017-01-03 10:15:44\\\",\\\"del_flag\\\":\\\"0\\\"}\",\"coupon_money\":\"200.00\",\"expire_time\":\"2017-03-04 23:59:59\",\"from_gift_id\":\"0\",\"from_coupon_card_id\":\"0\",\"from_gift_card_id\":\"0\",\"from_other\":\"\",\"from_order_id\":\"0\",\"used_json\":\"\",\"status\":\"0\",\"create_time\":\"2017-01-03 10:36:42\",\"used_time\":\"0000-00-00 00:00:00\",\"update_time\":\"2017-01-03 10:36:42\",\"del_flag\":\"0\",\"project\":{\"id\":0},\"source_type\":1,\"regulater\":{\"id\":0},\"coupon_info\":{\"id\":\"2830\",\"coupon_name\":\"200\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\",\"coupon_limit_des\":\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\",\"coupon_des\":\"\\u516c\\u53f8\\u5458\\u5de512\\u6708\\u798f\\u5229\",\"coupon_type\":\"2\",\"coupon_money\":\"200.00\",\"discount_percent\":\"0\",\"limit_project_json\":\"\\\"\\\"\",\"limit_week_json\":\"\\\"\\\"\",\"limit_time_json\":\"{\\\"begin\\\":\\\"\\\",\\\"end\\\":\\\"\\\"}\",\"limit_money\":\"0.00\",\"limit_city\":\"0\",\"limit_plat\":\"0\",\"begin_time\":\"2016-12-26 00:00:00\",\"end_time\":\"2017-02-09 23:59:59\",\"int_life_time\":\"5184000\",\"limit_total\":\"150\",\"person_limit\":\"1\",\"send_number\":\"65\",\"card_number\":\"0\",\"ex_number\":\"0\",\"... ...\":\"** More sub-items **\"},\"... ...\":\"** More sub-items **\"}},\"\\/WORK\\/HTML\\/testV2\\/_CUSTOM_CLASS\\/service\\/module2\\/OrderUser.class.php:4187\"],[\"uc-list-folder\",[{\"id\":\"2401644\",\"expire_time\":\"2017-04-17\",\"status\":\"0\",\"coupon_money\":\"200.00\",\"source_type\":1,\"number\":1,\"coupon_str\":\"\\uffe5200\",\"selected\":\"0\",\"coupon_name\":\"200\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\",\"coupon_limit_des\":\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\",\"coupon_des\":\"\\u516c\\u53f8\\u5458\\u5de501\\u6708\\u798f\\u5229\",\"coupon_type\":\"2\",\"discount_percent\":0,\"limit_money\":0,\"overdue\":0},{\"id\":\"2272156\",\"expire_time\":\"2017-03-04\",\"status\":\"0\",\"coupon_money\":\"200.00\",\"source_type\":1,\"number\":1,\"coupon_str\":\"\\uffe5200\",\"selected\":\"0\",\"coupon_name\":\"200\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\",\"coupon_limit_des\":\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\",\"coupon_des\":\"\\u516c\\u53f8\\u5458\\u5de512\\u6708\\u798f\\u5229\",\"coupon_type\":\"2\",\"discount_percent\":0,\"limit_money\":\"0.00\",\"overdue\":0},{\"id\":\"2401645\",\"expire_time\":\"2017-04-17\",\"status\":\"0\",\"coupon_money\":\"100.00\",\"source_type\":1,\"number\":2,\"coupon_str\":\"\\uffe5100\",\"selected\":\"0\",\"coupon_name\":\"100\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\",\"coupon_limit_des\":\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\",\"coupon_des\":\"\\u516c\\u53f8\\u5458\\u5de501\\u6708\\u798f\\u5229\",\"coupon_type\":\"2\",\"discount_percent\":0,\"limit_money\":0,\"overdue\":0},{\"id\":\"2272160\",\"expire_time\":\"2017-03-04\",\"status\":\"0\",\"coupon_money\":\"100.00\",\"source_type\":1,\"number\":2,\"coupon_str\":\"\\uffe5100\",\"selected\":\"0\",\"coupon_name\":\"100\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\",\"coupon_limit_des\":\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\",\"coupon_des\":\"\\u516c\\u53f8\\u5458\\u5de512\\u6708\\u798f\\u5229\",\"coupon_type\":\"2\",\"discount_percent\":0,\"limit_money\":0,\"overdue\":0}],\"\\/WORK\\/HTML\\/testV2\\/_CUSTOM_CLASS\\/service\\/module2\\/OrderUser.class.php:4213\"]]]]|"},{"name":"X-Wf-1-Structure-1","value":"http://meta.firephp.org/Wildfire/Structure/FirePHP/FirebugConsole/0.1"},{"name":"X-Wf-1-1-1-11","value":"3725|[{\"Type\":\"TABLE\",\"File\":\"\",\"Line\":\"\"},[\"7 Cache queries took 0.001008 seconds\",[[\"Server\",\"Cache Key\",\"Time\",\"Method\",\"Results\"],[\"127.0.0.1:11212\",\"default_BaseModel_Cache_user_226462\",0.000331,\"get\",{\"id\":\"226462\",\"username\":\"baidushangmen#1199028179\",\"nickname\":\"\\u5f20\\u8fdb\\u7a0b\",\"chubao_user\":\"\",\"mobile\":\"18612181354\",\"passwd\":\"VlACBgZsUwdRUgcYBUwHOFANV30HfgF6VSlTcAR9AihcdFJ+VS9WKQ==\",\"unionid\":\"onJBPt8JPWdKLyiJv5U7T7RCaEV8\",\"city_id\":\"2\",\"gander\":\"0\",\"birth_year\":\"0\",\"headimg\":\"http:\\/\\/wx.qlogo.cn\\/mmopen\\/jWpKgE5LabhxVXJia6jFQCFAbOBg3JxXibxqLaDyM1ZUVph1aXKHUOibX7qhoOlr546OxehZ68XfgichENp8NFfwtIvO3SeLibNKN\\/0\",\"invite_user_id\":\"0\",\"invite_code\":\"\",\"regist_time\":\"2015-07-11 19:05:10\",\"is_proxy\":\"0\",\"is_test\":\"0\",\"is_vip\":\"21\",\"regist_platform\":\"22\",\"marketing_code\":\"\",\"popularize_code\":\"0\",\"popularize_time\":\"0000-00-00 00:00:00\",\"... ...\":\"** More sub-items **\"}],[\"127.0.0.1:11212\",\"default_BaseModel_Cache_city_2\",0.000104,\"get\",{\"id\":\"2\",\"pid\":\"1\",\"name\":\"\\u5317\\u4eac\",\"baidu_name\":\"\\u5317\\u4eac\\u5e02\",\"weixin_name\":\"\\u5317\\u4eac\",\"type\":\"\",\"l_lng\":\"116.403549194336\",\"l_lat\":\"39.914714813232\",\"limit_km\":\"4.5\",\"limit_before_minutes\":\"60\",\"limit_after_minutes\":\"60\",\"num\":\"16\",\"createdate\":\"2015-03-28 18:25:52\",\"updatedate\":\"2015-03-28 18:25:52\",\"update_time\":\"2015-07-08 13:46:11\",\"del_flag\":\"0\",\"remark\":\"\"}],[\"127.0.0.1:11212\",\"default_BaiduMap_getRange_116.403549194336_39.914714813232_50000\",0.000127,\"get\",{\"min_lat\":39.4655648296,\"max_lat\":40.3638647969,\"min_lng\":115.817956292,\"max_lng\":116.989142097}],[\"127.0.0.1:11212\",\"default_Widget_raw.tech_psychic\",9.5e-5,\"get\",{\"mobile\":\"\",\"app\":\"10001\",\"api\":\"11\",\"jishi\":\"\"}],[\"127.0.0.1:11212\",\"default_CALLER_TOKEN_WWW_USER_226462\",9.2e-5,\"get\",\"{\\\"token\\\":\\\"\\\",\\\"success\\\":1,\\\"data\\\":{\\\"token\\\":\\\"619404e64690f6603665\\\"},\\\"sign\\\":null}\"],[\"127.0.0.1:11212\",\"default_BaseModel_Cache_order_user_1569074\",0.000133,\"get\",{\"id\":\"1569074\",\"order_no\":\"U170223215023226462\",\"order_type\":\"0\",\"order_relid\":\"0\",\"pay_type\":\"\",\"order_source\":\"0\",\"order_status\":\"0\",\"user_id\":\"226462\",\"user_json\":\"{\\\"id\\\":\\\"226462\\\",\\\"mobile\\\":\\\"18612181354\\\",\\\"nickname\\\":\\\"\\u5f20\\u8fdb\\u7a0b\\\",\\\"city\\\":\\\"\\u5317\\u4eac\\\",\\\"unionid\\\":\\\"onJBPt8JPWdKLyiJv5U7T7RCaEV8\\\"}\",\"isfirst\":\"0\",\"user_note\":\"\",\"user_address_id\":\"98740\",\"city_id\":\"2\",\"district_id\":\"0\",\"location\":\"\\u5916\\u9986\\u4e1c\\u885751\\u53f7\\u51ef\\u666f\\u94ed\\u5ea7\\u5927\\u53a6\",\"address\":\"\\u5b9c\\u751f\\u5230\\u5bb6\\u529e\\u516c\\u5ba4\",\"l_lng\":\"116.410255432129\",\"l_lat\":\"39.968681335449\",\"begin_time\":\"2017-02-24 13:00:00\",\"contact_name\":\"\\u5f20\\u8fdb\\u7a0b\",\"contact_phone\":\"18612181354\",\"... ...\":\"** More sub-items **\"}],[\"127.0.0.1:11212\",\"default_BaseModel_Cache_project_225\",0.000126,\"get\",{\"id\":\"225\",\"old_id\":\"0\",\"state\":\"1\",\"city_id\":\"2\",\"name\":\"\\u674e\\u5f66\\u5b8f\\u540c\\u6b3e\\u63a8\\u62ff\",\"type\":\"1\",\"category_id\":\"1\",\"time_span\":\"{\\\"1\\\":0,\\\"2\\\":0,\\\"3\\\":0,\\\"4\\\":0,\\\"5\\\":0,\\\"6\\\":0,\\\"7\\\":0,\\\"8\\\":0,\\\"9\\\":0,\\\"10\\\":0,\\\"11\\\":0,\\\"12\\\":0,\\\"13\\\":0,\\\"14\\\":0,\\\"15\\\":0,\\\"16\\\":0,\\\"17\\\":0,\\\"18\\\":0,\\\"19\\\":0,\\\"20\\\":0,\\\"21\\\":0,\\\"22\\\":0,\\\"23\\\":0,\\\"24\\\":0,\\\"25\\\":0,\\\"26\\\":0,\\\"27\\\":0,\\\"28\\\":20,\\\"29\\\":30,\\\"30\\\":40}\",\"use_coupon\":\"1\",\"sort_rank\":\"2\",\"offline_price\":\"198.00\",\"online_price\":\"158.00\",\"limit_min_cash\":\"100\",\"limit_min_number\":\"1\",\"regulater_cost\":\"110.00\",\"service_minutes\":\"60\",\"image_logo\":\"20160722\\/db8a1324da24ab79dcf80494d32a1046.jpg\",\"image_cover\":\"20150808\\/fd\\/fd1a5e5d1242adb522bd1cdb6b13285e.jpg\",\"cover_sliders\":\"[\\\"20160722\\/5ce188179e6634c1462f4a301c8c9023.jpg\\\"]\",\"equipment\":\"\\u4e00\\u6b21\\u6027\\u5851\\u5c01\\u888b\\u5185\\u88c5\\uff1a\\u53e3\\u7f691\\u4e2a\\u3001\\u8f7b\\u8584\\u5e8a\\u53551\\u5f20\\u3001\\u6309\\u6469\\u5dfe1\\u5f20\\u3002\",\"show_fuwuzishi\":\"\\u5367\\u59ff\",\"... ...\":\"** More sub-items **\"}]]]]|"},{"name":"X-Wf-1-1-1-6","value":"|status\\\":\\\"1\\\",\\\"admin_id\\\":\\\"174\\\",\\\"manager_name\\\":\\\"\\u7ba1\\u7406\\u540e\\u53f0\\\",\\\"remark\\\":\\\"\\\",\\\"input_time\\\":\\\"2017-01-24 11:02:56\\\",\\\"update_time\\\":\\\"2017-02-16 17:27:53\\\",\\\"del_flag\\\":\\\"0\\\"}\",\"coupon_money\":\"100.00\",\"expire_time\":\"2017-04-17 23:59:59\",\"from_gift_id\":\"0\",\"from_coupon_card_id\":\"0\",\"from_gift_card_id\":\"0\",\"from_other\":\"\",\"from_order_id\":\"0\",\"used_json\":\"[\\\"1569068\\\"]\",\"status\":\"0\",\"create_time\":\"2017-02-16 17:27:58\",\"used_time\":\"0000-00-00 00:00:00\",\"update_time\":\"2017-02-23 20:06:57\",\"del_flag\":\"0\",\"project\":{\"id\":0},\"source_type\":1,\"regulater\":{\"id\":0},\"coupon_info\":{\"id\":\"2878\",\"coupon_name\":\"100\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\",\"coupon_limit_des\":\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\",\"coupon_des\":\"\\u516c\\u53f8\\u5458\\u5de501\\u6708\\u798f\\u5229\",\"coupon_type\":\"2\",\"coupon_money\":\"100.00\",\"discount_percent\":null,\"limit_project_json\":\"\\\"\\\"\",\"limit_week_json\":\"\\\"\\\"\",\"limit_time_json\":\"{\\\"begin\\\":\\\"\\\",\\\"end\\\":\\\"\\\"}\",\"limit_money\":null,\"limit_city\":\"0\",\"limit_plat\":\"0\",\"begin_time\":\"2017-01-24 00:00:00\",\"end_time\":\"2017-03-10 00:00:00\",\"int_life_time\":\"5184000\",\"limit_total\":\"150\",\"person_limit\":\"2\",\"send_number\":\"83\",\"card_number\":\"0\",\"ex_number\":\"0\",\"... ...\":\"** More sub-items **\"},\"... ...\":\"** More sub-items **\"},\"2272160\":{\"id\":\"2272160\",\"user_id\":\"226462\",\"coupon_id\":\"2831\",\"coupon_json\":\"{\\\"id\\\":\\\"2831\\\",\\\"coupon_name\\\":\\\"100\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\\\",\\\"coupon_limit_des\\\":\\\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\\\",\\\"coupon_des\\\":\\\"\\u516c\\u53f8\\u5458\\u5de512\\u6708\\u798f\\u5229\\\",\\\"coupon_type\\\":\\\"2\\\",\\\"coupon_money\\\":\\\"100.00\\\",\\\"discount_percent\\\":null,\\\"limit_project_json\\\":\\\"\\\"\\\"\\\",\\\"limit_week_json\\\":\\\"\\\"\\\"\\\",\\\"limit_time_json\\\":\\\"{\\\"begin\\\":\\\"\\\",\\\"end\\\":\\\"\\\"}\\\",\\\"limit_money\\\":null,\\\"limit_city\\\":\\\"0\\\",\\\"limit_plat\\\":\\\"0\\\",\\\"begin_time\\\":\\\"2016-12-26 00:00:00\\\",\\\"end_time\\\":\\\"2017-02-09 00:00:00\\\",\\\"int_life_time\\\":\\\"5184000\\\",\\\"limit_total\\\":\\\"150\\\",\\\"person_limit\\\":\\\"2\\\",\\\"send_number\\\":\\\"63\\\",\\\"card_number\\\":\\\"0\\\",\\\"ex_number\\\":\\\"0\\\",\\\"wx_card_id\\\":\\\"\\\",\\\"status\\\":\\\"1\\\",\\\"admin_id\\\":\\\"217\\\",\\\"manager_name\\\":\\\"\\u7ba1\\u7406\\u540e\\u53f0\\\",\\\"remark\\\":\\\"\\\",\\\"input_time\\\":\\\"2016-12-26 17:54:27\\\",\\\"update_time\\\":\\\"2017-01-03 10:37:28\\\",\\\"del_flag\\\":\\\"0\\\"}\",\"coupon_money\":\"100.00\",\"expire_time\":\"2017-03-04 23:59:59\",\"from_gift_id\":\"0\",\"from_coupon_card_id\":\"0\",\"from_gift_card_id\":\"0\",\"from_other\":\"\",\"from_order_id\":\"0\",\"used_json\":\"[\\\"1569071\\\"]\",\"status\":\"0\",\"create_time\":\"2017-01-03 10:39:38\",\"used_time\":\"2017-02-23 18:42:35\",\"update_time\":\"2017-02-23 20:11:48\",\"del_flag\":\"0\",\"project\":{\"id\":0},\"source_type\":1,\"regulater\":{\"id\":0},\"coupon_info\":{\"id\":\"2831\",\"coupon_name\":\"100\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\",\"coupon_limit_des\":\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\",\"coupon_des\":\"\\u516c\\u53f8\\u5458\\u5de512\\u6708\\u798f\\u5229\",\"coupon_type\":\"2\",\"coupon_money\":\"100.00\",\"discount_percent\":null,\"limit_project_json\":\"\\\"\\\"\",\"limit_week_json\":\"\\\"\\\"\",\"limit_time_json\":\"{\\\"begin\\\":\\\"\\\",\\\"end\\\":\\\"\\\"}\",\"limit_money\":null,\"limit_city\":\"0\",\"limit_plat\":\"0\",\"begin_time\":\"2016-12-26 00:00:00\",\"end_time\":\"2017-02-09 00:00:00\",\"int_life_time\":\"5184000\",\"limit_total\":\"150\",\"person_limit\":\"2\",\"send_number\":\"108\",\"card_number\":\"0\",\"ex_number\":\"0\",\"... ...\":\"** More sub-items **\"},\"... ...\":\"** More sub-items **\"},\"2272158\":{\"id\":\"2272158\",\"user_id\":\"226462\",\"coupon_id\":\"2831\",\"coupon_json\":\"{\\\"id\\\":\\\"2831\\\",\\\"coupon_name\\\":\\\"100\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\\\",\\\"coupon_limit_des\\\":\\\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\\\",\\\"coupon_des\\\":\\\"\\u516c\\u53f8\\u5458\\u5de512\\u6708\\u798f\\u5229\\\",\\\"coupon_type\\\":\\\"2\\\",\\\"coupon_money\\\":\\\"100.00\\\",\\\"discount_percent\\\":null,\\\"limit_project_json\\\":\\\"\\\"\\\"\\\",\\\"limit_week_json\\\":\\\"\\\"\\\"\\\",\\\"limit_time_json\\\":\\\"{\\\"begin\\\":\\\"\\\",\\\"end\\\":\\\"\\\"}\\\",\\\"limit_money\\\":null,\\\"limit_city\\\":\\\"0\\\",\\\"limit_plat\\\":\\\"0\\\",\\\"begin_time\\\":\\\"2016-12-26 00:00:00\\\",\\\"end_time\\\":\\\"2017-02-09 00:00:00\\\",\\\"int_life_time\\\":\\\"5184000\\\",\\\"limit_total\\\":\\\"150\\\",\\\"person_limit\\\":\\\"2\\\",\\\"send_number\\\":\\\"62\\\",\\\"card_number\\\":\\\"0\\\",\\\"ex_number\\\":\\\"0\\\",\\\"wx_card_id\\\":\\\"\\\",\\\"status\\\":\\\"1\\\",\\\"admin_id\\\":\\\"217\\\",\\\"manager_name\\\":\\\"\\u7ba1\\u7406\\u540e\\u53f0\\\",\\\"remark\\\":\\\"\\\",\\\"input_time\\\":\\\"2016-12-26 17:54:27\\\",\\\"update_time\\\":\\\"2017-01-03 10:16:35\\\",\\\"del_flag\\\":\\\"0\\\"}\",\"coupon_money\":\"100.00\",\"expire_time\":\"2017-03-04 23:59:59\",\"from_gift_id\":\"0\",\"from_coupon_card_id\":\"0\",\"from_gift_card_id\":\"0\",\"from_other\":\"\",\"from_order_id\":\"0\",\"used_json\":\"\",\"status\":\"0\",\"create_time\":\"2017-01-03 10:37:28\",\"used_time\":\"2017-02-23 18:31:36\",\"update_time\":\"2017-02-23 19:54:32\",\"del_flag\":\"0\",\"project\":{\"id\":0},\"source_type\":1,\"regulater\":{\"id\":0},\"coupon_info\":{\"id\":\"2831\",\"coupon_name\":\"100\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\",\"coupon_limit_des\":\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\",\"coupon_des\":\"\\u516c\\u53f8\\u5458\\u5de512\\u6708\\u798f\\u5229\",\"coupon_type\":\"2\",\"coupon_money\":\"100.00\",\"discount_percent\":null,\"limit_project_json\":\"\\\"\\\"\",\"limit_week_json\":\"\\\"\\\"\",\"limit_time_j|\\"},{"name":"X-Wf-1-1-1-1","value":"107|[{\"Type\":\"TABLE\",\"File\":\"\",\"Line\":\"\"},[\"This Page Spend Times 0.053448\",[[\"Description\",\"Time\",\"Caller\"]]]]|"},{"name":"X-Wf-1-1-1-3","value":"|iscount_percent\\\":null,\\\"limit_project_json\\\":\\\"\\\"\\\"\\\",\\\"limit_week_json\\\":\\\"\\\"\\\"\\\",\\\"limit_time_json\\\":\\\"{\\\"begin\\\":\\\"\\\",\\\"end\\\":\\\"\\\"}\\\",\\\"limit_money\\\":null,\\\"limit_city\\\":\\\"0\\\",\\\"limit_plat\\\":\\\"0\\\",\\\"begin_time\\\":\\\"2017-01-24 00:00:00\\\",\\\"end_time\\\":\\\"2017-03-10 00:00:00\\\",\\\"int_life_time\\\":\\\"5184000\\\",\\\"limit_total\\\":\\\"150\\\",\\\"person_limit\\\":\\\"2\\\",\\\"send_number\\\":\\\"78\\\",\\\"card_number\\\":\\\"0\\\",\\\"ex_number\\\":\\\"0\\\",\\\"wx_card_id\\\":\\\"\\\",\\\"status\\\":\\\"1\\\",\\\"admin_id\\\":\\\"174\\\",\\\"manager_name\\\":\\\"\\u7ba1\\u7406\\u540e\\u53f0\\\",\\\"remark\\\":\\\"\\\",\\\"input_time\\\":\\\"2017-01-24 11:02:56\\\",\\\"update_time\\\":\\\"2017-02-16 10:24:04\\\",\\\"del_flag\\\":\\\"0\\\"}\",\"coupon_money\":\"100.00\",\"expire_time\":\"2017-04-17 23:59:59\",\"from_gift_id\":\"0\",\"from_coupon_card_id\":\"0\",\"from_gift_card_id\":\"0\",\"from_other\":\"\",\"from_order_id\":\"0\",\"used_json\":\"[\\\"1569074\\\"]\",\"status\":\"0\",\"create_time\":\"2017-02-16 17:27:53\",\"used_time\":\"0000-00-00 00:00:00\",\"update_time\":\"2017-02-23 21:50:24\",\"del_flag\":\"0\",\"project\":{\"id\":0},\"source_type\":1,\"regulater\":{\"id\":0},\"coupon_info\":{\"id\":\"2878\",\"coupon_name\":\"100\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\",\"coupon_limit_des\":\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\",\"coupon_des\":\"\\u516c\\u53f8\\u5458\\u5de501\\u6708\\u798f\\u5229\",\"coupon_type\":\"2\",\"coupon_money\":\"100.00\",\"discount_percent\":null,\"limit_project_json\":\"\\\"\\\"\",\"limit_week_json\":\"\\\"\\\"\",\"limit_time_json\":\"{\\\"begin\\\":\\\"\\\",\\\"end\\\":\\\"\\\"}\",\"limit_money\":null,\"limit_city\":\"0\",\"limit_plat\":\"0\",\"begin_time\":\"2017-01-24 00:00:00\",\"end_time\":\"2017-03-10 00:00:00\",\"int_life_time\":\"5184000\",\"limit_total\":\"150\",\"person_limit\":\"2\",\"send_number\":\"83\",\"card_number\":\"0\",\"ex_number\":\"0\",\"... ...\":\"** More sub-items **\"},\"... ...\":\"** More sub-items **\"},\"2401646\":{\"id\":\"2401646\",\"user_id\":\"226462\",\"coupon_id\":\"2878\",\"coupon_json\":\"{\\\"id\\\":\\\"2878\\\",\\\"coupon_name\\\":\\\"100\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\\\",\\\"coupon_limit_des\\\":\\\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\\\",\\\"coupon_des\\\":\\\"\\u516c\\u53f8\\u5458\\u5de501\\u6708\\u798f\\u5229\\\",\\\"coupon_type\\\":\\\"2\\\",\\\"coupon_money\\\":\\\"100.00\\\",\\\"discount_percent\\\":null,\\\"limit_project_json\\\":\\\"\\\"\\\"\\\",\\\"limit_week_json\\\":\\\"\\\"\\\"\\\",\\\"limit_time_json\\\":\\\"{\\\"begin\\\":\\\"\\\",\\\"end\\\":\\\"\\\"}\\\",\\\"limit_money\\\":null,\\\"limit_city\\\":\\\"0\\\",\\\"limit_plat\\\":\\\"0\\\",\\\"begin_time\\\":\\\"2017-01-24 00:00:00\\\",\\\"end_time\\\":\\\"2017-03-10 00:00:00\\\",\\\"int_life_time\\\":\\\"5184000\\\",\\\"limit_total\\\":\\\"150\\\",\\\"person_limit\\\":\\\"2\\\",\\\"send_number\\\":\\\"79\\\",\\\"card_number\\\":\\\"0\\\",\\\"ex_number\\\":\\\"0\\\",\\\"wx_card_id\\\":\\\"\\\",\\\"status\\\":\\\"1\\\",\\\"admin_id\\\":\\\"174\\\",\\\"manager_name\\\":\\\"\\u7ba1\\u7406\\u540e\\u53f0\\\",\\\"remark\\\":\\\"\\\",\\\"input_time\\\":\\\"2017-01-24 11:02:56\\\",\\\"update_time\\\":\\\"2017-02-16 17:27:53\\\",\\\"del_flag\\\":\\\"0\\\"}\",\"coupon_money\":\"100.00\",\"expire_time\":\"2017-04-17 23:59:59\",\"from_gift_id\":\"0\",\"from_coupon_card_id\":\"0\",\"from_gift_card_id\":\"0\",\"from_other\":\"\",\"from_order_id\":\"0\",\"used_json\":\"[\\\"1569068\\\"]\",\"status\":\"0\",\"create_time\":\"2017-02-16 17:27:58\",\"used_time\":\"0000-00-00 00:00:00\",\"update_time\":\"2017-02-23 20:06:57\",\"del_flag\":\"0\",\"project\":{\"id\":0},\"source_type\":1,\"regulater\":{\"id\":0},\"coupon_info\":{\"id\":\"2878\",\"coupon_name\":\"100\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\",\"coupon_limit_des\":\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\",\"coupon_des\":\"\\u516c\\u53f8\\u5458\\u5de501\\u6708\\u798f\\u5229\",\"coupon_type\":\"2\",\"coupon_money\":\"100.00\",\"discount_percent\":null,\"limit_project_json\":\"\\\"\\\"\",\"limit_week_json\":\"\\\"\\\"\",\"limit_time_json\":\"{\\\"begin\\\":\\\"\\\",\\\"end\\\":\\\"\\\"}\",\"limit_money\":null,\"limit_city\":\"0\",\"limit_plat\":\"0\",\"begin_time\":\"2017-01-24 00:00:00\",\"end_time\":\"2017-03-10 00:00:00\",\"int_life_time\":\"5184000\",\"limit_total\":\"150\",\"person_limit\":\"2\",\"send_number\":\"83\",\"card_number\":\"0\",\"ex_number\":\"0\",\"... ...\":\"** More sub-items **\"},\"... ...\":\"** More sub-items **\"},\"2272160\":{\"id\":\"2272160\",\"user_id\":\"226462\",\"coupon_id\":\"2831\",\"coupon_json\":\"{\\\"id\\\":\\\"2831\\\",\\\"coupon_name\\\":\\\"100\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\\\",\\\"coupon_limit_des\\\":\\\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\\\",\\\"coupon_des\\\":\\\"\\u516c\\u53f8\\u5458\\u5de512\\u6708\\u798f\\u5229\\\",\\\"coupon_type\\\":\\\"2\\\",\\\"coupon_money\\\":\\\"100.00\\\",\\\"discount_percent\\\":null,\\\"limit_project_json\\\":\\\"\\\"\\\"\\\",\\\"limit_week_json\\\":\\\"\\\"\\\"\\\",\\\"limit_time_json\\\":\\\"{\\\"begin\\\":\\\"\\\",\\\"end\\\":\\\"\\\"}\\\",\\\"limit_money\\\":null,\\\"limit_city\\\":\\\"0\\\",\\\"limit_plat\\\":\\\"0\\\",\\\"begin_time\\\":\\\"2016-12-26 00:00:00\\\",\\\"end_time\\\":\\\"2017-02-09 00:00:00\\\",\\\"int_life_time\\\":\\\"5184000\\\",\\\"limit_total\\\":\\\"150\\\",\\\"person_limit\\\":\\\"2\\\",\\\"send_number\\\":\\\"63\\\",\\\"card_number\\\":\\\"0\\\",\\\"ex_number\\\":\\\"0\\\",\\\"wx_card_id\\\":\\\"\\\",\\\"status\\\":\\\"1\\\",\\\"admin_id\\\":\\\"217\\\",\\\"manager_name\\\":\\\"\\u7ba1\\u7406\\u540e\\u53f0\\\",\\\"remark\\\":\\\"\\\",\\\"input_time\\\":\\\"2016-12-26 17:54:27\\\",\\\"update_time\\\":\\\"2017-01-03 10:37:28\\\",\\\"del_flag\\\":\\\"0\\\"}\",\"coupon_money\":\"100.00\",\"expire_time\":\"2017-03-04 23:59:59\",\"from_gift_id\":\"0\",\"from_coupon_card_id\":\"0\",\"from_gift_card_id\":\"0\",\"from_other\":\"\",\"from_order_id\":\"0\",\"used_json\":\"[\\\"1569071\\\"]\",\"status\":\"0\",\"create_time\":\"2017-01-03 10:39:38\",\"used_time\":\"2017-02-23 18:|\\"},{"name":"X-Wf-1-1-1-2","value":"29177|[{\"Type\":\"TABLE\",\"File\":\"\",\"Line\":\"\"},[\"Custom Log Object 13\",[[\"Label\",\"Results\",\"Caller\"],[\"[\\u4e34\\u65f6\\u8c03\\u8bd5]\",{\"orderid\":1569074},\"\\/WORK\\/HTML\\/testV2\\/_CUSTOM_CLASS\\/service\\/module2\\/OrderUser.class.php:217\"],[\"id\",1569074,\"\\/WORK\\/HTML\\/testV2\\/_CUSTOM_CLASS\\/service\\/module2\\/OrderUser.class.php:226\"],[\"[\\u4e34\\u65f6\\u8c03\\u8bd5]\",{\"id\":\"1569074\",\"order_no\":\"U170223215023226462\",\"order_type\":\"0\",\"order_relid\":\"0\",\"pay_type\":\"\",\"order_source\":\"0\",\"order_status\":\"0\",\"user_id\":\"226462\",\"user_json\":\"{\\\"id\\\":\\\"226462\\\",\\\"mobile\\\":\\\"18612181354\\\",\\\"nickname\\\":\\\"\\u5f20\\u8fdb\\u7a0b\\\",\\\"city\\\":\\\"\\u5317\\u4eac\\\",\\\"unionid\\\":\\\"onJBPt8JPWdKLyiJv5U7T7RCaEV8\\\"}\",\"isfirst\":\"0\",\"user_note\":\"\",\"user_address_id\":\"98740\",\"city_id\":\"2\",\"district_id\":\"0\",\"location\":\"\\u5916\\u9986\\u4e1c\\u885751\\u53f7\\u51ef\\u666f\\u94ed\\u5ea7\\u5927\\u53a6\",\"address\":\"\\u5b9c\\u751f\\u5230\\u5bb6\\u529e\\u516c\\u5ba4\",\"l_lng\":\"116.410255432129\",\"l_lat\":\"39.968681335449\",\"begin_time\":\"2017-02-24 13:00:00\",\"contact_name\":\"\\u5f20\\u8fdb\\u7a0b\",\"contact_phone\":\"18612181354\",\"... ...\":\"** More sub-items **\"},\"\\/WORK\\/HTML\\/testV2\\/_CUSTOM_CLASS\\/service\\/BaseService.class.php:284\"],[\"[\\u4e34\\u65f6\\u8c03\\u8bd5]\",{\"id\":\"1585039\",\"user_id\":\"226462\",\"order_mode\":\"0\",\"order_id\":\"1569074\",\"order_no\":\"U170223215023226462\",\"project_id\":\"225\",\"project_json\":\"{\\\"name\\\":\\\"\\u674e\\u5f66\\u5b8f\\u540c\\u6b3e\\u63a8\\u62ff\\\",\\\"id\\\":\\\"225\\\",\\\"city\\\":\\\"\\u5317\\u4eac\\\",\\\"online_price\\\":\\\"158.00\\\",\\\"regulater_cost\\\":\\\"110.00\\\"}\",\"regulater_id\":\"1234715\",\"regulater_json\":\"{\\\"mobile\\\":\\\"18911575689\\\",\\\"name\\\":\\\"\\u5218\\u5f66\\u6606\\\",\\\"city\\\":\\\"\\u5317\\u4eac\\\",\\\"empcode\\\":\\\"2019\\\",\\\"location\\\":\\\"\\u5730\\u94c110\\u53f7\\u7ebf; \\u5730\\u94c113\\u53f7\\u7ebf\\u77e5\\u6625\\u8def\\\"}\",\"order_detail_status\":\"0\",\"price_original\":\"158.00\",\"price_final\":\"158.00\",\"regulater_income\":\"110.00\",\"coupon_id\":\"0\",\"begin_time\":\"2017-02-24 13:00:00\",\"end_time\":\"2017-02-24 14:00:00\",\"real_begin_time\":\"0000-00-00 00:00:00\",\"real_end_time\":\"0000-00-00 00:00:00\",\"user_score\":\"0\",\"simulate\":\"\",\"create_time\":\"2017-02-23 21:50:23\",\"... ...\":\"** More sub-items **\"},\"\\/WORK\\/HTML\\/testV2\\/_CUSTOM_CLASS\\/service\\/BaseService.class.php:284\"],[\"couponlist\",[],\"\\/WORK\\/HTML\\/testV2\\/_CUSTOM_CLASS\\/model\\/UserCouponRegulaterDetail.class.php:104\"],[\"rc-list\",[],\"\\/WORK\\/HTML\\/testV2\\/_CUSTOM_CLASS\\/service\\/module2\\/OrderUser.class.php:4155\"],[\"rc-list-sort\",null,\"\\/WORK\\/HTML\\/testV2\\/_CUSTOM_CLASS\\/service\\/module2\\/OrderUser.class.php:4173\"],[\"[\\u4e34\\u65f6\\u8c03\\u8bd5]\",1,\"\\/WORK\\/HTML\\/testV2\\/_CUSTOM_CLASS\\/model\\/UserCouponDetail.class.php:190\"],[\"couponlist\",{\"2401644\":{\"id\":\"2401644\",\"user_id\":\"226462\",\"coupon_id\":\"2877\",\"coupon_json\":\"{\\\"id\\\":\\\"2877\\\",\\\"coupon_name\\\":\\\"200\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\\\",\\\"coupon_limit_des\\\":\\\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\\\",\\\"coupon_des\\\":\\\"\\u516c\\u53f8\\u5458\\u5de501\\u6708\\u798f\\u5229\\\",\\\"coupon_type\\\":\\\"2\\\",\\\"coupon_money\\\":\\\"200.00\\\",\\\"discount_percent\\\":null,\\\"limit_project_json\\\":\\\"\\\\\\\"\\\\\\\"\\\",\\\"limit_week_json\\\":\\\"\\\\\\\"\\\\\\\"\\\",\\\"limit_time_json\\\":\\\"{\\\\\\\"begin\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"end\\\\\\\":\\\\\\\"\\\\\\\"}\\\",\\\"limit_money\\\":null,\\\"limit_city\\\":\\\"0\\\",\\\"limit_plat\\\":\\\"0\\\",\\\"begin_time\\\":\\\"2017-01-24 00:00:00\\\",\\\"end_time\\\":\\\"2017-03-10 00:00:00\\\",\\\"int_life_time\\\":\\\"5184000\\\",\\\"limit_total\\\":\\\"150\\\",\\\"person_limit\\\":\\\"1\\\",\\\"send_number\\\":\\\"44\\\",\\\"card_number\\\":\\\"0\\\",\\\"ex_number\\\":\\\"0\\\",\\\"wx_card_id\\\":\\\"\\\",\\\"status\\\":\\\"1\\\",\\\"admin_id\\\":\\\"174\\\",\\\"manager_name\\\":\\\"\\u7ba1\\u7406\\u540e\\u53f0\\\",\\\"remark\\\":\\\"\\\",\\\"input_time\\\":\\\"2017-01-24 11:02:56\\\",\\\"update_time\\\":\\\"2017-02-16 10:23:08\\\",\\\"del_flag\\\":\\\"0\\\"}\",\"coupon_money\":\"200.00\",\"expire_time\":\"2017-04-17 23:59:59\",\"from_gift_id\":\"0\",\"from_coupon_card_id\":\"0\",\"from_gift_card_id\":\"0\",\"from_other\":\"\",\"from_order_id\":\"0\",\"used_json\":\"\",\"status\":\"0\",\"create_time\":\"2017-02-16 17:27:36\",\"used_time\":\"0000-00-00 00:00:00\",\"update_time\":\"2017-02-16 17:27:36\",\"del_flag\":\"0\",\"project\":{\"id\":0},\"source_type\":1,\"regulater\":{\"id\":0},\"coupon_info\":{\"id\":\"2877\",\"coupon_name\":\"200\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\",\"coupon_limit_des\":\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\",\"coupon_des\":\"\\u516c\\u53f8\\u5458\\u5de501\\u6708\\u798f\\u5229\",\"coupon_type\":\"2\",\"coupon_money\":\"200.00\",\"discount_percent\":null,\"limit_project_json\":\"\\\"\\\"\",\"limit_week_json\":\"\\\"\\\"\",\"limit_time_json\":\"{\\\"begin\\\":\\\"\\\",\\\"end\\\":\\\"\\\"}\",\"limit_money\":null,\"limit_city\":\"0\",\"limit_plat\":\"0\",\"begin_time\":\"2017-01-24 00:00:00\",\"end_time\":\"2017-03-10 00:00:00\",\"int_life_time\":\"5184000\",\"limit_total\":\"150\",\"person_limit\":\"1\",\"send_number\":\"51\",\"card_number\":\"0\",\"ex_number\":\"0\",\"... ...\":\"** More sub-items **\"},\"... ...\":\"** More sub-items **\"},\"2401645\":{\"id\":\"2401645\",\"user_id\":\"226462\",\"coupon_id\":\"2878\",\"coupon_json\":\"{\\\"id\\\":\\\"2878\\\",\\\"coupon_name\\\":\\\"100\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\\\",\\\"coupon_limit_des\\\":\\\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\\\",\\\"coupon_des\\\":\\\"\\u516c\\u53f8\\u5458\\u5de501\\u6708\\u798f\\u5229\\\",\\\"coupon_type\\\":\\\"2\\\",\\\"coupon_money\\\":\\\"100.00\\\",\\\"d|\\"},{"name":"X-Wf-1-1-1-10","value":"|ed_json\":\"\",\"status\":\"0\",\"create_time\":\"2017-01-03 10:36:42\",\"used_time\":\"0000-00-00 00:00:00\",\"update_time\":\"2017-01-03 10:36:42\",\"del_flag\":\"0\"}]],[\"db02:8307\",\"yisheng\",0.000346,\"select * from `ys_coupon` where  `id` = '2877' \",{\"id\":\"2877\",\"coupon_name\":\"200\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\",\"coupon_limit_des\":\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\",\"coupon_des\":\"\\u516c\\u53f8\\u5458\\u5de501\\u6708\\u798f\\u5229\",\"coupon_type\":\"2\",\"coupon_money\":\"200.00\",\"discount_percent\":null,\"limit_project_json\":\"\\\"\\\"\",\"limit_week_json\":\"\\\"\\\"\",\"limit_time_json\":\"{\\\"begin\\\":\\\"\\\",\\\"end\\\":\\\"\\\"}\",\"limit_money\":null,\"limit_city\":\"0\",\"limit_plat\":\"0\",\"begin_time\":\"2017-01-24 00:00:00\",\"end_time\":\"2017-03-10 00:00:00\",\"int_life_time\":\"5184000\",\"limit_total\":\"150\",\"person_limit\":\"1\",\"send_number\":\"51\",\"card_number\":\"0\",\"ex_number\":\"0\",\"... ...\":\"** More sub-items **\"}],[\"db02:8307\",\"yisheng\",0.00033,\"select * from `ys_coupon` where  `id` = '2878' \",{\"id\":\"2878\",\"coupon_name\":\"100\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\",\"coupon_limit_des\":\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\",\"coupon_des\":\"\\u516c\\u53f8\\u5458\\u5de501\\u6708\\u798f\\u5229\",\"coupon_type\":\"2\",\"coupon_money\":\"100.00\",\"discount_percent\":null,\"limit_project_json\":\"\\\"\\\"\",\"limit_week_json\":\"\\\"\\\"\",\"limit_time_json\":\"{\\\"begin\\\":\\\"\\\",\\\"end\\\":\\\"\\\"}\",\"limit_money\":null,\"limit_city\":\"0\",\"limit_plat\":\"0\",\"begin_time\":\"2017-01-24 00:00:00\",\"end_time\":\"2017-03-10 00:00:00\",\"int_life_time\":\"5184000\",\"limit_total\":\"150\",\"person_limit\":\"2\",\"send_number\":\"83\",\"card_number\":\"0\",\"ex_number\":\"0\",\"... ...\":\"** More sub-items **\"}],[\"db02:8307\",\"yisheng\",0.000313,\"select * from `ys_coupon` where  `id` = '2878' \",{\"id\":\"2878\",\"coupon_name\":\"100\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\",\"coupon_limit_des\":\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\",\"coupon_des\":\"\\u516c\\u53f8\\u5458\\u5de501\\u6708\\u798f\\u5229\",\"coupon_type\":\"2\",\"coupon_money\":\"100.00\",\"discount_percent\":null,\"limit_project_json\":\"\\\"\\\"\",\"limit_week_json\":\"\\\"\\\"\",\"limit_time_json\":\"{\\\"begin\\\":\\\"\\\",\\\"end\\\":\\\"\\\"}\",\"limit_money\":null,\"limit_city\":\"0\",\"limit_plat\":\"0\",\"begin_time\":\"2017-01-24 00:00:00\",\"end_time\":\"2017-03-10 00:00:00\",\"int_life_time\":\"5184000\",\"limit_total\":\"150\",\"person_limit\":\"2\",\"send_number\":\"83\",\"card_number\":\"0\",\"ex_number\":\"0\",\"... ...\":\"** More sub-items **\"}],[\"db02:8307\",\"yisheng\",0.000331,\"select * from `ys_coupon` where  `id` = '2831' \",{\"id\":\"2831\",\"coupon_name\":\"100\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\",\"coupon_limit_des\":\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\",\"coupon_des\":\"\\u516c\\u53f8\\u5458\\u5de512\\u6708\\u798f\\u5229\",\"coupon_type\":\"2\",\"coupon_money\":\"100.00\",\"discount_percent\":null,\"limit_project_json\":\"\\\"\\\"\",\"limit_week_json\":\"\\\"\\\"\",\"limit_time_json\":\"{\\\"begin\\\":\\\"\\\",\\\"end\\\":\\\"\\\"}\",\"limit_money\":null,\"limit_city\":\"0\",\"limit_plat\":\"0\",\"begin_time\":\"2016-12-26 00:00:00\",\"end_time\":\"2017-02-09 00:00:00\",\"int_life_time\":\"5184000\",\"limit_total\":\"150\",\"person_limit\":\"2\",\"send_number\":\"108\",\"card_number\":\"0\",\"ex_number\":\"0\",\"... ...\":\"** More sub-items **\"}],[\"db02:8307\",\"yisheng\",0.000444,\"select * from `ys_coupon` where  `id` = '2831' \",{\"id\":\"2831\",\"coupon_name\":\"100\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\",\"coupon_limit_des\":\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\",\"coupon_des\":\"\\u516c\\u53f8\\u5458\\u5de512\\u6708\\u798f\\u5229\",\"coupon_type\":\"2\",\"coupon_money\":\"100.00\",\"discount_percent\":null,\"limit_project_json\":\"\\\"\\\"\",\"limit_week_json\":\"\\\"\\\"\",\"limit_time_json\":\"{\\\"begin\\\":\\\"\\\",\\\"end\\\":\\\"\\\"}\",\"limit_money\":null,\"limit_city\":\"0\",\"limit_plat\":\"0\",\"begin_time\":\"2016-12-26 00:00:00\",\"end_time\":\"2017-02-09 00:00:00\",\"int_life_time\":\"5184000\",\"limit_total\":\"150\",\"person_limit\":\"2\",\"send_number\":\"108\",\"card_number\":\"0\",\"ex_number\":\"0\",\"... ...\":\"** More sub-items **\"}],[\"db02:8307\",\"yisheng\",0.000465,\"select * from `ys_coupon` where  `id` = '2830' \",{\"id\":\"2830\",\"coupon_name\":\"200\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\",\"coupon_limit_des\":\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\",\"coupon_des\":\"\\u516c\\u53f8\\u5458\\u5de512\\u6708\\u798f\\u5229\",\"coupon_type\":\"2\",\"coupon_money\":\"200.00\",\"discount_percent\":\"0\",\"limit_project_json\":\"\\\"\\\"\",\"limit_week_json\":\"\\\"\\\"\",\"limit_time_json\":\"{\\\"begin\\\":\\\"\\\",\\\"end\\\":\\\"\\\"}\",\"limit_money\":\"0.00\",\"limit_city\":\"0\",\"limit_plat\":\"0\",\"begin_time\":\"2016-12-26 00:00:00\",\"end_time\":\"2017-02-09 23:59:59\",\"int_life_time\":\"5184000\",\"limit_total\":\"150\",\"person_limit\":\"1\",\"send_number\":\"65\",\"card_number\":\"0\",\"ex_number\":\"0\",\"... ...\":\"** More sub-items **\"}],[\"db02:8307\",\"yisheng\",0.000243,\"SELECT u.coupon_id FROM user_coupon_detail u\\r\\nINNER JOIN order_user o ON o.`coupon_id` = u.id\\r\\nAND o.`contact_phone` = '18612181354' order by u.`expire_time` asc;\",[{\"coupon_id\":\"210\"},{\"coupon_id\":\"2220\"},{\"coupon_id\":\"2256\"},{\"coupon_id\":\"2514\"},{\"coupon_id\":\"2831\"},{\"coupon_id\":\"2831\"}]]]]]|"},{"name":"X-Wf-1-Plugin-1","value":"http://meta.firephp.org/Wildfire/Plugin/FirePHP/Library-FirePHPCore/0.3"},{"name":"X-Wf-1-1-1-5","value":"|6\",\"2514\",\"2831\",\"2831\"],\"\\/WORK\\/HTML\\/testV2\\/_CUSTOM_CLASS\\/model\\/UserCouponDetail.class.php:214\"],[\"uc-list\",{\"2401644\":{\"id\":\"2401644\",\"user_id\":\"226462\",\"coupon_id\":\"2877\",\"coupon_json\":\"{\\\"id\\\":\\\"2877\\\",\\\"coupon_name\\\":\\\"200\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\\\",\\\"coupon_limit_des\\\":\\\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\\\",\\\"coupon_des\\\":\\\"\\u516c\\u53f8\\u5458\\u5de501\\u6708\\u798f\\u5229\\\",\\\"coupon_type\\\":\\\"2\\\",\\\"coupon_money\\\":\\\"200.00\\\",\\\"discount_percent\\\":null,\\\"limit_project_json\\\":\\\"\\\\\\\"\\\\\\\"\\\",\\\"limit_week_json\\\":\\\"\\\\\\\"\\\\\\\"\\\",\\\"limit_time_json\\\":\\\"{\\\\\\\"begin\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"end\\\\\\\":\\\\\\\"\\\\\\\"}\\\",\\\"limit_money\\\":null,\\\"limit_city\\\":\\\"0\\\",\\\"limit_plat\\\":\\\"0\\\",\\\"begin_time\\\":\\\"2017-01-24 00:00:00\\\",\\\"end_time\\\":\\\"2017-03-10 00:00:00\\\",\\\"int_life_time\\\":\\\"5184000\\\",\\\"limit_total\\\":\\\"150\\\",\\\"person_limit\\\":\\\"1\\\",\\\"send_number\\\":\\\"44\\\",\\\"card_number\\\":\\\"0\\\",\\\"ex_number\\\":\\\"0\\\",\\\"wx_card_id\\\":\\\"\\\",\\\"status\\\":\\\"1\\\",\\\"admin_id\\\":\\\"174\\\",\\\"manager_name\\\":\\\"\\u7ba1\\u7406\\u540e\\u53f0\\\",\\\"remark\\\":\\\"\\\",\\\"input_time\\\":\\\"2017-01-24 11:02:56\\\",\\\"update_time\\\":\\\"2017-02-16 10:23:08\\\",\\\"del_flag\\\":\\\"0\\\"}\",\"coupon_money\":\"200.00\",\"expire_time\":\"2017-04-17 23:59:59\",\"from_gift_id\":\"0\",\"from_coupon_card_id\":\"0\",\"from_gift_card_id\":\"0\",\"from_other\":\"\",\"from_order_id\":\"0\",\"used_json\":\"\",\"status\":\"0\",\"create_time\":\"2017-02-16 17:27:36\",\"used_time\":\"0000-00-00 00:00:00\",\"update_time\":\"2017-02-16 17:27:36\",\"del_flag\":\"0\",\"project\":{\"id\":0},\"source_type\":1,\"regulater\":{\"id\":0},\"coupon_info\":{\"id\":\"2877\",\"coupon_name\":\"200\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\",\"coupon_limit_des\":\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\",\"coupon_des\":\"\\u516c\\u53f8\\u5458\\u5de501\\u6708\\u798f\\u5229\",\"coupon_type\":\"2\",\"coupon_money\":\"200.00\",\"discount_percent\":null,\"limit_project_json\":\"\\\"\\\"\",\"limit_week_json\":\"\\\"\\\"\",\"limit_time_json\":\"{\\\"begin\\\":\\\"\\\",\\\"end\\\":\\\"\\\"}\",\"limit_money\":null,\"limit_city\":\"0\",\"limit_plat\":\"0\",\"begin_time\":\"2017-01-24 00:00:00\",\"end_time\":\"2017-03-10 00:00:00\",\"int_life_time\":\"5184000\",\"limit_total\":\"150\",\"person_limit\":\"1\",\"send_number\":\"51\",\"card_number\":\"0\",\"ex_number\":\"0\",\"... ...\":\"** More sub-items **\"},\"... ...\":\"** More sub-items **\"},\"2401645\":{\"id\":\"2401645\",\"user_id\":\"226462\",\"coupon_id\":\"2878\",\"coupon_json\":\"{\\\"id\\\":\\\"2878\\\",\\\"coupon_name\\\":\\\"100\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\\\",\\\"coupon_limit_des\\\":\\\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\\\",\\\"coupon_des\\\":\\\"\\u516c\\u53f8\\u5458\\u5de501\\u6708\\u798f\\u5229\\\",\\\"coupon_type\\\":\\\"2\\\",\\\"coupon_money\\\":\\\"100.00\\\",\\\"discount_percent\\\":null,\\\"limit_project_json\\\":\\\"\\\"\\\"\\\",\\\"limit_week_json\\\":\\\"\\\"\\\"\\\",\\\"limit_time_json\\\":\\\"{\\\"begin\\\":\\\"\\\",\\\"end\\\":\\\"\\\"}\\\",\\\"limit_money\\\":null,\\\"limit_city\\\":\\\"0\\\",\\\"limit_plat\\\":\\\"0\\\",\\\"begin_time\\\":\\\"2017-01-24 00:00:00\\\",\\\"end_time\\\":\\\"2017-03-10 00:00:00\\\",\\\"int_life_time\\\":\\\"5184000\\\",\\\"limit_total\\\":\\\"150\\\",\\\"person_limit\\\":\\\"2\\\",\\\"send_number\\\":\\\"78\\\",\\\"card_number\\\":\\\"0\\\",\\\"ex_number\\\":\\\"0\\\",\\\"wx_card_id\\\":\\\"\\\",\\\"status\\\":\\\"1\\\",\\\"admin_id\\\":\\\"174\\\",\\\"manager_name\\\":\\\"\\u7ba1\\u7406\\u540e\\u53f0\\\",\\\"remark\\\":\\\"\\\",\\\"input_time\\\":\\\"2017-01-24 11:02:56\\\",\\\"update_time\\\":\\\"2017-02-16 10:24:04\\\",\\\"del_flag\\\":\\\"0\\\"}\",\"coupon_money\":\"100.00\",\"expire_time\":\"2017-04-17 23:59:59\",\"from_gift_id\":\"0\",\"from_coupon_card_id\":\"0\",\"from_gift_card_id\":\"0\",\"from_other\":\"\",\"from_order_id\":\"0\",\"used_json\":\"[\\\"1569074\\\"]\",\"status\":\"0\",\"create_time\":\"2017-02-16 17:27:53\",\"used_time\":\"0000-00-00 00:00:00\",\"update_time\":\"2017-02-23 21:50:24\",\"del_flag\":\"0\",\"project\":{\"id\":0},\"source_type\":1,\"regulater\":{\"id\":0},\"coupon_info\":{\"id\":\"2878\",\"coupon_name\":\"100\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\",\"coupon_limit_des\":\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\",\"coupon_des\":\"\\u516c\\u53f8\\u5458\\u5de501\\u6708\\u798f\\u5229\",\"coupon_type\":\"2\",\"coupon_money\":\"100.00\",\"discount_percent\":null,\"limit_project_json\":\"\\\"\\\"\",\"limit_week_json\":\"\\\"\\\"\",\"limit_time_json\":\"{\\\"begin\\\":\\\"\\\",\\\"end\\\":\\\"\\\"}\",\"limit_money\":null,\"limit_city\":\"0\",\"limit_plat\":\"0\",\"begin_time\":\"2017-01-24 00:00:00\",\"end_time\":\"2017-03-10 00:00:00\",\"int_life_time\":\"5184000\",\"limit_total\":\"150\",\"person_limit\":\"2\",\"send_number\":\"83\",\"card_number\":\"0\",\"ex_number\":\"0\",\"... ...\":\"** More sub-items **\"},\"... ...\":\"** More sub-items **\"},\"2401646\":{\"id\":\"2401646\",\"user_id\":\"226462\",\"coupon_id\":\"2878\",\"coupon_json\":\"{\\\"id\\\":\\\"2878\\\",\\\"coupon_name\\\":\\\"100\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\\\",\\\"coupon_limit_des\\\":\\\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\\\",\\\"coupon_des\\\":\\\"\\u516c\\u53f8\\u5458\\u5de501\\u6708\\u798f\\u5229\\\",\\\"coupon_type\\\":\\\"2\\\",\\\"coupon_money\\\":\\\"100.00\\\",\\\"discount_percent\\\":null,\\\"limit_project_json\\\":\\\"\\\"\\\"\\\",\\\"limit_week_json\\\":\\\"\\\"\\\"\\\",\\\"limit_time_json\\\":\\\"{\\\"begin\\\":\\\"\\\",\\\"end\\\":\\\"\\\"}\\\",\\\"limit_money\\\":null,\\\"limit_city\\\":\\\"0\\\",\\\"limit_plat\\\":\\\"0\\\",\\\"begin_time\\\":\\\"2017-01-24 00:00:00\\\",\\\"end_time\\\":\\\"2017-03-10 00:00:00\\\",\\\"int_life_time\\\":\\\"5184000\\\",\\\"limit_total\\\":\\\"150\\\",\\\"person_limit\\\":\\\"2\\\",\\\"send_number\\\":\\\"79\\\",\\\"card_number\\\":\\\"0\\\",\\\"ex_number\\\":\\\"0\\\",\\\"wx_card_id\\\":\\\"\\\",\\\"|\\"},{"name":"Server","value":"Apache"},{"name":"X-Wf-1-Index","value":"11"},{"name":"X-Wf-1-1-1-8","value":"14790|[{\"Type\":\"TABLE\",\"File\":\"\",\"Line\":\"\"},[\"11 SQL queries took 0.004699 seconds\",[[\"IP\",\"Database\",\"Time\",\"SQL Statement\",\"Results\"],[\"db02:8307\",\"yisheng\",0.000457,\"select * from `order_user` where  `id` = '1569074' \",{\"id\":\"1569074\",\"order_no\":\"U170223215023226462\",\"order_type\":\"0\",\"order_relid\":\"0\",\"pay_type\":\"\",\"order_source\":\"0\",\"order_status\":\"0\",\"user_id\":\"226462\",\"user_json\":\"{\\\"id\\\":\\\"226462\\\",\\\"mobile\\\":\\\"18612181354\\\",\\\"nickname\\\":\\\"\\u5f20\\u8fdb\\u7a0b\\\",\\\"city\\\":\\\"\\u5317\\u4eac\\\",\\\"unionid\\\":\\\"onJBPt8JPWdKLyiJv5U7T7RCaEV8\\\"}\",\"isfirst\":\"0\",\"user_note\":\"\",\"user_address_id\":\"98740\",\"city_id\":\"2\",\"district_id\":\"0\",\"location\":\"\\u5916\\u9986\\u4e1c\\u885751\\u53f7\\u51ef\\u666f\\u94ed\\u5ea7\\u5927\\u53a6\",\"address\":\"\\u5b9c\\u751f\\u5230\\u5bb6\\u529e\\u516c\\u5ba4\",\"l_lng\":\"116.410255432129\",\"l_lat\":\"39.968681335449\",\"begin_time\":\"2017-02-24 13:00:00\",\"contact_name\":\"\\u5f20\\u8fdb\\u7a0b\",\"contact_phone\":\"18612181354\",\"... ...\":\"** More sub-items **\"}],[\"db02:8307\",\"yisheng\",0.000358,\"select * from order_detail where  `order_id` = '1569074' \",{\"id\":\"1585039\",\"user_id\":\"226462\",\"order_mode\":\"0\",\"order_id\":\"1569074\",\"order_no\":\"U170223215023226462\",\"project_id\":\"225\",\"project_json\":\"{\\\"name\\\":\\\"\\u674e\\u5f66\\u5b8f\\u540c\\u6b3e\\u63a8\\u62ff\\\",\\\"id\\\":\\\"225\\\",\\\"city\\\":\\\"\\u5317\\u4eac\\\",\\\"online_price\\\":\\\"158.00\\\",\\\"regulater_cost\\\":\\\"110.00\\\"}\",\"regulater_id\":\"1234715\",\"regulater_json\":\"{\\\"mobile\\\":\\\"18911575689\\\",\\\"name\\\":\\\"\\u5218\\u5f66\\u6606\\\",\\\"city\\\":\\\"\\u5317\\u4eac\\\",\\\"empcode\\\":\\\"2019\\\",\\\"location\\\":\\\"\\u5730\\u94c110\\u53f7\\u7ebf; \\u5730\\u94c113\\u53f7\\u7ebf\\u77e5\\u6625\\u8def\\\"}\",\"order_detail_status\":\"0\",\"price_original\":\"158.00\",\"price_final\":\"158.00\",\"regulater_income\":\"110.00\",\"coupon_id\":\"0\",\"begin_time\":\"2017-02-24 13:00:00\",\"end_time\":\"2017-02-24 14:00:00\",\"real_begin_time\":\"0000-00-00 00:00:00\",\"real_end_time\":\"0000-00-00 00:00:00\",\"user_score\":\"0\",\"simulate\":\"\",\"create_time\":\"2017-02-23 21:50:23\",\"... ...\":\"** More sub-items **\"}],[\"db02:8307\",\"yisheng\",0.000714,\"select * from `user_coupon_regulater_detail` where  status = 0 and user_id = '226462' and expire_time >= '2017-02-23 23:24:07' and regulater_id=1234715 order by expire_time, status asc\",[]],[\"db02:8307\",\"yisheng\",0.000698,\"select * from `user_coupon_detail` where  status = 0 and user_id=226462 and expire_time >=\\\"2017-02-23 23:24:07\\\" order by expire_time desc\",[{\"id\":\"2401644\",\"user_id\":\"226462\",\"coupon_id\":\"2877\",\"coupon_json\":\"{\\\"id\\\":\\\"2877\\\",\\\"coupon_name\\\":\\\"200\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\\\",\\\"coupon_limit_des\\\":\\\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\\\",\\\"coupon_des\\\":\\\"\\u516c\\u53f8\\u5458\\u5de501\\u6708\\u798f\\u5229\\\",\\\"coupon_type\\\":\\\"2\\\",\\\"coupon_money\\\":\\\"200.00\\\",\\\"discount_percent\\\":null,\\\"limit_project_json\\\":\\\"\\\\\\\"\\\\\\\"\\\",\\\"limit_week_json\\\":\\\"\\\\\\\"\\\\\\\"\\\",\\\"limit_time_json\\\":\\\"{\\\\\\\"begin\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"end\\\\\\\":\\\\\\\"\\\\\\\"}\\\",\\\"limit_money\\\":null,\\\"limit_city\\\":\\\"0\\\",\\\"limit_plat\\\":\\\"0\\\",\\\"begin_time\\\":\\\"2017-01-24 00:00:00\\\",\\\"end_time\\\":\\\"2017-03-10 00:00:00\\\",\\\"int_life_time\\\":\\\"5184000\\\",\\\"limit_total\\\":\\\"150\\\",\\\"person_limit\\\":\\\"1\\\",\\\"send_number\\\":\\\"44\\\",\\\"card_number\\\":\\\"0\\\",\\\"ex_number\\\":\\\"0\\\",\\\"wx_card_id\\\":\\\"\\\",\\\"status\\\":\\\"1\\\",\\\"admin_id\\\":\\\"174\\\",\\\"manager_name\\\":\\\"\\u7ba1\\u7406\\u540e\\u53f0\\\",\\\"remark\\\":\\\"\\\",\\\"input_time\\\":\\\"2017-01-24 11:02:56\\\",\\\"update_time\\\":\\\"2017-02-16 10:23:08\\\",\\\"del_flag\\\":\\\"0\\\"}\",\"coupon_money\":\"200.00\",\"expire_time\":\"2017-04-17 23:59:59\",\"from_gift_id\":\"0\",\"from_coupon_card_id\":\"0\",\"from_gift_card_id\":\"0\",\"from_other\":\"\",\"from_order_id\":\"0\",\"used_json\":\"\",\"status\":\"0\",\"create_time\":\"2017-02-16 17:27:36\",\"used_time\":\"0000-00-00 00:00:00\",\"update_time\":\"2017-02-16 17:27:36\",\"del_flag\":\"0\"},{\"id\":\"2401645\",\"user_id\":\"226462\",\"coupon_id\":\"2878\",\"coupon_json\":\"{\\\"id\\\":\\\"2878\\\",\\\"coupon_name\\\":\\\"100\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\\\",\\\"coupon_limit_des\\\":\\\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\\\",\\\"coupon_des\\\":\\\"\\u516c\\u53f8\\u5458\\u5de501\\u6708\\u798f\\u5229\\\",\\\"coupon_type\\\":\\\"2\\\",\\\"coupon_money\\\":\\\"100.00\\\",\\\"discount_percent\\\":null,\\\"limit_project_json\\\":\\\"\\\"\\\"\\\",\\\"limit_week_json\\\":\\\"\\\"\\\"\\\",\\\"limit_time_json\\\":\\\"{\\\"begin\\\":\\\"\\\",\\\"end\\\":\\\"\\\"}\\\",\\\"limit_money\\\":null,\\\"limit_city\\\":\\\"0\\\",\\\"limit_plat\\\":\\\"0\\\",\\\"begin_time\\\":\\\"2017-01-24 00:00:00\\\",\\\"end_time\\\":\\\"2017-03-10 00:00:00\\\",\\\"int_life_time\\\":\\\"5184000\\\",\\\"limit_total\\\":\\\"150\\\",\\\"person_limit\\\":\\\"2\\\",\\\"send_number\\\":\\\"78\\\",\\\"card_number\\\":\\\"0\\\",\\\"ex_number\\\":\\\"0\\\",\\\"wx_card_id\\\":\\\"\\\",\\\"status\\\":\\\"1\\\",\\\"admin_id\\\":\\\"174\\\",\\\"manager_name\\\":\\\"\\u7ba1\\u7406\\u540e\\u53f0\\\",\\\"remark\\\":\\\"\\\",\\\"input_time\\\":\\\"2017-01-24 11:02:56\\\",\\\"update_time\\\":\\\"2017-02-16 10:24:04\\\",\\\"del_flag\\\":\\\"0\\\"}\",\"coupon_money\":\"100.00\",\"expire_time\":\"2017-04-17 23:59:59\",\"from_gift_id\":\"0\",\"from_coupon_card_id\":\"0\",\"from_gift_card_id\":\"0\",\"from_other\":\"\",\"from_order_id\":\"0\",\"used_json\":\"[\\\"1569074\\\"]\",\"status\":\"0\",\"create_time\":\"2017-02-16 17:27:53\",\"used_time\":\"0000-00-00 00:00:00\",\"update_time\":\"2017-02-23 21:50:24\",\"del_flag\":\"0\"},{\"id\":\"2401646\",\"user_id\":\"226462\",\"coupon_|\\"},{"name":"X-Powered-From","value":"182.92.219.30"},{"name":"Vary","value":"Accept-Encoding,User-Agent"},{"name":"Content-Type","value":"text/html; charset=UTF-8"},{"name":"Connection","value":"close"},{"name":"X-Wf-1-1-1-9","value":"|id\":\"2878\",\"coupon_json\":\"{\\\"id\\\":\\\"2878\\\",\\\"coupon_name\\\":\\\"100\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\\\",\\\"coupon_limit_des\\\":\\\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\\\",\\\"coupon_des\\\":\\\"\\u516c\\u53f8\\u5458\\u5de501\\u6708\\u798f\\u5229\\\",\\\"coupon_type\\\":\\\"2\\\",\\\"coupon_money\\\":\\\"100.00\\\",\\\"discount_percent\\\":null,\\\"limit_project_json\\\":\\\"\\\"\\\"\\\",\\\"limit_week_json\\\":\\\"\\\"\\\"\\\",\\\"limit_time_json\\\":\\\"{\\\"begin\\\":\\\"\\\",\\\"end\\\":\\\"\\\"}\\\",\\\"limit_money\\\":null,\\\"limit_city\\\":\\\"0\\\",\\\"limit_plat\\\":\\\"0\\\",\\\"begin_time\\\":\\\"2017-01-24 00:00:00\\\",\\\"end_time\\\":\\\"2017-03-10 00:00:00\\\",\\\"int_life_time\\\":\\\"5184000\\\",\\\"limit_total\\\":\\\"150\\\",\\\"person_limit\\\":\\\"2\\\",\\\"send_number\\\":\\\"79\\\",\\\"card_number\\\":\\\"0\\\",\\\"ex_number\\\":\\\"0\\\",\\\"wx_card_id\\\":\\\"\\\",\\\"status\\\":\\\"1\\\",\\\"admin_id\\\":\\\"174\\\",\\\"manager_name\\\":\\\"\\u7ba1\\u7406\\u540e\\u53f0\\\",\\\"remark\\\":\\\"\\\",\\\"input_time\\\":\\\"2017-01-24 11:02:56\\\",\\\"update_time\\\":\\\"2017-02-16 17:27:53\\\",\\\"del_flag\\\":\\\"0\\\"}\",\"coupon_money\":\"100.00\",\"expire_time\":\"2017-04-17 23:59:59\",\"from_gift_id\":\"0\",\"from_coupon_card_id\":\"0\",\"from_gift_card_id\":\"0\",\"from_other\":\"\",\"from_order_id\":\"0\",\"used_json\":\"[\\\"1569068\\\"]\",\"status\":\"0\",\"create_time\":\"2017-02-16 17:27:58\",\"used_time\":\"0000-00-00 00:00:00\",\"update_time\":\"2017-02-23 20:06:57\",\"del_flag\":\"0\"},{\"id\":\"2272160\",\"user_id\":\"226462\",\"coupon_id\":\"2831\",\"coupon_json\":\"{\\\"id\\\":\\\"2831\\\",\\\"coupon_name\\\":\\\"100\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\\\",\\\"coupon_limit_des\\\":\\\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\\\",\\\"coupon_des\\\":\\\"\\u516c\\u53f8\\u5458\\u5de512\\u6708\\u798f\\u5229\\\",\\\"coupon_type\\\":\\\"2\\\",\\\"coupon_money\\\":\\\"100.00\\\",\\\"discount_percent\\\":null,\\\"limit_project_json\\\":\\\"\\\"\\\"\\\",\\\"limit_week_json\\\":\\\"\\\"\\\"\\\",\\\"limit_time_json\\\":\\\"{\\\"begin\\\":\\\"\\\",\\\"end\\\":\\\"\\\"}\\\",\\\"limit_money\\\":null,\\\"limit_city\\\":\\\"0\\\",\\\"limit_plat\\\":\\\"0\\\",\\\"begin_time\\\":\\\"2016-12-26 00:00:00\\\",\\\"end_time\\\":\\\"2017-02-09 00:00:00\\\",\\\"int_life_time\\\":\\\"5184000\\\",\\\"limit_total\\\":\\\"150\\\",\\\"person_limit\\\":\\\"2\\\",\\\"send_number\\\":\\\"63\\\",\\\"card_number\\\":\\\"0\\\",\\\"ex_number\\\":\\\"0\\\",\\\"wx_card_id\\\":\\\"\\\",\\\"status\\\":\\\"1\\\",\\\"admin_id\\\":\\\"217\\\",\\\"manager_name\\\":\\\"\\u7ba1\\u7406\\u540e\\u53f0\\\",\\\"remark\\\":\\\"\\\",\\\"input_time\\\":\\\"2016-12-26 17:54:27\\\",\\\"update_time\\\":\\\"2017-01-03 10:37:28\\\",\\\"del_flag\\\":\\\"0\\\"}\",\"coupon_money\":\"100.00\",\"expire_time\":\"2017-03-04 23:59:59\",\"from_gift_id\":\"0\",\"from_coupon_card_id\":\"0\",\"from_gift_card_id\":\"0\",\"from_other\":\"\",\"from_order_id\":\"0\",\"used_json\":\"[\\\"1569071\\\"]\",\"status\":\"0\",\"create_time\":\"2017-01-03 10:39:38\",\"used_time\":\"2017-02-23 18:42:35\",\"update_time\":\"2017-02-23 20:11:48\",\"del_flag\":\"0\"},{\"id\":\"2272158\",\"user_id\":\"226462\",\"coupon_id\":\"2831\",\"coupon_json\":\"{\\\"id\\\":\\\"2831\\\",\\\"coupon_name\\\":\\\"100\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\\\",\\\"coupon_limit_des\\\":\\\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\\\",\\\"coupon_des\\\":\\\"\\u516c\\u53f8\\u5458\\u5de512\\u6708\\u798f\\u5229\\\",\\\"coupon_type\\\":\\\"2\\\",\\\"coupon_money\\\":\\\"100.00\\\",\\\"discount_percent\\\":null,\\\"limit_project_json\\\":\\\"\\\"\\\"\\\",\\\"limit_week_json\\\":\\\"\\\"\\\"\\\",\\\"limit_time_json\\\":\\\"{\\\"begin\\\":\\\"\\\",\\\"end\\\":\\\"\\\"}\\\",\\\"limit_money\\\":null,\\\"limit_city\\\":\\\"0\\\",\\\"limit_plat\\\":\\\"0\\\",\\\"begin_time\\\":\\\"2016-12-26 00:00:00\\\",\\\"end_time\\\":\\\"2017-02-09 00:00:00\\\",\\\"int_life_time\\\":\\\"5184000\\\",\\\"limit_total\\\":\\\"150\\\",\\\"person_limit\\\":\\\"2\\\",\\\"send_number\\\":\\\"62\\\",\\\"card_number\\\":\\\"0\\\",\\\"ex_number\\\":\\\"0\\\",\\\"wx_card_id\\\":\\\"\\\",\\\"status\\\":\\\"1\\\",\\\"admin_id\\\":\\\"217\\\",\\\"manager_name\\\":\\\"\\u7ba1\\u7406\\u540e\\u53f0\\\",\\\"remark\\\":\\\"\\\",\\\"input_time\\\":\\\"2016-12-26 17:54:27\\\",\\\"update_time\\\":\\\"2017-01-03 10:16:35\\\",\\\"del_flag\\\":\\\"0\\\"}\",\"coupon_money\":\"100.00\",\"expire_time\":\"2017-03-04 23:59:59\",\"from_gift_id\":\"0\",\"from_coupon_card_id\":\"0\",\"from_gift_card_id\":\"0\",\"from_other\":\"\",\"from_order_id\":\"0\",\"used_json\":\"\",\"status\":\"0\",\"create_time\":\"2017-01-03 10:37:28\",\"used_time\":\"2017-02-23 18:31:36\",\"update_time\":\"2017-02-23 19:54:32\",\"del_flag\":\"0\"},{\"id\":\"2272156\",\"user_id\":\"226462\",\"coupon_id\":\"2830\",\"coupon_json\":\"{\\\"id\\\":\\\"2830\\\",\\\"coupon_name\\\":\\\"200\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\\\",\\\"coupon_limit_des\\\":\\\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\\\",\\\"coupon_des\\\":\\\"\\u516c\\u53f8\\u5458\\u5de512\\u6708\\u798f\\u5229\\\",\\\"coupon_type\\\":\\\"2\\\",\\\"coupon_money\\\":\\\"200.00\\\",\\\"discount_percent\\\":null,\\\"limit_project_json\\\":\\\"\\\\\\\"\\\\\\\"\\\",\\\"limit_week_json\\\":\\\"\\\\\\\"\\\\\\\"\\\",\\\"limit_time_json\\\":\\\"{\\\\\\\"begin\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"end\\\\\\\":\\\\\\\"\\\\\\\"}\\\",\\\"limit_money\\\":null,\\\"limit_city\\\":\\\"0\\\",\\\"limit_plat\\\":\\\"0\\\",\\\"begin_time\\\":\\\"2016-12-26 00:00:00\\\",\\\"end_time\\\":\\\"2017-02-09 00:00:00\\\",\\\"int_life_time\\\":\\\"5184000\\\",\\\"limit_total\\\":\\\"150\\\",\\\"person_limit\\\":\\\"1\\\",\\\"send_number\\\":\\\"37\\\",\\\"card_number\\\":\\\"0\\\",\\\"ex_number\\\":\\\"0\\\",\\\"wx_card_id\\\":\\\"\\\",\\\"status\\\":\\\"1\\\",\\\"admin_id\\\":\\\"217\\\",\\\"manager_name\\\":\\\"\\u7ba1\\u7406\\u540e\\u53f0\\\",\\\"remark\\\":\\\"\\\",\\\"input_time\\\":\\\"2016-12-26 17:54:27\\\",\\\"update_time\\\":\\\"2017-01-03 10:15:44\\\",\\\"del_flag\\\":\\\"0\\\"}\",\"coupon_money\":\"200.00\",\"expire_time\":\"2017-03-04 23:59:59\",\"from_gift_id\":\"0\",\"from_coupon_card_id\":\"0\",\"from_gift_card_id\":\"0\",\"from_other\":\"\",\"from_order_id\":\"0\",\"us|\\"},{"name":"Content-Length","value":"380"},{"name":"X-Wf-1-1-1-4","value":"|42:35\",\"update_time\":\"2017-02-23 20:11:48\",\"del_flag\":\"0\",\"project\":{\"id\":0},\"source_type\":1,\"regulater\":{\"id\":0},\"coupon_info\":{\"id\":\"2831\",\"coupon_name\":\"100\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\",\"coupon_limit_des\":\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\",\"coupon_des\":\"\\u516c\\u53f8\\u5458\\u5de512\\u6708\\u798f\\u5229\",\"coupon_type\":\"2\",\"coupon_money\":\"100.00\",\"discount_percent\":null,\"limit_project_json\":\"\\\"\\\"\",\"limit_week_json\":\"\\\"\\\"\",\"limit_time_json\":\"{\\\"begin\\\":\\\"\\\",\\\"end\\\":\\\"\\\"}\",\"limit_money\":null,\"limit_city\":\"0\",\"limit_plat\":\"0\",\"begin_time\":\"2016-12-26 00:00:00\",\"end_time\":\"2017-02-09 00:00:00\",\"int_life_time\":\"5184000\",\"limit_total\":\"150\",\"person_limit\":\"2\",\"send_number\":\"108\",\"card_number\":\"0\",\"ex_number\":\"0\",\"... ...\":\"** More sub-items **\"},\"... ...\":\"** More sub-items **\"},\"2272158\":{\"id\":\"2272158\",\"user_id\":\"226462\",\"coupon_id\":\"2831\",\"coupon_json\":\"{\\\"id\\\":\\\"2831\\\",\\\"coupon_name\\\":\\\"100\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\\\",\\\"coupon_limit_des\\\":\\\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\\\",\\\"coupon_des\\\":\\\"\\u516c\\u53f8\\u5458\\u5de512\\u6708\\u798f\\u5229\\\",\\\"coupon_type\\\":\\\"2\\\",\\\"coupon_money\\\":\\\"100.00\\\",\\\"discount_percent\\\":null,\\\"limit_project_json\\\":\\\"\\\"\\\"\\\",\\\"limit_week_json\\\":\\\"\\\"\\\"\\\",\\\"limit_time_json\\\":\\\"{\\\"begin\\\":\\\"\\\",\\\"end\\\":\\\"\\\"}\\\",\\\"limit_money\\\":null,\\\"limit_city\\\":\\\"0\\\",\\\"limit_plat\\\":\\\"0\\\",\\\"begin_time\\\":\\\"2016-12-26 00:00:00\\\",\\\"end_time\\\":\\\"2017-02-09 00:00:00\\\",\\\"int_life_time\\\":\\\"5184000\\\",\\\"limit_total\\\":\\\"150\\\",\\\"person_limit\\\":\\\"2\\\",\\\"send_number\\\":\\\"62\\\",\\\"card_number\\\":\\\"0\\\",\\\"ex_number\\\":\\\"0\\\",\\\"wx_card_id\\\":\\\"\\\",\\\"status\\\":\\\"1\\\",\\\"admin_id\\\":\\\"217\\\",\\\"manager_name\\\":\\\"\\u7ba1\\u7406\\u540e\\u53f0\\\",\\\"remark\\\":\\\"\\\",\\\"input_time\\\":\\\"2016-12-26 17:54:27\\\",\\\"update_time\\\":\\\"2017-01-03 10:16:35\\\",\\\"del_flag\\\":\\\"0\\\"}\",\"coupon_money\":\"100.00\",\"expire_time\":\"2017-03-04 23:59:59\",\"from_gift_id\":\"0\",\"from_coupon_card_id\":\"0\",\"from_gift_card_id\":\"0\",\"from_other\":\"\",\"from_order_id\":\"0\",\"used_json\":\"\",\"status\":\"0\",\"create_time\":\"2017-01-03 10:37:28\",\"used_time\":\"2017-02-23 18:31:36\",\"update_time\":\"2017-02-23 19:54:32\",\"del_flag\":\"0\",\"project\":{\"id\":0},\"source_type\":1,\"regulater\":{\"id\":0},\"coupon_info\":{\"id\":\"2831\",\"coupon_name\":\"100\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\",\"coupon_limit_des\":\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\",\"coupon_des\":\"\\u516c\\u53f8\\u5458\\u5de512\\u6708\\u798f\\u5229\",\"coupon_type\":\"2\",\"coupon_money\":\"100.00\",\"discount_percent\":null,\"limit_project_json\":\"\\\"\\\"\",\"limit_week_json\":\"\\\"\\\"\",\"limit_time_json\":\"{\\\"begin\\\":\\\"\\\",\\\"end\\\":\\\"\\\"}\",\"limit_money\":null,\"limit_city\":\"0\",\"limit_plat\":\"0\",\"begin_time\":\"2016-12-26 00:00:00\",\"end_time\":\"2017-02-09 00:00:00\",\"int_life_time\":\"5184000\",\"limit_total\":\"150\",\"person_limit\":\"2\",\"send_number\":\"108\",\"card_number\":\"0\",\"ex_number\":\"0\",\"... ...\":\"** More sub-items **\"},\"... ...\":\"** More sub-items **\"},\"2272156\":{\"id\":\"2272156\",\"user_id\":\"226462\",\"coupon_id\":\"2830\",\"coupon_json\":\"{\\\"id\\\":\\\"2830\\\",\\\"coupon_name\\\":\\\"200\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\\\",\\\"coupon_limit_des\\\":\\\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\\\",\\\"coupon_des\\\":\\\"\\u516c\\u53f8\\u5458\\u5de512\\u6708\\u798f\\u5229\\\",\\\"coupon_type\\\":\\\"2\\\",\\\"coupon_money\\\":\\\"200.00\\\",\\\"discount_percent\\\":null,\\\"limit_project_json\\\":\\\"\\\\\\\"\\\\\\\"\\\",\\\"limit_week_json\\\":\\\"\\\\\\\"\\\\\\\"\\\",\\\"limit_time_json\\\":\\\"{\\\\\\\"begin\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"end\\\\\\\":\\\\\\\"\\\\\\\"}\\\",\\\"limit_money\\\":null,\\\"limit_city\\\":\\\"0\\\",\\\"limit_plat\\\":\\\"0\\\",\\\"begin_time\\\":\\\"2016-12-26 00:00:00\\\",\\\"end_time\\\":\\\"2017-02-09 00:00:00\\\",\\\"int_life_time\\\":\\\"5184000\\\",\\\"limit_total\\\":\\\"150\\\",\\\"person_limit\\\":\\\"1\\\",\\\"send_number\\\":\\\"37\\\",\\\"card_number\\\":\\\"0\\\",\\\"ex_number\\\":\\\"0\\\",\\\"wx_card_id\\\":\\\"\\\",\\\"status\\\":\\\"1\\\",\\\"admin_id\\\":\\\"217\\\",\\\"manager_name\\\":\\\"\\u7ba1\\u7406\\u540e\\u53f0\\\",\\\"remark\\\":\\\"\\\",\\\"input_time\\\":\\\"2016-12-26 17:54:27\\\",\\\"update_time\\\":\\\"2017-01-03 10:15:44\\\",\\\"del_flag\\\":\\\"0\\\"}\",\"coupon_money\":\"200.00\",\"expire_time\":\"2017-03-04 23:59:59\",\"from_gift_id\":\"0\",\"from_coupon_card_id\":\"0\",\"from_gift_card_id\":\"0\",\"from_other\":\"\",\"from_order_id\":\"0\",\"used_json\":\"\",\"status\":\"0\",\"create_time\":\"2017-01-03 10:36:42\",\"used_time\":\"0000-00-00 00:00:00\",\"update_time\":\"2017-01-03 10:36:42\",\"del_flag\":\"0\",\"project\":{\"id\":0},\"source_type\":1,\"regulater\":{\"id\":0},\"coupon_info\":{\"id\":\"2830\",\"coupon_name\":\"200\\u5143\\u901a\\u7528\\u4f18\\u60e0\\u5238\",\"coupon_limit_des\":\"\\u9002\\u7528\\u4e8e\\u6240\\u6709\\u9879\\u76ee\",\"coupon_des\":\"\\u516c\\u53f8\\u5458\\u5de512\\u6708\\u798f\\u5229\",\"coupon_type\":\"2\",\"coupon_money\":\"200.00\",\"discount_percent\":\"0\",\"limit_project_json\":\"\\\"\\\"\",\"limit_week_json\":\"\\\"\\\"\",\"limit_time_json\":\"{\\\"begin\\\":\\\"\\\",\\\"end\\\":\\\"\\\"}\",\"limit_money\":\"0.00\",\"limit_city\":\"0\",\"limit_plat\":\"0\",\"begin_time\":\"2016-12-26 00:00:00\",\"end_time\":\"2017-02-09 23:59:59\",\"int_life_time\":\"5184000\",\"limit_total\":\"150\",\"person_limit\":\"1\",\"send_number\":\"65\",\"card_number\":\"0\",\"ex_number\":\"0\",\"... ...\":\"** More sub-items **\"},\"... ...\":\"** More sub-items **\"}},\"\\/WORK\\/HTML\\/testV2\\/_CUSTOM_CLASS\\/model\\/UserCouponDetail.class.php:200\"],[\"$usedlist\",[\"210\",\"2220\",\"225|\\"},{"name":"X-Wf-Protocol-1","value":"http://meta.wildfirehq.org/Protocol/JsonStream/0.2"}]})
        /*
        bus.$emit({"url": "test", "headers": 
[
    {
        "name":"X-Wf-1-1-1-1", 
        "value": "107|[{\"Type\":\"TABLE\",\"File\":\"\",\"Line\":\"\"},[\"This Page Spend Times 0.073174\",[[\"Description\",\"Time\",\"Caller\"]]]]|\"", 
    }
], "connect": true
});*/
    },
    methods: {
        // 清空
        trash: function() {
            this.requests = [];
        },
        // 更新标签页
        tabUpdate: function() {
            this.debug += 'tab 更新了';
            if (!this.pause) {
                this.requests = [];
            }
        },
        // 切换清空状态
        switchPause: function() {
            this.pause = !this.pause;
        },
        // 初始化请求相关的
        initRequestDetail: function(data) {
            return {
                type: 'table',
                title: 'Request Fields',
                table: [[
                    {
                        omit: false,
                        type: 'string',
                        val: data.method
                    },
                    {
                        omit: data.method == 'POST',
                        type: 'array',
                        val: data.params
                    }
                    ]
                ]
            };
        },
        // 添加请求
        addRequest: function(data) {
            // 如果连接断开了，这时候页面刷新的请求是收不到的
            if (!data['connect']) {
                this.requests = [
                    {
                        "url": "https://github.com/aaronzjc",
                        "collection": [
                            {
                                "title": 'Oops, Your devtools connection to background has gone.Reopen console to continue . ',
                                'type': 'exception',
                                "table": []
                            }
                        ]
                    }
                ];
                return false;
            }
            
            var key = 'X-Wf-1-1-1-'; // 响应前缀


            // 整合过的完整JSON列表
            var item = [];
            var seeds = [];
            // this.debug += JSON.stringify(data);
            for (var i in data['headers']) {
                var value = data['headers'][i];
                if (value['name'].indexOf(key) >= 0) {
                    var fragment = value['value'].substring(value['value'].indexOf('|') + 1, value['value'].lastIndexOf('|'));
                    var index = parseInt(value['name'].substring(key.length));
                    var isEnd = value['value'].trim().slice(-1) == "\\"?false:true;
                    seeds.push({index:index, val:fragment, isEnd: isEnd});
                }
            }

            // 排序
            seeds.sort(function(a, b) {
                return (a.index > b.index) ? 1 : -1;
            });
            // 数据处理，将header片段拼接成完整的JSON段
            var json = '';
            for (var i in seeds) {
                json += seeds[i]['val'];
                if (seeds[i]['isEnd']) {
                    item.push(json);
                    json = '';
                }
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
            map['collection'].push(this.initRequestDetail(data.params));
            // this.debug += JSON.stringify(map);
            var _self = this;
            setTimeout(function() {
                _self.requests.push(map);
            }, 200);
        },
        // 连接断开
        disconnect: function() {
            this.requests = [
                {
                    "title": 'Console Connect failed.Please reopen console to continue..',
                    'type': 'exception',
                    "table": []
                }
            ];
        },
        // 刷新当前页面
        refresh: function() {
            chrome.devtools.inspectedWindow.reload();
        },
        // 关闭弹层
        closeModal: function() {
            this.modalHide = true;
        },
        debugLog: function(data) {
            this.debug += JSON.stringify(data);
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
        showDetail: function(data) {
            // TODO: JSON beauty
            this.modalHide = false;

            var render = renderJSON(data);
            this.isJson = render.isJson;
            this.json = data;
            this.jsonHTML = render.data;
        },
    },
    components: {
        'v-modal': Modal
    }
});

$(function() {
    var moveX = 0;
    var moveY = 0;

    var boxX = 0;
    var boxY = 0;
    // 设置弹层的拖动
    $('.modal .header').mousedown(function(event){
        boxX = parseInt($(".modal").position().left);
        boxY = parseInt($(".modal").position().top);

        var mouseOrignX = parseInt(event.clientX);
        var mouseOriginY = parseInt(event.clientY);

        console.log(boxX, boxY);
        console.log(mouseOrignX, mouseOriginY);

        function moveHandle(e) {
            moveX = e.clientX - mouseOrignX;
            moveY = e.clientY - mouseOriginY;

            $('.modal').css({
                'left': (boxX + moveX) + 'px',
                'top': (boxY + moveY) + 'px',
                'right': 'auto',
                'bottom': 'auto'
            });
        }

        $(document).mousemove(moveHandle);
        $(document).mouseup(function(e){
            $(document).unbind('mousemove', moveHandle);
        });
    });
});