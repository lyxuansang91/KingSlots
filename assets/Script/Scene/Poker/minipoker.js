var NetworkManager = require('NetworkManager');
var BaseScene = require('BaseScene');
var HISTORY_SPIN = 1;
var HISTORY_BREAK_JAR = 2;
var HISTORY_TOP_USER = 3;
var MiniPoker = cc.Class({
    extends: BaseScene,

    properties: {
        cardView: cc.Mask,
        cardPrefab: cc.Prefab,
        isFinishSpin: true,
        isRun: false,
        stepCard : 9,
        number : 5,
        time_move: 1,
        list_item: [],
        list_recent_value: null,
        enterRoomResponse: null,
        enterZoneResponse: null,
        betType: 0,
        moneyBet: cc.Label,
        userMoney: cc.Label,
        jarMoney: cc.Label,
        isRequestJar: false,
        jarValue: 0,
        roomIndex: 0,
        popupPrefab: cc.Prefab,
        nohuPrefab: cc.Prefab,
        autoSpinToggle: cc.Toggle,
        fastSpinToggle: cc.Toggle,
        updateMoneyResponse: null
    },
    statics: {
        instance: null
    },
    exitRoom: function() {
        // cc.director.loadScene("Table");
        NetworkManager.requestExitRoomMessage(Common.ZONE_ID.MINI_POKER, 0);
    },
    handleAutoSpin: function() {
        if (this.autoSpinToggle.isChecked && !this.isRun && this.isFinishSpin) {
            // var valMoney = (isCash ? turnCashValue[indexCash] : turnGoldValue[indexCash]);
            this.time_move = (this.fastSpinToggle.isChecked ? 0.4 : 1);
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
    updateMoneyMessageResponseHandler: function (response) {
        cc.log("update money response:", response.toObject());
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
    update: function(dt) {
        this.handleAutoSpin();
        this.onGameEvent();
    },
    onGameEvent: function() {
        var self = this;
        NetworkManager.checkEvent(function(buffer) {
            return self.handleMessage(buffer);
        });
    },
    getFastSpin: function() {
        this.fastSpinToggle.isChecked = !this.fastSpinToggle.isChecked;
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
        if(!this.isRequestJar) {
            cc.log("request jar:", this.betType + 1);
            this.isRequestJar = false;
            NetworkManager.getJarRequest(Common.getZoneId(), this.betType + 1);
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
        cc.log("bet type 1:", this.betType);
        this.setKeyBet(0);
        this.moneyBet.string = this.getBetMoney();
        this.requestJar();
    },
    betToggleTwoEvent: function() {
        cc.log("bet type 2:", this.betType);
        this.setKeyBet(1);
        this.moneyBet.string = this.getBetMoney();
        this.requestJar();
    },
    betToggleThreeEvent: function() {
        cc.log("bet type 3:", this.betType);
        this.setKeyBet(2);
        this.moneyBet.string = this.getBetMoney();
        this.requestJar();
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
    initValue: function(json) {
        var results = JSON.parse(json);
        cc.log("results =", results);

        this.moneyBet.string =  Common.numberFormatWithCommas(results.turnValueCash[this.betType]);
        // cc.log("lbl_moneys =", this.lbl_moneys);

        var val = results.jarValue;
        this.jarMoney.string = Common.numberFormatWithCommas(val);
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

    takeTurn: function() {
        this.time_move = (this.fastSpinToggle.isChecked ? 0.4 : 1);
        this.getTurnMiniPokerRequest(this.betType + 1);
    },

    initFirstCard: function() {
        var random_number = Common.genRandomCardNumber(null, this.stepCard, this.number);
        var items_value = Common.genArrayToMultiArray(random_number, this.stepCard, this.number);
        this.list_recent_value = Common.create2DArray(this.stepCard);
        for(var i = 0; i < this.stepCard; i++){
            for(var j = 0; j < this.number; j++){
                var item = cc.instantiate(this.cardPrefab);
                var posX = (j - 2) * item.getContentSize().width * 0.75;
                var posY = (i - 1) * item.getContentSize().height;
                item.getComponent('CardItem').replaceCard(items_value[i][j]);
                item.setPositionY(posY);
                item.setPositionX(posX);

                this.list_item.push(item);
                this.cardView.node.addChild(item);
            }
        }

        this.list_recent_value = items_value;
    },
    onDestroy: function() {
        this.unscheduleAllCallbacks();
    },

    // use this for initialization
    onLoad: function () {
        MiniPoker.instance = this;
        this.userMoney.string = Common.numberFormatWithCommas(Common.getCash());
        this.betType = 0;
        this.initFirstCard();
        var self = this;
        self.schedule(function() {
            self.requestJar();
        }, 5);
        // setInterval(function() {
        //     this.requestJar();
        // }.bind(this), 5000);
        Common.setMiniPokerSceneInstance(cc.director.getScene());
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


        item.node.runAction(cc.sequence(cc.delayTime(2),callFunc2, cc.delayTime(1), cc.fadeOut(1), cc.removeSelf(), null));
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
            nodeChild.parent = this.node;
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
                    nodeMoney.parent = this.node;
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
                    this.userMoney.string = Common.numberFormatWithCommas(origin_money);
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
                        this.userMoney.string = Common.numberFormatWithCommas(origin_money);
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

        /*var items_value_convert = [];
        for(var i = 0; i < items_value.length; i++){
            for(var j = 0; j < items_value[i].length; j++){
                items_value_convert.push(items_value[i][j]);
            }
        }

        var items_value_display = Common.create2DArray(this.number);
        for(var i = 0; i < items_value_convert.length; i++){
            items_value_display[i%this.number].push(items_value_convert[i]);
        }*/

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

            var posX = (y - 2) * this.list_item[i].getContentSize().width * 0.75;
            var posY = (x - 1) * this.list_item[i].getContentSize().height;

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

            var h = card.getContentSize().height;

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
                card.runAction(cc.sequence(delay,move1,move3,move2,call_func, cc.delayTime(2), callFuncAutoSpin, null));
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
    exitRoomResponseHandler: function(resp) {
        cc.log("exit room response handler:", resp.toObject());
        if(resp.getResponsecode()) {

        }
        if(resp.hasMessage() && resp.getMessage() !== "") {

        }
    },
    exitZoneResponseHandler: function(resp) {
        cc.log("exit zone response handler:", resp.toObject());
        if(resp.getResponsecode()) {
            cc.director.loadScene("Lobby");
            Common.setZoneId(-1);
        }

        if(resp.hasMessage() && resp.getMessage() !== "") {
            // show toast
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
                    this.jarMoney.string = Common.numberFormatWithCommas(this.jarValue);
                }
                this.jarType = jar_type_response;
            }
        }
    },
    handleMessage: function(buffer) {
        //  cc.log("buffer =", buffer.message_id);
        var isDone = this._super(buffer);
        if(isDone) {
            return true;
        }
        isDone = true;
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
                this.exitRoomResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.EXIT_ZONE:
                var msg = buffer.response;
                this.exitZoneResponseHandler(msg);
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
