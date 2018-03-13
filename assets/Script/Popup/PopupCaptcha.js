var Popup = require("Popup");
var NetworkManager = require("NetworkManager");

cc.Class({
    extends: Popup,

    properties: {
        btnOK: cc.Button,
        edbAns: cc.EditBox,
        opeNode: cc.Node,
        mailId: -1
    },
    init: function(operation, mailId) {
        var operationLabel = this.opeNode.addComponent(cc.Label);
        operationLabel.string = operation;
        this.mailId = mailId;
    },

    submitEvent: function () {
        var captchaAns = this.edbAns.string;
        var mailId = this.mailId;
        NetworkManager.claimAttachMail(captchaAns, mailId);
    }
});
