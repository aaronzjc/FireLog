var storage = chrome.storage.local;
var vm = new Vue({
	el: "#app",
	data: {
		state: false,
		background:null
	},
	created: function () {
		var _self = this;
		this.background = chrome.extension.getBackgroundPage();
		storage.get('active', function(state) {
			_self.state = state.active?true:false;
			_self.background.update(_self.state);
		});
	},
	computed: {
		btnMsg: function () {
			return this.state?'关闭调试':'开启调试';
		}
	},
	methods: {
		switchState: function () {
			this.state = !this.state;
			storage.set({'active': this.state}, function () {});
			this.background.update(this.state);
		}
	}
});