var PopupHistory = require('PopupHistory');
cc.Class({
    extends: PopupHistory,

    properties: {

    },

    // onLoad () {},

    start: function () {
        var tabString = ["Lịch sử quay", "Lịch sử nổ hũ", "Top cao thủ"];
        this.addTabs(tabString);
    },

    addTabs: function (tabs) {
        this._super(tabs);
    },

    onEvent: function (index) {
        cc.log("call request history at index = ",index);
    },

});
