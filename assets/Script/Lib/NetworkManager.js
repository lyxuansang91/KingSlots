var InitializeMessage = require('initialize_pb');
var LoginMessage = require('login_pb');
var EnterZoneMessage = require('enter_zone_pb');
var RegisterMessage = require('register_pb');
var NotificationMessage = require('notification_pb');

var NetworkManager = {
    MESSAGE_ID: {
        REGISTER: 1000,
        LOGIN: 1001,
        QUICK_PLAY: 1002,
        OPEN_ID_LOGIN: 1003,
        LOGOUT: 1004,
        ENTER_ZONE: 1005,
        FILTER_ROOM: 1006,
        CREATE_ROOM: 1007,
        ENTER_ROOM: 1008,
        PLAYER_ENTER_ROOM: 1009,
        START_MATCH: 1010,
        TURN: 1011,
        EXIT_ROOM: 1012,
        PLAYER_EXIT_AFTER_MATCH_END: 1013,
        PLAYER_EXIT_ROOM: 1014,
        ROOM_OWNER_CHANGED: 1015,
        MATCH_BEGIN: 1016,
        MATCH_END: 1017,
        UPDATE_MONEY: 1018,
        PREPARE_NEW_MATCH: 1019,
        CANCEL_EXIT_AFTER_MATCH_END: 1020,
        READY_TO_PLAY: 1021,
/** The Constant LOCK_ROOM. */
        LOCK_ROOM: 1022,
/** The Constant KICK_PLAYER_OUT. */
        KICK_PLAYER_OUT: 1023,
/** The Constant CHANGE_RULE. */
        CHANGE_RULE: 1024,
/** The Constant SEND_TEXT_EMOTICON. */
        SEND_TEXT_EMOTICON: 1025,
/** The Constant ENTER_ROOM_GROUP. */
        ENTER_ROOM_GROUP: 1026,
/** The Constant LOOK_UP_USER_TO_INVITE. */
        LOOK_UP_USER_TO_INVITE: 1027,
/** The Constant INVITE_TO_ROOM. */
        INVITE_TO_ROOM: 1028,
/** The Constant RELY_INVITATION. */
        RELY_INVITATION: 1029,
/** The Constant CANCEL_INVITATION. */
        CANCEL_INVITATION: 1030,
/** The Constant BET. */
        BET: 1031,
        EXIT_ZONE: 1032,
/** The Constant CHANGE_HOST. */
        CHANGE_HOST: 1033,
/** The Constant EXTRA_BET. */
        EXTRA_BET: 1034,
/** The Constant HOST_REGISTRATION. */
        HOST_REGISTRATION: 1035,
/** The Constant LOOK_UP_GAME_HISTORY. */
        LOOK_UP_GAME_HISTORY: 1036,
        LOOK_UP_ROOM: 1037,

/** The Constant UPDATE_USER_INFO. */
// Other Message from 1200
        UPDATE_USER_INFO: 1200,
/** The Constant FILTER_TOP_USER. */
        FILTER_TOP_USER: 1201,
/** The Constant FILTER_MAIL. */
        FILTER_MAIL: 1202,
/** The Constant SEND_MAIL. */
        SEND_MAIL: 1203,
/** The Constant DELETE_MAIL. */
        DELETE_MAIL: 1204,
/** The Constant READED_MAIL. */
        READED_MAIL: 1205,
/** The Constant CLAIM_ATTACH_ITEM. */
        CLAIM_ATTACH_ITEM: 1206,
/** The Constant FILTER_FRIEND. */
        FILTER_FRIEND: 1207,
/** The Constant ADD_FRIEND. */
        ADD_FRIEND: 1208,
/** The Constant FILTER_ADD_FRIEND. */
        FILTER_ADD_FRIEND: 1209,
/** The Constant APPROVE_ADD_FRIEND. */
        APPROVE_ADD_FRIEND: 1210,
/** The Constant FIND_USER. */
        FIND_USER: 1211,
/** The Constant VIEW_USER_INFO. */
        VIEW_USER_INFO: 1212,
/** The Constant REMOVE_FRIEND. */
        REMOVE_FRIEND: 1213,
/** The Constant LOCK_UP_MONEY_HISTORY. */
        LOCK_UP_MONEY_HISTORY: 1214,
/** The Constant INSTANT_MESSAGE. */
        INSTANT_MESSAGE: 1215,
/** The Constant UPDATE_USER_SETTING. */
        UPDATE_USER_SETTING: 1216,
/** The Constant PURCHASE_MONEY. */
        PURCHASE_MONEY: 1217,
/** The Constant FILTER_AVATAR. */
        FILTER_AVATAR: 1218,
/** The Constant LEVEL_UP. */
        LEVEL_UP: 1219,
/** The Constant MEDAL_UP. */
        MEDAL_UP: 1220,
/** The Constant REDEEM_GIFT_CODE. */
        REDEEM_GIFT_CODE: 1221,
/** The Constant REDEEM_GIFT_CODE_HISTORY. */
        REDEEM_GIFT_CODE_HISTORY: 1222,
/** The Constant ASSET_CONFIG. */
        ASSET_CONFIG: 1223,
/** The Constant EXCHANGE_ASSET. */
        EXCHANGE_ASSET: 1224,
/** The Constant EXCHANGE_CASH_TO_GOLD. */
        EXCHANGE_CASH_TO_GOLD: 1225,
/** The Constant EXCHANGE_ASSET_HISTORY. */
        EXCHANGE_ASSET_HISTORY: 1226,
/** The Constant PURCHASE_CASH_HISTORY. */
        PURCHASE_CASH_HISTORY: 1227,
/** The Constant EXCHANGE_GOLD_HISTORY. */
        EXCHANGE_GOLD_HISTORY: 1228,
/** The Constant SMS_CONFIG. */
        SMS_CONFIG: 1229,
/** The Constant CARD_CONFIG. */
        CARD_CONFIG: 1230,
/** The Constant USER_VERIFY_CONFIG. */
        USER_VERIFY_CONFIG: 1231,
/** The Constant USER_VERIFY. */
        USER_VERIFY: 1232,
/** The Constant FIND_USER_BY_ID. */
        FIND_USER_BY_ID: 1233,
/** The Constant CASH_TRANSFER_CONFIG. */
        CASH_TRANSFER_CONFIG: 1234,
/** The Constant CASH_TRANSFER. */
        CASH_TRANSFER: 1235,
/** The Constant EXCHANGE_C2G_CONFIG. */
        EXCHANGE_C2G_CONFIG: 1236,
/** The Constant LUCKY_WHEEL_CONFIG. */
        LUCKY_WHEEL_CONFIG: 1237,
/** The Constant BUY_TURN. */
        BUY_TURN: 1238,
/** The Constant JAR. */
        JAR: 1239,
/** The Constant BUY_CHIP. */
        BUY_CHIP: 1240,

/** The Constant IAP_CONFIG. */
        IAP_CONFIG: 1241,

/** The Constant COMPLETE_IAP. */
        COMPLETE_IAP: 1242,

/** The Constant GOLD_CONFIG. */
        GOLD_CONFIG: 1243,

/** The Constant PURCHASE_GOLD. */
        PURCHASE_GOLD: 1244,

/** The Constant USER_STATUS. */
        USER_STATUS: 1245,

/** The Constant AGENT. */
        AGENT: 1246,

/** The Constant ADS_BONUS_CONFIG. */
        ADS_BONUS_CONFIG: 1247,

/** The Constant ADS_BONUS. */
        ADS_BONUS: 1248,

/** The Constant ZONE_STATUS. */
        ZONE_STATUS: 1249,

/** The Constant LOCK_MONEY. */
        LOCK_MONEY: 1250,

/** The Constant UNLOCK_MONEY. */
        UNLOCK_MONEY: 1251,

/** The Constant QUEST_INFO. */
        QUEST_INFO: 1252,

/** The Constant CLAIM_QUEST_BONUS. */
        CLAIM_QUEST_BONUS: 1253,

/** The Constant OPEN_ID_CONNECT. */
        OPEN_ID_CONNECT: 1254,

/** The Constant INSTANT_MESSAGE_HISTORY. */
        INSTANT_MESSAGE_HISTORY: 1255,

        QUEST_NOTIFICATION: 1256,

        PAYMENT_STATUS: 1257,
//
/** The Constant KILL_ROOM. */
// admin message
        KILL_ROOM: 1300,

/** The Constant APPROVE_EXCHANGE_ASSET. */
        APPROVE_EXCHANGE_ASSET: 1301,

        CHARGING_DEVICE_REGISTRATION: 1302,

        CHARGING_INFO: 1303,

        CHARGING_RESULT: 1304,

        AGENT_ACCOUNT_BALANCE: 1305,
/** The Constant INITIALIZE. */
// special message
        INITIALIZE: 1111,
/** The Constant HEAD_LINE. */
        HEAD_LINE: 2222,
/** The Constant EMERGENCY_NOTIFICATION. */
        EMERGENCY_NOTIFICATION: 3333,
/** The Constant COUNT_DOWN. */
        COUNT_DOWN: 4444,
/** The Constant CAPTCHA. */
        CAPTCHA: 5555,
/** The Constant CLOSE_CONNECTION. */
        CLOSE_CONNECTION: 6666,
/** The Constant RESET_PASSWORD. */
        RESET_PASSWORD: 7777,
/** The Constant PING. */
        PING: 8888,
/** The Constant EXPIRED_SESSION. */
        EXPIRED_SESSION: 9999
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
                msg = proto.BINRegisterResponse.deserializeBinary(bytes);
                break;
            case NetworkManager.MESSAGE_ID.PING:
                msg = proto.BINPingResponse.deserializeBinary(bytes);
                break;
            case NetworkManager.MESSAGE_ID.ENTER_ZONE:
                msg = proto.BINEnterZoneResponse.deserializeBinary(bytes);
                break;
            case NetworkManager.MESSAGE_ID.HEAD_LINE:
                msg = proto.BINHeadlineResponse.deserializeBinary(bytes);
                break;
            case NetworkManager.MESSAGE_ID.MATCH_END:
                msg = proto.BINMatchEndResponse.deserializeBinary(bytes);
                break;
            case NetworkManager.MESSAGE_ID.LOOK_UP_ROOM:
                msg = proto.BINLookUpRoomResponse.deserializeBinary(bytes);
                break;
            case NetworkManager.MESSAGE_ID.ENTER_ROOM:
                msg = proto.BINEnterRoomResponse.deserializeBinary(bytes);
                break;
            case NetworkManager.MESSAGE_ID.TURN:
                msg = proto.BINTurnResponse.deserializeBinary(bytes);
                break;
            case NetworkManager.MESSAGE_ID.UPDATE_MONEY:
                msg = proto.BINUpdateMoneyResponse.deserializeBinary(bytes);
                break;
            case NetworkManager.MESSAGE_ID.EXIT_ZONE:
                msg = proto.BINExitZoneResponse.deserializeBinary(bytes);
                break;
            case NetworkManager.MESSAGE_ID.EXIT_ROOM:
                msg = proto.BINExitRoomResponse.deserializeBinary(bytes);
                break;
        }

        return msg;
    },
    parseFrom: function(read_str, len) {
        var lstMess = [];
        var bb = new ByteBuffer(len);
        bb.append(read_str);
        var lenPacket = len;
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
                    cc.error("unknown message with message id:", messageidZip);
                }
            }
            else {

                while (left_byte_size > 0) {
                    //read protobuf + data_size_block + mid
                    //read datasizeblock
                    var _offsetUnzip = 0;


                    var data_size_block = bb.readInt16(_offsetUnzip);
                    _offsetUnzip+= 2;

                    // read messageid
                    var messageid = bb.readInt16(_offsetUnzip);
                    _offsetUnzip += 2;
                    // cc.log("message id:", messageid);
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
                        cc.error("unknown message with message id:", messageid);
                        left_byte_size -= (data_size_block + 2);
                        bb = bb.copy(data_size_block + _offsetUnzip - 2);
                    }

                }
            }
        }

        if (lenPacket > 0) {
            cc.log("NetworkManager: error packet length = 0");
        }

        cc.log("lstMess =", lstMess);
        return lstMess;

    }, // init message
    initInitializeMessage: function(cp, appVersion, deviceId, deviceInfo, country, language, packageName,
                                       liteVersion, referenceCode) {
        var message = new proto.BINInitializeRequest();
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
        var data = NetworkManager.initData(message.serializeBinary(), Common.getOS(), NetworkManager.MESSAGE_ID.INITIALIZE, "");
        NetworkManager.callNetwork(data);
    }, initLoginMessage: function(userName, password) {
        var message = new proto.BINLoginRequest();
        message.setUsername(userName);
        message.setPassword(password);
        return message;
    }, requestLoginMessage: function(userName, password){
        const message = NetworkManager.initInitializeMessage(userName, password);
        this.callNetwork(this.initData(message.serializeBinary(), Common.getOS(), NetworkManager.MESSAGE_ID.LOGIN, ""));
    },

    initPingMessage: function(disconnectTime) {
        var message = new proto.BINPingRequest();
        message.setDisconecttime(disconnectTime);
        return message;
    },
    requestPingMessage: function(disconnectTime) {
        var message = NetworkManager.initPingMessage(disconnectTime);
        this.callNetwork(this.initData(message.serializeBinary(), Common.getOS(), NetworkManager.MESSAGE_ID.PING, ""));
    },
    initEnterZoneMessage: function(zoneId) {
        var message = new proto.BINEnterZoneRequest();
        message.setZoneid(zoneId);
        return message;
    },
    /* Exit room */
    initExitRoomMessage: function(roomIndex) {
        var message = new proto.BINExitRoomRequest();
        message.setRoomindex(roomIndex);
        return message;
    },
    requestExitRoomMessage: function(roomIndex) {
        var message = this.initExitRoomMessage(roomIndex);
        cc.log("message = ", message);
        this.callNetwork(this.initData(message.serializeBinary(), Common.getOS(), NetworkManager.MESSAGE_ID.EXIT_ROOM, Common.getSessionId()));
    },
    requestEnterZoneMessage: function(zoneId) {
        var message = NetworkManager.initEnterZoneMessage(zoneId);
        cc.log("message = ", message);
        this.callNetwork(this.initData(message.serializeBinary(), Common.getOS(), NetworkManager.MESSAGE_ID.ENTER_ZONE, Common.getSessionId()));
    },
    /* Register */
    requestRegisterMessage: function(username, password, repass, displayname, mobile) {
        var message = NetworkManager.initRegisterMessage(username, password, repass, displayname, mobile);
        this.callNetwork(this.initData(message.serializeBinary(), Common.getOS(), NetworkManager.MESSAGE_ID.REGISTER, ""));
    },
    initRegisterMessage: function(username, password, repass, displayname, mobile) {
        var message = new proto.BINRegisterRequest();
        message.setUsername(username);
        message.setPassword(password);
        message.setConfirmpassword(repass);
        message.setDisplayname(displayname);
        message.setMobile(mobile);
        return message;
    },
    initLookUpRoomRequest: function(zoneId, type, firstResult, maxResult, orderByField, asc, roomGroup){
        var request = new proto.BINLookUpRoomRequest();
        request.setZoneid(zoneId);
        request.setType(type);
        request.setFirstresult(firstResult);
        request.setMaxresult(maxResult);
        request.setOrderbyfield(orderByField);
        request.setAsc(asc);
        request.setRoomgroup(roomGroup);
        return request;
    },
    getLookUpRoomRequest: function(zoneId, type, firstResult, maxResult, orderByField, asc, roomGroup){
        var request = this.initLookUpRoomRequest(zoneId, type, firstResult, maxResult, orderByField, asc, roomGroup);
        this.callNetwork(this.initData(request.serializeBinary(), Common.getOS(), NetworkManager.MESSAGE_ID.LOOK_UP_ROOM, Common.getSessionId()));
    },
    getEnterRoomMessageFromServer: function(room_index, password) {
        var request = this.initEnterRoomMessage(room_index, password);
        this.callNetwork(this.initData(request.serializeBinary(), Common.getOS(), NetworkManager.MESSAGE_ID.ENTER_ROOM, Common.getSessionId()));
    },
    initEnterRoomMessage: function(room_index, password) {
        var request = new proto.BINEnterRoomRequest();
        request.setRoomindex(room_index);
        request.setPassword(password);
        return request;
    },
    initTurnMessage: function(room_index, entries) {
        cc.log("entries =", entries);
        var request = new proto.BINTurnRequest();
        request.setRoomindex(room_index);
        request.setArgsList(entries);
        // for (var i = 0; i < entries.length; i++) {
        //     // var map_field = request->add_args();
        //     // map_field->set_key(it->key());
        //     // map_field->set_value(it->value());
        //     request.setArgsList(entries[i]);
        // }
        cc.log("request =", request);
        return request;
    },
    getTurnMessageFromServer: function(room_index, entries) {
        var request = this.initTurnMessage(room_index, entries);
        this.callNetwork(this.initData(request.serializeBinary(), Common.getOS(), NetworkManager.MESSAGE_ID.TURN, Common.getSessionId()));
    },
    connectNetwork: function() {
        if(window.ws === null || typeof(window.ws) === 'undefined' || window.ws.readyState === WebSocket.CLOSED) {

            window.ws = new WebSocket(NetworkManager.URL);
            window.listMessage = [];
            window.ws.binaryType = "arraybuffer";

            window.ws.onopen = function (event) {
                console.log("on web socket");
                NetworkManager.requestInitializeMessage("24", "15", Common.getFingerprint(), Common.getFingerprint(), "vn", "vi", "com.gamebai.tienlen", false, "");
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
                }, 0.5);
            };
            window.ws.onclose = function (event) {
                console.log("Websocket instance was closed");
            };
        } else {
            if(window.ws.readyState == WebSocket.OPEN) {
                window.ws.send(ackBuf);
            }
        }
    }
};

module.exports = NetworkManager;