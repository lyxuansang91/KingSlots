var NetworkManager = require('NetworkManager');
var PopupFull = require('PopupFull');
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
        historyType: 1,
        list_tab : [cc.SpriteFrame],
        callBack: function(){}
    },

    init: function (tag, titleStr, name, select, callback) {
        this.callback = callback;
        this.titleBtn.string = titleStr;
        var btn = this.background.getComponent(cc.Button);
        this.tag = tag;
        btn.node.name = name;
        var self = this;
        switch (name) {
            case "history":
            {
                this.getLookupMiniPokerHistoryRequest(firstResult, MAX_RESULT,
                    select, true);
                self.callback(select-1);
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
        var name = e.target.name;
        cc.log("e =", e.target);

        switch (name) {
            case "history":
            {
                if (this.tag === 1){
                    this.historyType = HISTORY_SPIN;
                    PopupFull.instance.setHistoryType(HISTORY_SPIN);
                    this.getLookupMiniPokerHistoryRequest(firstResult, MAX_RESULT,
                        this.historyType, true);
                    this.callback(this.tag -1);

                }else if (this.tag === 3) {
                    this.historyType = HISTORY_TOP_USER;
                    PopupFull.instance.setHistoryType(HISTORY_TOP_USER);
                    this.getLookupMiniPokerHistoryRequest(firstResult, MAX_RESULT,
                        this.historyType, true);
                    this.callback(this.tag -1);
                }else if (this.tag === 2){
                    this.historyType = HISTORY_BREAK_JAR;
                    PopupFull.instance.setHistoryType(HISTORY_BREAK_JAR);
                    this.getLookupMiniPokerHistoryRequest(firstResult, MAX_RESULT,
                        this.historyType, true);

                    this.callback(this.tag -1);
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
    },

    setActive: function (isActive) {
        if(isActive){
            this.background.getComponent(cc.Sprite).spriteFrame = this.list_tab[0];
        } else {
            this.background.getComponent(cc.Sprite).spriteFrame = this.list_tab[1];
        }
    }
});
