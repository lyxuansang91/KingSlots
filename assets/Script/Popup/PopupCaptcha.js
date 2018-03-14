var Popup = require("Popup");
var NetworkManager = require("NetworkManager");

cc.Class({
    extends: Popup,

    properties: {
        btnOK: cc.Button,
        edbAns: cc.EditBox,
        operation: cc.Label,
        mailId: -1
    },
    init: function(operation, mailId) {
        this.operation.string = operation;
        this.mailId = mailId;
    },

    submitEvent: function () {
        var captchaAns = this.edbAns.string;
        var mailId = this.mailId;
        NetworkManager.claimAttachMail(captchaAns, mailId);
    }
});
