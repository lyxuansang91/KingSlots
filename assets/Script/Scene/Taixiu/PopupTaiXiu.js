var BaseScene = require('BaseScene');
var NetworkManager = require('NetworkManager');
cc.Class({
    extends: BaseScene,

    properties: {
        bg_dark: cc.Sprite,
        btnClose: cc.Button
    },

    // use this for initialization
    onLoad: function () {
        function onTouchDown (event) {
            return true;
        }

        this.node.on('touchstart', onTouchDown, this.bg_dark);

        window.ws.onmessage = this.onGameStatus.bind(this);
    },
    onClose: function() {
        this.node.removeFromParent(true);

    },
    onGameStatus: function(event) {
        if(event.data!==null || typeof(event.data) !== 'undefined') {
            var lstMessage = NetworkManager.parseFrom(event.data, event.data.byteLength);
            if(lstMessage.length > 0) {
                for(var i = 0; i < lstMessage.length; i++) {
                    var buffer = lstMessage[i];
                    this.handleMessage(buffer);
                }
            }
        }
    },
    handleMessage: function(buffer) {
        this._super(buffer);
        // cc.log("buffer:", buffer.response.toObject());
        switch (buffer.message_id) {
            case NetworkManager.MESSAGE_ID.START_MATCH:
                var msg = buffer.response;
                this.handleStartMatchResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.MATCH_END:
                var msg = buffer.response;
                this.handleMatchEndResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.MATCH_BEGIN:
                var msg = buffer.response;
                this.handleMatchBeginResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.TURN:
                var msg = buffer.response;
                this.handleTurnResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.EXIT_ROOM:
                var msg = buffer.response;
                this.exitRoomResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.BET:
                var msg = buffer.response;
                this.betResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.INSTANT_MESSAGE:
                var msg = buffer.response;
                this.instantMessageResponseHandler(msg);
                break;
        }
    },
    instantMessageResponseHandler: function(resp) {
        cc.log("instant message response:", resp.toObject());
        if(resp.getResponsecode()) {

        }
    },
    betResponseHandler: function(resp) {
        cc.log("bet response:", resp.toObject());
        if(resp.getResponsecode()) {

        }
    },
    exitRoomResponseHandler: function(resp) {
        cc.log("exit room response:", resp.toObject());
        if(resp.getResponsecode()) {

        }
    },
    handleTurnResponseHandler: function(resp) {
        cc.log("turn response:", resp.toObject());
        if(resp.getResponsecode()) {

        }
    },
    handleStartMatchResponseHandler: function(resp) {
        cc.log("start match response:", resp.toObject());
        if(resp.getResponsecode()) {

        }
    },
    handleMatchEndResponseHandler: function(resp) {
        cc.log("match end response:", resp.toObject());
        if(resp.getResponsecode()) {

        }
    },
    handleMatchBeginResponseHandler: function(resp) {
        cc.log("match begin response:", resp.toObject());
        if(resp.getResponsecode()) {

        }
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
