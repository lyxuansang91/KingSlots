var MyMessage = require('initialize_pb');
var NetworkManager = require('NetworkManager');

cc.Class({
    extends: cc.Component,

    properties: {
        label: {
            default: null,
            type: cc.Label
        },
        // defaults, set visually when attaching this script to the Canvas
        text: 'Hello, World!'
    },

    // use this for initialization
    onLoad: function () {
        this.label.string = this.text;
        console.log(">>>>:" + MyMessage);

        window.ws = new WebSocket("ws://kingviet.top:1280/megajackpot");
        window.listMessage = [];
        window.ws.binaryType = "arraybuffer";

        window.ws.onopen = function (event) {
            console.log("Web socket");
            setTimeout(function() {
                var message = new MyMessage.BINInitializeRequest();
                message.setCp("1");
                message.setCountry("vn");
                message.setDeviceid("12345678909");
                message.setPakagename("com.packagename.com");
                message.setAppversion("1");
                var data = NetworkManager.initData(message.serializeBinary(), NetworkManager.OS.ANDROID,
                    NetworkManager.MESSAGE_ID.INITIALIZE, "");
                cc.log("data:", data);
                window.ws.send(data);
            }, 1);
        };
        window.ws.onclose = function (event) {
            console.log("Websocket instance was closed");
        };
        window.ws.onmessage = this.ongamestatus.bind(this);

        setTimeout(function () {
            if(window.ws.readyState == WebSocket.OPEN) {
                cc.log("web socket is open");
            } else {
                console.log("Web socket instance wasn't ready");
            }
        }, 3);
    },

    // called every frame
    update: function (dt) {

    },
    ongamestatus: function(event) {
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
    handleMessage: function(buffer) {
        switch (buffer.message_id) {
            case NetworkManager.MESSAGE_ID.INITIALIZE:
                var msg = buffer.response;
                cc.log("message: " + msg.getMessage());
                // alert(msg.getMessage());
                break;
        }
    }
});

