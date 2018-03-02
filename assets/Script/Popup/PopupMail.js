var NetworkManager = require('NetworkManager');
var CommonPopup = require('CommonPopup');
var MAIL_RECEIVED = 1;
var MAIL_SENT = 2;
var MAIL_SENT_ADMIN = 3;
var MAX_RESULT = 20;
var firstResult = -1;
cc.Class({
    extends: CommonPopup,

    properties: {
        mailType: 1,
        nodeSendAdmin: cc.Node,
        title: cc.EditBox,
        content: cc.EditBox
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
            case NetworkManager.MESSAGE_ID.FILTER_MAIL:
                var msg = buffer.response;
                this.filterEmailResponse(msg);
                break;
            case NetworkManager.MESSAGE_ID.SEND_MAIL:
                var msg = buffer.response;
                this.sendMailResponse(msg);
                break;
                isDone = false;
                break;
        }
        return isDone;
    },

    onEvent: function (index) {
        var self = this;
        if(index === MAIL_RECEIVED){
            NetworkManager.getFilterMailFromServer(0, MAX_RESULT, -1, false);
            this.setMailType(index);
        } else if(index === MAIL_SENT){
            cc.log("MAIL_SENT =", index);
            NetworkManager.getFilterMailFromServer(0, MAX_RESULT, -1, true);
            this.setMailType(index);
        } else if(index === MAIL_SENT_ADMIN){
            self.tableView.active = false;
            self.nodeSendAdmin.active = true;
            // var item = cc.instantiate(this.sendAdminPrefab);
            // self.nodeSendAdmin.addChild(item);
        }

    },

    filterEmailResponse: function(response){
        cc.log("response =", response);
        var self = this;
        self.tableView.active = true;
        self.nodeSendAdmin.active = false;
        if (response !== 0){
            if (response.getResponsecode()){
                // self.tableView.removeAllChildren();
                var lstEmail = [];
                var binMail;
                for (var i = 0; i < response.getMailsList().length; i++) {
                    binMail = this.parseFromBinMail(response.getMailsList()[i]);
                    lstEmail.push(binMail);
                }
                // loadEmail(lstEmail);

                cc.log("lstEmail =", lstEmail);

                var number = response.getMailsList().length;
                var data = this._getdata(lstEmail, number);
                self.tableView.getComponent(cc.tableView).initTableView(data.length, { array: data, target: this });

            }
            else {
                // showToast(response->message().c_str(), 2);
            }
        }
    },

    _getdata: function (val, num) {
        var array = [];

        for (var i = 0; i < num; ++i) {
            var obj = {};
            obj.mail_title = val[i].getTitle();
            obj.mail_sender = val[i].getSenderusername();
            obj.mail_senttime = val[i].getSenttime();
            array.push(obj);
        }

        return array;
    },

    parseFromBinMail: function(binMail){
        var mailResult = new proto.BINMail();
        mailResult.setMailid(binMail.getMailid());
        mailResult.setSenderuserid(binMail.getSenderuserid());
        mailResult.setSenderusername(binMail.getSenderusername());
        mailResult.setRecipientuserid(binMail.getRecipientuserid());
        mailResult.setRecipientusername(binMail.getRecipientusername());
        mailResult.setTitle(binMail.getTitle());
        mailResult.setBody(binMail.getBody());
        mailResult.setExpandeddata(binMail.getExpandeddata());

        mailResult.setSenttime(binMail.getSenttime());
        mailResult.setReaded(binMail.getReaded());
        mailResult.setAttachitemid(binMail.getAttachitemid());
        mailResult.setAttachitemquatity(binMail.getAttachitemquatity());

        mailResult.setExpiredtime(binMail.getExpiredtime());
        return mailResult;
    },

    setMailType: function (mailType) {
        this.mailType = mailType;
    },

    onSendAdminEvent: function () {
        var title_str = this.title.string;
        var content_str = this.content.string;

        if (title_str !== null && content_str !== null){

            NetworkManager.sendMail(1000000, title_str, content_str, 0);
        } else {
            Common.showToast(Common.KEYTEXT.BLANK_USERNAME);
        }
    },

    onCancelEvent: function () {
        this.title.string = '';
        this.content.string = '';
    },

    sendMailResponse: function(response){
        if (response !== 0){
            if (response.hasMessage()){
                Common.showToast(response.getMessage(), 3);
                this.title.string = '';
                this.content.string = '';
            }
        }
    }
});
