var NetworkManager = require('NetworkManager');
var threecard = require('ThreeCard');
var minipoker = require('minipoker');
var BaseScene = require('BaseScene');
var Treasure = require('Treasure');
var UILobby = require('UILobby');

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
        userGold: cc.Label,
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
        clearInterval(this.jarInterval);
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
            item.setPositionY(this.content.getContentSize().height*0.01);

            item.setPositionX(cc.director.getWinSize().width/2 + (i - listGame.length/2 + 0.5)* item.width*1.1);
            this.content.addChild(item);
            innerSize.width += item.getContentSize().width*1.1;
        }

        // this.content.setContentSize(innerSize);
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

        this.jarInterval = setInterval(function() {
            self.requestJar(false);
        }, 5000);
    },

    scrollToLeft: function(){
    },

    scrollToRight: function(){
        this.scrollView.jumpTo(0.25,100);
    },

    requestJar: function(isLoading) {
        if(!this.isRequestJar) {
            this.isRequestJar = true;
            NetworkManager.getJarRequest(-1, -1, isLoading);
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

    jarResponseHandler: function(resp) {
        cc.log("jar response handler:", resp.toObject());
        if(resp.getResponsecode()) {
            if(resp.getJarinfoList().length > 0) {
                // bind data
                this.isRequestJar = false;

                for(var i = 0; i < resp.getJarinfoList().length; i++) {
                    var jarItem = resp.getJarinfoList()[i];
                    var gameid = jarItem.getGameid();
                    cc.log("gameid =", gameid);
                    var value = jarItem.getValue();
                    var jarType = jarItem.getJartype();

                    var item = this.content.getChildByTag(gameid + 1000);
                    if(item !== null && item.getName() === 'LobbyGameItem') {
                        item.getComponent('LobbyGameItem').updateJarMoney(value, jarType);
                    }


                    if (Common.inMiniGame(gameid)){
                        this.handlerMessageMiniGame(gameid, resp, NetworkManager.MESSAGE_ID.JAR);
                    }
                    else {
                        // var item = this.content.getChildByTag(gameid + 1000);
                        // if(item !== null && item.getName() === 'LobbyGameItem')
                        //     item.getComponent('LobbyGameItem').updateJarMoney(value, jarType);
                    }

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
            case NetworkManager.MESSAGE_ID.EXIT_ZONE:
                var msg = buffer.response;
                this.exitZoneResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.EXIT_ROOM:
                var msg = buffer.response;
                this.exitRoomResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.TURN:
                var msg = buffer.response;
                this.turnResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.BET:
                var msg = buffer.response;
                this.betResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.UPDATE_MONEY:
                var msg = buffer.response;
                this.updateMoneyResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.START_MATCH:
                var msg = buffer.response;
                this.startMatchResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.MATCH_BEGIN:
                var msg = buffer.response;
                this.matchBeginResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.MATCH_END:
                var msg = buffer.response;
                this.matchEndResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.INSTANT_MESSAGE:
                var msg = buffer.response;
                this.instantMessageResponseHandler(msg);
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
            if (enterZoneMessage.hasMessage() && enterZoneMessage.getMessage() !== ''){
                Common.showToast(enterZoneMessage.getMessage());
            }

            if (Common.inMiniGame(enterZoneMessage.getZoneid())){
                if(Common.getZoneId() === Common.ZONE_ID.TAIXIU) {
                    NetworkManager.getEnterRoomMessageFromServer(0, "");
                }
                if (!enterZoneMessage.getResponsecode()){
                    Common.setMiniGameZoneId(-1);
                } else {
                    Common.setEnterZone(enterZoneMessage);
                }
            } else {
                if (enterZoneMessage.getResponsecode()) {
                    Common.setRequestRoomType(enterZoneMessage.getDefaultroomtypeload());
                    if (enterZoneMessage.hasEnabledisplayroomlist() && enterZoneMessage.getEnabledisplayroomlist()) {
                        /*
                        Sau này xử lý phần người chơi click vào một mức cược cụ thể không cần hiển thị danh sách phòng chơi
                        */
                        var cashRoomList = [];
                        // var goldRoomList = [];
                        if (enterZoneMessage.getCashroomconfigsList().length > 0) {
                            for (var i = 0; i < enterZoneMessage.getCashroomconfigsList().length; i++) {
                                cashRoomList.push(enterZoneMessage.getCashroomconfigsList()[i]);
                            }
                        }

                        Common.setCashRoomList(cashRoomList);
                    }

                    if (Common.getZoneId() !== -1) {
                    }
                }
                else {
                    Common.setRequestRoomType(-1);
                    Common.setZoneId(-1);  //reset zone id
                }
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
    loadThreeCard: function(enterZone, response) {
        var scene = cc.director.getScene();
        if(cc.isValid(scene) && !cc.isValid(scene.getChildByName("PopupThreeCard"))){
            cc.loader.loadRes("prefabs/PopupThreeCard",function(error, prefab) {
                if(!error){
                    var threeCard = cc.instantiate(prefab);
                    if(cc.isValid(threeCard)){
                        threeCard.x = Common.width / 2;
                        threeCard.y = Common.height / 2;
                        scene.addChild(threeCard);
                        threeCard.getComponent("PopupThreeCard").initDataFromLoading(enterZone, response);
                    }
                }
            });
        }
    },
    loadMiniPoker: function(enterZone, response) {
        var scene = cc.director.getScene();
        if(cc.isValid(scene) && !cc.isValid(scene.getChildByName("PopupMiniPoker"))){
            cc.loader.loadRes("prefabs/PopupMiniPoker",function(error, prefab) {
                if(!error){
                    var threeCard = cc.instantiate(prefab);
                    if(cc.isValid(threeCard)){
                        threeCard.x = Common.width / 2;
                        threeCard.y = Common.height / 2;
                        scene.addChild(threeCard);
                        threeCard.getComponent("PopupMiniPoker").initDataFromLoading(enterZone, response);
                    }
                }
            });
        }
    },
    enterRoomResponseHandler: function(response) {

        if (response !== 0) {
            //CCLOG("enter room response: %s", response->DebugString().c_str());
            if (response.hasMessage() && response.getMessage() != '') {
                Common.showToast(response.getMessage());
            }
            if(response.hasZoneid()){
                var zoneId = response.getZoneid();

                if(Common.inMiniGame(zoneId)){
                    this.handlerMessageMiniGame(zoneId, response, NetworkManager.MESSAGE_ID.ENTER_ROOM);
                }

                // enableTouchGameZone(true);
            }
        }

        // cc.log("enter room response: ", response);
        // if (response.getResponsecode()) {
        //     cc.log("enterZone = ", Common.getEnterZone());
        //     if (Common.getZoneId() === Common.ZONE_ID.MINI_BACAY) {
        //         // cc.director.loadScene('BaCay',function(){
        //         //     threecard.instance.initDataFromLoading(Common.getEnterZone(), response);
        //         // });
        //         this.loadThreeCard(Common.getEnterZone(), response);
        //         // this.isBindNetwork = false;
        //         // this.unscheduleAllCallbacks();
        //     }
        //     else if (Common.getZoneId() === Common.ZONE_ID.MINI_POKER) {
        //         // cc.director.loadScene('minipoker', function() {
        //         //     minipoker.instance.initDataFromLoading(Common.getEnterZone(), response);
        //         // });
        //         this.loadMiniPoker(Common.getEnterZone(), response);
        //         // this.isBindNetwork = false;
        //         // this.unscheduleAllCallbacks();
        //     } else if(Common.getZoneId() === Common.ZONE_ID.TAIXIU) {
        //         var self = this;
        //         self.loadTaiXiu(response);
        //         for (var i = 0; i < response.getArgsList().length; i++) {
        //             var key = response.getArgsList()[i].getKey();
        //             var value = response.getArgsList()[i].getValue();
        //             if (key === "currentTableStage") {
        //                 //value là trạng thái của bên tài xỉu
        //             } else if (key === "cdTimerRemaining") {
        //                 //value thời gian đếm ngược còn lại của phiên đang chạy
        //             } else if (key === "sessionId") {
        //                 //set giá trị label session với giá trị là value
        //             } else if (key === "resultHistorys") {
        //                 //lich sử các phiên trước đó
        //                 var listResult = value.split('|');
        //                 for (var j = 0; j < listResult.length; j++) {
        //                     var result = listResult[j].split('-').map(Number);
        //                     //update giá trị cho các cửa, với mỗi mảng betGateInfo lần lượt là
        //                     //[0] : số phiên, [1][2][3]: lật lượt là giá trị của từng con xúc sắc
        //                 }
        //             } else if (key === "betGateInfo") {
        //                 var listBetGateInfo = value.split(',');
        //                 for (var j = 0; j < listBetGateInfo.length; j++) {
        //                     var betGateInfo = listBetGateInfo[j].split('-').map(Number);
        //                     cc.log("số phần tử của betGateInfo là:", betGateInfo.length);
        //                     //update giá trị cho các cửa, với mỗi mảng betGateInfo lần lượt là
        //                     //[0] : giá trị cửa, [1]: tổng tiền đặt vào cửa, [2]: tổng số người đặt vào cửa đó
        //                 }
        //             } else if (key === "playerBetInfo") {
        //                 //giá trị các cửa mà người chơi đang đặt
        //             } else if (key === "playerPreviousBetInfo") {
        //                 //giá trị đặt của current user đối với các cửa trong ván trước, sử dụng để có thao tác bonus
        //                 //như gấp đôi, ....
        //
        //             }
        //         }
        //         // self.isBindNetwork = false;
        //         // self.unscheduleAllCallbacks();
        //     } else if(Common.getZoneId() === Common.ZONE_ID.TREASURE) {
        //         cc.director.loadScene('Treasure', function() {
        //             Treasure.instance.initDataFromLoading(Common.getEnterZone(), response);
        //         });
        //     }
        // }

    },

    handlerMessageMiniGame: function(zoneId, response, typeMessage){
        // cc.log("handlerMessageMiniGame =");
        // cc.log("zoneId =", zoneId);
        var scene = cc.director.getScene();
        if (typeMessage === NetworkManager.MESSAGE_ID.ENTER_ROOM) {
            var enterroomresponse = response;
            if (zoneId !== 0 && enterroomresponse.getResponsecode()) {
                Common.setMiniGameZoneId(zoneId);

                if (zoneId === Common.ZONE_ID.TAIXIU){
                    // // auto node = TamXiNgau::create(this);
                    // // node->setPosition(MVec2(0, 0));
                    // // this->addChild(node, INDEX_MINIGAME);
                    // // node->onHandlerMessage(response, typeMessage);
                    //
                    // if(cc.isValid(scene) && !cc.isValid(scene.getChildByName("PopupTaiXiu"))){
                    //     cc.loader.loadRes("prefabs/PopupTaiXiu",function(error, prefab) {
                    //         if(!error){
                    //             var taixiu = cc.instantiate(prefab);
                    //             if(cc.isValid(taixiu)){
                    //                 taixiu.x = Common.width / 2;
                    //                 taixiu.y = Common.height / 2;
                    //                 scene.addChild(taixiu);
                    //                 taixiu.getComponent("PopupTaiXiu").setEnterRoomResponse(response);
                    //                 taixiu.getComponent("PopupTaiXiu").handleMessage(response, typeMessage);
                    //             }
                    //         }
                    //     });
                    // }
                    // // else {
                    // //     this.node.getComponent("PopupTaiXiu").handleMessage(response, typeMessage);
                    // // }

                    if(cc.isValid(scene) && !cc.isValid(scene.getChildByName("PopupTaiXiu"))){
                        cc.loader.loadRes("prefabs/PopupTaiXiu",function(error, prefab) {
                            if(!error){
                                var taiXiu = cc.instantiate(prefab);
                                if(cc.isValid(taiXiu)){
                                    taiXiu.x = Common.width / 2;
                                    taiXiu.y = Common.height / 2;
                                    scene.addChild(taiXiu);
                                    taiXiu.getComponent("PopupTaiXiu").setEnterRoomResponse(response);
                                    taiXiu.getComponent("PopupTaiXiu").handleMessage(response, typeMessage);
                                }
                            }
                        });
                    }
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
                    // self.isBindNetwork = false;
                    // self.unscheduleAllCallbacks();

                }
                else if (zoneId === Common.ZONE_ID.MINI_POKER) {
                    if(cc.isValid(scene) && !cc.isValid(scene.getChildByName("PopupMiniPoker"))){
                        cc.loader.loadRes("prefabs/PopupMiniPoker",function(error, prefab) {
                            if(!error){
                                var minipoker = cc.instantiate(prefab);
                                if(cc.isValid(minipoker)){
                                    minipoker.x = Common.width / 2;
                                    minipoker.y = Common.height / 2;
                                    scene.addChild(minipoker);
                                    minipoker.getComponent("PopupMiniPoker").initDataFromLoading(Common.getEnterZone(), response);
                                    minipoker.getComponent("PopupMiniPoker").handleMessage(response, typeMessage);
                                }
                            }
                        });
                    } else {
                        // this.node.getComponent("PopupMiniPoker").handleMessage(response, typeMessage);
                        scene.getChildByName("PopupMiniPoker").handleMessage(response, typeMessage);
                    }
                }
                else if (zoneId === Common.ZONE_ID.MINI_BACAY) {
                    if(cc.isValid(scene) && !cc.isValid(scene.getChildByName("PopupThreeCard"))){
                        cc.loader.loadRes("prefabs/PopupThreeCard",function(error, prefab) {
                            if(!error){
                                var threeCard = cc.instantiate(prefab);
                                if(cc.isValid(threeCard)){
                                    threeCard.x = Common.width / 2;
                                    threeCard.y = Common.height / 2;
                                    scene.addChild(threeCard);
                                    threeCard.getComponent("PopupThreeCard").initDataFromLoading(Common.getEnterZone(), response);
                                    threeCard.getComponent("PopupThreeCard").handleMessage(response, typeMessage);
                                }
                            }
                        });
                    }
                    else {
                        // this.node.getComponent("PopupThreeCard").handleMessage(response, typeMessage);
                        scene.getChildByName("PopupThreeCard").handleMessage(response, typeMessage);
                    }
                }
                else if (zoneId === Common.ZONE_ID.TREASURE) {
                    cc.director.loadScene('Treasure', function() {
                        Treasure.instance.initDataFromLoading(Common.getEnterZone(), response);
                    });
                }
                Common.openMinigame(zoneId);
                return;
            }
        }

        if (zoneId === Common.ZONE_ID.MINI_POKER){
            if (scene.getChildByName("PopupMiniPoker")) {
                var mini_poker = scene.getChildByName("PopupMiniPoker");
                mini_poker.getComponent("PopupMiniPoker").handleMessage(response, typeMessage);
            }
        }
        else if (zoneId === Common.ZONE_ID.MINI_BACAY){
            if (scene.getChildByName("PopupThreeCard")) {
                var mini_threecards = scene.getChildByName("PopupThreeCard");
                cc.log("mini_threecards =", mini_threecards);
                mini_threecards.getComponent("PopupThreeCard").handleMessage(response, typeMessage);
            }
        }
        else if (zoneId === Common.ZONE_ID.TAIXIU){
            if (scene.getChildByName("PopupTaiXiu")) {
                var tamxingau = scene.getChildByName("PopupTaiXiu");
                tamxingau.getComponent("PopupTaiXiu").handleMessage(response, typeMessage);
            }
        }
        // else if (zoneId === Common.ZONE_ID.TREASURE){
        //     if (scene.getChildByName("PopupTreasure")) {
        //         var treasure = scene.getChildByName("PopupTreasure");
        //         treasure.handleMessage(response, typeMessage);
        //     }
        // }
    },

    exitZoneResponseHandler: function(response) {
        if (response !== 0) {
            if (response.hasMessage() && response.getMessage() !== ''){
                Common.showToast(response.getMessage());
            }

            if (response.hasZoneid()){
                var zoneId = response.getZoneid();
                if (Common.inMiniGame(zoneId)){
                    this.handlerMessageMiniGame(zoneId, response, NetworkManager.MESSAGE_ID.EXIT_ZONE);
                }
            }
        }
    },

    exitRoomResponseHandler(exit_room_response){

        if (exit_room_response !== 0) {
            if (exit_room_response.hasMessage() && exit_room_response.getMessage() !== ''){
                Common.showToast(exit_room_response.getMessage());
            }

            if (exit_room_response.getResponsecode()) {
                if(exit_room_response.hasZoneid()){
                    var zoneId = exit_room_response.getZoneid();
                    if(Common.inMiniGame(zoneId)){
                        this.handlerMessageMiniGame(zoneId, exit_room_response, NetworkManager.MESSAGE_ID.EXIT_ROOM);
                    }
                }
            }
        }
    },

    turnResponseHandler: function(response){
        if (response !== 0) {
            if (response.hasMessage() && response.getMessage() !== '') {
                Common.showToast(response.getMessage());
            }
            if(response.hasZoneid()){
                var zoneId = response.getZoneid();
                if(Common.inMiniGame(zoneId)){
                    this.handlerMessageMiniGame(zoneId, response, NetworkManager.MESSAGE_ID.TURN);
                }
            }
        }
    },

    betResponseHandler: function(response){

        if (response !== 0) {
            if (response.hasMessage() && response.getMessage() != '') {
                Common.showToast(response.getMessage());
            }
            if(response.hasZoneid()){
                var zoneId = response.getZoneid();
                if(Common.inMiniGame(zoneId)){
                    this.handlerMessageMiniGame(zoneId, response, NetworkManager.MESSAGE_ID.BET);
                }
            }
        }
    },
    startMatchResponseHandler: function(response){
        if (response !== 0) {
            if (response.hasMessage() && response.getMessage() != '') {
                Common.showToast(response.getMessage());
            }
            if(response.hasZoneid()){
                var zoneId = response.getZoneid();
                if(Common.inMiniGame(zoneId)){
                    this.handlerMessageMiniGame(zoneId, response, NetworkManager.MESSAGE_ID.START_MATCH);
                }
            }
        }
    },
    matchBeginResponseHandler: function(matchbeginresponse){
        if (matchbeginresponse !== 0) {
            if (matchbeginresponse.hasMessage() && matchbeginresponse.getMessage() != ''){
                Common.showToast(matchbeginresponse.getMessage());
            }

            if (matchbeginresponse.hasZoneid()){
                var zoneId = matchbeginresponse.getZoneid();
                if (zoneId !== 0){
                    this.handlerMessageMiniGame(zoneId, matchbeginresponse, NetworkManager.MESSAGE_ID.MATCH_BEGIN);
                }
            }
        }
    },
    matchEndResponseHandler: function(response) {

        if (response !== 0) {
            if (response.hasMessage() && response.getMessage() != '') {
                Common.showToast(response.getMessage());
            }
            if(response.hasZoneid()){
                var zoneId = response.getZoneid();
                if(Common.inMiniGame(zoneId)){
                    this.handlerMessageMiniGame(zoneId, response, NetworkManager.MESSAGE_ID.MATCH_END);
                }
            }
        }
    },
    updateMoneyResponseHandler: function(response){
        cc.log("update money response:", response.toObject());
        if (response !== 0) {

            if (response.hasMessage() && response.getMessage() !== '') {
                Common.showToast(response.getMessage());
            }
            if(response.hasZoneid()){
                var zoneId = response.getZoneid();
                if(zoneId <= 0 || zoneId === Common.ZONE_ID.TAIXIU ){
                    if (response.getResponsecode()) {
                        if (zoneId === Common.ZONE_ID.TAIXIU){
                            this.handlerMessageMiniGame(zoneId, response, NetworkManager.MESSAGE_ID.UPDATE_MONEY);
                        }
                        if (response.getMoneyboxesList().length > 0){
                            var moneyBox;
                            var origin_money;
                            var result = "";

                            for (var i = 0; i < response.getMoneyboxesList().length; i++) {
                                moneyBox = response.getMoneyboxesList()[i];
                                var isCash = moneyBox.getIscash();
                                if (moneyBox.getUserid() === Common.getUserId()){
                                    origin_money = moneyBox.getCurrentmoney();
                                    //set lai tien cho nguoi choi
                                    if (isCash){
                                        Common.setCash(origin_money);
                                        this.userGold.string = Common.numberFormatWithCommas(Common.getCash());
                                        // this.setUserInfo();
                                        // label_cash->setString(common->numberFormatWithCommas(common->getCash()));
                                    }
                                }
                            }
                        }
                    }
                }else if(Common.inMiniGame(zoneId) && zoneId !== Common.ZONE_ID.TAIXIU){
                    this.handlerMessageMiniGame(zoneId, response, NetworkManager.MESSAGE_ID.UPDATE_MONEY);
                }
            }
        }
    },
    instantMessageResponseHandler: function(response){
        if (response !== 0){
            if (response.hasMessage() && response.getMessage() !== ''){
                Common.showToast(response.getMessage());
            }

            if (response.getZoneid() !== 0) {
                this.handlerMessageMiniGame(response.getZoneid(), response, NetworkManager.MESSAGE_ID.INSTANT_MESSAGE);
            }
        }
    }
});
