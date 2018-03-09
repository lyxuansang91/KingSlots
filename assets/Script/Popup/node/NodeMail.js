cc.Class({
    extends: cc.Component,

    properties: {
        mailTitle: cc.Label,
        mailSender: cc.Label,
        mailContent: cc.Label,
    },

    init: function (title, sender, content) {
        this.mailTitle.string = title;
        this.mailSender.string = sender;
        this.mailContent.string = Common.wordWrap(content, 100);
    }
});
