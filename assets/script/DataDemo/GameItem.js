var NetworkManager = require('../Lib/NetworkManager.js');
cc.Class({
    extends: cc.Component,

    properties: {
        background: {
            default: null,
            type: cc.Button
        },
        money1: cc.Label,
        money2: cc.Label,
        money3: cc.Label
    },

    // use this for initialization
    init: function (rank, playerInfo) {

        var tagTabButton = [Config.TAG_GAME_ITEM.BACAY, Config.TAG_GAME_ITEM.POKER,
            Config.TAG_GAME_ITEM.TAIXIU, Config.TAG_GAME_ITEM.VQMM ];

        var url = "resources/icon_bacay.png";
        if(playerInfo === Config.TAG_GAME_ITEM.TAIXIU){
            url = "resources/icon_taixiu.png";
        }else if(playerInfo === Config.TAG_GAME_ITEM.VQMM){
            url =  "resources/icon_vqmm.png";
        }else if(playerInfo === Config.TAG_GAME_ITEM.POKER){
            url = "resources/icon_pocker.png";
        }else if(playerInfo === Config.TAG_GAME_ITEM.BACAY){
            url =  "resources/icon_bacay.png";
        }

        var image = cc.url.raw(url);
        var texture = cc.textureCache.addImage(image);
        this.background.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);

        var btn = this.background.getComponent(cc.Button);

        if(playerInfo === Config.TAG_GAME_ITEM.TAIXIU){
            btn.node._tag = Config.TAG_GAME_ITEM.TAIXIU;
        }else if(playerInfo === Config.TAG_GAME_ITEM.VQMM){
            btn.node._tag = Config.TAG_GAME_ITEM.VQMM;
        }else if(playerInfo === Common.ZONE_ID.POKER){
            btn.node._tag = Config.TAG_GAME_ITEM.POKER;
        }else if(playerInfo === Config.TAG_GAME_ITEM.BACAY){
            btn.node._tag = Config.TAG_GAME_ITEM.BACAY;
        }

        // this.money1.string = playerInfo.money1;
        // this.money2.string = playerInfo.money2;
        // this.money3.string = playerInfo.money3;


    },

    // called every frame
    update: function (dt) {

    },

    buttonEvent: function (e) {
        var tag = e.target._tag;
        Common.setGameTag(tag);
        var zoneId = Common.getZoneId();
        NetworkManager.requestEnterZoneMessage(Common.getZoneId());
    }

});
