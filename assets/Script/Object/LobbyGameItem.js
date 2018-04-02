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
        money: cc.Label,
        m1_value: 0,
        m2_value: 0,
        m3_value: 0,
        box: cc.Sprite,
        box_vqmm: cc.Sprite,
        list_frame: [cc.SpriteFrame]
    },

    init: function (index, playerInfo) {

        var tagTabButton = [Config.TAG_GAME_ITEM.MINI_BACAY, Config.TAG_GAME_ITEM.MINI_POKER,
            Config.TAG_GAME_ITEM.TAIXIU, Config.TAG_GAME_ITEM.VQMM,Config.TAG_GAME_ITEM.TREASURE];

        this.tag = tagTabButton[index];

        if(playerInfo === Config.TAG_GAME_ITEM.TAIXIU) {
            this.box.node.active = false;
        }else if(playerInfo === Config.TAG_GAME_ITEM.VQMM){
            this.box.node.active = false;
            this.box_vqmm.node.active = true;
        }

        this.background.getComponent(cc.Sprite).spriteFrame = this.list_frame[index];
    },

    updateJarMoney: function(value, jarType) {
        switch (jarType) {
            case 1:
                if(this.m1_value < value) {
                    Common.countNumberAnim(this.money1, this.m1_value, value, 0, 1);
                    this.m1_value = value;
                }
                break;
            case 2:
                if(this.m2_value < value) {
                    Common.countNumberAnim(this.money2, this.m2_value, value, 0, 1);
                    this.m2_value = value;
                }
                break;
            case 3:
                if(this.m3_value < value) {
                    Common.countNumberAnim(this.money3, this.m3_value, value, 0, 1);
                    this.m3_value = value;
                }
                break;
            default:
                break;
        }
    },

    buttonEvent: function () {

        var tag = this.tag;
        cc.log("tag:", tag, ", vqmm:", Config.TAG_GAME_ITEM.VQMM);
        if(tag === Config.TAG_GAME_ITEM.VQMM) {
            Common.showToast("Game đang cập nhật vui lòng thử lại!");
            return;
        }
        Common.setGameTag(tag);
        var zoneId = Common.getZoneId();
        Common.setCurrentZoneId(zoneId);
        NetworkManager.requestEnterZoneMessage(Common.getZoneId());
    }

});
