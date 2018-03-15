cc.Class({
    extends: cc.Component,

    properties: {
        scroll_view : cc.ScrollView,
        tab : cc.Sprite,
        tab_item : cc.Prefab,
    },

    setTab: function (tabs,tab_active,callBack) {
        this.callBackTab = callBack;

        var self = this;
        this.tab_size = tabs.length;

        var size = this.tab.node.getContentSize();
        var max_length = (tabs.length < 4) ? tabs.length : 3;

        this.scroll_view.node.setContentSize(cc.size(size.width* max_length,size.height));
        this.scroll_view.content.setContentSize(cc.size(size.width* tabs.length,size.height));

        for(var i = 0; i < this.tab_size; i++){
            var button = cc.instantiate(this.tab_item);
            var button_component = button.getComponent("TabItem");
            var tag = i + 1;
            button_component.init(tabs[i],tag,function (index) {
                self.showTab(index);
            });

            var posX = (i + 0.5) * button.getContentSize().width;
            button.setPosition(cc.p(posX,0));

            this.scroll_view.content.addChild(button);
        }
        if(tab_active){
            this.showTab(tab_active,true);
        }else{
            this.showTab(1);
        }

    },

    showTab: function (index,disableAnimation) {
        var number = index - 1;
        var time_move = 0.2;

        var posY = this.tab.node.getPositionY();
        var posX = this.tab.node.getContentSize().width * (number + 0.5);

        var callFunc = cc.callFunc(function () {
            this.callBackTab(index);
        },this);

        if(disableAnimation){
            time_move = 0;
        }

        this.tab.node.runAction(cc.sequence(cc.moveTo(time_move,cc.p(posX,posY)),callFunc));

        if(this.tab_size > 3){
            var posX_content = 0;
            if(number > 1 && number < this.tab_size - 1){
                posX_content = this.tab.node.getContentSize().width * (1 - number) -
                    this.scroll_view.node.getContentSize().width/2;
            }else if(number == this.tab_size - 1){
                posX_content = this.tab.node.getContentSize().width * (2 - number) -
                    this.scroll_view.node.getContentSize().width/2;
            }else{
                posX_content = -this.scroll_view.node.getContentSize().width/2;
            }

            this.scroll_view.content.runAction(cc.moveTo(time_move,cc.p(posX_content,0)));
        }

    },
});
