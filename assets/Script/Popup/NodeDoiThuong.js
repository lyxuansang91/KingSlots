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
            cc.log("asset config list:", Common.assetsConfigList);
            Common.assetsConfigList.forEach(function(asset) {
                if(!this.tabString.includes(asset.provider))
                    this.tabString.push(asset.provider);
            }.bind(this));
            cc.log("tab string:", this.tabString);
            var item = cc.instantiate(this.tabLeftPrefab);
            item.getComponent("UITabLeft").setTab(this.tabString, 1, function(index){
                this.onLeftEvent(index-1);
            }.bind(this));
            this.ui_left.addChild(item);
        } else {
            NetworkManager.requestAssetsConfigMessage(1);
        }
    },

    onLeftEvent: function(index) {
        cc.log("index:", index);
        this.itemsList = Common.assetsConfigList.filter(function(asset) {
            return asset.provider === this.tabString[index];
        });
        cc.log("item list:", this.itemsList);
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
