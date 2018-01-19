var CommonPopup = cc.Class({


    extends: cc.Layer,
    ctor: function() {
        this._super();
        cc.associateWithNative( this, cc.Layer );
    },

    init:function (cb, cb_parent) {

        //////////////////////////////
        // 1. super init first
        // this._super();

        //navi enabling touch
        // if( 'touches' in sys.capabilities ) {
        //     this.setTouchEnabled(true);
        // }
        // if( 'mouse' in sys.capabilities ) {
        //     // this.setMouseEnabled(true);
        // }

        var size = cc.director.getWinSize();

        var centerPos = cc.p( size.width/2, size.height/2 );
        var url = "resources/common/popup/common_popup/bg_popup_small.png";
        var image = cc.url.raw(url);
        var texture = cc.textureCache.addImage(image);
        cc.log("sprite background:", spriteBackground);

        // spriteBackground.getComponent(cc.Sprite).spriteFrame = new cc.Sprite(texture);

        // var spriteBackground = cc.Sprite.create("resources/common/popup/common_popup/bg_popup_small.png");

        spriteBackground.node.setPosition(size.width/2, size.height/2);
        this.addChild(spriteBackground, 0);

        // var label1 = cc.LabelTTF.create("ABC", "Arial", 32);
        // label1.setColor(cc.color(255, 255, 255));
        // label1.setPosition(size.width/2, size.height/2);
        // this.addChild(label1);
        //
        // this.addMainMenu(cb, cb_parent);

        return true;
    },

    addMainMenu: function(cb, cb_parent) {
        var size = cc.Director.getInstance().getWinSize();
        // add start button
        var okItem = cc.MenuItemImage.create(
            "resources/common/popup/setting/btn_blue.png",
            "resources/common/popup/setting/btn_blue.png",
            cb,
            cb_parent);
        okItem.setAnchorPoint(cc.p(0.5, 0.5));
        okItem.setPosition(size.width/2, size.height * 0.25);

        var menu = cc.Menu.create(okItem);
        menu.setPosition(cc.p(0, 0));
        this.addChild(menu, 1);
    }
});
module.exports = CommonPopup;