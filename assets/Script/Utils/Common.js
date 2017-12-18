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
    }
};

module.exports = Common;