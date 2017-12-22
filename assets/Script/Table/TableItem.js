cc.Class({
    extends: cc.Component,

    properties: {
        btnTable: {
            default: null,
            type: cc.Button
        },
        imgTable: cc.Sprite,
        imgHu: cc.Sprite,
        lblHu: cc.Label,
        lblMoney: cc.Label
    },

    // use this for initialization
    onLoad: function () {

    },

    init: function (cashRoomList) {

        cc.log("cashRoomList =", cashRoomList);

        var groupId = cashRoomList.getRoomgroupid();
        var minBet = cashRoomList.getMinbet();
        var minCash = cashRoomList.getMincash();
        var roomname = cashRoomList.getRoomname();
        var viproom = cashRoomList.getViproom();
        var minlevel = cashRoomList.getMinlevel();
        var roomcapacity = cashRoomList.getRoomcapacity();
        var playersize = cashRoomList.getPlayersize();
        var tax = cashRoomList.getTax();
        var active = cashRoomList.getActive();

        var url = "resources/Table/BaCay/btn_tapsu.png";
        if(minBet <= 5000){
            url = "resources/Table/BaCay/btn_choithu.png";
        }else if(minBet <= 10000 && minBet > 5000){
            url =  "resources/Table/BaCay/btn_tapsu.png";
        }else if(minBet <= 100000 && minBet > 10000){
            url = "resources/Table/BaCay/btn_caothu.png";
        }else if(minBet > 100000){
            url =  "resources/Table/BaCay/btn_badao.png"; 
        }
        cc.log("url =", url);
        var image = cc.url.raw(url);
        var texture = cc.textureCache.addImage(image);
        this.btnTable.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);

        //
        // var btn = this.background.getComponent(cc.Button);
        //
        // if(playerInfo === Config.TAG_GAME_ITEM.TAIXIU){
        //     btn.node._tag = Config.TAG_GAME_ITEM.TAIXIU;
        // }else if(playerInfo === Config.TAG_GAME_ITEM.VQMM){
        //     btn.node._tag = Config.TAG_GAME_ITEM.VQMM;
        // }else if(playerInfo === Common.ZONE_ID.POKER){
        //     btn.node._tag = Config.TAG_GAME_ITEM.POKER;
        // }else if(playerInfo === Config.TAG_GAME_ITEM.BACAY){
        //     btn.node._tag = Config.TAG_GAME_ITEM.BACAY;
        // }



    }
});
