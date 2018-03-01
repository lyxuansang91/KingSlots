var NetworkManager = require('NetworkManager');
var CommonPopup = require('CommonPopup');
var MAIL_RECEIVED = 1;
var MAIL_SENT = 2;
var MAIL_SENT_ADMIN = 3;
var MAX_RESULT = 20;
var firstResult = -1;
cc.Class({
    extends: CommonPopup,

    properties: {
        mailType: 1
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
        // this.getLookupHistoryRequest(firstResult, MAX_RESULT,
        //     index, true);
        // this.setMailType(index);
    },

    setMailType: function (mailType) {
        this.mailType = mailType;
    },
});
