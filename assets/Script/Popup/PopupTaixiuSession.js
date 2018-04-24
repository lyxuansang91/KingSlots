var NetworkManager = require('NetworkManager');
var Popup = require('Popup');
var asc = false;
var orderByField = 2;
var isCash = true;
var MAX_RESULT = 20;
var firstResult = -1;
cc.Class({
    extends: Popup,

    properties: {
        currentSess: 0,
        titleSession: cc.Label,
        titleDate: cc.Label,
        tableView: cc.Node,
        indexSession: 0,
        diceOne: cc.Sprite,
        diceTwo: cc.Sprite,
        diceThree: cc.Sprite,
        result: cc.Label,
        list_frame: [cc.SpriteFrame]
    },

    init: function (session) {
        this.getLookUpGameHistory(session - 1, 0,
            Config.NUM_LOAD.MORE_ITEM, isCash, orderByField, asc);
        this.currentSess = session - 1;
    },

    getLookUpGameHistory: function(currentSession,
        firstResult, maxResult, isCash, orderByField, asc){
        var entries = [];

        var entry = new proto.BINMapFieldEntry();
        entry.setKey("historyType");
        entry.setValue(Config.LookupTypeRequest.sessionAllUserBet.toString());
        entries.push(entry);

        var entry1 = new proto.BINMapFieldEntry();
        entry1.setKey("sessionId");
        entry1.setValue(currentSession.toString());
        entries.push(entry1);

        var entry2 = new proto.BINMapFieldEntry();
        entry2.setKey("isCash");
        var value = isCash ? "true" : "false";
        entry2.setValue(value);
        entries.push(entry2);

        cc.log("entries =", entries);

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
                this.lookupGameResponseHandler(msg);
                break;
            default:
                isDone = false;
                break;
        }
        return isDone;
    },

    lookupGameResponseHandler: function(rs) {

        var self = this;

        if (rs !== 0) {
            if (rs.getResponsecode()) {
                //TODO: lich su dat cuoc theo phien

                var number = rs.getHistoriesList().length;
                var headCell = Common.getHeadHistory(2);
                var data = this._getdata(headCell,rs.getHistoriesList(), number);

                self.tableView.getComponent(cc.tableView).initTableView(data.length, { array: data, target: this });

                // if (rs->histories_size() > 0){
                //     tableView->reloadData();
                //
                //     if (this->listHist.size() > NUM_LOAD_ITEM_PAGE){ //set lai selection
                //         int mod = (this->listHist.size() % NUM_LOAD_ITEM_PAGE);
                //         int numPos = mod == 0 ? NUM_LOAD_ITEM_PAGE : mod;
                //         tableView->setContentOffset(Vec2(0, -numPos * heightItem), false);
                //     }
                // }
                // else if (this->listHist.empty()){
                //     tableView->reloadData();
                // }
                // self.titleSession.string = "#"+ this.currentSess;
                // if (!isLoadSession){

                cc.log("args =", rs.getArgsList());

                    var totalGreatBet = 0;
                    var totalLittleBet = 0;
                    for (var i = 0; i < rs.getArgsList().length; i++) {
                        var key = rs.getArgsList()[i].getKey();
                        var value = rs.getArgsList()[i].getValue();
                        if (key === "sessionId") {
                            cc.log("sessionId =", value);
                            self.titleSession.string = "#"+ value;
                            this.currentSess = value;

                        }
                        else if (key === "startedTime") {
                            var str_start_time = Common.timeToDate(value);
                            self.titleDate = str_start_time;

                        }
                        // else if (key === "totalGreatBet") {
                        //     //session->setTotalBigBet(cmInst->convertStringToInt(value));
                        //     totalGreatBet = Common::getInstance()->convertStringToLongLong(value);
                        // }
                        // else if (key === "totalLittleBet") {
                        //     //session->setTotalSmallBet(cmInst->convertStringToInt(value));
                        //     totalLittleBet = Common::getInstance()->convertStringToLongLong(value);
                        // }
                        else if (key === "totalValue") {
                            this.result.string = value;
                        }
                        else if (key === "diceValues") {
                            var values = value.split(',');
                            cc.log("values =", values);
                            this.diceOne.spriteFrame = this.list_frame[parseInt(values[0] - 1)];
                            this.diceTwo.spriteFrame = this.list_frame[parseInt(values[1] - 1)];
                            this.diceThree.spriteFrame = this.list_frame[parseInt(values[2] - 1)];
                            // var dicevalue = cmInst->convertStringsToInt(values);
                            // if (values.length >= 3){
                            //     for(var j = 0 ;j < xucxacShow.size();j++){
                            //         xucxacShow[j]->loadEnryptTexture(StringUtils::format(TXN_RESULT,dicevalue[j]));
                            //     }
                            //     int sumBet = dicevalue[0] + dicevalue[1] + dicevalue[2];
                            //     title_kq->setString(sumBet > 10 ? getLanguageStringWithKey("TXT_TXN_TAI") :
                            //         getLanguageStringWithKey("TXT_TXN_XIU"));
                            //
                            //     title_kq_sau->setString(StringUtils::format(" %d",sumBet));
                            // }
                        }

                    }

                    // title_bigsum->setString(Common::getInstance()->numberFormatWithCommas(totalGreatBet));
                    // title_smallsum->setString(Common::getInstance()->numberFormatWithCommas(totalLittleBet));
                    // float refund = totalGreatBet - totalLittleBet;
                    // if (refund >= 0){
                    //     title_refund_bigsum->setString(Common::getInstance()->numberFormatWithCommas(refund));
                    //     title_refund_smallsum->setString(StringUtils::toString(0));
                    // }
                    // else {
                    //     title_refund_bigsum->setString(StringUtils::toString(0));
                    //     title_refund_smallsum->setString(Common::getInstance()->numberFormatWithCommas(-1 * refund));
                    // }
                    //
                    // title_bigsum->setPositionX(2.5f * width_column);
                    // title_smallsum->setPositionX(3.5f * width_column);
                    // title_refund_bigsum->setPositionX(4.5f * width_column);
                    // title_refund_smallsum->setPositionX(5.5f * width_column);

                    // isLoadSession = true;

                    //set title
                // }
            }
            else if (rs.hasMessage()){
                Common.showToast(rs.getMessage());
            }
        }
    },

    _getdata: function (headCell, val, num) {
        var array = [];
        var headObj = {};
        headObj.time = headCell[0];
        headObj.userName = headCell[1];
        headObj.bigBet = headCell[2];
        headObj.smallBet = headCell[3];
        headObj.bigRefund = headCell[4];
        headObj.smallRefund = headCell[5];
        headObj.totalWin = headCell[6];
        array.push(headObj);

        for (var i = 0; i < num; ++i) {
            var obj = {};
            obj.time = Common.timeToDate(val[i].getFirst());
            obj.userName = val[i].getSecond();
            obj.bigBet = val[i].getThird();
            obj.smallBet = val[i].getFourth();
            obj.bigRefund = val[i].getFifth();
            obj.smallRefund = val[i].getSixth();
            obj.totalWin = val[i].getSeventh();
            array.push(obj);
        }

        return array;
    },

    btnBackEvent: function () {
        this.getLookUpGameHistory(this.currentSess - 1, 0,
            Config.NUM_LOAD.MORE_ITEM, isCash, orderByField, asc);
        this.currentSess = this.currentSess - 1;

    },

    btnNextEvent: function () {
        var crrSess = parseInt(this.currentSess) + 1;
        this.getLookUpGameHistory(crrSess, 0,
            Config.NUM_LOAD.MORE_ITEM, isCash, orderByField, asc);
        this.currentSess = crrSess;
    },

});
