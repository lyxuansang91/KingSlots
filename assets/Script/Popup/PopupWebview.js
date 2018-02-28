var CommonPopup = require('CommonPopup');

cc.Class({
    extends: CommonPopup,

    properties: {
        linkUrl: [cc.String]
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
        // this.setHistoryType(index);
    },

});
