var Popup = require("Popup");

cc.Class({
    extends: Popup,

    properties: {
        tabTop : cc.Node,
        uiTab : cc.Prefab,
        tableView : cc.Node,
    },

    onLoad: function () {

    },

    onCallBack: function() {
        this._callback();
        this.disappear();
    },

    initTabs: function (tabs) {
        var self = this;

        var tab_view = cc.instantiate(this.uiTab);
        var tab_component = tab_view.getComponent("UITab");
        tab_component.setTab(tabs,function (index) {
            self.onEvent(index);
        });
        this.tabTop.addChild(tab_view);


    },

    onEvent: function (index) {},

    init: function(response, type, callback) {
        this.response = response;

        switch (type) {
            case 0:

                break;
            case 1:

                break;
            case 2:

                break;
            default:
                break;
        }
        this._callback = callback;
    }
});
