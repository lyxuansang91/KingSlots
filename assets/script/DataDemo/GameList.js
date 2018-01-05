const gameItems = require('GameItemData').gameItems;
var NetworkManager = require('NetworkManager');
cc.Class({
    extends: cc.Component,

    properties: {
        scrollView: cc.ScrollView,
        prefabGameItem: cc.Prefab,
        rankCount: 0
    },

    // use this for initialization
    onLoad: function () {
        this.content = this.scrollView.content;
        this.populateList();

        cc.director.preloadScene('Table', function () {
            cc.log('Next Login scene preloaded');
        });
        this.scheduleOnce(this.goSceneTable, 1);
    },

    populateList: function() {
        var listGame = [20,19,17,18];
        var contentWidth = listGame.length * 300;
        this.content.setContentSize(contentWidth, this.content.getContentSize().height);
        for (var i = 0; i < listGame.length; ++i) {
            var item = cc.instantiate(this.prefabGameItem);
            item.getComponent('GameItem').init(i, listGame[i]);
            item.setPositionY(this.content.getContentSize().height*0.06);
            this.content.addChild(item);
        }
    },

    scrollToLeft: function(){
       //this.scrollView.jumpTo()
    },

    scrollToRight: function(){
        this.scrollView.jumpTo(0.25,100);
    },

    // called every frame
    update: function (dt) {

    },

    goSceneTable: function() {
        window.ws.onmessage = this.ongamestatus.bind(this);
        this.unschedule(this.goSceneTable);
    },

    ongamestatus: function(event) {
        if(event.data!==null || event.data !== 'undefined') {
            var lstMessage = NetworkManager.parseFrom(event.data, event.data.byteLength);
            if(lstMessage.length > 0) {
                var buffer = lstMessage.shift();
                this.handleMessage(buffer);
            }
        }
    },

    handleMessage: function(buffer) {
        switch (buffer.message_id) {
            case NetworkManager.MESSAGE_ID.ENTER_ZONE:
                var msg = buffer.response;
                this.enterZoneMessageResponseHandler(msg);
                break;
        }
    },

    enterZoneMessageResponseHandler: function(enterZoneMessage) {
        if (enterZoneMessage != 0) {
            //common.initialize = initialMessage.responseCode;
            if (enterZoneMessage.getResponsecode()) {

                var zoneId = enterZoneMessage.getZoneid();
                Common.setZoneId(zoneId);

                Common.setRequestRoomType(enterZoneMessage.getDefaultroomtypeload());
                if (enterZoneMessage.hasEnabledisplayroomlist() &&
                    enterZoneMessage.getEnabledisplayroomlist()) {
                    /*
                     Sau này xử lý phần người chơi click vào một mức cược cụ thể không cần hiển thị danh sách phòng chơi
                     */
                    var cashRoomList = [];
                    if (enterZoneMessage.getCashroomconfigsList().length > 0) {
                        for (var i = 0; i < enterZoneMessage.getCashroomconfigsList().length; i++) {
                            cashRoomList.push(enterZoneMessage.getCashroomconfigsList()[i]);
                        }
                    }
                    Common.setCashRoomList(cashRoomList);
                }

                if (Common.getZoneId() !== -1) {
                    // notify->onHideNotify();
                    // this->unscheduleUpdate();

                    // auto miniGame = MiniGamePopUp::getInstance();
                    // miniGame->hiddenInfoExtend(true);
                    // miniGame->removeFromParentAndCleanup(true);

                    //luu lai vi tri position của scrollview
                    // pos_scrollview = scrollView->getInnerContainerPosition().x;

                    // auto scene = SceneTable::createScene(enter_zone_response->enabledisplayroomlist(),
                    //     enter_zone_response->defaultroomtypeload());
                    // REPLACESCENE_NO_ACTION(scene);
                    cc.director.loadScene('Table');
                }

            }else {
                // Common::getInstance()->setRequestRoomType(-1);
                // Common::getInstance()->setZoneId(-1);  //reset zone id
            }
        }
    }
});
