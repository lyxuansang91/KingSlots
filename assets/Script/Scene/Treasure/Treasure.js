var BaseScene = require('BaseScene');
var NetworkManager = require('NetworkManager');

var HISTORY_SPIN = 1;
var HISTORY_BREAK_JAR = 2;
var HISTORY_TOP_USER = 3;
var Treasure = cc.Class({
    extends: BaseScene,

    properties: {
        board_view: cc.Mask,
        itemPrefab: cc.Prefab,
        btn_select_lines: cc.Prefab,
        line_result: cc.Prefab,
        nohuPrefab: cc.Prefab,
        board_null_line: cc.Node,
        txt_jar_money: cc.Label,
        txt_bet_money: cc.Label,
        txt_total_line: cc.Label,
        txt_win_money: cc.Label,
        txt_total_bet_money: cc.Label,
        bets_select : [cc.Label],
        popup_bet_select : cc.Node,
        is_bet_select: false,
        isFinishSpin: true,
        isRun: false,
        isRequestJar: false,
        stepMove : 9,
        number : 5,
        time_move: 3,
        jarValue: 0,
        roomIndex: 0,
        betType: 0,
        txt_user_money: cc.Label,
        money_display : cc.Label

    },
    statics: {
        instance: null
    },
    update: function(dt) {
        this.onGameEvent();
    },
    onGameEvent: function() {
        var self = this;
        NetworkManager.checkEvent(function(buffer) {
            return self.handleMessage(buffer);
        });
    },
    initDataFromLoading: function(zoneId, enterRoomResponse) {
        this.enterRoomResponse = enterRoomResponse;
        this.zoneId = zoneId;

        var roomPlay = this.enterRoomResponse.getRoomplay();
        this.roomIndex = roomPlay.getRoomindex();

        if (this.enterRoomResponse.getArgsList().length > 0) {
            var entry = this.enterRoomResponse.getArgsList()[0];
            if (entry.getKey() == "initValue") {
                this.initValue(entry.getValue());
            }
        }
        cc.log("enter room response:", this.enterRoomResponse.toObject());
    },

    initValue: function (json) {
        var value = JSON.parse(json);

        var valueCash = value.turnValueCash;
        for(var i = 0; i < valueCash.length; i++){
            this.turnCashValue.push(valueCash[i]);
            if(i < this.bets_select.length){
                var money = Common.convertIntToMoneyView(valueCash[i]);
                if(i == 0){
                    this.txt_bet_money.string = money;
                    this.txt_total_bet_money.string = Common.numberFormatWithCommas(valueCash[i] * this.lst_number.length);
                }
                this.bets_select[i].string = money;
            }
        }

        this.jarValue = value.jarValue;
        this.txt_jar_money.string = Common.numberFormatWithCommas(this.jarValue);
    },

    onLoad: function() {
        Treasure.instance = this;
        this.schedule(this.requestJar, 5);

        this.init();
        this.initItemPool();
        this.initMenu();
        this.initFirstItem();
    },

    init: function () {
        this.list_item = [];
        this.list_recent_values = [];
        this.lst_number = [6,2,8,5,1,4,10,7,3,9,16,12,19,14,13,17,18,15,11,20];
        this.lst_line_result = [];
        this.lst_line_selected = [];
        this.lst_line_selected_sprite = [];

        this.turnCashValue = [];
        this.indexCash = 0;
        this.prevMoney = 0;
        this.lastMoney = 0;
        this.displayChangeMoney = 0;
        this.txt_user_money.string = Common.numberFormatWithCommas(Common.getCash());

        cc.log("init");
    },
    getAutoSpin: function() {
        Common.showToast("Chức năng này đang được cập nhật");
    },

    initItemPool: function () {
        this.itemPool = new cc.NodePool();
        for (var i = 0; i < 20; ++i) {
            var item = cc.instantiate(this.itemPrefab); // create node instance
            this.itemPool.put(item); // populate your pool with putInPool method
        }
    },

    getItem: function (index) {
        var item = null;
        if(this.itemPool.size() > 0){
            item = this.itemPool.get();
        }else{
            item = cc.instantiate(this.itemPrefab);
        }
        item.getComponent("ItemPrefab").init(index);

        return item;
    },

    initMenu: function () {
        this.lst_number = [6,2,8,5,1,4,10,7,3,9,16,12,19,14,13,17,18,15,11,20];
        this.lst_line_selected = this.lst_number;

        for (var i = 0; i < 20; i++){
            var line_result = cc.instantiate(this.line_result);
            var component = line_result.getComponent("LineResult");
            component.init(i);

            component.show(false);

            this.board_null_line.addChild(line_result,2);

            this.lst_line_result.push(line_result);
        }

        var pos_line_top = 0;
        var size_board = this.board_null_line.getContentSize();

        for (var i = 0; i < 20; i++) {
            var line_number = cc.instantiate(this.btn_select_lines);
            var component = line_number.getComponent("ButtonSelectLines");
            component.initNumber(this.lst_number[i]);
            // component.initHighLight(true);

            var size_line = line_number.getContentSize();
            if (i == 0) {
                pos_line_top = size_line.height * 5*0.93 + size_line.height/2;
            }

            line_number.setPosition(cc.p((parseInt(i / 10) == 0) ?
                (-size_board.width/2 + size_line.width/2) :
                (size_board.width/2 - size_line.width/2),
                pos_line_top - size_line.height * ((i % 10) * 0.93 + 1)));
            this.board_null_line.addChild(line_number,2);

            this.lst_line_selected_sprite.push(component);
        }

        this.setLineSelected();
    },

    initFirstItem: function() {
        for(var i = 0; i < this.stepMove; i++){
            for(var j = 0; j < this.number; j++){
                var r = Math.floor(Math.random() * 7) + 98;
                this.list_recent_values.push(r);
                var item = this.getItem(r - 98);
                var posX = (j - 2) * item.getContentSize().width*1.05;
                var posY = (i - 1) * item.getContentSize().height*1.05;
                item.setPositionY(posY);
                item.setPositionX(posX);

                this.list_item.push(item);
                this.board_null_line.addChild(item);
            }
        }
    },
    showNoHu: function() {
        cc.log("showNoHu");
        var item = cc.instantiate(this.nohuPrefab).getComponent("Nohu");
        item.playAnim();

        this.node.addChild(item.node);
        var self = this;

        var callFunc2 = cc.callFunc(function (){
            cc.log("call func 2");
            Common.countNumberAnim(self.txt_jar_money, self.jarValue, 0, 0, 1);
            self.txt_jar_money.string = 0;
            self.isRequestJar = false;
            self.requestJar();
        },this);


        item.node.runAction(cc.sequence(cc.delayTime(2), callFunc2, cc.delayTime(1), cc.fadeOut(1), cc.removeSelf(), null));
    },

    implementSpinTreasure: function (textEmotionId, listItem,listWin) {
        this.resetLineResult();
        cc.log("lst_line_results : xxx ",this.lst_line_result);
        if(listItem.length == 0){
            return;
        }

        var index_item = 4;
        this.txt_user_money.string = Common.numberFormatWithCommas(this.prevMoney);

        for(var i = 0; i < this.list_item.length; i++){
            var x = parseInt(i/this.number);
            var y = parseInt(i%this.number);

            var value = 0;
            if(i < 3*this.number){

                value = this.list_recent_values[i] - 98;
                this.list_recent_values[i] = listItem[i];

            }else if(i >= this.list_item.length - index_item*this.number &&
                i < this.list_item.length - 1){

                value = this.list_recent_values[i - this.list_item.length + index_item*this.number] - 98;

                //this.list_item[i].getComponent('ItemPrefab').reset();
                //this.list_item[i].getComponent('ItemPrefab').animate();
            }else{
                value = Math.floor(Math.random() * 7);
            }

            this.list_item[i].getComponent('ItemPrefab').init(value);

            var posX = (y - 2) * this.list_item[i].getContentSize().width*1.05;
            var posY = (x - 1) * this.list_item[i].getContentSize().height*1.05;

            this.list_item[i].stopAllActions();
            this.list_item[i].setPositionX(posX);
            this.list_item[i].setPositionY(posY);
        }

        for(var i = 0; i < this.list_item.length; i++){
            var x = parseInt(i/this.number);
            var y = parseInt(i%this.number);

            var item = this.list_item[i];

            var h = item.getContentSize().height*1.05;

            var move1 = cc.moveBy(1,cc.p(0,-this.stepMove*h*0.25)).easing(cc.easeExponentialIn());
            var move2 = cc.moveBy(1,cc.p(0,-(this.stepMove*0.75 - index_item)*h)).easing(cc.easeBackOut());

            var delay = cc.delayTime(y*0.3);

            if(i == this.list_item.length - 1){
                // khi dừng hiệu ứng
                var self = this;
                var call_func = cc.callFunc(function () {
                    // update line_result
                    for(var i = 0; i < listWin.length; i++){
                        if(listWin[i] < 20){
                            var line = self.lst_line_result[listWin[i] - 1];
                            line.getComponent("LineResult").show(true);
                            line.getComponent("LineResult").animate();
                        }
                    }

                    //====== cddd

                    for(var i = 0; i < self.list_item.length; i++){
                        self.list_item[i].getComponent("ItemPrefab").animate();
                    }

                });
                var call_func_display_money = cc.callFunc(function() {
                    self.txt_user_money.string = Common.numberFormatWithCommas(self.lastMoney);
                    if(textEmotionId === 54) {
                        // no hu
                        self.showNoHu();
                        return;
                    }

                    self.txt_win_money.string = Common.numberFormatWithCommas(self.displayChangeMoney);
                    self.implementDisplayChangeMoney(self.displayChangeMoney);
                });
                item.runAction(cc.sequence(delay,move1,move2,call_func, call_func_display_money));
            }else{
                item.runAction(cc.sequence(delay,move1,move2));
            }
        }
    },
    implementDisplayChangeMoney: function(displayChangeMoney) {
        //TODO: hieu ung cong tien su dung bien displayChangeMoney

        this.money_display.node.setPositionY(0);
        this.money_display.string = "+" + displayChangeMoney;
        this.money_display.node.runAction(cc.sequence(
            cc.fadeIn(0.1),
            cc.moveBy(1,cc.p(0,50)),
            cc.fadeOut(0.5)));
    },

    resetLineResult: function () {
        for(var i = 0; i< this.lst_line_result.length; i++){
            var line = this.lst_line_result[i].getComponent("LineResult");
            line.reset();
        }
    },

    requestJar: function() {
        var self = this;
        if(!self.isRequestJar) {
            self.isRequestJar = true;
            NetworkManager.getJarRequest(Common.getZoneId(), this.betType + 1);
        }
    },
    getSpin: function() {
        //var listItem = [98,99,100,98,101,101,99,103,98,101,100,99,102,105,104];
        //var lineWin = [1,2,5,6];
        //this.implementSpinTreasure(listItem,lineWin);
        this.getTurnTreasureRequest(this.betType + 1);
    },
    getTurnTreasureRequest: function(turnType) {
        var entries = [];

        var entryTurn = new proto.BINMapFieldEntry();
        entryTurn.setKey("turnSlotType");
        entryTurn.setValue(turnType.toString());
        entries.push(entryTurn);

        var result = this.lst_line_selected.join(",");

        cc.log("lst_line_selected",this.lst_line_selected);

        var entryLine = new proto.BINMapFieldEntry();
        entryLine.setKey("lineSelected");
        entryLine.setValue(result);
        entries.push(entryLine);
        NetworkManager.getTurnMessageFromServer(Common.ZONE_ID.TREASURE, 0, entries);
    },

    exitRoom: function() {
        NetworkManager.requestExitRoomMessage(Common.ZONE_ID.TREASURE, this.roomIndex);
    },
    getKeyBet: function() {
        return this.betType;
    },
    calculateTurnType: function() {
        return this.getKeyBet() + 1;
    },

    onDestroy: function() {
        this._super();
        cc.log("on destroy");
    },

    onGameStatus: function() {
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
    updateMoneyMessageResponseHandler: function(resp) {
        cc.log("update money response:", resp.toObject());
        if(resp.getResponsecode()) {
            var money_box_treasureSpin = resp.getMoneyboxesList()[0];
            if(resp.getMoneyboxesList().length === 1) {
                Common.setCash(money_box_treasureSpin.getCurrentmoney());
                this.txt_user_money.string = Common.numberFormatWithCommas(money_box_treasureSpin.getCurrentmoney());
            } else {
                this.prevMoney = money_box_treasureSpin.getCurrentmoney();
                this.lastMoney = resp.getMoneyboxesList()[1].getCurrentmoney();
                this.displayChangeMoney = resp.getMoneyboxesList()[1].getDisplaychangemoney();

                Common.setCash(resp.getMoneyboxesList()[1].getCurrentmoney());
            }

        }
        if(resp.hasMessage() && resp.getMessage() !== "") {

        }
    },

    matchEndResponseHandler: function(resp) {
        cc.log("match end response:", resp.toObject());
        if(resp.getResponsecode()) {
            var textEmotionId = null;
            if(resp.getTextemoticonsList().length > 0) {
                textEmotionId = resp.getTextemoticonsList()[0].getEmoticonid();
            }
            if(resp.getArgsList().length > 0) {
                var listItem = null;
                var lineWin = null;
                for(var i = 0; i < resp.getArgsList().length; i++) {
                    var entry = resp.getArgsList()[i];
                    if(entry.getKey() == "listItem") {
                        listItem = entry.getValue().split(", ").map(function(item) {
                            item = parseInt(item);
                            return item;
                        });

                    } else {
                        if(entry.getValue() !== "")
                            lineWin = entry.getValue().split(", ").map(function(item) {
                                item = parseInt(item);
                                return item;
                            });
                        else lineWin = [];

                    }
                }
                if(listItem !== null && lineWin !== null) {

                    cc.log("list item:", listItem);
                    cc.log("line win:", lineWin);

                    // TODO:

                    this.implementSpinTreasure(textEmotionId, listItem,lineWin);
                }
            }
        }

        if(resp.hasMessage() && resp.getMessage() !== "") {
            Common.showToast(resp.getMessage());
        }
    },

    exitRoomResponseHandler: function(resp) {
        cc.log("exit room response message: ", resp.toObject());
        if(resp.getResponsecode()) {

        }
    },
    exitZoneResponseHandler: function(resp) {
        cc.log("exit zone response message:", resp.toObject());
        if(resp.getResponsecode()) {
            Common.setZoneId(-1);
            cc.director.loadScene('Lobby');
        }

        if(resp.hasMessage() && resp.getMessage() !== "") {

        }
    },
    jarResponseHandler: function(resp) {
        cc.log("jar response message:", resp.toObject());
        if(resp.getResponsecode()) {
            this.isRequestJar = false;
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
                    Common.countNumberAnim(this.txt_jar_money, preJarValue, this.jarValue, 0, 1);
                } else {
                    this.txt_jar_money.string = Common.numberFormatWithCommas(this.jarValue);
                }
                this.jarType = jar_type_response;
            }
        }

        if(resp.hasMessage() && resp.getMessage() !== "") {

        }
    },

    chonDongTouchEvent: function () {
        var self = this;
        Common.showPopup(Config.name.POPUP_SELECT_LINE,function (popup) {
            popup.init(self.lst_line_selected,function (eventType,index) {

                self.onEventLineSelected(eventType,index);
            });
            popup.appear();
        });
    },

    chonCuocTouchEvent: function () {
        this.is_bet_select = !this.is_bet_select;
        this.popup_bet_select.active = this.is_bet_select;
    },

    chonMucCuocEvent: function (event,data) {
        if(data < this.bets_select.length && data > -1){
            this.indexCash = data;

            this.txt_bet_money.string = Common.convertIntToMoneyView(this.turnCashValue[this.indexCash]);
            this.is_bet_select = false;
            this.popup_bet_select.active = this.is_bet_select;

            var money_bet = this.turnCashValue[this.indexCash]*this.lst_line_selected.length;
            if(money_bet >= 0){
                this.txt_total_bet_money.string = Common.numberFormatWithCommas(money_bet);
            }

        }
    },

    onEventLineSelected : function (eventType,data) {
        if (eventType == Config.ON_EVENT.EVENT_SELECT_LINE){
            cc.log("eventType : ",eventType);

            cc.log("this.lst_line_selected :",this.lst_line_selected);

            var contain = false;
            for (var i = 0; i < this.lst_line_selected.length; i++){
                if (this.lst_line_selected[i] == data){
                    contain = true;

                    this.lst_line_selected.splice(i,1);
                    break;
                }
            }

            cc.log("contain :",contain);

            if (!contain){
                this.lst_line_selected.push(data);
            }

            this.setLineSelected();

            //lb_dong_value->setString(StringUtils::toString(lst_line_selected.size()));
        }
        else if (eventType == Config.ON_EVENT.EVENT_SELECT_LINE_BY_TYPE){
            cc.log("eventType : ",eventType);

            if (data == Config.SELECT_LINE_TYPE.DONG_CHAN){
                this.lst_line_selected = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
            }
            else if (data == Config.SELECT_LINE_TYPE.DONG_LE){
                this.lst_line_selected = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
            }
            else if (data == Config.SELECT_LINE_TYPE.DONG_ALL){
                this.lst_line_selected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
            }
            else if (data == Config.SELECT_LINE_TYPE.CHON_LAI){
                this.lst_line_selected = [];
            }

            this.setLineSelected();

            //lb_dong_value->setString(StringUtils::toString(lst_line_selected.size()));
        }
    },

    setLineSelected: function () {
        var count = 0;
        for(var i = 0; i < this.lst_line_selected_sprite.length; i++){
            var contain = false;
            for(var j = 0; j < this.lst_line_selected.length; j++){
                if(this.lst_line_selected[j] == this.lst_line_selected_sprite[i].name){
                    contain = true;
                    break;
                }
            }

            var line = this.lst_line_selected_sprite[i];
            if(contain){
                line.initHighLight(true);
                count ++;
            }else{
                line.initHighLight(false);
            }
        }

        this.txt_total_line.string = count;

        var money_bet = this.turnCashValue[this.indexCash]*this.lst_line_selected.length;
        if(money_bet >= 0){
            this.txt_total_bet_money.string = Common.numberFormatWithCommas(money_bet);
        }

    },

    resetLineSelected: function () {

        this.lst_line_selected.clear();
    },

    handleMessage: function(buffer) {
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

    openRulesPopup: function () {
        Common.openRules();
    },
    // update (dt) {},
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
});
