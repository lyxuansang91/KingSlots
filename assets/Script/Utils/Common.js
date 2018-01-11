var Common = {
    OS : {
        ANDROID: 1,
        IOS: 2,
        WEB: 5
    },
    userInfo: null,
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
    getUserInfo: function () {
       return this.userInfo;
    },
    setUserInfo: function(e) {
        this.userInfo = e;
    },
    create2DArray: function(nRows) {
        var rs = new Array(nRows);
        for(var i = 0; i < nRows; i++) {
            rs[i] = [];
        }
        return rs;
    },
    getOS: function() {
        var os = -1;
        if(cc.sys.isNative) {
            if(cc.sys.platform == cc.sys.ANDROID) {
                os = Common.OS.ANDROID;
            } else if(cc.sys.platform == cc.sys.IOS) {
                os = Common.OS.IOS;
            }
        } else if(cc.sys.isBrowser) {
            os = Common.OS.WEB;
        }
        return os;
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
            case Config.TAG_GAME_ITEM.MINI_BACAY:
                result = Common.ZONE_ID.MINI_BACAY;
                break;
            case Config.TAG_GAME_ITEM.MINI_POKER:
                result = Common.ZONE_ID.MINI_POKER;
                break;
            case Config.TAG_GAME_ITEM.TAIXIU:
                result = Common.ZONE_ID.TAIXIU;
                break;
            case Config.TAG_GAME_ITEM.VQMM:
                result = Common.ZONE_ID.VQMM;
                break;
            default:
                result = Common.ZONE_ID.MINI_BACAY;
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
    },
    listRoomPlay: [],
    setListRoomPlay: function(listRoomPlay) {
        this.listRoomPlay = listRoomPlay;
    },
    getListRoomPlay: function() {
        return this.listRoomPlay;
    },
    currentZoneId: -1,
    setCurrentZoneId: function(currentZoneId) {
        this.currentZoneId = currentZoneId;
    },
    getCurrentZoneId: function() {
        return this.currentZoneId;
    },
    ownerUserId: 0,
    getOwnerUserId: function() {
        return this.ownerUserId;
    },
    setOwnerUserId: function(ownerUserId) {
        this.ownerUserId = ownerUserId;
    },
    cash: 0,
    setCash: function(cash) {
        this.cash = cash;
    },
    getCash: function() {
        return this.cash;
    },
    genRandomNumber: function (arrCard, stepCard, number) {
        var results = [];
        do {
            var cardValue = number === 3 ? Math.floor(Math.random() * 36) + 1 : Math.floor(Math.random() * 52) + 1;
            if(arrCard !== null){
                if(!results.includes(cardValue)  && !arrCard.includes(cardValue)){
                    results.push(cardValue);
                }
            } else {
                if(!results.includes(cardValue)){
                    results.push(cardValue);
                }
            }
        }
        while (results.length < stepCard * number);
        return results;
    },
    genArrayToMultiArray: function (arrNumber, stepCard, number) {
        var i, j, k = 0,results = [];
        for(i = 0; i < stepCard; i++){
            results[i]= new Array(number);
            for(j = 0; j < number;j++){
                results[i][j] = arrNumber[k++];
            }
        }
        return results;
    },
    userName: "",
    setUserName: function(userName) {
        this.userName = userName;
    },
    getUserName: function() {
        return this.userName;
    },
    displayName: "",
    setDisplayName: function(displayName) {
        this.displayName = displayName;
    },
    getDisplayName: function() {
        if (this.displayName.empty()){
            return getUserName();
        }
        return this.displayName;
    },
    level: 0,
    setLevel: function(level) {
        this.level = level;
    },
    getLevel: function() {
        return this.level;
    },
    avatarId: 0,
    setAvatarId: function(avatarId) {
        this.avatarId = avatarId;
    },
    getAvatarId: function() {
        if (this.avatarId < 100000 || this.avatarId > 100021){
            return 100000;
        }
        return this.avatarId;
    },
    phoneNumber: "",
    setPhoneNunber: function(phoneNumber){
        this.phoneNumber = phoneNumber;
    },
    getPhoneNumber: function(){
        return this.phoneNumber;
    },
    accountVerify: true,
    setAccountVerify: function(accountVerify){
        this.accountVerify = accountVerify;
    },
    getAccountVerify: function(){
        return this.accountVerify;
    },
    disableCashTransaction: false,
    setDisableCashTransaction: function(disableCashTransaction){
        this.disableCashTransaction = disableCashTransaction;
    },
    getDisableCashTransaction:function(){
        return this.disableCashTransaction;
    },
    securityKeySeted: false,
    setSecurityKeySeted: function(securityKeySeted){
        this.securityKeySeted = securityKeySeted;
    },
    getSecurityKeySeted: function(){
        return this.securityKeySeted;
    },
    _autoReady: false,
    setAutoReady: function(autoReady) {
        this._autoReady = autoReady;
    },
    isAutoRead: function() {
        return this._autoReady;
    },
    _autoDenyInvitation: false,
    setAutoDenyInvitation: function(autoDenyInvitation) {
        this._autoDenyInvitation = autoDenyInvitation;
    },
    isAutoDenyInvitation: function() {
        return this._autoDenyInvitation;
    },
    enableEvent: false,
    setEnableEvent: function(enable) {
        this.enableEvent = enable;
    },
    isEnableEvent: function() {
        return this.enableEvent;
    },
    enableNotify: false,
    setEnableNotification: function(enable) {
        this.enableNotify = enable;
    },
    isEnableNotification: function() {
        return this.enableNotify;
    },
    enableTaixiu: true,
    setEnableTaixiu: function(enableTaixiu){
        this.enableTaixiu = enableTaixiu;
    },
    isEnableTaixiu: function(){
        return this.enableTaixiu;
    },
    noticeText:"",
    setNoticeText: function(noticeText){
        this.noticeText = noticeText;
    },
    getNoticeText: function(){
        return this.noticeText;
    },
    numberFormatWithCommas: function(value){
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    enterZone: [],
    setEnterZone: function(enterZone){
        this.enterZone = enterZone;
    },
    getEnterZone: function(){
        return this.enterZone;
    },
    _miniGameZoneId: -1,
    getMiniGameZoneId: function() {
        return this._miniGameZoneId;
    },
    setMiniGameZoneId: function(miniGameZoneId) {
        this._miniGameZoneId = miniGameZoneId;
    },

};
