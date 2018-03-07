
const CommonPopup = require('CommonPopup');
const NetworkManager = require('NetworkManager');

cc.Class({
    extends: CommonPopup,

    properties: {
        tabLeftPrefab: cc.Prefab,
        nodeNapThe: cc.Prefab,
        _tab: 1,
        subHistory: 1
    },



    // onLoad () {},

    start: function() {

    },

    onLoad: function () {
        NetworkManager.getCardConfigRequest(Config.CARD_CONFIG_TYPE.TYPE_CASH);
    },

    addTabs: function (tabs, index) {
        this.initTabs(tabs, index);
    },

    initTabs: function (tabs, index) {
        this._super(tabs, index);
    },

    onEvent: function(index) {
        cc.log("index : ",index);
        var nodeNapThe = this.tableView.getChildByName("NodeNapThe");
        switch(index) {
            case 1:
                nodeNapThe.active = true;
                nodeNapThe.getComponent("NodeNapThe").demo(1);

                break;
            case 2:
                nodeNapThe.active = false;
                nodeNapThe.getComponent("NodeNapThe").demo(2);
                break;
            case 3:
                break;
            default:
                break;
        }

    },

    update: function(dt) {
        this.onGameEvent();
    },
    handleMessage: function(buffer) {
        var isDone = true;
        switch(buffer.message_id) {
            case NetworkManager.MESSAGE_ID.CARD_CONFIG:
                break;
        }
    },
    onGameEvent: function (){
        NetworkManager.checkEvent(function(buffer) {
            return this.handleMessage(buffer);
        }.bind(this));
    }


    // update (dt) {},
});
