var NetworkManager = require('NetworkManager');
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

    init: function (tag, titleStr, name) {
        this.titleBtn.string = titleStr;
        var btn = this.background.getComponent(cc.Button);
        btn.node._tag = tag;
        btn.node.name = name;

        switch (name) {
            case "history":
            {
                this.getLookupMiniPokerHistoryRequest(firstResult, MAX_RESULT,
                    this.historyType, true);
            }
                break;
            case "charge":
            {
                NetworkManager.getCardConfigRequest(1);
            }
                break;
            default:
                break;
        }
    },
    
    btnEvent: function (e) {
        var tag = e.target._tag;
        var name = e.target.name;
        cc.log("e =", e.target);

        switch (name) {
            case "history":
            {
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
            }
                break;
            case "charge":
            {
                NetworkManager.getCardConfigRequest(1);
            }
                break;
            default:
                break;
        }


    },
    getLookupMiniPokerHistoryRequest: function(firstResult, maxResult, historyType, isCash) {
        var entries = [];
        var entry = new proto.BINMapFieldEntry();
        entry.setKey("historyType");
        entry.setValue(historyType.toString());
        //1: lich su ca nhan, 2: lich su no hu, 3: top cao thu quay
        entries.push(entry);
        var entry1 = new proto.BINMapFieldEntry();
        entry1.setKey("isCash");
        entry1.setValue(isCash ? "true" : "false");
        entries.push(entry1);
        NetworkManager.getLookUpGameHistoryRequest(firstResult,
            maxResult, entries, -1, false);
    }
});
