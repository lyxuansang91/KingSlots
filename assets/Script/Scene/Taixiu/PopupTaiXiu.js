var BaseScene = require('BaseScene');
var NetworkManager = require('NetworkManager');
var TABLE_STATE = {
    BET: 1,
    BALANCE: 2,
    RESULT: 3,
    MATCH_END: 4,
    PREPARE_NEW_MATCH: 5,
}
class  Gate {
    constructor(gateID, userCount, totalBet, userBet) {
        this.gateID = gateID;
        this.userCount = userCount;
        this.totalBet = totalBet;
        this.userBet = userBet;
    }
}
cc.Class({
    extends: BaseScene,

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
        // taiGate: new Gate(0, 0, 0, 0),
        // xiuGate: new Gate(0, 0, 0, 0),
        tableStage: 0,
        bg_dark: cc.Sprite,
        btnClose: cc.Button
    },

    // use this for initialization
    onLoad: function() {
        function onTouchDown (event) {
            return true;
        }
        this.taiGate = new Gate(0, 0, 0, 0),
        this.xiuGate = new Gate(0, 0, 0, 0),
        this.node.on('touchstart', onTouchDown, this.bg_dark);
        // window.ws.onmessage = this.onGameStatus.bind(this);
        Common.setExistTaiXiu(true);
    },
    onClose: function() {
        NetworkManager.requestExitRoomMessage(0);
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
    onDestroy: function() {
        cc.log("on destroy tai xiu");
        Common.setExistTaiXiu(false);
    },
    setTableStage: function(stage) {
        this.tableStage = stage;
    },
    getTableStage: function() {
        return this.tableStage;
    },
    handleMessage: function(buffer) {
        var isDone = this._super(buffer);
        if(isDone)
            return true;
        isDone = true;
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
            case NetworkManager.MESSAGE_ID.EXIT_ZONE:
                this.exitZoneResponseHandler(buffer.response);
                break;
            case NetworkManager.MESSAGE_ID.BET:
                var msg = buffer.response;
                this.betResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.INSTANT_MESSAGE:
                var msg = buffer.response;
                this.instantMessageResponseHandler(msg);
                break;
            default:
                isDone = false;
                break;
        }
        return isDone;
    },
    exitZoneResponseHandler: function(resp) {
        cc.log("exit zone response:", resp.toObject());
        if(resp.getResponsecode()) {
            Common.setZoneId(-1);
            Common.closePopup("PopupTaiXiu");
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
            var typeId = resp.getBettype();
            var betMoney = resp.getBetMoney();
            var sourceId = resp.getSourceuserid();
            for (var i = 0; i < resp.getArgsList().length; i++) {
                var key = resp.getArgsList()[i].getKey();
                var value = resp.getArgsList()[i].getValue();
                if (key === "betGateInfo") {
                    var listBetGateInfo = value.split(',');
                    for (var j = 0; j < listBetGateInfo.length; j++) {
                        var betGateInfo = listBetGateInfo[j].split('-').map(Number);
                        //update giá trị cho các cửa, với mỗi mảng betGateInfo lần lượt là
                        //[0] : giá trị cửa, [1]: tổng tiền đặt vào cửa, [2]: tổng số người đặt vào cửa đó
                    }
                } else if (key === "totalPlayerBetGate") {
                    var listBetGateInfo = value.split(',');
                    for (var j = 0; j < listBetGateInfo.length; j++) {
                        var betGateInfo = listBetGateInfo[j].split('-').map(Number);
                        //update giá trị đặt của current user cho các cửa
                        //[0] : giá trị cửa, [1]: tổng tiền đặt vào cửa
                    }
                }
            }
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
            for (var i = 0; i < resp.getArgsList().length; i++) {
                var key = resp.getArgsList()[i].getKey();
                var value = resp.getArgsList()[i].getValue();
                if (key === "tableStage") {
                    this.setTableStage(value);
                } else if (key === "betGateInfo") {

                } else if (key === "diceValues") {
                    if (this.getTableStage() == TABLE_STATE.RESULT) {
                        var dicesvalue = value.split('-').map(Number);
                        //show animation con xuc sac quay
                    }

                } else if (key === "totalValue") {

                }
            }
        }
    },
    handleStartMatchResponseHandler: function(resp) {
        cc.log("start match response:", resp.toObject());
        if(resp.getResponsecode()) {
            //countdown dem nguoc
            var countdown = resp.getCountdowntimer() / 1000;
            var argList = resp.getArgsList();

            argList.forEach(function(element) {
                if (element.getKey() === "sessionId") {
                    var sessionId = element.getValue();
                    //set giá trị label section
                }
            });
            var message = resp.getMessage();
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
    },
    onGameEvent: function() {
        var self = this;
        NetworkManager.checkEvent(function(buffer) {
            return self.handleMessage(buffer);
        });
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        this.onGameEvent();
    },
});
