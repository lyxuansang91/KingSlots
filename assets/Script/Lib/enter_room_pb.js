/**
 * @fileoverview
 * @enhanceable
 * @suppress {messageConventions} JS Compiler reports an error if a variable or
 *     field starts with 'MSG_' and isn't a translatable message.
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!

var jspb = require('google-protobuf');
var goog = jspb;
var global = Function('return this')();

var map_field_entry_pb = require('./map_field_entry_pb.js');
var player_pb = require('./player_pb.js');
var filter_room_pb = require('./filter_room_pb.js');
goog.exportSymbol('proto.BINEnterRoomGroupRequest', null, global);
goog.exportSymbol('proto.BINEnterRoomRequest', null, global);
goog.exportSymbol('proto.BINEnterRoomResponse', null, global);
goog.exportSymbol('proto.BINPlayerEnterRoomResponse', null, global);

/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.BINEnterRoomRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.BINEnterRoomRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.BINEnterRoomRequest.displayName = 'proto.BINEnterRoomRequest';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.BINEnterRoomRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.BINEnterRoomRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.BINEnterRoomRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.BINEnterRoomRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    zoneid: jspb.Message.getField(msg, 1),
    roomindex: jspb.Message.getField(msg, 2),
    password: jspb.Message.getField(msg, 3)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.BINEnterRoomRequest}
 */
proto.BINEnterRoomRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.BINEnterRoomRequest;
  return proto.BINEnterRoomRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.BINEnterRoomRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.BINEnterRoomRequest}
 */
proto.BINEnterRoomRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setZoneid(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setRoomindex(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setPassword(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.BINEnterRoomRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.BINEnterRoomRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.BINEnterRoomRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.BINEnterRoomRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = /** @type {number} */ (jspb.Message.getField(message, 1));
  if (f != null) {
    writer.writeInt32(
      1,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 2));
  if (f != null) {
    writer.writeInt32(
      2,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 3));
  if (f != null) {
    writer.writeString(
      3,
      f
    );
  }
};


/**
 * required int32 zoneId = 1;
 * @return {number}
 */
proto.BINEnterRoomRequest.prototype.getZoneid = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/** @param {number} value */
proto.BINEnterRoomRequest.prototype.setZoneid = function(value) {
  jspb.Message.setField(this, 1, value);
};


proto.BINEnterRoomRequest.prototype.clearZoneid = function() {
  jspb.Message.setField(this, 1, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINEnterRoomRequest.prototype.hasZoneid = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * required int32 roomIndex = 2;
 * @return {number}
 */
proto.BINEnterRoomRequest.prototype.getRoomindex = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.BINEnterRoomRequest.prototype.setRoomindex = function(value) {
  jspb.Message.setField(this, 2, value);
};


proto.BINEnterRoomRequest.prototype.clearRoomindex = function() {
  jspb.Message.setField(this, 2, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINEnterRoomRequest.prototype.hasRoomindex = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional string password = 3;
 * @return {string}
 */
proto.BINEnterRoomRequest.prototype.getPassword = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/** @param {string} value */
proto.BINEnterRoomRequest.prototype.setPassword = function(value) {
  jspb.Message.setField(this, 3, value);
};


proto.BINEnterRoomRequest.prototype.clearPassword = function() {
  jspb.Message.setField(this, 3, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINEnterRoomRequest.prototype.hasPassword = function() {
  return jspb.Message.getField(this, 3) != null;
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.BINEnterRoomResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.BINEnterRoomResponse.repeatedFields_, null);
};
goog.inherits(proto.BINEnterRoomResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.BINEnterRoomResponse.displayName = 'proto.BINEnterRoomResponse';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.BINEnterRoomResponse.repeatedFields_ = [6,7,11];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.BINEnterRoomResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.BINEnterRoomResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.BINEnterRoomResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.BINEnterRoomResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    responsecode: jspb.Message.getField(msg, 1),
    message: jspb.Message.getField(msg, 2),
    zoneid: jspb.Message.getField(msg, 3),
    roomplay: (f = msg.getRoomplay()) && filter_room_pb.BINRoomPlay.toObject(includeInstance, f),
    roomisplaying: jspb.Message.getField(msg, 5),
    playingplayersList: jspb.Message.toObjectList(msg.getPlayingplayersList(),
    player_pb.BINPlayer.toObject, includeInstance),
    waitingplayersList: jspb.Message.toObjectList(msg.getWaitingplayersList(),
    player_pb.BINPlayer.toObject, includeInstance),
    owneruserid: jspb.Message.getField(msg, 8),
    currentturnuserid: jspb.Message.getField(msg, 9),
    enterroomstatus: jspb.Message.getField(msg, 10),
    argsList: jspb.Message.toObjectList(msg.getArgsList(),
    map_field_entry_pb.BINMapFieldEntry.toObject, includeInstance)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.BINEnterRoomResponse}
 */
proto.BINEnterRoomResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.BINEnterRoomResponse;
  return proto.BINEnterRoomResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.BINEnterRoomResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.BINEnterRoomResponse}
 */
proto.BINEnterRoomResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setResponsecode(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setMessage(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setZoneid(value);
      break;
    case 4:
      var value = new filter_room_pb.BINRoomPlay;
      reader.readMessage(value,filter_room_pb.BINRoomPlay.deserializeBinaryFromReader);
      msg.setRoomplay(value);
      break;
    case 5:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setRoomisplaying(value);
      break;
    case 6:
      var value = new player_pb.BINPlayer;
      reader.readMessage(value,player_pb.BINPlayer.deserializeBinaryFromReader);
      msg.addPlayingplayers(value);
      break;
    case 7:
      var value = new player_pb.BINPlayer;
      reader.readMessage(value,player_pb.BINPlayer.deserializeBinaryFromReader);
      msg.addWaitingplayers(value);
      break;
    case 8:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setOwneruserid(value);
      break;
    case 9:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setCurrentturnuserid(value);
      break;
    case 10:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setEnterroomstatus(value);
      break;
    case 11:
      var value = new map_field_entry_pb.BINMapFieldEntry;
      reader.readMessage(value,map_field_entry_pb.BINMapFieldEntry.deserializeBinaryFromReader);
      msg.addArgs(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.BINEnterRoomResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.BINEnterRoomResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.BINEnterRoomResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.BINEnterRoomResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = /** @type {boolean} */ (jspb.Message.getField(message, 1));
  if (f != null) {
    writer.writeBool(
      1,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 2));
  if (f != null) {
    writer.writeString(
      2,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 3));
  if (f != null) {
    writer.writeInt32(
      3,
      f
    );
  }
  f = message.getRoomplay();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      filter_room_pb.BINRoomPlay.serializeBinaryToWriter
    );
  }
  f = /** @type {boolean} */ (jspb.Message.getField(message, 5));
  if (f != null) {
    writer.writeBool(
      5,
      f
    );
  }
  f = message.getPlayingplayersList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      6,
      f,
      player_pb.BINPlayer.serializeBinaryToWriter
    );
  }
  f = message.getWaitingplayersList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      7,
      f,
      player_pb.BINPlayer.serializeBinaryToWriter
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 8));
  if (f != null) {
    writer.writeInt64(
      8,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 9));
  if (f != null) {
    writer.writeInt64(
      9,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 10));
  if (f != null) {
    writer.writeInt32(
      10,
      f
    );
  }
  f = message.getArgsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      11,
      f,
      map_field_entry_pb.BINMapFieldEntry.serializeBinaryToWriter
    );
  }
};


/**
 * required bool responseCode = 1;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.BINEnterRoomResponse.prototype.getResponsecode = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 1, false));
};


/** @param {boolean} value */
proto.BINEnterRoomResponse.prototype.setResponsecode = function(value) {
  jspb.Message.setField(this, 1, value);
};


proto.BINEnterRoomResponse.prototype.clearResponsecode = function() {
  jspb.Message.setField(this, 1, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINEnterRoomResponse.prototype.hasResponsecode = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional string message = 2;
 * @return {string}
 */
proto.BINEnterRoomResponse.prototype.getMessage = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/** @param {string} value */
proto.BINEnterRoomResponse.prototype.setMessage = function(value) {
  jspb.Message.setField(this, 2, value);
};


proto.BINEnterRoomResponse.prototype.clearMessage = function() {
  jspb.Message.setField(this, 2, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINEnterRoomResponse.prototype.hasMessage = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional int32 zoneId = 3;
 * @return {number}
 */
proto.BINEnterRoomResponse.prototype.getZoneid = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/** @param {number} value */
proto.BINEnterRoomResponse.prototype.setZoneid = function(value) {
  jspb.Message.setField(this, 3, value);
};


proto.BINEnterRoomResponse.prototype.clearZoneid = function() {
  jspb.Message.setField(this, 3, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINEnterRoomResponse.prototype.hasZoneid = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional BINRoomPlay roomPlay = 4;
 * @return {?proto.BINRoomPlay}
 */
proto.BINEnterRoomResponse.prototype.getRoomplay = function() {
  return /** @type{?proto.BINRoomPlay} */ (
    jspb.Message.getWrapperField(this, filter_room_pb.BINRoomPlay, 4));
};


/** @param {?proto.BINRoomPlay|undefined} value */
proto.BINEnterRoomResponse.prototype.setRoomplay = function(value) {
  jspb.Message.setWrapperField(this, 4, value);
};


proto.BINEnterRoomResponse.prototype.clearRoomplay = function() {
  this.setRoomplay(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINEnterRoomResponse.prototype.hasRoomplay = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional bool roomIsPlaying = 5;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.BINEnterRoomResponse.prototype.getRoomisplaying = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 5, false));
};


/** @param {boolean} value */
proto.BINEnterRoomResponse.prototype.setRoomisplaying = function(value) {
  jspb.Message.setField(this, 5, value);
};


proto.BINEnterRoomResponse.prototype.clearRoomisplaying = function() {
  jspb.Message.setField(this, 5, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINEnterRoomResponse.prototype.hasRoomisplaying = function() {
  return jspb.Message.getField(this, 5) != null;
};


/**
 * repeated BINPlayer playingPlayers = 6;
 * @return {!Array.<!proto.BINPlayer>}
 */
proto.BINEnterRoomResponse.prototype.getPlayingplayersList = function() {
  return /** @type{!Array.<!proto.BINPlayer>} */ (
    jspb.Message.getRepeatedWrapperField(this, player_pb.BINPlayer, 6));
};


/** @param {!Array.<!proto.BINPlayer>} value */
proto.BINEnterRoomResponse.prototype.setPlayingplayersList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 6, value);
};


/**
 * @param {!proto.BINPlayer=} opt_value
 * @param {number=} opt_index
 * @return {!proto.BINPlayer}
 */
proto.BINEnterRoomResponse.prototype.addPlayingplayers = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 6, opt_value, proto.BINPlayer, opt_index);
};


proto.BINEnterRoomResponse.prototype.clearPlayingplayersList = function() {
  this.setPlayingplayersList([]);
};


/**
 * repeated BINPlayer waitingPlayers = 7;
 * @return {!Array.<!proto.BINPlayer>}
 */
proto.BINEnterRoomResponse.prototype.getWaitingplayersList = function() {
  return /** @type{!Array.<!proto.BINPlayer>} */ (
    jspb.Message.getRepeatedWrapperField(this, player_pb.BINPlayer, 7));
};


/** @param {!Array.<!proto.BINPlayer>} value */
proto.BINEnterRoomResponse.prototype.setWaitingplayersList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 7, value);
};


/**
 * @param {!proto.BINPlayer=} opt_value
 * @param {number=} opt_index
 * @return {!proto.BINPlayer}
 */
proto.BINEnterRoomResponse.prototype.addWaitingplayers = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 7, opt_value, proto.BINPlayer, opt_index);
};


proto.BINEnterRoomResponse.prototype.clearWaitingplayersList = function() {
  this.setWaitingplayersList([]);
};


/**
 * optional int64 ownerUserId = 8;
 * @return {number}
 */
proto.BINEnterRoomResponse.prototype.getOwneruserid = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 8, 0));
};


/** @param {number} value */
proto.BINEnterRoomResponse.prototype.setOwneruserid = function(value) {
  jspb.Message.setField(this, 8, value);
};


proto.BINEnterRoomResponse.prototype.clearOwneruserid = function() {
  jspb.Message.setField(this, 8, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINEnterRoomResponse.prototype.hasOwneruserid = function() {
  return jspb.Message.getField(this, 8) != null;
};


/**
 * optional int64 currentTurnUserId = 9;
 * @return {number}
 */
proto.BINEnterRoomResponse.prototype.getCurrentturnuserid = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 9, 0));
};


/** @param {number} value */
proto.BINEnterRoomResponse.prototype.setCurrentturnuserid = function(value) {
  jspb.Message.setField(this, 9, value);
};


proto.BINEnterRoomResponse.prototype.clearCurrentturnuserid = function() {
  jspb.Message.setField(this, 9, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINEnterRoomResponse.prototype.hasCurrentturnuserid = function() {
  return jspb.Message.getField(this, 9) != null;
};


/**
 * optional int32 enterRoomStatus = 10;
 * @return {number}
 */
proto.BINEnterRoomResponse.prototype.getEnterroomstatus = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 10, 0));
};


/** @param {number} value */
proto.BINEnterRoomResponse.prototype.setEnterroomstatus = function(value) {
  jspb.Message.setField(this, 10, value);
};


proto.BINEnterRoomResponse.prototype.clearEnterroomstatus = function() {
  jspb.Message.setField(this, 10, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINEnterRoomResponse.prototype.hasEnterroomstatus = function() {
  return jspb.Message.getField(this, 10) != null;
};


/**
 * repeated BINMapFieldEntry args = 11;
 * @return {!Array.<!proto.BINMapFieldEntry>}
 */
proto.BINEnterRoomResponse.prototype.getArgsList = function() {
  return /** @type{!Array.<!proto.BINMapFieldEntry>} */ (
    jspb.Message.getRepeatedWrapperField(this, map_field_entry_pb.BINMapFieldEntry, 11));
};


/** @param {!Array.<!proto.BINMapFieldEntry>} value */
proto.BINEnterRoomResponse.prototype.setArgsList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 11, value);
};


/**
 * @param {!proto.BINMapFieldEntry=} opt_value
 * @param {number=} opt_index
 * @return {!proto.BINMapFieldEntry}
 */
proto.BINEnterRoomResponse.prototype.addArgs = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 11, opt_value, proto.BINMapFieldEntry, opt_index);
};


proto.BINEnterRoomResponse.prototype.clearArgsList = function() {
  this.setArgsList([]);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.BINEnterRoomGroupRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.BINEnterRoomGroupRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.BINEnterRoomGroupRequest.displayName = 'proto.BINEnterRoomGroupRequest';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.BINEnterRoomGroupRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.BINEnterRoomGroupRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.BINEnterRoomGroupRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.BINEnterRoomGroupRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    zoneid: jspb.Message.getField(msg, 1),
    roomgroupid: jspb.Message.getField(msg, 2),
    viproom: jspb.Message.getField(msg, 3)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.BINEnterRoomGroupRequest}
 */
proto.BINEnterRoomGroupRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.BINEnterRoomGroupRequest;
  return proto.BINEnterRoomGroupRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.BINEnterRoomGroupRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.BINEnterRoomGroupRequest}
 */
proto.BINEnterRoomGroupRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setZoneid(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setRoomgroupid(value);
      break;
    case 3:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setViproom(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.BINEnterRoomGroupRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.BINEnterRoomGroupRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.BINEnterRoomGroupRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.BINEnterRoomGroupRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = /** @type {number} */ (jspb.Message.getField(message, 1));
  if (f != null) {
    writer.writeInt32(
      1,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 2));
  if (f != null) {
    writer.writeInt32(
      2,
      f
    );
  }
  f = /** @type {boolean} */ (jspb.Message.getField(message, 3));
  if (f != null) {
    writer.writeBool(
      3,
      f
    );
  }
};


/**
 * required int32 zoneId = 1;
 * @return {number}
 */
proto.BINEnterRoomGroupRequest.prototype.getZoneid = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/** @param {number} value */
proto.BINEnterRoomGroupRequest.prototype.setZoneid = function(value) {
  jspb.Message.setField(this, 1, value);
};


proto.BINEnterRoomGroupRequest.prototype.clearZoneid = function() {
  jspb.Message.setField(this, 1, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINEnterRoomGroupRequest.prototype.hasZoneid = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * required int32 roomGroupId = 2;
 * @return {number}
 */
proto.BINEnterRoomGroupRequest.prototype.getRoomgroupid = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.BINEnterRoomGroupRequest.prototype.setRoomgroupid = function(value) {
  jspb.Message.setField(this, 2, value);
};


proto.BINEnterRoomGroupRequest.prototype.clearRoomgroupid = function() {
  jspb.Message.setField(this, 2, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINEnterRoomGroupRequest.prototype.hasRoomgroupid = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional bool vipRoom = 3;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.BINEnterRoomGroupRequest.prototype.getViproom = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 3, false));
};


/** @param {boolean} value */
proto.BINEnterRoomGroupRequest.prototype.setViproom = function(value) {
  jspb.Message.setField(this, 3, value);
};


proto.BINEnterRoomGroupRequest.prototype.clearViproom = function() {
  jspb.Message.setField(this, 3, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINEnterRoomGroupRequest.prototype.hasViproom = function() {
  return jspb.Message.getField(this, 3) != null;
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.BINPlayerEnterRoomResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.BINPlayerEnterRoomResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.BINPlayerEnterRoomResponse.displayName = 'proto.BINPlayerEnterRoomResponse';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.BINPlayerEnterRoomResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.BINPlayerEnterRoomResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.BINPlayerEnterRoomResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.BINPlayerEnterRoomResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    responsecode: jspb.Message.getField(msg, 1),
    message: jspb.Message.getField(msg, 2),
    player: (f = msg.getPlayer()) && player_pb.BINPlayer.toObject(includeInstance, f),
    enterroomstatus: jspb.Message.getField(msg, 4),
    changeownerroomcd: jspb.Message.getField(msg, 5)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.BINPlayerEnterRoomResponse}
 */
proto.BINPlayerEnterRoomResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.BINPlayerEnterRoomResponse;
  return proto.BINPlayerEnterRoomResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.BINPlayerEnterRoomResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.BINPlayerEnterRoomResponse}
 */
proto.BINPlayerEnterRoomResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setResponsecode(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setMessage(value);
      break;
    case 3:
      var value = new player_pb.BINPlayer;
      reader.readMessage(value,player_pb.BINPlayer.deserializeBinaryFromReader);
      msg.setPlayer(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setEnterroomstatus(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setChangeownerroomcd(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.BINPlayerEnterRoomResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.BINPlayerEnterRoomResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.BINPlayerEnterRoomResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.BINPlayerEnterRoomResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = /** @type {boolean} */ (jspb.Message.getField(message, 1));
  if (f != null) {
    writer.writeBool(
      1,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 2));
  if (f != null) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getPlayer();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      player_pb.BINPlayer.serializeBinaryToWriter
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 4));
  if (f != null) {
    writer.writeInt32(
      4,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 5));
  if (f != null) {
    writer.writeInt32(
      5,
      f
    );
  }
};


/**
 * required bool responseCode = 1;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.BINPlayerEnterRoomResponse.prototype.getResponsecode = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 1, false));
};


/** @param {boolean} value */
proto.BINPlayerEnterRoomResponse.prototype.setResponsecode = function(value) {
  jspb.Message.setField(this, 1, value);
};


proto.BINPlayerEnterRoomResponse.prototype.clearResponsecode = function() {
  jspb.Message.setField(this, 1, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINPlayerEnterRoomResponse.prototype.hasResponsecode = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional string message = 2;
 * @return {string}
 */
proto.BINPlayerEnterRoomResponse.prototype.getMessage = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/** @param {string} value */
proto.BINPlayerEnterRoomResponse.prototype.setMessage = function(value) {
  jspb.Message.setField(this, 2, value);
};


proto.BINPlayerEnterRoomResponse.prototype.clearMessage = function() {
  jspb.Message.setField(this, 2, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINPlayerEnterRoomResponse.prototype.hasMessage = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional BINPlayer player = 3;
 * @return {?proto.BINPlayer}
 */
proto.BINPlayerEnterRoomResponse.prototype.getPlayer = function() {
  return /** @type{?proto.BINPlayer} */ (
    jspb.Message.getWrapperField(this, player_pb.BINPlayer, 3));
};


/** @param {?proto.BINPlayer|undefined} value */
proto.BINPlayerEnterRoomResponse.prototype.setPlayer = function(value) {
  jspb.Message.setWrapperField(this, 3, value);
};


proto.BINPlayerEnterRoomResponse.prototype.clearPlayer = function() {
  this.setPlayer(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINPlayerEnterRoomResponse.prototype.hasPlayer = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional int32 enterRoomStatus = 4;
 * @return {number}
 */
proto.BINPlayerEnterRoomResponse.prototype.getEnterroomstatus = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/** @param {number} value */
proto.BINPlayerEnterRoomResponse.prototype.setEnterroomstatus = function(value) {
  jspb.Message.setField(this, 4, value);
};


proto.BINPlayerEnterRoomResponse.prototype.clearEnterroomstatus = function() {
  jspb.Message.setField(this, 4, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINPlayerEnterRoomResponse.prototype.hasEnterroomstatus = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional int32 changeOwnerRoomCd = 5;
 * @return {number}
 */
proto.BINPlayerEnterRoomResponse.prototype.getChangeownerroomcd = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/** @param {number} value */
proto.BINPlayerEnterRoomResponse.prototype.setChangeownerroomcd = function(value) {
  jspb.Message.setField(this, 5, value);
};


proto.BINPlayerEnterRoomResponse.prototype.clearChangeownerroomcd = function() {
  jspb.Message.setField(this, 5, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINPlayerEnterRoomResponse.prototype.hasChangeownerroomcd = function() {
  return jspb.Message.getField(this, 5) != null;
};


goog.object.extend(exports, proto);
