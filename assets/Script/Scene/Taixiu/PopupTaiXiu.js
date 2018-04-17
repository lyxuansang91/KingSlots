const BaseScene = require('BaseScene');
const NetworkManager = require('NetworkManager');
const Gate = require('Gate');
const ItemChat = require('ItemChat');
const TXMatch = require('TXMatch');

var TABLE_STATE = {
    BET: 1,
    BALANCE: 2,
    RESULT: 3,
    MATCH_END: 4,
    PREPARE_NEW_MATCH: 5
};

var BET_STATE = {
    TAI: 1,
    XIU: 0,
    OTHER: -1
};

cc.Class({
    extends: BaseScene,

    properties: {
        tableStage: 0,
        bg_dark: cc.Sprite,
        btnClose: cc.Button,
        taiGate: Gate,
        xiuGate: Gate,
        lstMatch_view : cc.Node,
        money_keyboard : cc.Node,
        number_keyboard : cc.Node,
        total_money_tai : cc.Label,
        total_money_xiu : cc.Label,
        bet_money_tai : cc.Label,
        bet_money_xiu : cc.Label,
        total_bet_tai : cc.Label,
        total_bet_xiu : cc.Label,
        tai_number_user : cc.Label,
        xiu_number_user : cc.Label,
        session: cc.Label,

        currentSession: 0,
        isNumber: false,
        currentBet: 0,
        betState: -1,
        enterRoomResponse: null,
        roomIndex: -1,
        lstMatch: [TXMatch],
        currentMatch: TXMatch,
        taiXiuResult: cc.Prefab,

        chat_view : cc.Node,
        edit_chat : cc.EditBox,
        item_chat : cc.Prefab,
        item_emotion : cc.Prefab,
        lstMessageChat: [ItemChat],
        bg_emotions : cc.ScrollView,
        result_frames : [cc.SpriteFrame],
        result_sprites : [cc.Sprite],
        result_node : cc.Node,
        taixiu_xoc_anim : cc.Sprite,

        timer : cc.Label,
        can_keo: cc.Sprite,
        bat : cc.Sprite,

    },

    // use this for initialization
    onLoad: function() {
        cc.log("on load tai xiu");
        function onTouchDown (event) {
            return true;
        }

        this.node.on('touchstart', onTouchDown, this.bg_dark);
        this.betState = -1;
        Common.setExistTaiXiu(true);
        this.lstTaiXiuResult = [];
        this.countDownTimer = 0;
    },

    start: function () {
        this.current_chat_height = this.chat_view.getContentSize().height;
        this.isShowEmotion = false;

        this.animation = this.taixiu_xoc_anim.getComponent(cc.Animation);
        this.animation.on('finished',  this.onFinished,this);

        this.addChatEmotion();
    },

    onFinished: function () {
        cc.log('onFinished');
        this.taixiu_xoc_anim.node.active = false;
        if(this.currentMatch.getResult().length > 0){
            this.result_node.active = true;
            for(var i = 0; i < this.result_sprites.length; i ++){
                var value = this.currentMatch.getResult()[i];
                if(value > 0 && value <= 6){
                    this.result_sprites[i].spriteFrame = this.result_frames[value - 1];
                }
            }
        }
    },

    onClose: function() {
        NetworkManager.requestExitRoomMessage(Common.ZONE_ID.TAIXIU, 0);
    },

    onGameStatus: function(event) {
        if(event.data!==null || typeof(event.data) !== 'undefined') {
            var lstMessage = NetworkManager.parseFrom(event.data, event.data.byteLength);
            if(lstMessage.length > 0) {
                for(var i = 0; i < lstMessage.length; i++) {
                    var buffer = lstMessage[i];
                    this.handleMessage(buffer);
                }
            }
        }
    },

    cancel: function() {

    },
    accept: function() {
        if (this.getTableStage() === TABLE_STATE.BET) {
            NetworkManager.sendBet(Common.ZONE_ID.TAIXIU, this.roomIndex, this.currentBet, this.betState);
        } else {
            Common.showToast("Chờ ván sau đi nhé");
        }
    },
    setEnterRoomResponse: function(resp) {
        this.roomIndex = resp.getRoomplay().getRoomindex();
        for (var i = 0; i < resp.getArgsList().length; i++) {
            var key = resp.getArgsList()[i].getKey();
            var value = resp.getArgsList()[i].getValue();
            if (key === "currentTableStage") {
                this.setTableStage(parseInt(value));
            } else if (key === "cdTimerRemaining") {
                //thoi gian con lai

                this.bat.node.active = false;
                var self = this;
                var duration = parseInt(value/1000);
                this.countDownTimer = duration;
                this.timer.string = "";
                this.timer.node.active = true;

                // clear timeout
                this.unscheduleAllCallbacks();
                this.schedule(function () {
                    self.addCountDownTimer();
                },1);

            } else if (key === "sessionId") {
                //set current session
                this.currentMatch = new TXMatch(value, 1, 1, 1);
                this.session.string = value;
                this.currentSession = value;
            } else if (key === "resultHistorys") {
                //xu ly cau
                var listMatch = value.split('|');
                for (var j = 0; j < listMatch.length; j++) {
                    var matchInfo = listMatch[j].split('-');
                    var match = new TXMatch(matchInfo[0], parseInt(matchInfo[1]),
                        parseInt(matchInfo[2]), parseInt(matchInfo[3]));
                    this.lstMatch.push(match);
                }
                this.updateLstMatchView();

            } else if (key === "betGateInfo") {
                this.updateBetGateInfo(value);
            } else if (key === "playerBetInfo") {
                this.updateUserBetLabel(value);
            } else if (key === "playerPreviousBetInfo") {
                //lich su dat van truoc
            }
        }
    },

    addCountDownTimer: function () {
        if(this.countDownTimer < 0){
            this.timer.node.active = false;
            this.timer.string = "";
            this.unscheduleAllCallbacks();

            return;
        }
        var time = "";
        if(this.countDownTimer < 10 && this.countDownTimer >= 0){
            time = ("0" + this.countDownTimer);
        }else if(this.countDownTimer >= 10 && this.countDownTimer < 100){
            time = this.countDownTimer;
        }

        this.timer.string = "00:" + time;
        this.countDownTimer-- ;
    },

    /* target: total_money_tai, total_money_xiu.
    * val: float, so tien
    * Example: this.setTotalMoneyTaiXiu(this.total_money_tai, 5000);
    */
    setTotalMoneyTaiXiu: function(target, val) {
        if(target instanceof cc.Label) {
            target.string = Common.numberFormatWithCommas(val);
        }
    },
    sendMessageTaiXiu: function(message) {
        cc.log("message",message.string);
        NetworkManager.getInstantMessage(Common.ZONE_ID.TAIXIU, Config.SCOPE_CHAT.CHAT_ROOM, message.string, null, null, null);
        message.string = "";
    },
    sendEmotionTaixiu: function(emotionId) {
        cc.log("emotionId",emotionId);
        NetworkManager.getInstantMessage(Common.ZONE_ID.TAIXIU, Config.SCOPE_CHAT.CHAT_ROOM, "", null, null, emotionId);
    },
    setBetMoney: function(event, data) {
        cc.log("data:", Common.getCash());
        if(parseInt(data) > Common.getCash()) {
            Common.showToast("Bạn không đủ tiền để đặt cược!");
            return;
        }
        this.currentBet = 0;
        if(data === "all") {
            this.currentBet = Common.getCash();
        } else {
            var addMoney = parseInt(data);
            if (this.currentBet + addMoney <= Common.getCash()) {
                this.currentBet +=  addMoney;
            }
        }
        if (this.betState === BET_STATE.TAI) {
            this.setTotalMoneyTaiXiu(this.bet_money_tai, this.currentBet);
        } else if (this.betState === BET_STATE.XIU) {
            this.setTotalMoneyTaiXiu(this.bet_money_xiu, this.currentBet);
        }
    },
    setBetMoneyNumber: function(event, data) {
        cc.log("data:", data);
        this.currentBet = 0;

        if(data === "delete") {
            this.currentBet = 0;
        } else if (data === "000") {
            if (this.currentBet * 1000 <= Common.getCash()) {
                this.currentBet = this.currentBet * 1000;
            }

        } else {
            var addMoney = parseInt(data);
            if (this.currentBet * 10 + addMoney <= Common.getCash()) {
                this.currentBet = this.currentBet * 10 + addMoney;
            } else {
                Common.showToast("Bạn không đủ tiền để đặt cược với số tiền này!");
            }
        }

        if (this.betState === BET_STATE.TAI) {
            this.setTotalMoneyTaiXiu(this.bet_money_tai, this.currentBet);
        } else if (this.betState === BET_STATE.XIU) {
            this.setTotalMoneyTaiXiu(this.bet_money_xiu, this.currentBet);
        }
    },

    datTai: function() {
        cc.log("dat cua tai", Common.getCash());
        if(this.betState !== BET_STATE.TAI) {
            this.betState = BET_STATE.TAI;
            this.bet_money_xiu.string = "Đặt xỉu";
            this.bet_money_tai.string = "0";
            this.currentBet = 0;
        }
    },
    datXiu: function() {
        cc.log("dat cua xiu", Common.getCash());
        if(this.betState !== BET_STATE.XIU) {
            this.betState = BET_STATE.XIU;
            this.bet_money_tai.string = "Đặt tài";
            this.bet_money_xiu.string = "0";
            this.currentBet = 0;
        }
    },


    onChangeKeyBoard: function() {
        this.number_keyboard.active = this.isNumber;
        this.money_keyboard.active = !this.isNumber;
        this.isNumber = !this.isNumber;
    },
    onDestroy: function() {
        cc.log("on destroy tai xiu");
        Common.setExistTaiXiu(false);
    },
    setTableStage: function(stage) {
        this.tableStage = stage;
    },

    getTableStage: function() {
        return this.tableStage;
    },
    handleMessage: function(buffer) {
        var isDone = this._super(buffer);
        if(isDone)
            return true;
        isDone = true;
        switch (buffer.message_id) {
            case NetworkManager.MESSAGE_ID.START_MATCH:
                var msg = buffer.response;
                this.handleStartMatchResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.MATCH_END:
                var msg = buffer.response;
                this.handleMatchEndResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.MATCH_BEGIN:
                var msg = buffer.response;
                this.handleMatchBeginResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.TURN:
                var msg = buffer.response;
                this.handleTurnResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.EXIT_ROOM:
                var msg = buffer.response;
                this.exitRoomResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.EXIT_ZONE:
                this.exitZoneResponseHandler(buffer.response);
                break;
            case NetworkManager.MESSAGE_ID.BET:
                var msg = buffer.response;
                this.betResponseHandler(msg);
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
    exitZoneResponseHandler: function(resp) {
        cc.log("exit zone response:", resp.toObject());
        if(resp.getResponsecode()) {
            Common.setZoneId(-1);
            Common.closePopup("PopupTaiXiu");
        }
    },

    instantMessageResponseHandler: function(resp) {
        cc.log("instant message response:", resp.toObject());
        if(resp.getResponsecode()) {
            var message = resp.hasInstantmessage() ? resp.getInstantmessage() : "";
            var itemChat = new ItemChat();
            itemChat.emoticonId = resp.getTextemoticonid();
            itemChat.messageChat = message;
            itemChat.senderUserId = resp.getSenderuserid();
            itemChat.senderUserName = resp.getSenderusername();
            itemChat.colorCode = resp.getColorcode();
            //this.lstMessageChat.push(itemChat);
            this.appendMesasgeChat(itemChat);
        }

        if(resp.hasMessage() && resp.getMessage() !== "") {
            Common.showToast(resp.getMessage(), 2.0);
        }
    },
    appendMesasgeChat: function(itemChat) {
        // TODO: Append message chat

        var item = cc.instantiate(this.item_chat);
        var item_comp = item.getComponent("ItemChat");
        item_comp.init(itemChat);

        this.chat_view.addChild(item);

        var childs = this.chat_view.children;

        var size_inner_h = 0;
        var posY = 0;

        for(var i = 0; i < childs.length; i++){
            var size_item = childs[i].getComponent("ItemChat").node.getContentSize().height;
            size_inner_h += size_item + 10;
        }

        for(var i = 0; i < childs.length; i++){
            var size_item = childs[i].getComponent("ItemChat").node.getContentSize().height;
            childs[i].setPosition(cc.p(0,size_inner_h - posY));

            posY += size_item + 10;
        }

        var size_inner = cc.size(this.chat_view.getContentSize().width,size_inner_h);

        if(size_inner.height > this.current_chat_height*2){
            this.chat_view.children[0].removeFromParent(true);
        }

        if(size_inner.height > this.current_chat_height){
            this.chat_view.setContentSize(size_inner);
        }
    },

    showPopupEmotion: function () {
        this.isShowEmotion = !this.isShowEmotion;
        this.bg_emotions.node.active = this.isShowEmotion;
    },

    addChatEmotion: function () {
        this.content = this.bg_emotions.content;
        var innerSize = cc.size(this.content.getContentSize().width,
            this.content.getContentSize().height);
        var padding = 0;

        for(var i = 0; i < 16; i++){
            var icon_emotion = cc.instantiate(this.item_emotion);
            var icon_comp = icon_emotion.getComponent("ItemEmotion");
            icon_comp.init(i + 1);
            icon_comp.addTouch(function (index) {
                this.sendEmotionTaixiu(index);
                this.showPopupEmotion();
            }.bind(this));

            var size = icon_comp.node.getContentSize();

            if(i == 0){
                padding = innerSize.width/3 - size.width;
                innerSize = cc.size(innerSize.width,size.height*1.1*6);
                this.content.setContentSize(innerSize);
            }

            var x = parseInt(i%3);
            var y = parseInt(i/3);

            var posX = (x - 1)*size.width*1.2 - 0.5* size.width;
            var posY = (-.1 - y)*size.height*1.1;

            icon_emotion.setPositionX(posX);
            icon_emotion.setPositionY(posY);

            this.bg_emotions.content.addChild(icon_emotion);
        }
    },

    betResponseHandler: function(resp) {
        cc.log("bet response:", resp.toObject());
        if(resp.getResponsecode()) {
            var typeId = resp.getBettype();
            var betMoney = resp.getBetmoney();
            if (resp.getSourceuserid() === Common.getUserId()) {
                this.currentBet = 0;
                if (this.betState === BET_STATE.TAI) {
                    this.setTotalMoneyTaiXiu(this.bet_money_tai, 0);
                } else if (this.betState === BET_STATE.XIU) {
                    this.setTotalMoneyTaiXiu(this.bet_money_xiu, 0);
                }
            }

            for (var i = 0; i < resp.getArgsList().length; i++) {
                var key = resp.getArgsList()[i].getKey();
                var value = resp.getArgsList()[i].getValue();
                if (key === "betGateInfo") {
                    this.updateBetGateInfo(value);
                } else if (key === "totalPlayerBetGate") {
                    switch (typeId) {
                        case 1: {
                            this.total_bet_tai.string = value;
                            break;
                        }

                        case 0: {
                            this.total_bet_xiu.string = value;
                            break;
                        }

                        default:
                            break;
                    }
                }
            }
        } else {
            Common.showToast(resp.getMessage());
        }
    },
    exitRoomResponseHandler: function(resp) {
        cc.log("exit room response:", resp.toObject());
        if(resp.getResponsecode()) {

        }
    },
    handleTurnResponseHandler: function(resp) {
        cc.log("turn response:", resp.toObject());
        if(resp.getResponsecode()) {
            for (var i = 0; i < resp.getArgsList().length; i++) {
                var key = resp.getArgsList()[i].getKey();
                var value = resp.getArgsList()[i].getValue();
                if (key === "tableStage") {
                    var intValue = parseInt(value);
                    this.setTableStage(intValue);
                    if (intValue === TABLE_STATE.BALANCE) {
                        Common.showToast("Cân cửa");
                        this.can_keo.node.active = true;
                        this.timer.node.active = false;
                    } else if (intValue === TABLE_STATE.RESULT) {
                        //Show animation tung con xúc sắc
                    }
                } else if (key === "betGateInfo") {
                    this.updateBetGateInfo(value);
                } else if (key === "diceValues") {
                    if (this.getTableStage() == TABLE_STATE.RESULT) {
                        var dicesvalue = value.split('-').map(Number);
                        this.currentMatch.setResult(dicesvalue[0], dicesvalue[1], dicesvalue[2]);
                        cc.log("OK");
                        //show animation con xuc sac quay

                        this.bat.node.active = false;
                        this.can_keo.node.active = false;
                        this.showXocAnimation();

                    }
                } else if (key === "totalValue") {

                } else if (key === "playerBetInfo") {
                    this.updateUserBetLabel(value);
                }
            }
        }
    },
    handleStartMatchResponseHandler: function(resp) {
        cc.log("start match response:", resp);
        if(resp.getResponsecode()) {
            //countdown dem nguoc
            var countdown = resp.getCountdowntimer() / 1000;
            var argList = resp.getArgsList();
            for (var i = 0; i < resp.getArgsList().length; i++) {
                var key = resp.getArgsList()[i].getKey();
                var value = resp.getArgsList()[i].getValue();
                if (key === "sessionId") {
                    this.currentMatch.setSestionID(value);
                    this.session.string = value;
                    this.currentSession = value;
                }
            }
            Common.showToast(resp.getMessage());
        }
    },

    handleMatchEndResponseHandler: function(resp) {
        cc.log("match end response:", resp.toObject());
        if(resp.getResponsecode()) {

            this.setTotalMoneyTaiXiu(this.total_money_tai, 0);
            this.setTotalMoneyTaiXiu(this.total_money_xiu, 0);
            this.setTotalMoneyTaiXiu(this.total_bet_tai, 0);
            this.setTotalMoneyTaiXiu(this.total_bet_xiu, 0);
            this.setTotalMoneyTaiXiu(this.tai_number_user, 0);
            this.setTotalMoneyTaiXiu(this.xiu_number_user, 0);
            this.lstMatch.push(this.currentMatch.duplicate());
            if (this.lstMatch.length > 16) {
                this.lstMatch.shift();
            }
            this.updateLstMatchView();
        }
        if(resp.hasMessage() && resp.getMessage() !== "")
            Common.showToast(resp.getMessage());
    },
    handleMatchBeginResponseHandler: function(resp) {
        cc.log("match begin response:", resp.toObject());
        if(resp.getResponsecode()) {
            this.setTableStage(TABLE_STATE.BET);
            Common.showToast("Bat đầu đặt cược");
            //TODO: bắt đầu chạy thời gian đặt cửa trên đĩa với thời gian là countdown
            var self = this;

            this.bat.node.active = true;
            this.countDownTimer = parseInt(resp.getCountdowntimer()/1000);
            this.timer.string = "";
            this.timer.node.active = true;

            this.unscheduleAllCallbacks();
            self.schedule(function () {
                self.addCountDownTimer();
            },1);

            this.result_node.active = false;
        }
    },
    onGameEvent: function() {
        var self = this;
        NetworkManager.checkEvent(function(buffer) {
            return self.handleMessage(buffer);
        });
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        this.onGameEvent();
    },

    updateBetGateInfo: function(bet_gate_info) {
        var listBetGateInfo = bet_gate_info.split(',');
        for (var j = 0; j < listBetGateInfo.length; j++) {
            var betGateInfo = listBetGateInfo[j].split('-').map(Number);
            switch (betGateInfo[0]) {
                case 1: {
                    this.setTotalMoneyTaiXiu(this.total_money_tai, betGateInfo[1]);
                    this.setTotalMoneyTaiXiu(this.tai_number_user, betGateInfo[2]);
                    break;
                }

                case 0: {
                    this.setTotalMoneyTaiXiu(this.total_money_xiu, betGateInfo[1]);
                    this.setTotalMoneyTaiXiu(this.xiu_number_user, betGateInfo[2]);
                    break;
                }

                default:
                    break;
            }
        }
    },

    updateUserBetLabel: function(user_bet_gate) {
        var listBetGateInfo = user_bet_gate.split(',');
        for (var j = 0; j < listBetGateInfo.length; j++) {
            var betGateInfo = listBetGateInfo[j].split('-').map(Number);
            switch (betGateInfo[0]) {
                case 1: {
                    this.total_bet_tai.string = betGateInfo[1];
                    break;
                }

                case 0: {
                    this.total_bet_xiu.string = betGateInfo[1];
                    break;
                }

                default:
                    break;
            }
        }
    },

    updateLstMatchView: function() {
        cc.log("OK");
        for (var j = 0; j < this.lstMatch.length; j++) {
            // if (j < this.lstMatch.length) {
            if( this.lstTaiXiuResult.length < 16) {
                var taixiu_result = cc.instantiate(this.taiXiuResult);
                var taixiu_result_component = taixiu_result.getComponent("TaiXiuResult");
                taixiu_result_component.initNumber(this.lstMatch[j].sum());
                taixiu_result_component.initResult(this.lstMatch[j].sum() >= 11);
                taixiu_result.setPosition((j-this.lstMatch.length / 2) * taixiu_result_component.node.getContentSize().width * 1.2, 0);
                this.lstMatch_view.addChild(taixiu_result);
                this.lstTaiXiuResult.push(taixiu_result_component);
            } else {
                var taixiu_result_component = this.lstTaiXiuResult[j];
                taixiu_result_component.initNumber(this.lstMatch[j].sum());
                taixiu_result_component.initResult(this.lstMatch[j].sum() >= 11);
            }

            // if (this.lstMatch[j].sum() < 11) {
            //     cc.log("xiu");
            //     //set texture xiu cho sprite
            //     taixiu_result_component.initResult(false);
            // } else {
            //     cc.log("tai");
            //     taixiu_result_component.initResult(true);
            //     //set texture tai cho sprite
            // }
            // } else {
            //     sprite.active = false;
            // }
        }
    },

    openRulesPopup: function () {
        Common.openRules();
    },

    openTopUserPopup: function () {
        var tabString = ["Theo ngày", "Theo tuần"];
        Common.showPopup(Config.name.POPUP_TAIXIU_TOP,function(popup) {
            popup.addTabs(tabString, 1);
            popup.appear();
        });
    },

    openBetHistoryPopup: function () {
        Common.showPopup(Config.name.POPUP_TAIXIU_BET_HISTORY,function(popup) {
            popup.appear();
        });
    },

    openSessionHistoryPopup: function () {
        var self = this;
        cc.log("crrSession =", this.currentSession);
        Common.showPopup(Config.name.POPUP_TAIXIU_SESSION_HISTORY,function(popup) {
            var crrSession = self.currentSession;
            popup.init(crrSession);
            popup.appear();
        });
    },
    showXocAnimation: function () {
        this.taixiu_xoc_anim.node.active = true;
        this.animation.play();
    },

    openStatis: function() {
        Common.showPopup(Config.name.POPUP_TAIXIU_STATIS, function(popup){
            popup.appear();
        });
    },
});
