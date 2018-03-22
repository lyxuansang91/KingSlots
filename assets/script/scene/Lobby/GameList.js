var NetworkManager = require('NetworkManager');
var threecard = require('ThreeCard');
var minipoker = require('minipoker');
var BaseScene = require('BaseScene');
var Treasure = require('Treasure');

cc.Class({
    extends: BaseScene,

    properties: {
        scrollView: cc.ScrollView,
        prefabGameItem: cc.Prefab,
        roomIndex : 0,
        lbl_moneys: [],
        jarValue: 0,
        timeDelta: 0,
        jarResponse: null,
        jarRequest: null,
        isRequestJar: false,
        isBindNetwork: false,
        firstTimeRequestJar: false,
    },

    // use this for initialization
    onLoad: function () {
        cc.log("on load game list");
        var self = this;
        this.content = this.scrollView.content;
        this.populateList();
    },
    onDestroy: function() {
        cc.log("on destroy");
        this.unscheduleAllCallbacks();
    },
    onEnable: function() {
        cc.log("on enable");
    },
    onDisable: function() {
        cc.log("on disabled");
    },
    populateList: function() {

        var self = this;

        var listGame = [Common.ZONE_ID.MINI_BACAY,Common.ZONE_ID.MINI_POKER,
            Common.ZONE_ID.TAIXIU, Common.ZONE_ID.VQMM, Common.ZONE_ID.TREASURE];

        var innerSize = cc.size(0,this.content.getContentSize().height);
        for (var i = 0; i < listGame.length; ++i) {
            var item = cc.instantiate(this.prefabGameItem);
            item.setTag(listGame[i] + 1000);
            item.getComponent('LobbyGameItem').init(i, listGame[i]);
            item.setPositionY(this.content.getContentSize().height*0.06);
            this.content.addChild(item);
            innerSize.width += item.getContentSize().width*1.1;
        }

        this.content.setContentSize(innerSize);
        var resp = window.jarInfoList;

        if(resp != null) {
            for (var i = 0; i < resp.length; i++) {
                var jarItem = resp[i];
                var gameid = jarItem.getGameid();
                var value = jarItem.getValue();
                var jarType = jarItem.getJartype();
                var item = this.content.getChildByTag(gameid + 1000);
                if (item !== null && item.getName() === 'LobbyGameItem')
                    item.getComponent('LobbyGameItem').updateJarMoney(value, jarType);
            }
        }

        self.schedule(function() {
            self.requestJar(false);
        }, 5);
    },

    scrollToLeft: function(){
    },

    scrollToRight: function(){
        this.scrollView.jumpTo(0.25,100);
    },

    requestJar: function(isLoading) {
        cc.log("request jar:", isLoading);
        if(!this.isRequestJar) {
            if(isLoading)
                NetworkManager.showLoading();
            this.isRequestJar = true;
            NetworkManager.getJarRequest(0, null, isLoading);
        }
    },
    bindNetwork: function() {
        var self = this;
        NetworkManager.checkEvent(function(buffer) {
            return self.handleMessage(buffer);
        });

    },

    update: function (dt) {
        // if(!Common.isExistTaiXiu() && !this.isBindNetwork) {
        //     this.isBindNetwork = true;
        //     this.bindNetwork();
        // }
        this.bindNetwork();
    },

    goSceneTable: function() {
    },

    ongamestatus: function(event) {
        // cc.log("on game status game list");
        // NetworkManager.hideLoading();
        // if(event.data!==null || event.data !== 'undefined') {
        //     var lstMessage = NetworkManager.parseFrom(event.data, event.data.byteLength);
        //     for(var i = 0; i < lstMessage.length; i++) {
        //         var buffer = lstMessage[i];
        //         this.handleMessage(buffer);
        //     }
        // }
    },

    jarResponseHandler: function(resp) {
        cc.log("jar response handler:", resp.toObject());
        if(resp.getResponsecode()) {
            if(resp.getJarinfoList().length > 0) {
                // bind data
                this.isRequestJar = false;
                for(var i = 0; i < resp.getJarinfoList().length; i++) {
                    var jarItem = resp.getJarinfoList()[i];
                    var gameid = jarItem.getGameid();
                    var value = jarItem.getValue();
                    var jarType = jarItem.getJartype();
                    var item = this.content.getChildByTag(gameid + 1000);
                    if(item !== null && item.getName() === 'LobbyGameItem')
                        item.getComponent('LobbyGameItem').updateJarMoney(value, jarType);
                }
            }
        }
    },

    handleMessage: function(buffer) {
        var isDone = this._super(buffer);
        if(isDone) {
            return true;
        }
        isDone = true;

        switch (buffer.message_id) {
            case NetworkManager.MESSAGE_ID.ENTER_ZONE:
                var msg = buffer.response;
                this.enterZoneMessageResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.ENTER_ROOM:
                var msg = buffer.response;
                this.enterRoomResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.JAR:
                var msg = buffer.response;
                this.jarResponseHandler(msg);
                break;
            default:
                isDone = false;
                break;
        }
        return isDone;
    },

    enterZoneMessageResponseHandler: function(enterZoneMessage) {
        if (enterZoneMessage != 0) {
            //common.initialize = initialMessage.responseCode;
            cc.log("enter zone response:", enterZoneMessage.toObject());
            if (enterZoneMessage.getResponsecode()) {
                Common.setEnterZone(enterZoneMessage);
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

                    if(Common.getZoneId() === Common.ZONE_ID.TAIXIU) {
                        NetworkManager.getEnterRoomMessageFromServer(0, "");
                    }
                    //cc.director.loadScene('Table');
                }

            }else {
                // Common::getInstance()->setRequestRoomType(-1);
                // Common::getInstance()->setZoneId(-1);  //reset zone id
            }
        }
    },
    loadTaiXiu: function(response) {
        var scene = cc.director.getScene();
        if(cc.isValid(scene) && !cc.isValid(scene.getChildByName("PopupTaiXiu"))){
            cc.loader.loadRes("prefabs/PopupTaiXiu",function(error, prefab) {
                if(!error){
                    var taiXiu = cc.instantiate(prefab);
                    if(cc.isValid(taiXiu)){
                        taiXiu.x = Common.width / 2;
                        taiXiu.y = Common.height / 2;
                        scene.addChild(taiXiu);
                        taiXiu.getComponent("PopupTaiXiu").setEnterRoomResponse(response);
                    }
                }
            });
        }
    },
    enterRoomResponseHandler: function(response) {
        cc.log("enter room response: ", response);
        if (response.getResponsecode()) {
            cc.log("enterZone = ", Common.getEnterZone());
            if (Common.getZoneId() === Common.ZONE_ID.MINI_BACAY) {
                cc.director.loadScene('BaCay',function(){
                    threecard.instance.initDataFromLoading(Common.getEnterZone(), response);
                });

            }
            else if (Common.getZoneId() === Common.ZONE_ID.MINI_POKER) {
                cc.director.loadScene('minipoker', function() {
                    minipoker.instance.initDataFromLoading(Common.getEnterZone(), response);
                });
            } else if(Common.getZoneId() === Common.ZONE_ID.TAIXIU) {
                var self = this;
                self.loadTaiXiu(response);
                for (var i = 0; i < response.getArgsList().length; i++) {
                    var key = response.getArgsList()[i].getKey();
                    var value = response.getArgsList()[i].getValue();
                    if (key === "currentTableStage") {
                        //value là trạng thái của bên tài xỉu
                    } else if (key === "cdTimerRemaining") {
                        //value thời gian đếm ngược còn lại của phiên đang chạy
                    } else if (key === "sessionId") {
                        //set giá trị label session với giá trị là value
                    } else if (key === "resultHistorys") {
                        //lich sử các phiên trước đó
                        var listResult = value.split('|');
                        for (var j = 0; j < listResult.length; j++) {
                            var result = listResult[j].split('-').map(Number);
                            //update giá trị cho các cửa, với mỗi mảng betGateInfo lần lượt là
                            //[0] : số phiên, [1][2][3]: lật lượt là giá trị của từng con xúc sắc
                        }
                    } else if (key === "betGateInfo") {
                        var listBetGateInfo = value.split(',');
                        for (var j = 0; j < listBetGateInfo.length; j++) {
                            var betGateInfo = listBetGateInfo[j].split('-').map(Number);
                            cc.log("số phần tử của betGateInfo là:", betGateInfo.length);
                            //update giá trị cho các cửa, với mỗi mảng betGateInfo lần lượt là
                            //[0] : giá trị cửa, [1]: tổng tiền đặt vào cửa, [2]: tổng số người đặt vào cửa đó
                        }
                    } else if (key === "playerBetInfo") {
                        //giá trị các cửa mà người chơi đang đặt
                    } else if (key === "playerPreviousBetInfo") {
                        //giá trị đặt của current user đối với các cửa trong ván trước, sử dụng để có thao tác bonus
                        //như gấp đôi, ....

                    }
                }
                self.isBindNetwork = false;
                self.unscheduleAllCallbacks();
            } else if(Common.getZoneId() === Common.ZONE_ID.TREASURE) {
                cc.director.loadScene('Treasure', function() {
                    Treasure.instance.initDataFromLoading(Common.getEnterZone(), response);
                });
            }
        }
    }
});
