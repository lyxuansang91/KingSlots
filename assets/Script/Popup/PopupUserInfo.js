var NetworkManager = require('NetworkManager');
var CommonPopup = require('CommonPopup');
var USERINFO = 1;
var USERINFO_HISTORY = 2;
var USERINFO_VERIFY = 3;
var MAX_RESULT = 20;
var firstResult = -1;
cc.Class({
    extends: CommonPopup,

    properties: {
        userInfoPrefab: cc.Prefab,
        _tab: 1
    },

    onLoad: function () {
        // this.userinfoPrefab.active = true;
    },

    start: function () {
        var targetUserId = Common.getUserId();
        NetworkManager.getViewUserInfoFromServer(targetUserId);
        this.setTab(USERINFO);
    },

    addTabs: function (tabs) {
        this.initTabs(tabs);
    },

    initTabs: function (tabs) {
        this._super(tabs);
    },

    onEvent: function (index) {
        if(index === USERINFO){
            var targetUserId = Common.getUserId();
            NetworkManager.getViewUserInfoFromServer(targetUserId);
            this.setTab(USERINFO);
        } else if(index === USERINFO_HISTORY){
            this.setTab(USERINFO_HISTORY);
        } else if(index === USERINFO_VERIFY){
            this.setTab(USERINFO_VERIFY);
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
        // var isDone = this._super(buffer);
        // if(isDone) {
        //     return true;
        // }
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
            // case NetworkManager.MESSAGE_ID.LOOKUP_MONEY_HISTORY:
            //     var msg = buffer.response;
            //     this.pingMessageResponseHandler(msg);
            //     break;
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
                var lstMoneyLogs;
                for (var i = 0; i < response.getMoneyboxesList().length; i++) {
                    lstMoneyLogs.push(response.getMoneyboxesList()[i]);
                }
                // loadMoneyLogHistory(lstMoneyLogs);
            }
            if (response.hasMessage()){
                Common.showToast(response.getMessage(), 2);
            }
        }
    },

    setTab: function (tab) {
        this._tab = tab;
    },

});
