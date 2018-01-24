cc.Class({
    extends: cc.Component,

    properties: {
        logoProvider: cc.Button
    },

    // use this for initialization
    onLoad: function () {

    },
    init: function (itemName, tag) {
        cc.log("tag =", tag);
        var url = "resources/common/popup/popup_ingame/popup_doithuong_vt_off.png";
        if(itemName === "Viettel"){
            url = "resources/common/popup/popup_ingame/popup_doithuong_vt_off.png";
        }else if(itemName === "Mobifone"){
            url =  "resources/common/popup/popup_ingame/popup_doithuong_mbf_off.png";
        }else if(itemName === "Vinaphone"){
            url = "resources/common/popup/popup_ingame/popup_doithuong_vnf_off.png";
        }else if(itemName === "MegaCard"){
            url =  "resources/common/popup/popup_ingame/popup_doithuong_vt_off.png";
        }else if(itemName === "ZING"){
            url =  "resources/common/popup/popup_ingame/popup_doithuong_vt_off.png";
        }else if(itemName === "BIT"){
            url =  "resources/common/popup/popup_ingame/popup_doithuong_vt_off.png";
        }

        var image = cc.url.raw(url);
        var texture = cc.textureCache.addImage(image);
        this.logoProvider.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);

        var btn = this.logoProvider.getComponent(cc.Button);
        btn.node._tag = tag;
    },
    clickProvider: function (e) {
        cc.log("tag =", e.target._tag);
    }
});
