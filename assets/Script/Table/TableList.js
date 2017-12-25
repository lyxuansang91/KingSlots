var NetworkManager = require('NetworkManager');
cc.Class({
    extends: cc.Component,

    properties: {
        titleGame: {
            default: null,
            type: cc.Sprite
        },
        scrollView: cc.ScrollView,
        prefabTableItem: cc.Prefab,
        rankCount: 0
    },

    // use this for initialization
    onLoad: function () {
        this.content = this.scrollView.content;
        NetworkManager.getLookUpRoomRequest(Common.getZoneId(), 1, -1, -1, Config.TABLE_ORDERBY.NUM_PLAYER, false, -1);  //TABLE_ORDERBY::NUM_PLAYER, false
        window.ws.onmessage = this.ongamestatus.bind(this);
    },

    tableList: function() {
        //get list table from cashRoomList
        // var cashRoomList = proto.BINRoomConfig.deserializeBinary(Common.getCashRoomList());
        cc.log("listRoomPlay = ", Common.getListRoomPlay());
        var cashRoomList = Common.getListRoomPlay();
        //cc.log("cashRoomList = ", cashRoomList[0].getRoomgroupid());
        var zoneId = Common.getZoneId();

        var contentWidth = cashRoomList.length * 420;

        // this.content.setInnerContainerSize(contentWidth, this.content.getContentSize().height);


        var url = "resources/common/scene/table/lbl_title_3cay.png";
        if(zoneId === Config.TAG_GAME_ITEM.TAIXIU){
            url = "resources/common/scene/table/lbl_title_vqmm.png";
        }else if(zoneId === Config.TAG_GAME_ITEM.VQMM){
            url =  "resources/common/scene/table/lbl_title_vqmm.png";
        }else if(zoneId === Config.TAG_GAME_ITEM.POKER){
            url = "resources/common/scene/table/lbl_title_poker.png";
        }else if(zoneId === Config.TAG_GAME_ITEM.BACAY){
            url =  "resources/common/scene/table/lbl_title_3cay.png";
        }

        var image = cc.url.raw(url);
        var texture = cc.textureCache.addImage(image);
        this.titleGame.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);

        for (var i = 0; i < cashRoomList.length; ++i) {
            var item = cc.instantiate(this.prefabTableItem);
            item.getComponent('TableItem').init(cashRoomList[i]);
            item.setPositionY(this.content.getContentSize().height*0.06);
            this.content.addChild(item);
        }

    },

    ongamestatus: function(event) {
        cc.log("response text msg:" + event);
        if(event.data!==null || event.data !== 'undefined') {
            var lstMessage = NetworkManager.parseFrom(event.data, event.data.byteLength);
            cc.log("list message size:" + lstMessage.length);
            if(lstMessage.length > 0) {
                var buffer = lstMessage.shift();
                cc.log("buffer:" , buffer);
                this.handleMessage(buffer);
            }
        }
    },

    handleMessage: function(buffer) {
        cc.log("buffer:", buffer);
        switch (buffer.message_id) {
            case NetworkManager.MESSAGE_ID.LOOK_UP_ROOM:
                var msg = buffer.response;
                this.getLookupRoomResponse(msg);
                break;
        }
    },
    getLookupRoomResponse: function(response){
        if (response != 0){
            if (response.getResponsecode()){
                Common.setListRoomPlay(null);
                var roomListInfo = [];
                if (response.getRoominfosList().length > 0) {
                    for (var i = 0; i < response.getRoominfosList().length; i++) {
                        roomListInfo.push(response.getRoominfosList()[i]);
                    }
                }
                cc.log("roomListInfo", roomListInfo);
                Common.setListRoomPlay(roomListInfo);

                this.tableList();
            }

            // if (response->has_message() && !response->message().empty()) {
            //     this->showToast(response->message().c_str(), TIME_SHOW_TOAST);
            // }
        }
    }
});
