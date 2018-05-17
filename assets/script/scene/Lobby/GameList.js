var NetworkManager = require('NetworkManager');
var poker = require('Poker');
var BaseScene = require('BaseScene');

cc.Class({
    extends: BaseScene,

    properties: {
        content: cc.Node,
        itemGame : cc.Prefab,
        avatar_prefab : cc.Prefab,
        vv : cc.PageViewIndicator,
    },

    // use this for initialization
    onLoad: function () {
        // cc.log("on load game list");
        // var self = this;
        // this.content = this.scrollView.content;
        this.initListGame();


    },
    initListGame : function () {
        var containSize = this.content.getContentSize();
        this.n = 1;
        this.list_items = [];
        for(var i = 0; i < this.n; i ++){
            var item = cc.instantiate(this.itemGame);
            var item_comp = item.getComponent("LobbyGameItem");

            item_comp.init(i,function (index) {
                this.showItem(index);
                this.hoverItem(index,true);
            }.bind(this));

            item_comp.hoverEvent(function (index,isHover) {
                this.hoverItem(index,isHover);
            }.bind(this));

            var size = item_comp.node.getContentSize();
            //item.setPosition(cc.p(containSize.width/2 + (this.n/2 - i - 0.5)*size.width*0.78,0));
            item.setPosition(cc.p(size.width*0.78 * i + size.width/2,0));
            this.content.addChild(item,1);

            this.list_items.push(item);
        }
    },

    showItem: function (index) {
        for(var i = 0; i < this.n; i++){
            if(i != index){
                var item = this.list_items[i].getComponent("LobbyGameItem");
                item.node.setLocalZOrder(1);
                item.zoom(false);
            }
        }
    },

    hoverItem: function (index,isHover) {
        console.log("hoverItem =", index);
        var containSize = this.content.getContentSize();
        for(var i = 0; i < this.n; i++){
            var item = this.list_items[i];
            var item_comp = item.getComponent("LobbyGameItem");

            var size = item_comp.node.getContentSize();
            //var pos = cc.p(containSize.width/2 + (this.n/2 - i - 0.5)*size.width*0.78,0);
            var pos = cc.p(size.width*0.78 * i + size.width/2,0);
            if(index == 0){
                if(isHover && i != index){
                    var padding = i < index ? -1 : 1;
                    pos = pos.addSelf(cc.p(padding*0.15*size.width*0.78 + size.width*0.1,0));
                }else if(isHover && i == index && i == 0){
                    pos = pos.addSelf(cc.p(0.15*size.width*0.78 + size.width*0.025,0));
                }
            }else if(index == this.n - 1){
                if(isHover && i != index){
                    var padding = i < index ? -1 : 1;
                    pos = pos.addSelf(cc.p(padding*0.15*size.width*0.78 - size.width*0.38,0));
                }else if(isHover && i == index && i == this.n - 1){
                    pos = pos.addSelf(cc.p(0.15*size.width*0.78 - size.width*0.45,0));
                }
            }else{
                if(isHover && i != index){
                    var padding = i < index ? -1 : 1;
                    pos = pos.addSelf(cc.p(padding*0.15*size.width*0.78,0));
                }
            }

            item_comp.node.stopAllActions();

            item_comp.node.runAction(cc.moveTo(0.2,pos));
        }
    },
});
