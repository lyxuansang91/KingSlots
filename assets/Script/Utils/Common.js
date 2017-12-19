var Common = {
    ZONE_ID: {
        BACAY: 1,
        XITO: 2,
        POKER: 3,
        PHOM: 4,
        TLMN: 5,
        TLMN_SOLO: 6,
        LIENG: 11,
        MAUBINH: 12,
        XENG: 13,
        XOCDIA: 15,
        TAIXIU: 17,
        VQMM: 18,
        MINI_POKER: 19,
        MINI_BACAY: 20,
        XOCDIA2: 21,
        EGG: 22
    },
    sessionId: "-1",
    getSessionId: function() {
        if(this.sessionId == "-1")
            this.sessionId = "";
        return this.sessionId;
    },
    setSessionId: function(e) {
        this.sessionId = e;
    },
    deviceId: "",
    getDeviceId: function() {
        return this.deviceId;
    },

    setDeviceId: function(e) {
        this.deviceId = e;
    },
    fingerprint: "",
    setFingerprint: function() {
        var fp = cc.sys.localStorage.getItem("fingerprint");
        cc.log("fp:", fp);
        if(fp == null) {
            new Fingerprint2().get(function(result, components){
                console.log("result:", result); //a hash, representing your device fingerprint
                cc.sys.localStorage.setItem("fingerprint", result);
                this.fingerprint = result;
                console.log("component:", components); // an array of FP components
            });
        } else {
            this.fingerprint = fp;
        }

    },
    getFingerprint: function() {
        if(this.fingerprint == "") {
            this.setFingerprint();
        }
        return this.fingerprint;
    },
    enableGameIds: [],
    setEnableGameIds: function(gameids) {
        this.enableGameIds = gameids;
    },
    _zoneId: -1,
    getZoneId: function() {
        var result = -1;
        cc.log("game tag =", this.gameTag);
        switch (this.gameTag)
        {
            case Config.TAG_GAME_ITEM.BACAY:
                result = Common.ZONE_ID.BACAY;
                break;
            case Config.TAG_GAME_ITEM.POKER:
                result = Common.ZONE_ID.POKER;
                break;
            case Config.TAG_GAME_ITEM.TAIXIU:
                result = Common.ZONE_ID.TAIXIU;
                break;
            case Config.TAG_GAME_ITEM.VQMM:
                result = Common.ZONE_ID.VQMM;
                break;
            default:
                result = Common.ZONE_ID.BACAY;
                break;
        }
        return this._zoneId != -1 ? this._zoneId : result;
    },
    setZoneId: function(zoneId) {
        this._zoneId = zoneId;
    },
    getEnableGameIds: function() {
        return this.enableGameIds;
    },
    setGameTag: function(gameTag) {
        cc.log("gameTag", gameTag);
        this.gameTag = gameTag;
    },
    getGameTag: function() {
        return this.gameTag;
    },
    _requestRoomType: -1,
    setRequestRoomType: function(requestRoomType){
        this._requestRoomType = requestRoomType;
    },
    getRequestRoomType: function(){
        return this._requestRoomType;
    },
    cashRoomList: [],
    setCashRoomList: function(cashRoomList) {
        this.cashRoomList = cashRoomList;
    },
    getCashRoomList: function() {
        return this.cashRoomList;
    }
};
