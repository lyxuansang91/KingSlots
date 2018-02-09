cc.Class({
    extends: cc.Component,

    properties: {
        angel: 360,
        duration: 1.0,
        darkSprite: cc.Sprite,
        loading : cc.Sprite
    },

    onLoad: function () {
        this.show();
    },

    show: function () {
        this.deltaTime = 0;
        this.enable = false;
        this.darkSprite.node.setOpacity(0);
        this.loading.node.setOpacity(0);

        this.loading.node.stopAllActions();
        var action = cc.repeatForever(cc.rotateBy(this.duration,this.angel));
        this.loading.node.runAction(action);
    },

    stop: function () {
        this.darkSprite.node.setOpacity(0);
        this.loading.node.setOpacity(0);
        this.loading.node.stopAllActions();
    },
    
    update : function (dt) {
        if(this.deltaTime > 3) {
            if(!this.enable) {
                this.enable = true;

                this.darkSprite.node.setOpacity(150);
                this.loading.node.setOpacity(255);

                var action = cc.repeatForever(cc.rotateBy(this.duration,this.angel));
                this.loading.node.runAction(action);
            }
        }else{
            this.deltaTime += dt;
        }
    }
});
