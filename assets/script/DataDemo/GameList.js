const gameItems = require('GameItemData').gameItems;
var Common = require('Common');
cc.Class({
    extends: cc.Component,

    properties: {
        scrollView: cc.ScrollView,
        prefabGameItem: cc.Prefab,
        rankCount: 0
    },

    // use this for initialization
    onLoad: function () {
        this.content = this.scrollView.content;
        this.populateList();
    },

    populateList: function() {
        var listGame = Common.getEnableGameIds();
        for (var i = 0; i < listGame.length; ++i) {
            var gameItem = gameItems[i];
            var item = cc.instantiate(this.prefabGameItem);
            item.getComponent('GameItem').init(i, gameItem);
            item.setPositionY(this.content.getContentSize().height*0.06);
            // item.setPositionX(item.getContentSize().width* (1.8*i + 0.2));
            item.setTag(this.getGameTag());
            this.content.addChild(item);
        }
    },

    scrollToLeft: function(){
       //this.scrollView.jumpTo()
    },

    scrollToRight: function(){
        this.scrollView.jumpTo(0.25,100);
    },

    // called every frame
    update: function (dt) {

    },

    getGameTag: function () {
        var enableGameIds = Common.getEnableGameIds();
        cc.log()
        for (var j = 0; j < enableGameIds.length; j++) {
            return enableGameIds[j];
        }
    }
});
