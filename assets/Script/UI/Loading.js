cc.Class({
    extends: cc.Component,

    properties: {
        angel: 360,
        duration: 1.0,
        darkSprite: cc.Sprite,
        loading : cc.Sprite
    },

    onLoad: function () {
        this.deltaTime = 0;
        this.enable = false;
    },
    
    update : function (dt) {
        if(this.deltaTime > 2) {
            if(!this.enable) {
                this.enable = true;
                var self = this;

                self.darkSprite.node.setOpacity(150);
                self.loading.node.setOpacity(255);

                var action = cc.repeatForever(cc.rotateBy(this.duration,this.angel));
                self.loading.node.runAction(action);
            }
        }else{
            this.deltaTime += dt;
        }
    }
});
