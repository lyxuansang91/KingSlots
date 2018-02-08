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
        isRequestJar: false,
        jarValue: 0,
        roomIndex: 0,
        betType: 0,
        btn_select_lines: cc.Prefab,
        line_result: cc.Prefab,

        board_inside: cc.Sprite,
        board_null_line: cc.Node,

        lst_number : {
            type: [cc.Integer]

        },
        lst_line_results: [],
        lst_line_selected: []
    },

    ctor: function() {
        this.lst_number = [6,2,8,5,1,4,10,7,3,9,16,12,19,14,13,17,18,15,11,20];
    },
    start: function() {
        cc.log("on start");
        if(window.ws && window.ws.onmessage)
            window.ws.onmessage = this.onGameStatus.bind(this);
        this.requestJar();
        this.schedule(this.requestJar, 5);
        this.initMenu();
    },




    initMenu: function () {
        for (var i = 0; i < this.lst_number.length; i++){

            var line_result = cc.instantiate(this.line_result);
            var component = line_result.getComponent("LineResult");
            component.init(i);
            this.board_null_line.addChild(line_result);

            line_result.active = false;
            this.lst_line_results.push(line_result);
        }

        var pos_line_top = 0;
        var size_board = this.board_null_line.getContentSize();

        for (var i = 0; i < this.lst_number.length; i++) {
            var line_number = cc.instantiate(this.btn_select_lines);
            var component = line_number.getComponent("ButtonSelectLines");
            component.initNumber(this.lst_number[i]);
            // component.initHighLight(true);

            var size_line = line_number.getContentSize();
            if (i == 0) {
                pos_line_top = size_line.height * 5*0.93 + size_line.height/2;
            }

            line_number.setPosition(cc.p((parseInt(i / 10) == 0) ?
                        (-size_board.width/2 + size_line.width/2) :
                        (size_board.width/2 - size_line.width/2),
                pos_line_top - size_line.height * ((i % 10) * 0.93 + 1)));
            this.board_null_line.addChild(line_number);

            this.lst_line_selected.push(line_number);
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
    getSpin: function() {
        this.getTurnTreasureRequest(this.betType + 1);
    },
    getTurnTreasureRequest: function(turnType) {
        var entries = [];

        var entryTurn = new proto.BINMapFieldEntry();
        entryTurn.setKey("turnSlotType");
        entryTurn.setValue(turnType.toString());
        entries.push(entryTurn);

        var result = this.lst_number.join(",");

        var entryLine = new proto.BINMapFieldEntry();
        entryLine.setKey("lineSelected");
        entryLine.setValue(result);
        entries.push(entryLine);
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
        this._super();
        cc.log("on destroy");
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
        cc.log("update money response:", resp.toObject());
        if(resp.getResponsecode()) {

        }
        if(resp.hasMessage() && resp.getMessage() !== "") {

        }
    },

    matchEndResponseHandler: function(resp) {
        cc.log("match end response:", resp.toObject());
        if(resp.getResponsecode()) {
            if(resp.getArgsList().length > 0) {
                var listItem = null;
                var lineWin = null;
                for(var i = 0; i < resp.getArgsList().length; i++) {
                    var entry = resp.getArgsList()[i];
                    if(entry.getKey() == "listItem") {
                        listItem = entry.getValue().split(", ").map(function(item) {
                            item = parseInt(item);
                            return item;
                        });

                    } else {
                        if(entry.getValue() !== "")
                            lineWin = entry.getValue().split(", ").map(function(item) {
                                item = parseInt(item);
                                return item;
                            });
                        else lineWin = [];

                    }
                }
                if(listItem !== null && lineWin !== null) {

                    cc.log("list item:", listItem);
                    cc.log("line win:", lineWin);

                    // TODO:
                }
            }
        }

        if(resp.hasMessage() && resp.getMessage() !== "") {

        }
    },

    exitRoomResponseHandler: function(resp) {
        cc.log("exit room response message: ", resp.toObject());
        if(resp.getResponsecode()) {

        }
    },
    exitZoneResponseHandler: function(resp) {
        cc.log("exit zone response message:", resp.toObject());
        if(resp.getResponsecode()) {
            Common.setZoneId(-1);
            cc.director.loadScene('Lobby');
        }

        if(resp.hasMessage() && resp.getMessage() !== "") {

        }
    },
    jarResponseHandler: function(resp) {
        cc.log("jar response message:", resp.toObject());
        if(resp.getResponsecode()) {

        }

        if(resp.hasMessage() && resp.getMessage() !== "") {

        }
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
