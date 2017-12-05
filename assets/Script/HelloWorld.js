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
        var message = new MyMessage.BINInitializeRequest();
        message.setCp("1");
        message.setCountry("vn");
        message.setDeviceid("12345678909");
        message.setPakagename("com.packagename.com");
        message.setAppversion("1");


        window.ws = new WebSocket("ws://192.168.0.32:1280/megajackpot");
        window.ws.binaryType = "arraybuffer";

        window.ws.onopen = function (event) {
            console.log("Web socket");
            setTimeout(function() {
                var data = NetworkManager.initData(message.serializeBinary(), NetworkManager.OS.ANDROID,
                    NetworkManager.MESSAGE_ID.INITIALIZE, "");
                cc.log("data:", data);
                window.ws.send(data);
            }, 1);

        };
        window.ws.onclose = function (event) {
            console.log("Websocket instance was closed");
        };

        window.ws.onmessage = function (event) {
            console.log("response text msg:" + event);
            NetworkManager.parseFrom(event.data, event.data.byteLength);
        };

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

    }
});
