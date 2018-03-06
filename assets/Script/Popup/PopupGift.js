var NetworkManager = require('NetworkManager');
var CommonPopup = require('CommonPopup');
var GIFT_INPUT = 1;
var GIFT_LIST = 2;
var MAX_RESULT = 20;
var firstResult = -1;
cc.Class({
    extends: CommonPopup,

    properties: {
        giftType: 1,
        giftInput: cc.Node,
        giftCode: cc.EditBox
    },

    onLoad: function () {
    },

    start: function () {
    },

    addTabs: function (tabs, index) {
        this.initTabs(tabs, index);
    },

    initTabs: function (tabs, index) {
        this._super(tabs, index);
    },

    onEvent: function (index) {
        if(index === GIFT_INPUT){
            this.tableView.active = false;
            this.giftInput.active = true;

            this.setGiftType(GIFT_INPUT);
        } else if(index === GIFT_LIST){
            this.tableView.active = true;
            this.giftInput.active = false;
            NetworkManager.getRedeemGiftCodeHistoryFromServer(0, MAX_RESULT);
            this.setGiftType(GIFT_LIST);
        }
    },


    onGameEvent: function() {
        var self = this;
        NetworkManager.checkEvent(function(buffer) {
            return self.handleMessage(buffer);
        })
    },

    update: function(dt) {
        this.onGameEvent();
    },

    handleMessage: function(e) {
        const buffer = e;
        var isDone = true;
        switch (buffer.message_id) {
            case NetworkManager.MESSAGE_ID.REDEEM_GIFT_CODE_HISTORY:
                var msg = buffer.response;
                this.getRedeemGiftCodeHistory(msg);
                break;
            case NetworkManager.MESSAGE_ID.REDEEM_GIFT_CODE:
                var msg = buffer.response;
                this.getRedeemGiftCode(msg);
                break;
            default:
                isDone = false;
                break;
        }
        return isDone;
    },

    getRedeemGiftCodeHistory: function(response){
        var self = this;
        cc.log("response =", response);
        if (response !== 0){
            if (response.getResponsecode()){
                var lstGiftCodeHistory = [];
                for (var i = 0; i < response.getGiftcodesList().length; i++){
                    var giftCode = response.getGiftcodesList()[i];
                    lstGiftCodeHistory.push(giftCode);
                }

                var number = lstGiftCodeHistory.length;
                var headCell = ["Giftcode", "Giá trị", "Ngày nhận"];
                var data = this._getdata(lstGiftCodeHistory, headCell, number);

                self.tableView.getComponent(cc.tableView).initTableView(data.length, { array: data, target: this });

            }
            else {
                if (response.hasMessage()){
                    Common.showToast(response.getMessage());
                }
            }
        }
    },

    getRedeemGiftCode: function(response){
        if (response !== 0){
            if (response.hasMessage()){
                Common.showToast(response.getMessage());
            }

        }
    },

    _getdata: function (val, headCell, num) {
        var array = [];
        var headObj = {};
        headObj.gift_code = headCell[0];
        headObj.value = headCell[1];
        headObj.date_received = headCell[2];
        array.push(headObj);

        for (var i = 0; i < num; ++i) {
            var obj = {};
            obj.gift_code = val[i].getGiftcode();
            obj.value = val[i].getCash();
            obj.date_received = Common.timestampToDate(val[i].getRedeemtime());
            array.push(obj);
        }

        return array;
    },

    setGiftType: function (giftType) {
        this.giftType = giftType;
    },

    onGiftSubmit: function () {
        var gift_code = this.giftCode.string;

        if (gift_code !== null ){
            NetworkManager.getRedeemGiftCodeFromServer(gift_code);
        } else {
            Common.showToast(Common.KEYTEXT.BLANK_USERNAME);
        }
    },

    onGiftCancel: function () {
        this.giftCode.string = '';
    },
});
