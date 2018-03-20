
cc.Class({
    extends: cc.Component,

    properties: {
        lbl_session : cc.Label,
        lbl_date: cc.Label
    },

    init: function (session) {
        this.lbl_session.string = session;
        this.lbl_date.string = session;
    },

});
