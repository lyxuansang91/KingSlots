var CommonPopup = require('CommonPopup');

cc.Class({
    extends: CommonPopup,

    properties: {
        webviewUrl: cc.String
    },

    onLoad: function () {
    },

    start: function () {
    },

    addTabs: function (tabs, index) {
        this.initTabs(tabs, index);
    },

    initTabs: function (tabs, index) {
        this._super(tabs, index);
    },

    onEvent: function (index) {
        var tabZoneId = [Config.TAG_GAME_ITEM.MINI_POKER, Config.TAG_GAME_ITEM.MINI_BACAY, Config.TAG_GAME_ITEM.TAIXIU];

        var webview = this.tableView.getComponent(cc.WebView);
        if(!webview){
            webview = this.tableView.addComponent(cc.WebView);
        }
        webview.node.color = cc.color(0,0,0,255);
        webview.url = this.webviewUrl + tabZoneId[index - 1];

    },

});
