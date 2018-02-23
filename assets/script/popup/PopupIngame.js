var NetworkManager = require('NetworkManager');
var Popup = require('Popup');
var HISTORY_SPIN = 1;
var HISTORY_BREAK_JAR = 2;
var HISTORY_TOP_USER = 3;

var PopupIngame = cc.Class({
    extends: Popup,

    properties: {
        titleString: cc.Sprite,
        topPrefab: cc.Prefab,
        scrollView: cc.ScrollView,
        historyType: 1,
        tableView: cc.Node,
        contentMask: cc.Node,
        userinfoPrefab: cc.Prefab,
        list_tab : []
    },

    statics: {
        instance: null
    },

    // use this for initialization
    onLoad: function () {
        PopupIngame.instance = this;
    },

    setHistoryType: function (historyType) {
        this.historyType = historyType;
    },
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
    init: function (tab, name, select) {
        var self = this;
        for(var i = 0; i < tab.length; i++){
            var item = cc.instantiate(this.topPrefab);
            var component = item.getComponent('PopupLeftItem');
            component.init(i+1, tab[i], name, select, function (index) {
                self.showTab(index);
            });
            var posX =  0;
            var posY = 0;

            posX = (i - tab.length/2 + 0.5)* item.getContentSize().width ;
            item.setPositionX(posX);
            item.setPositionY(posY);
            this.scrollView.content.addChild(item);

            this.list_tab.push(component);
        }

        if(name === "userinfo"){
            this.tableView.active = false;
            this.contentMask.active = true;
            var posX = this.contentMask.getPositionX();
            var posY = this.contentMask.getPositionY();
            var item = cc.instantiate(this.userinfoPrefab);
            item.getComponent('UserInfo').init();
            this.contentMask.addChild(item);
        }

    },

    showTab: function (index) {
        cc.log("index =", index);
        for(var i = 0; i < this.list_tab.length; i++){
            if(i === index){
                this.list_tab[i].setActive(true);
            }else{
                this.list_tab[i].setActive(false);
            }
        }
    },

    disappear:function () {
        this._super();
    }
});
