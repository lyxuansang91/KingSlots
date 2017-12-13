var Common = {
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
        if(fp == null) {
            new Fingerprint2().get(function(result, components){
                console.log("result:", result); //a hash, representing your device fingerprint
                cc.sys.localStorage.setItem("fingerprint", result);
                this.fingerprint = result;
                console.log("component:", components); // an array of FP components
            });
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