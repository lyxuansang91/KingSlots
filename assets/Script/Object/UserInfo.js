cc.Class({
    extends: cc.Component,

    properties: {
        avatar: cc.Sprite,
        displayName: cc.Label,
        txt_level: cc.Label,
        txt_id: cc.Label,
        txt_phone: cc.Label,
        txt_chiso: cc.Label,
        txt_sovanchoi: cc.Label,
        txt_sovanthang: cc.Label,
        txt_sovanthua: cc.Label,
    },

    // use this for initialization
    onLoad: function () {

    },
    init: function (avatar, displayName, level, id, phone, chiso, sovanchoi, sovanthang, sovanthua, cash) {
        this.displayName.string = displayName;
        this.txt_level.string = level;
        this.txt_id.string = id;
        this.txt_phone.string = phone;
        this.txt_chiso.string = chiso;
        this.txt_sovanchoi.string = sovanchoi;
        this.txt_sovanthang.string = sovanthang;
        this.txt_sovanthua.string = sovanthua;


    }

});
