var NetworkManager = require('NetworkManager');
cc.Class({
    extends: cc.Component,

    properties: {
        btnTable: {
            default: null,
            type: cc.Button
        },
        imgTable: {
            default: null,
            type: cc.Sprite
        },
        imgHu: {
            default: null,
            type: cc.Sprite
        },
        lblHu: {
            default: null,
            type: cc.Label
        },
        lblMoney: {
            default: null,
            type: cc.Label
        }
    },

    // use this for initialization
    onLoad: function () {

    },

    init: function (cashRoomList) {

        cc.log("cashRoomList =", cashRoomList);

        var roomIndex = cashRoomList.getRoomindex();
        var minBet = cashRoomList.getMinbet();
        var minEnterMoney = cashRoomList.getMinentermoney();
        var playerSize = cashRoomList.getPlayersize();//số người chơi tối đa
        var playingPlayer = cashRoomList.getPlayingplayer();//số người đang ngồi chơi
        var isPlaying = cashRoomList.getIsplaying();
        var roomConfig = cashRoomList.getRoomconfig();

        var url = "resources/common/scene/table/btn_tapsu.png";
        var url_imgTable = "resources/common/scene/table/txt_tapsu.png";
        if(minBet <= 5000){
            url = "resources/common/scene/table/btn_choithu.png";
            url_imgTable = "resources/common/scene/table/txt_choithu.png";
        }else if(minBet <= 10000 && minBet > 5000){
            url =  "resources/common/scene/table/btn_tapsu.png";
            url_imgTable = "resources/common/scene/table/txt_tapsu.png";
        }else if(minBet <= 100000 && minBet > 10000){
            url = "resources/common/scene/table/btn_caothu.png";
            url_imgTable = "resources/common/scene/table/txt_caothu.png";
        }else if(minBet > 100000){
            url =  "resources/common/scene/table/btn_badao.png";
            url_imgTable = "resources/common/scene/table/txt_badao.png";
        }
        var image = cc.url.raw(url);
        var texture = cc.textureCache.addImage(image);
        this.btnTable.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);

        var imageTable = cc.url.raw(url_imgTable);
        var textureTable = cc.textureCache.addImage(imageTable);
        this.imgTable.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(textureTable);

        var btn = this.btnTable.getComponent(cc.Button);
        btn.node._tag = roomIndex;

    },
    enterRoom: function (e) {
        var tag = e.target._tag;
        cc.log("tag =", tag);
        NetworkManager.getEnterRoomMessageFromServer(tag, "");
    }
});
