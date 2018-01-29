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
        isProgressing: true,
        toProgress: 0,
        deltaTime : 0,
        timeSchedule: 0
    },

    // use this for initialization
    onLoad: function () {
        this._super();
        var self = this;
        cc.director.preloadScene('Login', function () {
            cc.log('Next scene preloaded');
            self.scheduleOnce(self.goGame, self.timeSchedule);
        });
    },

    update: function(dt) {
        if (this.isProgressing) {
            this.deltaTime += dt;
            this.matchProgress.progress = this.deltaTime/this.timeSchedule;
            cc.log(this.deltaTime/this.timeSchedule);
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
            if(lstMessage.length > 0) {
                var buffer = lstMessage.shift();
                this.handleMessage(buffer);
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

