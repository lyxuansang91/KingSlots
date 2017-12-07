cc.Class({
    extends: cc.Component,

    properties: {
        edt_username: cc.EditBox,
        edt_password: cc.EditBox,
    },

    // use this for initialization
    onLoad: function () {

    },

    login: function() {
        cc.log("login normal");
        cc.log("username:", this.edt_username.string, "password:", this.edt_password.string);
    },
    register: function() {
        cc.log("register normal");
    },
    loginFacebook: function() {
        cc.log("login facebook ");
    },
    loginGoogle: function() {
        cc.log("login google");
    },
    close: function(){
        cc.log("close");
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
