
cc.Class({
    extends: cc.Component,

    properties: {
        title : cc.Label
    },

    init: function (text,tag,callback) {
        this.callback = callback;
        this.tag = tag;
        this.title.string = text;
    },
    
    touchEvent : function (event) {
        this.callback(this.tag);
    }
});
