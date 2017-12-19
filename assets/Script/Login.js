var NetworkManager = require('NetworkManager');
var BaseScene = require('BaseScene');

cc.Class({
    extends: BaseScene,

    properties: {
        edt_username: cc.EditBox,
        edt_password: cc.EditBox
    },
    // use this for initialization
    onLoad: function () {
        Common.setFingerprint();
        NetworkManager.connectNetwork();
        window.ws.onmessage = this.ongamestatus.bind(this);
    },

    ongamestatus: function(event) {
        if(event.data!==null || typeof(event.data) !== 'undefined') {
            var lstMessage = NetworkManager.parseFrom(event.data, event.data.byteLength);
            if(lstMessage.length > 0) {
                var buffer = lstMessage.shift();
                this.handleMessage(buffer);
            }
        }
    },
    handleMessage: function(e) {
        const buffer = e;
        cc.log("response:", buffer);
        this._super(buffer);
        switch (buffer.message_id) {
            // case NetworkManager.MESSAGE_ID.INITIALIZE:
            //     var msg = buffer.response;
            //     break;
            case NetworkManager.MESSAGE_ID.LOGIN:
                var msg = buffer.response;
                this.handleLoginResponseHandler(msg);
                break;
            // case NetworkManager.MESSAGE_ID.PING:
            //     var msg = buffer.response;
            //     this.handlePingResponseHandler(msg);
            //     break;
        }
    },
    handleLoginResponseHandler: function(res) {
        cc.log("login response handler:", res);
        if(res.getResponsecode()) {
            var session_id = res.getSessionid();
            cc.log("session id:", session_id);
            Common.setSessionId(session_id);
            cc.sys.localStorage.setItem("session_id", session_id);

            cc.director.loadScene('Lobby');
l        }

    },
    handlePingResponseHandler: function(res) {
        cc.log("ping response handler:", res);
        if(res.getResponsecode()) {
            if(res.getDisconnect()) {
                Common.setSessionId("-1");
                if(res.hasMessage() && res.getMessage() != "") {
                    cc.alert(res.getMessage());
                }
                NetworkManager.closeConnection();
                this.scheduleOnce(this.goIntroScene, 2.0);
            }
        }
    },
    goIntroScene: function(e) {
        cc.director.runScene('Intro');
    },

    login: function() {
        cc.log("login normal");
        var username = this.edt_username.string;
        var password = this.edt_password.string;
        if(this.edt_username.string === "" || this.edt_password.string === "") {
            cc.alert("Tài khoản và mật khẩu không được để trống!");
            return;
        }
        NetworkManager.requestLoginMessage(username, password);
    },
    register: function() {
        cc.log("register normal");
        cc.director.loadScene('Register');
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
