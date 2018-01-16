cc.Class({
    extends: cc.Component,

    properties: {
        anim: cc.Animation
    },

    // use this for initialization
    onLoad: function () {

    },
    playAnim: function () {
        cc.log("playAnim");
        this.anim.play('NoHu');
    },
    stopAnim: function () {
        this.anim.stop('NoHu');
    }
});
