cc.Class({
    extends: cc.Component,

    properties: {
        list_frame: [cc.SpriteFrame],
    },

    init: function (index) {
        return this.list_frame[index];
    },
});
