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
        this.onGameEvent();
    },
    goGame: function() {
        Common.setFingerprint();
        NetworkManager.connectNetwork();
        this.unschedule(this.goGame);
    },
    onGameEvent: function() {
        var self = this;

        NetworkManager.checkEvent(function(buffer) {
            cc.log("buffer:", buffer);
            return self.handleMessage(buffer);
        });
    },

    handleMessage: function(buffer) {
        return this._super(buffer);
    },
    openPopup: function() {
        this.addChild(this.setting);
    }
});

