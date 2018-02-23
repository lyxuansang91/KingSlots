var NetworkManager = require('NetworkManager');
var CommonPopup = require('CommonPopup');
var HISTORY_SPIN = 1;
var HISTORY_BREAK_JAR = 2;
var HISTORY_TOP_USER = 3;

cc.Class({
    extends: CommonPopup,

    properties: {

    },

    onLoad: function () {
        var tabs = ["xxx","yyy","zzz","iii"];
        this.initTabs(tabs);
    },

    initTabs: function (tabs) {
        this._super(tabs);
    },

    onEvent: function (index) {
        cc.log("call request history at index = ",index);
    },
});
