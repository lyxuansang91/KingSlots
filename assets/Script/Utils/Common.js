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
        EGG: 22,
        TREASURE: 23
    },
    FACEBOOK_CHANNEL : 1,
    GOOGLE_CHANNEL : 2,
    width : cc.director.getWinSize().width,
    height : cc.director.getWinSize().height,
    origin : cc.director.getVisibleOrigin(),
    introScene: null,
    _existTaiXiu: false,
    providerLists: null,
    smsConfigLists: null,
    assetsConfigList: null,

    initLanguage: function(){
        var self = this;
        var url = cc.url.raw( 'resources/vi2.json' );
        cc.loader.load( url, function( err, res) {
            if(err === null){
                var json = JSON.stringify(res);
                self.KEYTEXT = JSON.parse(json);
            }
        });
    },

    enableCashToGold: false,
    isEnableCashToGold: function() {
        return this.enableCashToGold;
    },
    setEnableCashToGold: function(e) {
        this.enableCashToGold = e;
    },

    enableCashTransfer: false,
    isEnableCashTransfer: function() {
        return this.enableCashTransfer;
    },
    setEnableCashTransfer: function(e) {
        this.enableCashTransfer = e;
    },

    enableGiftCode: false,
    isEnableGiftCode: function() {
        return this.enableGiftCode;
    },
    setEnableGiftCode: function(e) {
        this.enableGiftCode = e;
    },
    enablePurchaseCash: false,
    isEnablePurchaseCash: function() {
        return this.enablePurchaseCash;
    },
    setEnablePurchaseCash: function(e) {
        this.enablePurchaseCash = e;
    },
    enableTopUp: false,
    isEnableTopup: function() {
        return this.enableTopUp;
    },
    setEnableTopup: function(e) {
        this.enableTopUp = e;
    },
    isExistTaiXiu: function() {
        return this._existTaiXiu;
    },
    setExistTaiXiu: function(e) {
        this._existTaiXiu = e;
    },
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
            } else {
                if(cc.sys.platform === cc.sys.ANDROID){
                    var deviceId = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getDeviceId", "()Ljava/lang/String;");
                    console.log("result:", deviceId); //a hash, representing your device fingerprint
                    cc.sys.localStorage.setItem("fingerprint", deviceId);
                    this.fingerprint = deviceId;
                }else if(cc.sys.platform === cc.sys.IPHONE || cc.sys.platform === cc.sys.IPAD){
                    var deviceId = "xxxxx";//jsb.reflection.callStaticMethod("NativeUtility", "getDeviceID");
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
            if(cc.sys.platform === cc.sys.ANDROID){
                return "xxxxx";//jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getDeviceInfo", "()Ljava/lang/String;");
            }else if(cc.sys.platform === cc.sys.IPHONE || cc.sys.platform === cc.sys.IPAD){
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
            case Config.TAG_GAME_ITEM.TREASURE:
                result = Common.ZONE_ID.TREASURE;
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
        this.gameTag = gameTag;
    },
    GameTag: function() {
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
    genRandomNumber: function (startValue,endValue,count) {
        var results = [];
        do {
            var number = Math.floor(Math.random() * 7) + 98;
            results.push(number);
        }

        while (results.length < count);
        return results;
    },
    genRandomCardNumber: function (arrCard, stepCard, number) {
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
    genArrayToMultiArray: function (values, stepMove, number) {
        var i, j, k = 0,results = [];
        for(i = 0; i < stepMove; i++){
            results[i]= new Array(number);
            for(j = 0; j < number;j++){
                results[i][j] = values[k++];
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
        if (this.displayName === ""){
            return getUserName();
        }
        return this.displayName;
    },
    getUserId: function() {
        return this.userInfo.userid;
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
            cc.log("getPackageName");
            if(cc.sys.platform == cc.sys.ANDROID){
                cc.log("getPackageName ANDROID");
                var packageName = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getPackageNameJNI", "()Ljava/lang/String;");
                cc.log("package name:", packageName);
                return packageName;
            }else if(cc.sys.platform == cc.sys.IPHONE || cc.sys.platform == cc.sys.IPAD){
                return "com.bigbingo.club.ultimate";//jsb.reflection.callStaticMethod("NativeUtility", "getPackage");
            }
        } else {
            return "com.bigbingo.club.ultimate";
        }
    },
    getCp: function() {
        return "11";
    },
    getVersionCode: function() {
        if(cc.sys.isNative) {
            if(cc.sys.platform == cc.sys.ANDROID) {
                var versionCode = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getVersionCodeJNI", "()Ljava/lang/String;");
                cc.log("version Code:", versionCode);
                return versionCode;
            }
        }
        return "2";

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
    convertIntToMoneyView: function (value) {
        var i = 0;
        var end = [ "", "K", "M", "B" ];
        while (value >= 1000){
            value = value/1000;
            i++;
        }
        return value + end[i];
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
    _miniGameZoneIds: [],
    openMinigame: function(miniGameZoneId){
        if (!this._miniGameZoneIds.includes(miniGameZoneId)){
            this._miniGameZoneIds.push(miniGameZoneId);
        }
    },

    closeMinigame: function(miniGameZoneId){
        if (this._miniGameZoneIds.length != 0){
            for (var i = 0; i < this._miniGameZoneIds.length; i++){
                if (this._miniGameZoneIds[i] == miniGameZoneId){
                    this._miniGameZoneIds.splice(i, 1);
                    // this._miniGameZoneIds.erase(_miniGameZoneIds.begin() + i);
                    break;
                }
            }
        }
    },

    getMiniGameZoneIds: function(){
        return this._miniGameZoneIds;
    },

    clearMiniGame: function(){
        this._miniGameZoneIds = [];
    },

    setHeadLineEmergency: function (message) {
        this.headLineEmergency = message;
    },

    getHeadLineEmergency: function () {
        return this.headLineEmergency;
    },

    setNotificationEmergency: function (message) {
        this.notifycationEmergency = message;
    },

    getNotificationEmergency: function () {
        return this.notifycationEmergency;
    },

    timestampToDate: function (timestamp){

        var a = new Date(Number(timestamp));

        var d = a.getDate();
        var m = a.getMonth() + 1;
        var y = a.getFullYear();
        var hour = a.getHours();
        var min = a.getMinutes();

        var dateString = (d <= 9 ? '0' + d : d) + '/' + (m <= 9 ? '0' + m : m) + '/' + y;

        return hour + ':' + min + ' ' + dateString;
    },

    timeToDate: function (timestamp){

        var a = new Date(Number(timestamp));

        var d = a.getDate();
        var m = a.getMonth() + 1;
        var y = a.getFullYear();

        var dateString = (d <= 9 ? '0' + d : d) + '/' + (m <= 9 ? '0' + m : m) + '/' + y;

        return dateString;
    },

    closePopup: function (name_popup) {
        var scene = cc.director.getScene();
        if(cc.isValid(scene) && cc.isValid(scene.getChildByName(name_popup))){
            scene.getChildByName(name_popup).destroy();
        }
    },
    showPopupMessageBox: function() {
        var self = this;
        var scene = cc.director.getScene();
        var self = this;
        if(cc.isValid(scene)){
            if(!cc.isValid(scene.getChildByName(Config.name.POPUP_MESSAGE_RECONNECT))) {
                cc.loader.loadRes("prefabs/" + Config.name.POPUP_MESSAGE_RECONNECT, function (error, prefab) {
                    if (!error) {
                        var popup = cc.instantiate(prefab);
                        if (cc.isValid(popup) && cc.isValid(scene)) {
                            popup.x = Common.width / 2;
                            popup.y = Common.height / 2;
                            var namePopup = Config.name.POPUP_MESSAGE_RECONNECT.toString();
                            var component = popup.getComponent(namePopup);
                            component.setNamePopup(Config.name.POPUP_MESSAGE_RECONNECT);
                            scene.addChild(popup, Config.index.POPUP);
                            self.message_box = component;
                            self.message_box.init("Bạn bị đứt kết nối, bạn có muốn kết nối lại không?", Config.COMMON_POPUP_TYPE.MESSAGE_BOX.CONFIRM_TYPE, function() {
                                cc.director.loadScene('IntroScene');
                                Common.tryReconnect = false;
                            });
                            self.message_box.appear();

                        }
                    } else {
                        cc.log("Lỗi load popup,thêm popup vào resources.");
                    }
                })
            } else {
                self.message_box.appear();
            }
        }
    },

    showPopup: function (name_popup, cb) {
        var scene = cc.director.getScene();
        if(cc.isValid(scene) && !cc.isValid(scene.getChildByName(name_popup))){
            cc.loader.loadRes("prefabs/" + name_popup,function(error, prefab) {
                if(!error){
                    var popupSet = cc.instantiate(prefab);
                    if(cc.isValid(popupSet) && cc.isValid(scene)){
                        popupSet.x = Common.width / 2;
                        popupSet.y = Common.height / 2;
                        if(cb) {
                            var compSet = popupSet.getComponent(name_popup);
                            compSet.setNamePopup(name_popup);
                            cb(compSet);
                            scene.addChild(popupSet,Config.index.POPUP);
                        }
                    }
                }else{
                    cc.log("Lỗi load popup,thêm popup vào resources.");
                }
            })
        }
    },

    setPrefs: function (key,value) {
        cc.log("key =", key);
        cc.log("value =", value);
        cc.sys.localStorage.setItem(key,value);
    },

    getPrefs: function (key) {
        return cc.sys.localStorage.getItem(key);
    },

    countNumberAnim: function(target, startValue, endValue, decimals, duration, chartoption) {
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

        var start = function () {
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

    convertAlias : function (alias) {
        var str = alias;
        //str = str.toLowerCase();
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a");
        str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g,"A");

        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e");
        str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g,"E");

        str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i");
        str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g,"I");

        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o");
        str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g,"Ơ");

        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u");
        str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g,"U");

        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y");
        str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g,"Y");

        str = str.replace(/đ/g,"d");
        str = str.replace(/Đ/g,"D");

        str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|`|-|{|}|\||\\/g," ");
        str = str.replace(/ + /g," ");
        str = str.trim();

        return str;
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
    },

    isWhiteSpaceText: function(text) {
        for(var i = 0; i < text.length; i++){
            if(this.testWhite(text.charAt(i))){
                return true;
            }
        }

        return false;
    },

    rgbToHex: function (r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },

    textColor : function (message,color) {
        return "<color=" + this.rgbToHex(color.r,color.g,color.b) + ">" + message + "</color> ";
    },

    getHeadHistory: function (historyType) {
        var currZoneId = this.getZoneId();
        switch(currZoneId){
            case Config.TAG_GAME_ITEM.MINI_BACAY:
                if(historyType === 1){
                    return ["Thời gian","Phiên", "Đặt", "Thắng", "Chi tiết"];
                }else{
                    return ["Thời gian","Tên", "Đặt", "Thắng", "Chi tiết"];
                }

                break;
            case Config.TAG_GAME_ITEM.MINI_POKER:
                if(historyType === 1){
                    return ["Thời gian","Phiên", "Đặt", "Thắng", "Chi tiết"];
                }else{
                    return ["Thời gian","Tên", "Đặt", "Thắng", "Chi tiết"];
                }
                break;
            case Config.TAG_GAME_ITEM.TREASURE:
                if(historyType === 1){
                    return ["Thời gian","Phiên", "Đặt", "Thắng", "Chi tiết"];
                }else{
                    return ["Thời gian","Tên", "Đặt", "Thắng", "Chi tiết"];
                }
                break;
            case Config.TAG_GAME_ITEM.TAIXIU:
                if(historyType === 1){
                    return ["Phiên", "Thời gian", "Đặt tài", "Đặt xỉu", "Hoàn tài", "Hoàn xỉu", "Kết quả", "Tiền thắng"];
                }else{
                    return ["Thời gian", "Tên", "Đặt tài", "Đặt xỉu", "Hoàn tài", "Hoàn xỉu", "Tiền thắng"];
                }
                break;
        }
    },

    showToast: function (strMess, delayTime) {
        if(strMess == ""){
            return;
        }

        var delay = (delayTime !== undefined) ? delayTime : 2;

        var scene = cc.director.getScene();
        if(cc.isValid(scene)){
            if(!cc.isValid(scene.getChildByName("Toast"))){
                cc.loader.loadRes("prefabs/Toast",function(error, prefab) {
                    if(!error){
                        var toast_prefab = cc.instantiate(prefab);
                        if(cc.isValid(toast_prefab)){
                            toast_prefab.x = Common.width / 2;
                            toast_prefab.y = Common.height / 2;

                            var toast = toast_prefab.getComponent("Toast");
                            toast.loadMessage(strMess,delay);
                            scene.addChild(toast_prefab,Config.index.LOADING);
                        }
                    }
                })
            }else{
                var toast = scene.getChildByName("Toast").getComponent("Toast");
                toast.loadMessage(strMess,delay);
            }
        }
    },

    openRules: function () {
        var tabString = ["Mini Poker", "Mini Ba Cây", "Tài xỉu", "Treasure"];
        Common.showPopup(Config.name.POPUP_WEBVIEW,function(popup) {
            popup.addTabs(tabString, 1);
            popup.appear();
        });

    },
    new_phone: "",
    getNewPhone: function(){
        return this.new_phone;
    },
    setNewPhone: function(new_phone){
        this.new_phone = new_phone;
    },
    getPointName: function (point, zoneId) {
        var A2_10JQK = 'NAN,A,2,3,4,5,6,7,8,9,10,J,Q,K'.split(',');
        if(zoneId === Config.TAG_GAME_ITEM.MINI_POKER){
            A2_10JQK = 'NAN,2,3,4,5,6,7,8,9,10,J,Q,K,A'.split(',');
        }
        return A2_10JQK[point];
    },
    getSuitName: function (suit, zoneId) {
        var Suit = cc.Enum({
            Spade: 1,
            Heart: 3,
            Club: 2,
            Diamond: 0,
        });
        if(zoneId === Config.TAG_GAME_ITEM.MINI_POKER){
            Suit = cc.Enum({
                Spade: 1,
                Heart: 0,
                Club: 2,
                Diamond: 3,
            });
        }

        return Suit[suit];
    },
    isBlackSuit: function (suit, zoneId) {
        var Suit = cc.Enum({
            Spade: 1,
            Heart: 3,
            Club: 2,
            Diamond: 0,
        });
        if(zoneId === Config.TAG_GAME_ITEM.MINI_POKER){
            Suit = cc.Enum({
                Spade: 1,
                Heart: 0,
                Club: 2,
                Diamond: 3,
            });

        }
        return suit === Suit.Spade || suit === Suit.Club;
    },
    isRedSuit: function (suit, zoneId) {
        var Suit = cc.Enum({
            Spade: 1,
            Heart: 3,
            Club: 2,
            Diamond: 0,
        });
        if(zoneId === Config.TAG_GAME_ITEM.MINI_POKER){
            Suit = cc.Enum({
                Spade: 1,
                Heart: 0,
                Club: 2,
                Diamond: 3,
            });

        }
        return suit === Suit.Heart || suit === Suit.Diamond;
    },
    openIdConnectRequest: function(channel) {
        switch (channel) {
            case Common.FACEBOOK_CHANNEL:
                this.loginFacebook();
                break;
            case Common.GOOGLE_CHANNEL:
                this.loginGoogle();
                break;
            default:
                break;
        }
    },
    loginFacebook: function() {
        if(cc.sys.platform === cc.sys.isNative) {
            sdkbox.PluginFacebook.login();
        }else if(cc.sys.isBrowser){
            window.loginFb(["public_profile"], function(code, response){
                if(code === 0){
                    cc.log("login succeeded", response);
                    var userID = response.userID;
                    var accessToken = response.accessToken;
                    console.log(userID,accessToken);

                    if (accessToken !== null) {
                        NetworkManager.getOpenIdLoginMessageFromServer(
                            1, userID + ";" + accessToken, "", "");

                    }else {
                        this.loginFacebook();
                    }

                } else {
                    cc.log("Login failed, error #" + code + ": " + response);
                }
            });
        }

    },
    inMiniGame: function(zoneId) {
        return (zoneId === Common.ZONE_ID.TAIXIU || zoneId === Common.ZONE_ID.MINI_POKER
            || zoneId === Common.ZONE_ID.MINI_BACAY || zoneId === Common.ZONE_ID.TREASURE);
    }
};
