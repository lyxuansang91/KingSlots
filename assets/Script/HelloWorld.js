var MyMessage = require('initialize_pb');

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
        console.log(ByteBuffer);
        var bb = new ByteBuffer().writeIString("Hello World");
        console.log("bb : " + bb);

        var ws = new WebSocket("ws://14.225.2.111:1280/megajackpot");

        ws.onopen = function (event) {
            console.log("Web socket");
        };
        ws.onclose = function (event) {
            console.log("Websocket instance was closed");
        };

        ws.onmessage = function (event) {
            console.log("response text msg:" + event.data);
        };

        setTimeout(function () {
            if(ws.readyState == WebSocket.OPEN) {
                ws.send("1234432");
            } else {
                console.log("Web socket instance wasn't ready");
            }
        }, 3);
    },

    // called every frame
    update: function (dt) {

    },
});
