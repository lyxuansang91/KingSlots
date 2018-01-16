var NetworkManager = require('../Lib/NetworkManager.js');
var PopupIngame = require('PopupIngameItem');
var HISTORY_SPIN = 1;
var HISTORY_BREAK_JAR = 2;
var HISTORY_TOP_USER = 3;
var MAX_RESULT = 20;
var firstResult = -1;
cc.Class({
    extends: cc.Component,

    properties: {
        titleBtn: cc.Label,
        background: cc.Button,
        historyType: 1

    },

    // use this for initialization
    onLoad: function () {

    },

    init: function (tag, titleStr) {
        this.titleBtn.string = titleStr;
        var btn = this.background.getComponent(cc.Button);
        btn.node._tag = tag;
    },
    
    btnEvent: function (e) {
        var tag = e.target._tag;
        cc.log("tag =", tag);

        if (tag === 1){
            this.historyType = HISTORY_SPIN;
            PopupIngame.instance.setHistoryType(HISTORY_SPIN);
            this.getLookupMiniPokerHistoryRequest(firstResult, MAX_RESULT,
                this.historyType, true);

            //tab->setPositionY(heightInerScroll - heightTab - TAG_PADDING_TAB);

        }else if (tag === 2) {
            this.historyType = HISTORY_TOP_USER;
            PopupIngame.instance.setHistoryType(HISTORY_TOP_USER);
            this.getLookupMiniPokerHistoryRequest(firstResult, MAX_RESULT,
                this.historyType, true);

            //tab->setPositionY(heightInerScroll - 2 * (heightTab + TAG_PADDING_TAB));

        }else if (tag === 3){
            this.historyType = HISTORY_BREAK_JAR;
            PopupIngame.instance.setHistoryType(HISTORY_BREAK_JAR);
            this.getLookupMiniPokerHistoryRequest(firstResult, MAX_RESULT,
                this.historyType, true);

            //tab->setPositionY(heightInerScroll - 3 * (heightTab + TAG_PADDING_TAB));
        }
        this.getLookupMiniPokerHistoryRequest(firstResult, MAX_RESULT,
            this.historyType, true);

    },
    getLookupMiniPokerHistoryRequest: function(firstResult, maxResult, historyType, isCash) {
        var entries = [];
        var entry = new proto.BINMapFieldEntry();
        entry.setKey("historyType");
        entry.setValue(historyType.toString());
        //1: lich su ca nhan, 2: lich su no hu, 3: top cao thu quay
        entries.push(entry);
        // entry.setKey("isCash");
        // entry.setValue(isCash ? "true" : "false");
        // entries.push(entry);
        NetworkManager.getLookUpGameHistoryRequest(firstResult,
            maxResult, entries, -1, false);
    }
});
