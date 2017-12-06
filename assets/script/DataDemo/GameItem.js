cc.Class({
    extends: cc.Component,

    properties: {
        background: cc.Sprite,
        money1: cc.Label,
        money2: cc.Label,
        money3: cc.Label
    },

    // use this for initialization
    init: function (rank, playerInfo) {

        var url = "resources/icon_bacay.png";
        if(playerInfo.stt == 1){
            url = "resources/icon_taixiu.png";
        }else if(playerInfo.stt == 2){
            url =  "resources/icon_vqmm.png";
        }else if(playerInfo.stt == 3){
            url = "resources/icon_pocker.png";
        }else if(playerInfo.stt == 4){
            url =  "resources/icon_bacay.png";
        }

        var image = cc.url.raw(url);
        var texture = cc.textureCache.addImage(image);
        this.background.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        
        this.money1.string = playerInfo.money1;
        this.money2.string = playerInfo.money2;
        this.money3.string = playerInfo.money3;
    },

    // called every frame
    update: function (dt) {

    },
});
