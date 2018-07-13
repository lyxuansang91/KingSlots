var NetworkManager = require('NetworkManager');
var Popup = require('Popup');

cc.Class({
    extends: Popup,

    properties: {
        body : cc.Node,
        user_money : cc.Label,
        node_nm_viettel: cc.Node,
        node_nm_vina: cc.Node,
        node_nm_mobi: cc.Node,
        nm_frames : [cc.SpriteFrame],
        itemExchangeCardPrefab : cc.Prefab,
        scrollView: cc.ScrollView,
        lstAsset: [],
        lstAssetConfig : [],
        NUMBER_ITEM_ROW: 3
    },

    onLoad: function () {
        // NetworkManager.requestAssetsConfigMessage(Config.AssetConfig.THE_CAO);
        this.loadTab("VNP");
        this.user_money.string = Common.getCash();
    },

    handleMessage: function(buffer) {
        var isDone = true;
        var resp = buffer.response;
        switch(buffer.message_id) {
            case NetworkManager.MESSAGE_ID.ASSET_CONFIG:
                this.handlerAssetConfigResponse(resp);
                break;
            case NetworkManager.MESSAGE_ID.EXCHANGE_ASSET:
                this.handlerExchangeAssetResponse(resp);
                break;
            default:
                isDone = false;
                break;
        }
        return isDone;
    },
    onGameEvent: function() {
        NetworkManager.checkEvent(function(buffer) {
            return this.handleMessage(buffer);
        }.bind(this));
    },
    update: function(dt) {
        this.onGameEvent();
    },

    handlerAssetConfigResponse: function(response){
        if (response != null){
            if (response.getResponsecode() && response.getAssetsList().length > 0){
                this.scrollView.removeAllChildren(true);
                for (var i = 0; i < response.getAssetsList().length; i++){
                    this.lstAssetConfig.push(response.getAssetsList()[i]);
                }

                this.setAssets(this.lstAssetConfig);
                // this->enableUserSecurityKey = response->enablesecuritycheck();
                // showTheCao();
            }
        else if (response.hasMessage()){
                Common.showToast(response.getMessage());
            }
        }
    },

    handlerExchangeAssetResponse: function(response){
        if (response != null){
            if (response.hasMessage()){
                Common.showToast(response.getMessage());
            }
        }
    },

    tableftEvent : function (event,data) {
        console.log("xxxx",data);
        this.loadTab(data);
    },

    loadTab : function (index) {
        if(index == "VTT"){
            this.node_nm_viettel.getComponent(cc.Sprite).spriteFrame = this.nm_frames[1];
            this.node_nm_vina.getComponent(cc.Sprite).spriteFrame = this.nm_frames[0];
            this.node_nm_mobi.getComponent(cc.Sprite).spriteFrame = this.nm_frames[0];
        } else if(index == "VMS"){
            this.node_nm_viettel.getComponent(cc.Sprite).spriteFrame = this.nm_frames[0];
            this.node_nm_vina.getComponent(cc.Sprite).spriteFrame = this.nm_frames[0];
            this.node_nm_mobi.getComponent(cc.Sprite).spriteFrame = this.nm_frames[1];
        } else if(index == "VNP"){
            this.node_nm_viettel.getComponent(cc.Sprite).spriteFrame = this.nm_frames[0];
            this.node_nm_vina.getComponent(cc.Sprite).spriteFrame = this.nm_frames[1];
            this.node_nm_mobi.getComponent(cc.Sprite).spriteFrame = this.nm_frames[0];
        }
        this.lstAssetConfig = [];

        var sizeObj = Common.assetsConfigList.length;

        for (var i = 0; i < sizeObj; i++){
            if (Common.assetsConfigList[i].provider === index){
                this.lstAssetConfig.push(Common.assetsConfigList[i]);
            }
        }

        var innerSize = cc.size(this.scrollView.content.getContentSize().width, 0);
        var num = this.lstAssetConfig.length;
        var self = this;
        this.scrollView.content.removeAllChildren();

        var num_item_row = 2;
        var size = this.scrollView.content.getContentSize();
        var width_row_size = size.width / num_item_row;
        var height_row_size = size.height / 2.5;


        for(var i = 0; i < num; i++){
            var pos = cc.p(-size.width / 2 + width_row_size * (parseInt(i % num_item_row) + .5), -height_row_size * (parseInt(i / num_item_row) + .5));
            var item = cc.instantiate(this.itemExchangeCardPrefab);
            var assetId = this.lstAssetConfig[i].assetid;
            item.getComponent('ItemExchangeCard').init(this.lstAssetConfig[i].parvalue,this.lstAssetConfig[i].cashvalue, assetId, function (index) {
                console.log("index =", index);
                self.selectLstItem(index);
            });
            // var size = item.getComponent('ItemExchangeCard').node.getContentSize();

            // item.setPosition(cc.p(0, - (0.5 + i)*item.height * 1.1));

            item.setPosition(cc.p(pos.x, pos.y));

            // innerSize.height += size.height*1.1;

            this.scrollView.content.addChild(item);
        }

        // this.scrollView.content.setContentSize(innerSize);


    },

    resetButton : function () {
        this.node_nm_viettel.getComponent(cc.Sprite).spriteFrame = this.nm_frames[0];
        this.node_nm_vina.getComponent(cc.Sprite).spriteFrame = this.nm_frames[0];
        this.node_nm_mobi.getComponent(cc.Sprite).spriteFrame = this.nm_frames[0];
    },

    setAssets: function(assets){
        this.lstAsset = assets;
    },

    selectLstItem: function (assetId) {
        cc.log("assetId selectLstItem =", assetId);
        var confirmMess = "Bạn có chắc chắn muốn đổi thẻ không?"
        Common.showPopup(Config.name.POPUP_MESSAGE_BOX,function(message_box) {
            message_box.init(confirmMess, Config.COMMON_POPUP_TYPE.MESSAGE_BOX.MESSAGEBOX_TYPE, function() {
                cc.log("call back");
                NetworkManager.getExchangeAssetFromServer(assetId,1,"","","");
            });
            message_box.appear();
        });

    }


});
