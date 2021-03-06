/**
 * @fileoverview
 * @enhanceable
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!

var jspb = require('google-protobuf');
var goog = jspb;
var global = Function('return this')();

var user_info_pb = require('./user_info_pb.js');
goog.exportSymbol('proto.BINLoginRequest', null, global);
goog.exportSymbol('proto.BINLoginResponse', null, global);

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
proto.BINLoginRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.BINLoginRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.BINLoginRequest.displayName = 'proto.BINLoginRequest';
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
proto.BINLoginRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.BINLoginRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.BINLoginRequest} msg The msg instance to transform.
 * @return {!Object}
 */
proto.BINLoginRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    username: jspb.Message.getField(msg, 1),
    password: jspb.Message.getField(msg, 2)
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
 * @return {!proto.BINLoginRequest}
 */
proto.BINLoginRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.BINLoginRequest;
  return proto.BINLoginRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.BINLoginRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.BINLoginRequest}
 */
proto.BINLoginRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setUsername(value);
      break;
    case 2:
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
 * Class method variant: serializes the given message to binary data
 * (in protobuf wire format), writing to the given BinaryWriter.
 * @param {!proto.BINLoginRequest} message
 * @param {!jspb.BinaryWriter} writer
 */
proto.BINLoginRequest.serializeBinaryToWriter = function(message, writer) {
  message.serializeBinaryToWriter(writer);
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.BINLoginRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  this.serializeBinaryToWriter(writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the message to binary data (in protobuf wire format),
 * writing to the given BinaryWriter.
 * @param {!jspb.BinaryWriter} writer
 */
proto.BINLoginRequest.prototype.serializeBinaryToWriter = function (writer) {
  var f = undefined;
  f = /** @type {string} */ (jspb.Message.getField(this, 1));
  if (f != null) {
    writer.writeString(
      1,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(this, 2));
  if (f != null) {
    writer.writeString(
      2,
      f
    );
  }
};


/**
 * required string userName = 1;
 * @return {string}
 */
proto.BINLoginRequest.prototype.getUsername = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/** @param {string} value */
proto.BINLoginRequest.prototype.setUsername = function(value) {
  jspb.Message.setField(this, 1, value);
};


proto.BINLoginRequest.prototype.clearUsername = function() {
  jspb.Message.setField(this, 1, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINLoginRequest.prototype.hasUsername = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * required string password = 2;
 * @return {string}
 */
proto.BINLoginRequest.prototype.getPassword = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/** @param {string} value */
proto.BINLoginRequest.prototype.setPassword = function(value) {
  jspb.Message.setField(this, 2, value);
};


proto.BINLoginRequest.prototype.clearPassword = function() {
  jspb.Message.setField(this, 2, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINLoginRequest.prototype.hasPassword = function() {
  return jspb.Message.getField(this, 2) != null;
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
proto.BINLoginResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.BINLoginResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.BINLoginResponse.displayName = 'proto.BINLoginResponse';
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
proto.BINLoginResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.BINLoginResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.BINLoginResponse} msg The msg instance to transform.
 * @return {!Object}
 */
proto.BINLoginResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    responsecode: jspb.Message.getField(msg, 1),
    message: jspb.Message.getField(msg, 2),
    userinfo: (f = msg.getUserinfo()) && user_info_pb.BINUserInfo.toObject(includeInstance, f),
    usersetting: (f = msg.getUsersetting()) && user_info_pb.BINUserSetting.toObject(includeInstance, f),
    sessionid: jspb.Message.getField(msg, 5),
    hasplayingmatch: jspb.Message.getField(msg, 6),
    enabledebuglag: jspb.Message.getField(msg, 7),
    enableevent: jspb.Message.getField(msg, 8),
    enablenotification: jspb.Message.getField(msg, 9),
    enabletx: jspb.Message.getField(msg, 10),
    noticetext: jspb.Message.getField(msg, 11)
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
 * @return {!proto.BINLoginResponse}
 */
proto.BINLoginResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.BINLoginResponse;
  return proto.BINLoginResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.BINLoginResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.BINLoginResponse}
 */
proto.BINLoginResponse.deserializeBinaryFromReader = function(msg, reader) {
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
      var value = new user_info_pb.BINUserInfo;
      reader.readMessage(value,user_info_pb.BINUserInfo.deserializeBinaryFromReader);
      msg.setUserinfo(value);
      break;
    case 4:
      var value = new user_info_pb.BINUserSetting;
      reader.readMessage(value,user_info_pb.BINUserSetting.deserializeBinaryFromReader);
      msg.setUsersetting(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setSessionid(value);
      break;
    case 6:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setHasplayingmatch(value);
      break;
    case 7:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnabledebuglag(value);
      break;
    case 8:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnableevent(value);
      break;
    case 9:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnablenotification(value);
      break;
    case 10:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnabletx(value);
      break;
    case 11:
      var value = /** @type {string} */ (reader.readString());
      msg.setNoticetext(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Class method variant: serializes the given message to binary data
 * (in protobuf wire format), writing to the given BinaryWriter.
 * @param {!proto.BINLoginResponse} message
 * @param {!jspb.BinaryWriter} writer
 */
proto.BINLoginResponse.serializeBinaryToWriter = function(message, writer) {
  message.serializeBinaryToWriter(writer);
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.BINLoginResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  this.serializeBinaryToWriter(writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the message to binary data (in protobuf wire format),
 * writing to the given BinaryWriter.
 * @param {!jspb.BinaryWriter} writer
 */
proto.BINLoginResponse.prototype.serializeBinaryToWriter = function (writer) {
  var f = undefined;
  f = /** @type {boolean} */ (jspb.Message.getField(this, 1));
  if (f != null) {
    writer.writeBool(
      1,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(this, 2));
  if (f != null) {
    writer.writeString(
      2,
      f
    );
  }
  f = this.getUserinfo();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      user_info_pb.BINUserInfo.serializeBinaryToWriter
    );
  }
  f = this.getUsersetting();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      user_info_pb.BINUserSetting.serializeBinaryToWriter
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(this, 5));
  if (f != null) {
    writer.writeString(
      5,
      f
    );
  }
  f = /** @type {boolean} */ (jspb.Message.getField(this, 6));
  if (f != null) {
    writer.writeBool(
      6,
      f
    );
  }
  f = /** @type {boolean} */ (jspb.Message.getField(this, 7));
  if (f != null) {
    writer.writeBool(
      7,
      f
    );
  }
  f = /** @type {boolean} */ (jspb.Message.getField(this, 8));
  if (f != null) {
    writer.writeBool(
      8,
      f
    );
  }
  f = /** @type {boolean} */ (jspb.Message.getField(this, 9));
  if (f != null) {
    writer.writeBool(
      9,
      f
    );
  }
  f = /** @type {boolean} */ (jspb.Message.getField(this, 10));
  if (f != null) {
    writer.writeBool(
      10,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(this, 11));
  if (f != null) {
    writer.writeString(
      11,
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
proto.BINLoginResponse.prototype.getResponsecode = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 1, false));
};


/** @param {boolean} value */
proto.BINLoginResponse.prototype.setResponsecode = function(value) {
  jspb.Message.setField(this, 1, value);
};


proto.BINLoginResponse.prototype.clearResponsecode = function() {
  jspb.Message.setField(this, 1, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINLoginResponse.prototype.hasResponsecode = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional string message = 2;
 * @return {string}
 */
proto.BINLoginResponse.prototype.getMessage = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/** @param {string} value */
proto.BINLoginResponse.prototype.setMessage = function(value) {
  jspb.Message.setField(this, 2, value);
};


proto.BINLoginResponse.prototype.clearMessage = function() {
  jspb.Message.setField(this, 2, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINLoginResponse.prototype.hasMessage = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional BINUserInfo userInfo = 3;
 * @return {?proto.BINUserInfo}
 */
proto.BINLoginResponse.prototype.getUserinfo = function() {
  return /** @type{?proto.BINUserInfo} */ (
    jspb.Message.getWrapperField(this, user_info_pb.BINUserInfo, 3));
};


/** @param {?proto.BINUserInfo|undefined} value */
proto.BINLoginResponse.prototype.setUserinfo = function(value) {
  jspb.Message.setWrapperField(this, 3, value);
};


proto.BINLoginResponse.prototype.clearUserinfo = function() {
  this.setUserinfo(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINLoginResponse.prototype.hasUserinfo = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional BINUserSetting userSetting = 4;
 * @return {?proto.BINUserSetting}
 */
proto.BINLoginResponse.prototype.getUsersetting = function() {
  return /** @type{?proto.BINUserSetting} */ (
    jspb.Message.getWrapperField(this, user_info_pb.BINUserSetting, 4));
};


/** @param {?proto.BINUserSetting|undefined} value */
proto.BINLoginResponse.prototype.setUsersetting = function(value) {
  jspb.Message.setWrapperField(this, 4, value);
};


proto.BINLoginResponse.prototype.clearUsersetting = function() {
  this.setUsersetting(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINLoginResponse.prototype.hasUsersetting = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional string sessionId = 5;
 * @return {string}
 */
proto.BINLoginResponse.prototype.getSessionid = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/** @param {string} value */
proto.BINLoginResponse.prototype.setSessionid = function(value) {
  jspb.Message.setField(this, 5, value);
};


proto.BINLoginResponse.prototype.clearSessionid = function() {
  jspb.Message.setField(this, 5, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINLoginResponse.prototype.hasSessionid = function() {
  return jspb.Message.getField(this, 5) != null;
};


/**
 * optional bool hasPlayingMatch = 6;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.BINLoginResponse.prototype.getHasplayingmatch = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 6, false));
};


/** @param {boolean} value */
proto.BINLoginResponse.prototype.setHasplayingmatch = function(value) {
  jspb.Message.setField(this, 6, value);
};


proto.BINLoginResponse.prototype.clearHasplayingmatch = function() {
  jspb.Message.setField(this, 6, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINLoginResponse.prototype.hasHasplayingmatch = function() {
  return jspb.Message.getField(this, 6) != null;
};


/**
 * optional bool enableDebugLag = 7;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.BINLoginResponse.prototype.getEnabledebuglag = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 7, false));
};


/** @param {boolean} value */
proto.BINLoginResponse.prototype.setEnabledebuglag = function(value) {
  jspb.Message.setField(this, 7, value);
};


proto.BINLoginResponse.prototype.clearEnabledebuglag = function() {
  jspb.Message.setField(this, 7, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINLoginResponse.prototype.hasEnabledebuglag = function() {
  return jspb.Message.getField(this, 7) != null;
};


/**
 * optional bool enableEvent = 8;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.BINLoginResponse.prototype.getEnableevent = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 8, false));
};


/** @param {boolean} value */
proto.BINLoginResponse.prototype.setEnableevent = function(value) {
  jspb.Message.setField(this, 8, value);
};


proto.BINLoginResponse.prototype.clearEnableevent = function() {
  jspb.Message.setField(this, 8, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINLoginResponse.prototype.hasEnableevent = function() {
  return jspb.Message.getField(this, 8) != null;
};


/**
 * optional bool enableNotification = 9;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.BINLoginResponse.prototype.getEnablenotification = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 9, false));
};


/** @param {boolean} value */
proto.BINLoginResponse.prototype.setEnablenotification = function(value) {
  jspb.Message.setField(this, 9, value);
};


proto.BINLoginResponse.prototype.clearEnablenotification = function() {
  jspb.Message.setField(this, 9, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINLoginResponse.prototype.hasEnablenotification = function() {
  return jspb.Message.getField(this, 9) != null;
};


/**
 * optional bool enableTx = 10;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.BINLoginResponse.prototype.getEnabletx = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 10, false));
};


/** @param {boolean} value */
proto.BINLoginResponse.prototype.setEnabletx = function(value) {
  jspb.Message.setField(this, 10, value);
};


proto.BINLoginResponse.prototype.clearEnabletx = function() {
  jspb.Message.setField(this, 10, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINLoginResponse.prototype.hasEnabletx = function() {
  return jspb.Message.getField(this, 10) != null;
};


/**
 * optional string noticeText = 11;
 * @return {string}
 */
proto.BINLoginResponse.prototype.getNoticetext = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 11, ""));
};


/** @param {string} value */
proto.BINLoginResponse.prototype.setNoticetext = function(value) {
  jspb.Message.setField(this, 11, value);
};


proto.BINLoginResponse.prototype.clearNoticetext = function() {
  jspb.Message.setField(this, 11, undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.BINLoginResponse.prototype.hasNoticetext = function() {
  return jspb.Message.getField(this, 11) != null;
};


goog.object.extend(exports, proto);
