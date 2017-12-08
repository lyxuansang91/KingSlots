var MyMessage = require('initialize_pb');
var NetworkManager = require('NetworkManager');

cc.Class({
    extends: cc.Component,

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
        timeSchedule: 0
    },

    // use this for initialization
    onLoad: function () {
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
        window.ws = new WebSocket("ws://kingviet.top:1280/megajackpot");
        window.listMessage = [];
        window.ws.binaryType = "arraybuffer";

        window.ws.onopen = function (event) {
            console.log("Web socket");
            setTimeout(function() {
                var message = new MyMessage.BINInitializeRequest();
                message.setCp("18");
                message.setAppversion("19");
                message.setDeviceid("00000000");
                message.setDeviceinfo("NO_DEVICE");
                message.setCountry("vn");
                message.setLanguage("vi");
                message.setPakagename("com.daigia777.gamemon");
                var data = NetworkManager.initData(message.serializeBinary(), NetworkManager.OS.ANDROID,
                    NetworkManager.MESSAGE_ID.INITIALIZE, "");
                cc.log("data:", data);
                window.ws.send(data);
            }, 1);
        };
        window.ws.onclose = function (event) {
            console.log("Websocket instance was closed");
        };
        window.ws.onmessage = this.ongamestatus.bind(this);

        setTimeout(function () {
            if(window.ws.readyState == WebSocket.OPEN) {
                cc.log("web socket is open");
            } else {
                console.log("Web socket instance wasn't ready");
            }
        }, 3);

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
        switch (buffer.message_id) {
            case NetworkManager.MESSAGE_ID.INITIALIZE:
                var msg = buffer.response;
                cc.log("message: " + msg.getMessage());
                this.initialMessageResponseHandler(msg);
                //cc.director.loadScene('Lobby');
                break;
        }
    },
    initialMessageResponseHandler: function(initialMessage) {
        cc.log("initialMessage", initialMessage);
        if (initialMessage != 0) {
            //common.initialize = initialMessage.responseCode;
            if (initialMessage.getResponsecode()) {
                var serverAppVersion = initialMessage.getCurrentappversion();
                cc.log("serverAppVersion = ", serverAppVersion);
                var hot_lines = [];
                cc.log("hot_line size", initialMessage.getHotlinesList().length);
                for (var i = 0; i < initialMessage.getHotlinesList().length; i++){
                    hot_lines.push(initialMessage.getHotlinesList()[i]);
                }

                /*Set enable game ids*/
                var _gameIds = [];
                for (var i = 0; i < initialMessage.getEnablegameidsList().length; i++) {
                    _gameIds.push(initialMessage.getEnablegameidsList()[i]);
                }

                cc.log("game id = ", _gameIds);
                cc.director.loadScene('Lobby');

            }else {
                // PopupMessageBox* popupMessage = new PopupMessageBox();
                // popupMessage.showPopup(init_response.message());
            }
        }
    }
});
