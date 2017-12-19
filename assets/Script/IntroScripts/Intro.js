var MyMessage = require('initialize_pb');
var NetworkManager = require('NetworkManager');
var BaseScene = require('BaseScene');
cc.Class({
    extends: BaseScene,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        matchProgress: {
            default: null,
            type: cc.ProgressBar
        },
        isProgressing: false,
        toProgress: 0,
        deltaTime : 0,
        timeSchedule: 0,
        setting: cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
        this._super();
        cc.director.preloadScene('Lobby', function () {
            cc.log('Next scene preloaded');
        });
        this.scheduleOnce(this.goGame, this.timeSchedule);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
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
        if(event.data!==null || event.data !== 'undefined') {
            var lstMessage = NetworkManager.parseFrom(event.data, event.data.byteLength);
            cc.log("list message size:" + lstMessage.length);
            if(lstMessage.length > 0) {
                var buffer = lstMessage.shift();
                cc.log("buffer:" , buffer);
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

