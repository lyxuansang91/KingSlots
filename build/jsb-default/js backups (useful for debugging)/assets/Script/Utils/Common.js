var Common = {
OS: {
ANDROID: 1,
IOS: 2,
WEB: 5
},
userInfo: null,
ZONE_ID: {
BACAY: 1,
XITO: 2,
POKER: 3,
PHOM: 4,
TLMN: 5,
TLMN_SOLO: 6,
LIENG: 11,
MAUBINH: 12,
XENG: 13,
XOCDIA: 15,
TAIXIU: 17,
VQMM: 18,
MINI_POKER: 19,
MINI_BACAY: 20,
XOCDIA2: 21,
EGG: 22,
TREASURE: 23
},
width: cc.director.getWinSize().width,
height: cc.director.getWinSize().height,
origin: cc.director.getVisibleOrigin(),
introScene: null,
_existTaiXiu: !1,
providerLists: null,
smsConfigLists: null,
assetsConfigList: null,
initLanguage: function() {
var i = this, e = cc.url.raw("resources/vi2.json");
cc.loader.load(e, function(e, n) {
if (null === e) {
var t = JSON.stringify(n);
i.KEYTEXT = JSON.parse(t);
}
});
},
isExistTaiXiu: function() {
return this._existTaiXiu;
},
setExistTaiXiu: function(e) {
this._existTaiXiu = e;
},
getIntroSceneInstance: function() {
return this.introScene;
},
setIntroSceneInstance: function(e) {
return this.introScene;
},
loginScene: null,
getLoginSceneInstance: function() {
return this.loginScene;
},
setLoginSceneInstance: function(e) {
this.loginScene = e;
},
tableScene: null,
getTableSceneInstance: function() {
return this.tableScene;
},
setTableSceneInstance: function(e) {
this.tableScene = e;
},
miniPokerScene: null,
getMiniPokerSceneInstance: function() {
return this.miniPokerScene;
},
setMiniPokerSceneInstance: function(e) {
this.miniPokerScene = e;
},
miniThreeCardsScene: null,
setMiniThreeCardsSceneInstance: function(e) {
this.miniThreeCardsScene = e;
},
getMiniThreeCardsSceneInstance: function() {
return this.miniThreeCardsScene;
},
getUserInfo: function() {
return this.userInfo;
},
setUserInfo: function(e) {
this.userInfo = e;
},
create2DArray: function(e) {
for (var n = new Array(e), t = 0; t < e; t++) n[t] = [];
return n;
},
updateMoney: function(e, n, t, i) {
if (e instanceof cc.Label) if (i <= t) e.string = Common.numberFormatWithCommas(i); else {
var o = Math.floor((i - n) / 30);
setTimeout(function() {
i <= (t += o) && (t = i);
e.string = Common.numberFormatWithCommas(t);
this.updateMoney(e, n, t, i);
}.bind(this), 30);
}
},
getOS: function() {
var e = -1;
cc.sys.isNative ? cc.sys.platform == cc.sys.ANDROID ? e = Common.OS.ANDROID : cc.sys.platform != cc.sys.IPHONE && cc.sys.platform != cc.sys.IPAD || (e = Common.OS.IOS) : cc.sys.isBrowser && (e = Common.OS.WEB);
return e;
},
sessionId: "-1",
getSessionId: function() {
"-1" == this.sessionId && (this.sessionId = "");
return this.sessionId;
},
setSessionId: function(e) {
this.sessionId = e;
},
deviceId: "",
getDeviceId: function() {
return this.deviceId;
},
setDeviceId: function(e) {
this.deviceId = e;
},
guid: function() {
function e() {
return Math.floor(65536 * (1 + Math.random())).toString(16).substring(1);
}
return e() + e() + "-" + e() + "-" + e() + "-" + e() + "-" + e() + e() + e();
},
fingerprint: "",
setFingerprint: function() {
var e = cc.sys.localStorage.getItem("fingerprint");
cc.log("fp:", e);
cc.log("PLATFORM : ", cc.sys.platform, " ", cc.sys.IPHONE, " ", cc.sys.ANDROID);
if (null == e) {
if (cc.sys.isBrowser) new Fingerprint2().get(function(e, n) {
console.log("result:", e);
cc.sys.localStorage.setItem("fingerprint", e);
this.fingerprint = e;
console.log("component:", n);
}); else if (cc.sys.isNative) if (cc.sys.platform == cc.sys.ANDROID) {
var n = "xxxxx";
console.log("result:", n);
cc.sys.localStorage.setItem("fingerprint", n);
this.fingerprint = n;
} else if (cc.sys.platform == cc.sys.IPHONE || cc.sys.platform == cc.sys.IPAD) {
n = "xxxxx";
console.log("result:", n);
cc.sys.localStorage.setItem("fingerprint", n);
this.fingerprint = n;
}
} else this.fingerprint = e;
},
getFingerprint: function() {
"" == this.fingerprint && this.setFingerprint();
return this.fingerprint;
},
getDeviceInfo: function() {
return cc.sys.isNative ? cc.sys.platform == cc.sys.ANDROID ? "xxxxx" : cc.sys.platform == cc.sys.IPHONE || cc.sys.platform == cc.sys.IPAD ? jsb.reflection.callStaticMethod("NativeUtility", "getDeviceID") : void 0 : this.getFingerprint();
},
enableGameIds: [],
setEnableGameIds: function(e) {
this.enableGameIds = e;
},
_zoneId: -1,
getZoneId: function() {
var e = -1;
switch (this.gameTag) {
case Config.TAG_GAME_ITEM.MINI_BACAY:
e = Common.ZONE_ID.MINI_BACAY;
break;

case Config.TAG_GAME_ITEM.MINI_POKER:
e = Common.ZONE_ID.MINI_POKER;
break;

case Config.TAG_GAME_ITEM.TAIXIU:
e = Common.ZONE_ID.TAIXIU;
break;

case Config.TAG_GAME_ITEM.VQMM:
e = Common.ZONE_ID.VQMM;
break;

case Config.TAG_GAME_ITEM.TREASURE:
e = Common.ZONE_ID.TREASURE;
break;

default:
e = Common.ZONE_ID.MINI_BACAY;
}
return -1 != this._zoneId ? this._zoneId : e;
},
setZoneId: function(e) {
this._zoneId = e;
},
getEnableGameIds: function() {
return this.enableGameIds;
},
setGameTag: function(e) {
this.gameTag = e;
},
getGameTag: function() {
return this.gameTag;
},
_requestRoomType: -1,
setRequestRoomType: function(e) {
this._requestRoomType = e;
},
getRequestRoomType: function() {
return this._requestRoomType;
},
cashRoomList: [],
setCashRoomList: function(e) {
this.cashRoomList = e;
},
getCashRoomList: function() {
return this.cashRoomList;
},
listRoomPlay: [],
setListRoomPlay: function(e) {
this.listRoomPlay = e;
},
getListRoomPlay: function() {
return this.listRoomPlay;
},
currentZoneId: -1,
setCurrentZoneId: function(e) {
this.currentZoneId = e;
},
getCurrentZoneId: function() {
return this.currentZoneId;
},
ownerUserId: 0,
getOwnerUserId: function() {
return this.ownerUserId;
},
setOwnerUserId: function(e) {
this.ownerUserId = e;
},
cash: 0,
setCash: function(e) {
this.cash = e;
},
getCash: function() {
return this.cash;
},
genRandomNumber: function(e, n, t) {
var i = [];
do {
var o = Math.floor(7 * Math.random()) + 98;
i.push(o);
} while (i.length < t);
return i;
},
genRandomCardNumber: function(e, n, t) {
var i = [];
do {
var o = 3 === t ? Math.floor(36 * Math.random()) + 1 : Math.floor(52 * Math.random()) + 1;
null !== e ? i.includes(o) || e.includes(o) || i.push(o) : i.includes(o) || i.push(o);
} while (i.length < n * t);
return i;
},
genArrayToMultiArray: function(e, n, t) {
var i, o, r = 0, s = [];
for (i = 0; i < n; i++) {
s[i] = new Array(t);
for (o = 0; o < t; o++) s[i][o] = e[r++];
}
return s;
},
userName: "",
setUserName: function(e) {
this.userName = e;
},
getUserName: function() {
return this.userName;
},
displayName: "",
setDisplayName: function(e) {
this.displayName = e;
},
getDisplayName: function() {
return this.displayName.empty() ? getUserName() : this.displayName;
},
getUserId: function() {
return this.userInfo.userid;
},
level: 0,
setLevel: function(e) {
this.level = e;
},
getLevel: function() {
return this.level;
},
avatarId: 0,
setAvatarId: function(e) {
this.avatarId = e;
},
getAvatarId: function() {
return this.avatarId < 1e5 || 100021 < this.avatarId ? 1e5 : this.avatarId;
},
getPackageName: function() {
if (!cc.sys.isNative) return "com.gamebai.tienlen";
if (cc.sys.platform == cc.sys.ANDROID) return "com.gamebai.tienlen";
if (cc.sys.platform == cc.sys.IPHONE || cc.sys.platform == cc.sys.IPAD) {
console.log("PACKAGE : com.gamebai.tienlen");
return "com.gamebai.tienlen";
}
},
getCp: function() {
return "24";
},
getVersionCode: function() {
return "15";
},
phoneNumber: "",
setPhoneNunber: function(e) {
this.phoneNumber = e;
},
getPhoneNumber: function() {
return this.phoneNumber;
},
accountVerify: !0,
setAccountVerify: function(e) {
this.accountVerify = e;
},
getAccountVerify: function() {
return this.accountVerify;
},
disableCashTransaction: !1,
setDisableCashTransaction: function(e) {
this.disableCashTransaction = e;
},
getDisableCashTransaction: function() {
return this.disableCashTransaction;
},
securityKeySeted: !1,
setSecurityKeySeted: function(e) {
this.securityKeySeted = e;
},
getSecurityKeySeted: function() {
return this.securityKeySeted;
},
_autoReady: !1,
setAutoReady: function(e) {
this._autoReady = e;
},
isAutoRead: function() {
return this._autoReady;
},
_autoDenyInvitation: !1,
setAutoDenyInvitation: function(e) {
this._autoDenyInvitation = e;
},
isAutoDenyInvitation: function() {
return this._autoDenyInvitation;
},
enableEvent: !1,
setEnableEvent: function(e) {
this.enableEvent = e;
},
isEnableEvent: function() {
return this.enableEvent;
},
enableNotify: !1,
setEnableNotification: function(e) {
this.enableNotify = e;
},
isEnableNotification: function() {
return this.enableNotify;
},
enableTaixiu: !0,
setEnableTaixiu: function(e) {
this.enableTaixiu = e;
},
isEnableTaixiu: function() {
return this.enableTaixiu;
},
noticeText: "",
setNoticeText: function(e) {
this.noticeText = e;
},
getNoticeText: function() {
return this.noticeText;
},
numberFormatWithCommas: function(e) {
return e.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
},
convertIntToMoneyView: function(e) {
for (var n = 0; 1e3 <= e; ) {
e /= 1e3;
n++;
}
return e + [ "", "K", "M", "B" ][n];
},
enterZone: [],
setEnterZone: function(e) {
this.enterZone = e;
},
getEnterZone: function() {
return this.enterZone;
},
_miniGameZoneId: -1,
getMiniGameZoneId: function() {
return this._miniGameZoneId;
},
setMiniGameZoneId: function(e) {
this._miniGameZoneId = e;
},
setHeadLineEmergency: function(e) {
this.headLineEmergency = e;
},
getHeadLineEmergency: function() {
return this.headLineEmergency;
},
setNotificationEmergency: function(e) {
this.notifycationEmergency = e;
},
getNotificationEmergency: function() {
return this.notifycationEmergency;
},
timestampToDate: function(e) {
var n = new Date(Number(e)), t = n.getDate(), i = n.getMonth() + 1, o = n.getFullYear();
return n.getHours() + ":" + n.getMinutes() + " " + ((t <= 9 ? "0" + t : t) + "/" + (i <= 9 ? "0" + i : i) + "/" + o);
},
timeToDate: function(e) {
var n = new Date(Number(e)), t = n.getDate(), i = n.getMonth() + 1;
return (t <= 9 ? "0" + t : t) + "/" + (i <= 9 ? "0" + i : i) + "/" + n.getFullYear();
},
closePopup: function(e) {
var n = cc.director.getScene();
cc.isValid(n) && cc.isValid(n.getChildByName(e)) && n.getChildByName(e).destroy();
},
showPopup: function(o, r) {
var s = cc.director.getScene();
cc.isValid(s) && !cc.isValid(s.getChildByName(o)) && cc.loader.loadRes("prefabs/" + o, function(e, n) {
if (e) cc.log("Lỗi load popup,thêm popup vào resources."); else {
var t = cc.instantiate(n);
if (cc.isValid(t)) {
t.x = Common.width / 2;
t.y = Common.height / 2;
if (r) {
var i = t.getComponent(o);
i.setNamePopup(o);
r(i);
s.addChild(t, Config.index.POPUP);
}
}
}
});
},
countNumberAnim: function(t, e, n, r, i, o) {
for (var s = {
useEasing: !0,
useGrouping: !0,
separator: ".",
decimal: ","
}, a = null, c = 0, u = [ "webkit", "moz", "ms", "o" ], f = 0; f < u.length && !window.requestAnimationFrame; ++f) {
window.requestAnimationFrame = window[u[f] + "RequestAnimationFrame"];
window.cancelAnimationFrame = window[u[f] + "CancelAnimationFrame"] || window[u[f] + "CancelRequestAnimationFrame"];
}
window.requestAnimationFrame || (window.requestAnimationFrame = function(e, n) {
var t = new Date().getTime(), i = Math.max(0, 16 - (t - c)), o = window.setTimeout(function() {
e(t + i);
}, i);
c = t + i;
return o;
});
window.cancelAnimationFrame || (window.cancelAnimationFrame = function(e) {
clearTimeout(e);
});
var l = function(e) {
a || (a = e);
var n = (e = e) - a;
p = s.useEasing ? I ? g - E(n, 0, g - d, i) : E(n, g, d - g, i) : I ? g - n / i * (g - d) : g + n / i * (d - g);
p = I ? p < d ? d : p : d < p ? d : p;
p = Math.round(p * y) / y;
T(p);
n < i && requestAnimationFrame(l);
}, m = function(e) {
for (var n = (e += "").split(","), t = n[0], i = 1 < n.length ? "," + n[1] : "", o = /(\d+)(\d{3})/; o.test(t); ) t = t.replace(o, "$1.$2");
return t + i;
};
for (var h in s) s.hasOwnProperty(h) && (s[h] = s[h]);
"" === s.separator && (s.useGrouping = !1);
s.prefix || (s.prefix = "");
s.suffix || (s.suffix = "");
var g = Number(e), d = Number(n), I = d < g, p = g, y = (r = Math.max(0, r || 0), 
Math.pow(10, r)), T = (i = 1e3 * Number(i) || 2e3, function(e) {
var n = isNaN(e) ? "0" : function(e) {
e = e.toFixed(r);
var n, t = (e += "").split(".");
n = t[0];
var i = 1 < t.length ? s.decimal + t[1] : "", o = /(\d+)(\d{3})/;
if (s.useGrouping) for (;o.test(n); ) n = n.replace(o, "$1" + s.separator + "$2");
return s.prefix + n + i + s.suffix;
}(e);
t.string = null != o && "" != o ? o + m(n) : m(n);
}), E = function(e, n, t, i) {
return t * (1 - Math.pow(2, -10 * e / i)) * 1024 / 1023 + n;
};
void requestAnimationFrame(l);
},
convertAlias: function(e) {
var n = e;
return n = (n = (n = (n = (n = (n = (n = (n = (n = (n = (n = (n = (n = (n = (n = (n = (n = n.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")).replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A")).replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")).replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E")).replace(/ì|í|ị|ỉ|ĩ/g, "i")).replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I")).replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")).replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "Ơ")).replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")).replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U")).replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")).replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y")).replace(/đ/g, "d")).replace(/Đ/g, "D")).replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|`|-|{|}|\||\\/g, " ")).replace(/ + /g, " ")).trim();
},
wordWrap: function(e, n) {
var t = "\n", i = !1, o = "";
do {
for (var r = !1, s = n - 1; 0 <= s; s--) if (this.testWhite(e.charAt(s))) {
o += [ e.slice(0, s), t ].join("");
e = e.slice(s + 1);
r = !0;
break;
}
if (!r) {
o += [ e.slice(0, n), t ].join("");
e = e.slice(n);
}
e.length < n && (i = !0);
} while (!i);
return o + e;
},
testWhite: function(e) {
return new RegExp(/^\s$/).test(e.charAt(0));
},
isWhiteSpaceText: function(e) {
for (var n = 0; n < e.length; n++) if (this.testWhite(e.charAt(n))) return !0;
return !1;
},
rgbToHex: function(e, n, t) {
return "#" + ((1 << 24) + (e << 16) + (n << 8) + t).toString(16).slice(1);
},
textColor: function(e, n) {
return "<color=" + this.rgbToHex(n.r, n.g, n.b) + ">" + e + "</color> ";
},
getHeadHistory: function(e) {
switch (this.getZoneId()) {
case Config.TAG_GAME_ITEM.MINI_BACAY:
case Config.TAG_GAME_ITEM.MINI_POKER:
case Config.TAG_GAME_ITEM.TREASURE:
return 1 === e ? [ "Thời gian", "Phiên", "Đặt", "Thắng", "Chi tiết" ] : [ "Thời gian", "Tên", "Đặt", "Thắng", "Chi tiết" ];

case Config.TAG_GAME_ITEM.TAIXIU:
return 1 === e ? [ "Phiên", "Thời gian", "Đặt tài", "Đặt xỉu", "Hoàn tài", "Hoàn xỉu", "Kết quả", "Tiền thắng" ] : [ "Thời gian", "Tên", "Đặt tài", "Đặt xỉu", "Hoàn tài", "Hoàn xỉu", "Tiền thắng" ];
}
},
showToast: function(i, e) {
if ("" != i) {
var o = void 0 !== e ? e : 2, r = cc.director.getScene();
if (cc.isValid(r)) if (cc.isValid(r.getChildByName("Toast"))) {
r.getChildByName("Toast").getComponent("Toast").loadMessage(i, o);
} else cc.loader.loadRes("prefabs/Toast", function(e, n) {
if (!e) {
var t = cc.instantiate(n);
if (cc.isValid(t)) {
t.x = Common.width / 2;
t.y = Common.height / 2;
t.getComponent("Toast").loadMessage(i, o);
r.addChild(t, Config.index.LOADING);
}
}
});
}
},
openRules: function() {
var n = [ "Mini Poker", "Mini Ba Cây", "Tài xỉu", "Treasure" ];
Common.showPopup(Config.name.POPUP_WEBVIEW, function(e) {
e.addTabs(n, 1);
e.appear();
});
},
new_phone: "",
getNewPhone: function() {
return this.new_phone;
},
setNewPhone: function(e) {
this.new_phone = e;
},
getPointName: function(e, n) {
var t = "NAN,A,2,3,4,5,6,7,8,9,10,J,Q,K".split(",");
n === Config.TAG_GAME_ITEM.MINI_POKER && (t = "NAN,2,3,4,5,6,7,8,9,10,J,Q,K,A".split(","));
return t[e];
},
getSuitName: function(e, n) {
var t = cc.Enum({
Spade: 1,
Heart: 3,
Club: 2,
Diamond: 0
});
n === Config.TAG_GAME_ITEM.MINI_POKER && (t = cc.Enum({
Spade: 1,
Heart: 0,
Club: 2,
Diamond: 3
}));
return t[e];
},
isBlackSuit: function(e, n) {
var t = cc.Enum({
Spade: 1,
Heart: 3,
Club: 2,
Diamond: 0
});
n === Config.TAG_GAME_ITEM.MINI_POKER && (t = cc.Enum({
Spade: 1,
Heart: 0,
Club: 2,
Diamond: 3
}));
return e === t.Spade || e === t.Club;
},
isRedSuit: function(e, n) {
var t = cc.Enum({
Spade: 1,
Heart: 3,
Club: 2,
Diamond: 0
});
n === Config.TAG_GAME_ITEM.MINI_POKER && (t = cc.Enum({
Spade: 1,
Heart: 0,
Club: 2,
Diamond: 3
}));
return e === t.Heart || e === t.Diamond;
}
};