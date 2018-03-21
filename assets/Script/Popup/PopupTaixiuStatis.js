var NetworkManager = require('NetworkManager');
var Popup = require('Popup');
cc.Class({
    extends: Popup,

    properties: {
        contentBottom: cc.Node,
        contentTop: cc.Node,
        taixiuSpritePrefab: cc.Prefab,
        bottom_tai: cc.Label,
        bottom_xiu: cc.Label,
        top_tai: cc.Label,
        top_xiu: cc.Label,
        analyticResultHis: [],
        displayAnalyticResultHis: []
    },

    onLoad: function () {
        this.getLookUpGameHistory(0, 120);
    },

    onGameEvent: function() {
        var self = this;
        NetworkManager.checkEvent(function(buffer) {
            return self.handleMessage(buffer);
        })
    },

    update: function(dt) {
        this.onGameEvent();
    },

    handleMessage: function(e) {
        const buffer = e;
        var isDone = true;
        switch (buffer.message_id) {
            case NetworkManager.MESSAGE_ID.LOOK_UP_GAME_HISTORY:
                var msg = buffer.response;
                this.lookupGameHistoryResponse(msg);
                break;
            default:
                isDone = false;
                break;
        }
        return isDone;
    },

    getLookUpGameHistory: function(firstResult, maxResult){
        var entries = [];

        var entry = new proto.BINMapFieldEntry();
        entry.setKey("historyType");
        entry.setValue(Config.LookupTypeRequest.sessionHist.toString());
        entries.push(entry);

        NetworkManager.getLookUpGameHistoryRequest(firstResult, maxResult, entries);
    },

    lookupGameHistoryResponse: function(rs){
        cc.log("rs =", rs);
        if (rs !== 0) {
            if (rs.getResponsecode()) {
                if (rs.getHistoriesList().length > 0) {
                    this.analyticResultHis = [];
                    for (var i = 0; i < rs.getHistoriesList().length; i++) {
                        var section = parseInt(rs.getHistoriesList()[i].getFirst());
                        var resultString = rs.getHistoriesList()[i].getSecond().split(',');
                        var input = [];
                        input.push(section);

                        for (var j = 0; j < resultString.length; j++) {
                            input.push(parseInt(resultString[j]));
                        }
                        this.analyticResultHis.push(input);
                    }
                    this.getListAnalytic();
                    this.displayAnalyticResultHis.reverse();
                    this.updateBottomTable(this.analyticResultHis);
                    this.updateTopTable(this.displayAnalyticResultHis);
                }
            }
        }
    },

    getListAnalytic: function() {
        var row = 0;
        var column = 0;
        if (this.analyticResultHis[0].length === 0) {
            return;
        }
        var isTai = this.analyticResultHis[0][1] + this.analyticResultHis[0][2] + this.analyticResultHis[0][3] > 10;
        this.displayAnalyticResultHis = [];
        this.displayAnalyticResultHis.push(this.analyticResultHis[0]);
        for (var i = 1; i < this.analyticResultHis.length; i++) {
            if (this.analyticResultHis[i].length === 4 && isTai === this.analyticResultHis[i][1]
                + this.analyticResultHis[i][2] + this.analyticResultHis[i][3] > 10) {
                column++;
                if (column > 5) {
                    column = column - 6;
                    row++;
                }
            }
            else {
                isTai = !isTai;
                row++;
                column = 0;
            }
            if (row < 20) {
                this.displayAnalyticResultHis.push(this.analyticResultHis[i]);
            }
            else {
                break;
            }
        }
    },

    updateTopTable: function(historyList) {
        var taiCount = 0;
        var xiuCount = 0;
        var display = [];
        for (var i = historyList.length - 1; i >= 0; i--) {
            historyList[i][1] + historyList[i][2] + historyList[i][3] > 10 ? taiCount++ : xiuCount++;
            display.push(historyList[i]);
        }
        this.top_tai.string = taiCount;
        this.top_xiu.string = xiuCount;
        var originX = this.contentTop.getContentSize().width / 40;
        var originY = this.contentTop.getContentSize().height / 12;
        var row = 0;
        var column = 0;
        var check = display[0][1] + display[0][2] + display[0][3] > 10;
        // path = check ? TXN_TAI_SO : TXN_XIU_SO;
        // var firstSp = MSprite::create(path);
        // firstSp->setPosition(Vec2(originX, 11 * originY));
        // firstSp->setAnchorPoint(Vec2::ANCHOR_MIDDLE);
        // secondResult->addChild(firstSp);

        for (var i = 1; i < display.length; i++) {

            check = display[i][1] + display[i][2] + display[i][3];

            if (check > 10) {
                column++;
                if (column > 5) {
                    column = column - 6;
                    row++;
                }
            } else {
                check = !check;
                row++;
                column = 0;
            }

            if (row < 20) {
                var x = originX * (row * 2 + 1) - this.contentTop.getContentSize().width/2;
                var y = originY * (11 - column * 2) - this.contentTop.getContentSize().height/2;

                var item = cc.instantiate(this.taixiuSpritePrefab);
                item.getComponent('TaixiuSprite').init(check);

                item.setPositionX(x);
                item.setPositionY(y);
                this.contentTop.addChild(item);
            }


        }

    },

    updateBottomTable: function(historyList) {
        var taiCount = 0;
        var xiuCount = 0;
        var display = [];
        for (var i = historyList.length - 1; i >= 0; i--) {
            historyList[i][1] + historyList[i][2] + historyList[i][3] > 10 ? taiCount++ : xiuCount++;
            display.push(historyList[i]);
        }
        this.bottom_tai.string = taiCount;
        this.bottom_xiu.string = xiuCount;

        var originX = this.contentBottom.getContentSize().width / 40;
        var originY = this.contentBottom.getContentSize().height / 12;


        for (var i = 0; i < display.length; ++i) {
            var totalResult = display[i][1] + display[i][2] + display[i][3];
            var item = cc.instantiate(this.taixiuSpritePrefab);
            item.getComponent('TaixiuSprite').init(totalResult);

            var row = parseInt(i / 6);
            var column = parseInt(i % 6);
            var x = originX * (row * 2 + 1) - this.contentBottom.getContentSize().width/2;
            var y = originY * (11 - column * 2) - this.contentBottom.getContentSize().height /2;

            item.setPositionX(x);
            item.setPositionY(y);
            this.contentBottom.addChild(item);
        }
    }


});
