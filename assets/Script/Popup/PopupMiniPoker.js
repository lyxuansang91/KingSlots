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
        number : 5,
        time_move: 1,
        roomIndex: 0,
    },

    btnCangatClick: function (){
        this.animation.play('cangat');
        this.takeTurn();
    },
    exitRoom: function() {
        // cc.director.loadScene("Table");
        NetworkManager.requestExitRoomMessage(Common.ZONE_ID.MINI_POKER, 0);
    },
    // use this for initialization
    onLoad: function () {
        this.betType = 0;
        this.initFirstCard();
        var self = this;
        self.schedule(function() {
            self.requestJar();
        }, 5);
        Common.setMiniPokerSceneInstance(cc.director.getScene());

        var self = this;
        this.background.node.on("touchstart", function( touch) {
            var locationInNode = self.background.node.convertToNodeSpace(touch.getLocation());
            var rect = self.background.spriteFrame.getRect();

            if (cc.rectContainsPoint(rect,locationInNode)){
                var touch_location = touch.getLocation();
                self.touchOffset = cc.p(self.background.node.getPosition().x - touch_location.x,
                    self.background.node.getPosition().y - touch_location.y);
                // this.node.reorderChild(self.background.node.getLocalZOrder());
                this.node.setLocalZOrder(this.node.getLocalZOrder() + 1);
                cc.log("zorder poker =", this.node.getLocalZOrder());
                return true;
            }

            return false;
        }, this);

        this.background.node.on("touchmove", function( touch) {
            this.background.node.setPosition(cc.p(touch.getLocation()).add(self.touchOffset));
        }, this);
    },

    initFirstCard: function() {
        var random_number = Common.genRandomCardNumber(null, this.stepCard, this.number);
        var items_value = Common.genArrayToMultiArray(random_number, this.stepCard, this.number);
        this.list_recent_value = Common.create2DArray(this.stepCard);
        for(var i = 0; i < this.stepCard; i++){
            for(var j = 0; j < this.number; j++){
                var item = cc.instantiate(this.cardPrefab);
                item.setScale(0.5, 0.5);
                var posX = (j - 2) * item.getContentSize().width / 2;
                var posY = (i - 1) * item.getContentSize().height / 2;
                item.getComponent('CardItem').replaceCard(items_value[i][j]);
                item.setPositionY(posY);
                item.setPositionX(posX);

                this.list_item.push(item);
                this.cardView.addChild(item);
            }
        }

        this.list_recent_value = items_value;
    },
    initDataFromLoading: function(enterZone, enterRoom){
        this.setEnterZoneResponse(enterZone);
        Common.setMiniGameZoneId(enterZone.getZoneid());
        this.setEnterRoomResponse(enterRoom);
        this.init(enterRoom);
    },
    init: function(response) {
        var roomPlay = response.getRoomplay();
        this.roomIndex = roomPlay.getRoomindex();

        if (response.getArgsList().length > 0) {
            var entry = response.getArgsList()[0];
            if (entry.getKey() === "initValue") {
                this.initValue(entry.getValue());
            }
        }
    },
    update: function(dt) {
        this.handleAutoSpin();
        this.onGameEvent();
    },
    onDestroy: function() {
        this.unscheduleAllCallbacks();
    },
    onGameEvent: function() {
        var self = this;
        NetworkManager.checkEvent(function(buffer) {
            return self.handleMessage(buffer);
        });
    },
    takeTurn: function() {
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
            this.getTurnMiniPokerRequest(this.betType + 1);
        }else{
            var message = "Xin vui lòng đợi!";
            Common.showToast(message);
        }


    },
    getTurnMiniPokerRequest: function(turnType) {
        var entries = [];
        var entry = new proto.BINMapFieldEntry();
        entry.setKey("turnSlotType");
        entry.setValue(turnType.toString());
        entries.push(entry);
        NetworkManager.getTurnMessageFromServer(Common.ZONE_ID.MINI_POKER, 0, entries);
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
    //     //  cc.log("buffer =", buffer.message_id);
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
    //             this.exitRoomResponseHandler(msg);
    //             break;
    //         case NetworkManager.MESSAGE_ID.EXIT_ZONE:
    //             var msg = buffer.response;
    //             this.exitZoneResponseHandler(msg);
    //             break;
    //         // case NetworkManager.MESSAGE_ID.JAR:
    //         //     var msg = buffer.response;
    //         //     this.jarResponseHandler(msg);
    //         //     break;
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
        cc.log("update money response:", response.toObject());
        if (response.getResponsecode()){
            this.setBinUpdateMoney(response);
            this.removeTurnUpdateMoney();
        }
    },
    handleAutoSpin: function() {
        if (this.autoSpinToggle.isChecked && !this.isRun && this.isFinishSpin) {
            this.isRun = true;
            var money = Common.getCash();
            var betMoney = this.getBetMoney();
            cc.log("betMoney =", betMoney);
            if(betMoney > money){
                var message = "Bạn không có đủ tiền!";
                Common.showToast(message, 2);
                this.autoSpinToggle.isChecked = false;
                return;
            }
            this.getTurnMiniPokerRequest(this.calculateTurnType());
        }
    },

    setBinUpdateMoney: function(response) {
        this.updateMoneyResponse = response;
    },
    getBINUpdateMoneyResponse: function(){
        return this.updateMoneyResponse;
    },

    getAutoSpin: function() {
        this.autoSpinToggle.isChecked = !this.autoSpinToggle.isChecked;
    },

    setKeyBet: function(key) {
        this.betType = key;
    },
    getKeyBet: function() {
        return this.betType;
    },
    requestJar: function() {
        // if(!this.isRequestJar) {
        //     this.isRequestJar = false;
            NetworkManager.getJarRequest(Common.ZONE_ID.MINI_POKER, this.betType + 1);
        // }
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

    betToggleOneEvent: function(){
        // cc.log("bet type 1:", this.betType);
        // this.setKeyBet(0);
        // this.moneyBet.string = this.getBetMoney();
        this.betLightOne.node.active = true;
        this.betLightTwo.node.active = false;
        this.betLightThree.node.active = false;
        this.setKeyBet(0);
        this.requestJar();
    },
    betToggleTwoEvent: function() {
        // cc.log("bet type 2:", this.betType);
        // this.setKeyBet(1);
        // this.moneyBet.string = this.getBetMoney();
        this.betLightOne.node.active = false;
        this.betLightTwo.node.active = true;
        this.betLightThree.node.active = false;
        this.setKeyBet(1);
        this.requestJar();
    },
    betToggleThreeEvent: function() {
        // cc.log("bet type 3:", this.betType);
        // this.setKeyBet(2);
        // this.moneyBet.string = this.getBetMoney();
        this.betLightOne.node.active = false;
        this.betLightTwo.node.active = false;
        this.betLightThree.node.active = true;
        this.setKeyBet(2);
        this.requestJar();
    },

    initValue: function(json) {
        var results = JSON.parse(json);
        cc.log("results =", results);

        this.moneyBet.string =  Common.numberFormatWithCommas(results.turnValueCash[this.betType]);
        // cc.log("lbl_moneys =", this.lbl_moneys);

        var val = results.jarValue;
        this.moneyJar.string = Common.numberFormatWithCommas(val);
    },
    setEnterZoneResponse: function(res) {
        this.enterZoneResponse = res;
    },
    getEnterZoneResponse: function() {
        return this.enterZoneResponse;
    },
    getEnterRoomResponse: function() {
        return this.enterRoomResponse;
    },
    setEnterRoomResponse: function(resp) {
        this.enterRoomResponse = resp;
    },



    ongamestatus: function(event) {
        if(event.data!==null || event.data !== 'undefined') {
            var lstMessage = NetworkManager.parseFrom(event.data, event.data.byteLength);
            cc.log("list message size:" + lstMessage.length);
            if(lstMessage.length > 0) {
                for(var i = 0; i < lstMessage.length; i++){
                    var buffer = lstMessage[i];
                    this.handleMessage(buffer);
                }
            }
        }
    },

    showNoHu: function() {
        cc.log("showNoHu");
        var item = cc.instantiate(this.nohuPrefab).getComponent("Nohu");
        item.playAnim();

        var nodeChild = new cc.Node();
        nodeChild.parent = this.node;
        nodeChild.addChild(item.node);

        var callFunc2 = cc.callFunc(function (){
            this.setOriginMoney();
            this.isBreakJar = false;
        },this);


        item.node.runAction(cc.sequence(cc.delayTime(2),callFunc2, cc.delayTime(1), cc.fadeOut(1), cc.removeSelf()));
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
                        // MLabel::createUpdateMoney(moneybox.displaychangemoney());
                        // label_money.node.setPosition(cc.p(1334/2,750/2));
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
    removeTurnUpdateMoney: function(){
        var updateMoneyResponse = this.getBINUpdateMoneyResponse();
        cc.log("updateMoneyResponse =", updateMoneyResponse.getMoneyboxesList());
        if(updateMoneyResponse.getResponsecode()) {
            for(var i = 0; i < updateMoneyResponse.getMoneyboxesList().length; i++) {
                var money_box = updateMoneyResponse.getMoneyboxesList()[i];
                if(money_box.getReason() === "miniPokerSpin") {
                    var origin_money = money_box.getCurrentmoney();
                    //set lai tien cho nguoi choi

                    Common.setCash(origin_money);
                    // this.userMoney.string = Common.numberFormatWithCommas(origin_money);
                    //this->moneyEvent->onEventMoneyMiniGame(true,origin_money);

                }
            }
        }
    },
    setOriginMoney: function() {
        var response = this.getBINUpdateMoneyResponse();
        if(response !== 0){
            for (var i = 0; i < response.getMoneyboxesList().length; i++) {
                var moneybox = response.getMoneyboxesList()[i];
                if (moneybox.getDisplaychangemoney() > 0) {
                    var userInfo = Common.getUserInfo();
                    if (moneybox.getUserid() === userInfo.userid){
                        var origin_money = moneybox.getCurrentmoney();
                        //set lai tien cho nguoi choi
                        Common.setCash(origin_money);
                        // this.userMoney.string = Common.numberFormatWithCommas(origin_money);
                    }
                }
            }
        }

        this.isRun = false;
    },

    implementSpinMiniPokerCards: function(carx, response) {
        cc.log("carx =", carx);

        var text_emoticon = response.getTextemoticonsList()[0];
        this.isFinishSpin = false;
        this.isBreakJar = (text_emoticon.getEmoticonid() === 54); //54: nổ hũ

        var random_number = Common.genRandomCardNumber(carx, this.stepCard, this.number);
        var items_value = Common.genArrayToMultiArray(random_number, this.stepCard, this.number);
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
                this.list_item[i].getComponent('CardItem').replaceCard(this.list_recent_value[i1][j1]);
            }

            var posX = (y - 2) * this.list_item[i].getContentSize().width  / 2;
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
                card.getComponent('CardItem').replaceCard(card_value);
            }

            var h = card.getContentSize().height/2;

            var move1 = cc.moveBy(0.2, cc.p(0,h*0.25));
            var move2 = cc.moveBy(0.15, cc.p(0,h*0.25));
            var move3 = cc.moveBy(this.time_move,cc.p(0,-(this.stepCard - 3.0)*h - 0.5*h));
            var delay = cc.delayTime(y*0.3);

            if(i === this.list_item.length - 1){
                // khi dừng hiệu ứng
                var emoticon = response.getTextemoticonsList()[0];
                var emotionId = emoticon.getEmoticonid();
                var message = emoticon.getMessage();
                var moneyResponse = this.getBINUpdateMoneyResponse();
                var self = this;

                var call_func = cc.callFunc(function () {
                    cc.log("FINISH!!!!");
                    self.handleRanking(emotionId, message, moneyResponse);
                }, this);

                var callFuncAutoSpin = cc.callFunc(function () {
                    cc.log("auto spin");
                    if(!this.isBreakJar)
                        this.isFinishSpin = true;
                }, this);
                card.runAction(cc.sequence(delay,move1,move3,move2,call_func, cc.delayTime(2), callFuncAutoSpin));
            }else{
                card.runAction(cc.sequence(delay,move1,move3,move2));
            }
        }
    },

    matchEndResponseHandler: function(response) {
        cc.log("match end response handler:", response.toObject());
        if (response.getResponsecode()) {
            if (response.getArgsList().length > 0) {
                for (var i = 0; i < response.getArgsList().length; i++) {
                    if (response.getArgsList()[i].getKey() === "currentCards") {
                        var str = response.getArgsList()[i].getValue();
                        var currentCards = str.split(',').map(Number);
                        this.implementSpinMiniPokerCards(currentCards,response);
                    }
                }
            }

            /*if (response->textemoticons_size() > 0){
             BINTextEmoticon emoticon = response->textemoticons(0);
             handleRanking(emoticon.emoticonid(), emoticon.message());
             }*/
        } else {
            //
        }

        if(response.hasMessage() && response.getMessage() !== "") {
            Common.showToast(response.getMessage(), 2);
        }
    },

    jarResponseHandler: function(resp) {
        cc.log("jar response handler:", resp.toObject());
        if(resp.getResponsecode()) {
            var jar_type_response = 0;
            var preJarValue = this.jarValue;
            this.jarValue = resp.getJarvalue();
            if (resp.getArgsList().length > 0) {
                var entry = resp.getArgsList()[0];
                if (entry.getKey() === "jarType") {
                    jar_type_response = parseInt(entry.getValue().toString());
                }
            }

            if (jar_type_response === this.betType + 1) {
                if (this.jarType === jar_type_response) {
                    // this.moneyJar.node.runAction(cc.actionInterval(1.0, preJarValue, this.jarValue, function(val){
                    //     var number_cash = Common.numberFormatWithCommas(val);
                    Common.updateMoney(this.jarMoney, preJarValue, preJarValue, this.jarValue);
                    // }));
                } else {
                    this.moneyJar.string = Common.numberFormatWithCommas(this.jarValue);
                }
                this.jarType = jar_type_response;
            }
        }
    },


    calculateTurnType: function() {
        return this.getKeyBet() + 1;
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

    openRulesPopup: function () {
        Common.openRules();
    },
});
