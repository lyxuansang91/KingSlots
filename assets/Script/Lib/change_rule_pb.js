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
goog.exportSymbol('proto.BINChangeRuleRequest', null, global);
goog.exportSymbol('proto.BINChangeRuleResponse', null, global);

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
proto.BINChangeRuleRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.BINChangeRuleRequest.repeatedFields_, null);
};
goog.inherits(proto.BINChangeRuleRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.BINChangeRuleRequest.displayName = 'proto.BINChangeRuleRequest';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.BINChangeRuleRequest.repeatedFields_ = [3];



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
proto.BINChangeRuleRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.BINChangeRuleRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.BINChangeRuleRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.BINChangeRuleRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    zoneid: jspb.Message.getField(msg, 1),
    roomindex: jspb.Message.getField(msg, 2),
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
 * @return {!proto.BINChangeRuleRequest}
 */
proto.BINChangeRuleRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.BINChangeRuleRequest;
  return proto.BINChangeRuleRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.BINChangeRuleRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.BINChangeRuleRequest}
 */
proto.BINChangeRuleRequest.deserializeBinaryFromReader = function(msg, reader) {
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
proto.BINChangeRuleRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.BINChangeRuleRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.BINChangeRuleRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.BINChangeRuleRequest.serializeBinaryToWriter = function(message, writer) {
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
  f = message.getArgsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      map_field_entry_pb.BINMapFieldEntry.serializeBinaryToWriter
    );
  }
};


/**
 * required int32 zoneId = 1;
 * @return {number}
 */
proto.BINChangeRuleRequest.prototype.getZoneid = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/** @param {number} value */
proto.BINChangeRuleRequest.prototype.setZoneid = function(value) {
  jspb.Message.setField(this, 1, value);
};


proto.BINChangeRuleRequest.prototype.clearZoneid = function() {
  jspb.Message.setField(this, 1, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINChangeRuleRequest.prototype.hasZoneid = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * required int32 roomIndex = 2;
 * @return {number}
 */
proto.BINChangeRuleRequest.prototype.getRoomindex = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.BINChangeRuleRequest.prototype.setRoomindex = function(value) {
  jspb.Message.setField(this, 2, value);
};


proto.BINChangeRuleRequest.prototype.clearRoomindex = function() {
  jspb.Message.setField(this, 2, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINChangeRuleRequest.prototype.hasRoomindex = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * repeated BINMapFieldEntry args = 3;
 * @return {!Array.<!proto.BINMapFieldEntry>}
 */
proto.BINChangeRuleRequest.prototype.getArgsList = function() {
  return /** @type{!Array.<!proto.BINMapFieldEntry>} */ (
    jspb.Message.getRepeatedWrapperField(this, map_field_entry_pb.BINMapFieldEntry, 3));
};


/** @param {!Array.<!proto.BINMapFieldEntry>} value */
proto.BINChangeRuleRequest.prototype.setArgsList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.BINMapFieldEntry=} opt_value
 * @param {number=} opt_index
 * @return {!proto.BINMapFieldEntry}
 */
proto.BINChangeRuleRequest.prototype.addArgs = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.BINMapFieldEntry, opt_index);
};


proto.BINChangeRuleRequest.prototype.clearArgsList = function() {
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
proto.BINChangeRuleResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.BINChangeRuleResponse.repeatedFields_, null);
};
goog.inherits(proto.BINChangeRuleResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.BINChangeRuleResponse.displayName = 'proto.BINChangeRuleResponse';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.BINChangeRuleResponse.repeatedFields_ = [4];



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
proto.BINChangeRuleResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.BINChangeRuleResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.BINChangeRuleResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.BINChangeRuleResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    responsecode: jspb.Message.getField(msg, 1),
    message: jspb.Message.getField(msg, 2),
    zoneid: jspb.Message.getField(msg, 3),
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
 * @return {!proto.BINChangeRuleResponse}
 */
proto.BINChangeRuleResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.BINChangeRuleResponse;
  return proto.BINChangeRuleResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.BINChangeRuleResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.BINChangeRuleResponse}
 */
proto.BINChangeRuleResponse.deserializeBinaryFromReader = function(msg, reader) {
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
proto.BINChangeRuleResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.BINChangeRuleResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.BINChangeRuleResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.BINChangeRuleResponse.serializeBinaryToWriter = function(message, writer) {
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
  f = message.getArgsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      4,
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
proto.BINChangeRuleResponse.prototype.getResponsecode = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 1, false));
};


/** @param {boolean} value */
proto.BINChangeRuleResponse.prototype.setResponsecode = function(value) {
  jspb.Message.setField(this, 1, value);
};


proto.BINChangeRuleResponse.prototype.clearResponsecode = function() {
  jspb.Message.setField(this, 1, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINChangeRuleResponse.prototype.hasResponsecode = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional string message = 2;
 * @return {string}
 */
proto.BINChangeRuleResponse.prototype.getMessage = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/** @param {string} value */
proto.BINChangeRuleResponse.prototype.setMessage = function(value) {
  jspb.Message.setField(this, 2, value);
};


proto.BINChangeRuleResponse.prototype.clearMessage = function() {
  jspb.Message.setField(this, 2, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINChangeRuleResponse.prototype.hasMessage = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional int32 zoneId = 3;
 * @return {number}
 */
proto.BINChangeRuleResponse.prototype.getZoneid = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/** @param {number} value */
proto.BINChangeRuleResponse.prototype.setZoneid = function(value) {
  jspb.Message.setField(this, 3, value);
};


proto.BINChangeRuleResponse.prototype.clearZoneid = function() {
  jspb.Message.setField(this, 3, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINChangeRuleResponse.prototype.hasZoneid = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * repeated BINMapFieldEntry args = 4;
 * @return {!Array.<!proto.BINMapFieldEntry>}
 */
proto.BINChangeRuleResponse.prototype.getArgsList = function() {
  return /** @type{!Array.<!proto.BINMapFieldEntry>} */ (
    jspb.Message.getRepeatedWrapperField(this, map_field_entry_pb.BINMapFieldEntry, 4));
};


/** @param {!Array.<!proto.BINMapFieldEntry>} value */
proto.BINChangeRuleResponse.prototype.setArgsList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 4, value);
};


/**
 * @param {!proto.BINMapFieldEntry=} opt_value
 * @param {number=} opt_index
 * @return {!proto.BINMapFieldEntry}
 */
proto.BINChangeRuleResponse.prototype.addArgs = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 4, opt_value, proto.BINMapFieldEntry, opt_index);
};


proto.BINChangeRuleResponse.prototype.clearArgsList = function() {
  this.setArgsList([]);
};


goog.object.extend(exports, proto);
