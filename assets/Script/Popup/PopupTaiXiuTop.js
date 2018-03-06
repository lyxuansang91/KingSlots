var NetworkManager = require('NetworkManager');
var CommonPopup = require('CommonPopup');
var TOP_USER_DAY = 1;
var TOP_USER_WEEKLY = 2;
var MAX_RESULT = 20;
var firstResult = -1;
cc.Class({
    extends: CommonPopup,

    properties: {
        topUserType: 1
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
        if(index === TOP_USER_DAY){
            this.getLookUpTopUser(Config.LookupTypeRequest.topUserDayly, 0, 10, true);
            this.setTopUserType(TOP_USER_DAY);
        } else if (index === TOP_USER_WEEKLY){
            this.getLookUpTopUser(Config.LookupTypeRequest.topUserWeekly, 0, 10, true);
            this.setTopUserType(TOP_USER_WEEKLY);
        }

    },

    getLookUpTopUser: function(hisType, firstResult, maxResult, isCash) {
        var entries = [];

        var entry = new proto.BINMapFieldEntry();
        entry.setKey("historyType");
        entry.setValue(hisType.toString());
        entries.push(entry);

        var entry1 = new proto.BINMapFieldEntry();
        entry1.setKey("isCash");
        var value = isCash ? "true" : "false";
        entry1.setValue(value);
        entries.push(entry1);
        NetworkManager.getLookUpGameHistoryRequest(firstResult, maxResult, entries);
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
                this.lookupTopUser(msg);
                break;
            default:
                isDone = false;
                break;
        }
        return isDone;
    },

    lookupTopUser: function(rs) {
        cc.log("rs history taixiu =", rs);
        var self = this;
        if (rs !== 0) {
            if (rs.getResponsecode()) {
                var topUsers = [];
                for (var i = 0; i < rs.getHistoriesList().length - 2; i++) {
                    // if (rs.getHistoriesList()[i].getSecond() !== Common.getUserId()) {
                        // UserRankTXN * user = new UserRankTXN();
                        // user->setRank(cmInst->convertStringToInt(rs->histories(i).first()));
                        // user->setUserId(cmInst->convertStringToInt(rs->histories(i).second()));
                        // user->setAvatarID(cmInst->convertStringToInt(rs->histories(i).third()));
                        // user->setUserName(rs->histories(i).fourth());
                        // user->setBonus(cmInst->convertStringToInt(rs->histories(i).fifth()));
                        topUsers.push(rs.getHistoriesList()[i]);
                    // }
                }
                // var number = rs.getHistoriesList().length;
                // var currentUserRank = rs.getHistoriesList()[number - 2].getFirst();
                // var previousUserRank = rs.getHistoriesList()[number - 1].getFirst();
                // var currentuserBonus = rs.getHistoriesList()[number - 2].getFifth();
                // var currentUserAvatar = rs.getHistoriesList()[number - 2].getThird();
                // var currentDisplayName = rs.getHistoriesList()[number - 2].getFourth();
                //
                // currentUser->setRank(cmInst->convertStringToInt(currentUserRank));
                // currentUser->setBonus(cmInst->convertStringToInt(currentuserBonus));
                // currentUser->setAvatarID(cmInst->convertStringToInt(currentUserAvatar));
                // currentUser->setUserName(currentDisplayName);
                // currentUser->setPreviousRank(cmInst->convertStringToInt(previousUserRank));
                // contentPopupRight->removeChild(userRank, true);
                // userRank = getItemRow(currentUser, 0);
                // userRank->setPosition(userPos);
                // //  userRank->setAnchorPoint(Vec2::ANCHOR_MIDDLE);
                // contentPopupRight->addChild(userRank);
                // tableView->reloadData();

                cc.log("topUsers =", topUsers);

                var number = topUsers.length;
                var headCell = ["Hạng", "Tài khoản", "Tiền thắng"];
                // var data = this._getdata(topUsers, headCell, number);

                // self.tableView.getComponent(cc.tableView).initTableView(data.length, { array: data, target: this });
            }
        }
    },


    _getdata: function (val, headCell, num) {
        var array = [];
        var headObj = {};
        headObj.rank = headCell[0];
        headObj.displayName = headCell[1];
        headObj.betWin = headCell[2];
        array.push(headObj);

        for (var i = 0; i < num; ++i) {
            var obj = {};
            obj.rank = Common.timestampToDate(val[i].getSixth());
            obj.displayName = val[i].getFirst();
            obj.betWin = val[i].getThird();
            array.push(obj);
        }

        return array;
    },

    setTopUserType: function (topUserType) {
        this.topUserType = topUserType;
    },
});
