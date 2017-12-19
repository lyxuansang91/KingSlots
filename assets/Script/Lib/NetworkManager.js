var InitializeMessage = require('initialize_pb');
var LoginMessage = require('login_pb');
var EnterZoneMessage = require('enter_zone_pb');

var NetworkManager = {
    MESSAGE_ID: {
        REGISTER: 1000,
        LOGIN: 1001,
        QUICK_PLAY: 1002,
        INITIALIZE: 1111,
        PING: 8888,
        ENTER_ZONE: 1005
    },
    OS : {
       ANDROID: 1,
        IOS: 2
    },
    URL: "ws://192.168.0.32:1280/megajackpot",
    sessionId: "",
    getSessionId: function() {
        return NetworkManager.sessionId;
    },
    setSessionId: function(_sessionId) {
        NetworkManager.sessionId = _sessionId;
    },
    requestMessage: function(request, os, message_id, session_id) {
        var ackBuf = NetworkManager.initData(request, os, message_id, session_id);
        NetworkManager.callNetwork(ackBuf);
    }, 
    initData: function(request, os, messid, _session) {
        var lenSession = 0;
        if(_session != null) {
            lenSession = _session.length;
        }

        var size = request.length + 9 + lenSession;


        var _offset = 0;
        var bb = new ByteBuffer(size);
        bb.writeUint8(os, _offset);

        var dataSize = request.length + 4;
        _offset++;

        // cc.log("size:" + size);

        bb.writeUint32(dataSize, _offset);
        _offset+= 4;


        bb.writeUint16(lenSession, _offset);
        _offset+= 2;

        var sessionByte = bb.writeUTF8String(_session, _offset);
        _offset+= lenSession;

        bb.writeUint16(messid, _offset);
        _offset+= 2;

        bb.append(request, "", _offset);

        return bb.toBuffer();
    },

    getTypeMessage: function(msg, messageid, protoBufVar) {
        var bytes = new Uint8Array(protoBufVar.toArrayBuffer());
        switch (messageid) {
            case NetworkManager.MESSAGE_ID.INITIALIZE:
                msg = proto.BINInitializeResponse.deserializeBinary(bytes);
                break;
            case NetworkManager.MESSAGE_ID.LOGIN:
                msg = proto.BINLoginResponse.deserializeBinary(bytes);
                break;
            case NetworkManager.MESSAGE_ID.REGISTER:
                break;
            case NetworkManager.MESSAGE_ID.PING:
                msg = proto.BINPingResponse.deserializeBinary(bytes);
                break;
            case NetworkManager.MESSAGE_ID.ENTER_ZONE:
                msg = proto.BINEnterZoneResponse.deserializeBinary(bytes);
                break;
        }

        return msg;
    },
    parseFrom: function(read_str, len) {
        var lstMess = [];
        var bb = new ByteBuffer(len);
        bb.append(read_str);
        // cc.log("bb parse form = ", bb);
        var lenPacket = len;
        // cc.log("len:", len);
        while (lenPacket > 0) {
            var listMessages = [];
            var _offset = 0;
            var bytes_size = bb.readInt32(_offset);
            _offset+= 4;

            //read compress
            var is_compress = bb.readInt8(_offset);


            cc.log("is_compress:", is_compress);

            _offset+= 1;

            var left_byte_size = bytes_size - 1;
            lenPacket -= (bytes_size + 4);
            var response = 0;

            bb = bb.copy(_offset);

            /*if is_compress = 1 */
            if (is_compress == 1) {
                // var left_block = bb.copy(_offset);
                var byteArray = new Uint8Array(bb);
                var bufArr = bb.view;

                var dataUnzip = cc.unzipBase64AsArray(bb.toString('base64'));
                var _offsetZip = 0;
                var bbZip = new ByteBuffer(dataUnzip.length);

                bbZip.append(dataUnzip, "", 0);


                var data_size_block_zip = bbZip.readInt16(_offsetZip);
                _offsetZip+= 2;


                // read messageid

                var messageidZip = bbZip.readInt16(_offsetZip);
                _offsetZip+= 2;


                left_byte_size -= (data_size_block_zip + 2);

                //read protobuf


                var protoBufVarZip = bbZip.copy(_offsetZip, data_size_block_zip + _offsetZip - 2);

                response = NetworkManager.getTypeMessage(response, messageidZip, protoBufVarZip);


                if (response !== 0) {
                    left_byte_size -= (data_size_block_zip + 2);
                    var pairZip = {
                        message_id: messageidZip,
                        response: response
                    };

                    for(var i = 0; i < listMessages.length; i++) {
                        var obj = listMessages[i];

                        if(obj.message_id === messageidZip) {
                            listMessages.splice(i, 1);
                        }
                    }

                    listMessages.push(pairZip);

                    lstMess.push(pairZip);

                }
                else {
                    cc.error("unknown message");
                }
            }
            else {

                while (left_byte_size > 0) {

                    //read protobuf + data_size_block + mid
                    //read datasizeblock
                    cc.log("left byte size:", left_byte_size);

                    var _offsetUnzip = 0;


                    var data_size_block = bb.readInt16(_offsetUnzip);
                    cc.log("data size block:", data_size_block);
                    _offsetUnzip+= 2;

                    // read messageid
                    var messageid = bb.readInt16(_offsetUnzip);
                    _offsetUnzip += 2;
                    cc.log("message id:", messageid);
                    //read protobuf

                    var protoBufVar = bb.copy(_offsetUnzip, data_size_block + _offsetUnzip - 2);

                    response = NetworkManager.getTypeMessage(response, messageid, protoBufVar);

                    if (response != 0) {
                        left_byte_size -= (data_size_block + 2);
                        bb = bb.copy(data_size_block + _offsetUnzip - 2);

                        var pair = {
                            message_id: messageid,
                            response: response
                        };

                        for(var i = 0; i < listMessages.length; i++) {
                            var obj = listMessages[i];

                            if(obj.message_id == messageid) {
                                listMessages.splice(i, 1);
                            }
                        }

                        listMessages.push(pair);

                        lstMess.push(pair);

                    }
                    else {
                        cc.error("unknown message");
                        left_byte_size -= (data_size_block + 2);
                        bb = bb.copy(data_size_block + _offsetUnzip - 2);
                    }

                }
            }
        }

        if (lenPacket > 0) {
            cc.log("NetworkManager: error packet length = 0");
        }

        // cc.log("listMessages parse", listMessages);
        return lstMess;

    }, // init message
    initInitializeMessage: function(cp, appVersion, deviceId, deviceInfo, country, language, packageName,
                                       liteVersion, referenceCode) {
        var message = new InitializeMessage.BINInitializeRequest();
        message.setCp(cp);
        message.setAppversion(appVersion);
        message.setDeviceid(deviceId);
        message.setDeviceinfo(deviceInfo);
        message.setCountry(country);
        message.setLanguage(language);
        message.setPakagename(packageName);
        message.setLiteversion(liteVersion);
        message.setReferencecode(referenceCode);
        return message;
    },
    requestInitializeMessage: function(cp, appVersion, deviceId, deviceInfo, country, language, packageName,
                                       liteVersion, referenceCode) {
        var message = NetworkManager.initInitializeMessage(cp, appVersion, deviceId, deviceInfo, country, language,
            packageName, liteVersion, referenceCode);
        var data = NetworkManager.initData(message.serializeBinary(), NetworkManager.OS.ANDROID, NetworkManager.MESSAGE_ID.INITIALIZE, "");
        NetworkManager.callNetwork(data);
    }, initLoginMessage: function(userName, password) {
        var message = new proto.BINLoginRequest();
        message.setUsername(userName);
        message.setPassword(password);
        return message;
    }, requestLoginMessage: function(userName, password){
        const message = NetworkManager.initInitializeMessage(userName, password);
        this.callNetwork(this.initData(message.serializeBinary(), NetworkManager.OS.ANDROID, NetworkManager.MESSAGE_ID.LOGIN, ""));
    },

    initPingMessage: function(disconnectTime) {
        var message = new proto.BINPingRequest();
        message.setDisconecttime(disconnectTime);
        return message;
    },
    requestPingMessage: function(disconnectTime) {
        var message = NetworkManager.initPingMessage(disconnectTime);
        this.callNetwork(this.initData(message.serializeBinary(), NetworkManager.OS.ANDROID, NetworkManager.MESSAGE_ID.PING, ""));
    },
    initEnterZoneMessage: function(zoneId) {
        var message = new proto.BINEnterZoneRequest();
        message.setZoneid(zoneId);
        return message;
    },
    requestEnterZoneMessage: function(zoneId) {
        var message = NetworkManager.initEnterZoneMessage(zoneId);
        cc.log("message = ", message);
        this.callNetwork(this.initData(message.serializeBinary(), NetworkManager.OS.ANDROID, NetworkManager.MESSAGE_ID.ENTER_ZONE, Common.getSessionId()));
    },
    connectNetwork: function() {
        if(window.ws === null || typeof(window.ws) === 'undefined' || window.ws.readyState === WebSocket.CLOSED) {

            window.ws = new WebSocket(NetworkManager.URL);
            window.listMessage = [];
            window.ws.binaryType = "arraybuffer";

            window.ws.onopen = function (event) {
                console.log("on web socket");
                NetworkManager.requestInitializeMessage("24", "14", Common.getFingerprint(), Common.getFingerprint(), "vn", "vi", "com.gamebai.tienlen", false, "");
                setTimeout(function(){
                    setInterval(function(){
                        NetworkManager.requestPingMessage(0);
                    }, 15000);

                }, 1);
            };
            window.ws.onclose = function (event) {
                console.log("Websocket instance was closed");
            };
        }
    },
    closeConnection: function() {
        if(window.ws.readyState == WebSocket.OPEN) {
            window.ws.close();
        }
    },

    callNetwork: function(ackBuf) {
        if(window.ws === null || typeof(window.ws) === 'undefined' || window.ws.readyState === WebSocket.CLOSED) {

            window.ws = new WebSocket(NetworkManager.URL);
            window.listMessage = [];
            window.ws.binaryType = "arraybuffer";

            window.ws.onopen = function (event) {
                console.log("on web socket");
                setTimeout(function(){
                    window.ws.send(ackBuf);
                }, 1);
            };
            window.ws.onclose = function (event) {
                console.log("Websocket instance was closed");
            };
        } else {
            cc.log("web socket state:", window.ws.readyState, " ", WebSocket.OPEN);
            if(window.ws.readyState == WebSocket.OPEN) {
                window.ws.send(ackBuf);
            }
        }
    }
};

module.exports = NetworkManager;