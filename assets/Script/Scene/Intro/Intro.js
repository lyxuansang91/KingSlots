var MyMessage = require('initialize_pb');
var NetworkManager = require('NetworkManager');
var BaseScene = require('BaseScene');

cc.Class({
    extends: BaseScene,

    properties: {
        matchProgress: {
            default: null,
            type: cc.ProgressBar
        },
        isProgressing: false,
        toProgress: 0,
        deltaTime : 0,
        timeSchedule: 0
    },

    // use this for initialization
    onLoad: function () {
        cc.log('intro load');
        this._super();
        var self = this;
        cc.director.preloadScene('Login', function () {
            cc.log('Next scene preloaded');
            self.scheduleOnce(self.goGame, self.timeSchedule);
        });

        Common.initLanguage();
    },

    update: function(dt) {
        if (this.isProgressing) {
            this.deltaTime += dt;
            this.matchProgress.progress = this.deltaTime/this.timeSchedule;
            if (this.deltaTime > this.timeSchedule) {
                this.deltaTime = 0;
                this.isProgressing = false;
            }
        }
    },
    goGame: function() {
        Common.setFingerprint();
        NetworkManager.connectNetwork();
        window.ws.onmessage = this.ongamestatus.bind(this);
        this.unschedule(this.goGame);
    },
    ongamestatus: function(event) {
        cc.log("response text msg:" + event);
        if(event.data!==null || typeof(event.data) !== 'undefined') {
            var lstMessage = NetworkManager.parseFrom(event.data, event.data.byteLength);
            cc.log("length =", lstMessage.length);
            if(lstMessage.length > 0) {
                for(var i = 0; i < lstMessage.length; i++){
                    var buffer = lstMessage[i];
                    this.handleMessage(buffer);
                }
            }
        }
    },
    handleMessage: function(buffer) {
        this._super(buffer);
    },
    openPopup: function() {
        this.addChild(this.setting);
    }
});

