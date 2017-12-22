cc.Class({
    extends: cc.Component,

    properties: {
        titleGame: cc.Sprite,
        scrollView: cc.ScrollView,
        prefabTableItem: cc.Prefab,
        rankCount: 0
    },

    // use this for initialization
    onLoad: function () {
        this.content = this.scrollView.content;
        this.tableList();
    },

    tableList: function() {
        //get list table from cashRoomList
        // var cashRoomList = proto.BINRoomConfig.deserializeBinary(Common.getCashRoomList());
        var cashRoomList = Common.getCashRoomList();
        //cc.log("cashRoomList = ", cashRoomList[0].getRoomgroupid());
        var zoneId = 1;

        var url = "resources/Table/BaCay/lbl_title.png";
        if(zoneId === Config.TAG_GAME_ITEM.TAIXIU){
            url = "resources/Table/BaCay/lbl_title.png";
        }else if(zoneId === Config.TAG_GAME_ITEM.VQMM){
            url =  "resources/Table/BaCay/lbl_title.png";
        }else if(zoneId === Config.TAG_GAME_ITEM.POKER){
            url = "resources/Table/BaCay/lbl_title.png";
        }else if(zoneId === Config.TAG_GAME_ITEM.BACAY){
            url =  "resources/Table/BaCay/lbl_title.png";
        }

        var image = cc.url.raw(url);
        var texture = cc.textureCache.addImage(image);
        this.titleGame.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);

        for (var i = 0; i < cashRoomList.length; ++i) {
            var item = cc.instantiate(this.prefabTableItem);
            item.getComponent('TableItem').init(cashRoomList[i]);
            item.setPositionY(this.content.getContentSize().height*0.06);
            this.content.addChild(item);
        }
    },
});
