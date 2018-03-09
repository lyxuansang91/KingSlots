cc.Class({
    extends: cc.Component,

    properties: {
        emoticon: cc.Prefab,
        message: cc.RichText,
    },

    init: function (chatObject) {
        var emoticonId = chatObject.emoticonId;
        var senderUserName = chatObject.senderUserName;
        var messageChat = chatObject.messageChat;
        cc.log("messageChat : ",messageChat);
        var colorCode = chatObject.colorCode;
        var hexColor = Common.rgbToHex(colorCode[0],colorCode[1],colorCode[2]);

        if(emoticonId == 0){
            messageChat = "<color=" + hexColor + ">" + senderUserName + ": " + "</color>"
                + "<color=" + hexColor + ">" + messageChat + "</color>";
            cc.log("messageChat : ",messageChat);
            this.setMessage(messageChat);

        }else{

            messageChat = "<color=" + hexColor + ">" + senderUserName + ": " + "</color>";
            this.setMessage(messageChat);

            this.setEmoticon(emoticonId);
        }
    },
    
    setMessage : function (message) {
        this.message.string = message;

        this.node.setContentSize(this.node.getContentSize().width,
            this.message.node.getContentSize().height);
    },
    
    setEmoticon : function (emoticonId) {
        var icon = cc.instantiate(this.emoticon);
        var icon_comp = icon.getComponent("ItemEmotion");
        icon_comp.init(emoticonId);
        icon.setPosition(cc.p(this.message.node.getPositionX(),
            -this.message.node.getContentSize().height));
        this.node.addChild(icon);

        this.node.setContentSize(this.node.getContentSize().width,
            icon_comp.node.getContentSize().height + this.message.node.getContentSize().height);
    }
});