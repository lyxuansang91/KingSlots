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

    },

    update: function(dt) {
        this.onGameEvent();
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
        this.unschedule(this.goGame);
    },
    onGameEvent: function() {

        if(window.listMessage.length > 0) {
            var buffer = window.listMessage[0];
            var result = this.handleMessage(buffer);
            if(result) {
                window.listMessage.shift();
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

