var NetworkManager = require('NetworkManager');
var BaseScene = require('BaseScene');
var HISTORY_SPIN = 1;
var HISTORY_BREAK_JAR = 2;
var HISTORY_TOP_USER = 3;
cc.Class({
    extends: BaseScene,

    properties: {
        animation : cc.Animation,
        background: cc.Sprite,
        bg: cc.Sprite,
        cardPrefab: cc.Prefab,
        cardView: cc.Node,
        moneyBet: cc.Label,
        moneyJar: cc.Label,
        betLightOne: cc.Sprite,
        betLightTwo: cc.Sprite,
        betLightThree: cc.Sprite,
        autoSpinToggle: cc.Toggle,
        isFinishSpin: true,
        isRun: false,
        updateMoneyResponse: [],
        enterZoneResponse: [],
        enterRoomResponse: [],
        isUpdateMoney : false,
        nohuPrefab: cc.Prefab,
        isBreakJar: false,
        bet: 0,
        jarType: 1,
        isRequestJar: false,
        list_item: [],
        list_recent_values: [],
        stepCard : 9,
        list_recent_value: null,
        number : 3,
        time_move: 1,
        // touchOffet: 0
    },


    btnCangatClick: function (){
        this.animation.play('cangat');
        this.quayEvent();
    },

    exitRoom: function() {
        NetworkManager.requestExitRoomMessage(Common.ZONE_ID.MINI_BACAY, 0);
    },

    // use this for initialization
    onLoad: function () {
        this.initFirstCard();
        this.schedule(this.requestJarInGame, 5);
        Common.setMiniThreeCardsSceneInstance(cc.director.getScene());

        var self = this;
        this.background.node.on("touchstart", function( touch) {
            var locationInNode = self.background.node.convertToNodeSpace(touch.getLocation());
            var rect = self.background.spriteFrame.getRect();

            if (cc.rectContainsPoint(rect,locationInNode)){
                var touch_location = touch.getLocation();
                self.touchOffset = cc.p(self.background.node.getPosition().x - touch_location.x,
                    self.background.node.getPosition().y - touch_location.y);
                // this.node.reorderChild(self.background.node.getLocalZOrder());
                var currentLocal = Common.getCurrentLocal() !== this.node.getLocalZOrder() ?  Common.getCurrentLocal() : this.node.getLocalZOrder() + 1;
                cc.log("zorder 3 cay =", currentLocal);
                Common.setCurrentLocal(currentLocal);
                this.node.setLocalZOrder(currentLocal);


                return true;
            }

            return false;
        }, this);

        this.background.node.on("touchmove", function( touch) {
            this.background.node.setPosition(cc.p(touch.getLocation()).add(self.touchOffset));
        }, this);

    },

    onGameEvent: function() {
        var self = this;
        NetworkManager.checkEvent(function(buffer) {
            return self.handleMessage(buffer);
        });
    },

    initFirstCard: function() {
        var random_number = Common.genRandomCardNumber(null, this.stepCard, this.number);
        var items_value = Common.genArrayToMultiArray(random_number, this.stepCard, this.number);
        this.list_recent_value = Common.create2DArray(this.stepCard);
        for(var i = 0; i < this.stepCard; i++){
            for(var j = 0; j < this.number; j++){
                var item = cc.instantiate(this.cardPrefab);
                item.setScale(0.5, 0.5);
                var posX = (j - 1) * item.getContentSize().width/2;
                var posY = (i - 1) * item.getContentSize().height/2;
                item.getComponent('CardItem').replaceCard(items_value[i][j], Common.ZONE_ID.MINI_BACAY);
                item.setPositionY(posY);
                item.setPositionX(posX);

                this.list_item.push(item);
                this.cardView.addChild(item);
                this.list_recent_values.push(items_value[i][j]);
            }
        }

        this.list_recent_value = items_value;
    },

    initDataFromLoading: function(enterZone, enterRoom){
        cc.log("enterZone =", enterZone);
        this.setEnterZoneResponse(enterZone);
        Common.setMiniGameZoneId(enterZone.getZoneid());
        this.setEnterRoomResponse(enterRoom);
        this.init(enterRoom);
    },

    init: function (response) {
        var roomPlay = response.getRoomplay();
        this.roomIndex = roomPlay.getRoomindex();

        if (response.getArgsList().length > 0) {
            var entry = response.getArgsList()[0];
            if (entry.getKey() === "initValue") {
                this.initValue(entry.getValue());
            }
        }
    },

    update: function (dt) {
        this.handleAutoSpin();
        // this.onGameEvent();
    },

    onDestroy: function() {
        cc.log("on destroy");
        this.unscheduleAllCallbacks();
    },

    // onGameEvent: function() {
    //     var self = this;
    //     NetworkManager.checkEvent(function(buffer) {
    //         return self.handleMessage(buffer);
    //     })
    // },

    quayEvent: function () {
        var money = Common.getCash();
        var betMoney = this.getBetMoney();
        if(betMoney > money){
            var message = "Bạn không có đủ tiền!";
            Common.showToast(message);
            return;
        }
        if (this.autoSpinToggle.isChecked) {
            return;
        }

        if (!this.isRun) {
            this.getTurnMiniThreeCardsRequest(this.calculateTurnType());
        }else{
            var message = "Xin vui lòng đợi!";
            Common.showToast(message);
        }
    },
    getTurnMiniThreeCardsRequest: function(turnType) {

        // cangatAnimation();
        this.isRun = true;

        var entries = [];
        var entry = new proto.BINMapFieldEntry();
        entry.setKey("turnSlotType");
        entry.setValue(turnType.toString());
        entries.push(entry);
        NetworkManager.getTurnMessageFromServer(Common.ZONE_ID.MINI_BACAY, 0, entries);
    },


    exitRoomResponsehandler: function (resp) {
        // cc.log("exit room response handler:", resp.toObject());
        // if(resp.getResponsecode()) {
        //
        // }
        //
        // if(resp.hasMessage()) {
        //     // show toast
        // }
    },

    exitZoneResponseHandler: function(response) {
        // cc.log("exit zone response handler:", resp.toObject());
        // if(resp.getResponsecode()) {
        //     Common.setZoneId(-1);
        //     // cc.director.loadScene("Lobby");
        //     cc.director.loadScene("Login");
        // }
        //
        // if(resp.hasMessage() && resp.getMessage() !== "") {
        //     // TODO: display message
        // }

        if (response.getResponsecode()) {
            this.isRunning = false;
            Common.setMiniGameZoneId(-1);
            this.node.removeFromParent(true);
            Common.closeMinigame(response.getZoneid());
        }
    },

    // handleMessage: function(buffer) {
    //     var isDone = this._super(buffer);
    //     if(isDone) {
    //         return true;
    //     }
    //     isDone = true;
    //     switch (buffer.message_id) {
    //         // case NetworkManager.MESSAGE_ID.UPDATE_MONEY:
    //         //     var msg = buffer.response;
    //         //     this.updateMoneyMessageResponseHandler(msg);
    //         //     break;
    //         case NetworkManager.MESSAGE_ID.MATCH_END:
    //             this.matchEndResponseHandler(buffer.response);
    //             break;
    //         case NetworkManager.MESSAGE_ID.EXIT_ROOM:
    //             var msg = buffer.response;
    //             this.exitRoomResponsehandler(msg);
    //             break;
    //         // case NetworkManager.MESSAGE_ID.ENTER_ROOM:
    //         //     var msg = buffer.response;
    //         //     this.enterRoomResponseHandler(msg);
    //         //     break;
    //         case NetworkManager.MESSAGE_ID.EXIT_ZONE:
    //             var msg = buffer.response;
    //             this.exitZoneResponseHandler(msg);
    //             break;
    //         case NetworkManager.MESSAGE_ID.JAR:
    //             var msg = buffer.response;
    //             this.jarResponseHandler(msg);
    //             break;
    //         default:
    //             isDone = false;
    //             break;
    //     }
    //     return isDone;
    // },
    handleMessage: function(response, typeMessage) {
        cc.log("response =", response);
        cc.log("typeMessage =", typeMessage);
        if (typeMessage === NetworkManager.MESSAGE_ID.UPDATE_MONEY){
            this.updateMoneyMessageResponseHandler(response);
        }
        else if (typeMessage === NetworkManager.MESSAGE_ID.MATCH_END){
            this.matchEndResponseHandler(response);
        }
        else if (typeMessage === NetworkManager.MESSAGE_ID.EXIT_ROOM){
            this.exitRoomResponsehandler(response);
        }
        else if (typeMessage === NetworkManager.MESSAGE_ID.ENTER_ROOM) {
            this.enterRoomResponseHandler(response);
        }
        else if (typeMessage === NetworkManager.MESSAGE_ID.EXIT_ZONE){
            this.exitZoneResponseHandler(response);
        }
        else if (typeMessage === NetworkManager.MESSAGE_ID.JAR){
            this.jarResponseHandler(response);
        }
    },

    enterRoomResponseHandler: function(response) {
        if (response !== 0)  {
            if (response.getResponsecode()) {
                var roomPlay = response.getRoomplay();
                var roomIndex = roomPlay.getRoomindex();

                if (response.getArgsList().length > 0) {
                    var entry = response.getArgsList()[0];
                    if (entry.getKey() === "initValue") {
                        this.initValue(entry.getValue());
                    }
                }
                //initRanking();
            }
        }
    },

    updateMoneyMessageResponseHandler: function (response) {
        cc.log("updateMoneyMessageResponseHandler =", response);
        if (response.getResponsecode()){
            this.setBinUpdateMoney(response);
            this.removeTurnUpdateMoney();
        }
    },
    setBinUpdateMoney: function(response) {
        cc.log("setBinUpdateMoney =", response);
        this.updateMoneyResponse = response;
    },
    getBINUpdateMoneyResponse: function(){
        return this.updateMoneyResponse;
    },
    setEnterZoneResponse: function(response) {
        this.enterZoneResponse = response;
    },
    getEnterZoneResponse: function(){
        return this.enterZoneResponse;
    },
    setEnterRoomResponse: function(response) {
        this.enterRoomResponse = response;
    },
    getEnterRoomResponse: function(){
        return this.enterRoomResponse;
    },
    removeTurnUpdateMoney: function(){
        var updateMoneyResponse = this.getBINUpdateMoneyResponse();
        cc.log("updateMoneyResponse =", updateMoneyResponse.getMoneyboxesList());
        if(updateMoneyResponse.getResponsecode()) {
            for(var i = 0; i < updateMoneyResponse.getMoneyboxesList().length; i++) {
                var money_box = updateMoneyResponse.getMoneyboxesList()[i];
                if(money_box.getReason() === "miniBacaySpin") {
                    var origin_money = money_box.getCurrentmoney();
                    //set lai tien cho nguoi choi

                    Common.setCash(origin_money);
                    //this->moneyEvent->onEventMoneyMiniGame(true,origin_money);

                }
            }
        }
    },
    matchEndResponseHandler: function(response) {
        if (response.getResponsecode()) {
            if (response.getArgsList().length > 0) {
                for (var i = 0; i < response.getArgsList().length; i++) {
                    if (response.getArgsList()[i].getKey() === "currentCards") {
                        var str = response.getArgsList()[i].getValue();
                        var currentCards = str.split(',').map(Number);
                        this.implementSpinMiniThreeCards(currentCards,response);
                    }
                }
            }

            /*if (response->textemoticons_size() > 0){
             BINTextEmoticon emoticon = response->textemoticons(0);
             handleRanking(emoticon.emoticonid(), emoticon.message());
             }*/
        } else {
            this.isRun = false;
            this.autoSpinToggle.isChecked = false;
        }
        /* if (response->has_message() && !response->message().empty())
         this->showToast(response->message().c_str(), 2);*/
    },
    implementSpinMiniThreeCards: function(carx,response) {
        cc.log("carx =", carx);
        // this.cardView.node.removeAllChildren(true);
        var text_emoticon = response.getTextemoticonsList()[0];
        this.isFinishSpin = false;
        this.isBreakJar = (text_emoticon.getEmoticonid() === 54); //54: nổ hũ
        var random_number = Common.genRandomCardNumber(carx, this.stepCard, this.number);
        var items_value = Common.genArrayToMultiArray(random_number, this.stepCard, this.number);
        cc.log("item value =", items_value);
        cc.log("stepCard =", this.stepCard);
        items_value[this.stepCard-2] = carx;

        if(items_value.length * this.number != this.list_item.length){
            return;
        }

        for(var i = 0; i < this.list_item.length; i++){
            var x = parseInt(i/this.number);
            var y = parseInt(i%this.number);

            if(i < 3*this.number){
                var i1 = this.stepCard - (3 - x);
                var j1 = y;
                this.list_item[i].getComponent('CardItem').replaceCard(this.list_recent_value[i1][j1], Common.ZONE_ID.MINI_BACAY);
            }

            var posX = (y - 1) * this.list_item[i].getContentSize().width / 2;
            var posY = (x - 1) * this.list_item[i].getContentSize().height / 2;

            this.list_item[i].setPositionX(posX);
            this.list_item[i].setPositionY(posY);
        }

        this.list_recent_value = items_value;

        for(var i = 0; i < this.list_item.length; i++){
            var x = parseInt(i/this.number);
            var y = parseInt(i%this.number);

            var card = this.list_item[i];

            var card_value = items_value[x][y];
            if(i >= 3*this.number){
                card.getComponent('CardItem').replaceCard(card_value, Common.ZONE_ID.MINI_BACAY);
            }

            var h = card.getContentSize().height/2;

            var move1 = cc.moveBy(0.2, cc.p(0,h*0.25));
            var move2 = cc.moveBy(0.15, cc.p(0,h*0.25));
            var move3 = cc.moveBy(this.time_move,cc.p(0,-(this.stepCard - 3.0)*h - 0.5*h));
            var delay = cc.delayTime(y*0.3);

            if(i == this.list_item.length - 1){
                var emoticon = response.getTextemoticonsList()[0];
                var emotionId = emoticon.getEmoticonid();
                var message = emoticon.getMessage();
                var moneyResponse = this.getBINUpdateMoneyResponse();
                var callFunc = cc.callFunc(function () {
                    this.handleRanking(emotionId, message, moneyResponse);
                },this);

                var callFuncAutoSpin = cc.callFunc(function () {
                    if(!this.isBreakJar)
                        this.isFinishSpin = true;
                }, this);

                // // khi dừng hiệu ứng
                // var call_func = cc.callFunc(function () {
                //     cc.log("FINISH!!!!");
                // });
                card.runAction(cc.sequence(delay,move1,move3,move2,callFunc, cc.delayTime(2), callFuncAutoSpin));
            }else{
                card.runAction(cc.sequence(delay,move1,move3,move2));
            }
        }
    },

    onDestroy: function() {
        this.unscheduleAllCallbacks();
    },
    _onDealEnd: function() {
        cc.log("run action");
    },
    handleAutoSpin: function() {

        if (this.autoSpinToggle.isChecked && !this.isRun && this.isFinishSpin) {
            var money = Common.getCash();
            var betMoney = this.getBetMoney();
            cc.log("betMoney =", betMoney);
            if(betMoney > money){
                var message = "Bạn không có đủ tiền!";
                Common.showToast(message);
                this.autoSpinToggle.isChecked = false;
                return;
            }
            this.getTurnMiniThreeCardsRequest(this.calculateTurnType());
        }
    },
    handleRanking: function(emoticonId, message, response) {

        //TODO: HungLe - Handle Ranking

        //emoticonId = 54;
        if(emoticonId === 54) {
            this.showNoHu();
            this.isRun = false;
            return ;
        }
        if (emoticonId !== 72) {
            this.isUpdateMoney = false;
            cc.log("mess =", message);

            var nodeChild = new cc.Node(message);
            nodeChild.parent = this.cardView;
            var lbl_text = nodeChild.addComponent(cc.Label);
            lbl_text.string = message;
            lbl_text.node.color = cc.color(248,213,82,255);
            lbl_text.fontSize = 60;
            lbl_text.lineHeight = 70;


            var outline = nodeChild.addComponent(cc.LabelOutline);
            outline.color = new cc.Color(0.5, 0.3, 0.7, 1.0);
            outline.width = 3;

            var fadeout = cc.fadeOut(1.0);
            var callFunc = cc.callFunc(function () {
                for (var i = 0; i < response.getMoneyboxesList().length; i++) {
                    var nodeMoney = new cc.Node();
                    nodeMoney.parent = this.cardView;
                    var moneybox = response.getMoneyboxesList()[i];
                    if (moneybox.getDisplaychangemoney() > 0) {
                        this.isUpdateMoney = true;
                        var label_money = nodeMoney.addComponent(cc.Label);
                        label_money.string = "+" + moneybox.getDisplaychangemoney().toString();
                        label_money.node.color = cc.color(248,213,82,255);
                        label_money.fontSize = 60;
                        label_money.lineHeight = 70;

                        var outline = nodeMoney.addComponent(cc.LabelOutline);
                        outline.color = new cc.Color(0.5, 0.3, 0.7, 1.0);
                        outline.width = 3;

                        // this.cardView.node.addChild(this.label_money);
                        var fadeout = cc.fadeOut(1.5);
                        label_money.node.runAction(cc.sequence(cc.moveBy(0.5, cc.p(0,20)),cc.delayTime(0.25),
                            cc.spawn(cc.moveBy(1.0,cc.p(0,20)),fadeout), cc.removeSelf()));

                    }
                }
            }, this);
            var callFuncUpdateMoney = cc.callFunc(function () {
                if (this.isUpdateMoney) {
                    this.setOriginMoney();
                }
                this.isRun = false;
            }, this);

            lbl_text.node.runAction(cc.sequence(cc.moveBy(0.5, cc.p(0, 50)),
                callFunc, cc.spawn(cc.moveBy(1.0, cc.p(0, 50)), fadeout),
                callFuncUpdateMoney, cc.removeSelf()));
            // this.cardView.node.addChild(this.label_text);
        }
        else {
            this.setOriginMoney();
            this.isRun = false;
        }
    },
    setOriginMoney: function() {
        var response = this.getBINUpdateMoneyResponse();
        cc.log("setOriginMoney response =", response);
        cc.log("setOriginMoney response 1 =", this.updateMoneyResponse);
        if(response !== 0){
            for (var i = 0; i < response.getMoneyboxesList(); i++) {
                var moneybox = response.getMoneyboxesList()[i];
                if (moneybox.getDisplaychangemoney() > 0) {
                    var userInfo = Common.getUserInfo();
                    if (moneybox.getUserid() === userInfo.userid){
                        var origin_money = moneybox.getCurrentmoney();
                        //set lai tien cho nguoi choi
                        Common.setCash(origin_money);
                    }
                }
            }
        }

        this.isRun = false;
    },
    jarResponseHandler: function(response) {
        cc.log("jarResponseHandler = ", response);
        if (response.getResponsecode()) {
            var jar_type_response = 0;
            var preJarValue = this.jarValue;
            this.jarValue = response.getJarvalue();
            if (response.getArgsList().length > 0) {
                var entry = response.getArgsList()[0];
                if (entry.getKey() === "jarType") {
                    jar_type_response = parseInt(entry.getValue().toString());
                }
            }

            if (jar_type_response === this.calculateTurnType()) {
                if (this.jarType === jar_type_response) {
                    // this.moneyJar.node.runAction(cc.actionInterval(1.0, preJarValue, this.jarValue, function(val){
                    //     var number_cash = Common.numberFormatWithCommas(val);
                    //     this.moneyJar.string = Common.numberFormatWithCommas(this.jarValue);
                    // }));
                    Common.updateMoney(this.moneyJar, preJarValue, preJarValue, this.jarValue);
                }else {
                    this.showJarValue(this.jarValue);
                }
                this.jarType = jar_type_response;
            }
        }

        if (response.hasMessage() && !response.getMessage()) {
            Common.showToast(response.getMessage());
        }

        this.isRequestJar = false;
    },
    getAutoSpin: function() {
        this.autoSpinToggle.isChecked = !this.autoSpinToggle.isChecked;
    },
    showNoHu: function(){
        cc.log("showNoHu");
        var item = cc.instantiate(this.nohuPrefab).getComponent("Nohu");
        item.playAnim();

        var nodeChild = new cc.Node();
        nodeChild.parent = this.bg.node;
        nodeChild.addChild(item.node);

        var callFunc2 = cc.callFunc(function (){
            this.setOriginMoney();
            this.isBreakJar = false;
        },this);


        item.node.runAction(cc.sequence(cc.delayTime(2),callFunc2, cc.delayTime(1), cc.fadeOut(1), cc.removeSelf()));
    },
    initValue: function(json) {
        var results = JSON.parse(json);
        cc.log("results =", results);

        this.lbl_moneys =  results.turnValueCash;
        cc.log("lbl_moneys =", this.lbl_moneys);

        var val = results.jarValue;
        this.showJarValue(val);

    },
    showJarValue: function(val) {
        this.jarValue = val;
        //TODO: binding jarValue
        var number_cash = Common.numberFormatWithCommas(this.jarValue);
        cc.log("number_cash =", number_cash);
        this.moneyJar.string = number_cash;
    },
    getBetMoney: function() {
        var args = this.getEnterRoomResponse();
        var argsList = args.getArgsList()[0];
        var json = null;
        if(argsList.getKey() === "initValue"){
            json = argsList.getValue();
        }
        var bet = this.getKeyBet();
        var results = JSON.parse(json);
        var betStepValue = results.turnValueCash;
        var betMoney = betStepValue[bet];

        return betMoney;
    },
    calculateTurnType: function() {
        return this.getKeyBet() + 1;
    },
    setKeyBet: function (bet) {
        this.bet = bet;
    },
    getKeyBet: function () {
        return this.bet;
    },
    // betEvent: function () {
    //     var currentBet = this.getKeyBet();
    //     if(currentBet === 0){
    //         this.setKeyBet(1);
    //     } else if(currentBet === 1){
    //         this.setKeyBet(2);
    //     } else if(currentBet === 2){
    //         this.setKeyBet(0);
    //     }
    //
    //     this.moneyBet.string = this.getBetMoney();
    //     this.requestJar();
    // },
    betEventOne: function () {
        this.betLightOne.node.active = true;
        this.betLightTwo.node.active = false;
        this.betLightThree.node.active = false;
        this.setKeyBet(0);
        // this.moneyBet.string = this.getBetMoney();
        this.requestJarInGame();
    },
    betEventTwo: function () {
        this.betLightOne.node.active = false;
        this.betLightTwo.node.active = true;
        this.betLightThree.node.active = false;
        this.setKeyBet(1);
        // this.moneyBet.string = this.getBetMoney();
        this.requestJarInGame();
    },
    betEventThree: function () {
        this.betLightOne.node.active = false;
        this.betLightTwo.node.active = false;
        this.betLightThree.node.active = true;
        this.setKeyBet(2);
        // this.moneyBet.string = this.getBetMoney();
        this.requestJarInGame();
    },
    requestJarInGame: function() {
        // if (!this.isRequestJar) {
        //     this.isRequestJar = true;
            NetworkManager.getJarRequest(Common.ZONE_ID.MINI_BACAY, this.calculateTurnType(), false);
        // }
    },
    showSpin: function () {

        var tabString = ["Lịch sử quay", "Lịch sử nổ hũ", "Top cao thủ"];

        Common.showPopup(Config.name.POPUP_HISTORY,function(popup) {
            popup.addTabs(tabString, HISTORY_SPIN);
            popup.appear();
        });

    },
    showTopUser: function () {

        var tabString = ["Lịch sử quay", "Lịch sử nổ hũ", "Top cao thủ"];

        Common.showPopup(Config.name.POPUP_HISTORY,function(popup) {
            popup.addTabs(tabString, HISTORY_TOP_USER);
            popup.appear();
        });

    },
    openSettingPopup: function () {
        Common.showPopup(Config.name.POPUP_SETTING,function(popup) {
            popup.appear();
        });

    },
    openRulesPopup: function () {
        Common.openRules();
    },

});
