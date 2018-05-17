
var Poker = cc.Class({
    extends: cc.Component,

    properties: {
        table: cc.Node,
        avatar_prefab : cc.Prefab,
    },
    statics: {
        instance: null
    },

    onLoad: function () {
        Poker.instance = this;
        this.capacity = 5;
        this.initAvatar(this.capacity);
    },

    initDataFromLoading: function(roomPlay, playerList, waitingPlayerList, createRoom, reEnterRoomResponse){
        cc.log("roomPlay =", roomPlay);
        cc.log("playerList =", playerList);
        cc.log("waitingPlayerList =", waitingPlayerList);
        cc.log("createRoom =", createRoom);
        cc.log("reEnterRoomResponse =", reEnterRoomResponse);
        // this.setEnterZoneResponse(enterZone);
        // Common.setMiniGameZoneId(enterZone.getZoneid());
        // this.setEnterRoomResponse(enterRoom);
        // this.init(enterRoom);
    },

    initAvatar: function (capacity) {

        for(var i = 0; i < capacity; i++){
            var avatar = cc.instantiate(this.avatar_prefab);
            var avatar_comp = avatar.getComponent("Avatar");
            var pos = avatar_comp.avatarPosition(i,capacity,this.table.getContentSize());
            avatar.setPosition(pos);

            this.table.addChild(avatar,Config.index.AVATAR);

            avatar_comp.init(10);
        }
    }
});
