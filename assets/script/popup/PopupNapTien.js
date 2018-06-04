var NetworkManager = require('NetworkManager');
var Popup = require('Popup');

cc.Class({
    extends: Popup,

    properties: {
        body : cc.Node,
        user_money : cc.Label,
        btn_thecao : cc.Node,
        btn_sms : cc.Node,

        btn_thecao_frames : [cc.SpriteFrame],
        btn_sms_frames : [cc.SpriteFrame],
    },

    onLoad: function () {
        this.loadTab(1);
        this.user_money.string = Common.getCash();
    },

    tableftEvent : function (event,data) {
        console.log("xxxx",data);
        if(data == 1 || data == 2) {
            var index = parseInt(data);
            this.loadTab(index);
        }
    },

    loadTab : function (index) {
        var nodeNapThe = this.body.getChildByName("NodeNapThe");
        var nodeNapSms = this.body.getChildByName("NodeNapSMS");
        var nodeNapIAP = this.body.getChildByName("NodeNapIAP");
        switch(index) {
            case 1:
                if(Common.providerLists.length > 0) {

                    this.btn_thecao.getComponent(cc.Sprite).spriteFrame = this.btn_thecao_frames[1];
                    this.btn_sms.getComponent(cc.Sprite).spriteFrame = this.btn_sms_frames[0];

                    nodeNapThe.active = true;
                    nodeNapSms.active = false;
                    nodeNapIAP.active = false;
                    nodeNapThe.getComponent("NodeNapThe").initTabLeft();
                } else {
                    Common.showToast("Kênh nạp thẻ đang bảo trì, vui lòng thử lại!");
                }
                break;
            case 2:
                if(Common.smsConfigLists.length > 0) {

                    this.btn_thecao.getComponent(cc.Sprite).spriteFrame = this.btn_thecao_frames[0];
                    this.btn_sms.getComponent(cc.Sprite).spriteFrame = this.btn_sms_frames[1];

                    nodeNapThe.active = false;
                    nodeNapSms.active = true;
                    nodeNapIAP.active = false;
                    nodeNapSms.getComponent("NodeNapSMS").initTabLeft();
                } else {
                    Common.showToast("Kênh nạp SMS đang bảo trì, vui lòng thử lại!");
                }
                break;
            case 3:

                break;
            default:
                break;
        }
    }


});
