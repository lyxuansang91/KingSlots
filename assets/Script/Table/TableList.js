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
    exitZone: function() {
        cc.log("exit zone");
        NetworkManager.requestExitZoneMessage(Common.getZoneId());
    },

    tableList: function() {

        cc.log("listRoomPlay = ", Common.getListRoomPlay());
        var cashRoomList = Common.getListRoomPlay();
        var zoneId = Common.getZoneId();

        cc.log("zone id 1:", zoneId);

        cc.log("content =", this.content.getContentSize().width);

        var contentWidth = cashRoomList.length * 320;

        this.content.setContentSize(contentWidth, this.content.getContentSize().height);

        cc.log("contentWidth =", this.content.getContentSize().width);

        var url = "resources/common/scene/table/lbl_title_3cay.png";
        if(zoneId === Config.TAG_GAME_ITEM.TAIXIU){
            url = "resources/common/scene/table/lbl_title_vqmm.png";
        }else if(zoneId === Config.TAG_GAME_ITEM.VQMM){
            url =  "resources/common/scene/table/lbl_title_vqmm.png";
        }else if(zoneId === Config.TAG_GAME_ITEM.MINI_POKER){
            url = "resources/common/scene/table/lbl_title_poker.png";
        }else if(zoneId === Config.TAG_GAME_ITEM.MINI_BACAY){
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
                for(var i = 0; i < lstMessage.length; i++) {
                    var buffer = lstMessage[i];
                    this.handleMessage(buffer);
                }
            }
        }
    },
    exitRoomResponseHandler: function(resp) {

    },
    exitZoneResponseHandler: function(resp) {
        cc.log("exit zone response handler: ", resp.toObject());
        if(resp.getResponsecode()) {
            Common.setZoneId(-1);
            cc.director.loadScene("Lobby");
        }

        if(resp.hasMessage() && resp.getMessage() !== "") {

        }

    },

    handleMessage: function(buffer) {
        cc.log("buffer:", buffer);
        switch (buffer.message_id) {
            case NetworkManager.MESSAGE_ID.LOOK_UP_ROOM:
                var msg = buffer.response;
                this.getLookupRoomResponse(msg);
                break;
            case NetworkManager.MESSAGE_ID.ENTER_ROOM:
                var msg = buffer.response;
                this.enterRoomResponse(msg);
                break;
            case NetworkManager.MESSAGE_ID.EXIT_ROOM:
                var msg = buffer.response;
                this.exitRoomResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.EXIT_ZONE:
                var msg = buffer.response;
                this.exitZoneResponseHandler(msg);
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
    },
    enterRoomResponse: function(response){
        if (response !== 0) {
            if(response.hasZoneid()){
                var zoneId = response.getZoneid();
                if(zoneId === Common.getZoneId()){
                    if (response.getResponsecode()) {
                        var waitingPlayerList = [];
                        Common.setOwnerUserId(response.getOwneruserid());
                        var playerList = [];
                        for (var i = 0; i < response.getPlayingplayersList().length; i++) {
                            playerList.push(response.getPlayingplayersList()[i]);
                        }
                        for (var j = 0; j < response.getWaitingplayersList().length; j++){
                            waitingPlayerList.push(response.getWaitingplayersList()[j]);
                        }

                        if (response.hasRoomplay()){
                            // this.unscheduleUpdate();

                            var roomPlay = response.getRoomplay();

                            cc.log("roomPlay =", roomPlay);

                            //notify->onHideNotify();  //an thong bao di

                            // var is_create_room = (Common::getInstance()->getUserId() ==
                            // enterroomresponse->owneruserid()) ? true : false;

                            var is_create_room = true;

                            // auto miniGame = MiniGamePopUp::getInstance();
                            // miniGame->hiddenInfoExtend(true);
                            // miniGame->removeFromParentAndCleanup(true);

                            if (Common.getZoneId() === Common.ZONE_ID.MINI_BACAY) {
                                cc.log("ba cay");
                                // cc.director.preloadScene('Table', function () {
                                //     cc.log('Next BaCay scene preloaded');
                                // });
                                cc.director.loadScene('BaCay');
                                // var bacay = ThreeCardsScene::createScene(roomPlay, playerList,
                                //     waitingPlayerList, is_create_room,
                                //     this->getEnableDisplayRoomList(), enterroomresponse);
                                // REPLACESCENE(TIME_REPLACE_SCENE, bacay);
                            }
                            else if (Common.getZoneId() === Common.ZONE_ID.MINI_POKER) {
                                cc.log("poker");
                                cc.director.loadScene('minipoker');
                                // auto poker = PokerScene::createScene(roomPlay, playerList, waitingPlayerList, is_create_room,
                                //     this->getEnableDisplayRoomList(), enterroomresponse);
                                // REPLACESCENE(TIME_REPLACE_SCENE, poker);
                            }
                        }
                    }else{
                        // if (Common::getInstance()->isEnabledPurchaseCash() &&
                        //     !currentRoomTouch.passwordrequired() && !isEnoughEnterMoney()){
                        //     EnoughMoneyOnEventListener* b = new EnoughMoneyOnEventListener();
                        //     PopupMessageBox* popupMessage = new PopupMessageBox();
                        //     popupMessage->setEvent(b);
                        //     popupMessage->showPopup(enterroomresponse->message());
                        // }
                        // else {
                        //     showToast(enterroomresponse->message().c_str(), TIME_SHOW_TOAST);
                        // }
                    }
                }
                // else if(Common::getInstance()->inMiniGame(zoneId)){
                //     this->handlerMessageMiniGame(zoneId, enterroomresponse, NetworkManager::ENTER_ROOM);
                // }
            }
        }
    }
});
