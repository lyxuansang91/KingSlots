var NetworkManager = require('NetworkManager');
var Popup = require('Popup');
cc.Class({
    extends: Popup,

    properties: {
        topUserType: 1
    },

    onLoad: function () {
        var entries = [];
        var entry = new proto.BINMapFieldEntry();
        entry.setKey("historyType");
        entry.setValue("3");
        entries.push(entry);
        NetworkManager.getLookUpGameHistoryRequest(0, 120, entries);
    },

    start: function () {

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
                cc.log("history response:", msg.toObject());
                break;
            default:
                isDone = false;
                break;
        }
        return isDone;
    }
});
