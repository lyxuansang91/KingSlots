var NetworkManager = require('NetworkManager');

cc.Class({
    extends: cc.Component,

    properties: {
        background: {
            default: null,
            type: cc.Button
        },
        money1: cc.Label,
        money2: cc.Label,
        money3: cc.Label,
        m1_value: 0,
        m2_value: 0,
        m3_value: 0,
        box: cc.Sprite
    },
// I still can’t find a way to properly “pause” the game nor to make my message layer stop events from propagating, but I moved al

    // use this for initialization
    init: function (rank, playerInfo) {

        var tagTabButton = [Config.TAG_GAME_ITEM.MINI_BACAY, Config.TAG_GAME_ITEM.MINI_POKER,
            Config.TAG_GAME_ITEM.TAIXIU, Config.TAG_GAME_ITEM.VQMM ];

        var url = "resources/common/scene/lobby/icon_bacay.png";
        if(playerInfo === Config.TAG_GAME_ITEM.TAIXIU){
            url = "resources/common/scene/lobby/icon_taixiu.png";
        }else if(playerInfo === Config.TAG_GAME_ITEM.VQMM){
            url =  "resources/common/scene/lobby/icon_vqmm.png";
        }else if(playerInfo === Config.TAG_GAME_ITEM.MINI_POKER){
            url = "resources/common/scene/lobby/icon_pocker.png";
        }else if(playerInfo === Config.TAG_GAME_ITEM.MINI_BACAY){
            url =  "resources/common/scene/lobby/icon_bacay.png";
        }

        if(playerInfo === Config.TAG_GAME_ITEM.TAIXIU) {
            this.box.node.active = false;
            this.money1.node.active = false;
            this.money2.node.active = false;
            this.money3.node.active = false;
        }

        var image = cc.url.raw(url);
        var texture = cc.textureCache.addImage(image);
        this.background.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);

        var btn = this.background.getComponent(cc.Button);

        if(playerInfo === Config.TAG_GAME_ITEM.TAIXIU){
            btn.node._tag = Config.TAG_GAME_ITEM.TAIXIU;
        }else if(playerInfo === Config.TAG_GAME_ITEM.VQMM){
            btn.node._tag = Config.TAG_GAME_ITEM.VQMM;
        }else if(playerInfo === Common.ZONE_ID.MINI_POKER){
            btn.node._tag = Config.TAG_GAME_ITEM.MINI_POKER;
        }else if(playerInfo === Config.TAG_GAME_ITEM.MINI_BACAY){
            btn.node._tag = Config.TAG_GAME_ITEM.MINI_BACAY;
        }
    },


    updateJarMoney: function(value, jarType) {

        // var btn = this.background.getComponent(cc.Button);
        switch (jarType) {
            case 1:
                if(this.m1_value < value) {
                    Common.updateMoney(this.money1, this.m1_value, this.m1_value, value);
                    this.m1_value = value;
                }
                break;
            case 2:
                if(this.m2_value < value) {
                    Common.updateMoney(this.money2, this.m2_value, this.m2_value, value);
                    this.m2_value = value;
                }
                break;
            case 3:
                if(this.m3_value < value) {
                    Common.updateMoney(this.money3, this.m3_value, this.m3_value, value);
                    this.m3_value = value;
                }
                break;
            default:
                break;
        }
    },

    // called every frame
    update: function (dt) {

    },

    buttonEvent: function (e) {
        var tag = e.target._tag;
        Common.setGameTag(tag);
        var zoneId = Common.getZoneId();
        Common.setCurrentZoneId(zoneId);
        NetworkManager.requestEnterZoneMessage(Common.getZoneId());
    }

});
