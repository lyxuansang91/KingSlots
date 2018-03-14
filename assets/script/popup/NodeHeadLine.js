cc.Class({
    extends: cc.Component,

    properties: {
        darkSprite: cc.Sprite,
        message : cc.RichText
    },

    onLoad: function () {

    },

    showHeadLine: function () {
        if(Common.getNotificationEmergency() == ""){
            if(Common.getHeadLineEmergency() != ""){
                this.initHeadLineNotify(Common.getHeadLineEmergency());
            }else{
                return;
            }
        }else{
            this.message.string = Common.getNotificationEmergency();
        }

        this.message.node.setPositionX(0);
        this.width = this.message.node.getBoundingBox().width;

        this.show(true);
    },

    initHeadLineNotify: function (lstNotificationEmergency) {
        var message = "";

        for (var i = 0; i < lstNotificationEmergency.length; i++){

            var headLineEmergency = lstNotificationEmergency[i].getTag();
            if(lstNotificationEmergency[i].getTag() !== ""){
                headLineEmergency = "(" + lstNotificationEmergency[i].getTag() + ")";
            }

            var lb_tag = Common.textColor(headLineEmergency,cc.color(255,255,0,255));
            var lb_displayName = Common.textColor(lstNotificationEmergency[i].getDisplayname(),cc.color(242, 95, 185, 255));
            var lb_action = Common.textColor(lstNotificationEmergency[i].getAction(),cc.color(218, 235, 129, 255));
            var lb_subject = Common.textColor(lstNotificationEmergency[i].getSubject(),cc.color(68, 235, 219, 255));

            message += lb_tag + lb_displayName + lb_action + lb_subject + " ";
        }

        this.message.string = message;
    },

    update : function (dt) {
        if(this.anim){
            var x = this.message.node.getPositionX();
            x -= 100*dt;
            if(x < -this.node.getContentSize().width/2 - this.width){
                this.show(false);
                return;
            }

            this.message.node.setPositionX(x);

        }
    },

    show: function (isShow) {
        this.anim = isShow;
        this.node.active = isShow;
    }
});
