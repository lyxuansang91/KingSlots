var Popup = require('Popup');
var NetworkManager = require('NetworkManager');
cc.Class({
    extends: Popup,

    properties: {
        list_frame: [cc.SpriteFrame],
        musicBtn: cc.Button,
        soundBtn: cc.Button,
        vibrateBtn: cc.Button,
        musicLbl: cc.Label,
        soundLbl: cc.Label,
        vibrateLbl: cc.Label
    },

    onLoad : function () {
        var musicStatus = Common.getPrefs(Config.prefKey.MUSIC);
        var soundStatus = Common.getPrefs(Config.prefKey.SOUND);
        var vibrateStatus = Common.getPrefs(Config.prefKey.VIBARTE);
        if(musicStatus === "true"){
            this.musicBtn.getComponent(cc.Sprite).spriteFrame = this.list_frame[1];
            this.musicLbl.string = Common.KEYTEXT.BAT;
        } else {
            this.musicBtn.getComponent(cc.Sprite).spriteFrame = this.list_frame[0];
            this.musicLbl.string = Common.KEYTEXT.TAT;
        }

        if(soundStatus === "true"){
            this.soundBtn.getComponent(cc.Sprite).spriteFrame = this.list_frame[1];
            this.soundLbl.string = Common.KEYTEXT.BAT;
        } else {
            this.soundBtn.getComponent(cc.Sprite).spriteFrame = this.list_frame[0];
            this.soundLbl.string = Common.KEYTEXT.TAT;
        }

        if(vibrateStatus === "true"){
            this.vibrateBtn.getComponent(cc.Sprite).spriteFrame = this.list_frame[1];
            this.vibrateLbl.string = Common.KEYTEXT.BAT;
        } else {
            this.vibrateBtn.getComponent(cc.Sprite).spriteFrame = this.list_frame[0];
            this.vibrateLbl.string = Common.KEYTEXT.TAT;
        }
    },

    connectFacebook: function () {
        Common.openIdConnectRequest(Common.FACEBOOK_CHANNEL);
    },

    onClickExit: function(){

        Common.showPopup(Config.name.POPUP_MESSAGE_BOX,function(message_box) {
            message_box.init(Common.KEYTEXT.MSG_LOG_OUT, Config.COMMON_POPUP_TYPE.MESSAGE_BOX.MESSAGEBOX_TYPE, function() {
                NetworkManager.getLogoutMessageFromServer(true);
            });
            message_box.appear();
        });
    },

    musicClick: function () {
        this.changeOnOffSetting(Config.prefKey.MUSIC);
    },

    soundClick: function () {
        this.changeOnOffSetting(Config.prefKey.SOUND);
    },

    vibrateClick: function () {
        this.changeOnOffSetting(Config.prefKey.VIBARTE);
    },

    changeOnOffSetting: function(pkey) {
        if (Common.getPrefs(pkey) === 'true'){
            Common.setPrefs(pkey, false);
            if(pkey === Config.prefKey.MUSIC){
                this.musicBtn.getComponent(cc.Sprite).spriteFrame = this.list_frame[0];
                this.musicLbl.string = Common.KEYTEXT.TAT;
            } else if(pkey === Config.prefKey.SOUND){
                this.soundBtn.getComponent(cc.Sprite).spriteFrame = this.list_frame[0];
                this.soundLbl.string = Common.KEYTEXT.TAT;
            } else if(pkey === Config.prefKey.VIBARTE){
                this.vibrateBtn.getComponent(cc.Sprite).spriteFrame = this.list_frame[0];
                this.vibrateLbl.string = Common.KEYTEXT.TAT;
            }
        }
        else {
            Common.setPrefs(pkey, true);
            if(pkey === Config.prefKey.MUSIC){
                this.musicBtn.getComponent(cc.Sprite).spriteFrame = this.list_frame[1];
                this.musicLbl.string = Common.KEYTEXT.BAT;
            } else if(pkey === Config.prefKey.SOUND){
                this.soundBtn.getComponent(cc.Sprite).spriteFrame = this.list_frame[1];
                this.soundLbl.string = Common.KEYTEXT.BAT;
            } else if(pkey === Config.prefKey.VIBARTE){
                this.vibrateBtn.getComponent(cc.Sprite).spriteFrame = this.list_frame[1];
                this.vibrateLbl.string = Common.KEYTEXT.BAT;
            }
        }
    }
});
