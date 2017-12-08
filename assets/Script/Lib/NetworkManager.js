var InitializeMessage = require('initialize_pb');

var NetworkManager = {
    MESSAGE_ID: {
        INITIALIZE: 1111
    },
    OS : {
       ANDROID: 1,
       IOS: 2
    },


    requestMessage: function(request, os, message_id, session_id) {
        var ackBuf = NetworkManager.initData(request, os, message_id, session_id);
        NetworkManager.callNetwork(ackBuf);
    }, 
    initData: function(request, os, messid, _session) {
        cc.log("request", request);
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

        cc.log("size:" + size);

        bb.writeUint32(dataSize, _offset);
        _offset+= 4;


        bb.writeUint16(lenSession, _offset);
        _offset+= 2;

        var sessionByte = bb.writeUTF8String(_session, _offset);
        _offset+= lenSession;

        bb.writeUint16(messid, _offset);
        _offset+= 2;

        bb.append(request, "", _offset);
        cc.log("bb:", bb.toBuffer());

        return bb.toBuffer();
    },

    getTypeMessage: function(msg, messageid, protoBufVar) {
        var bytes = new Uint8Array(protoBufVar.toArrayBuffer());
        switch (messageid) {
            case NetworkManager.MESSAGE_ID.INITIALIZE:
                msg = MyMessage.BINInitializeResponse.deserializeBinary(bytes);
                break;
        }

        return msg;
    },
    parseFrom: function(read_str, len) {
        var lstMess = [];
        var bb = new ByteBuffer(len);

        bb.append(read_str);

        var lenPacket = len;

        cc.log("read str:" + read_str);

        cc.log("len:", len);
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


                if (response != 0) {
                    left_byte_size -= (data_size_block_zip + 2);
                    var pairZip = {
                        message_id: messageidZip,
                        response: response
                    };

                    for(var i = 0; i < listMessages.length; i++) {
                        var obj = listMessages[i];

                        if(obj.message_id == messageidZip) {
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

                    var response = 0;
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
                    //read protobuf

                    var protoBufVar = bb.copy(_offsetUnzip, data_size_block + _offsetUnzip - 2);

                    response = NetworkManager.getTypeMessage(response, messageid, protoBufVar);
                    cc.log("response: ", response);
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
                    }

                }
            }
        }

        if (lenPacket > 0) {
            cc.log("NetworkManager: error packet length = 0");
        }

        // cc.log("listMessages parse", listMessages);
        return lstMess;
    }, initInitializeMessage: function() {

    },

    callNetwork: function(ackBuf) {
        cc.log("websocket:", window.ws);
        if(window.ws === null || window.ws === 'undefined' || window.ws.readyState === WebSocket.CLOSED) {
            window.ws = new WebSocket("ws://14.225.2.111:1280/megajackpot");
            window.listMessage = [];
            window.ws.binaryType = "arraybuffer";

            window.ws.onopen = function (event) {
                console.log("Web socket");
                setTimeout(function() {
                    var message = new InitializeMessage.BINInitializeRequest();
                    message.setCp("1");
                    message.setCountry("vn");
                    message.setDeviceid("12345678909");
                    message.setPakagename("com.packagename.com");
                    message.setAppversion("1");
                    var data = NetworkManager.initData(message.serializeBinary(), NetworkManager.OS.ANDROID,
                        NetworkManager.MESSAGE_ID.INITIALIZE, "");
                    cc.log("data:", data);
                    window.ws.send(data);
                }, 1);
            };
            window.ws.onclose = function (event) {
                console.log("Websocket instance was closed");
            };
        }

        if(window.ws.readyState == WebSocket.OPEN) {
            window.ws.send(ackBuf);
        }

    }
};

module.exports = NetworkManager;