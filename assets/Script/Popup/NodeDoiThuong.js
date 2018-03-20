var NetworkManager = require('NetworkManager');

cc.Class({
    extends: cc.Component,

    properties: {
        ui_left: cc.Node,
        tabLeftPrefab: cc.Prefab,
        scroll_view: cc.ScrollView,
        doithuong_itemPrefab: cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start: function() {

    },

    onLoad: function() {
        this.tabString = [];
        if(Common.assetsConfigList.length > 0) {
            Common.assetsConfigList.forEach(function(asset) {
                if(!this.tabString.includes(asset.provider))
                    this.tabString.push(asset.provider);
            }.bind(this));
            var item = cc.instantiate(this.tabLeftPrefab);
            item.getComponent("UITabLeft").setTab(this.tabString, 1, function(index){
                this.onLeftEvent(index-1);
            }.bind(this));
            this.ui_left.addChild(item);
        } else {
            Common.showToast("Kênh đổi thưởng đang bảo trì, vui lòng thử lại sau!");
        }
    },

    onLeftEvent: function(index) {
        cc.log("index:", index);
        this.itemsList = Common.assetsConfigList.filter(function(asset) {
            return asset.provider === this.tabString[index];
        }.bind(this));
        this.content = this.scroll_view.content;
        var innerSize = cc.size(this.content.getContentSize().width,
            this.content.getContentSize().height);
        var padding = 0;

        var length = this.itemsList.length;
        this.content.removeAllChildren(false);
        for(var i = 0; i < length; i++) {
            var assetItem = this.itemsList[i];
            var item = cc.instantiate(this.doithuong_itemPrefab);
            item.getComponent("ExchangeItem").init(assetItem);
            var size = item.getComponent('ExchangeItem').node.getContentSize();
            cc.log("item size:", size, ", i:", parseInt(i% 3));
            if(i == 0){
                padding = innerSize.width/3 - size.width;
                var ind = parseInt(length % 3);
                if(ind > 0) {
                    ind++;
                }
                innerSize = cc.size(innerSize.width,size.height*1.1*ind);
                this.content.setContentSize(innerSize);
            }

            var x = parseInt(i%3);
            var y = parseInt(i/3);

            var posX = (x - 1)*size.width * 1.25;
            var posY = (-0.7 - y)*size.height*1.15;

            item.setPositionX(posX);
            item.setPositionY(posY);
            this.content.addChild(item);
        }
    },
    onGameEvent: function() {
        NetworkManager.checkEvent(function(buffer) {
            return this.handleMessage(buffer);
        }.bind(this));
    },
    handleMessage: function(buffer) {
        var isDone = true;
        switch (buffer.message_id) {
            case NetworkManager.MESSAGE_ID.ASSET_CONFIG:
                break;
            default:
                isDone = false;
                break;
        }
        return isDone;
    },

    update : function(dt) {
        // this.onGameEvent();
    }
});
