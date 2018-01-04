var NetworkManager = require('NetworkManager');

cc.Class({
    extends: cc.Component,

    properties: {
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
    exitRoom: function() {
        cc.director.loadScene("Table");
    },

    getTurnMiniPokerRequest: function(turnType) {

        // cangatAnimation();
        // isRunning = true;

        var entries = [];
        var entry = new proto.BINMapFieldEntry();
        entry.setKey("turnSlotType");
        entry.setValue(turnType.toString());
        entries.push(entry);
        NetworkManager.getTurnMessageFromServer(0, entries);
    },

    takeTurn: function() {
        this.getTurnMiniPokerRequest(1);
    },

    // use this for initialization
    onLoad: function () {
        window.ws.onmessage = this.ongamestatus.bind(this);
    },
    ongamestatus: function(event) {
        if(event.data!==null || event.data !== 'undefined') {
            var lstMessage = NetworkManager.parseFrom(event.data, event.data.byteLength);
            cc.log("list message size:" + lstMessage.length);
            if(lstMessage.length > 0) {
                for(var i = 0; i < lstMessage.length; i++){
                    var buffer = lstMessage[i];
                    this.handleMessage(buffer);
                }
            }
        }
    },
    matchEndResponseHandler: function(resp) {
      cc.log("match end response handler:", resp.toObject());
      if(resp.getResponsecode()) {
          //
      }

      if(resp.hasMessage() && resp.getMessage() !== "") {

      }
    },
    updateMoneyMessageResponseHandler: function(resp) {
        cc.log("update money response: ", resp.toObject());
        if(resp.getResponsecode()) {

        }

        if(resp.hasMessage() && resp.getMessage() !== "") {
            // show dialog
        }
    },
    exitRoomResponseHandler: function(resp) {
        cc.log("exit room response handler:", resp.toObject());
        if(resp.getResponsecode()) {

        }
        if(resp.hasMessage() && resp.getMessage() !== "") {

        }
    },
    exitZoneResponseHandler: function(resp) {
        cc.log("exit zone response handler:", resp.toObject());
        if(resp.getResponsecode()) {

        }

        if(resp.hasMessage() && resp.getMessage() !== "") {
            // show toast
        }
    },
    handleMessage: function(buffer) {
      //  cc.log("buffer =", buffer.message_id);
        switch (buffer.message_id) {
            case NetworkManager.MESSAGE_ID.UPDATE_MONEY:
                var msg = buffer.response;
                this.updateMoneyMessageResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.MATCH_END:
                this.matchEndResponseHandler(buffer.response);
                break;
            case NetworkManager.MESSAGE_ID.EXIT_ROOM:
                var msg = buffer.response;
                this.exitRoomResponsehandler(msg);
                break;
            // // case NetworkManager.MESSAGE_ID.ENTER_ROOM:
            // //     var msg = buffer.response;
            // //     this.enterRoomResponseHandler(msg);
            // //     break;
            case NetworkManager.MESSAGE_ID.EXIT_ZONE:
                var msg = buffer.response;
                this.exitZoneResponseHandler(msg);
                break;
        }
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
