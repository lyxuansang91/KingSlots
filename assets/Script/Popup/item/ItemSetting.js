// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        txtItem : cc.Label,
        bg_hightlight : cc.Node,
        btn_lk_gg : cc.Button,
        btn_lk_fb : cc.Button,
        btn_off : cc.Button,
        btn_on : cc.Button,
        btn_normal : cc.Button
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad :function() {

    },

    init : function (title,index,callback) {
        this.txtItem.string = title;
        this.index = index;
        this.callback = callback;
        this.checkItem(index);
    },

    checkItem : function (index) {
        if(index == 0 || index == 4){
            this.bg_hightlight.active = true;
        } else {
            this.hoverEvent();
        }

        switch(index){
            case 1:
                this.btn_lk_fb.node.active = true;
                break;
            // case 2:
            //     this.btn_lk_gg.node.active = true;
            //     break;
            case 5:
                var is_vibarte = Common.getPrefs(Config.prefKey.VIBARTE);
                if(is_vibarte){
                    this.btn_on.node.active = true;
                } else {
                    this.btn_off.node.active = true;
                }
                break;
            case 6:
                var is_sound = Common.getPrefs(Config.prefKey.SOUND);
                if(is_sound){
                    this.btn_on.node.active = true;
                } else {
                    this.btn_off.node.active = true;
                }
                break;
            case 0:
                this.btn_normal.node.active = false;
                break;
            case 4:
                this.btn_normal.node.active = false;
                break;
            default:
                this.btn_normal.node.active = true;
                break;
        }
    },

    onClickLkGooogle : function(){
        cc.log('onclick google');

    },

    onClickLkFacebook : function(){
        cc.log('onclick facebook');

    },

    onClickOff : function(){
        cc.log('onclick off');
        this.btn_off.node.active = false;
        this.btn_on.node.active = true;

        if(this.index == 5){
            //click vibrate setting
            Common.setPrefs(Config.prefKey.VIBARTE, true);
        } else if(this.index == 6){
            //click sound setting
            Common.setPrefs(Config.prefKey.SOUND, true);
        }
    },

    onClickOn : function(){
        cc.log('onclick on');
        this.btn_off.node.active = true;
        this.btn_on.node.active = false;

        if(this.index == 5){
            //click vibrate setting
            Common.setPrefs(Config.prefKey.VIBARTE, false);
        } else if(this.index == 6){
            //click sound setting
            Common.setPrefs(Config.prefKey.SOUND, false);
        }
    },

    onClickNormal : function(){
        cc.log('onclick normal');
        if(this.index == 2){
            //click promotion code

        } else if(this.index == 3){
            //click user info

        }
    },

    start : function () {

    },

    hoverEvent : function () {
        var self = this;

        this.node.on('mouseenter', function ( event ) {
            self.bg_hightlight.active = true;
        });
        this.node.on('mouseleave', function ( event ) {
            self.bg_hightlight.active = false;
        });
    },

    // update (dt) {},
});
