var NetworkManager = require('NetworkManager');
var Popup = require('Popup');
var HISTORY_SPIN = 1;
var HISTORY_BREAK_JAR = 2;
var HISTORY_TOP_USER = 3;
var lstCardConfig = [];
var list_nhamang = [];
var PopupFull = cc.Class({
    extends: Popup,

    properties: {
        titleString: cc.Sprite,
        topPrefab: cc.Prefab,
        scrollView: cc.ScrollView,
        historyType: 1,
        tableView: cc.Node,
        target: cc.Node
    },

    statics: {
        instance: null
    },

    // use this for initialization
    onLoad: function () {
        PopupFull.instance = this;
        // window.ws.onmessage = this.ongamestatus.bind(this);
    },
    setHistoryType: function (historyType) {
        this.historyType = historyType;
    },
    // ongamestatus: function(event) {
    //     if(event.data!==null || event.data !== 'undefined') {
    //         var lstMessage = NetworkManager.parseFrom(event.data, event.data.byteLength);
    //         if(lstMessage.length > 0) {
    //             cc.log("lstMessage =", lstMessage);
    //             for(var i = 0; i < lstMessage.length; i++) {
    //                 var buffer = lstMessage[i];
    //                 this.handleMessage(buffer);
    //             }
    //         }
    //     }
    // },
    // handleMessage: function(buffer) {
    //     switch (buffer.message_id) {
    //         case NetworkManager.MESSAGE_ID.LOOK_UP_GAME_HISTORY:
    //             var msg = buffer.response;
    //             this.lookupGameMiniPokerResponseHandler(msg);
    //             break;
    //     }
    // },
    lookupGameMiniPokerResponseHandler: function(response) {
        if (response !== 0) {
            cc.log("look up game history response: ", response);
            if (response.hasMessage() && !response.getMessage()) {
                //show toast message
            }

            if (response.getResponsecode()) {
                cc.log("response =", response);
                switch (this.historyType) {
                    case HISTORY_BREAK_JAR:
                    {
                        var number = response.getHistoriesList().length;
                        var headCell = ["Thời gian", "Tên", "Đặt", "Thắng", "Bộ bài"];
                        var data = this._getdata(headCell,response.getHistoriesList(), number);

                        this.tableView.getComponent(cc.tableView).initTableView(data.length, { array: data, target: this });
                    }
                        break;
                    case HISTORY_SPIN:
                    {
                        var number = response.getHistoriesList().length;
                        var headCell = ["Thời gian", "Tên", "Đặt", "Thắng", "Bộ bài"];
                        var data = this._getdata(headCell,response.getHistoriesList(), number);
                        this.tableView.getComponent(cc.tableView).initTableView(data.length, { array: data, target: this });
                    }
                        break;
                    case HISTORY_TOP_USER:
                    {
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
        cc.log("val =", val);
        var array = [];
        // var headObj = {};
        // headObj.date_time = headCell[0];
        // headObj.displayName = headCell[1];
        // headObj.bet = headCell[2];
        // headObj.betWin = headCell[3];
        // headObj.betCard = headCell[4];
        // array.push(headObj);

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
    init: function (tab, name, target) {
        // cc.log("target 1 =", target);
        // this.setTarget(target);
        var nodeChild = new cc.Node();
        nodeChild.parent = this.scrollView.content;
        for(var i = 0; i < tab.length; i++){
            var item = cc.instantiate(this.topPrefab);
            item.getComponent('PopupLeftItem').init(i+1, tab[i], name);
            var posX =  0;
            var posY = 0;

            posX = (i - tab.length/2 + 0.5)* item.getContentSize().width ;
            item.setPositionX(posX);
            item.setPositionY(posY);
            nodeChild.addChild(item);
        }

    },
    // setTarget: function (target) {
    //     cc.log("target =", target);
    //     this.target = target.node;
    // },
    // getTarget: function () {
    //     return this.target;
    // },
    disappear:function () {
        // var nodeParent = this.getTarget();
        // nodeParent.removeChild(this);
        this._super();
    }
});
