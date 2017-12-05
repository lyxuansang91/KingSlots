const gameItems = require('GameItemData').gameItems;

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
        for (var i = 0; i < this.rankCount; ++i) {
            var gameItem = gameItems[i];
            var item = cc.instantiate(this.prefabGameItem);
            item.getComponent('GameItem').init(i, gameItem);
            this.content.addChild(item);
            cc.log(i);
        }
    },

    scrollToLeft: function(){
        this.scrollView.jumpTo()
    },

    scrollToRight: function(){
        this.scrollView.jumpTo(0.25,100);
    },

    // called every frame
    update: function (dt) {

    },
});
