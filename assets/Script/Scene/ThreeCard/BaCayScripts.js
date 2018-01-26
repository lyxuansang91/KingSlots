var NetworkManager = require('NetworkManager');
var BaseScene = require('BaseScene');
var BacaySence = cc.Class({
    extends: BaseScene,

    properties: {
        bg: cc.Sprite,
        cardPrefab: cc.Prefab,
        toastPrefab: cc.Prefab,
        cardView: cc.Mask,
        userMoney: cc.Label,
        moneyBet: cc.Label,
        moneyJar: cc.Label,
        roomName: cc.Sprite,
        fastSpinToggle: cc.Toggle,
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
        popupPrefab: cc.Prefab

    },
    statics: {
        instance: null
    },
    exitRoom: function() {
        cc.director.loadScene("Table");
    },

    // use this for initialization
    onLoad: function () {
        BacaySence.instance = this;
        Common.setMiniPokerSceneInstance(cc.director.getScene());

        window.ws.onmessage = this.ongamestatus.bind(this);
        this.userMoney.string = Common.getCash();
        for(var i = 0; i < 3; i++){
            for(var j = 0; j < 3; j++){
                var item = cc.instantiate(this.cardPrefab);
                var posX =  0;
                if(j === 0){
                    posX = - item.getContentSize().width ;
                } else if(j === 2){
                    posX = item.getContentSize().width ;
                } else {
                    posX = 0;
                }

                var posY = 0;
                if(i === 0){
                    posY = item.getContentSize().height;
                } else if (i === 1){
                    posY = 0;
                } else {
                    posY = - (i - 1)*item.getContentSize().height;
                }

                item.getComponent('CardItem').init();
                item.setPositionY(posY);
                item.setPositionX(posX);

                this.cardView.node.addChild(item);
            }

        }


    },

    initDataFromLoading: function(enterZone, enterRoom){
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
        // this.requestJar();
    },

    quayEvent: function () {
        var item = cc.instantiate(this.toastPrefab).getComponent("ToastScripts");
        // var valMoney = (isCash ? turnCashValue[indexCash] : turnGoldValue[indexCash]);
        var money = Common.getCash();
        var betMoney = this.getBetMoney();
        cc.log("betMoney =", betMoney);
        if(betMoney > money){
            var message = "Bạn không có đủ tiền!";
            // item.showToast(message);
            // this.node.addChild(item.node);
            this.showToast(message, this, 2);
            return;
        }
        if (this.autoSpinToggle.isChecked) {
            return;
        }

        if (!this.isRun) {
            this.getTurnMiniThreeCardsRequest(this.calculateTurnType());
        }else{
            var message = "Xin vui lòng đợi!";
            this.showToast(message, this, 2);
            // item.showToast(message);
            // this.node.addChild(item.node);
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
        NetworkManager.getTurnMessageFromServer(0, entries);
    },
    ongamestatus: function(event) {
        if(event.data!==null || typeof(event.data) !== 'undefined') {
            var lstMessage = NetworkManager.parseFrom(event.data, event.data.byteLength);
            // cc.log("lstMessage =", lstMessage.shift());
            if(lstMessage.length > 0) {
                for(var i = 0; i < lstMessage.length; i++){
                    var buffer = lstMessage[i];
                    this.handleMessage(buffer);
                }
            }
        }
    },

    exitRoomResponsehandler: function (resp) {
        cc.log("exit room response handler:", resp.toObject());
        if(resp.getResponsecode()) {

        }

        if(resp.hasMessage()) {
            // show toast
        }
    },

    exitZoneResponseHandler: function(resp) {
        cc.log("exit zone response handler:", resp.toObject());
        if(resp.getResponsecode()) {
            // Common.setZoneId(-1);
            // cc.director.loadScene("Lobby");
        }

        if(resp.hasMessage()) {
            // TODO: display message
        }
    },

    handleMessage: function(buffer) {
        cc.log("buffer =", buffer.message_id);
        switch (buffer.message_id) {
            case NetworkManager.MESSAGE_ID.UPDATE_MONEY:
                var msg = buffer.response;
                this.updateMoneyMessageResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.MATCH_END:
                this.matchEndResponseHandler(buffer.response);
                break;
            case NetworkManager.MESSAGE_ID.EXIT_ROOM:
                var msg = buffer.response;
                this.exitRoomResponsehandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.ENTER_ROOM:
                var msg = buffer.response;
                this.enterRoomResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.EXIT_ZONE:
                var msg = buffer.response;
                this.exitZoneResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.JAR:
                var msg = buffer.response;
                this.jarResponseHandler(msg);
                break;
        }
    },
    updateMoneyMessageResponseHandler: function (response) {
        if (response.getResponsecode()){
            this.setBinUpdateMoney(response);
            this.removeTurnUpdateMoney();
        }
    },
    setBinUpdateMoney: function(response) {
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
                    this.userMoney.string = origin_money;
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
        this.cardView.node.removeAllChildren(true);
        var text_emoticon = response.getTextemoticonsList()[0];
        this.isFinishSpin = false;
        this.isBreakJar = (text_emoticon.getEmoticonid() === 54); //54: nổ hũ

        var stepCard = 11;
        var number = 3;
        var rs = Common.genRandomNumber(carx, stepCard, number);
        var test = Common.genArrayToMultiArray(rs, stepCard, number);
        test[stepCard-2] = carx;
        cc.log("test carx =", test.length);
        for(var i = 0; i < test.length; i++){
            for(var j = 0; j < test[i].length; j++){
                var item = cc.instantiate(this.cardPrefab);
                var cardValue = test[i][j];
                var posX =  0;
                if(j === 0){
                    posX = - item.getContentSize().width ;
                } else if(j === 2){
                    posX = item.getContentSize().width ;
                } else {
                    posX = 0;
                }

                var posY = 0;

                if(i === 0){
                    posY = - item.getContentSize().height;
                } else if (i === 1){
                    posY = 0;
                } else {
                    posY = (i - 1)*item.getContentSize().height;
                }


                item.getComponent('CardItem').replaceCard(cardValue);

                item.setPositionY(posY);
                item.setPositionX(posX);

                this.cardView.node.addChild(item);

                var paddingCard = item.getContentSize().height;

                var moveAction = cc.moveBy(1.5 + j*0.25,
                    cc.p(0, - (test.length - 3)*paddingCard));

                if(j === 0){
                    moveAction = cc.moveBy(1.5 + j*0.25,
                        cc.p(0, - (test.length - 3)*paddingCard));
                }else{
                    moveAction = cc.moveBy((j-1) + 1.5 + (j-1)*0.25 + (test.length - test[i].length) / stepCard,
                        cc.p(0, - (test.length - 4)*paddingCard));
                    // moveAction = cc.moveBy(1.5 + j*0.25,
                    //     cc.p(0, - (test.length - 3)*paddingCard));
                }

                if(j === 2 && i === (test.length -1)){
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

                    item.runAction(cc.sequence(moveAction, cc.moveBy(1.5, cc.p(0, -paddingCard)), callFunc, cc.delayTime(2), callFuncAutoSpin, null));

                }else{
                    if(j === 0){
                        item.runAction(moveAction);
                    }else{
                        item.runAction(cc.sequence(moveAction, cc.moveBy(1.5, cc.p(0, -paddingCard))));
                    }

                }

                item.runAction(moveAction);

            }

        }


    },
    _onDealEnd: function() {
        cc.log("run action");
    },
    handleAutoSpin: function() {

        if (this.autoSpinToggle.isChecked && !this.isRun && this.isFinishSpin) {
            var item = cc.instantiate(this.toastPrefab).getComponent("ToastScripts");
            // var valMoney = (isCash ? turnCashValue[indexCash] : turnGoldValue[indexCash]);
            var money = Common.getCash();
            var betMoney = this.getBetMoney();
            cc.log("betMoney =", betMoney);
            if(betMoney > money){
                var message = "Bạn không có đủ tiền!";
                // item.showToast(message);
                this.showToast(message, this, 2);
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
            var nodeChild = new cc.Node();
            nodeChild.parent = this.node;
            var lbl_text = nodeChild.addComponent(cc.Label);
            lbl_text.string = message;

            lbl_text.node.setPosition(cc.p(1334/2,750/2));
            lbl_text.node.color = cc.color(248,213,82,255);
            var fadeout = cc.fadeOut(1.0);
            var callFunc = cc.callFunc(function () {
                for (var i = 0; i < response.getMoneyboxesList().length; i++) {
                    var nodeMoney = new cc.Node();
                    nodeMoney.parent = this.node;
                    var moneybox = response.getMoneyboxesList()[i];
                    if (moneybox.getDisplaychangemoney() > 0) {
                        this.isUpdateMoney = true;
                        var label_money = nodeMoney.addComponent(cc.Label);
                        label_money.string = moneybox.getDisplaychangemoney().toString();
                        // MLabel::createUpdateMoney(moneybox.displaychangemoney());
                        label_money.node.setPosition(cc.p(1334/2,750/2));
                        label_money.node.color = cc.color(248,213,82,255);
                        // this.cardView.node.addChild(this.label_money);
                        var fadeout = cc.fadeOut(1.5);
                        label_money.node.runAction(cc.sequence(cc.moveBy(0.5, cc.p(0,20)),cc.delayTime(0.25),
                            cc.spawn(cc.moveBy(1.0,cc.p(0,20)),fadeout,null), cc.removeSelf(),null));

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
            callFunc, cc.spawn(cc.moveBy(1.0, cc.p(0, 50)), fadeout, null),
            callFuncUpdateMoney, cc.removeSelf(), null));
            // this.cardView.node.addChild(this.label_text);
        }
        else {
            this.setOriginMoney();
            this.isRun = false;
        }
    },
    setOriginMoney: function() {
        var response = this.getBINUpdateMoneyResponse();
        if(response !== 0){
            for (var i = 0; i < response.getMoneyboxesList().length; i++) {
                var moneybox = response.getMoneyboxesList()[i];
                if (moneybox.getDisplaychangemoney() > 0) {
                    var userInfo = Common.getUserInfo();
                    if (moneybox.getUserid() == userInfo.userid){
                        var origin_money = moneybox.getCurrentmoney();
                        //set lai tien cho nguoi choi
                        Common.setCash(origin_money);
                        this.userMoney.string = origin_money;
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
                        this.moneyJar.string = Common.numberFormatWithCommas(this.jarValue);
                    // }));
                }else {
                    this.showJarValue(this.jarValue);
                }
                this.jarType = jar_type_response;
            }
        }

        if (response.hasMessage() && !response.getMessage()) {
            this.showToast(response.getMessage(), this);
        }

        this.isRequestJar = false;
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
        });


        item.node.runAction(cc.sequence(cc.delayTime(2),callFunc2, cc.removeSelf(), null));
        // var animState = anim.getAnimationState('NoHu');
        // animState.wrapMode = cc.WrapMode.Normal;
        // anim.on('finished', function(event) {
        //     if(event.currentTarget == animState) {
        //         console.log('clipName has finished');
        //     }
        // });
        // anim.play('NoHu');
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
    betEvent: function () {
        var currentBet = this.getKeyBet();
        if(currentBet === 0){
            this.setKeyBet(1);
        } else if(currentBet === 1){
            this.setKeyBet(2);
        } else if(currentBet === 2){
            this.setKeyBet(0);
        }

        this.moneyBet.string = this.getBetMoney();
        this.requestJar();
    },
    showToast: function (strMess, target, delayTime) {
        this._super(strMess, target, delayTime);
    },
    requestJar: function() {
        if (!this.isRequestJar) {
            this.isRequestJar = true;
            NetworkManager.getJarRequest(
                Common.getMiniGameZoneId(), this.calculateTurnType());
        }
    },
    showPopup: function () {
        var tabString = ["Lịch sử quay", "Top cao thủ", "Lịch sử nổ hũ"];
        var nodeChild = new cc.Node();
        nodeChild.parent = this.bg.node;
        var item = cc.instantiate(this.popupPrefab);

        item.getComponent('PopupIngameItem').init(tabString, "history");
        item.setPositionX(0);
        item.setPositionY(0);
        nodeChild.addChild(item);

    }

});
