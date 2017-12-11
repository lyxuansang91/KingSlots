var NetworkManager = require('NetworkManager');

cc.Class({
    extends: cc.Component,

    properties: {
        edt_username: cc.EditBox,
        edt_password: cc.EditBox,
    },

    // use this for initialization
    onLoad: function () {
        NetworkManager.connectNetwork();
        window.ws.onmessage = this.ongamestatus.bind(this);
    },

    ongamestatus: function(e) {
        cc.log("response text msg:" + event);
        if(event.data!==null || event.data !== 'undefined') {
            var lstMessage = NetworkManager.parseFrom(event.data, event.data.byteLength);
            cc.log("list message size:" + lstMessage.length);
            if(lstMessage.length > 0) {
                var buffer = lstMessage.shift();
                cc.log("buffer:" , buffer);
                this.handleMessage(buffer);
            }
        }
    },
    handleMessage: function(e) {
        const buffer = e;
        cc.log("response:", buffer);
        switch (buffer.message_id) {
            case NetworkManager.MESSAGE_ID.INITIALIZE:
                var msg = buffer.response;
                cc.log("message: " + msg);
                // alert(msg.getMessage());
                break;
            case NetworkManager.MESSAGE_ID.LOGIN:
                var msg = buffer.response;
                this.handleLoginResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.PING:
                var msg = buffer.response;
                cc.log("message:" , msg);

        }
    },
    handleLoginResponseHandler: function(res) {
        cc.log("login response handler:", res);
    },

    login: function() {
        cc.log("login normal");
        var username = this.edt_username.string;
        var password = this.edt_password.string;
        if(this.edt_username.string == "" || this.edt_password.string == "") {
            cc.alert("Tài khoản và mật khẩu không được để trống!");
            return;
        }
        NetworkManager.requestLoginMessage(username, password);
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
