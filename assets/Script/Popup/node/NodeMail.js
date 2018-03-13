cc.Class({
    extends: cc.Component,

    properties: {
        mailTitle: cc.Label,
        mailSender: cc.Label,
        mailContent: cc.ScrollView,
        btnReceived: cc.Button,
        spriteGift: cc.Sprite,
        operation: cc.String,
        mailId: -1
    },

    init: function (binMail) {
        this.mailTitle.string = binMail.getTitle();
        this.mailSender.string = binMail.getSenderusername();

        var nodeChild = new cc.Node();
        nodeChild.parent = this.mailContent.content;

        var content = nodeChild.addComponent(cc.Label);
        content.string = Common.wordWrap(binMail.getBody(), 100);
        content.fontSize = 20;
        content.node.setAnchorPoint(0, 1);


        var attachitemid = binMail.getAttachitemid();

        if(attachitemid > 0){
            this.btnReceived.node.active = true;
            this.operation = binMail.getExpandeddata();

            this.mailId = binMail.getMailid();
        } else {
            this.btnReceived.node.active = false;
        }
    },

    showCaptcha: function () {
        var operation = this.operation;
        var mailId = this.mailId;
        Common.showPopup(Config.name.POPUP_CAPTCHA,function(message_box) {
            message_box.init(operation, mailId);
            message_box.appear();
        });
    }
});
