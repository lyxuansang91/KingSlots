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
    width : cc.director.getWinSize().width,
    height : cc.director.getWinSize().height,
    introScene: null,
    getIntroSceneInstance: function () {
        return this.introScene;
    },
    setIntroSceneInstance: function(e) {
        return this.introScene;
    },
    loginScene: null,
    getLoginSceneInstance: function () {
        return this.loginScene;
    },
    setLoginSceneInstance: function(e) {
        this.loginScene = e;
    },
    tableScene: null,
    getTableSceneInstance: function() {
        return this.tableScene;
    },
    setTableSceneInstance: function(e) {
        this.tableScene = e;
    },
    miniPokerScene: null,
    getMiniPokerSceneInstance: function() {
        return this.miniPokerScene;
    },
    setMiniPokerSceneInstance: function(e) {
        this.miniPokerScene = e;
    },
    miniThreeCardsScene: null,
    setMiniThreeCardsSceneInstance: function(e) {
        this.miniThreeCardsScene = e;
    },
    getMiniThreeCardsSceneInstance: function() {
        return this.miniThreeCardsScene;
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
    updateMoney: function(_node, firstMoney, beginMoney, endMoney) {
        if(_node instanceof cc.Label) {

            if(beginMoney >= endMoney) {
                _node.string = Common.numberFormatWithCommas(endMoney);
            } else {
                var value = Math.floor((endMoney - firstMoney) / 30);

                setTimeout(function() {
                    beginMoney = beginMoney + value;
                    if(beginMoney >= endMoney) {
                        beginMoney = endMoney;
                    }
                    _node.string = Common.numberFormatWithCommas(beginMoney);
                    this.updateMoney(_node, firstMoney, beginMoney, endMoney);
                }.bind(this), 30);
            }
        }
    },

    getOS: function() {
        var os = -1;
        if(cc.sys.isNative) {
            if(cc.sys.platform == cc.sys.ANDROID) {
                os = Common.OS.ANDROID;
            } else if(cc.sys.platform == cc.sys.IPHONE ||
                        cc.sys.platform == cc.sys.IPAD) {
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
    guid: function() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    },
    fingerprint: "",
    setFingerprint: function() {
        var fp = cc.sys.localStorage.getItem("fingerprint");
        cc.log("fp:", fp);
        cc.log("PLATFORM : ",cc.sys.platform," " ,cc.sys.IPHONE, " ", cc.sys.ANDROID);

        if(fp == null) {
            if(cc.sys.isBrowser) {
                new Fingerprint2().get(function (result, components) {
                    console.log("result:", result); //a hash, representing your device fingerprint
                    cc.sys.localStorage.setItem("fingerprint", result);
                    this.fingerprint = result;
                    console.log("component:", components); // an array of FP components
                });
            } else if(cc.sys.isNative) {
                if(cc.sys.platform == cc.sys.ANDROID){
                    var deviceId = "xxxxx";//jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getDeviceId", "()Ljava/lang/String;");
                    console.log("result:", deviceId); //a hash, representing your device fingerprint
                    cc.sys.localStorage.setItem("fingerprint", deviceId);
                    this.fingerprint = deviceId;
                }else if(cc.sys.platform == cc.sys.IPHONE || cc.sys.platform == cc.sys.IPAD){
                    var deviceId = "xxxxx";//jsb.reflection.callStaticMethod("NativeUtility", "getDeviceID");
                    console.log("result:", deviceId); //a hash, representing your device fingerprint
                    cc.sys.localStorage.setItem("fingerprint", deviceId);
                    this.fingerprint = deviceId;
                }

            }
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

    getDeviceInfo: function() {
        if(cc.sys.isNative) {
            if(cc.sys.platform == cc.sys.ANDROID){
                return "xxxxx";//jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getDeviceInfo", "()Ljava/lang/String;");
            }else if(cc.sys.platform == cc.sys.IPHONE || cc.sys.platform == cc.sys.IPAD){
                return jsb.reflection.callStaticMethod("NativeUtility", "getDeviceID");
            }

        } else {
            return this.getFingerprint();
        }
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
    getPackageName: function() {
        if(cc.sys.isNative) {
            if(cc.sys.platform == cc.sys.ANDROID){
                return "com.gamebai.tienlen";//jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getPackageNameJNI", "()Ljava/lang/String;");
            }else if(cc.sys.platform == cc.sys.IPHONE || cc.sys.platform == cc.sys.IPAD){
                console.log("PACKAGE : com.gamebai.tienlen");
                return "com.gamebai.tienlen";//jsb.reflection.callStaticMethod("NativeUtility", "getPackage");
            }
        } else {
            return "com.gamebai.tienlen";
        }

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
    timestampToDate: function (timestamp){

        var a = new Date(Number(timestamp));
        var months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
        return time;

    },

    closePopup: function (name_popup) {
        var scene = cc.director.getScene();
        if(cc.isValid(scene) && cc.isValid(scene.getChildByName(name_popup))){
            scene.getChildByName(name_popup).destroy();
        }
    },

    showPopup: function (name_popup, cb) {
        var scene = cc.director.getScene();
        if(cc.isValid(scene) && !cc.isValid(scene.getChildByName(name_popup))){
            cc.loader.loadRes("prefabs/" + name_popup,function(error, prefab) {
                if(!error){
                    var messagebox = cc.instantiate(prefab);
                    if(cc.isValid(messagebox)){
                        messagebox.x = Common.width / 2;
                        messagebox.y = Common.height / 2;

                        if(cb) {
                            cb(messagebox);
                        }

                    }
                }
            })
        }
    },

    CountUp1: function(target, startValue, endValue, decimals, duration, chartoption) {
        var options = {
            useEasing: true,
            useGrouping: true,
            separator: ".",
            decimal: ","
        };
        var startTime = null;
        var lastTime = 0;
        var rAF = null;
        var vendors = ["webkit", "moz", "ms", "o"];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame =
                window[vendors[x] + "RequestAnimationFrame"];
            window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"] || window[vendors[x] + "CancelRequestAnimationFrame"]
        }
        if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback, element) {
            var currTime = (new Date).getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                callback(currTime + timeToCall)
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id
        };
        if (!window.cancelAnimationFrame) window.cancelAnimationFrame =
            function (id) {
                clearTimeout(id)

            };
        var callback = null;
        var count = function (timestamp) {
            if (!startTime) startTime = timestamp;
            timestamp = timestamp;
            var progress = timestamp - startTime;
            var remaining =
                duration - progress;
            if (options.useEasing)
                if (countDown) frameVal = startVal - easeOutExpo(progress, 0, startVal - endVal, duration);
                else frameVal = easeOutExpo(progress, startVal, endVal - startVal, duration);
            else if (countDown) frameVal = startVal - (startVal - endVal) * (progress / duration);
            else frameVal = startVal + (endVal - startVal) * (progress / duration);
            if (countDown) frameVal = frameVal < endVal ?
                endVal : frameVal;
            else frameVal = frameVal > endVal ? endVal : frameVal;
            frameVal = Math.round(frameVal * dec) / dec;
            printValue(frameVal);
            if (progress < duration) rAF = requestAnimationFrame(count);
            else if (callback) callback()
        };

        var start = function (callback) {
            callback = callback;
            rAF = requestAnimationFrame(count);
            return false
        };
        var formatNumber = function (nStr) {
            nStr = nStr.toFixed(decimals);
            nStr += "";
            var x1;
            var x = nStr.split(".");
            x1 = x[0];
            var x2 = x.length > 1 ? options.decimal + x[1] : "";
            var rgx = /(\d+)(\d{3})/;
            if (options.useGrouping)
                while (rgx.test(x1)) x1 = x1.replace(rgx, "$1" + options.separator + "$2");
            return options.prefix + x1 + x2 + options.suffix
        };
        var FormatNumberNotFixed = function (pSStringNumber) {
            pSStringNumber += "";
            var x = pSStringNumber.split(",");
            var x1 = x[0];
            var x2 = x.length > 1 ? "," + x[1] : "";
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) x1 = x1.replace(rgx, "$1" + "." + "$2");
            return x1 + x2
        }

        for (var key in options)
            if (options.hasOwnProperty(key)) options[key] = options[key];
        if (options.separator === "") options.useGrouping = false;
        if (!options.prefix) options.prefix = "";
        if (!options.suffix) options.suffix = "";
        var startVal = Number(startValue);
        var endVal = Number(endValue);
        var countDown = startVal > endVal;
        var frameVal = startVal;
        var decimals = Math.max(0, decimals || 0);
        var dec = Math.pow(10, decimals);
        var duration = Number(duration) * 1E3 || 2E3;

        var printValue = function (value) {
            var result = !isNaN(value) ? formatNumber(value) : "0";
            if (chartoption != null && chartoption != '') {
                target.string = chartoption + FormatNumberNotFixed(result);
            } else {
                target.string = FormatNumberNotFixed(result);
            }

        };
        var easeOutExpo = function (t, b, c, d) {
            return c * (-Math.pow(2, -10 * t / d) + 1) * 1024 / 1023 + b
        };

        start();
    },

    wordWrap: function(str, maxWidth) {
        var newLineStr = "\n";
        var done = false;
        var res = '';
        do {
            var found = false;
            // Inserts new line at first whitespace of the line
            for (var i = maxWidth - 1; i >= 0; i--) {
                if (this.testWhite(str.charAt(i))) {
                    res = res + [str.slice(0, i), newLineStr].join('');
                    str = str.slice(i + 1);
                    found = true;
                    break;
                }
            }
            // Inserts new line at maxWidth position, the word is too long to wrap
            if (!found) {
                res += [str.slice(0, maxWidth), newLineStr].join('');
                str = str.slice(maxWidth);
            }

            if (str.length < maxWidth)
                done = true;
        } while (!done);

        return res + str;
    },

    testWhite: function(x) {
        var white = new RegExp(/^\s$/);
        return white.test(x.charAt(0));
    }
};
