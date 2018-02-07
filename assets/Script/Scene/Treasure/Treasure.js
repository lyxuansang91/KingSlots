
var BaseScene = require('BaseScene');
var NetworkManager = require('NetworkManager');

cc.Class({
    extends: BaseScene,

    properties: {
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
        btn_select_lines: cc.Prefab,

        board_inside: cc.Sprite,
        board_null_line: cc.Node,

        lst_line_selected : []
    },

    start: function() {

        cc.log("on start");
        if(window.ws && window.ws.onmessage)
            window.ws.onmessage = this.onGameStatus.bind(this);
        /*this.myInterval = setInterval(function() {
            this.requestJar();
        }.bind(this), 5000);*/

        this.initMenu();
    },

    initMenu: function () {
        this.lst_line_selected = [6, 2, 8, 5, 1, 4, 10, 7, 3, 9,
            16, 12, 19, 14, 13, 17, 18, 15, 11, 20];

        var pos_line_top = 0;
        var size_board = this.board_null_line.getContentSize();
        for (var i = 0; i < this.lst_line_selected.length; i++) {
            var line_number = cc.instantiate(this.btn_select_lines);
            line_number.getComponent("ButtonSelectLines").initNumber(this.lst_line_selected[i]);

            var size_line = line_number.getContentSize();
            if (i == 0){
                pos_line_top = size_line.height * 5*0.93 + size_line.height/2;
            }

            line_number.setPosition(cc.p((parseInt(i / 10) == 0) ?
                (-size_board.width/2 + size_line.width/2) :
                (size_board.width/2 - size_line.width/2),
                pos_line_top - size_line.height * ((i % 10) * 0.93 + 1)));
            this.board_null_line.addChild(line_number);
        }
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
