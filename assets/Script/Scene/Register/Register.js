var NetworkManager = require('NetworkManager');
var BaseScene = require('BaseScene');

cc.Class({
    extends: BaseScene,

    properties: {
        edt_username: cc.EditBox,
        edt_pass: cc.EditBox,
        edt_repass: cc.EditBox,
        edt_displayname: cc.EditBox,
        messagePopup: cc.Prefab
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
    },

    // use this for initialization
    onLoad: function () {
        if(window.ws != null && typeof(window.ws) !== 'undefined')
            window.ws.onmessage = this.ongamemessage.bind(this);
    },
    ongamemessage: function(e) {
        if(e.data != null && typeof(e.data) !== 'undefined') {
            var lstMessage = NetworkManager.parseFrom(event.data, event.data.byteLength);
            if(lstMessage.length > 0) {
                var buffer = lstMessage.shift();
                this.handleMessage(buffer);
            }
        }
    },
    handleMessage: function(e) {
        const buffer = e;
        this._super(buffer);
        switch (buffer.message_id) {
            // case NetworkManager.MESSAGE_ID.INITIALIZE:
            //     var msg = buffer.response;
            //     break;
            case NetworkManager.MESSAGE_ID.LOGIN:
                var msg = buffer.response;
                this.handleLoginResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.REGISTER:
                var msg = buffer.response;
                this.handleRegisterResponseHandler(msg);
                break;
            // case NetworkManager.MESSAGE_ID.PING:
            //     var msg = buffer.response;
            //     this.handlePingResponseHandler(msg);
            //     break;
        }
    },
    handleRegisterResponseHandler: function(e) {
        const buffer = e;
        cc.log("buffer:", buffer);
        if(buffer.getResponsecode()) {
            NetworkManager.requestLoginMessage(this.edt_username.string, this.edt_pass.string);
        } else {
            var messagebox = cc.instantiate(this.messagePopup).getComponent("CommonPopup");
            messagebox.init(buffer.getMessage(), 0, function() {
                cc.log("on callback");
            });
            cc.log("message box:", messagebox);
            // messagebox.setAnchorPoint(cc.p(0.5, 0.5));
            messagebox.node.setPosition(cc.p(0, 0));
            this.node.addChild(messagebox.node);
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
        }
    },

    close: function() {
        cc.director.loadScene('Login');
    },
    register: function() {
        if(this.edt_username.string === "" || this.edt_pass.string === "" || this.edt_repass.string === "" || this.edt_displayname === "") {
            this.showToast("Dữ liệu không được để trống", this.node);
            return;
        }
        if(this.edt_pass.string !== this.edt_repass.string) {
            this.showToast("Mật khẩu phải giống nhau!", this.node);
            return;
        }
        NetworkManager.requestRegisterMessage(this.edt_username.string, this.edt_pass.string, this.edt_repass.string, this.edt_displayname.string, "");
    },
    showToast: function (strMess, target) {
        this._super(strMess, target);
    }
});
