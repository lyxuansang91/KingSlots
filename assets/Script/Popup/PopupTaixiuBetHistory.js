var NetworkManager = require('NetworkManager');
var Popup = require('Popup');
var MAX_RESULT = 20;
var firstResult = -1;
var orderByField = 2;
var asc = false;
var isCash = true;
cc.Class({
    extends: Popup,

    properties: {
        tableView: cc.Node
    },

    onLoad: function () {
        this.getLookUpGameHistory(0, Config.NUM_LOAD.ITEM_PAGE, isCash, orderByField, asc);
    },

    getLookUpGameHistory: function(firstResult, maxResult, isCash, orderByField, asc){
        var entries = [];
        var entry = new proto.BINMapFieldEntry();
        entry.setKey("historyType");
        entry.setValue(Config.LookupTypeRequest.userBetHist.toString());
        //1: lich su ca nhan, 2: lich su no hu, 3: top cao thu quay
        entries.push(entry);
        var entry1 = new proto.BINMapFieldEntry();
        entry1.setKey("isCash");
        entry1.setValue(isCash ? "true" : "false");
        entries.push(entry1);
        NetworkManager.getLookUpGameHistoryRequest(Common.ZONE_ID.TAIXIU, firstResult, maxResult, entries, orderByField, asc);
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
                this.lookupGameHistoryResponse(msg);
                break;
            default:
                isDone = false;
                break;
        }
        return isDone;
    },

    lookupGameHistoryResponse: function(response) {
        cc.log("response bet taixiu =", response);
        var self = this;

        if (response !== 0) {
            if (response.getResponsecode()) {
                var number = response.getHistoriesList().length;
                var headCell = Common.getHeadHistory(1);
                var data = this._getdata(headCell,response.getHistoriesList(), number);

                cc.log("data bet taixiu =", data);

                self.tableView.getComponent(cc.tableView).initTableView(data.length, { array: data, target: this });
            }
        }
    },

    _getdata: function (headCell, val, num) {
        var array = [];
        var headObj = {};
        headObj.section = headCell[0];
        headObj.betTime = headCell[1];
        headObj.bigBet = headCell[2];
        headObj.smallBet = headCell[3];
        headObj.bigRefund = headCell[4];
        headObj.smallRefund = headCell[5];
        headObj.result = headCell[6];
        headObj.totalWin = headCell[7];
        array.push(headObj);

        for (var i = 0; i < num; ++i) {
            var obj = {};
            obj.section = val[i].getFirst();
            obj.betTime = Common.timestampToDate(val[i].getSecond());
            obj.bigBet = val[i].getThird();
            obj.smallBet = val[i].getFourth();
            obj.bigRefund = val[i].getFifth();
            obj.smallRefund = val[i].getSixth();
            obj.result = val[i].getEighth();
            obj.totalWin = val[i].getSeventh();
            array.push(obj);
        }

        return array;
    },

});
