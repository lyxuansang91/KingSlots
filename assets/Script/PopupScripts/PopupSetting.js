cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        type: cc.Node,
        prefabPopup: cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
        //this.pList();
    },
    pList: function() {
        // if(this.isVisible == true){
            cc.log('aaaaaaaa', this.type.getContentSize().height*0.06);
            var item = cc.instantiate(this.prefabPopup);
            this.setPosition(cc.p(0,0));
            this.node.addChild(item);
        // }

    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
