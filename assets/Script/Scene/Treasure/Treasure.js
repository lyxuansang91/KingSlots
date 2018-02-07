// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

var BaseScene = require('BaseScene');
var NetworkManager = require('NetworkManager');

cc.Class({
    extends: BaseScene,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        myInterVal: null,
        isRequestJar: false,
        jarValue: 0,
        roomIndex: 0,
        betType: 0,
        lst_lines_selected: [6,2,8,5,1,4,10,7,3,9,16,12,19,14,13,17,18,15,11,20]
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start: function() {
        cc.log("on start");
        if(window.ws && window.ws.onmessage)
            window.ws.onmessage = this.onGameStatus.bind(this);
        this.myInterval = setInterval(function() {
            this.requestJar();
        }.bind(this), 5000);
    },
    requestJar: function() {
        var self = this;
        if(!self.isRequestJar) {
            cc.log("request jar:", this.betType + 1);
            self.isRequestJar = false;
            NetworkManager.getJarRequest(Common.getZoneId(), this.betType + 1);
        }
    },
    getTurnMiniPokerRequest: function(turnType) {
        var entries = [];
        var entry = new proto.BINMapFieldEntry();
        entry.setKey("turnSlotType");
        entry.setValue(turnType.toString());
        entries.push(entry);
        NetworkManager.getTurnMessageFromServer(0, entries);
    },
    exitRoom: function() {
        NetworkManager.requestExitRoomMessage(this.roomIndex);
    },
    getKeyBet: function() {
        return this.betType;
    },
    calculateTurnType: function() {
        return this.getKeyBet() + 1;
    },
    onLoad: function() {
        cc.log("on load");
    },
    onDestroy: function() {
        clearInterval(this.myInterval);
    },
    onGameStatus: function() {
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
    updateMoneyMessageResponseHandler: function(resp) {

    },

    matchEndResponseHandler: function(resp) {

    },

    exitRoomResponseHandler: function(resp) {

    },
    exitZoneResponseHandler: function(resp) {

    },
    jarResponseHandler: function(resp) {

    },

    handleMessage: function(buffer) {
        this._super(buffer);
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
                this.exitRoomResponseHandler(msg);
                break;
            // // case NetworkManager.MESSAGE_ID.ENTER_ROOM:
            // //     var msg = buffer.response;
            // //     this.enterRoomResponseHandler(msg);
            // //     break;
            case NetworkManager.MESSAGE_ID.EXIT_ZONE:
                var msg = buffer.response;
                this.exitZoneResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.JAR:
                var msg = buffer.response;
                this.jarResponseHandler(msg);
                break;
        }
    }


    // update (dt) {},
});
