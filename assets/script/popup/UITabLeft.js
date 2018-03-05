cc.Class({
    extends: cc.Component,

    properties: {
        scroll_view : cc.ScrollView,
        tab_item_left : cc.Prefab,
        tab_selected : cc.SpriteFrame,
        tab_unselect : cc.SpriteFrame
    },

    setTab: function (tabs,tab_active,callBack) {
        this.callBackTab = callBack;

        var self = this;
        this.tab_size = tabs.length;

        this.list_buttons = [];

        for(var i = 0; i < this.tab_size; i++){
            cc.log("tabs =", tabs[i]);
            var button = cc.instantiate(this.tab_item_left);
            var button_component = button.getComponent("TabItem");
            var tag = i + 1;
            button_component.init(tabs[i],tag,function (index) {
                self.showTab(index);
            });

            var posY = (this.tab_size/2 - i) * button.getContentSize().height;
            button.setPosition(cc.p(0,posY));

            this.scroll_view.content.addChild(button);

            this.list_buttons.push(button_component);
        }

        this.showTab(tab_active);

    },

    showTab: function (index) {

        for(var i = 0; i < this.list_buttons.length; i++){
            var button = this.list_buttons[i];
            if(index - 1 == i){
                button.node.getComponent(cc.Sprite).spriteFrame = this.tab_selected;
            }else{
                button.node.getComponent(cc.Sprite).spriteFrame = this.tab_unselect;
            }
        }

        this.callBackTab(index);

    },
});
