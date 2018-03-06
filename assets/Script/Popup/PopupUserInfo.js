var NetworkManager = require('NetworkManager');
var CommonPopup = require('CommonPopup');
var USERINFO = 1;
var USERINFO_HISTORY = 2;
var USERINFO_VERIFY = 3;
var USERINFO_HISTORY_PLAY = 1;
var USERINFO_HISTORY_CHARGE = 2;
var USERINFO_HISTORY_EXCHANGE = 1;
var MAX_RESULT = 20;
var firstResult = -1;
cc.Class({
    extends: CommonPopup,

    properties: {
        userInfoPrefab: cc.Prefab,
        tabLeftPrefab: cc.Prefab,
        contentRight: cc.Node,
        tabLeftNode: cc.Node,
        _tab: 1,
        subHistory: 1
    },

    onLoad: function () {
        // this.userinfoPrefab.active = true;
    },

    start: function () {
        // var targetUserId = Common.getUserId();
        // NetworkManager.getViewUserInfoFromServer(targetUserId);
        // this.setTab(USERINFO);
    },

    addTabs: function (tabs, index) {
        this.initTabs(tabs, index);
    },

    initTabs: function (tabs, index) {
        this._super(tabs, index);
    },

    onEvent: function (index) {
        var self = this;
        if(index === USERINFO){
            this.tableView.active = true;
            this.tabLeftNode.active = false;
            this.contentRight.active = false;
            var targetUserId = Common.getUserId();
            NetworkManager.getViewUserInfoFromServer(targetUserId);
            this.setTab(USERINFO);
        } else if(index === USERINFO_HISTORY){
            this.tableView.active = false;
            this.tabLeftNode.active = true;
            this.contentRight.active = true;

            var tabString = ["Dòng Mon", "Nạp Mon", "Giao Dịch"];

            var item = cc.instantiate(this.tabLeftPrefab);
            item.getComponent("UITabLeft").setTab(tabString, 1, function(index){
                self.onLeftEvent(index);
            });

            this.tabLeftNode.addChild(item);

            this.setTab(USERINFO_HISTORY);
        } else if(index === USERINFO_VERIFY){
            // NetworkManager.getUserVerifyConfigRequest(Config.USER_VERIFY_CONFIG_TYPE.EMAIL);
            this.setTab(USERINFO_VERIFY);
        }
    },

    onLeftEvent: function (index) {
        NetworkManager.getLookupMoneyHistoryMessage(firstResult, MAX_RESULT, index);
        this.setSubHistory(index);

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
            case NetworkManager.MESSAGE_ID.VIEW_USER_INFO:
                var msg = buffer.response;
                this.viewUserInfoFromServer(msg);
                break;
            case NetworkManager.MESSAGE_ID.USER_VERIFY:
                var msg = buffer.response;
                // this.pingMessageResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.LOOK_UP_MONEY_HISTORY:
                var msg = buffer.response;
                this.lookupMoneyHistoryResponse(msg);
                break;
            default:
                isDone = false;
                break;
        }
        return isDone;
    },

    viewUserInfoFromServer: function(response){
        var self = this;
        if (response !== 0){
            if (response.getResponsecode()){
                if (response.hasUserinfo()){

                    var _user_info = response.getUserinfo();
                    var avatar_id = _user_info.getAvatarid();
                    if (avatar_id < 100000){
                        avatar_id = 0;
                    }
                    var avatar = '';
                    var id = _user_info.getUserid();
                    var level = _user_info.getLevel().getLevel();
                    var displayName = _user_info.getDisplayname();
                    var cash = _user_info.getCash();

                    var phone = null;
                    if (_user_info.getUserid() === Common.getUserId()){
                        phone = Common.getPhoneNumber();
                    }

                    var chiso = _user_info.getTrustedindex();
                    var sovanchoi = _user_info.getTotalmatch();
                    var sovanthang = _user_info.getTotalwin();
                    var sovanthua = _user_info.getTotalmatch() - _user_info.getTotalwin();

                    var item = cc.instantiate(this.userInfoPrefab);
                    item.getComponent('UserInfo').init(avatar, displayName, level, id, phone, chiso, sovanchoi,
                        sovanthang, sovanthua, cash);

                    self.tableView.addChild(item);

                }
            }
            if (response.hasMessage()){
                var mess = response.getMessage();
                Common.showToast(mess);
            }
        }
    },

    lookupMoneyHistoryResponse: function(response){
        if (response !== 0){
            if (response.getResponsecode()){
                var lstMoneyLogs = [];
                for (var i = 0; i < response.getMoneylogsList().length; i++) {
                    lstMoneyLogs.push(response.getMoneylogsList()[i]);
                }
                this.loadMoneyLogsHistory(lstMoneyLogs);
            }
            if (response.hasMessage()){
                Common.showToast(response.getMessage(), 2);
            }
        }
    },

    loadMoneyLogsHistory: function(lstMoneyLogs){
        var self = this;
        var num = lstMoneyLogs.length;
        var headCell = ["Thời gian", "Phát sinh", "Số dư", "Mô tả"];
        if(this.subHistory === USERINFO_HISTORY_PLAY){
            headCell = ["Thời gian", "Phát sinh", "Số dư", "Mô tả"];
        } else if(this.subHistory === USERINFO_HISTORY_CHARGE){
            headCell = ["Thời gian", "Mon nạp", "Số dư"];
        } else if(this.subHistory === USERINFO_HISTORY_EXCHANGE){
            headCell = ["Thời gian", "Loại thẻ", "Thông tin", "Trạng thái"];
        }
        var data = this._getdata(lstMoneyLogs, headCell, num);
        self.contentRight.getComponent(cc.tableView).initTableView(data.length, { array: data, target: this });
    },

    setTab: function (tab) {
        this._tab = tab;
    },

    _getdata: function (val, headCell, num) {
        var array = [];
        var headObj = {};
        if(this.subHistory === USERINFO_HISTORY_PLAY){
            headObj.date_time = headCell[0];
            headObj.change_money = headCell[1];
            headObj.current_money = headCell[2];
            headObj.description = headCell[3];
        } else if(this.subHistory === USERINFO_HISTORY_CHARGE){
            headObj.date_time = headCell[0];
            headObj.mon_charge = headCell[1];
            headObj.current_money = headCell[2];
        } else if(this.subHistory === USERINFO_HISTORY_EXCHANGE){
            headObj.date_time = headCell[0];
            headObj.type_card = headCell[1];
            headObj.info = headCell[2];
            headObj.status = headCell[3];
        }

        array.push(headObj);

        if(val !== null){
            for (var i = 0; i < num; ++i) {
                var obj = {};
                if(this.subHistory === USERINFO_HISTORY_PLAY){
                    obj.date_time = Common.timestampToDate(val[i].getInsertedtime());
                    obj.change_money = val[i].getChangemoney();
                    obj.current_money = val[i].getCurrentmoney();
                    obj.description = val[i].getDescription();
                } else if(this.subHistory === USERINFO_HISTORY_CHARGE){
                    obj.date_time = Common.timestampToDate(val[i].getInsertedtime());
                    obj.mon_charge = val[i].getChangemoney();
                    obj.current_money = val[i].getCurrentmoney();
                } else if(this.subHistory === USERINFO_HISTORY_EXCHANGE){
                    obj.date_time = Common.timestampToDate(val[i].getInsertedtime());
                    obj.type_card = val[i].getTransactiontype();
                    obj.info = val[i].getLogstamp();
                    obj.status = val[i].getDescription();
                }

                array.push(obj);
            }
        }

        return array;
    },

    setSubHistory: function (subHistory) {
        this.subHistory = subHistory;
    },

});
