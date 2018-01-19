var NetworkManager = require('../Lib/NetworkManager.js');
var HISTORY_SPIN = 1;
var HISTORY_BREAK_JAR = 2;
var HISTORY_TOP_USER = 3;
var PopupIngame = cc.Class({
    extends: cc.Component,

    properties: {
        titleString: cc.Sprite,
        leftPrefab: cc.Prefab,
        scrollView: cc.ScrollView,
        tableView: cc.Node,
        historyType: 1
        // HISTORY_SPIN : 1,
        // HISTORY_BREAK_JAR : 2,
        // HISTORY_TOP_USER : 3
    },

    statics: {
        instance: null
    },

    // use this for initialization
    onLoad: function () {
        PopupIngame.instance = this;
        window.ws.onmessage = this.ongamestatus.bind(this);
    },
    setHistoryType: function (historyType) {
        this.historyType = historyType;
    },
    ongamestatus: function(event) {
        if(event.data!==null || event.data !== 'undefined') {
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
        switch (buffer.message_id) {
            case NetworkManager.MESSAGE_ID.LOOK_UP_GAME_HISTORY:
                var msg = buffer.response;
                this.lookupGameMiniPokerResponseHandler(msg);
                break;
        }
    },
    lookupGameMiniPokerResponseHandler: function(response) {
        if (response !== 0) {
            cc.log("look up game history response: ", response);
            if (response.hasMessage() && !response.getMessage()) {
                //show toast message
            }

            if (response.getResponsecode()) {
                switch (this.historyType) {
                    case HISTORY_BREAK_JAR:
                    {
                        cc.log("HISTORY_BREAK_JAR = ", response);
                        var number = response.getHistoriesList().length;
                        var headCell = ["Thời gian", "Tên", "Đặt", "Thắng", "Bộ bài"];
                        var data = this._getdata(headCell,response.getHistoriesList(), number);
                        this.tableView.getComponent(cc.tableView).initTableView(data.length, { array: data, target: this });
                    }
                        break;
                    case HISTORY_SPIN:
                    {
                        cc.log("HISTORY_SPIN = ", response);
                        var number = response.getHistoriesList().length;
                        var headCell = ["Thời gian", "Tên", "Đặt", "Thắng", "Bộ bài"];
                        var data = this._getdata(headCell,response.getHistoriesList(), number);
                        this.tableView.getComponent(cc.tableView).initTableView(data.length, { array: data, target: this });
                    }
                        break;
                    case HISTORY_TOP_USER:
                    {
                        cc.log("HISTORY_TOP_USER =", response);
                        var number = response.getHistoriesList().length;
                        var headCell = ["Thời gian", "Tên", "Đặt", "Thắng", "Bộ bài"];
                        var data = this._getdata(headCell,response.getHistoriesList(), number);
                        this.tableView.getComponent(cc.tableView).initTableView(data.length, { array: data, target: this });
                    }
                        break;
                    default:
                        break;
                }
            }

            if (response.getArgsList().length > 0) {
                var entry = response.getArgsList()[0];
                if (entry.getKey() === "totalCount")
                    this.totalCount = parseInt(entry.getValue());
            }
        }
    },
    _getdata: function (headCell, val, num) {

        var array = [];
        var headObj = {};
        headObj.date_time = headCell[0];
        headObj.displayName = headCell[1];
        headObj.bet = headCell[2];
        headObj.betWin = headCell[3];
        headObj.betCard = headCell[4];
        array.push(headObj);

        for (var i = 0; i < num; ++i) {
            var obj = {};
            obj.date_time = Common.timestampToDate(val[i].getSixth());
            obj.displayName = val[i].getFirst();
            obj.bet = val[i].getThird();
            obj.betWin = val[i].getFourth();
            obj.betCard = val[i].getSecond();
            array.push(obj);
        }

        cc.log("array =", array);
        return array;
    },
    init: function (tab) {
        var nodeChild = new cc.Node();
        nodeChild.parent = this.scrollView.node;
        for(var i = 0; i < tab.length; i++){
            var item = cc.instantiate(this.leftPrefab);
            item.getComponent('PopupLeftItem').init(i+1, tab[i]);
            var posX =  0;
            var posY = 0;

            posY = - i *item.getContentSize().height ;
            item.setPositionX(posX);
            item.setPositionY(posY);
            nodeChild.addChild(item);
        }
        // this.titleString.string = tab;

    },
    disappear:function () {
        var callDisappear = cc.callFunc(function(){
            this.node.removeFromParent(true);
        },this);

        var move = cc.moveTo(0.05,cc.p(0,-200));
        this.node.runAction(cc.sequence(move,callDisappear));
    }
});
