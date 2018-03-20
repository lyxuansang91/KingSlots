cc.Class({
    extends: cc.Component,

    properties: {
        scroll_view : cc.ScrollView,
        tab_item : cc.Prefab,
        currentSess: 0,
        list_item: [],
    },

    setTab: function (tabs, callBack) {
        this.callBackTab = callBack;

        var self = this;

        var button = cc.instantiate(this.tab_item);
        var button_component = button.getComponent("TabItemTaixiu");
        button_component.init(tabs);

        var posX = i * button.getContentSize().width;
        button.setPosition(cc.p(posX,0));
        this.list_item.push(button);
        this.scroll_view.content.addChild(button);

        this.currentSess = tabs;

        this.callBackTab(tabs);

    },

});
