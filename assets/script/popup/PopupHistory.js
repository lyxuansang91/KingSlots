var NetworkManager = require('NetworkManager');
var CommonPopup = require('CommonPopup');
var HISTORY_SPIN = 1;
var HISTORY_BREAK_JAR = 2;
var HISTORY_TOP_USER = 3;
var MAX_RESULT = 20;
var firstResult = -1;
cc.Class({
    extends: CommonPopup,

    properties: {
        historyType: 1
    },

    onLoad: function () {
    },

    start: function () {
        cc.log("tableview =", this.tableView);
    },

    addTabs: function (tabs, index) {
        this.initTabs(tabs, index);
    },

    initTabs: function (tabs, index) {
        this._super(tabs, index);
    },

    onEvent: function (index) {
        this.getLookupHistoryRequest(firstResult, MAX_RESULT,
            index, true);
        this.setHistoryType(index);
    },

    getLookupHistoryRequest: function(firstResult, maxResult, historyType, isCash) {
        var entries = [];
        var entry = new proto.BINMapFieldEntry();
        entry.setKey("historyType");
        entry.setValue(historyType.toString());
        //1: lich su ca nhan, 2: lich su no hu, 3: top cao thu quay
        entries.push(entry);
        var entry1 = new proto.BINMapFieldEntry();
        entry1.setKey("isCash");
        entry1.setValue(isCash ? "true" : "false");
        entries.push(entry1);
        NetworkManager.getLookUpGameHistoryRequest(firstResult,
            maxResult, entries, -1, false);
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
            case NetworkManager.MESSAGE_ID.LOOK_UP_GAME_HISTORY:
                var msg = buffer.response;
                this.lookupGameResponseHandler(msg);
                break;
            default:
                isDone = false;
                break;
        }
        return isDone;
    },
    pingMessageResponseHandler: function(res) {
        if(res.getResponsecode()) {

        }
    },

    lookupGameResponseHandler: function(response) {
        var self = this;
        if (response !== 0) {
            cc.log("look up game history response: ", response);
            if (response.hasMessage() && !response.getMessage()) {
                //show toast message
            }

            if (response.getResponsecode()) {
                var number = response.getHistoriesList().length;
                var headCell = Common.getHeadHistory(this.historyType);
                var data = this._getdata(headCell,response.getHistoriesList(), number);

                self.tableView.getComponent(cc.tableView).initTableView(data.length, { array: data, target: this });
            }

            if (response.getArgsList().length > 0) {
                var entry = response.getArgsList()[0];
                if (entry.getKey() === "totalCount")
                    this.totalCount = parseInt(entry.getValue());
            }
        }
    },

    _getdata: function (headCell, val, num) {
        var array = [];
        var headObj = {};
        headObj.date_time = headCell[0];
        headObj.displayName = headCell[1];
        headObj.bet = headCell[2];
        headObj.betWin = headCell[3];
        headObj.betCard = headCell[4];
        array.push(headObj);

        for (var i = 0; i < num; ++i) {
            var obj = {};
            obj.date_time = Common.timestampToDate(val[i].getSixth());
            obj.displayName = val[i].getFirst();
            obj.bet = val[i].getThird();
            obj.betWin = val[i].getFourth();
            obj.betCard = val[i].getSecond();
            array.push(obj);
        }

        return array;
    },

    setHistoryType: function (historyType) {
        this.historyType = historyType;
    },
});
