require = function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = "function" == typeof require && require;
        if (!u && a) return a(o, !0);
        if (i) return i(o, !0);
        var f = new Error("Cannot find module '" + o + "'");
        throw f.code = "MODULE_NOT_FOUND", f;
      }
      var l = n[o] = {
        exports: {}
      };
      t[o][0].call(l.exports, function(e) {
        var n = t[o][1][e];
        return s(n || e);
      }, l, l.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = "function" == typeof require && require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
}({
  BaCayScripts: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "0e13dxGd+9OFKjEHr3SXHmG", "BaCayScripts");
    "use strict";
    var NetworkManager = require("NetworkManager");
    var BaseScene = require("BaseScene");
    var BacaySence = cc.Class({
      extends: BaseScene,
      properties: {
        bg: cc.Sprite,
        cardPrefab: cc.Prefab,
        toastPrefab: cc.Prefab,
        cardView: cc.Mask,
        userMoney: cc.Label,
        moneyBet: cc.Label,
        moneyJar: cc.Label,
        roomName: cc.Sprite,
        fastSpinToggle: cc.Toggle,
        autoSpinToggle: cc.Toggle,
        isFinishSpin: true,
        isRun: false,
        updateMoneyResponse: [],
        enterZoneResponse: [],
        enterRoomResponse: [],
        isUpdateMoney: false,
        nohuPrefab: cc.Prefab,
        isBreakJar: false,
        bet: 0,
        jarType: 1,
        isRequestJar: false,
        popupPrefab: cc.Prefab
      },
      statics: {
        instance: null
      },
      exitRoom: function exitRoom() {
        cc.director.loadScene("Table");
      },
      onLoad: function onLoad() {
        BacaySence.instance = this;
        Common.setMiniPokerSceneInstance(cc.director.getScene());
        window.ws.onmessage = this.ongamestatus.bind(this);
        this.userMoney.string = Common.getCash();
        for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) {
          var item = cc.instantiate(this.cardPrefab);
          var posX = 0;
          posX = 0 === j ? -item.getContentSize().width : 2 === j ? item.getContentSize().width : 0;
          var posY = 0;
          posY = 0 === i ? item.getContentSize().height : 1 === i ? 0 : -(i - 1) * item.getContentSize().height;
          item.getComponent("CardItem").init();
          item.setPositionY(posY);
          item.setPositionX(posX);
          this.cardView.node.addChild(item);
        }
      },
      initDataFromLoading: function initDataFromLoading(enterZone, enterRoom) {
        this.setEnterZoneResponse(enterZone);
        Common.setMiniGameZoneId(enterZone.getZoneid());
        this.setEnterRoomResponse(enterRoom);
        this.init(enterRoom);
      },
      init: function init(response) {
        var roomPlay = response.getRoomplay();
        this.roomIndex = roomPlay.getRoomindex();
        if (response.getArgsList().length > 0) {
          var entry = response.getArgsList()[0];
          "initValue" === entry.getKey() && this.initValue(entry.getValue());
        }
      },
      update: function update(dt) {
        this.handleAutoSpin();
      },
      quayEvent: function quayEvent() {
        var item = cc.instantiate(this.toastPrefab).getComponent("ToastScripts");
        var money = Common.getCash();
        var betMoney = this.getBetMoney();
        cc.log("betMoney =", betMoney);
        if (betMoney > money) {
          var message = "Bạn không có đủ tiền!";
          this.showToast(message, this, 2);
          return;
        }
        if (this.autoSpinToggle.isChecked) return;
        if (this.isRun) {
          var message = "Xin vui lòng đợi!";
          this.showToast(message, this, 2);
        } else this.getTurnMiniThreeCardsRequest(this.calculateTurnType());
      },
      getTurnMiniThreeCardsRequest: function getTurnMiniThreeCardsRequest(turnType) {
        this.isRun = true;
        var entries = [];
        var entry = new proto.BINMapFieldEntry();
        entry.setKey("turnSlotType");
        entry.setValue(turnType.toString());
        entries.push(entry);
        NetworkManager.getTurnMessageFromServer(0, entries);
      },
      ongamestatus: function ongamestatus(event) {
        if (null !== event.data || "undefined" !== typeof event.data) {
          var lstMessage = NetworkManager.parseFrom(event.data, event.data.byteLength);
          if (lstMessage.length > 0) for (var i = 0; i < lstMessage.length; i++) {
            var buffer = lstMessage[i];
            this.handleMessage(buffer);
          }
        }
      },
      exitRoomResponsehandler: function exitRoomResponsehandler(resp) {
        cc.log("exit room response handler:", resp.toObject());
        resp.getResponsecode();
        resp.hasMessage();
      },
      exitZoneResponseHandler: function exitZoneResponseHandler(resp) {
        cc.log("exit zone response handler:", resp.toObject());
        resp.getResponsecode();
        resp.hasMessage();
      },
      handleMessage: function handleMessage(buffer) {
        cc.log("buffer =", buffer.message_id);
        switch (buffer.message_id) {
         case NetworkManager.MESSAGE_ID.UPDATE_MONEY:
          var msg = buffer.response;
          this.updateMoneyMessageResponseHandler(msg);
          break;

         case NetworkManager.MESSAGE_ID.MATCH_END:
          this.matchEndResponseHandler(buffer.response);
          break;

         case NetworkManager.MESSAGE_ID.EXIT_ROOM:
          var msg = buffer.response;
          this.exitRoomResponsehandler(msg);
          break;

         case NetworkManager.MESSAGE_ID.ENTER_ROOM:
          var msg = buffer.response;
          this.enterRoomResponseHandler(msg);
          break;

         case NetworkManager.MESSAGE_ID.EXIT_ZONE:
          var msg = buffer.response;
          this.exitZoneResponseHandler(msg);
          break;

         case NetworkManager.MESSAGE_ID.JAR:
          var msg = buffer.response;
          this.jarResponseHandler(msg);
        }
      },
      updateMoneyMessageResponseHandler: function updateMoneyMessageResponseHandler(response) {
        if (response.getResponsecode()) {
          this.setBinUpdateMoney(response);
          this.removeTurnUpdateMoney();
        }
      },
      setBinUpdateMoney: function setBinUpdateMoney(response) {
        this.updateMoneyResponse = response;
      },
      getBINUpdateMoneyResponse: function getBINUpdateMoneyResponse() {
        return this.updateMoneyResponse;
      },
      setEnterZoneResponse: function setEnterZoneResponse(response) {
        this.enterZoneResponse = response;
      },
      getEnterZoneResponse: function getEnterZoneResponse() {
        return this.enterZoneResponse;
      },
      setEnterRoomResponse: function setEnterRoomResponse(response) {
        this.enterRoomResponse = response;
      },
      getEnterRoomResponse: function getEnterRoomResponse() {
        return this.enterRoomResponse;
      },
      removeTurnUpdateMoney: function removeTurnUpdateMoney() {
        var updateMoneyResponse = this.getBINUpdateMoneyResponse();
        cc.log("updateMoneyResponse =", updateMoneyResponse.getMoneyboxesList());
        if (updateMoneyResponse.getResponsecode()) for (var i = 0; i < updateMoneyResponse.getMoneyboxesList().length; i++) {
          var money_box = updateMoneyResponse.getMoneyboxesList()[i];
          if ("miniBacaySpin" === money_box.getReason()) {
            var origin_money = money_box.getCurrentmoney();
            Common.setCash(origin_money);
            this.userMoney.string = origin_money;
          }
        }
      },
      matchEndResponseHandler: function matchEndResponseHandler(response) {
        if (response.getResponsecode()) {
          if (response.getArgsList().length > 0) for (var i = 0; i < response.getArgsList().length; i++) if ("currentCards" === response.getArgsList()[i].getKey()) {
            var str = response.getArgsList()[i].getValue();
            var currentCards = str.split(",").map(Number);
            this.implementSpinMiniThreeCards(currentCards, response);
          }
        } else {
          this.isRun = false;
          this.autoSpinToggle.isChecked = false;
        }
      },
      implementSpinMiniThreeCards: function implementSpinMiniThreeCards(carx, response) {
        cc.log("carx =", carx);
        this.cardView.node.removeAllChildren(true);
        var text_emoticon = response.getTextemoticonsList()[0];
        this.isFinishSpin = false;
        this.isBreakJar = 54 === text_emoticon.getEmoticonid();
        var stepCard = 11;
        var number = 3;
        var rs = Common.genRandomNumber(carx, stepCard, number);
        var test = Common.genArrayToMultiArray(rs, stepCard, number);
        test[stepCard - 2] = carx;
        cc.log("test carx =", test.length);
        for (var i = 0; i < test.length; i++) for (var j = 0; j < test[i].length; j++) {
          var item = cc.instantiate(this.cardPrefab);
          var cardValue = test[i][j];
          var posX = 0;
          posX = 0 === j ? -item.getContentSize().width : 2 === j ? item.getContentSize().width : 0;
          var posY = 0;
          posY = 0 === i ? -item.getContentSize().height : 1 === i ? 0 : (i - 1) * item.getContentSize().height;
          item.getComponent("CardItem").replaceCard(cardValue);
          item.setPositionY(posY);
          item.setPositionX(posX);
          this.cardView.node.addChild(item);
          var paddingCard = item.getContentSize().height;
          var moveAction = cc.moveBy(1.5 + .25 * j, cc.p(0, -(test.length - 3) * paddingCard));
          moveAction = 0 === j ? cc.moveBy(1.5 + .25 * j, cc.p(0, -(test.length - 3) * paddingCard)) : cc.moveBy(j - 1 + 1.5 + .25 * (j - 1) + (test.length - test[i].length) / stepCard, cc.p(0, -(test.length - 4) * paddingCard));
          if (2 === j && i === test.length - 1) {
            var emoticon = response.getTextemoticonsList()[0];
            var emotionId = emoticon.getEmoticonid();
            var message = emoticon.getMessage();
            var moneyResponse = this.getBINUpdateMoneyResponse();
            var callFunc = cc.callFunc(function() {
              this.handleRanking(emotionId, message, moneyResponse);
            }, this);
            var callFuncAutoSpin = cc.callFunc(function() {
              this.isBreakJar || (this.isFinishSpin = true);
            }, this);
            item.runAction(cc.sequence(moveAction, cc.moveBy(1.5, cc.p(0, -paddingCard)), callFunc, cc.delayTime(2), callFuncAutoSpin, null));
          } else 0 === j ? item.runAction(moveAction) : item.runAction(cc.sequence(moveAction, cc.moveBy(1.5, cc.p(0, -paddingCard))));
          item.runAction(moveAction);
        }
      },
      _onDealEnd: function _onDealEnd() {
        cc.log("run action");
      },
      handleAutoSpin: function handleAutoSpin() {
        if (this.autoSpinToggle.isChecked && !this.isRun && this.isFinishSpin) {
          var item = cc.instantiate(this.toastPrefab).getComponent("ToastScripts");
          var money = Common.getCash();
          var betMoney = this.getBetMoney();
          cc.log("betMoney =", betMoney);
          if (betMoney > money) {
            var message = "Bạn không có đủ tiền!";
            this.showToast(message, this, 2);
            this.autoSpinToggle.isChecked = false;
            return;
          }
          this.getTurnMiniThreeCardsRequest(this.calculateTurnType());
        }
      },
      handleRanking: function handleRanking(emoticonId, message, response) {
        if (54 === emoticonId) {
          this.showNoHu();
          this.isRun = false;
          return;
        }
        if (72 !== emoticonId) {
          this.isUpdateMoney = false;
          cc.log("mess =", message);
          var nodeChild = new cc.Node();
          nodeChild.parent = this.node;
          var lbl_text = nodeChild.addComponent(cc.Label);
          lbl_text.string = message;
          lbl_text.node.setPosition(cc.p(667, 375));
          lbl_text.node.color = cc.color(248, 213, 82, 255);
          var fadeout = cc.fadeOut(1);
          var callFunc = cc.callFunc(function() {
            for (var i = 0; i < response.getMoneyboxesList().length; i++) {
              var nodeMoney = new cc.Node();
              nodeMoney.parent = this.node;
              var moneybox = response.getMoneyboxesList()[i];
              if (moneybox.getDisplaychangemoney() > 0) {
                this.isUpdateMoney = true;
                var label_money = nodeMoney.addComponent(cc.Label);
                label_money.string = moneybox.getDisplaychangemoney().toString();
                label_money.node.setPosition(cc.p(667, 375));
                label_money.node.color = cc.color(248, 213, 82, 255);
                var fadeout = cc.fadeOut(1.5);
                label_money.node.runAction(cc.sequence(cc.moveBy(.5, cc.p(0, 20)), cc.delayTime(.25), cc.spawn(cc.moveBy(1, cc.p(0, 20)), fadeout, null), cc.removeSelf(), null));
              }
            }
          }, this);
          var callFuncUpdateMoney = cc.callFunc(function() {
            this.isUpdateMoney && this.setOriginMoney();
            this.isRun = false;
          }, this);
          lbl_text.node.runAction(cc.sequence(cc.moveBy(.5, cc.p(0, 50)), callFunc, cc.spawn(cc.moveBy(1, cc.p(0, 50)), fadeout, null), callFuncUpdateMoney, cc.removeSelf(), null));
        } else {
          this.setOriginMoney();
          this.isRun = false;
        }
      },
      setOriginMoney: function setOriginMoney() {
        var response = this.getBINUpdateMoneyResponse();
        if (0 !== response) for (var i = 0; i < response.getMoneyboxesList().length; i++) {
          var moneybox = response.getMoneyboxesList()[i];
          if (moneybox.getDisplaychangemoney() > 0) {
            var userInfo = Common.getUserInfo();
            if (moneybox.getUserid() == userInfo.userid) {
              var origin_money = moneybox.getCurrentmoney();
              Common.setCash(origin_money);
              this.userMoney.string = origin_money;
            }
          }
        }
        this.isRun = false;
      },
      jarResponseHandler: function jarResponseHandler(response) {
        cc.log("jarResponseHandler = ", response);
        if (response.getResponsecode()) {
          var jar_type_response = 0;
          var preJarValue = this.jarValue;
          this.jarValue = response.getJarvalue();
          if (response.getArgsList().length > 0) {
            var entry = response.getArgsList()[0];
            "jarType" === entry.getKey() && (jar_type_response = parseInt(entry.getValue().toString()));
          }
          if (jar_type_response === this.calculateTurnType()) {
            this.jarType === jar_type_response ? this.moneyJar.string = Common.numberFormatWithCommas(this.jarValue) : this.showJarValue(this.jarValue);
            this.jarType = jar_type_response;
          }
        }
        response.hasMessage() && !response.getMessage() && this.showToast(response.getMessage(), this);
        this.isRequestJar = false;
      },
      showNoHu: function showNoHu() {
        cc.log("showNoHu");
        var item = cc.instantiate(this.nohuPrefab).getComponent("Nohu");
        item.playAnim();
        var nodeChild = new cc.Node();
        nodeChild.parent = this.bg.node;
        nodeChild.addChild(item.node);
        var callFunc2 = cc.callFunc(function() {
          this.setOriginMoney();
          this.isBreakJar = false;
        });
        item.node.runAction(cc.sequence(cc.delayTime(2), callFunc2, cc.removeSelf(), null));
      },
      initValue: function initValue(json) {
        var results = JSON.parse(json);
        cc.log("results =", results);
        this.lbl_moneys = results.turnValueCash;
        cc.log("lbl_moneys =", this.lbl_moneys);
        var val = results.jarValue;
        this.showJarValue(val);
      },
      showJarValue: function showJarValue(val) {
        this.jarValue = val;
        var number_cash = Common.numberFormatWithCommas(this.jarValue);
        cc.log("number_cash =", number_cash);
        this.moneyJar.string = number_cash;
      },
      getBetMoney: function getBetMoney() {
        var args = this.getEnterRoomResponse();
        var argsList = args.getArgsList()[0];
        var json = null;
        "initValue" === argsList.getKey() && (json = argsList.getValue());
        var bet = this.getKeyBet();
        var results = JSON.parse(json);
        var betStepValue = results.turnValueCash;
        var betMoney = betStepValue[bet];
        return betMoney;
      },
      calculateTurnType: function calculateTurnType() {
        return this.getKeyBet() + 1;
      },
      setKeyBet: function setKeyBet(bet) {
        this.bet = bet;
      },
      getKeyBet: function getKeyBet() {
        return this.bet;
      },
      betEvent: function betEvent() {
        var currentBet = this.getKeyBet();
        0 === currentBet ? this.setKeyBet(1) : 1 === currentBet ? this.setKeyBet(2) : 2 === currentBet && this.setKeyBet(0);
        this.moneyBet.string = this.getBetMoney();
        this.requestJar();
      },
      showToast: function showToast(strMess, target, delayTime) {
        this._super(strMess, target, delayTime);
      },
      requestJar: function requestJar() {
        if (!this.isRequestJar) {
          this.isRequestJar = true;
          NetworkManager.getJarRequest(Common.getMiniGameZoneId(), this.calculateTurnType());
        }
      },
      showPopup: function showPopup() {
        var tabString = [ "Lịch sử quay", "Top cao thủ", "Lịch sử nổ hũ" ];
        var nodeChild = new cc.Node();
        nodeChild.parent = this.bg.node;
        var item = cc.instantiate(this.popupPrefab);
        item.getComponent("PopupIngameItem").init(tabString, "history");
        item.setPositionX(0);
        item.setPositionY(0);
        nodeChild.addChild(item);
      }
    });
    cc._RF.pop();
  }, {
    BaseScene: "BaseScene",
    NetworkManager: "NetworkManager"
  } ],
  BaseScene: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "72cc1llU4NOWJ09JQrdRdeg", "BaseScene");
    "use strict";
    var NetworkManager = require("NetworkManager");
    cc.Class({
      extends: cc.Component,
      onLoad: function onLoad() {
        cc.log("Base scene");
        cc.log("abc zxhyzzdas");
      },
      handleMessage: function handleMessage(buffer) {
        cc.log("buffer:", buffer);
        switch (buffer.message_id) {
         case NetworkManager.MESSAGE_ID.INITIALIZE:
          var msg = buffer.response;
          this.initialMessageResponseHandler(msg);
          break;

         case NetworkManager.MESSAGE_ID.PING:
          var msg = buffer.response;
          this.pingMessageResponseHandler(msg);
          break;

         case NetworkManager.MESSAGE_ID.LOGOUT:
          var msg = buffer.response;
          this.logOutMessageResponseHandler(msg);
        }
      },
      logOutMessageResponseHandler: function logOutMessageResponseHandler(resp) {
        cc.log("log out message:", resp.toObject());
        resp.getResponsecode() && cc.director.runScene("Intro");
      },
      initialMessageResponseHandler: function initialMessageResponseHandler(initialMessage) {
        cc.log("initialMessage", initialMessage);
        if (0 != initialMessage && initialMessage.getResponsecode()) {
          var serverAppVersion = initialMessage.getCurrentappversion();
          cc.log("serverAppVersion = ", serverAppVersion);
          var hot_lines = [];
          cc.log("hot_line size", initialMessage.getHotlinesList().length);
          for (var i = 0; i < initialMessage.getHotlinesList().length; i++) hot_lines.push(initialMessage.getHotlinesList()[i]);
          cc.log("hot_lines = ", hot_lines);
          var _gameIds = [];
          for (var i = 0; i < initialMessage.getEnablegameidsList().length; i++) _gameIds.push(initialMessage.getEnablegameidsList()[i]);
          cc.log("game id = ", _gameIds);
          Common.setEnableGameIds(_gameIds);
          cc.director.loadScene("Login");
        }
      },
      pingMessageResponseHandler: function pingMessageResponseHandler(res) {
        cc.log("ping response handler:", res);
        if (res.getResponsecode() && res.getDisconnect()) {
          Common.setSessionId("-1");
          res.hasMessage() && "" != res.getMessage() && cc.alert(res.getMessage());
          NetworkManager.closeConnection();
          this.scheduleOnce(this.goIntroScene, 2);
        }
      },
      showToast: function showToast(strMess, target, delayTime) {
        delayTime = null !== delayTime ? delayTime : 2;
        var nodeChild = new cc.Node();
        nodeChild.parent = target.node;
        var mess_bg = nodeChild.addComponent(cc.Sprite);
        mess_bg.node.setPosition(cc.p(cc.winSize.width / 2, cc.winSize.height / 2));
        var url = "resources/common/popup/setting/bg_popup_setting_text.png";
        var image = cc.url.raw(url);
        var texture = cc.textureCache.addImage(image);
        mess_bg.node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        var nodeChildLabel = new cc.Node();
        nodeChildLabel.parent = target.node;
        var message = nodeChildLabel.addComponent(cc.Label);
        message.node.setPosition(cc.p(cc.winSize.width / 2, cc.winSize.height / 2));
        message.string = strMess;
        mess_bg.node.runAction(cc.sequence(cc.delayTime(delayTime), cc.removeSelf(), null));
        message.node.runAction(cc.sequence(cc.delayTime(delayTime), cc.removeSelf(), null));
      }
    });
    cc._RF.pop();
  }, {
    NetworkManager: "NetworkManager"
  } ],
  CardItem: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f5d53nh7HRNxLAPWyMC3u8p", "CardItem");
    "use strict";
    var Types = require("Types");
    cc.Class({
      extends: cc.Component,
      properties: {
        point: cc.Label,
        suit: cc.Sprite,
        mainPic: cc.Sprite,
        cardBG: cc.Sprite,
        redTextColor: cc.Color.WHITE,
        blackTextColor: cc.Color.WHITE,
        texFrontBG: cc.SpriteFrame,
        texBackBG: cc.SpriteFrame,
        texFaces: {
          default: [],
          type: cc.SpriteFrame
        },
        texSuitBig: {
          default: [],
          type: cc.SpriteFrame
        },
        texSuitSmall: {
          default: [],
          type: cc.SpriteFrame
        }
      },
      onLoad: function onLoad() {
        Common.getZoneId() !== Config.TAG_GAME_ITEM.MINI_BACAY && (this.node.getComponent(cc.Sprite).spriteFrame = null);
      },
      init: function init() {
        this.texBackBG = this.texFrontBG;
        this.mainPic.node.active = false;
        this.point.node.active = false;
        this.point.node.active = false;
        this.suit.node.active = null;
      },
      replaceCard: function replaceCard(cardValue) {
        var pointValue = CardType.getPoint(cardValue);
        var suitValue = CardType.getSuit(cardValue);
        var card = new Types.Card(pointValue, suitValue);
        var isFaceCard = card.point > 10;
        this.mainPic.spriteFrame = isFaceCard ? this.texFaces[card.point - 10 - 1] : this.texSuitBig[card.suit];
        this.point.string = card.pointName;
        card.isRedSuit ? this.point.node.color = this.redTextColor : this.point.node.color = this.blackTextColor;
        this.suit.spriteFrame = this.texSuitSmall[card.suit];
      }
    });
    cc._RF.pop();
  }, {
    Types: "Types"
  } ],
  Card: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "063052X4uNDPK4UMk3seHhs", "Card");
    "use strict";
    var Suit = cc.Enum({
      Spade: 1,
      Heart: 2,
      Club: 3,
      Diamond: 4
    });
    var A2_10JQK = "NAN,A,2,3,4,5,6,7,8,9,10,J,Q,K".split(",");
    function Card(cardValue) {
      Object.defineProperties(this, {
        point: {
          value: parseInt(cardValue / 4) + 1,
          writable: false
        },
        suit: {
          value: cardValue % 4,
          writable: false
        },
        pointName: {
          get: function get() {
            return A2_10JQK[this.point];
          }
        },
        suitName: {
          get: function get() {
            return Suit[this.suit];
          }
        },
        isBlackSuit: {
          get: function get() {
            return this.suit === Suit.Spade || this.suit === Suit.Club;
          }
        },
        isRedSuit: {
          get: function get() {
            return this.suit === Suit.Heart || this.suit === Suit.Diamond;
          }
        }
      });
    }
    module.exports = {
      Suit: Suit,
      Card: Card
    };
    cc._RF.pop();
  }, {} ],
  ChargeItem: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ec376hgchdOQIT0GZrfKY/n", "ChargeItem");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        scrollView: cc.ScrollView,
        tableView: cc.Node,
        providerPrefab: cc.Prefab
      },
      onLoad: function onLoad() {},
      init: function init(listProviders, target) {
        this.content = this.scrollView.content;
        this.tableContent = this.tableView.content;
        for (var i = 0; i < listProviders.length; i++) {
          var itemId = listProviders[i].getProviderid();
          var itemCode = listProviders[i].getProvidercode();
          var itemName = listProviders[i].getProvidername();
          var itemProduct = listProviders[i].getProductsList();
          cc.log("itemProduct =", itemProduct);
          var newChild = new cc.Node();
          newChild.parent = target.node;
          var posX = 600 * (i - listProviders.length / 2 + .5) / (listProviders.length + 1);
          var item = cc.instantiate(this.providerPrefab);
          item.getComponent("ProviderItem").init(itemName, i);
          item.setPositionX(posX);
          item.setPositionY(-item.getContentSize().height);
          newChild.addChild(item);
          var number = itemProduct.length;
          var headCell = [ "Mệnh giá thẻ", "KM", "Mon" ];
          var data = this._getdata(headCell, itemProduct, number);
          this.tableView.getComponent(cc.tableView).initTableView(data.length, {
            array: data,
            target: target.node
          });
        }
      },
      _getdata: function _getdata(headCell, val, num) {
        var array = [];
        var headObj = {};
        headObj.parValue = headCell[0];
        headObj.promotion = headCell[1];
        headObj.cashValue = headCell[2];
        array.push(headObj);
        for (var i = 0; i < num; ++i) {
          var obj = {};
          obj.parValue = val[i].getParvalue();
          obj.promotion = val[i].getPromotion();
          obj.cashValue = val[i].getCashvalue();
          array.push(obj);
        }
        cc.log("array =", array);
        return array;
      }
    });
    cc._RF.pop();
  }, {} ],
  CommonPopup: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2a6e8xQhhVDpZVo6NJrceha", "CommonPopup");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        btnOK: cc.Button,
        btnCancel: cc.Button,
        btnClose: cc.Button,
        message: cc.Label,
        type: 0,
        CONFIRM_TYPE: 0,
        MESSAGEBOX_TYPE: 1,
        _callback: function _callback() {}
      },
      closePopup: function closePopup() {
        this.node.removeFromParent(true);
      },
      onLoad: function onLoad() {},
      onCallBack: function onCallBack() {
        this._callback();
        this.node.removeFromParent(true);
      },
      init: function init(msg, type, callback) {
        this.message.string = msg;
        switch (type) {
         case 0:
          this.btnCancel.node.active = false;
          this.btnOK.node.active = true;
          this.btnOK.node.setPositionX(0);
          break;

         case 1:
          this.btnCancel.node.active = true;
          this.btnOK.node.active = true;
          this.btnOK.node.setPositionX(-83);
        }
        this._callback = callback;
      }
    });
    cc._RF.pop();
  }, {} ],
  GameItem: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "859a2Sd0spOhLqqtX1Fexgr", "GameItem");
    "use strict";
    var NetworkManager = require("NetworkManager");
    cc.Class({
      extends: cc.Component,
      properties: {
        background: {
          default: null,
          type: cc.Button
        },
        money1: cc.Label,
        money2: cc.Label,
        money3: cc.Label,
        m1_value: 0,
        m2_value: 0,
        m3_value: 0,
        box: cc.Sprite
      },
      init: function init(rank, playerInfo) {
        var tagTabButton = [ Config.TAG_GAME_ITEM.MINI_BACAY, Config.TAG_GAME_ITEM.MINI_POKER, Config.TAG_GAME_ITEM.TAIXIU, Config.TAG_GAME_ITEM.VQMM ];
        var url = "resources/common/scene/lobby/icon_bacay.png";
        playerInfo === Config.TAG_GAME_ITEM.TAIXIU ? url = "resources/common/scene/lobby/icon_taixiu.png" : playerInfo === Config.TAG_GAME_ITEM.VQMM ? url = "resources/common/scene/lobby/icon_vqmm.png" : playerInfo === Config.TAG_GAME_ITEM.MINI_POKER ? url = "resources/common/scene/lobby/icon_pocker.png" : playerInfo === Config.TAG_GAME_ITEM.MINI_BACAY && (url = "resources/common/scene/lobby/icon_bacay.png");
        if (playerInfo === Config.TAG_GAME_ITEM.TAIXIU) {
          this.box.node.active = false;
          this.money1.node.active = false;
          this.money2.node.active = false;
          this.money3.node.active = false;
        }
        var image = cc.url.raw(url);
        var texture = cc.textureCache.addImage(image);
        this.background.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        var btn = this.background.getComponent(cc.Button);
        playerInfo === Config.TAG_GAME_ITEM.TAIXIU ? btn.node._tag = Config.TAG_GAME_ITEM.TAIXIU : playerInfo === Config.TAG_GAME_ITEM.VQMM ? btn.node._tag = Config.TAG_GAME_ITEM.VQMM : playerInfo === Common.ZONE_ID.MINI_POKER ? btn.node._tag = Config.TAG_GAME_ITEM.MINI_POKER : playerInfo === Config.TAG_GAME_ITEM.MINI_BACAY && (btn.node._tag = Config.TAG_GAME_ITEM.MINI_BACAY);
      },
      updateJarMoney: function updateJarMoney(value, jarType) {
        switch (jarType) {
         case 1:
          if (this.m1_value < value) {
            Common.updateMoney(this.money1, this.m1_value, this.m1_value, value);
            this.m1_value = value;
          }
          break;

         case 2:
          if (this.m2_value < value) {
            Common.updateMoney(this.money2, this.m2_value, this.m2_value, value);
            this.m2_value = value;
          }
          break;

         case 3:
          if (this.m3_value < value) {
            Common.updateMoney(this.money3, this.m3_value, this.m3_value, value);
            this.m3_value = value;
          }
        }
      },
      update: function update(dt) {},
      buttonEvent: function buttonEvent(e) {
        var tag = e.target._tag;
        Common.setGameTag(tag);
        var zoneId = Common.getZoneId();
        Common.setCurrentZoneId(zoneId);
        NetworkManager.requestEnterZoneMessage(Common.getZoneId());
      }
    });
    cc._RF.pop();
  }, {
    NetworkManager: "NetworkManager"
  } ],
  GameList: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "42450IuWRRDnrv2TK+Vl9Li", "GameList");
    "use strict";
    var NetworkManager = require("NetworkManager");
    var BacayScene = require("BaCayScripts");
    var minipoker = require("minipoker");
    cc.Class({
      extends: cc.Component,
      properties: {
        scrollView: cc.ScrollView,
        prefabGameItem: cc.Prefab,
        rankCount: 0,
        roomIndex: 0,
        lbl_moneys: [],
        jarValue: 0,
        timeDelta: 0,
        jarResponse: null
      },
      onLoad: function onLoad() {
        this.content = this.scrollView.content;
        this.populateList();
        this.scheduleOnce(this.goSceneTable, 1);
      },
      populateList: function populateList() {
        var listGame = [ 20, 19, 17, 18 ];
        this.requestJar();
        var contentWidth = 300 * listGame.length;
        this.content.setContentSize(contentWidth, this.content.getContentSize().height);
        for (var i = 0; i < listGame.length; ++i) {
          var item = cc.instantiate(this.prefabGameItem);
          item.setTag(listGame[i] + 1e3);
          item.getComponent("GameItem").init(i, listGame[i]);
          item.setPositionY(.06 * this.content.getContentSize().height);
          this.content.addChild(item);
        }
      },
      scrollToLeft: function scrollToLeft() {},
      scrollToRight: function scrollToRight() {
        this.scrollView.jumpTo(.25, 100);
      },
      requestJar: function requestJar() {
        NetworkManager.getJarRequest(0, null);
      },
      update: function update(dt) {
        this.timeDelta = this.timeDelta + dt;
        if (this.timeDelta >= 2) {
          this.requestJar();
          this.timeDelta = 0;
        }
      },
      goSceneTable: function goSceneTable() {
        window.ws.onmessage = this.ongamestatus.bind(this);
        this.unschedule(this.goSceneTable);
      },
      ongamestatus: function ongamestatus(event) {
        if (null !== event.data || "undefined" !== event.data) {
          var lstMessage = NetworkManager.parseFrom(event.data, event.data.byteLength);
          if (lstMessage.length > 0) for (var i = 0; i < lstMessage.length; i++) {
            var buffer = lstMessage[i];
            this.handleMessage(buffer);
          }
        }
      },
      jarResponseHandler: function jarResponseHandler(resp) {
        cc.log("jar response handler:", resp.toObject());
        if (resp.getResponsecode() && resp.getJarinfoList().length > 0) for (var i = 0; i < resp.getJarinfoList().length; i++) {
          var jarItem = resp.getJarinfoList()[i];
          var gameid = jarItem.getGameid();
          var value = jarItem.getValue();
          var jarType = jarItem.getJartype();
          var item = this.content.getChildByTag(gameid + 1e3);
          null !== item && "GameItem" === item.getName() && item.getComponent("GameItem").updateJarMoney(value, jarType);
        }
      },
      handleMessage: function handleMessage(buffer) {
        switch (buffer.message_id) {
         case NetworkManager.MESSAGE_ID.ENTER_ZONE:
          var msg = buffer.response;
          this.enterZoneMessageResponseHandler(msg);
          break;

         case NetworkManager.MESSAGE_ID.ENTER_ROOM:
          var msg = buffer.response;
          this.enterRoomResponseHandler(msg);
          break;

         case NetworkManager.MESSAGE_ID.JAR:
          var msg = buffer.response;
          this.jarResponseHandler(msg);
        }
      },
      enterZoneMessageResponseHandler: function enterZoneMessageResponseHandler(enterZoneMessage) {
        if (0 != enterZoneMessage && enterZoneMessage.getResponsecode()) {
          Common.setEnterZone(enterZoneMessage);
          var zoneId = enterZoneMessage.getZoneid();
          Common.setZoneId(zoneId);
          Common.setRequestRoomType(enterZoneMessage.getDefaultroomtypeload());
          if (enterZoneMessage.hasEnabledisplayroomlist() && enterZoneMessage.getEnabledisplayroomlist()) {
            var cashRoomList = [];
            if (enterZoneMessage.getCashroomconfigsList().length > 0) for (var i = 0; i < enterZoneMessage.getCashroomconfigsList().length; i++) cashRoomList.push(enterZoneMessage.getCashroomconfigsList()[i]);
            Common.setCashRoomList(cashRoomList);
          }
          -1 !== Common.getZoneId();
        }
      },
      enterRoomResponseHandler: function enterRoomResponseHandler(response) {
        cc.log("enter room response: ", response);
        if (response.getResponsecode()) {
          cc.log("enterZone = ", Common.getEnterZone());
          Common.getZoneId() === Common.ZONE_ID.MINI_BACAY ? cc.director.loadScene("BaCay", function() {
            BacayScene.instance.initDataFromLoading(Common.getEnterZone(), response);
          }) : Common.getZoneId() === Common.ZONE_ID.MINI_POKER && cc.director.loadScene("minipoker", function() {
            minipoker.instance.initDataFromLoading(Common.getEnterZone(), response);
          });
        }
      }
    });
    cc._RF.pop();
  }, {
    BaCayScripts: "BaCayScripts",
    NetworkManager: "NetworkManager",
    minipoker: "minipoker"
  } ],
  HistoryItem: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f30daod/sRB3LMeuxQDX872", "HistoryItem");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        tableView: cc.Node
      },
      onLoad: function onLoad() {},
      init: function init(data, target) {
        cc.log("data =", data);
        this.tableView.getComponent(cc.tableView).initTableView(data.length, {
          array: data,
          target: target
        });
      }
    });
    cc._RF.pop();
  }, {} ],
  Intro: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "21280PL/O1Pd64Ir01tHgff", "Intro");
    "use strict";
    var MyMessage = require("initialize_pb");
    var NetworkManager = require("NetworkManager");
    var BaseScene = require("BaseScene");
    cc.Class({
      extends: BaseScene,
      properties: {
        matchProgress: {
          default: null,
          type: cc.ProgressBar
        },
        isProgressing: true,
        toProgress: 0,
        deltaTime: 0,
        timeSchedule: 0
      },
      onLoad: function onLoad() {
        this._super();
        var self = this;
        cc.director.preloadScene("Login", function() {
          cc.log("Next scene preloaded");
          self.scheduleOnce(self.goGame, self.timeSchedule);
        });
      },
      update: function update(dt) {
        if (this.isProgressing) {
          this.deltaTime += dt;
          this.matchProgress.progress = this.deltaTime / this.timeSchedule;
          cc.log(this.deltaTime / this.timeSchedule);
          if (this.deltaTime > this.timeSchedule) {
            this.deltaTime = 0;
            this.isProgressing = false;
          }
        }
      },
      goGame: function goGame() {
        Common.setFingerprint();
        NetworkManager.connectNetwork();
        window.ws.onmessage = this.ongamestatus.bind(this);
        this.unschedule(this.goGame);
      },
      ongamestatus: function ongamestatus(event) {
        cc.log("response text msg:" + event);
        if (null !== event.data || "undefined" !== typeof event.data) {
          var lstMessage = NetworkManager.parseFrom(event.data, event.data.byteLength);
          if (lstMessage.length > 0) {
            var buffer = lstMessage.shift();
            this.handleMessage(buffer);
          }
        }
      },
      handleMessage: function handleMessage(buffer) {
        this._super(buffer);
      },
      openPopup: function openPopup() {
        this.addChild(this.setting);
      }
    });
    cc._RF.pop();
  }, {
    BaseScene: "BaseScene",
    NetworkManager: "NetworkManager",
    initialize_pb: "initialize_pb"
  } ],
  Lobby: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "0b550vtbRBB/pAj+ZK8at0D", "Lobby");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        prefabPopupTaiXiu: cc.Prefab
      },
      onLoad: function onLoad() {},
      onClickSetting: function onClickSetting() {
        cc.log("on click setting");
        var item = cc.instantiate(this.prefabPopupTaiXiu);
        this.node.setPosition(cc.p(0, 0));
        this.node.addChild(item);
      }
    });
    cc._RF.pop();
  }, {} ],
  Login: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f25c5yoIptMM4j8TxAUZf+1", "Login");
    "use strict";
    var NetworkManager = require("NetworkManager");
    var BaseScene = require("BaseScene");
    var CommonPopup = require("CommonPopup");
    cc.Class({
      extends: BaseScene,
      properties: {
        edt_username: cc.EditBox,
        edt_password: cc.EditBox,
        toastPrefab: cc.Prefab,
        messagePopup: cc.Prefab
      },
      onLoad: function onLoad() {
        Common.setFingerprint();
        if (null != this.edt_username && null != this.edt_password) {
          var user_name_text = cc.sys.localStorage.getItem("user_name");
          var user_pass_text = cc.sys.localStorage.getItem("user_password");
          if (null != user_name_text && null != user_pass_text) {
            this.edt_username.string = user_name_text;
            this.edt_password.string = user_pass_text;
          }
        }
        window.ws.onmessage = this.ongamestatus.bind(this);
        cc.log("scene:", cc.director.getScene());
      },
      ongamestatus: function ongamestatus(event) {
        if (null !== event.data || "undefined" !== typeof event.data) {
          var lstMessage = NetworkManager.parseFrom(event.data, event.data.byteLength);
          if (lstMessage.length > 0) {
            var buffer = lstMessage.shift();
            this.handleMessage(buffer);
          }
        }
      },
      handleMessage: function handleMessage(e) {
        var buffer = e;
        cc.log("response:", buffer);
        this._super(buffer);
        switch (buffer.message_id) {
         case NetworkManager.MESSAGE_ID.LOGIN:
          var msg = buffer.response;
          this.handleLoginResponseHandler(msg);
        }
      },
      handleLoginResponseHandler: function handleLoginResponseHandler(res) {
        cc.log("login response handler:", res);
        if (res.getResponsecode()) {
          var session_id = res.getSessionid();
          cc.log("session id:", session_id);
          Common.setSessionId(session_id);
          Common.setUserInfo(res.getUserinfo().toObject());
          cc.log("get user info:", res.getUserinfo().toObject());
          cc.sys.localStorage.setItem("session_id", session_id);
          cc.sys.localStorage.setItem("user_name", this.edt_username.string);
          cc.sys.localStorage.setItem("user_password", this.edt_password.string);
          res.hasUserinfo() && this.saveUserInfo(res.getUserinfo());
          res.hasUsersetting() && this.saveUserSetting(res.getUsersetting());
          res.hasEnableevent() && Common.setEnableEvent(res.getEnableevent());
          res.hasEnablenotification() && Common.setEnableNotification(res.getEnablenotification());
          res.hasEnabletx() && Common.setEnableTaixiu(res.getEnabletx());
          res.hasNoticetext() && Common.setNoticeText(res.getNoticetext());
          cc.director.loadScene("Lobby");
        }
        if (res.hasMessage() && "" !== res.getMessage()) {
          var messagebox = cc.instantiate(this.messagePopup).getComponent("CommonPopup");
          messagebox.init(res.getMessage(), 0, function() {
            cc.log("on callback");
          });
          cc.log("message box:", messagebox);
          messagebox.node.setPosition(cc.p(cc.winSize.width / 2, cc.winSize.height / 2));
          this.node.addChild(messagebox.node);
        }
      },
      handlePingResponseHandler: function handlePingResponseHandler(res) {
        cc.log("ping response handler:", res);
        if (res.getResponsecode() && res.getDisconnect()) {
          Common.setSessionId("-1");
          res.hasMessage() && "" != res.getMessage() && cc.alert(res.getMessage());
          NetworkManager.closeConnection();
          this.scheduleOnce(this.goIntroScene, 2);
        }
      },
      goIntroScene: function goIntroScene(e) {
        cc.director.loadScene("Intro");
      },
      login: function login() {
        cc.log("login normal");
        var username = this.edt_username.string;
        var password = this.edt_password.string;
        NetworkManager.requestLoginMessage(username, password);
      },
      register: function register() {
        cc.director.loadScene("Register");
      },
      loginFacebook: function loginFacebook() {
        this.loginFb([ "public_profile" ], function(code, response) {
          cc.log("code:", code);
          if (0 === code) {
            cc.log("login succeeded");
            cc.director.loadScene("Lobby");
          } else cc.log("Login failed, error #" + code + ": " + response);
        });
      },
      loginGoogle: function loginGoogle() {
        cc.log("login google");
      },
      close: function close() {},
      loginFb: function loginFb(permissions, callback) {
        var self = this;
        if ("function" == typeof permissions) {
          callback = permissions;
          permissions = [];
        }
        permissions.every(function(item) {
          if ("public_profile" != item) return true;
        }) && permissions.push("public_profile");
        var permissionsStr = permissions.join(",");
        FB.login(function(response) {
          if (response["authResponse"]) {
            self._isLoggedIn = true;
            self._userInfo = response["authResponse"];
            var permissList = response["authResponse"]["grantedScopes"].split(",");
            "function" === typeof callback && callback(0, {
              accessToken: response["authResponse"]["accessToken"],
              permissions: permissList
            });
          } else {
            self._isLoggedIn = false;
            self._userInfo = {};
            "function" === typeof callback && callback(response["error_code"] || 1, {
              error_message: response["error_message"] || "Unknown error"
            });
          }
        }, {
          scope: permissionsStr,
          return_scopes: true
        });
      },
      saveUserInfo: function saveUserInfo(userInfo) {
        Common.setUserName(userInfo.getUsername());
        userInfo.hasDisplayname() && Common.setDisplayName(userInfo.getDisplayname());
        userInfo.hasLevel() && Common.setLevel(userInfo.getLevel().getLevel());
        userInfo.hasCash() && Common.setCash(userInfo.getCash());
        userInfo.hasAvatarid() && Common.setAvatarId(userInfo.getAvatarid());
        userInfo.hasMobile() && Common.setPhoneNunber(userInfo.getMobile());
        userInfo.hasAccountverified() && Common.setAccountVerify(userInfo.getAccountverified());
        userInfo.hasDisablecashtransaction() && Common.setDisableCashTransaction(userInfo.getDisablecashtransaction());
        userInfo.hasSecuritykeyset() && Common.setSecurityKeySeted(userInfo.getSecuritykeyset());
      },
      saveUserSetting: function saveUserSetting(userSetting) {
        if (userSetting.hasAutoready()) {
          Common.setAutoReady(userSetting.getAutoready());
          cc.sys.localStorage.setItem("AUTOREADY", userSetting.getAutoready());
        }
        if (userSetting.hasAutodenyinvitation()) {
          Common.setAutoDenyInvitation(userSetting.getAutodenyinvitation());
          cc.sys.localStorage.setItem("DENY_INVITES", userSetting.getAutodenyinvitation());
        }
      },
      showToast: function showToast(strMess, target) {
        this._super(strMess, target);
      }
    });
    cc._RF.pop();
  }, {
    BaseScene: "BaseScene",
    CommonPopup: "CommonPopup",
    NetworkManager: "NetworkManager"
  } ],
  MButton: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "766c2loLlJPba69AJmZx9M3", "MButton");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        pressedScale: .8,
        transDuration: .1
      },
      onLoad: function onLoad() {
        var self = this;
        self.initScale = this.node.scale;
        self.button = self.getComponent(cc.Button);
        self.scaleDownAction = cc.scaleTo(self.transDuration, self.pressedScale);
        self.scaleUpAction = cc.scaleTo(self.transDuration, self.initScale);
        function onTouchDown(event) {
          this.stopAllActions();
          this.runAction(self.scaleDownAction);
        }
        function onTouchUp(event) {
          this.stopAllActions();
          this.runAction(self.scaleUpAction);
        }
        this.node.on("touchstart", onTouchDown, this.node);
        this.node.on("touchend", onTouchUp, this.node);
        this.node.on("touchcancel", onTouchUp, this.node);
      }
    });
    cc._RF.pop();
  }, {} ],
  NetworkManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "7c7c5GfmLlNub33YLJVy9mt", "NetworkManager");
    "use strict";
    var InitializeMessage = require("initialize_pb");
    var LoginMessage = require("login_pb");
    var EnterZoneMessage = require("enter_zone_pb");
    var RegisterMessage = require("register_pb");
    var NotificationMessage = require("notification_pb");
    var LogoutMessage = require("logout_pb");
    var NetworkManager = {
      MESSAGE_ID: {
        REGISTER: 1e3,
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
        LOCK_ROOM: 1022,
        KICK_PLAYER_OUT: 1023,
        CHANGE_RULE: 1024,
        SEND_TEXT_EMOTICON: 1025,
        ENTER_ROOM_GROUP: 1026,
        LOOK_UP_USER_TO_INVITE: 1027,
        INVITE_TO_ROOM: 1028,
        RELY_INVITATION: 1029,
        CANCEL_INVITATION: 1030,
        BET: 1031,
        EXIT_ZONE: 1032,
        CHANGE_HOST: 1033,
        EXTRA_BET: 1034,
        HOST_REGISTRATION: 1035,
        LOOK_UP_GAME_HISTORY: 1036,
        LOOK_UP_ROOM: 1037,
        UPDATE_USER_INFO: 1200,
        FILTER_TOP_USER: 1201,
        FILTER_MAIL: 1202,
        SEND_MAIL: 1203,
        DELETE_MAIL: 1204,
        READED_MAIL: 1205,
        CLAIM_ATTACH_ITEM: 1206,
        FILTER_FRIEND: 1207,
        ADD_FRIEND: 1208,
        FILTER_ADD_FRIEND: 1209,
        APPROVE_ADD_FRIEND: 1210,
        FIND_USER: 1211,
        VIEW_USER_INFO: 1212,
        REMOVE_FRIEND: 1213,
        LOCK_UP_MONEY_HISTORY: 1214,
        INSTANT_MESSAGE: 1215,
        UPDATE_USER_SETTING: 1216,
        PURCHASE_MONEY: 1217,
        FILTER_AVATAR: 1218,
        LEVEL_UP: 1219,
        MEDAL_UP: 1220,
        REDEEM_GIFT_CODE: 1221,
        REDEEM_GIFT_CODE_HISTORY: 1222,
        ASSET_CONFIG: 1223,
        EXCHANGE_ASSET: 1224,
        EXCHANGE_CASH_TO_GOLD: 1225,
        EXCHANGE_ASSET_HISTORY: 1226,
        PURCHASE_CASH_HISTORY: 1227,
        EXCHANGE_GOLD_HISTORY: 1228,
        SMS_CONFIG: 1229,
        CARD_CONFIG: 1230,
        USER_VERIFY_CONFIG: 1231,
        USER_VERIFY: 1232,
        FIND_USER_BY_ID: 1233,
        CASH_TRANSFER_CONFIG: 1234,
        CASH_TRANSFER: 1235,
        EXCHANGE_C2G_CONFIG: 1236,
        LUCKY_WHEEL_CONFIG: 1237,
        BUY_TURN: 1238,
        JAR: 1239,
        BUY_CHIP: 1240,
        IAP_CONFIG: 1241,
        COMPLETE_IAP: 1242,
        GOLD_CONFIG: 1243,
        PURCHASE_GOLD: 1244,
        USER_STATUS: 1245,
        AGENT: 1246,
        ADS_BONUS_CONFIG: 1247,
        ADS_BONUS: 1248,
        ZONE_STATUS: 1249,
        LOCK_MONEY: 1250,
        UNLOCK_MONEY: 1251,
        QUEST_INFO: 1252,
        CLAIM_QUEST_BONUS: 1253,
        OPEN_ID_CONNECT: 1254,
        INSTANT_MESSAGE_HISTORY: 1255,
        QUEST_NOTIFICATION: 1256,
        PAYMENT_STATUS: 1257,
        KILL_ROOM: 1300,
        APPROVE_EXCHANGE_ASSET: 1301,
        CHARGING_DEVICE_REGISTRATION: 1302,
        CHARGING_INFO: 1303,
        CHARGING_RESULT: 1304,
        AGENT_ACCOUNT_BALANCE: 1305,
        INITIALIZE: 1111,
        HEAD_LINE: 2222,
        EMERGENCY_NOTIFICATION: 3333,
        COUNT_DOWN: 4444,
        CAPTCHA: 5555,
        CLOSE_CONNECTION: 6666,
        RESET_PASSWORD: 7777,
        PING: 8888,
        EXPIRED_SESSION: 9999
      },
      URL: "ws://150.95.105.1:1280/megajackpot",
      sessionId: "",
      getSessionId: function getSessionId() {
        return NetworkManager.sessionId;
      },
      setSessionId: function setSessionId(_sessionId) {
        NetworkManager.sessionId = _sessionId;
      },
      requestMessage: function requestMessage(request, os, message_id, session_id) {
        var ackBuf = NetworkManager.initData(request, os, message_id, session_id);
        NetworkManager.callNetwork(ackBuf);
      },
      initData: function initData(request, os, messid, _session) {
        var lenSession = 0;
        null != _session && (lenSession = _session.length);
        var size = request.length + 9 + lenSession;
        var _offset = 0;
        var bb = new ByteBuffer(size);
        bb.writeUint8(os, _offset);
        var dataSize = request.length + 4;
        _offset++;
        bb.writeUint32(dataSize, _offset);
        _offset += 4;
        bb.writeUint16(lenSession, _offset);
        _offset += 2;
        var sessionByte = bb.writeUTF8String(_session, _offset);
        _offset += lenSession;
        bb.writeUint16(messid, _offset);
        _offset += 2;
        bb.append(request, "", _offset);
        return bb.toBuffer();
      },
      getTypeMessage: function getTypeMessage(msg, messageid, protoBufVar) {
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

         case NetworkManager.MESSAGE_ID.JAR:
          msg = proto.BINJarResponse.deserializeBinary(bytes);
          break;

         case NetworkManager.MESSAGE_ID.LOGOUT:
          msg = proto.BINLogoutResponse.deserializeBinary(bytes);
          break;

         case NetworkManager.MESSAGE_ID.LOOK_UP_GAME_HISTORY:
          msg = proto.BINLookUpGameHistoryResponse.deserializeBinary(bytes);
          break;

         case NetworkManager.MESSAGE_ID.CARD_CONFIG:
          msg = proto.BINCardConfigResponse.deserializeBinary(bytes);
        }
        return msg;
      },
      parseFrom: function parseFrom(read_str, len) {
        var lstMess = [];
        var bb = new ByteBuffer(len);
        bb.append(read_str);
        var lenPacket = len;
        while (lenPacket > 0) {
          var listMessages = [];
          var _offset = 0;
          var bytes_size = bb.readInt32(_offset);
          _offset += 4;
          var is_compress = bb.readInt8(_offset);
          _offset += 1;
          var left_byte_size = bytes_size - 1;
          lenPacket -= bytes_size + 4;
          var response = 0;
          bb = bb.copy(_offset);
          if (1 == is_compress) {
            var byteArray = new Uint8Array(bb);
            var bufArr = bb.view;
            var dataUnzip = cc.unzipBase64AsArray(bb.toString("base64"));
            var _offsetZip = 0;
            var bbZip = new ByteBuffer(dataUnzip.length);
            bbZip.append(dataUnzip, "", 0);
            var data_size_block_zip = bbZip.readInt16(_offsetZip);
            _offsetZip += 2;
            var messageidZip = bbZip.readInt16(_offsetZip);
            _offsetZip += 2;
            left_byte_size -= data_size_block_zip + 2;
            var protoBufVarZip = bbZip.copy(_offsetZip, data_size_block_zip + _offsetZip - 2);
            response = NetworkManager.getTypeMessage(response, messageidZip, protoBufVarZip);
            if (0 !== response) {
              left_byte_size -= data_size_block_zip + 2;
              var pairZip = {
                message_id: messageidZip,
                response: response
              };
              for (var i = 0; i < listMessages.length; i++) {
                var obj = listMessages[i];
                obj.message_id === messageidZip && listMessages.splice(i, 1);
              }
              listMessages.push(pairZip);
              lstMess.push(pairZip);
            } else cc.error("unknown message with message id:", messageidZip);
          } else while (left_byte_size > 0) {
            var _offsetUnzip = 0;
            var data_size_block = bb.readInt16(_offsetUnzip);
            _offsetUnzip += 2;
            var messageid = bb.readInt16(_offsetUnzip);
            _offsetUnzip += 2;
            var protoBufVar = bb.copy(_offsetUnzip, data_size_block + _offsetUnzip - 2);
            response = NetworkManager.getTypeMessage(response, messageid, protoBufVar);
            if (0 != response) {
              left_byte_size -= data_size_block + 2;
              bb = bb.copy(data_size_block + _offsetUnzip - 2);
              var pair = {
                message_id: messageid,
                response: response
              };
              for (var i = 0; i < listMessages.length; i++) {
                var obj = listMessages[i];
                obj.message_id == messageid && listMessages.splice(i, 1);
              }
              listMessages.push(pair);
              lstMess.push(pair);
            } else {
              cc.error("unknown message with message id:", messageid);
              left_byte_size -= data_size_block + 2;
              bb = bb.copy(data_size_block + _offsetUnzip - 2);
            }
          }
        }
        lenPacket > 0 && cc.log("NetworkManager: error packet length = 0");
        return lstMess;
      },
      initLogoutMessage: function initLogoutMessage() {},
      requestLogoutMessage: function requestLogoutMessage() {},
      initInitializeMessage: function initInitializeMessage(cp, appVersion, deviceId, deviceInfo, country, language, packageName, liteVersion, referenceCode) {
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
      requestInitializeMessage: function requestInitializeMessage(cp, appVersion, deviceId, deviceInfo, country, language, packageName, liteVersion, referenceCode) {
        var message = NetworkManager.initInitializeMessage(cp, appVersion, deviceId, deviceInfo, country, language, packageName, liteVersion, referenceCode);
        var data = NetworkManager.initData(message.serializeBinary(), Common.getOS(), NetworkManager.MESSAGE_ID.INITIALIZE, "");
        NetworkManager.callNetwork(data);
      },
      initLoginMessage: function initLoginMessage(userName, password) {
        var message = new proto.BINLoginRequest();
        message.setUsername(userName);
        message.setPassword(password);
        return message;
      },
      requestLoginMessage: function requestLoginMessage(userName, password) {
        var message = NetworkManager.initInitializeMessage(userName, password);
        this.callNetwork(this.initData(message.serializeBinary(), Common.getOS(), NetworkManager.MESSAGE_ID.LOGIN, ""));
      },
      initPingMessage: function initPingMessage(disconnectTime) {
        var message = new proto.BINPingRequest();
        message.setDisconecttime(disconnectTime);
        return message;
      },
      requestPingMessage: function requestPingMessage(disconnectTime) {
        var message = NetworkManager.initPingMessage(disconnectTime);
        this.callNetwork(this.initData(message.serializeBinary(), Common.getOS(), NetworkManager.MESSAGE_ID.PING, ""));
      },
      initEnterZoneMessage: function initEnterZoneMessage(zoneId) {
        var message = new proto.BINEnterZoneRequest();
        message.setZoneid(zoneId);
        return message;
      },
      initExitRoomMessage: function initExitRoomMessage(roomIndex) {
        var message = new proto.BINExitRoomRequest();
        message.setRoomindex(roomIndex);
        return message;
      },
      requestExitRoomMessage: function requestExitRoomMessage(roomIndex) {
        var message = this.initExitRoomMessage(roomIndex);
        cc.log("message = ", message);
        this.callNetwork(this.initData(message.serializeBinary(), Common.getOS(), NetworkManager.MESSAGE_ID.EXIT_ROOM, Common.getSessionId()));
      },
      requestEnterZoneMessage: function requestEnterZoneMessage(zoneId) {
        var message = NetworkManager.initEnterZoneMessage(zoneId);
        cc.log("message = ", message);
        this.callNetwork(this.initData(message.serializeBinary(), Common.getOS(), NetworkManager.MESSAGE_ID.ENTER_ZONE, Common.getSessionId()));
      },
      requestExitZoneMessage: function requestExitZoneMessage(zoneId) {
        var message = this.initExitZoneMessage(zoneId);
        this.callNetwork(this.initData(message.serializeBinary(), Common.getOS(), NetworkManager.MESSAGE_ID.EXIT_ZONE, Common.getSessionId()));
      },
      initExitZoneMessage: function initExitZoneMessage(zoneId) {
        var message = new proto.BINExitZoneRequest();
        message.setZoneid(zoneId);
        return message;
      },
      requestRegisterMessage: function requestRegisterMessage(username, password, repass, displayname, mobile) {
        var message = NetworkManager.initRegisterMessage(username, password, repass, displayname, mobile);
        this.callNetwork(this.initData(message.serializeBinary(), Common.getOS(), NetworkManager.MESSAGE_ID.REGISTER, ""));
      },
      initRegisterMessage: function initRegisterMessage(username, password, repass, displayname, mobile) {
        var message = new proto.BINRegisterRequest();
        message.setUsername(username);
        message.setPassword(password);
        message.setConfirmpassword(repass);
        message.setDisplayname(displayname);
        message.setMobile(mobile);
        return message;
      },
      initLookUpRoomRequest: function initLookUpRoomRequest(zoneId, type, firstResult, maxResult, orderByField, asc, roomGroup) {
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
      getLookUpRoomRequest: function getLookUpRoomRequest(zoneId, type, firstResult, maxResult, orderByField, asc, roomGroup) {
        var request = this.initLookUpRoomRequest(zoneId, type, firstResult, maxResult, orderByField, asc, roomGroup);
        this.callNetwork(this.initData(request.serializeBinary(), Common.getOS(), NetworkManager.MESSAGE_ID.LOOK_UP_ROOM, Common.getSessionId()));
      },
      getEnterRoomMessageFromServer: function getEnterRoomMessageFromServer(room_index, password) {
        var request = this.initEnterRoomMessage(room_index, password);
        this.callNetwork(this.initData(request.serializeBinary(), Common.getOS(), NetworkManager.MESSAGE_ID.ENTER_ROOM, Common.getSessionId()));
      },
      initEnterRoomMessage: function initEnterRoomMessage(room_index, password) {
        var request = new proto.BINEnterRoomRequest();
        request.setRoomindex(room_index);
        request.setPassword(password);
        return request;
      },
      initTurnMessage: function initTurnMessage(room_index, entries) {
        cc.log("entries =", entries);
        var request = new proto.BINTurnRequest();
        request.setRoomindex(room_index);
        request.setArgsList(entries);
        cc.log("request =", request);
        return request;
      },
      getTurnMessageFromServer: function getTurnMessageFromServer(room_index, entries) {
        var request = this.initTurnMessage(room_index, entries);
        this.callNetwork(this.initData(request.serializeBinary(), Common.getOS(), NetworkManager.MESSAGE_ID.TURN, Common.getSessionId()));
      },
      getJarRequest: function getJarRequest(zone_id, jarType) {
        var request = this.initJarRequest(zone_id, jarType);
        this.callNetwork(this.initData(request.serializeBinary(), Common.getOS(), NetworkManager.MESSAGE_ID.JAR, Common.getSessionId()));
      },
      initJarRequest: function initJarRequest(zone_id, jarType) {
        var request = new proto.BINJarRequest();
        request.setZoneid(zone_id);
        null !== jarType && request.setJartype(jarType);
        return request;
      },
      getLookUpGameHistoryRequest: function getLookUpGameHistoryRequest(firstResult, maxResult, entries, orderByField, asc) {
        cc.log("getLookUpGameHistoryRequest =", entries);
        var request = new proto.BINLookUpGameHistoryRequest();
        request.setFirstresult(firstResult);
        request.setMaxresult(maxResult);
        request.setArgsList(entries);
        if (0 !== orderByField) {
          request.setOrderbyfield(orderByField);
          request.setAsc(asc);
        }
        this.callNetwork(this.initData(request.serializeBinary(), Common.getOS(), NetworkManager.MESSAGE_ID.LOOK_UP_GAME_HISTORY, Common.getSessionId()));
      },
      getCardConfigRequest: function getCardConfigRequest(type) {
        var request = this.initCardConfigRequest(type);
        this.callNetwork(this.initData(request.serializeBinary(), Common.getOS(), NetworkManager.MESSAGE_ID.CARD_CONFIG, Common.getSessionId()));
      },
      initCardConfigRequest: function initCardConfigRequest(type) {
        var request = new proto.BINCardConfigRequest();
        request.setType(type);
        return request;
      },
      connectNetwork: function connectNetwork() {
        if (null === window.ws || "undefined" === typeof window.ws || window.ws.readyState === WebSocket.CLOSED) {
          window.ws = new WebSocket(NetworkManager.URL);
          window.listMessage = [];
          window.ws.binaryType = "arraybuffer";
          window.ws.onopen = function(event) {
            console.log("on web socket");
            NetworkManager.requestInitializeMessage("24", "15", Common.getFingerprint(), Common.getDeviceInfo(), "vn", "vi", Common.getPackageName(), false, "");
            setTimeout(function() {
              window.myInterval = setInterval(function() {
                NetworkManager.requestPingMessage(0);
              }, 15e3);
            }, 1);
          };
          window.ws.onclose = function(event) {
            console.log("Websocket instance was closed");
            clearInterval(window.myInterval);
          };
        }
      },
      closeConnection: function closeConnection() {
        window.ws.readyState == WebSocket.OPEN && window.ws.close();
      },
      callNetwork: function callNetwork(ackBuf) {
        if (null === window.ws || "undefined" === typeof window.ws || window.ws.readyState === WebSocket.CLOSED) {
          window.ws = new WebSocket(NetworkManager.URL);
          window.listMessage = [];
          window.ws.binaryType = "arraybuffer";
          window.ws.onopen = function(event) {
            console.log("on web socket");
            setTimeout(function() {
              window.ws.send(ackBuf);
            }, .5);
          };
          window.ws.onclose = function(event) {
            console.log("Websocket instance was closed");
          };
        } else window.ws.readyState == WebSocket.OPEN && window.ws.send(ackBuf);
      }
    };
    module.exports = NetworkManager;
    cc._RF.pop();
  }, {
    enter_zone_pb: "enter_zone_pb",
    initialize_pb: "initialize_pb",
    login_pb: "login_pb",
    logout_pb: "logout_pb",
    notification_pb: "notification_pb",
    register_pb: "register_pb"
  } ],
  Nohu: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "e4d0e7B1blOCrdny4snoQ1F", "Nohu");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        anim: cc.Animation
      },
      onLoad: function onLoad() {},
      playAnim: function playAnim() {
        cc.log("playAnim");
        this.anim.play("NoHu");
      },
      stopAnim: function stopAnim() {
        this.anim.stop("NoHu");
      }
    });
    cc._RF.pop();
  }, {} ],
  PopupIngameItem: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "bbe38KUoPhKO4CeHmk3EV3Z", "PopupIngameItem");
    "use strict";
    var NetworkManager = require("NetworkManager");
    var HISTORY_SPIN = 1;
    var HISTORY_BREAK_JAR = 2;
    var HISTORY_TOP_USER = 3;
    var lstCardConfig = [];
    var list_nhamang = [];
    var PopupIngame = cc.Class({
      extends: cc.Component,
      properties: {
        titleString: cc.Sprite,
        leftPrefab: cc.Prefab,
        scrollView: cc.ScrollView,
        historyType: 1,
        chargePrefab: cc.Prefab,
        historyPrefab: cc.Prefab,
        providerPrefab: cc.Prefab,
        contentPopup: cc.Node,
        tableView: cc.Node,
        tabScrollView: cc.ScrollView,
        providerTableView: cc.Node
      },
      statics: {
        instance: null
      },
      onLoad: function onLoad() {
        PopupIngame.instance = this;
        this.contentPopup.active = false;
        this.tableView.active = true;
        window.ws.onmessage = this.ongamestatus.bind(this);
      },
      setHistoryType: function setHistoryType(historyType) {
        this.historyType = historyType;
      },
      ongamestatus: function ongamestatus(event) {
        if (null !== event.data || "undefined" !== event.data) {
          var lstMessage = NetworkManager.parseFrom(event.data, event.data.byteLength);
          if (lstMessage.length > 0) {
            cc.log("lstMessage =", lstMessage);
            for (var i = 0; i < lstMessage.length; i++) {
              var buffer = lstMessage[i];
              this.handleMessage(buffer);
            }
          }
        }
      },
      handleMessage: function handleMessage(buffer) {
        switch (buffer.message_id) {
         case NetworkManager.MESSAGE_ID.LOOK_UP_GAME_HISTORY:
          var msg = buffer.response;
          this.lookupGameMiniPokerResponseHandler(msg);
          break;

         case NetworkManager.MESSAGE_ID.CARD_CONFIG:
          var msg = buffer.response;
          this.getCardConfigResponse(msg);
        }
      },
      lookupGameMiniPokerResponseHandler: function lookupGameMiniPokerResponseHandler(response) {
        if (0 !== response) {
          cc.log("look up game history response: ", response);
          response.hasMessage() && !response.getMessage();
          if (response.getResponsecode()) switch (this.historyType) {
           case HISTORY_BREAK_JAR:
           case HISTORY_SPIN:
           case HISTORY_TOP_USER:
            var number = response.getHistoriesList().length;
            var headCell = [ "Thời gian", "Tên", "Đặt", "Thắng", "Bộ bài" ];
            var data = this._getdata(headCell, response.getHistoriesList(), number);
            this.tableView.getComponent(cc.tableView).initTableView(data.length, {
              array: data,
              target: this
            });
          }
          if (response.getArgsList().length > 0) {
            var entry = response.getArgsList()[0];
            "totalCount" === entry.getKey() && (this.totalCount = parseInt(entry.getValue()));
          }
        }
      },
      getCardConfigResponse: function getCardConfigResponse(response) {
        if (0 != response && response.getResponsecode()) {
          this.contentPopup.active = true;
          this.tableView.active = false;
          var listProviders = response.getProvidersList();
          var nodeChild = new cc.Node();
          nodeChild.parent = this.tabScrollView.content;
          var contentWidth = 100 * listProviders.length;
          this.tabScrollView.content.setContentSize(contentWidth, this.tabScrollView.content.getContentSize().height);
          for (var i = 0; i < listProviders.length; i++) {
            var itemId = listProviders[i].getProviderid();
            var itemCode = listProviders[i].getProvidercode();
            var itemName = listProviders[i].getProvidername();
            var itemProduct = listProviders[i].getProductsList();
            var posX = (i - listProviders.length / 2 + .5) * contentWidth / (listProviders.length + 1);
            var item = cc.instantiate(this.providerPrefab);
            item.getComponent("ProviderItem").init(itemName, i);
            item.setPositionX(posX);
            item.setPositionY(-item.getContentSize().height);
            nodeChild.addChild(item);
            var number = itemProduct.length;
            var headCell = [ "Mệnh giá thẻ", "KM", "Mon" ];
            var data = this._getChargedata(headCell, itemProduct, number);
            this.providerTableView.getComponent(cc.tableView).initTableView(data.length, {
              array: data,
              target: this
            });
          }
        }
      },
      _getdata: function _getdata(headCell, val, num) {
        var array = [];
        var headObj = {};
        headObj.date_time = headCell[0];
        headObj.displayName = headCell[1];
        headObj.bet = headCell[2];
        headObj.betWin = headCell[3];
        headObj.betCard = headCell[4];
        array.push(headObj);
        for (var i = 0; i < num; ++i) {
          var obj = {};
          obj.date_time = Common.timestampToDate(val[i].getSixth());
          obj.displayName = val[i].getFirst();
          obj.bet = val[i].getThird();
          obj.betWin = val[i].getFourth();
          obj.betCard = val[i].getSecond();
          array.push(obj);
        }
        cc.log("array =", array);
        return array;
      },
      _getChargedata: function _getChargedata(headCell, val, num) {
        var array = [];
        var headObj = {};
        headObj.parValue = headCell[0];
        headObj.promotion = headCell[1];
        headObj.cashValue = headCell[2];
        array.push(headObj);
        for (var i = 0; i < num; ++i) {
          var obj = {};
          obj.parValue = val[i].getParvalue();
          obj.promotion = val[i].getPromotion();
          obj.cashValue = val[i].getCashvalue();
          array.push(obj);
        }
        cc.log("array =", array);
        return array;
      },
      init: function init(tab, name) {
        var nodeChild = new cc.Node();
        nodeChild.parent = this.scrollView.content;
        for (var i = 0; i < tab.length; i++) {
          var item = cc.instantiate(this.leftPrefab);
          item.getComponent("PopupLeftItem").init(i + 1, tab[i], name);
          var posX = 0;
          var posY = 0;
          posY = -(i + .5) * item.getContentSize().height;
          item.setPositionX(posX);
          item.setPositionY(posY);
          nodeChild.addChild(item);
        }
      },
      disappear: function disappear() {
        var callDisappear = cc.callFunc(function() {
          this.node.removeFromParent(true);
        }, this);
        var move = cc.moveTo(.05, cc.p(0, -200));
        this.node.runAction(cc.sequence(move, callDisappear));
      }
    });
    cc._RF.pop();
  }, {
    NetworkManager: "NetworkManager"
  } ],
  PopupLeftItem: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "cbbf6CyWFhBe4lz4sLcAaul", "PopupLeftItem");
    "use strict";
    var NetworkManager = require("NetworkManager");
    var PopupIngame = require("PopupIngameItem");
    var HISTORY_SPIN = 1;
    var HISTORY_BREAK_JAR = 2;
    var HISTORY_TOP_USER = 3;
    var MAX_RESULT = 20;
    var firstResult = -1;
    cc.Class({
      extends: cc.Component,
      properties: {
        titleBtn: cc.Label,
        background: cc.Button,
        historyType: 1
      },
      onLoad: function onLoad() {},
      init: function init(tag, titleStr, name) {
        this.titleBtn.string = titleStr;
        var btn = this.background.getComponent(cc.Button);
        btn.node._tag = tag;
        btn.node.name = name;
        switch (name) {
         case "history":
          this.getLookupMiniPokerHistoryRequest(firstResult, MAX_RESULT, this.historyType, true);
          break;

         case "charge":
          NetworkManager.getCardConfigRequest(1);
        }
      },
      btnEvent: function btnEvent(e) {
        var tag = e.target._tag;
        var name = e.target.name;
        cc.log("e =", e.target);
        switch (name) {
         case "history":
          if (1 === tag) {
            this.historyType = HISTORY_SPIN;
            PopupIngame.instance.setHistoryType(HISTORY_SPIN);
            this.getLookupMiniPokerHistoryRequest(firstResult, MAX_RESULT, this.historyType, true);
          } else if (2 === tag) {
            this.historyType = HISTORY_TOP_USER;
            PopupIngame.instance.setHistoryType(HISTORY_TOP_USER);
            this.getLookupMiniPokerHistoryRequest(firstResult, MAX_RESULT, this.historyType, true);
          } else if (3 === tag) {
            this.historyType = HISTORY_BREAK_JAR;
            PopupIngame.instance.setHistoryType(HISTORY_BREAK_JAR);
            this.getLookupMiniPokerHistoryRequest(firstResult, MAX_RESULT, this.historyType, true);
          }
          break;

         case "charge":
          NetworkManager.getCardConfigRequest(1);
        }
      },
      getLookupMiniPokerHistoryRequest: function getLookupMiniPokerHistoryRequest(firstResult, maxResult, historyType, isCash) {
        var entries = [];
        var entry = new proto.BINMapFieldEntry();
        entry.setKey("historyType");
        entry.setValue(historyType.toString());
        entries.push(entry);
        var entry1 = new proto.BINMapFieldEntry();
        entry1.setKey("isCash");
        entry1.setValue(isCash ? "true" : "false");
        entries.push(entry1);
        NetworkManager.getLookUpGameHistoryRequest(firstResult, maxResult, entries, -1, false);
      }
    });
    cc._RF.pop();
  }, {
    NetworkManager: "NetworkManager",
    PopupIngameItem: "PopupIngameItem"
  } ],
  PopupSetting: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "18f89hksvpN5onLoJPevQ0+", "PopupSetting");
    "use strict";
    var Popup = require("Popup");
    cc.Class({
      extends: Popup,
      properties: {
        type: cc.Node,
        prefabPopup: cc.Prefab
      },
      onLoad: function onLoad() {},
      appear: function appear() {
        this._super();
      },
      pList: function pList() {
        cc.log("aaaaaaaa", .06 * this.type.getContentSize().height);
        var item = cc.instantiate(this.prefabPopup);
        this.setPosition(cc.p(0, 0));
        this.node.addChild(item);
      }
    });
    cc._RF.pop();
  }, {
    Popup: "Popup"
  } ],
  PopupTaiXiu: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f6674Lbg7tEhLIWQyuXdPCX", "PopupTaiXiu");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        btnClose: cc.Button
      },
      onLoad: function onLoad() {},
      onClose: function onClose() {
        this.node.removeFromParent(true);
      }
    });
    cc._RF.pop();
  }, {} ],
  Popup: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "e8fe19wVx5F+Jx1y4MY0W6J", "Popup");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        dark_sprite: cc.Sprite,
        background: cc.Sprite,
        close: cc.Sprite,
        exit: cc.Sprite,
        lblExit: cc.Label
      },
      onLoad: function onLoad() {
        function onTouchDown(event) {
          return true;
        }
        this.node.on("touchstart", onTouchDown, this.dark_sprite);
      },
      disappear: function disappear() {
        var callDisappear = cc.callFunc(function() {
          this.node.removeFromParent(true);
        }, this);
        this.dark_sprite.node.runAction(cc.fadeOut(.1));
        var move = cc.scaleTo(.15, .5).easing(cc.easeBackIn());
        this.background.node.runAction(cc.sequence(move, callDisappear));
      },
      appear: function appear() {
        this.visible = true;
        var background = this.background;
        var self = this;
        function onTouchDown(touch, event) {
          var locationInNode = background.node.convertToNodeSpace(touch.getLocation());
          var rect = background.spriteFrame.getRect();
          if (!cc.rectContainsPoint(rect, locationInNode)) {
            self.disappear();
            return true;
          }
          return false;
        }
        this.node.on("touchstart", onTouchDown, background);
        this.dark_sprite.node.runAction(cc.fadeTo(.15, 150));
        this.background.node.setScale(.7);
        var action = cc.scaleTo(.2, 1).easing(cc.easeBackOut());
        this.background.node.runAction(cc.sequence(action, cc.callFunc(function() {}, this)));
      }
    });
    cc._RF.pop();
  }, {} ],
  ProviderItem: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "b991divrLBLfI0eIA9xpyPa", "ProviderItem");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        logoProvider: cc.Button
      },
      onLoad: function onLoad() {},
      init: function init(itemName, tag) {
        cc.log("tag =", tag);
        var url = "resources/common/popup/popup_ingame/popup_doithuong_vt_off.png";
        "Viettel" === itemName ? url = "resources/common/popup/popup_ingame/popup_doithuong_vt_off.png" : "Mobifone" === itemName ? url = "resources/common/popup/popup_ingame/popup_doithuong_mbf_off.png" : "Vinaphone" === itemName ? url = "resources/common/popup/popup_ingame/popup_doithuong_vnf_off.png" : "MegaCard" === itemName ? url = "resources/common/popup/popup_ingame/popup_doithuong_vt_off.png" : "ZING" === itemName ? url = "resources/common/popup/popup_ingame/popup_doithuong_vt_off.png" : "BIT" === itemName && (url = "resources/common/popup/popup_ingame/popup_doithuong_vt_off.png");
        var image = cc.url.raw(url);
        var texture = cc.textureCache.addImage(image);
        this.logoProvider.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        var btn = this.logoProvider.getComponent(cc.Button);
        btn.node._tag = tag;
      },
      clickProvider: function clickProvider(e) {
        cc.log("tag =", e.target._tag);
      }
    });
    cc._RF.pop();
  }, {} ],
  Register: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "586beuY+rpHepzc7hDww5Gd", "Register");
    "use strict";
    var NetworkManager = require("NetworkManager");
    var BaseScene = require("BaseScene");
    cc.Class({
      extends: BaseScene,
      properties: {
        edt_username: cc.EditBox,
        edt_pass: cc.EditBox,
        edt_repass: cc.EditBox,
        edt_displayname: cc.EditBox,
        messagePopup: cc.Prefab
      },
      onLoad: function onLoad() {
        null != window.ws && "undefined" !== typeof window.ws && (window.ws.onmessage = this.ongamemessage.bind(this));
      },
      ongamemessage: function ongamemessage(e) {
        if (null != e.data && "undefined" !== typeof e.data) {
          var lstMessage = NetworkManager.parseFrom(event.data, event.data.byteLength);
          if (lstMessage.length > 0) {
            var buffer = lstMessage.shift();
            this.handleMessage(buffer);
          }
        }
      },
      handleMessage: function handleMessage(e) {
        var buffer = e;
        this._super(buffer);
        switch (buffer.message_id) {
         case NetworkManager.MESSAGE_ID.LOGIN:
          var msg = buffer.response;
          this.handleLoginResponseHandler(msg);
          break;

         case NetworkManager.MESSAGE_ID.REGISTER:
          var msg = buffer.response;
          this.handleRegisterResponseHandler(msg);
        }
      },
      handleRegisterResponseHandler: function handleRegisterResponseHandler(e) {
        var buffer = e;
        cc.log("buffer:", buffer);
        if (buffer.getResponsecode()) NetworkManager.requestLoginMessage(this.edt_username.string, this.edt_pass.string); else {
          var messagebox = cc.instantiate(this.messagePopup).getComponent("CommonPopup");
          messagebox.init(buffer.getMessage(), 0, function() {
            cc.log("on callback");
          });
          cc.log("message box:", messagebox);
          messagebox.node.setPosition(cc.p(0, 0));
          this.node.addChild(messagebox.node);
        }
      },
      handleLoginResponseHandler: function handleLoginResponseHandler(res) {
        cc.log("login response handler:", res);
        if (res.getResponsecode()) {
          var session_id = res.getSessionid();
          cc.log("session id:", session_id);
          Common.setSessionId(session_id);
          cc.sys.localStorage.setItem("session_id", session_id);
          cc.director.loadScene("Lobby");
        }
      },
      close: function close() {
        cc.director.loadScene("Login");
      },
      register: function register() {
        if ("" === this.edt_username.string || "" === this.edt_pass.string || "" === this.edt_repass.string || "" === this.edt_displayname) {
          this.showToast("Dữ liệu không được để trống", this);
          return;
        }
        if (this.edt_pass.string !== this.edt_repass.string) {
          this.showToast("Mật khẩu phải giống nhau!", this);
          return;
        }
        NetworkManager.requestRegisterMessage(this.edt_username.string, this.edt_pass.string, this.edt_repass.string, this.edt_displayname.string, "");
      },
      showToast: function showToast(strMess, target) {
        this._super(strMess, target);
      }
    });
    cc._RF.pop();
  }, {
    BaseScene: "BaseScene",
    NetworkManager: "NetworkManager"
  } ],
  TableItem: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "6843bdQsFpDpbJUSTA9OsR3", "TableItem");
    "use strict";
    var NetworkManager = require("NetworkManager");
    cc.Class({
      extends: cc.Component,
      properties: {
        btnTable: {
          default: null,
          type: cc.Button
        },
        imgTable: {
          default: null,
          type: cc.Sprite
        },
        imgHu: {
          default: null,
          type: cc.Sprite
        },
        lblHu: {
          default: null,
          type: cc.Label
        },
        lblMoney: {
          default: null,
          type: cc.Label
        }
      },
      onLoad: function onLoad() {},
      init: function init(cashRoomList) {
        cc.log("cashRoomList =", cashRoomList);
        var roomIndex = cashRoomList.getRoomindex();
        var minBet = cashRoomList.getMinbet();
        var minEnterMoney = cashRoomList.getMinentermoney();
        var playerSize = cashRoomList.getPlayersize();
        var playingPlayer = cashRoomList.getPlayingplayer();
        var isPlaying = cashRoomList.getIsplaying();
        var roomConfig = cashRoomList.getRoomconfig();
        var url = "resources/common/scene/table/btn_tapsu.png";
        var url_imgTable = "resources/common/scene/table/txt_tapsu.png";
        if (minBet <= 5e3) {
          url = "resources/common/scene/table/btn_choithu.png";
          url_imgTable = "resources/common/scene/table/txt_choithu.png";
        } else if (minBet <= 1e4 && minBet > 5e3) {
          url = "resources/common/scene/table/btn_tapsu.png";
          url_imgTable = "resources/common/scene/table/txt_tapsu.png";
        } else if (minBet <= 1e5 && minBet > 1e4) {
          url = "resources/common/scene/table/btn_caothu.png";
          url_imgTable = "resources/common/scene/table/txt_caothu.png";
        } else if (minBet > 1e5) {
          url = "resources/common/scene/table/btn_badao.png";
          url_imgTable = "resources/common/scene/table/txt_badao.png";
        }
        var image = cc.url.raw(url);
        var texture = cc.textureCache.addImage(image);
        this.btnTable.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        var imageTable = cc.url.raw(url_imgTable);
        var textureTable = cc.textureCache.addImage(imageTable);
        this.imgTable.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(textureTable);
        var btn = this.btnTable.getComponent(cc.Button);
        btn.node._tag = roomIndex;
      },
      enterRoom: function enterRoom(e) {
        var tag = e.target._tag;
        cc.log("tag =", tag);
        NetworkManager.getEnterRoomMessageFromServer(tag, "");
      }
    });
    cc._RF.pop();
  }, {
    NetworkManager: "NetworkManager"
  } ],
  TableList: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f00cboHlmtH3YZQSB6PBUTA", "TableList");
    "use strict";
    var NetworkManager = require("NetworkManager");
    var BacayScene = require("BaCayScripts");
    var minipoker = require("minipoker");
    var TableScene = cc.Class({
      extends: cc.Component,
      properties: {
        titleGame: {
          default: null,
          type: cc.Sprite
        },
        scrollView: cc.ScrollView,
        prefabTableItem: cc.Prefab,
        rankCount: 0,
        userName: cc.Label,
        userAvatar: cc.Sprite,
        userGold: cc.Label
      },
      onLoad: function onLoad() {
        this.content = this.scrollView.content;
        NetworkManager.getLookUpRoomRequest(Common.getZoneId(), 1, -1, -1, Config.TABLE_ORDERBY.NUM_PLAYER, false, -1);
        window.ws.onmessage = this.ongamestatus.bind(this);
      },
      exitZone: function exitZone() {
        cc.log("exit zone");
        NetworkManager.requestExitZoneMessage(Common.getZoneId());
      },
      tableList: function tableList() {
        var cashRoomList = Common.getListRoomPlay();
        var zoneId = Common.getZoneId();
        var contentWidth = 320 * cashRoomList.length;
        this.content.setContentSize(contentWidth, this.content.getContentSize().height);
        var url = "resources/common/scene/table/lbl_title_3cay.png";
        zoneId === Config.TAG_GAME_ITEM.TAIXIU ? url = "resources/common/scene/table/lbl_title_vqmm.png" : zoneId === Config.TAG_GAME_ITEM.VQMM ? url = "resources/common/scene/table/lbl_title_vqmm.png" : zoneId === Config.TAG_GAME_ITEM.MINI_POKER ? url = "resources/common/scene/table/lbl_title_poker.png" : zoneId === Config.TAG_GAME_ITEM.MINI_BACAY && (url = "resources/common/scene/table/lbl_title_3cay.png");
        var image = cc.url.raw(url);
        var texture = cc.textureCache.addImage(image);
        this.titleGame.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        for (var i = 0; i < cashRoomList.length; ++i) {
          var item = cc.instantiate(this.prefabTableItem);
          item.getComponent("TableItem").init(cashRoomList[i]);
          item.setPositionY(.06 * this.content.getContentSize().height);
          this.content.addChild(item);
        }
      },
      ongamestatus: function ongamestatus(event) {
        if (null !== event.data || "undefined" !== event.data) {
          var lstMessage = NetworkManager.parseFrom(event.data, event.data.byteLength);
          if (lstMessage.length > 0) for (var i = 0; i < lstMessage.length; i++) {
            var buffer = lstMessage[i];
            this.handleMessage(buffer);
          }
        }
      },
      exitRoomResponseHandler: function exitRoomResponseHandler(resp) {},
      exitZoneResponseHandler: function exitZoneResponseHandler(resp) {
        cc.log("exit zone response handler: ", resp.toObject());
        if (resp.getResponsecode()) {
          Common.setZoneId(-1);
          cc.director.runScene(Common.getTableSceneInstance());
        }
        resp.hasMessage() && "" !== resp.getMessage();
      },
      handleMessage: function handleMessage(buffer) {
        switch (buffer.message_id) {
         case NetworkManager.MESSAGE_ID.LOOK_UP_ROOM:
          var msg = buffer.response;
          this.getLookupRoomResponse(msg);
          break;

         case NetworkManager.MESSAGE_ID.ENTER_ROOM:
          var msg = buffer.response;
          this.enterRoomResponse(msg);
          break;

         case NetworkManager.MESSAGE_ID.EXIT_ROOM:
          var msg = buffer.response;
          this.exitRoomResponseHandler(msg);
          break;

         case NetworkManager.MESSAGE_ID.EXIT_ZONE:
          var msg = buffer.response;
          this.exitZoneResponseHandler(msg);
        }
      },
      getLookupRoomResponse: function getLookupRoomResponse(response) {
        if (0 != response && response.getResponsecode()) {
          Common.setListRoomPlay(null);
          var roomListInfo = [];
          if (response.getRoominfosList().length > 0) for (var i = 0; i < response.getRoominfosList().length; i++) roomListInfo.push(response.getRoominfosList()[i]);
          cc.log("roomListInfo", roomListInfo);
          Common.setListRoomPlay(roomListInfo);
          this.tableList();
        }
      },
      enterRoomResponse: function enterRoomResponse(response) {
        if (0 !== response && response.hasZoneid()) {
          var zoneId = response.getZoneid();
          if (zoneId === Common.getZoneId() && response.getResponsecode()) {
            cc.log("response room config =", response.getArgsList());
            var waitingPlayerList = [];
            Common.setOwnerUserId(response.getOwneruserid());
            var playerList = [];
            for (var i = 0; i < response.getPlayingplayersList().length; i++) playerList.push(response.getPlayingplayersList()[i]);
            for (var j = 0; j < response.getWaitingplayersList().length; j++) waitingPlayerList.push(response.getWaitingplayersList()[j]);
            if (response.hasRoomplay()) {
              var roomPlay = response.getRoomplay();
              var is_create_room = true;
              if (Common.getZoneId() === Common.ZONE_ID.MINI_BACAY) cc.director.loadScene("BaCay", function() {
                BacayScene.instance.initDataFromLoading(response.getArgsList());
              }); else if (Common.getZoneId() === Common.ZONE_ID.MINI_POKER) {
                cc.log("poker");
                cc.director.loadScene("minipoker", function() {
                  minipoker.instance.initDataFromLoading(null, response);
                });
              }
            }
          }
        }
      }
    });
    cc._RF.pop();
  }, {
    BaCayScripts: "BaCayScripts",
    NetworkManager: "NetworkManager",
    minipoker: "minipoker"
  } ],
  ToastScripts: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f4ec39II21JW4LEMEHo+V9J", "ToastScripts");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        bg_toast: {
          default: null,
          type: cc.Sprite
        },
        lbl_toast: {
          default: null,
          type: cc.Label
        }
      },
      onLoad: function onLoad() {},
      showToast: function showToast(strMess) {
        cc.log("strMess =", strMess);
        this.bg_toast.node.active = true;
        this.lbl_toast.node.active = true;
        this.lbl_toast.string = strMess;
      },
      closeToast: function closeToast() {
        this.bg_toast.node.active = false;
        this.lbl_toast.node.active = false;
      }
    });
    cc._RF.pop();
  }, {} ],
  Types: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "bd63cmlkU9MWaZWPaBOxmHC", "Types");
    "use strict";
    var Suit = cc.Enum({
      Spade: 1,
      Heart: 3,
      Club: 2,
      Diamond: 0
    });
    var A2_10JQK = "NAN,A,2,3,4,5,6,7,8,9,10,J,Q,K".split(",");
    function Card(point, suit) {
      Object.defineProperties(this, {
        point: {
          value: point,
          writable: false
        },
        suit: {
          value: suit,
          writable: false
        },
        id: {
          value: 13 * (suit - 1) + (point - 1),
          writable: false
        },
        pointName: {
          get: function get() {
            return A2_10JQK[this.point];
          }
        },
        suitName: {
          get: function get() {
            return Suit[this.suit];
          }
        },
        isBlackSuit: {
          get: function get() {
            return this.suit === Suit.Spade || this.suit === Suit.Club;
          }
        },
        isRedSuit: {
          get: function get() {
            return this.suit === Suit.Heart || this.suit === Suit.Diamond;
          }
        }
      });
    }
    Card.prototype.toString = function() {
      return this.suitName + " " + this.pointName;
    };
    var cards = new Array(52);
    Card.fromId = function(id) {
      return cards[id];
    };
    (function createCards() {
      for (var s = 1; s <= 4; s++) for (var p = 1; p <= 13; p++) {
        var card = new Card(p, s);
        cards[card.id] = card;
      }
    })();
    var ActorPlayingState = cc.Enum({
      Normal: -1,
      Stand: -1,
      Report: -1,
      Bust: -1
    });
    var Outcome = cc.Enum({
      Win: -1,
      Lose: -1,
      Tie: -1
    });
    var Hand = cc.Enum({
      Normal: -1,
      BlackJack: -1,
      FiveCard: -1
    });
    module.exports = {
      Suit: Suit,
      Card: Card,
      ActorPlayingState: ActorPlayingState,
      Hand: Hand,
      Outcome: Outcome
    };
    cc._RF.pop();
  }, {} ],
  UILobby: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a8487WcWMxIQ5oTc7DMuas8", "UILobby");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        popupSetting: cc.Prefab,
        popupIngame: cc.Prefab,
        userName: cc.Label,
        userAvatar: cc.Sprite,
        userGold: cc.Label,
        timeTotal: 0
      },
      onLoad: function onLoad() {
        this.setUserInfo();
      },
      openPopup: function openPopup() {
        var item = cc.instantiate(this.popupSetting);
        item.getComponent("Popup").appear();
        item.zIndex = 1e3;
        this.node.addChild(item);
      },
      openChargePopup: function openChargePopup() {
        var tabString = [ "Viettel", "Mobifone", "VinaPhone" ];
        var nodeChild = new cc.Node();
        nodeChild.parent = this.node;
        var item = cc.instantiate(this.popupIngame);
        item.getComponent("PopupIngameItem").init(tabString, "charge");
        item.setPositionX(0);
        item.setPositionY(0);
        nodeChild.addChild(item);
      },
      setUserInfo: function setUserInfo() {
        this.userName.string = Common.getUserName();
        this.userGold.string = Common.getCash();
      },
      update: function update(dt) {
        this.timeTotal = this.timeTotal + dt;
        if (this.timeTotal >= .5) {
          this.timeTotal = 0;
          this.setUserInfo();
        }
      }
    });
    cc._RF.pop();
  }, {} ],
  UserInfo: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "fd415im1a1HILA/MBLmgtY/", "UserInfo");
    "use strict";
    var _properties;
    function _defineProperty(obj, key, value) {
      key in obj ? Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      }) : obj[key] = value;
      return obj;
    }
    cc.Class({
      extends: cc.Component,
      properties: (_properties = {
        avatar: cc.Sprite,
        displayName: cc.Label,
        txt_level: cc.Label
      }, _defineProperty(_properties, "txt_level", cc.Label), _defineProperty(_properties, "txt_id", cc.Label), 
      _defineProperty(_properties, "txt_phone", cc.Label), _defineProperty(_properties, "txt_chiso", cc.Label), 
      _defineProperty(_properties, "txt_sovanchoi", cc.Label), _defineProperty(_properties, "txt_sovanthang", cc.Label), 
      _defineProperty(_properties, "txt_sovanthua", cc.Label), _properties),
      onLoad: function onLoad() {}
    });
    cc._RF.pop();
  }, {} ],
  ZipUtils: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "7d560CmTPJFupwClJ3vdspF", "ZipUtils");
    "use strict";
    cc.Codec = {
      name: "Jacob__Codec"
    };
    cc.unzip = function() {
      return cc.Codec.GZip.gunzip.apply(cc.Codec.GZip, arguments);
    };
    cc.unzipBase64 = function() {
      var tmpInput = cc.Codec.Base64.decode.apply(cc.Codec.Base64, arguments);
      return cc.Codec.GZip.gunzip.apply(cc.Codec.GZip, [ tmpInput ]);
    };
    cc.unzipBase64AsArray = function(input, bytes) {
      bytes = bytes || 1;
      var dec = this.unzipBase64(input), ar = [], i, j, len;
      for (i = 0, len = dec.length / bytes; i < len; i++) {
        ar[i] = 0;
        for (j = bytes - 1; j >= 0; --j) ar[i] += dec.charCodeAt(i * bytes + j) << 8 * j;
      }
      return ar;
    };
    cc.unzipAsArray = function(input, bytes) {
      bytes = bytes || 1;
      var dec = this.unzip(input), ar = [], i, j, len;
      for (i = 0, len = dec.length / bytes; i < len; i++) {
        ar[i] = 0;
        for (j = bytes - 1; j >= 0; --j) ar[i] += dec.charCodeAt(i * bytes + j) << 8 * j;
      }
      return ar;
    };
    cc.StringToArray = function(input) {
      var tmp = input.split(","), ar = [], i;
      for (i = 0; i < tmp.length; i++) ar.push(parseInt(tmp[i]));
      return ar;
    };
    cc._RF.pop();
  }, {} ],
  base64: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ce550DyhRBIj7xWYqpxerNA", "base64");
    "use strict";
    cc.Codec.Base64 = {
      name: "Jacob__Codec__Base64"
    };
    cc.Codec.Base64._keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    cc.Codec.Base64.decode = function Jacob__Codec__Base64__decode(input) {
      var output = [], chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0;
      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
      while (i < input.length) {
        enc1 = this._keyStr.indexOf(input.charAt(i++));
        enc2 = this._keyStr.indexOf(input.charAt(i++));
        enc3 = this._keyStr.indexOf(input.charAt(i++));
        enc4 = this._keyStr.indexOf(input.charAt(i++));
        chr1 = enc1 << 2 | enc2 >> 4;
        chr2 = (15 & enc2) << 4 | enc3 >> 2;
        chr3 = (3 & enc3) << 6 | enc4;
        output.push(String.fromCharCode(chr1));
        64 !== enc3 && output.push(String.fromCharCode(chr2));
        64 !== enc4 && output.push(String.fromCharCode(chr3));
      }
      output = output.join("");
      return output;
    };
    cc.Codec.Base64.decodeAsArray = function Jacob__Codec__Base64___decodeAsArray(input, bytes) {
      var dec = this.decode(input), ar = [], i, j, len;
      for (i = 0, len = dec.length / bytes; i < len; i++) {
        ar[i] = 0;
        for (j = bytes - 1; j >= 0; --j) ar[i] += dec.charCodeAt(i * bytes + j) << 8 * j;
      }
      return ar;
    };
    cc.uint8ArrayToUint32Array = function(uint8Arr) {
      if (uint8Arr.length % 4 !== 0) return null;
      var arrLen = uint8Arr.length / 4;
      var retArr = window.Uint32Array ? new Uint32Array(arrLen) : [];
      for (var i = 0; i < arrLen; i++) {
        var offset = 4 * i;
        retArr[i] = uint8Arr[offset] + 256 * uint8Arr[offset + 1] + 65536 * uint8Arr[offset + 2] + uint8Arr[offset + 3] * (1 << 24);
      }
      return retArr;
    };
    cc._RF.pop();
  }, {} ],
  cellPromotion: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a3ec5HHnLpNS4X5qsJ9P78H", "cellPromotion");
    "use strict";
    cc.Class({
      extends: require("viewCell"),
      properties: {},
      onLoad: function onLoad() {},
      init: function init(index, data, reload, group) {
        this.node.removeAllChildren(true);
        var obj = data.array[index];
        var url = "resources/common/popup/popup_ingame/popup_gold_noidung.png";
        var image = cc.url.raw(url);
        var texture = cc.textureCache.addImage(image);
        0 != index && (this.node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture));
        var bgCellWidth = this.node.getContentSize().width;
        var bgCellHeight = this.node.getContentSize().height;
        var lengthData = Object.keys(obj).length;
        var percentCell = [ .3, .15, .15, .15, .25 ];
        for (var i = 0; i < lengthData; i++) {
          var nodeChild = new cc.Node();
          nodeChild.parent = this.node;
          var message = nodeChild.addComponent(cc.Label);
          var posX = (i - lengthData / 2 + .5) * bgCellWidth / (lengthData + 1);
          var posY = .2 * bgCellHeight;
          message.node.setPositionX(posX);
          message.node.setPositionY(-posY);
          message.fontSize = 20;
          message.string = obj[Object.keys(obj)[i]].toString();
        }
      }
    });
    cc._RF.pop();
  }, {
    viewCell: "viewCell"
  } ],
  enter_room_pb: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "1f684K9EiBDibjIOXO3B0FG", "enter_room_pb");
    "use strict";
    var jspb = require("google-protobuf");
    var goog = jspb;
    var global = Function("return this")();
    var filter_room_pb = require("./filter_room_pb.js");
    var player_pb = require("./player_pb.js");
    var map_field_entry_pb = require("./map_field_entry_pb.js");
    goog.exportSymbol("proto.BINEnterRoomGroupRequest", null, global);
    goog.exportSymbol("proto.BINEnterRoomRequest", null, global);
    goog.exportSymbol("proto.BINEnterRoomResponse", null, global);
    goog.exportSymbol("proto.BINPlayerEnterRoomResponse", null, global);
    proto.BINEnterRoomRequest = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINEnterRoomRequest, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINEnterRoomRequest.displayName = "proto.BINEnterRoomRequest");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINEnterRoomRequest.prototype.toObject = function(opt_includeInstance) {
        return proto.BINEnterRoomRequest.toObject(opt_includeInstance, this);
      };
      proto.BINEnterRoomRequest.toObject = function(includeInstance, msg) {
        var f, obj = {
          roomindex: jspb.Message.getField(msg, 1),
          password: jspb.Message.getField(msg, 2)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINEnterRoomRequest.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINEnterRoomRequest();
      return proto.BINEnterRoomRequest.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINEnterRoomRequest.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt32();
          msg.setRoomindex(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setPassword(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINEnterRoomRequest.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINEnterRoomRequest.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINEnterRoomRequest.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt32(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
    };
    proto.BINEnterRoomRequest.prototype.getRoomindex = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINEnterRoomRequest.prototype.setRoomindex = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINEnterRoomRequest.prototype.clearRoomindex = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINEnterRoomRequest.prototype.hasRoomindex = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINEnterRoomRequest.prototype.getPassword = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINEnterRoomRequest.prototype.setPassword = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINEnterRoomRequest.prototype.clearPassword = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINEnterRoomRequest.prototype.hasPassword = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINEnterRoomResponse = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, proto.BINEnterRoomResponse.repeatedFields_, null);
    };
    goog.inherits(proto.BINEnterRoomResponse, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINEnterRoomResponse.displayName = "proto.BINEnterRoomResponse");
    proto.BINEnterRoomResponse.repeatedFields_ = [ 6, 7, 11 ];
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINEnterRoomResponse.prototype.toObject = function(opt_includeInstance) {
        return proto.BINEnterRoomResponse.toObject(opt_includeInstance, this);
      };
      proto.BINEnterRoomResponse.toObject = function(includeInstance, msg) {
        var f, obj = {
          responsecode: jspb.Message.getField(msg, 1),
          message: jspb.Message.getField(msg, 2),
          zoneid: jspb.Message.getField(msg, 3),
          roomplay: (f = msg.getRoomplay()) && filter_room_pb.BINRoomPlay.toObject(includeInstance, f),
          roomisplaying: jspb.Message.getField(msg, 5),
          playingplayersList: jspb.Message.toObjectList(msg.getPlayingplayersList(), player_pb.BINPlayer.toObject, includeInstance),
          waitingplayersList: jspb.Message.toObjectList(msg.getWaitingplayersList(), player_pb.BINPlayer.toObject, includeInstance),
          owneruserid: jspb.Message.getField(msg, 8),
          currentturnuserid: jspb.Message.getField(msg, 9),
          enterroomstatus: jspb.Message.getField(msg, 10),
          argsList: jspb.Message.toObjectList(msg.getArgsList(), map_field_entry_pb.BINMapFieldEntry.toObject, includeInstance)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINEnterRoomResponse.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINEnterRoomResponse();
      return proto.BINEnterRoomResponse.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINEnterRoomResponse.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readBool();
          msg.setResponsecode(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setMessage(value);
          break;

         case 3:
          var value = reader.readInt32();
          msg.setZoneid(value);
          break;

         case 4:
          var value = new filter_room_pb.BINRoomPlay();
          reader.readMessage(value, filter_room_pb.BINRoomPlay.deserializeBinaryFromReader);
          msg.setRoomplay(value);
          break;

         case 5:
          var value = reader.readBool();
          msg.setRoomisplaying(value);
          break;

         case 6:
          var value = new player_pb.BINPlayer();
          reader.readMessage(value, player_pb.BINPlayer.deserializeBinaryFromReader);
          msg.addPlayingplayers(value);
          break;

         case 7:
          var value = new player_pb.BINPlayer();
          reader.readMessage(value, player_pb.BINPlayer.deserializeBinaryFromReader);
          msg.addWaitingplayers(value);
          break;

         case 8:
          var value = reader.readInt64();
          msg.setOwneruserid(value);
          break;

         case 9:
          var value = reader.readInt64();
          msg.setCurrentturnuserid(value);
          break;

         case 10:
          var value = reader.readInt32();
          msg.setEnterroomstatus(value);
          break;

         case 11:
          var value = new map_field_entry_pb.BINMapFieldEntry();
          reader.readMessage(value, map_field_entry_pb.BINMapFieldEntry.deserializeBinaryFromReader);
          msg.addArgs(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINEnterRoomResponse.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINEnterRoomResponse.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINEnterRoomResponse.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeBool(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeInt32(3, f);
      f = this.getRoomplay();
      null != f && writer.writeMessage(4, f, filter_room_pb.BINRoomPlay.serializeBinaryToWriter);
      f = jspb.Message.getField(this, 5);
      null != f && writer.writeBool(5, f);
      f = this.getPlayingplayersList();
      f.length > 0 && writer.writeRepeatedMessage(6, f, player_pb.BINPlayer.serializeBinaryToWriter);
      f = this.getWaitingplayersList();
      f.length > 0 && writer.writeRepeatedMessage(7, f, player_pb.BINPlayer.serializeBinaryToWriter);
      f = jspb.Message.getField(this, 8);
      null != f && writer.writeInt64(8, f);
      f = jspb.Message.getField(this, 9);
      null != f && writer.writeInt64(9, f);
      f = jspb.Message.getField(this, 10);
      null != f && writer.writeInt32(10, f);
      f = this.getArgsList();
      f.length > 0 && writer.writeRepeatedMessage(11, f, map_field_entry_pb.BINMapFieldEntry.serializeBinaryToWriter);
    };
    proto.BINEnterRoomResponse.prototype.getResponsecode = function() {
      return jspb.Message.getFieldWithDefault(this, 1, false);
    };
    proto.BINEnterRoomResponse.prototype.setResponsecode = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINEnterRoomResponse.prototype.clearResponsecode = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINEnterRoomResponse.prototype.hasResponsecode = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINEnterRoomResponse.prototype.getMessage = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINEnterRoomResponse.prototype.setMessage = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINEnterRoomResponse.prototype.clearMessage = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINEnterRoomResponse.prototype.hasMessage = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINEnterRoomResponse.prototype.getZoneid = function() {
      return jspb.Message.getFieldWithDefault(this, 3, 0);
    };
    proto.BINEnterRoomResponse.prototype.setZoneid = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINEnterRoomResponse.prototype.clearZoneid = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINEnterRoomResponse.prototype.hasZoneid = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINEnterRoomResponse.prototype.getRoomplay = function() {
      return jspb.Message.getWrapperField(this, filter_room_pb.BINRoomPlay, 4);
    };
    proto.BINEnterRoomResponse.prototype.setRoomplay = function(value) {
      jspb.Message.setWrapperField(this, 4, value);
    };
    proto.BINEnterRoomResponse.prototype.clearRoomplay = function() {
      this.setRoomplay(void 0);
    };
    proto.BINEnterRoomResponse.prototype.hasRoomplay = function() {
      return null != jspb.Message.getField(this, 4);
    };
    proto.BINEnterRoomResponse.prototype.getRoomisplaying = function() {
      return jspb.Message.getFieldWithDefault(this, 5, false);
    };
    proto.BINEnterRoomResponse.prototype.setRoomisplaying = function(value) {
      jspb.Message.setField(this, 5, value);
    };
    proto.BINEnterRoomResponse.prototype.clearRoomisplaying = function() {
      jspb.Message.setField(this, 5, void 0);
    };
    proto.BINEnterRoomResponse.prototype.hasRoomisplaying = function() {
      return null != jspb.Message.getField(this, 5);
    };
    proto.BINEnterRoomResponse.prototype.getPlayingplayersList = function() {
      return jspb.Message.getRepeatedWrapperField(this, player_pb.BINPlayer, 6);
    };
    proto.BINEnterRoomResponse.prototype.setPlayingplayersList = function(value) {
      jspb.Message.setRepeatedWrapperField(this, 6, value);
    };
    proto.BINEnterRoomResponse.prototype.addPlayingplayers = function(opt_value, opt_index) {
      return jspb.Message.addToRepeatedWrapperField(this, 6, opt_value, proto.BINPlayer, opt_index);
    };
    proto.BINEnterRoomResponse.prototype.clearPlayingplayersList = function() {
      this.setPlayingplayersList([]);
    };
    proto.BINEnterRoomResponse.prototype.getWaitingplayersList = function() {
      return jspb.Message.getRepeatedWrapperField(this, player_pb.BINPlayer, 7);
    };
    proto.BINEnterRoomResponse.prototype.setWaitingplayersList = function(value) {
      jspb.Message.setRepeatedWrapperField(this, 7, value);
    };
    proto.BINEnterRoomResponse.prototype.addWaitingplayers = function(opt_value, opt_index) {
      return jspb.Message.addToRepeatedWrapperField(this, 7, opt_value, proto.BINPlayer, opt_index);
    };
    proto.BINEnterRoomResponse.prototype.clearWaitingplayersList = function() {
      this.setWaitingplayersList([]);
    };
    proto.BINEnterRoomResponse.prototype.getOwneruserid = function() {
      return jspb.Message.getFieldWithDefault(this, 8, 0);
    };
    proto.BINEnterRoomResponse.prototype.setOwneruserid = function(value) {
      jspb.Message.setField(this, 8, value);
    };
    proto.BINEnterRoomResponse.prototype.clearOwneruserid = function() {
      jspb.Message.setField(this, 8, void 0);
    };
    proto.BINEnterRoomResponse.prototype.hasOwneruserid = function() {
      return null != jspb.Message.getField(this, 8);
    };
    proto.BINEnterRoomResponse.prototype.getCurrentturnuserid = function() {
      return jspb.Message.getFieldWithDefault(this, 9, 0);
    };
    proto.BINEnterRoomResponse.prototype.setCurrentturnuserid = function(value) {
      jspb.Message.setField(this, 9, value);
    };
    proto.BINEnterRoomResponse.prototype.clearCurrentturnuserid = function() {
      jspb.Message.setField(this, 9, void 0);
    };
    proto.BINEnterRoomResponse.prototype.hasCurrentturnuserid = function() {
      return null != jspb.Message.getField(this, 9);
    };
    proto.BINEnterRoomResponse.prototype.getEnterroomstatus = function() {
      return jspb.Message.getFieldWithDefault(this, 10, 0);
    };
    proto.BINEnterRoomResponse.prototype.setEnterroomstatus = function(value) {
      jspb.Message.setField(this, 10, value);
    };
    proto.BINEnterRoomResponse.prototype.clearEnterroomstatus = function() {
      jspb.Message.setField(this, 10, void 0);
    };
    proto.BINEnterRoomResponse.prototype.hasEnterroomstatus = function() {
      return null != jspb.Message.getField(this, 10);
    };
    proto.BINEnterRoomResponse.prototype.getArgsList = function() {
      return jspb.Message.getRepeatedWrapperField(this, map_field_entry_pb.BINMapFieldEntry, 11);
    };
    proto.BINEnterRoomResponse.prototype.setArgsList = function(value) {
      jspb.Message.setRepeatedWrapperField(this, 11, value);
    };
    proto.BINEnterRoomResponse.prototype.addArgs = function(opt_value, opt_index) {
      return jspb.Message.addToRepeatedWrapperField(this, 11, opt_value, proto.BINMapFieldEntry, opt_index);
    };
    proto.BINEnterRoomResponse.prototype.clearArgsList = function() {
      this.setArgsList([]);
    };
    proto.BINEnterRoomGroupRequest = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINEnterRoomGroupRequest, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINEnterRoomGroupRequest.displayName = "proto.BINEnterRoomGroupRequest");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINEnterRoomGroupRequest.prototype.toObject = function(opt_includeInstance) {
        return proto.BINEnterRoomGroupRequest.toObject(opt_includeInstance, this);
      };
      proto.BINEnterRoomGroupRequest.toObject = function(includeInstance, msg) {
        var f, obj = {
          roomgroupid: jspb.Message.getField(msg, 1),
          viproom: jspb.Message.getField(msg, 2)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINEnterRoomGroupRequest.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINEnterRoomGroupRequest();
      return proto.BINEnterRoomGroupRequest.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINEnterRoomGroupRequest.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt32();
          msg.setRoomgroupid(value);
          break;

         case 2:
          var value = reader.readBool();
          msg.setViproom(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINEnterRoomGroupRequest.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINEnterRoomGroupRequest.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINEnterRoomGroupRequest.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt32(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeBool(2, f);
    };
    proto.BINEnterRoomGroupRequest.prototype.getRoomgroupid = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINEnterRoomGroupRequest.prototype.setRoomgroupid = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINEnterRoomGroupRequest.prototype.clearRoomgroupid = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINEnterRoomGroupRequest.prototype.hasRoomgroupid = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINEnterRoomGroupRequest.prototype.getViproom = function() {
      return jspb.Message.getFieldWithDefault(this, 2, false);
    };
    proto.BINEnterRoomGroupRequest.prototype.setViproom = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINEnterRoomGroupRequest.prototype.clearViproom = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINEnterRoomGroupRequest.prototype.hasViproom = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINPlayerEnterRoomResponse = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINPlayerEnterRoomResponse, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINPlayerEnterRoomResponse.displayName = "proto.BINPlayerEnterRoomResponse");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINPlayerEnterRoomResponse.prototype.toObject = function(opt_includeInstance) {
        return proto.BINPlayerEnterRoomResponse.toObject(opt_includeInstance, this);
      };
      proto.BINPlayerEnterRoomResponse.toObject = function(includeInstance, msg) {
        var f, obj = {
          responsecode: jspb.Message.getField(msg, 1),
          message: jspb.Message.getField(msg, 2),
          player: (f = msg.getPlayer()) && player_pb.BINPlayer.toObject(includeInstance, f),
          enterroomstatus: jspb.Message.getField(msg, 4),
          changeownerroomcd: jspb.Message.getField(msg, 5)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINPlayerEnterRoomResponse.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINPlayerEnterRoomResponse();
      return proto.BINPlayerEnterRoomResponse.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINPlayerEnterRoomResponse.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readBool();
          msg.setResponsecode(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setMessage(value);
          break;

         case 3:
          var value = new player_pb.BINPlayer();
          reader.readMessage(value, player_pb.BINPlayer.deserializeBinaryFromReader);
          msg.setPlayer(value);
          break;

         case 4:
          var value = reader.readInt32();
          msg.setEnterroomstatus(value);
          break;

         case 5:
          var value = reader.readInt32();
          msg.setChangeownerroomcd(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINPlayerEnterRoomResponse.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINPlayerEnterRoomResponse.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINPlayerEnterRoomResponse.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeBool(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = this.getPlayer();
      null != f && writer.writeMessage(3, f, player_pb.BINPlayer.serializeBinaryToWriter);
      f = jspb.Message.getField(this, 4);
      null != f && writer.writeInt32(4, f);
      f = jspb.Message.getField(this, 5);
      null != f && writer.writeInt32(5, f);
    };
    proto.BINPlayerEnterRoomResponse.prototype.getResponsecode = function() {
      return jspb.Message.getFieldWithDefault(this, 1, false);
    };
    proto.BINPlayerEnterRoomResponse.prototype.setResponsecode = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINPlayerEnterRoomResponse.prototype.clearResponsecode = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINPlayerEnterRoomResponse.prototype.hasResponsecode = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINPlayerEnterRoomResponse.prototype.getMessage = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINPlayerEnterRoomResponse.prototype.setMessage = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINPlayerEnterRoomResponse.prototype.clearMessage = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINPlayerEnterRoomResponse.prototype.hasMessage = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINPlayerEnterRoomResponse.prototype.getPlayer = function() {
      return jspb.Message.getWrapperField(this, player_pb.BINPlayer, 3);
    };
    proto.BINPlayerEnterRoomResponse.prototype.setPlayer = function(value) {
      jspb.Message.setWrapperField(this, 3, value);
    };
    proto.BINPlayerEnterRoomResponse.prototype.clearPlayer = function() {
      this.setPlayer(void 0);
    };
    proto.BINPlayerEnterRoomResponse.prototype.hasPlayer = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINPlayerEnterRoomResponse.prototype.getEnterroomstatus = function() {
      return jspb.Message.getFieldWithDefault(this, 4, 0);
    };
    proto.BINPlayerEnterRoomResponse.prototype.setEnterroomstatus = function(value) {
      jspb.Message.setField(this, 4, value);
    };
    proto.BINPlayerEnterRoomResponse.prototype.clearEnterroomstatus = function() {
      jspb.Message.setField(this, 4, void 0);
    };
    proto.BINPlayerEnterRoomResponse.prototype.hasEnterroomstatus = function() {
      return null != jspb.Message.getField(this, 4);
    };
    proto.BINPlayerEnterRoomResponse.prototype.getChangeownerroomcd = function() {
      return jspb.Message.getFieldWithDefault(this, 5, 0);
    };
    proto.BINPlayerEnterRoomResponse.prototype.setChangeownerroomcd = function(value) {
      jspb.Message.setField(this, 5, value);
    };
    proto.BINPlayerEnterRoomResponse.prototype.clearChangeownerroomcd = function() {
      jspb.Message.setField(this, 5, void 0);
    };
    proto.BINPlayerEnterRoomResponse.prototype.hasChangeownerroomcd = function() {
      return null != jspb.Message.getField(this, 5);
    };
    goog.object.extend(exports, proto);
    cc._RF.pop();
  }, {
    "./filter_room_pb.js": "filter_room_pb",
    "./map_field_entry_pb.js": "map_field_entry_pb",
    "./player_pb.js": "player_pb",
    "google-protobuf": "google-protobuf"
  } ],
  enter_zone_pb: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "916380lj9hBprkJ0C5BQQxD", "enter_zone_pb");
    "use strict";
    var jspb = require("google-protobuf");
    var goog = jspb;
    var global = Function("return this")();
    goog.exportSymbol("proto.BINEnterZoneRequest", null, global);
    goog.exportSymbol("proto.BINEnterZoneResponse", null, global);
    goog.exportSymbol("proto.BINExitZoneRequest", null, global);
    goog.exportSymbol("proto.BINExitZoneResponse", null, global);
    goog.exportSymbol("proto.BINRoomConfig", null, global);
    proto.BINEnterZoneRequest = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINEnterZoneRequest, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINEnterZoneRequest.displayName = "proto.BINEnterZoneRequest");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINEnterZoneRequest.prototype.toObject = function(opt_includeInstance) {
        return proto.BINEnterZoneRequest.toObject(opt_includeInstance, this);
      };
      proto.BINEnterZoneRequest.toObject = function(includeInstance, msg) {
        var f, obj = {
          zoneid: jspb.Message.getField(msg, 1)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINEnterZoneRequest.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINEnterZoneRequest();
      return proto.BINEnterZoneRequest.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINEnterZoneRequest.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt32();
          msg.setZoneid(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINEnterZoneRequest.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINEnterZoneRequest.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINEnterZoneRequest.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt32(1, f);
    };
    proto.BINEnterZoneRequest.prototype.getZoneid = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINEnterZoneRequest.prototype.setZoneid = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINEnterZoneRequest.prototype.clearZoneid = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINEnterZoneRequest.prototype.hasZoneid = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINRoomConfig = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINRoomConfig, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINRoomConfig.displayName = "proto.BINRoomConfig");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINRoomConfig.prototype.toObject = function(opt_includeInstance) {
        return proto.BINRoomConfig.toObject(opt_includeInstance, this);
      };
      proto.BINRoomConfig.toObject = function(includeInstance, msg) {
        var f, obj = {
          roomgroupid: jspb.Message.getField(msg, 1),
          roomname: jspb.Message.getField(msg, 2),
          viproom: jspb.Message.getField(msg, 3),
          mincash: jspb.Message.getField(msg, 4),
          mingold: jspb.Message.getField(msg, 5),
          minlevel: jspb.Message.getField(msg, 6),
          roomcapacity: jspb.Message.getField(msg, 7),
          playersize: jspb.Message.getField(msg, 8),
          minbet: jspb.Message.getField(msg, 9),
          tax: jspb.Message.getField(msg, 10),
          active: jspb.Message.getField(msg, 11)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINRoomConfig.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINRoomConfig();
      return proto.BINRoomConfig.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINRoomConfig.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt32();
          msg.setRoomgroupid(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setRoomname(value);
          break;

         case 3:
          var value = reader.readBool();
          msg.setViproom(value);
          break;

         case 4:
          var value = reader.readInt32();
          msg.setMincash(value);
          break;

         case 5:
          var value = reader.readInt32();
          msg.setMingold(value);
          break;

         case 6:
          var value = reader.readInt32();
          msg.setMinlevel(value);
          break;

         case 7:
          var value = reader.readInt32();
          msg.setRoomcapacity(value);
          break;

         case 8:
          var value = reader.readInt32();
          msg.setPlayersize(value);
          break;

         case 9:
          var value = reader.readInt32();
          msg.setMinbet(value);
          break;

         case 10:
          var value = reader.readInt32();
          msg.setTax(value);
          break;

         case 11:
          var value = reader.readBool();
          msg.setActive(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINRoomConfig.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINRoomConfig.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINRoomConfig.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt32(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeBool(3, f);
      f = jspb.Message.getField(this, 4);
      null != f && writer.writeInt32(4, f);
      f = jspb.Message.getField(this, 5);
      null != f && writer.writeInt32(5, f);
      f = jspb.Message.getField(this, 6);
      null != f && writer.writeInt32(6, f);
      f = jspb.Message.getField(this, 7);
      null != f && writer.writeInt32(7, f);
      f = jspb.Message.getField(this, 8);
      null != f && writer.writeInt32(8, f);
      f = jspb.Message.getField(this, 9);
      null != f && writer.writeInt32(9, f);
      f = jspb.Message.getField(this, 10);
      null != f && writer.writeInt32(10, f);
      f = jspb.Message.getField(this, 11);
      null != f && writer.writeBool(11, f);
    };
    proto.BINRoomConfig.prototype.getRoomgroupid = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINRoomConfig.prototype.setRoomgroupid = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINRoomConfig.prototype.clearRoomgroupid = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINRoomConfig.prototype.hasRoomgroupid = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINRoomConfig.prototype.getRoomname = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINRoomConfig.prototype.setRoomname = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINRoomConfig.prototype.clearRoomname = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINRoomConfig.prototype.hasRoomname = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINRoomConfig.prototype.getViproom = function() {
      return jspb.Message.getFieldWithDefault(this, 3, false);
    };
    proto.BINRoomConfig.prototype.setViproom = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINRoomConfig.prototype.clearViproom = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINRoomConfig.prototype.hasViproom = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINRoomConfig.prototype.getMincash = function() {
      return jspb.Message.getFieldWithDefault(this, 4, 0);
    };
    proto.BINRoomConfig.prototype.setMincash = function(value) {
      jspb.Message.setField(this, 4, value);
    };
    proto.BINRoomConfig.prototype.clearMincash = function() {
      jspb.Message.setField(this, 4, void 0);
    };
    proto.BINRoomConfig.prototype.hasMincash = function() {
      return null != jspb.Message.getField(this, 4);
    };
    proto.BINRoomConfig.prototype.getMingold = function() {
      return jspb.Message.getFieldWithDefault(this, 5, 0);
    };
    proto.BINRoomConfig.prototype.setMingold = function(value) {
      jspb.Message.setField(this, 5, value);
    };
    proto.BINRoomConfig.prototype.clearMingold = function() {
      jspb.Message.setField(this, 5, void 0);
    };
    proto.BINRoomConfig.prototype.hasMingold = function() {
      return null != jspb.Message.getField(this, 5);
    };
    proto.BINRoomConfig.prototype.getMinlevel = function() {
      return jspb.Message.getFieldWithDefault(this, 6, 0);
    };
    proto.BINRoomConfig.prototype.setMinlevel = function(value) {
      jspb.Message.setField(this, 6, value);
    };
    proto.BINRoomConfig.prototype.clearMinlevel = function() {
      jspb.Message.setField(this, 6, void 0);
    };
    proto.BINRoomConfig.prototype.hasMinlevel = function() {
      return null != jspb.Message.getField(this, 6);
    };
    proto.BINRoomConfig.prototype.getRoomcapacity = function() {
      return jspb.Message.getFieldWithDefault(this, 7, 0);
    };
    proto.BINRoomConfig.prototype.setRoomcapacity = function(value) {
      jspb.Message.setField(this, 7, value);
    };
    proto.BINRoomConfig.prototype.clearRoomcapacity = function() {
      jspb.Message.setField(this, 7, void 0);
    };
    proto.BINRoomConfig.prototype.hasRoomcapacity = function() {
      return null != jspb.Message.getField(this, 7);
    };
    proto.BINRoomConfig.prototype.getPlayersize = function() {
      return jspb.Message.getFieldWithDefault(this, 8, 0);
    };
    proto.BINRoomConfig.prototype.setPlayersize = function(value) {
      jspb.Message.setField(this, 8, value);
    };
    proto.BINRoomConfig.prototype.clearPlayersize = function() {
      jspb.Message.setField(this, 8, void 0);
    };
    proto.BINRoomConfig.prototype.hasPlayersize = function() {
      return null != jspb.Message.getField(this, 8);
    };
    proto.BINRoomConfig.prototype.getMinbet = function() {
      return jspb.Message.getFieldWithDefault(this, 9, 0);
    };
    proto.BINRoomConfig.prototype.setMinbet = function(value) {
      jspb.Message.setField(this, 9, value);
    };
    proto.BINRoomConfig.prototype.clearMinbet = function() {
      jspb.Message.setField(this, 9, void 0);
    };
    proto.BINRoomConfig.prototype.hasMinbet = function() {
      return null != jspb.Message.getField(this, 9);
    };
    proto.BINRoomConfig.prototype.getTax = function() {
      return jspb.Message.getFieldWithDefault(this, 10, 0);
    };
    proto.BINRoomConfig.prototype.setTax = function(value) {
      jspb.Message.setField(this, 10, value);
    };
    proto.BINRoomConfig.prototype.clearTax = function() {
      jspb.Message.setField(this, 10, void 0);
    };
    proto.BINRoomConfig.prototype.hasTax = function() {
      return null != jspb.Message.getField(this, 10);
    };
    proto.BINRoomConfig.prototype.getActive = function() {
      return jspb.Message.getFieldWithDefault(this, 11, false);
    };
    proto.BINRoomConfig.prototype.setActive = function(value) {
      jspb.Message.setField(this, 11, value);
    };
    proto.BINRoomConfig.prototype.clearActive = function() {
      jspb.Message.setField(this, 11, void 0);
    };
    proto.BINRoomConfig.prototype.hasActive = function() {
      return null != jspb.Message.getField(this, 11);
    };
    proto.BINEnterZoneResponse = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, proto.BINEnterZoneResponse.repeatedFields_, null);
    };
    goog.inherits(proto.BINEnterZoneResponse, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINEnterZoneResponse.displayName = "proto.BINEnterZoneResponse");
    proto.BINEnterZoneResponse.repeatedFields_ = [ 5, 6 ];
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINEnterZoneResponse.prototype.toObject = function(opt_includeInstance) {
        return proto.BINEnterZoneResponse.toObject(opt_includeInstance, this);
      };
      proto.BINEnterZoneResponse.toObject = function(includeInstance, msg) {
        var f, obj = {
          responsecode: jspb.Message.getField(msg, 1),
          message: jspb.Message.getField(msg, 2),
          enabledisplayroomlist: jspb.Message.getField(msg, 3),
          defaultroomtypeload: jspb.Message.getField(msg, 4),
          cashroomconfigsList: jspb.Message.toObjectList(msg.getCashroomconfigsList(), proto.BINRoomConfig.toObject, includeInstance),
          goldroomconfigsList: jspb.Message.toObjectList(msg.getGoldroomconfigsList(), proto.BINRoomConfig.toObject, includeInstance),
          zoneid: jspb.Message.getField(msg, 7),
          jarstatus: jspb.Message.getField(msg, 8)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINEnterZoneResponse.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINEnterZoneResponse();
      return proto.BINEnterZoneResponse.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINEnterZoneResponse.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readBool();
          msg.setResponsecode(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setMessage(value);
          break;

         case 3:
          var value = reader.readBool();
          msg.setEnabledisplayroomlist(value);
          break;

         case 4:
          var value = reader.readInt32();
          msg.setDefaultroomtypeload(value);
          break;

         case 5:
          var value = new proto.BINRoomConfig();
          reader.readMessage(value, proto.BINRoomConfig.deserializeBinaryFromReader);
          msg.addCashroomconfigs(value);
          break;

         case 6:
          var value = new proto.BINRoomConfig();
          reader.readMessage(value, proto.BINRoomConfig.deserializeBinaryFromReader);
          msg.addGoldroomconfigs(value);
          break;

         case 7:
          var value = reader.readInt32();
          msg.setZoneid(value);
          break;

         case 8:
          var value = reader.readBool();
          msg.setJarstatus(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINEnterZoneResponse.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINEnterZoneResponse.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINEnterZoneResponse.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeBool(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeBool(3, f);
      f = jspb.Message.getField(this, 4);
      null != f && writer.writeInt32(4, f);
      f = this.getCashroomconfigsList();
      f.length > 0 && writer.writeRepeatedMessage(5, f, proto.BINRoomConfig.serializeBinaryToWriter);
      f = this.getGoldroomconfigsList();
      f.length > 0 && writer.writeRepeatedMessage(6, f, proto.BINRoomConfig.serializeBinaryToWriter);
      f = jspb.Message.getField(this, 7);
      null != f && writer.writeInt32(7, f);
      f = jspb.Message.getField(this, 8);
      null != f && writer.writeBool(8, f);
    };
    proto.BINEnterZoneResponse.prototype.getResponsecode = function() {
      return jspb.Message.getFieldWithDefault(this, 1, false);
    };
    proto.BINEnterZoneResponse.prototype.setResponsecode = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINEnterZoneResponse.prototype.clearResponsecode = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINEnterZoneResponse.prototype.hasResponsecode = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINEnterZoneResponse.prototype.getMessage = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINEnterZoneResponse.prototype.setMessage = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINEnterZoneResponse.prototype.clearMessage = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINEnterZoneResponse.prototype.hasMessage = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINEnterZoneResponse.prototype.getEnabledisplayroomlist = function() {
      return jspb.Message.getFieldWithDefault(this, 3, false);
    };
    proto.BINEnterZoneResponse.prototype.setEnabledisplayroomlist = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINEnterZoneResponse.prototype.clearEnabledisplayroomlist = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINEnterZoneResponse.prototype.hasEnabledisplayroomlist = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINEnterZoneResponse.prototype.getDefaultroomtypeload = function() {
      return jspb.Message.getFieldWithDefault(this, 4, 0);
    };
    proto.BINEnterZoneResponse.prototype.setDefaultroomtypeload = function(value) {
      jspb.Message.setField(this, 4, value);
    };
    proto.BINEnterZoneResponse.prototype.clearDefaultroomtypeload = function() {
      jspb.Message.setField(this, 4, void 0);
    };
    proto.BINEnterZoneResponse.prototype.hasDefaultroomtypeload = function() {
      return null != jspb.Message.getField(this, 4);
    };
    proto.BINEnterZoneResponse.prototype.getCashroomconfigsList = function() {
      return jspb.Message.getRepeatedWrapperField(this, proto.BINRoomConfig, 5);
    };
    proto.BINEnterZoneResponse.prototype.setCashroomconfigsList = function(value) {
      jspb.Message.setRepeatedWrapperField(this, 5, value);
    };
    proto.BINEnterZoneResponse.prototype.addCashroomconfigs = function(opt_value, opt_index) {
      return jspb.Message.addToRepeatedWrapperField(this, 5, opt_value, proto.BINRoomConfig, opt_index);
    };
    proto.BINEnterZoneResponse.prototype.clearCashroomconfigsList = function() {
      this.setCashroomconfigsList([]);
    };
    proto.BINEnterZoneResponse.prototype.getGoldroomconfigsList = function() {
      return jspb.Message.getRepeatedWrapperField(this, proto.BINRoomConfig, 6);
    };
    proto.BINEnterZoneResponse.prototype.setGoldroomconfigsList = function(value) {
      jspb.Message.setRepeatedWrapperField(this, 6, value);
    };
    proto.BINEnterZoneResponse.prototype.addGoldroomconfigs = function(opt_value, opt_index) {
      return jspb.Message.addToRepeatedWrapperField(this, 6, opt_value, proto.BINRoomConfig, opt_index);
    };
    proto.BINEnterZoneResponse.prototype.clearGoldroomconfigsList = function() {
      this.setGoldroomconfigsList([]);
    };
    proto.BINEnterZoneResponse.prototype.getZoneid = function() {
      return jspb.Message.getFieldWithDefault(this, 7, 0);
    };
    proto.BINEnterZoneResponse.prototype.setZoneid = function(value) {
      jspb.Message.setField(this, 7, value);
    };
    proto.BINEnterZoneResponse.prototype.clearZoneid = function() {
      jspb.Message.setField(this, 7, void 0);
    };
    proto.BINEnterZoneResponse.prototype.hasZoneid = function() {
      return null != jspb.Message.getField(this, 7);
    };
    proto.BINEnterZoneResponse.prototype.getJarstatus = function() {
      return jspb.Message.getFieldWithDefault(this, 8, false);
    };
    proto.BINEnterZoneResponse.prototype.setJarstatus = function(value) {
      jspb.Message.setField(this, 8, value);
    };
    proto.BINEnterZoneResponse.prototype.clearJarstatus = function() {
      jspb.Message.setField(this, 8, void 0);
    };
    proto.BINEnterZoneResponse.prototype.hasJarstatus = function() {
      return null != jspb.Message.getField(this, 8);
    };
    proto.BINExitZoneRequest = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINExitZoneRequest, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINExitZoneRequest.displayName = "proto.BINExitZoneRequest");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINExitZoneRequest.prototype.toObject = function(opt_includeInstance) {
        return proto.BINExitZoneRequest.toObject(opt_includeInstance, this);
      };
      proto.BINExitZoneRequest.toObject = function(includeInstance, msg) {
        var f, obj = {
          zoneid: jspb.Message.getField(msg, 1)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINExitZoneRequest.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINExitZoneRequest();
      return proto.BINExitZoneRequest.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINExitZoneRequest.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt32();
          msg.setZoneid(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINExitZoneRequest.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINExitZoneRequest.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINExitZoneRequest.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt32(1, f);
    };
    proto.BINExitZoneRequest.prototype.getZoneid = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINExitZoneRequest.prototype.setZoneid = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINExitZoneRequest.prototype.clearZoneid = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINExitZoneRequest.prototype.hasZoneid = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINExitZoneResponse = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINExitZoneResponse, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINExitZoneResponse.displayName = "proto.BINExitZoneResponse");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINExitZoneResponse.prototype.toObject = function(opt_includeInstance) {
        return proto.BINExitZoneResponse.toObject(opt_includeInstance, this);
      };
      proto.BINExitZoneResponse.toObject = function(includeInstance, msg) {
        var f, obj = {
          responsecode: jspb.Message.getField(msg, 1),
          message: jspb.Message.getField(msg, 2),
          zoneid: jspb.Message.getField(msg, 3)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINExitZoneResponse.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINExitZoneResponse();
      return proto.BINExitZoneResponse.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINExitZoneResponse.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readBool();
          msg.setResponsecode(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setMessage(value);
          break;

         case 3:
          var value = reader.readInt32();
          msg.setZoneid(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINExitZoneResponse.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINExitZoneResponse.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINExitZoneResponse.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeBool(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeInt32(3, f);
    };
    proto.BINExitZoneResponse.prototype.getResponsecode = function() {
      return jspb.Message.getFieldWithDefault(this, 1, false);
    };
    proto.BINExitZoneResponse.prototype.setResponsecode = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINExitZoneResponse.prototype.clearResponsecode = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINExitZoneResponse.prototype.hasResponsecode = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINExitZoneResponse.prototype.getMessage = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINExitZoneResponse.prototype.setMessage = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINExitZoneResponse.prototype.clearMessage = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINExitZoneResponse.prototype.hasMessage = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINExitZoneResponse.prototype.getZoneid = function() {
      return jspb.Message.getFieldWithDefault(this, 3, 0);
    };
    proto.BINExitZoneResponse.prototype.setZoneid = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINExitZoneResponse.prototype.clearZoneid = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINExitZoneResponse.prototype.hasZoneid = function() {
      return null != jspb.Message.getField(this, 3);
    };
    goog.object.extend(exports, proto);
    cc._RF.pop();
  }, {
    "google-protobuf": "google-protobuf"
  } ],
  exit_room_pb: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "17533cwVPZCJZ3YpNlQ/1xs", "exit_room_pb");
    "use strict";
    var jspb = require("google-protobuf");
    var goog = jspb;
    var global = Function("return this")();
    goog.exportSymbol("proto.BINCancelExitAfterMatchEndRequest", null, global);
    goog.exportSymbol("proto.BINCancelExitAfterMatchEndResponse", null, global);
    goog.exportSymbol("proto.BINExitRoomRequest", null, global);
    goog.exportSymbol("proto.BINExitRoomResponse", null, global);
    goog.exportSymbol("proto.BINPlayerExitAfterMatchEndResponse", null, global);
    goog.exportSymbol("proto.BINPlayerExitRoomResponse", null, global);
    proto.BINExitRoomRequest = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINExitRoomRequest, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINExitRoomRequest.displayName = "proto.BINExitRoomRequest");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINExitRoomRequest.prototype.toObject = function(opt_includeInstance) {
        return proto.BINExitRoomRequest.toObject(opt_includeInstance, this);
      };
      proto.BINExitRoomRequest.toObject = function(includeInstance, msg) {
        var f, obj = {
          roomindex: jspb.Message.getField(msg, 1)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINExitRoomRequest.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINExitRoomRequest();
      return proto.BINExitRoomRequest.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINExitRoomRequest.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt32();
          msg.setRoomindex(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINExitRoomRequest.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINExitRoomRequest.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINExitRoomRequest.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt32(1, f);
    };
    proto.BINExitRoomRequest.prototype.getRoomindex = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINExitRoomRequest.prototype.setRoomindex = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINExitRoomRequest.prototype.clearRoomindex = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINExitRoomRequest.prototype.hasRoomindex = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINExitRoomResponse = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINExitRoomResponse, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINExitRoomResponse.displayName = "proto.BINExitRoomResponse");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINExitRoomResponse.prototype.toObject = function(opt_includeInstance) {
        return proto.BINExitRoomResponse.toObject(opt_includeInstance, this);
      };
      proto.BINExitRoomResponse.toObject = function(includeInstance, msg) {
        var f, obj = {
          responsecode: jspb.Message.getField(msg, 1),
          message: jspb.Message.getField(msg, 2),
          exitaftermatchend: jspb.Message.getField(msg, 3),
          notenoughmoney: jspb.Message.getField(msg, 4),
          zoneid: jspb.Message.getField(msg, 5)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINExitRoomResponse.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINExitRoomResponse();
      return proto.BINExitRoomResponse.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINExitRoomResponse.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readBool();
          msg.setResponsecode(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setMessage(value);
          break;

         case 3:
          var value = reader.readBool();
          msg.setExitaftermatchend(value);
          break;

         case 4:
          var value = reader.readBool();
          msg.setNotenoughmoney(value);
          break;

         case 5:
          var value = reader.readInt32();
          msg.setZoneid(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINExitRoomResponse.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINExitRoomResponse.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINExitRoomResponse.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeBool(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeBool(3, f);
      f = jspb.Message.getField(this, 4);
      null != f && writer.writeBool(4, f);
      f = jspb.Message.getField(this, 5);
      null != f && writer.writeInt32(5, f);
    };
    proto.BINExitRoomResponse.prototype.getResponsecode = function() {
      return jspb.Message.getFieldWithDefault(this, 1, false);
    };
    proto.BINExitRoomResponse.prototype.setResponsecode = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINExitRoomResponse.prototype.clearResponsecode = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINExitRoomResponse.prototype.hasResponsecode = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINExitRoomResponse.prototype.getMessage = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINExitRoomResponse.prototype.setMessage = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINExitRoomResponse.prototype.clearMessage = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINExitRoomResponse.prototype.hasMessage = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINExitRoomResponse.prototype.getExitaftermatchend = function() {
      return jspb.Message.getFieldWithDefault(this, 3, false);
    };
    proto.BINExitRoomResponse.prototype.setExitaftermatchend = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINExitRoomResponse.prototype.clearExitaftermatchend = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINExitRoomResponse.prototype.hasExitaftermatchend = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINExitRoomResponse.prototype.getNotenoughmoney = function() {
      return jspb.Message.getFieldWithDefault(this, 4, false);
    };
    proto.BINExitRoomResponse.prototype.setNotenoughmoney = function(value) {
      jspb.Message.setField(this, 4, value);
    };
    proto.BINExitRoomResponse.prototype.clearNotenoughmoney = function() {
      jspb.Message.setField(this, 4, void 0);
    };
    proto.BINExitRoomResponse.prototype.hasNotenoughmoney = function() {
      return null != jspb.Message.getField(this, 4);
    };
    proto.BINExitRoomResponse.prototype.getZoneid = function() {
      return jspb.Message.getFieldWithDefault(this, 5, 0);
    };
    proto.BINExitRoomResponse.prototype.setZoneid = function(value) {
      jspb.Message.setField(this, 5, value);
    };
    proto.BINExitRoomResponse.prototype.clearZoneid = function() {
      jspb.Message.setField(this, 5, void 0);
    };
    proto.BINExitRoomResponse.prototype.hasZoneid = function() {
      return null != jspb.Message.getField(this, 5);
    };
    proto.BINPlayerExitAfterMatchEndResponse = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINPlayerExitAfterMatchEndResponse, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINPlayerExitAfterMatchEndResponse.displayName = "proto.BINPlayerExitAfterMatchEndResponse");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINPlayerExitAfterMatchEndResponse.prototype.toObject = function(opt_includeInstance) {
        return proto.BINPlayerExitAfterMatchEndResponse.toObject(opt_includeInstance, this);
      };
      proto.BINPlayerExitAfterMatchEndResponse.toObject = function(includeInstance, msg) {
        var f, obj = {
          responsecode: jspb.Message.getField(msg, 1),
          message: jspb.Message.getField(msg, 2),
          exituserid: jspb.Message.getField(msg, 3)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINPlayerExitAfterMatchEndResponse.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINPlayerExitAfterMatchEndResponse();
      return proto.BINPlayerExitAfterMatchEndResponse.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINPlayerExitAfterMatchEndResponse.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readBool();
          msg.setResponsecode(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setMessage(value);
          break;

         case 3:
          var value = reader.readInt64();
          msg.setExituserid(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINPlayerExitAfterMatchEndResponse.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINPlayerExitAfterMatchEndResponse.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINPlayerExitAfterMatchEndResponse.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeBool(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeInt64(3, f);
    };
    proto.BINPlayerExitAfterMatchEndResponse.prototype.getResponsecode = function() {
      return jspb.Message.getFieldWithDefault(this, 1, false);
    };
    proto.BINPlayerExitAfterMatchEndResponse.prototype.setResponsecode = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINPlayerExitAfterMatchEndResponse.prototype.clearResponsecode = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINPlayerExitAfterMatchEndResponse.prototype.hasResponsecode = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINPlayerExitAfterMatchEndResponse.prototype.getMessage = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINPlayerExitAfterMatchEndResponse.prototype.setMessage = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINPlayerExitAfterMatchEndResponse.prototype.clearMessage = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINPlayerExitAfterMatchEndResponse.prototype.hasMessage = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINPlayerExitAfterMatchEndResponse.prototype.getExituserid = function() {
      return jspb.Message.getFieldWithDefault(this, 3, 0);
    };
    proto.BINPlayerExitAfterMatchEndResponse.prototype.setExituserid = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINPlayerExitAfterMatchEndResponse.prototype.clearExituserid = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINPlayerExitAfterMatchEndResponse.prototype.hasExituserid = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINPlayerExitRoomResponse = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINPlayerExitRoomResponse, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINPlayerExitRoomResponse.displayName = "proto.BINPlayerExitRoomResponse");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINPlayerExitRoomResponse.prototype.toObject = function(opt_includeInstance) {
        return proto.BINPlayerExitRoomResponse.toObject(opt_includeInstance, this);
      };
      proto.BINPlayerExitRoomResponse.toObject = function(includeInstance, msg) {
        var f, obj = {
          responsecode: jspb.Message.getField(msg, 1),
          message: jspb.Message.getField(msg, 2),
          exituserid: jspb.Message.getField(msg, 3),
          owneruserid: jspb.Message.getField(msg, 4),
          changeownerroomcd: jspb.Message.getField(msg, 5)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINPlayerExitRoomResponse.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINPlayerExitRoomResponse();
      return proto.BINPlayerExitRoomResponse.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINPlayerExitRoomResponse.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readBool();
          msg.setResponsecode(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setMessage(value);
          break;

         case 3:
          var value = reader.readInt64();
          msg.setExituserid(value);
          break;

         case 4:
          var value = reader.readInt64();
          msg.setOwneruserid(value);
          break;

         case 5:
          var value = reader.readInt32();
          msg.setChangeownerroomcd(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINPlayerExitRoomResponse.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINPlayerExitRoomResponse.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINPlayerExitRoomResponse.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeBool(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeInt64(3, f);
      f = jspb.Message.getField(this, 4);
      null != f && writer.writeInt64(4, f);
      f = jspb.Message.getField(this, 5);
      null != f && writer.writeInt32(5, f);
    };
    proto.BINPlayerExitRoomResponse.prototype.getResponsecode = function() {
      return jspb.Message.getFieldWithDefault(this, 1, false);
    };
    proto.BINPlayerExitRoomResponse.prototype.setResponsecode = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINPlayerExitRoomResponse.prototype.clearResponsecode = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINPlayerExitRoomResponse.prototype.hasResponsecode = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINPlayerExitRoomResponse.prototype.getMessage = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINPlayerExitRoomResponse.prototype.setMessage = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINPlayerExitRoomResponse.prototype.clearMessage = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINPlayerExitRoomResponse.prototype.hasMessage = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINPlayerExitRoomResponse.prototype.getExituserid = function() {
      return jspb.Message.getFieldWithDefault(this, 3, 0);
    };
    proto.BINPlayerExitRoomResponse.prototype.setExituserid = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINPlayerExitRoomResponse.prototype.clearExituserid = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINPlayerExitRoomResponse.prototype.hasExituserid = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINPlayerExitRoomResponse.prototype.getOwneruserid = function() {
      return jspb.Message.getFieldWithDefault(this, 4, 0);
    };
    proto.BINPlayerExitRoomResponse.prototype.setOwneruserid = function(value) {
      jspb.Message.setField(this, 4, value);
    };
    proto.BINPlayerExitRoomResponse.prototype.clearOwneruserid = function() {
      jspb.Message.setField(this, 4, void 0);
    };
    proto.BINPlayerExitRoomResponse.prototype.hasOwneruserid = function() {
      return null != jspb.Message.getField(this, 4);
    };
    proto.BINPlayerExitRoomResponse.prototype.getChangeownerroomcd = function() {
      return jspb.Message.getFieldWithDefault(this, 5, 0);
    };
    proto.BINPlayerExitRoomResponse.prototype.setChangeownerroomcd = function(value) {
      jspb.Message.setField(this, 5, value);
    };
    proto.BINPlayerExitRoomResponse.prototype.clearChangeownerroomcd = function() {
      jspb.Message.setField(this, 5, void 0);
    };
    proto.BINPlayerExitRoomResponse.prototype.hasChangeownerroomcd = function() {
      return null != jspb.Message.getField(this, 5);
    };
    proto.BINCancelExitAfterMatchEndRequest = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINCancelExitAfterMatchEndRequest, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINCancelExitAfterMatchEndRequest.displayName = "proto.BINCancelExitAfterMatchEndRequest");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINCancelExitAfterMatchEndRequest.prototype.toObject = function(opt_includeInstance) {
        return proto.BINCancelExitAfterMatchEndRequest.toObject(opt_includeInstance, this);
      };
      proto.BINCancelExitAfterMatchEndRequest.toObject = function(includeInstance, msg) {
        var f, obj = {
          roomindex: jspb.Message.getField(msg, 1)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINCancelExitAfterMatchEndRequest.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINCancelExitAfterMatchEndRequest();
      return proto.BINCancelExitAfterMatchEndRequest.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINCancelExitAfterMatchEndRequest.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt32();
          msg.setRoomindex(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINCancelExitAfterMatchEndRequest.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINCancelExitAfterMatchEndRequest.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINCancelExitAfterMatchEndRequest.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt32(1, f);
    };
    proto.BINCancelExitAfterMatchEndRequest.prototype.getRoomindex = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINCancelExitAfterMatchEndRequest.prototype.setRoomindex = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINCancelExitAfterMatchEndRequest.prototype.clearRoomindex = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINCancelExitAfterMatchEndRequest.prototype.hasRoomindex = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINCancelExitAfterMatchEndResponse = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINCancelExitAfterMatchEndResponse, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINCancelExitAfterMatchEndResponse.displayName = "proto.BINCancelExitAfterMatchEndResponse");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINCancelExitAfterMatchEndResponse.prototype.toObject = function(opt_includeInstance) {
        return proto.BINCancelExitAfterMatchEndResponse.toObject(opt_includeInstance, this);
      };
      proto.BINCancelExitAfterMatchEndResponse.toObject = function(includeInstance, msg) {
        var f, obj = {
          responsecode: jspb.Message.getField(msg, 1),
          message: jspb.Message.getField(msg, 2),
          cancelexituserid: jspb.Message.getField(msg, 3)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINCancelExitAfterMatchEndResponse.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINCancelExitAfterMatchEndResponse();
      return proto.BINCancelExitAfterMatchEndResponse.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINCancelExitAfterMatchEndResponse.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readBool();
          msg.setResponsecode(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setMessage(value);
          break;

         case 3:
          var value = reader.readInt64();
          msg.setCancelexituserid(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINCancelExitAfterMatchEndResponse.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINCancelExitAfterMatchEndResponse.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINCancelExitAfterMatchEndResponse.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeBool(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeInt64(3, f);
    };
    proto.BINCancelExitAfterMatchEndResponse.prototype.getResponsecode = function() {
      return jspb.Message.getFieldWithDefault(this, 1, false);
    };
    proto.BINCancelExitAfterMatchEndResponse.prototype.setResponsecode = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINCancelExitAfterMatchEndResponse.prototype.clearResponsecode = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINCancelExitAfterMatchEndResponse.prototype.hasResponsecode = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINCancelExitAfterMatchEndResponse.prototype.getMessage = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINCancelExitAfterMatchEndResponse.prototype.setMessage = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINCancelExitAfterMatchEndResponse.prototype.clearMessage = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINCancelExitAfterMatchEndResponse.prototype.hasMessage = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINCancelExitAfterMatchEndResponse.prototype.getCancelexituserid = function() {
      return jspb.Message.getFieldWithDefault(this, 3, 0);
    };
    proto.BINCancelExitAfterMatchEndResponse.prototype.setCancelexituserid = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINCancelExitAfterMatchEndResponse.prototype.clearCancelexituserid = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINCancelExitAfterMatchEndResponse.prototype.hasCancelexituserid = function() {
      return null != jspb.Message.getField(this, 3);
    };
    goog.object.extend(exports, proto);
    cc._RF.pop();
  }, {
    "google-protobuf": "google-protobuf"
  } ],
  filter_room_pb: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "df8a7AYl6xLBYpFGp7dM3Sw", "filter_room_pb");
    "use strict";
    var jspb = require("google-protobuf");
    var goog = jspb;
    var global = Function("return this")();
    goog.exportSymbol("proto.BINFilterRoomRequest", null, global);
    goog.exportSymbol("proto.BINFilterRoomResponse", null, global);
    goog.exportSymbol("proto.BINRoomPlay", null, global);
    goog.exportSymbol("proto.BINRoomStatus", null, global);
    goog.exportSymbol("proto.BINRoomStatusRequest", null, global);
    goog.exportSymbol("proto.BINRoomStatusResponse", null, global);
    proto.BINFilterRoomRequest = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINFilterRoomRequest, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINFilterRoomRequest.displayName = "proto.BINFilterRoomRequest");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINFilterRoomRequest.prototype.toObject = function(opt_includeInstance) {
        return proto.BINFilterRoomRequest.toObject(opt_includeInstance, this);
      };
      proto.BINFilterRoomRequest.toObject = function(includeInstance, msg) {
        var f, obj = {
          zoneid: jspb.Message.getField(msg, 1),
          roomtype: jspb.Message.getField(msg, 2),
          firstresult: jspb.Message.getField(msg, 3),
          maxresult: jspb.Message.getField(msg, 4),
          orderbyfield: jspb.Message.getField(msg, 5),
          asc: jspb.Message.getField(msg, 6),
          roomgroup: jspb.Message.getField(msg, 7)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINFilterRoomRequest.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINFilterRoomRequest();
      return proto.BINFilterRoomRequest.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINFilterRoomRequest.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt32();
          msg.setZoneid(value);
          break;

         case 2:
          var value = reader.readInt32();
          msg.setRoomtype(value);
          break;

         case 3:
          var value = reader.readInt32();
          msg.setFirstresult(value);
          break;

         case 4:
          var value = reader.readInt32();
          msg.setMaxresult(value);
          break;

         case 5:
          var value = reader.readInt32();
          msg.setOrderbyfield(value);
          break;

         case 6:
          var value = reader.readBool();
          msg.setAsc(value);
          break;

         case 7:
          var value = reader.readInt32();
          msg.setRoomgroup(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINFilterRoomRequest.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINFilterRoomRequest.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINFilterRoomRequest.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt32(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeInt32(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeInt32(3, f);
      f = jspb.Message.getField(this, 4);
      null != f && writer.writeInt32(4, f);
      f = jspb.Message.getField(this, 5);
      null != f && writer.writeInt32(5, f);
      f = jspb.Message.getField(this, 6);
      null != f && writer.writeBool(6, f);
      f = jspb.Message.getField(this, 7);
      null != f && writer.writeInt32(7, f);
    };
    proto.BINFilterRoomRequest.prototype.getZoneid = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINFilterRoomRequest.prototype.setZoneid = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINFilterRoomRequest.prototype.clearZoneid = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINFilterRoomRequest.prototype.hasZoneid = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINFilterRoomRequest.prototype.getRoomtype = function() {
      return jspb.Message.getFieldWithDefault(this, 2, 0);
    };
    proto.BINFilterRoomRequest.prototype.setRoomtype = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINFilterRoomRequest.prototype.clearRoomtype = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINFilterRoomRequest.prototype.hasRoomtype = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINFilterRoomRequest.prototype.getFirstresult = function() {
      return jspb.Message.getFieldWithDefault(this, 3, 0);
    };
    proto.BINFilterRoomRequest.prototype.setFirstresult = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINFilterRoomRequest.prototype.clearFirstresult = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINFilterRoomRequest.prototype.hasFirstresult = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINFilterRoomRequest.prototype.getMaxresult = function() {
      return jspb.Message.getFieldWithDefault(this, 4, 0);
    };
    proto.BINFilterRoomRequest.prototype.setMaxresult = function(value) {
      jspb.Message.setField(this, 4, value);
    };
    proto.BINFilterRoomRequest.prototype.clearMaxresult = function() {
      jspb.Message.setField(this, 4, void 0);
    };
    proto.BINFilterRoomRequest.prototype.hasMaxresult = function() {
      return null != jspb.Message.getField(this, 4);
    };
    proto.BINFilterRoomRequest.prototype.getOrderbyfield = function() {
      return jspb.Message.getFieldWithDefault(this, 5, 0);
    };
    proto.BINFilterRoomRequest.prototype.setOrderbyfield = function(value) {
      jspb.Message.setField(this, 5, value);
    };
    proto.BINFilterRoomRequest.prototype.clearOrderbyfield = function() {
      jspb.Message.setField(this, 5, void 0);
    };
    proto.BINFilterRoomRequest.prototype.hasOrderbyfield = function() {
      return null != jspb.Message.getField(this, 5);
    };
    proto.BINFilterRoomRequest.prototype.getAsc = function() {
      return jspb.Message.getFieldWithDefault(this, 6, false);
    };
    proto.BINFilterRoomRequest.prototype.setAsc = function(value) {
      jspb.Message.setField(this, 6, value);
    };
    proto.BINFilterRoomRequest.prototype.clearAsc = function() {
      jspb.Message.setField(this, 6, void 0);
    };
    proto.BINFilterRoomRequest.prototype.hasAsc = function() {
      return null != jspb.Message.getField(this, 6);
    };
    proto.BINFilterRoomRequest.prototype.getRoomgroup = function() {
      return jspb.Message.getFieldWithDefault(this, 7, 0);
    };
    proto.BINFilterRoomRequest.prototype.setRoomgroup = function(value) {
      jspb.Message.setField(this, 7, value);
    };
    proto.BINFilterRoomRequest.prototype.clearRoomgroup = function() {
      jspb.Message.setField(this, 7, void 0);
    };
    proto.BINFilterRoomRequest.prototype.hasRoomgroup = function() {
      return null != jspb.Message.getField(this, 7);
    };
    proto.BINRoomPlay = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINRoomPlay, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINRoomPlay.displayName = "proto.BINRoomPlay");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINRoomPlay.prototype.toObject = function(opt_includeInstance) {
        return proto.BINRoomPlay.toObject(opt_includeInstance, this);
      };
      proto.BINRoomPlay.toObject = function(includeInstance, msg) {
        var f, obj = {
          roomindex: jspb.Message.getField(msg, 1),
          roomname: jspb.Message.getField(msg, 2),
          roomid: jspb.Message.getField(msg, 3),
          roomgroupid: jspb.Message.getField(msg, 4),
          minbet: jspb.Message.getField(msg, 5),
          minentermoney: jspb.Message.getField(msg, 6),
          roomcapacity: jspb.Message.getField(msg, 7),
          enteringplayer: jspb.Message.getField(msg, 8),
          playersize: jspb.Message.getField(msg, 9),
          playingplayer: jspb.Message.getField(msg, 10),
          level: jspb.Message.getField(msg, 11),
          tax: jspb.Message.getField(msg, 12),
          ownerusername: jspb.Message.getField(msg, 13),
          viproom: jspb.Message.getField(msg, 14),
          passwordrequired: jspb.Message.getField(msg, 15),
          roomconfig: jspb.Message.getField(msg, 16)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINRoomPlay.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINRoomPlay();
      return proto.BINRoomPlay.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINRoomPlay.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt32();
          msg.setRoomindex(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setRoomname(value);
          break;

         case 3:
          var value = reader.readInt64();
          msg.setRoomid(value);
          break;

         case 4:
          var value = reader.readInt32();
          msg.setRoomgroupid(value);
          break;

         case 5:
          var value = reader.readInt32();
          msg.setMinbet(value);
          break;

         case 6:
          var value = reader.readInt64();
          msg.setMinentermoney(value);
          break;

         case 7:
          var value = reader.readInt32();
          msg.setRoomcapacity(value);
          break;

         case 8:
          var value = reader.readInt32();
          msg.setEnteringplayer(value);
          break;

         case 9:
          var value = reader.readInt32();
          msg.setPlayersize(value);
          break;

         case 10:
          var value = reader.readInt32();
          msg.setPlayingplayer(value);
          break;

         case 11:
          var value = reader.readInt32();
          msg.setLevel(value);
          break;

         case 12:
          var value = reader.readInt32();
          msg.setTax(value);
          break;

         case 13:
          var value = reader.readString();
          msg.setOwnerusername(value);
          break;

         case 14:
          var value = reader.readBool();
          msg.setViproom(value);
          break;

         case 15:
          var value = reader.readBool();
          msg.setPasswordrequired(value);
          break;

         case 16:
          var value = reader.readString();
          msg.setRoomconfig(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINRoomPlay.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINRoomPlay.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINRoomPlay.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt32(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeInt64(3, f);
      f = jspb.Message.getField(this, 4);
      null != f && writer.writeInt32(4, f);
      f = jspb.Message.getField(this, 5);
      null != f && writer.writeInt32(5, f);
      f = jspb.Message.getField(this, 6);
      null != f && writer.writeInt64(6, f);
      f = jspb.Message.getField(this, 7);
      null != f && writer.writeInt32(7, f);
      f = jspb.Message.getField(this, 8);
      null != f && writer.writeInt32(8, f);
      f = jspb.Message.getField(this, 9);
      null != f && writer.writeInt32(9, f);
      f = jspb.Message.getField(this, 10);
      null != f && writer.writeInt32(10, f);
      f = jspb.Message.getField(this, 11);
      null != f && writer.writeInt32(11, f);
      f = jspb.Message.getField(this, 12);
      null != f && writer.writeInt32(12, f);
      f = jspb.Message.getField(this, 13);
      null != f && writer.writeString(13, f);
      f = jspb.Message.getField(this, 14);
      null != f && writer.writeBool(14, f);
      f = jspb.Message.getField(this, 15);
      null != f && writer.writeBool(15, f);
      f = jspb.Message.getField(this, 16);
      null != f && writer.writeString(16, f);
    };
    proto.BINRoomPlay.prototype.getRoomindex = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINRoomPlay.prototype.setRoomindex = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINRoomPlay.prototype.clearRoomindex = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINRoomPlay.prototype.hasRoomindex = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINRoomPlay.prototype.getRoomname = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINRoomPlay.prototype.setRoomname = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINRoomPlay.prototype.clearRoomname = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINRoomPlay.prototype.hasRoomname = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINRoomPlay.prototype.getRoomid = function() {
      return jspb.Message.getFieldWithDefault(this, 3, 0);
    };
    proto.BINRoomPlay.prototype.setRoomid = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINRoomPlay.prototype.clearRoomid = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINRoomPlay.prototype.hasRoomid = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINRoomPlay.prototype.getRoomgroupid = function() {
      return jspb.Message.getFieldWithDefault(this, 4, 0);
    };
    proto.BINRoomPlay.prototype.setRoomgroupid = function(value) {
      jspb.Message.setField(this, 4, value);
    };
    proto.BINRoomPlay.prototype.clearRoomgroupid = function() {
      jspb.Message.setField(this, 4, void 0);
    };
    proto.BINRoomPlay.prototype.hasRoomgroupid = function() {
      return null != jspb.Message.getField(this, 4);
    };
    proto.BINRoomPlay.prototype.getMinbet = function() {
      return jspb.Message.getFieldWithDefault(this, 5, 0);
    };
    proto.BINRoomPlay.prototype.setMinbet = function(value) {
      jspb.Message.setField(this, 5, value);
    };
    proto.BINRoomPlay.prototype.clearMinbet = function() {
      jspb.Message.setField(this, 5, void 0);
    };
    proto.BINRoomPlay.prototype.hasMinbet = function() {
      return null != jspb.Message.getField(this, 5);
    };
    proto.BINRoomPlay.prototype.getMinentermoney = function() {
      return jspb.Message.getFieldWithDefault(this, 6, 0);
    };
    proto.BINRoomPlay.prototype.setMinentermoney = function(value) {
      jspb.Message.setField(this, 6, value);
    };
    proto.BINRoomPlay.prototype.clearMinentermoney = function() {
      jspb.Message.setField(this, 6, void 0);
    };
    proto.BINRoomPlay.prototype.hasMinentermoney = function() {
      return null != jspb.Message.getField(this, 6);
    };
    proto.BINRoomPlay.prototype.getRoomcapacity = function() {
      return jspb.Message.getFieldWithDefault(this, 7, 0);
    };
    proto.BINRoomPlay.prototype.setRoomcapacity = function(value) {
      jspb.Message.setField(this, 7, value);
    };
    proto.BINRoomPlay.prototype.clearRoomcapacity = function() {
      jspb.Message.setField(this, 7, void 0);
    };
    proto.BINRoomPlay.prototype.hasRoomcapacity = function() {
      return null != jspb.Message.getField(this, 7);
    };
    proto.BINRoomPlay.prototype.getEnteringplayer = function() {
      return jspb.Message.getFieldWithDefault(this, 8, 0);
    };
    proto.BINRoomPlay.prototype.setEnteringplayer = function(value) {
      jspb.Message.setField(this, 8, value);
    };
    proto.BINRoomPlay.prototype.clearEnteringplayer = function() {
      jspb.Message.setField(this, 8, void 0);
    };
    proto.BINRoomPlay.prototype.hasEnteringplayer = function() {
      return null != jspb.Message.getField(this, 8);
    };
    proto.BINRoomPlay.prototype.getPlayersize = function() {
      return jspb.Message.getFieldWithDefault(this, 9, 0);
    };
    proto.BINRoomPlay.prototype.setPlayersize = function(value) {
      jspb.Message.setField(this, 9, value);
    };
    proto.BINRoomPlay.prototype.clearPlayersize = function() {
      jspb.Message.setField(this, 9, void 0);
    };
    proto.BINRoomPlay.prototype.hasPlayersize = function() {
      return null != jspb.Message.getField(this, 9);
    };
    proto.BINRoomPlay.prototype.getPlayingplayer = function() {
      return jspb.Message.getFieldWithDefault(this, 10, 0);
    };
    proto.BINRoomPlay.prototype.setPlayingplayer = function(value) {
      jspb.Message.setField(this, 10, value);
    };
    proto.BINRoomPlay.prototype.clearPlayingplayer = function() {
      jspb.Message.setField(this, 10, void 0);
    };
    proto.BINRoomPlay.prototype.hasPlayingplayer = function() {
      return null != jspb.Message.getField(this, 10);
    };
    proto.BINRoomPlay.prototype.getLevel = function() {
      return jspb.Message.getFieldWithDefault(this, 11, 0);
    };
    proto.BINRoomPlay.prototype.setLevel = function(value) {
      jspb.Message.setField(this, 11, value);
    };
    proto.BINRoomPlay.prototype.clearLevel = function() {
      jspb.Message.setField(this, 11, void 0);
    };
    proto.BINRoomPlay.prototype.hasLevel = function() {
      return null != jspb.Message.getField(this, 11);
    };
    proto.BINRoomPlay.prototype.getTax = function() {
      return jspb.Message.getFieldWithDefault(this, 12, 0);
    };
    proto.BINRoomPlay.prototype.setTax = function(value) {
      jspb.Message.setField(this, 12, value);
    };
    proto.BINRoomPlay.prototype.clearTax = function() {
      jspb.Message.setField(this, 12, void 0);
    };
    proto.BINRoomPlay.prototype.hasTax = function() {
      return null != jspb.Message.getField(this, 12);
    };
    proto.BINRoomPlay.prototype.getOwnerusername = function() {
      return jspb.Message.getFieldWithDefault(this, 13, "");
    };
    proto.BINRoomPlay.prototype.setOwnerusername = function(value) {
      jspb.Message.setField(this, 13, value);
    };
    proto.BINRoomPlay.prototype.clearOwnerusername = function() {
      jspb.Message.setField(this, 13, void 0);
    };
    proto.BINRoomPlay.prototype.hasOwnerusername = function() {
      return null != jspb.Message.getField(this, 13);
    };
    proto.BINRoomPlay.prototype.getViproom = function() {
      return jspb.Message.getFieldWithDefault(this, 14, false);
    };
    proto.BINRoomPlay.prototype.setViproom = function(value) {
      jspb.Message.setField(this, 14, value);
    };
    proto.BINRoomPlay.prototype.clearViproom = function() {
      jspb.Message.setField(this, 14, void 0);
    };
    proto.BINRoomPlay.prototype.hasViproom = function() {
      return null != jspb.Message.getField(this, 14);
    };
    proto.BINRoomPlay.prototype.getPasswordrequired = function() {
      return jspb.Message.getFieldWithDefault(this, 15, false);
    };
    proto.BINRoomPlay.prototype.setPasswordrequired = function(value) {
      jspb.Message.setField(this, 15, value);
    };
    proto.BINRoomPlay.prototype.clearPasswordrequired = function() {
      jspb.Message.setField(this, 15, void 0);
    };
    proto.BINRoomPlay.prototype.hasPasswordrequired = function() {
      return null != jspb.Message.getField(this, 15);
    };
    proto.BINRoomPlay.prototype.getRoomconfig = function() {
      return jspb.Message.getFieldWithDefault(this, 16, "");
    };
    proto.BINRoomPlay.prototype.setRoomconfig = function(value) {
      jspb.Message.setField(this, 16, value);
    };
    proto.BINRoomPlay.prototype.clearRoomconfig = function() {
      jspb.Message.setField(this, 16, void 0);
    };
    proto.BINRoomPlay.prototype.hasRoomconfig = function() {
      return null != jspb.Message.getField(this, 16);
    };
    proto.BINFilterRoomResponse = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, proto.BINFilterRoomResponse.repeatedFields_, null);
    };
    goog.inherits(proto.BINFilterRoomResponse, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINFilterRoomResponse.displayName = "proto.BINFilterRoomResponse");
    proto.BINFilterRoomResponse.repeatedFields_ = [ 3 ];
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINFilterRoomResponse.prototype.toObject = function(opt_includeInstance) {
        return proto.BINFilterRoomResponse.toObject(opt_includeInstance, this);
      };
      proto.BINFilterRoomResponse.toObject = function(includeInstance, msg) {
        var f, obj = {
          responsecode: jspb.Message.getField(msg, 1),
          message: jspb.Message.getField(msg, 2),
          roomplaysList: jspb.Message.toObjectList(msg.getRoomplaysList(), proto.BINRoomPlay.toObject, includeInstance)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINFilterRoomResponse.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINFilterRoomResponse();
      return proto.BINFilterRoomResponse.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINFilterRoomResponse.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readBool();
          msg.setResponsecode(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setMessage(value);
          break;

         case 3:
          var value = new proto.BINRoomPlay();
          reader.readMessage(value, proto.BINRoomPlay.deserializeBinaryFromReader);
          msg.addRoomplays(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINFilterRoomResponse.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINFilterRoomResponse.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINFilterRoomResponse.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeBool(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = this.getRoomplaysList();
      f.length > 0 && writer.writeRepeatedMessage(3, f, proto.BINRoomPlay.serializeBinaryToWriter);
    };
    proto.BINFilterRoomResponse.prototype.getResponsecode = function() {
      return jspb.Message.getFieldWithDefault(this, 1, false);
    };
    proto.BINFilterRoomResponse.prototype.setResponsecode = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINFilterRoomResponse.prototype.clearResponsecode = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINFilterRoomResponse.prototype.hasResponsecode = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINFilterRoomResponse.prototype.getMessage = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINFilterRoomResponse.prototype.setMessage = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINFilterRoomResponse.prototype.clearMessage = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINFilterRoomResponse.prototype.hasMessage = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINFilterRoomResponse.prototype.getRoomplaysList = function() {
      return jspb.Message.getRepeatedWrapperField(this, proto.BINRoomPlay, 3);
    };
    proto.BINFilterRoomResponse.prototype.setRoomplaysList = function(value) {
      jspb.Message.setRepeatedWrapperField(this, 3, value);
    };
    proto.BINFilterRoomResponse.prototype.addRoomplays = function(opt_value, opt_index) {
      return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.BINRoomPlay, opt_index);
    };
    proto.BINFilterRoomResponse.prototype.clearRoomplaysList = function() {
      this.setRoomplaysList([]);
    };
    proto.BINRoomStatusRequest = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, proto.BINRoomStatusRequest.repeatedFields_, null);
    };
    goog.inherits(proto.BINRoomStatusRequest, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINRoomStatusRequest.displayName = "proto.BINRoomStatusRequest");
    proto.BINRoomStatusRequest.repeatedFields_ = [ 2 ];
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINRoomStatusRequest.prototype.toObject = function(opt_includeInstance) {
        return proto.BINRoomStatusRequest.toObject(opt_includeInstance, this);
      };
      proto.BINRoomStatusRequest.toObject = function(includeInstance, msg) {
        var f, obj = {
          zoneid: jspb.Message.getField(msg, 1),
          indexsList: jspb.Message.getField(msg, 2)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINRoomStatusRequest.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINRoomStatusRequest();
      return proto.BINRoomStatusRequest.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINRoomStatusRequest.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt32();
          msg.setZoneid(value);
          break;

         case 2:
          var value = reader.readInt32();
          msg.addIndexs(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINRoomStatusRequest.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINRoomStatusRequest.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINRoomStatusRequest.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt32(1, f);
      f = this.getIndexsList();
      f.length > 0 && writer.writeRepeatedInt32(2, f);
    };
    proto.BINRoomStatusRequest.prototype.getZoneid = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINRoomStatusRequest.prototype.setZoneid = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINRoomStatusRequest.prototype.clearZoneid = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINRoomStatusRequest.prototype.hasZoneid = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINRoomStatusRequest.prototype.getIndexsList = function() {
      return jspb.Message.getField(this, 2);
    };
    proto.BINRoomStatusRequest.prototype.setIndexsList = function(value) {
      jspb.Message.setField(this, 2, value || []);
    };
    proto.BINRoomStatusRequest.prototype.addIndexs = function(value, opt_index) {
      jspb.Message.addToRepeatedField(this, 2, value, opt_index);
    };
    proto.BINRoomStatusRequest.prototype.clearIndexsList = function() {
      this.setIndexsList([]);
    };
    proto.BINRoomStatus = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINRoomStatus, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINRoomStatus.displayName = "proto.BINRoomStatus");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINRoomStatus.prototype.toObject = function(opt_includeInstance) {
        return proto.BINRoomStatus.toObject(opt_includeInstance, this);
      };
      proto.BINRoomStatus.toObject = function(includeInstance, msg) {
        var f, obj = {
          roomindex: jspb.Message.getField(msg, 1),
          minbet: jspb.Message.getField(msg, 2),
          minentermoney: jspb.Message.getField(msg, 3),
          playersize: jspb.Message.getField(msg, 4),
          playingplayer: jspb.Message.getField(msg, 5),
          passwordrequired: jspb.Message.getField(msg, 6)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINRoomStatus.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINRoomStatus();
      return proto.BINRoomStatus.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINRoomStatus.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt32();
          msg.setRoomindex(value);
          break;

         case 2:
          var value = reader.readInt32();
          msg.setMinbet(value);
          break;

         case 3:
          var value = reader.readInt64();
          msg.setMinentermoney(value);
          break;

         case 4:
          var value = reader.readInt32();
          msg.setPlayersize(value);
          break;

         case 5:
          var value = reader.readInt32();
          msg.setPlayingplayer(value);
          break;

         case 6:
          var value = reader.readBool();
          msg.setPasswordrequired(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINRoomStatus.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINRoomStatus.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINRoomStatus.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt32(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeInt32(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeInt64(3, f);
      f = jspb.Message.getField(this, 4);
      null != f && writer.writeInt32(4, f);
      f = jspb.Message.getField(this, 5);
      null != f && writer.writeInt32(5, f);
      f = jspb.Message.getField(this, 6);
      null != f && writer.writeBool(6, f);
    };
    proto.BINRoomStatus.prototype.getRoomindex = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINRoomStatus.prototype.setRoomindex = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINRoomStatus.prototype.clearRoomindex = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINRoomStatus.prototype.hasRoomindex = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINRoomStatus.prototype.getMinbet = function() {
      return jspb.Message.getFieldWithDefault(this, 2, 0);
    };
    proto.BINRoomStatus.prototype.setMinbet = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINRoomStatus.prototype.clearMinbet = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINRoomStatus.prototype.hasMinbet = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINRoomStatus.prototype.getMinentermoney = function() {
      return jspb.Message.getFieldWithDefault(this, 3, 0);
    };
    proto.BINRoomStatus.prototype.setMinentermoney = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINRoomStatus.prototype.clearMinentermoney = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINRoomStatus.prototype.hasMinentermoney = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINRoomStatus.prototype.getPlayersize = function() {
      return jspb.Message.getFieldWithDefault(this, 4, 0);
    };
    proto.BINRoomStatus.prototype.setPlayersize = function(value) {
      jspb.Message.setField(this, 4, value);
    };
    proto.BINRoomStatus.prototype.clearPlayersize = function() {
      jspb.Message.setField(this, 4, void 0);
    };
    proto.BINRoomStatus.prototype.hasPlayersize = function() {
      return null != jspb.Message.getField(this, 4);
    };
    proto.BINRoomStatus.prototype.getPlayingplayer = function() {
      return jspb.Message.getFieldWithDefault(this, 5, 0);
    };
    proto.BINRoomStatus.prototype.setPlayingplayer = function(value) {
      jspb.Message.setField(this, 5, value);
    };
    proto.BINRoomStatus.prototype.clearPlayingplayer = function() {
      jspb.Message.setField(this, 5, void 0);
    };
    proto.BINRoomStatus.prototype.hasPlayingplayer = function() {
      return null != jspb.Message.getField(this, 5);
    };
    proto.BINRoomStatus.prototype.getPasswordrequired = function() {
      return jspb.Message.getFieldWithDefault(this, 6, false);
    };
    proto.BINRoomStatus.prototype.setPasswordrequired = function(value) {
      jspb.Message.setField(this, 6, value);
    };
    proto.BINRoomStatus.prototype.clearPasswordrequired = function() {
      jspb.Message.setField(this, 6, void 0);
    };
    proto.BINRoomStatus.prototype.hasPasswordrequired = function() {
      return null != jspb.Message.getField(this, 6);
    };
    proto.BINRoomStatusResponse = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, proto.BINRoomStatusResponse.repeatedFields_, null);
    };
    goog.inherits(proto.BINRoomStatusResponse, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINRoomStatusResponse.displayName = "proto.BINRoomStatusResponse");
    proto.BINRoomStatusResponse.repeatedFields_ = [ 3 ];
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINRoomStatusResponse.prototype.toObject = function(opt_includeInstance) {
        return proto.BINRoomStatusResponse.toObject(opt_includeInstance, this);
      };
      proto.BINRoomStatusResponse.toObject = function(includeInstance, msg) {
        var f, obj = {
          responsecode: jspb.Message.getField(msg, 1),
          message: jspb.Message.getField(msg, 2),
          roomstatusesList: jspb.Message.toObjectList(msg.getRoomstatusesList(), proto.BINRoomStatus.toObject, includeInstance)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINRoomStatusResponse.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINRoomStatusResponse();
      return proto.BINRoomStatusResponse.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINRoomStatusResponse.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readBool();
          msg.setResponsecode(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setMessage(value);
          break;

         case 3:
          var value = new proto.BINRoomStatus();
          reader.readMessage(value, proto.BINRoomStatus.deserializeBinaryFromReader);
          msg.addRoomstatuses(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINRoomStatusResponse.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINRoomStatusResponse.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINRoomStatusResponse.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeBool(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = this.getRoomstatusesList();
      f.length > 0 && writer.writeRepeatedMessage(3, f, proto.BINRoomStatus.serializeBinaryToWriter);
    };
    proto.BINRoomStatusResponse.prototype.getResponsecode = function() {
      return jspb.Message.getFieldWithDefault(this, 1, false);
    };
    proto.BINRoomStatusResponse.prototype.setResponsecode = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINRoomStatusResponse.prototype.clearResponsecode = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINRoomStatusResponse.prototype.hasResponsecode = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINRoomStatusResponse.prototype.getMessage = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINRoomStatusResponse.prototype.setMessage = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINRoomStatusResponse.prototype.clearMessage = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINRoomStatusResponse.prototype.hasMessage = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINRoomStatusResponse.prototype.getRoomstatusesList = function() {
      return jspb.Message.getRepeatedWrapperField(this, proto.BINRoomStatus, 3);
    };
    proto.BINRoomStatusResponse.prototype.setRoomstatusesList = function(value) {
      jspb.Message.setRepeatedWrapperField(this, 3, value);
    };
    proto.BINRoomStatusResponse.prototype.addRoomstatuses = function(opt_value, opt_index) {
      return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.BINRoomStatus, opt_index);
    };
    proto.BINRoomStatusResponse.prototype.clearRoomstatusesList = function() {
      this.setRoomstatusesList([]);
    };
    goog.object.extend(exports, proto);
    cc._RF.pop();
  }, {
    "google-protobuf": "google-protobuf"
  } ],
  "google-protobuf": [ function(require, module, exports) {
    (function(global) {
      "use strict";
      cc._RF.push(module, "c32a7ph7LpK2a6Rc6MvqsSn", "google-protobuf");
      "use strict";
      var _typeof = "function" === typeof Symbol && "symbol" === typeof Symbol.iterator ? function(obj) {
        return typeof obj;
      } : function(obj) {
        return obj && "function" === typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
      var $jscomp = {
        scope: {},
        getGlobal: function getGlobal(a) {
          return "undefined" != typeof window && window === a ? a : "undefined" != typeof global ? global : a;
        }
      };
      $jscomp.global = $jscomp.getGlobal("undefined" == typeof window ? module.exports : window);
      $jscomp.initSymbol = function() {
        $jscomp.global.Symbol || ($jscomp.global.Symbol = $jscomp.Symbol);
        $jscomp.initSymbol = function() {};
      };
      $jscomp.symbolCounter_ = 0;
      $jscomp.Symbol = function(a) {
        return "jscomp_symbol_" + a + $jscomp.symbolCounter_++;
      };
      $jscomp.initSymbolIterator = function() {
        $jscomp.initSymbol();
        $jscomp.global.Symbol.iterator || ($jscomp.global.Symbol.iterator = $jscomp.global.Symbol("iterator"));
        $jscomp.initSymbolIterator = function() {};
      };
      $jscomp.makeIterator = function(a) {
        $jscomp.initSymbolIterator();
        $jscomp.initSymbol();
        $jscomp.initSymbolIterator();
        var b = a[Symbol.iterator];
        if (b) return b.call(a);
        var c = 0;
        return {
          next: function next() {
            return c < a.length ? {
              done: !1,
              value: a[c++]
            } : {
              done: !0
            };
          }
        };
      };
      $jscomp.arrayFromIterator = function(a) {
        for (var b, c = []; !(b = a.next()).done; ) c.push(b.value);
        return c;
      };
      $jscomp.arrayFromIterable = function(a) {
        return a instanceof Array ? a : $jscomp.arrayFromIterator($jscomp.makeIterator(a));
      };
      $jscomp.inherits = function(a, b) {
        function c() {}
        c.prototype = b.prototype;
        a.prototype = new c();
        a.prototype.constructor = a;
        for (var d in b) if (Object.defineProperties) {
          var e = Object.getOwnPropertyDescriptor(b, d);
          e && Object.defineProperty(a, d, e);
        } else a[d] = b[d];
      };
      $jscomp.array = $jscomp.array || {};
      $jscomp.iteratorFromArray = function(a, b) {
        $jscomp.initSymbolIterator();
        a instanceof String && (a += "");
        var c = 0, d = {
          next: function next() {
            if (c < a.length) {
              var e = c++;
              return {
                value: b(e, a[e]),
                done: !1
              };
            }
            d.next = function() {
              return {
                done: !0,
                value: void 0
              };
            };
            return d.next();
          }
        };
        $jscomp.initSymbol();
        $jscomp.initSymbolIterator();
        d[Symbol.iterator] = function() {
          return d;
        };
        return d;
      };
      $jscomp.findInternal = function(a, b, c) {
        a instanceof String && (a = String(a));
        for (var d = a.length, e = 0; e < d; e++) {
          var f = a[e];
          if (b.call(c, f, e, a)) return {
            i: e,
            v: f
          };
        }
        return {
          i: -1,
          v: void 0
        };
      };
      $jscomp.array.from = function(a, b, c) {
        $jscomp.initSymbolIterator();
        b = null != b ? b : function(a) {
          return a;
        };
        var d = [];
        $jscomp.initSymbol();
        $jscomp.initSymbolIterator();
        var e = a[Symbol.iterator];
        "function" == typeof e && (a = e.call(a));
        if ("function" == typeof a.next) for (;!(e = a.next()).done; ) d.push(b.call(c, e.value)); else for (var e = a.length, f = 0; f < e; f++) d.push(b.call(c, a[f]));
        return d;
      };
      $jscomp.array.of = function(a) {
        return $jscomp.array.from(arguments);
      };
      $jscomp.array.entries = function() {
        return $jscomp.iteratorFromArray(this, function(a, b) {
          return [ a, b ];
        });
      };
      $jscomp.array.installHelper_ = function(a, b) {
        !Array.prototype[a] && Object.defineProperties && Object.defineProperty && Object.defineProperty(Array.prototype, a, {
          configurable: !0,
          enumerable: !1,
          writable: !0,
          value: b
        });
      };
      $jscomp.array.entries$install = function() {
        $jscomp.array.installHelper_("entries", $jscomp.array.entries);
      };
      $jscomp.array.keys = function() {
        return $jscomp.iteratorFromArray(this, function(a) {
          return a;
        });
      };
      $jscomp.array.keys$install = function() {
        $jscomp.array.installHelper_("keys", $jscomp.array.keys);
      };
      $jscomp.array.values = function() {
        return $jscomp.iteratorFromArray(this, function(a, b) {
          return b;
        });
      };
      $jscomp.array.values$install = function() {
        $jscomp.array.installHelper_("values", $jscomp.array.values);
      };
      $jscomp.array.copyWithin = function(a, b, c) {
        var d = this.length;
        a = Number(a);
        b = Number(b);
        c = Number(null != c ? c : d);
        if (a < b) for (c = Math.min(c, d); b < c; ) b in this ? this[a++] = this[b++] : (delete this[a++], 
        b++); else for (c = Math.min(c, d + b - a), a += c - b; c > b; ) --c in this ? this[--a] = this[c] : delete this[a];
        return this;
      };
      $jscomp.array.copyWithin$install = function() {
        $jscomp.array.installHelper_("copyWithin", $jscomp.array.copyWithin);
      };
      $jscomp.array.fill = function(a, b, c) {
        var d = this.length || 0;
        0 > b && (b = Math.max(0, d + b));
        (null == c || c > d) && (c = d);
        c = Number(c);
        0 > c && (c = Math.max(0, d + c));
        for (b = Number(b || 0); b < c; b++) this[b] = a;
        return this;
      };
      $jscomp.array.fill$install = function() {
        $jscomp.array.installHelper_("fill", $jscomp.array.fill);
      };
      $jscomp.array.find = function(a, b) {
        return $jscomp.findInternal(this, a, b).v;
      };
      $jscomp.array.find$install = function() {
        $jscomp.array.installHelper_("find", $jscomp.array.find);
      };
      $jscomp.array.findIndex = function(a, b) {
        return $jscomp.findInternal(this, a, b).i;
      };
      $jscomp.array.findIndex$install = function() {
        $jscomp.array.installHelper_("findIndex", $jscomp.array.findIndex);
      };
      $jscomp.ASSUME_NO_NATIVE_MAP = !1;
      $jscomp.Map$isConformant = function() {
        if ($jscomp.ASSUME_NO_NATIVE_MAP) return !1;
        var a = $jscomp.global.Map;
        if (!a || !a.prototype.entries || "function" != typeof Object.seal) return !1;
        try {
          var b = Object.seal({
            x: 4
          }), c = new a($jscomp.makeIterator([ [ b, "s" ] ]));
          if ("s" != c.get(b) || 1 != c.size || c.get({
            x: 4
          }) || c.set({
            x: 4
          }, "t") != c || 2 != c.size) return !1;
          var d = c.entries(), e = d.next();
          if (e.done || e.value[0] != b || "s" != e.value[1]) return !1;
          e = d.next();
          return !(e.done || 4 != e.value[0].x || "t" != e.value[1] || !d.next().done);
        } catch (f) {
          return !1;
        }
      };
      $jscomp.Map = function(a) {
        this.data_ = {};
        this.head_ = $jscomp.Map.createHead();
        this.size = 0;
        if (a) {
          a = $jscomp.makeIterator(a);
          for (var b; !(b = a.next()).done; ) b = b.value, this.set(b[0], b[1]);
        }
      };
      $jscomp.Map.prototype.set = function(a, b) {
        var c = $jscomp.Map.maybeGetEntry(this, a);
        c.list || (c.list = this.data_[c.id] = []);
        c.entry ? c.entry.value = b : (c.entry = {
          next: this.head_,
          previous: this.head_.previous,
          head: this.head_,
          key: a,
          value: b
        }, c.list.push(c.entry), this.head_.previous.next = c.entry, this.head_.previous = c.entry, 
        this.size++);
        return this;
      };
      $jscomp.Map.prototype["delete"] = function(a) {
        a = $jscomp.Map.maybeGetEntry(this, a);
        return !(!a.entry || !a.list) && (a.list.splice(a.index, 1), a.list.length || delete this.data_[a.id], 
        a.entry.previous.next = a.entry.next, a.entry.next.previous = a.entry.previous, 
        a.entry.head = null, this.size--, !0);
      };
      $jscomp.Map.prototype.clear = function() {
        this.data_ = {};
        this.head_ = this.head_.previous = $jscomp.Map.createHead();
        this.size = 0;
      };
      $jscomp.Map.prototype.has = function(a) {
        return !!$jscomp.Map.maybeGetEntry(this, a).entry;
      };
      $jscomp.Map.prototype.get = function(a) {
        return (a = $jscomp.Map.maybeGetEntry(this, a).entry) && a.value;
      };
      $jscomp.Map.prototype.entries = function() {
        return $jscomp.Map.makeIterator_(this, function(a) {
          return [ a.key, a.value ];
        });
      };
      $jscomp.Map.prototype.keys = function() {
        return $jscomp.Map.makeIterator_(this, function(a) {
          return a.key;
        });
      };
      $jscomp.Map.prototype.values = function() {
        return $jscomp.Map.makeIterator_(this, function(a) {
          return a.value;
        });
      };
      $jscomp.Map.prototype.forEach = function(a, b) {
        for (var c = this.entries(), d; !(d = c.next()).done; ) d = d.value, a.call(b, d[1], d[0], this);
      };
      $jscomp.Map.maybeGetEntry = function(a, b) {
        var c = $jscomp.Map.getId(b), d = a.data_[c];
        if (d && Object.prototype.hasOwnProperty.call(a.data_, c)) for (var e = 0; e < d.length; e++) {
          var f = d[e];
          if (b !== b && f.key !== f.key || b === f.key) return {
            id: c,
            list: d,
            index: e,
            entry: f
          };
        }
        return {
          id: c,
          list: d,
          index: -1,
          entry: void 0
        };
      };
      $jscomp.Map.makeIterator_ = function(a, b) {
        var c = a.head_, d = {
          next: function next() {
            if (c) {
              for (;c.head != a.head_; ) c = c.previous;
              for (;c.next != c.head; ) return c = c.next, {
                done: !1,
                value: b(c)
              };
              c = null;
            }
            return {
              done: !0,
              value: void 0
            };
          }
        };
        $jscomp.initSymbol();
        $jscomp.initSymbolIterator();
        d[Symbol.iterator] = function() {
          return d;
        };
        return d;
      };
      $jscomp.Map.mapIndex_ = 0;
      $jscomp.Map.createHead = function() {
        var a = {};
        return a.previous = a.next = a.head = a;
      };
      $jscomp.Map.getId = function(a) {
        if (!(a instanceof Object)) return "p_" + a;
        if (!($jscomp.Map.idKey in a)) try {
          $jscomp.Map.defineProperty(a, $jscomp.Map.idKey, {
            value: ++$jscomp.Map.mapIndex_
          });
        } catch (b) {}
        return $jscomp.Map.idKey in a ? a[$jscomp.Map.idKey] : "o_ " + a;
      };
      $jscomp.Map.defineProperty = Object.defineProperty ? function(a, b, c) {
        Object.defineProperty(a, b, {
          value: String(c)
        });
      } : function(a, b, c) {
        a[b] = String(c);
      };
      $jscomp.Map.Entry = function() {};
      $jscomp.Map$install = function() {
        $jscomp.initSymbol();
        $jscomp.initSymbolIterator();
        $jscomp.Map$isConformant() ? $jscomp.Map = $jscomp.global.Map : ($jscomp.initSymbol(), 
        $jscomp.initSymbolIterator(), $jscomp.Map.prototype[Symbol.iterator] = $jscomp.Map.prototype.entries, 
        $jscomp.initSymbol(), $jscomp.Map.idKey = Symbol("map-id-key"), $jscomp.Map$install = function() {});
      };
      $jscomp.math = $jscomp.math || {};
      $jscomp.math.clz32 = function(a) {
        a = Number(a) >>> 0;
        if (0 === a) return 32;
        var b = 0;
        0 === (4294901760 & a) && (a <<= 16, b += 16);
        0 === (4278190080 & a) && (a <<= 8, b += 8);
        0 === (4026531840 & a) && (a <<= 4, b += 4);
        0 === (3221225472 & a) && (a <<= 2, b += 2);
        0 === (2147483648 & a) && b++;
        return b;
      };
      $jscomp.math.imul = function(a, b) {
        a = Number(a);
        b = Number(b);
        var c = 65535 & a, d = 65535 & b;
        return c * d + ((a >>> 16 & 65535) * d + c * (b >>> 16 & 65535) << 16 >>> 0) | 0;
      };
      $jscomp.math.sign = function(a) {
        a = Number(a);
        return 0 === a || isNaN(a) ? a : 0 < a ? 1 : -1;
      };
      $jscomp.math.log10 = function(a) {
        return Math.log(a) / Math.LN10;
      };
      $jscomp.math.log2 = function(a) {
        return Math.log(a) / Math.LN2;
      };
      $jscomp.math.log1p = function(a) {
        a = Number(a);
        if (.25 > a && -.25 < a) {
          for (var b = a, c = 1, d = a, e = 0, f = 1; e != d; ) b *= a, f *= -1, d = (e = d) + f * b / ++c;
          return d;
        }
        return Math.log(1 + a);
      };
      $jscomp.math.expm1 = function(a) {
        a = Number(a);
        if (.25 > a && -.25 < a) {
          for (var b = a, c = 1, d = a, e = 0; e != d; ) b *= a / ++c, d = (e = d) + b;
          return d;
        }
        return Math.exp(a) - 1;
      };
      $jscomp.math.cosh = function(a) {
        a = Number(a);
        return (Math.exp(a) + Math.exp(-a)) / 2;
      };
      $jscomp.math.sinh = function(a) {
        a = Number(a);
        return 0 === a ? a : (Math.exp(a) - Math.exp(-a)) / 2;
      };
      $jscomp.math.tanh = function(a) {
        a = Number(a);
        if (0 === a) return a;
        var b = Math.exp(-2 * Math.abs(a)), b = (1 - b) / (1 + b);
        return 0 > a ? -b : b;
      };
      $jscomp.math.acosh = function(a) {
        a = Number(a);
        return Math.log(a + Math.sqrt(a * a - 1));
      };
      $jscomp.math.asinh = function(a) {
        a = Number(a);
        if (0 === a) return a;
        var b = Math.log(Math.abs(a) + Math.sqrt(a * a + 1));
        return 0 > a ? -b : b;
      };
      $jscomp.math.atanh = function(a) {
        a = Number(a);
        return ($jscomp.math.log1p(a) - $jscomp.math.log1p(-a)) / 2;
      };
      $jscomp.math.hypot = function(a, b, c) {
        a = Number(a);
        b = Number(b);
        var d, e, f, g = Math.max(Math.abs(a), Math.abs(b));
        for (d = 2; d < arguments.length; d++) g = Math.max(g, Math.abs(arguments[d]));
        if (1e100 < g || 1e-100 > g) {
          a /= g;
          b /= g;
          f = a * a + b * b;
          for (d = 2; d < arguments.length; d++) e = Number(arguments[d]) / g, f += e * e;
          return Math.sqrt(f) * g;
        }
        f = a * a + b * b;
        for (d = 2; d < arguments.length; d++) e = Number(arguments[d]), f += e * e;
        return Math.sqrt(f);
      };
      $jscomp.math.trunc = function(a) {
        a = Number(a);
        if (isNaN(a) || Infinity === a || -Infinity === a || 0 === a) return a;
        var b = Math.floor(Math.abs(a));
        return 0 > a ? -b : b;
      };
      $jscomp.math.cbrt = function(a) {
        if (0 === a) return a;
        a = Number(a);
        var b = Math.pow(Math.abs(a), 1 / 3);
        return 0 > a ? -b : b;
      };
      $jscomp.number = $jscomp.number || {};
      $jscomp.number.isFinite = function(a) {
        return "number" === typeof a && (!isNaN(a) && Infinity !== a && -Infinity !== a);
      };
      $jscomp.number.isInteger = function(a) {
        return !!$jscomp.number.isFinite(a) && a === Math.floor(a);
      };
      $jscomp.number.isNaN = function(a) {
        return "number" === typeof a && isNaN(a);
      };
      $jscomp.number.isSafeInteger = function(a) {
        return $jscomp.number.isInteger(a) && Math.abs(a) <= $jscomp.number.MAX_SAFE_INTEGER;
      };
      $jscomp.number.EPSILON = function() {
        return Math.pow(2, -52);
      }();
      $jscomp.number.MAX_SAFE_INTEGER = function() {
        return 9007199254740991;
      }();
      $jscomp.number.MIN_SAFE_INTEGER = function() {
        return -9007199254740991;
      }();
      $jscomp.object = $jscomp.object || {};
      $jscomp.object.assign = function(a, b) {
        for (var c = 1; c < arguments.length; c++) {
          var d = arguments[c];
          if (d) for (var e in d) Object.prototype.hasOwnProperty.call(d, e) && (a[e] = d[e]);
        }
        return a;
      };
      $jscomp.object.is = function(a, b) {
        return a === b ? 0 !== a || 1 / a === 1 / b : a !== a && b !== b;
      };
      $jscomp.ASSUME_NO_NATIVE_SET = !1;
      $jscomp.Set$isConformant = function() {
        if ($jscomp.ASSUME_NO_NATIVE_SET) return !1;
        var a = $jscomp.global.Set;
        if (!a || !a.prototype.entries || "function" != typeof Object.seal) return !1;
        try {
          var b = Object.seal({
            x: 4
          }), c = new a($jscomp.makeIterator([ b ]));
          if (!c.has(b) || 1 != c.size || c.add(b) != c || 1 != c.size || c.add({
            x: 4
          }) != c || 2 != c.size) return !1;
          var d = c.entries(), e = d.next();
          if (e.done || e.value[0] != b || e.value[1] != b) return !1;
          e = d.next();
          return !e.done && e.value[0] != b && 4 == e.value[0].x && e.value[1] == e.value[0] && d.next().done;
        } catch (f) {
          return !1;
        }
      };
      $jscomp.Set = function(a) {
        this.map_ = new $jscomp.Map();
        if (a) {
          a = $jscomp.makeIterator(a);
          for (var b; !(b = a.next()).done; ) this.add(b.value);
        }
        this.size = this.map_.size;
      };
      $jscomp.Set.prototype.add = function(a) {
        this.map_.set(a, a);
        this.size = this.map_.size;
        return this;
      };
      $jscomp.Set.prototype["delete"] = function(a) {
        a = this.map_["delete"](a);
        this.size = this.map_.size;
        return a;
      };
      $jscomp.Set.prototype.clear = function() {
        this.map_.clear();
        this.size = 0;
      };
      $jscomp.Set.prototype.has = function(a) {
        return this.map_.has(a);
      };
      $jscomp.Set.prototype.entries = function() {
        return this.map_.entries();
      };
      $jscomp.Set.prototype.values = function() {
        return this.map_.values();
      };
      $jscomp.Set.prototype.forEach = function(a, b) {
        var c = this;
        this.map_.forEach(function(d) {
          return a.call(b, d, d, c);
        });
      };
      $jscomp.Set$install = function() {
        $jscomp.Map$install();
        $jscomp.Set$isConformant() ? $jscomp.Set = $jscomp.global.Set : ($jscomp.initSymbol(), 
        $jscomp.initSymbolIterator(), $jscomp.Set.prototype[Symbol.iterator] = $jscomp.Set.prototype.values, 
        $jscomp.Set$install = function() {});
      };
      $jscomp.string = $jscomp.string || {};
      $jscomp.checkStringArgs = function(a, b, c) {
        if (null == a) throw new TypeError("The 'this' value for String.prototype." + c + " must not be null or undefined");
        if (b instanceof RegExp) throw new TypeError("First argument to String.prototype." + c + " must not be a regular expression");
        return a + "";
      };
      $jscomp.string.fromCodePoint = function(a) {
        for (var b = "", c = 0; c < arguments.length; c++) {
          var d = Number(arguments[c]);
          if (0 > d || 1114111 < d || d !== Math.floor(d)) throw new RangeError("invalid_code_point " + d);
          65535 >= d ? b += String.fromCharCode(d) : (d -= 65536, b += String.fromCharCode(d >>> 10 & 1023 | 55296), 
          b += String.fromCharCode(1023 & d | 56320));
        }
        return b;
      };
      $jscomp.string.repeat = function(a) {
        var b = $jscomp.checkStringArgs(this, null, "repeat");
        if (0 > a || 1342177279 < a) throw new RangeError("Invalid count value");
        a |= 0;
        for (var c = ""; a; ) (1 & a && (c += b), a >>>= 1) && (b += b);
        return c;
      };
      $jscomp.string.repeat$install = function() {
        String.prototype.repeat || (String.prototype.repeat = $jscomp.string.repeat);
      };
      $jscomp.string.codePointAt = function(a) {
        var b = $jscomp.checkStringArgs(this, null, "codePointAt"), c = b.length;
        a = Number(a) || 0;
        if (0 <= a && a < c) {
          a |= 0;
          var d = b.charCodeAt(a);
          if (55296 > d || 56319 < d || a + 1 === c) return d;
          a = b.charCodeAt(a + 1);
          return 56320 > a || 57343 < a ? d : 1024 * (d - 55296) + a + 9216;
        }
      };
      $jscomp.string.codePointAt$install = function() {
        String.prototype.codePointAt || (String.prototype.codePointAt = $jscomp.string.codePointAt);
      };
      $jscomp.string.includes = function(a, b) {
        return -1 !== $jscomp.checkStringArgs(this, a, "includes").indexOf(a, b || 0);
      };
      $jscomp.string.includes$install = function() {
        String.prototype.includes || (String.prototype.includes = $jscomp.string.includes);
      };
      $jscomp.string.startsWith = function(a, b) {
        var c = $jscomp.checkStringArgs(this, a, "startsWith");
        a += "";
        for (var d = c.length, e = a.length, f = Math.max(0, Math.min(0 | b, c.length)), g = 0; g < e && f < d; ) if (c[f++] != a[g++]) return !1;
        return g >= e;
      };
      $jscomp.string.startsWith$install = function() {
        String.prototype.startsWith || (String.prototype.startsWith = $jscomp.string.startsWith);
      };
      $jscomp.string.endsWith = function(a, b) {
        var c = $jscomp.checkStringArgs(this, a, "endsWith");
        a += "";
        void 0 === b && (b = c.length);
        for (var d = Math.max(0, Math.min(0 | b, c.length)), e = a.length; 0 < e && 0 < d; ) if (c[--d] != a[--e]) return !1;
        return 0 >= e;
      };
      $jscomp.string.endsWith$install = function() {
        String.prototype.endsWith || (String.prototype.endsWith = $jscomp.string.endsWith);
      };
      var COMPILED = !0, goog = goog || {};
      goog.global = $jscomp.getGlobal("undefined" == typeof window ? module.exports : window);
      goog.isDef = function(a) {
        return void 0 !== a;
      };
      goog.exportPath_ = function(a, b, c) {
        a = a.split(".");
        c = c || goog.global;
        a[0] in c || !c.execScript || c.execScript("var " + a[0]);
        for (var d; a.length && (d = a.shift()); ) !a.length && goog.isDef(b) ? c[d] = b : c = c[d] ? c[d] : c[d] = {};
      };
      goog.define = function(a, b) {
        var c = b;
        COMPILED || (goog.global.CLOSURE_UNCOMPILED_DEFINES && Object.prototype.hasOwnProperty.call(goog.global.CLOSURE_UNCOMPILED_DEFINES, a) ? c = goog.global.CLOSURE_UNCOMPILED_DEFINES[a] : goog.global.CLOSURE_DEFINES && Object.prototype.hasOwnProperty.call(goog.global.CLOSURE_DEFINES, a) && (c = goog.global.CLOSURE_DEFINES[a]));
        goog.exportPath_(a, c);
      };
      goog.DEBUG = !0;
      goog.LOCALE = "en";
      goog.TRUSTED_SITE = !0;
      goog.STRICT_MODE_COMPATIBLE = !1;
      goog.DISALLOW_TEST_ONLY_CODE = COMPILED && !goog.DEBUG;
      goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING = !1;
      goog.provide = function(a) {
        if (!COMPILED && goog.isProvided_(a)) throw Error('Namespace "' + a + '" already declared.');
        goog.constructNamespace_(a);
      };
      goog.constructNamespace_ = function(a, b) {
        if (!COMPILED) {
          delete goog.implicitNamespaces_[a];
          for (var c = a; (c = c.substring(0, c.lastIndexOf("."))) && !goog.getObjectByName(c); ) goog.implicitNamespaces_[c] = !0;
        }
        goog.exportPath_(a, b);
      };
      goog.VALID_MODULE_RE_ = /^[a-zA-Z_$][a-zA-Z0-9._$]*$/;
      goog.module = function(a) {
        if (!goog.isString(a) || !a || -1 == a.search(goog.VALID_MODULE_RE_)) throw Error("Invalid module identifier");
        if (!goog.isInModuleLoader_()) throw Error("Module " + a + " has been loaded incorrectly.");
        if (goog.moduleLoaderState_.moduleName) throw Error("goog.module may only be called once per module.");
        goog.moduleLoaderState_.moduleName = a;
        if (!COMPILED) {
          if (goog.isProvided_(a)) throw Error('Namespace "' + a + '" already declared.');
          delete goog.implicitNamespaces_[a];
        }
      };
      goog.module.get = function(a) {
        return goog.module.getInternal_(a);
      };
      goog.module.getInternal_ = function(a) {
        if (!COMPILED) return goog.isProvided_(a) ? a in goog.loadedModules_ ? goog.loadedModules_[a] : goog.getObjectByName(a) : null;
      };
      goog.moduleLoaderState_ = null;
      goog.isInModuleLoader_ = function() {
        return null != goog.moduleLoaderState_;
      };
      goog.module.declareLegacyNamespace = function() {
        if (!COMPILED && !goog.isInModuleLoader_()) throw Error("goog.module.declareLegacyNamespace must be called from within a goog.module");
        if (!COMPILED && !goog.moduleLoaderState_.moduleName) throw Error("goog.module must be called prior to goog.module.declareLegacyNamespace.");
        goog.moduleLoaderState_.declareLegacyNamespace = !0;
      };
      goog.setTestOnly = function(a) {
        if (goog.DISALLOW_TEST_ONLY_CODE) throw a = a || "", Error("Importing test-only code into non-debug environment" + (a ? ": " + a : "."));
      };
      goog.forwardDeclare = function(a) {};
      COMPILED || (goog.isProvided_ = function(a) {
        return a in goog.loadedModules_ || !goog.implicitNamespaces_[a] && goog.isDefAndNotNull(goog.getObjectByName(a));
      }, goog.implicitNamespaces_ = {
        "goog.module": !0
      });
      goog.getObjectByName = function(a, b) {
        for (var c = a.split("."), d = b || goog.global, e; e = c.shift(); ) {
          if (!goog.isDefAndNotNull(d[e])) return null;
          d = d[e];
        }
        return d;
      };
      goog.globalize = function(a, b) {
        var c = b || goog.global, d;
        for (d in a) c[d] = a[d];
      };
      goog.addDependency = function(a, b, c, d) {
        if (goog.DEPENDENCIES_ENABLED) {
          var e;
          a = a.replace(/\\/g, "/");
          for (var f = goog.dependencies_, g = 0; e = b[g]; g++) f.nameToPath[e] = a, f.pathIsModule[a] = !!d;
          for (d = 0; b = c[d]; d++) a in f.requires || (f.requires[a] = {}), f.requires[a][b] = !0;
        }
      };
      goog.ENABLE_DEBUG_LOADER = !0;
      goog.logToConsole_ = function(a) {
        goog.global.console && goog.global.console.error(a);
      };
      goog.require = function(a) {
        if (!COMPILED) {
          goog.ENABLE_DEBUG_LOADER && goog.IS_OLD_IE_ && goog.maybeProcessDeferredDep_(a);
          if (goog.isProvided_(a)) return goog.isInModuleLoader_() ? goog.module.getInternal_(a) : null;
          if (goog.ENABLE_DEBUG_LOADER) {
            var b = goog.getPathFromDeps_(a);
            if (b) return goog.writeScripts_(b), null;
          }
          a = "goog.require could not find: " + a;
          goog.logToConsole_(a);
          throw Error(a);
        }
      };
      goog.basePath = "";
      goog.nullFunction = function() {};
      goog.abstractMethod = function() {
        throw Error("unimplemented abstract method");
      };
      goog.addSingletonGetter = function(a) {
        a.getInstance = function() {
          if (a.instance_) return a.instance_;
          goog.DEBUG && (goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = a);
          return a.instance_ = new a();
        };
      };
      goog.instantiatedSingletons_ = [];
      goog.LOAD_MODULE_USING_EVAL = !0;
      goog.SEAL_MODULE_EXPORTS = goog.DEBUG;
      goog.loadedModules_ = {};
      goog.DEPENDENCIES_ENABLED = !COMPILED && goog.ENABLE_DEBUG_LOADER;
      goog.DEPENDENCIES_ENABLED && (goog.dependencies_ = {
        pathIsModule: {},
        nameToPath: {},
        requires: {},
        visited: {},
        written: {},
        deferred: {}
      }, goog.inHtmlDocument_ = function() {
        var a = goog.global.document;
        return null != a && "write" in a;
      }, goog.findBasePath_ = function() {
        if (goog.isDef(goog.global.CLOSURE_BASE_PATH)) goog.basePath = goog.global.CLOSURE_BASE_PATH; else if (goog.inHtmlDocument_()) for (var a = goog.global.document.getElementsByTagName("SCRIPT"), b = a.length - 1; 0 <= b; --b) {
          var c = a[b].src, d = c.lastIndexOf("?"), d = -1 == d ? c.length : d;
          if ("base.js" == c.substr(d - 7, 7)) {
            goog.basePath = c.substr(0, d - 7);
            break;
          }
        }
      }, goog.importScript_ = function(a, b) {
        (goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_)(a, b) && (goog.dependencies_.written[a] = !0);
      }, goog.IS_OLD_IE_ = !(goog.global.atob || !goog.global.document || !goog.global.document.all), 
      goog.importModule_ = function(a) {
        goog.importScript_("", 'goog.retrieveAndExecModule_("' + a + '");') && (goog.dependencies_.written[a] = !0);
      }, goog.queuedModules_ = [], goog.wrapModule_ = function(a, b) {
        return goog.LOAD_MODULE_USING_EVAL && goog.isDef(goog.global.JSON) ? "goog.loadModule(" + goog.global.JSON.stringify(b + "\n//# sourceURL=" + a + "\n") + ");" : 'goog.loadModule(function(exports) {"use strict";' + b + "\n;return exports});\n//# sourceURL=" + a + "\n";
      }, goog.loadQueuedModules_ = function() {
        var a = goog.queuedModules_.length;
        if (0 < a) {
          var b = goog.queuedModules_;
          goog.queuedModules_ = [];
          for (var c = 0; c < a; c++) goog.maybeProcessDeferredPath_(b[c]);
        }
      }, goog.maybeProcessDeferredDep_ = function(a) {
        goog.isDeferredModule_(a) && goog.allDepsAreAvailable_(a) && (a = goog.getPathFromDeps_(a), 
        goog.maybeProcessDeferredPath_(goog.basePath + a));
      }, goog.isDeferredModule_ = function(a) {
        return !(!(a = goog.getPathFromDeps_(a)) || !goog.dependencies_.pathIsModule[a]) && goog.basePath + a in goog.dependencies_.deferred;
      }, goog.allDepsAreAvailable_ = function(a) {
        if ((a = goog.getPathFromDeps_(a)) && a in goog.dependencies_.requires) for (var b in goog.dependencies_.requires[a]) if (!goog.isProvided_(b) && !goog.isDeferredModule_(b)) return !1;
        return !0;
      }, goog.maybeProcessDeferredPath_ = function(a) {
        if (a in goog.dependencies_.deferred) {
          var b = goog.dependencies_.deferred[a];
          delete goog.dependencies_.deferred[a];
          goog.globalEval(b);
        }
      }, goog.loadModuleFromUrl = function(a) {
        goog.retrieveAndExecModule_(a);
      }, goog.loadModule = function(a) {
        var b = goog.moduleLoaderState_;
        try {
          goog.moduleLoaderState_ = {
            moduleName: void 0,
            declareLegacyNamespace: !1
          };
          var c;
          if (goog.isFunction(a)) c = a.call(goog.global, {}); else {
            if (!goog.isString(a)) throw Error("Invalid module definition");
            c = goog.loadModuleFromSource_.call(goog.global, a);
          }
          var d = goog.moduleLoaderState_.moduleName;
          if (!goog.isString(d) || !d) throw Error('Invalid module name "' + d + '"');
          goog.moduleLoaderState_.declareLegacyNamespace ? goog.constructNamespace_(d, c) : goog.SEAL_MODULE_EXPORTS && Object.seal && Object.seal(c);
          goog.loadedModules_[d] = c;
        } finally {
          goog.moduleLoaderState_ = b;
        }
      }, goog.loadModuleFromSource_ = function(a) {
        eval(a);
        return {};
      }, goog.writeScriptSrcNode_ = function(a) {
        goog.global.document.write('<script type="text/javascript" src="' + a + '"><\/script>');
      }, goog.appendScriptSrcNode_ = function(a) {
        var b = goog.global.document, c = b.createElement("script");
        c.type = "text/javascript";
        c.src = a;
        c.defer = !1;
        c.async = !1;
        b.head.appendChild(c);
      }, goog.writeScriptTag_ = function(a, b) {
        if (goog.inHtmlDocument_()) {
          var c = goog.global.document;
          if (!goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING && "complete" == c.readyState) {
            if (/\bdeps.js$/.test(a)) return !1;
            throw Error('Cannot write "' + a + '" after document load');
          }
          var d = goog.IS_OLD_IE_;
          void 0 === b ? d ? (d = " onreadystatechange='goog.onScriptLoad_(this, " + ++goog.lastNonModuleScriptIndex_ + ")' ", 
          c.write('<script type="text/javascript" src="' + a + '"' + d + "><\/script>")) : goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING ? goog.appendScriptSrcNode_(a) : goog.writeScriptSrcNode_(a) : c.write('<script type="text/javascript">' + b + "<\/script>");
          return !0;
        }
        return !1;
      }, goog.lastNonModuleScriptIndex_ = 0, goog.onScriptLoad_ = function(a, b) {
        "complete" == a.readyState && goog.lastNonModuleScriptIndex_ == b && goog.loadQueuedModules_();
        return !0;
      }, goog.writeScripts_ = function(a) {
        function b(a) {
          if (!(a in e.written || a in e.visited)) {
            e.visited[a] = !0;
            if (a in e.requires) for (var f in e.requires[a]) if (!goog.isProvided_(f)) {
              if (!(f in e.nameToPath)) throw Error("Undefined nameToPath for " + f);
              b(e.nameToPath[f]);
            }
            a in d || (d[a] = !0, c.push(a));
          }
        }
        var c = [], d = {}, e = goog.dependencies_;
        b(a);
        for (a = 0; a < c.length; a++) {
          var f = c[a];
          goog.dependencies_.written[f] = !0;
        }
        var g = goog.moduleLoaderState_;
        goog.moduleLoaderState_ = null;
        for (a = 0; a < c.length; a++) {
          if (!(f = c[a])) throw goog.moduleLoaderState_ = g, Error("Undefined script input");
          e.pathIsModule[f] ? goog.importModule_(goog.basePath + f) : goog.importScript_(goog.basePath + f);
        }
        goog.moduleLoaderState_ = g;
      }, goog.getPathFromDeps_ = function(a) {
        return a in goog.dependencies_.nameToPath ? goog.dependencies_.nameToPath[a] : null;
      }, goog.findBasePath_(), goog.global.CLOSURE_NO_DEPS || goog.importScript_(goog.basePath + "deps.js"));
      goog.normalizePath_ = function(a) {
        a = a.split("/");
        for (var b = 0; b < a.length; ) "." == a[b] ? a.splice(b, 1) : b && ".." == a[b] && a[b - 1] && ".." != a[b - 1] ? a.splice(--b, 2) : b++;
        return a.join("/");
      };
      goog.loadFileSync_ = function(a) {
        if (goog.global.CLOSURE_LOAD_FILE_SYNC) return goog.global.CLOSURE_LOAD_FILE_SYNC(a);
        var b = new goog.global.XMLHttpRequest();
        b.open("get", a, !1);
        b.send();
        return b.responseText;
      };
      goog.retrieveAndExecModule_ = function(a) {
        if (!COMPILED) {
          var b = a;
          a = goog.normalizePath_(a);
          var c = goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_, d = goog.loadFileSync_(a);
          if (null == d) throw Error("load of " + a + "failed");
          d = goog.wrapModule_(a, d), goog.IS_OLD_IE_ ? (goog.dependencies_.deferred[b] = d, 
          goog.queuedModules_.push(b)) : c(a, d);
        }
      };
      goog.typeOf = function(a) {
        var b = "undefined" === typeof a ? "undefined" : _typeof(a);
        if ("object" == b) {
          if (!a) return "null";
          if (a instanceof Array) return "array";
          if (a instanceof Object) return b;
          var c = Object.prototype.toString.call(a);
          if ("[object Window]" == c) return "object";
          if ("[object Array]" == c || "number" == typeof a.length && "undefined" != typeof a.splice && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("splice")) return "array";
          if ("[object Function]" == c || "undefined" != typeof a.call && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("call")) return "function";
        } else if ("function" == b && "undefined" == typeof a.call) return "object";
        return b;
      };
      goog.isNull = function(a) {
        return null === a;
      };
      goog.isDefAndNotNull = function(a) {
        return null != a;
      };
      goog.isArray = function(a) {
        return "array" == goog.typeOf(a);
      };
      goog.isArrayLike = function(a) {
        var b = goog.typeOf(a);
        return "array" == b || "object" == b && "number" == typeof a.length;
      };
      goog.isDateLike = function(a) {
        return goog.isObject(a) && "function" == typeof a.getFullYear;
      };
      goog.isString = function(a) {
        return "string" == typeof a;
      };
      goog.isBoolean = function(a) {
        return "boolean" == typeof a;
      };
      goog.isNumber = function(a) {
        return "number" == typeof a;
      };
      goog.isFunction = function(a) {
        return "function" == goog.typeOf(a);
      };
      goog.isObject = function(a) {
        var b = "undefined" === typeof a ? "undefined" : _typeof(a);
        return "object" == b && null != a || "function" == b;
      };
      goog.getUid = function(a) {
        return a[goog.UID_PROPERTY_] || (a[goog.UID_PROPERTY_] = ++goog.uidCounter_);
      };
      goog.hasUid = function(a) {
        return !!a[goog.UID_PROPERTY_];
      };
      goog.removeUid = function(a) {
        null !== a && "removeAttribute" in a && a.removeAttribute(goog.UID_PROPERTY_);
        try {
          delete a[goog.UID_PROPERTY_];
        } catch (b) {}
      };
      goog.UID_PROPERTY_ = "closure_uid_" + (1e9 * Math.random() >>> 0);
      goog.uidCounter_ = 0;
      goog.getHashCode = goog.getUid;
      goog.removeHashCode = goog.removeUid;
      goog.cloneObject = function(a) {
        var b = goog.typeOf(a);
        if ("object" == b || "array" == b) {
          if (a.clone) return a.clone();
          var b = "array" == b ? [] : {}, c;
          for (c in a) b[c] = goog.cloneObject(a[c]);
          return b;
        }
        return a;
      };
      goog.bindNative_ = function(a, b, c) {
        return a.call.apply(a.bind, arguments);
      };
      goog.bindJs_ = function(a, b, c) {
        if (!a) throw Error();
        if (2 < arguments.length) {
          var d = Array.prototype.slice.call(arguments, 2);
          return function() {
            var c = Array.prototype.slice.call(arguments);
            Array.prototype.unshift.apply(c, d);
            return a.apply(b, c);
          };
        }
        return function() {
          return a.apply(b, arguments);
        };
      };
      goog.bind = function(a, b, c) {
        Function.prototype.bind && -1 != Function.prototype.bind.toString().indexOf("native code") ? goog.bind = goog.bindNative_ : goog.bind = goog.bindJs_;
        return goog.bind.apply(null, arguments);
      };
      goog.partial = function(a, b) {
        var c = Array.prototype.slice.call(arguments, 1);
        return function() {
          var b = c.slice();
          b.push.apply(b, arguments);
          return a.apply(this, b);
        };
      };
      goog.mixin = function(a, b) {
        for (var c in b) a[c] = b[c];
      };
      goog.now = goog.TRUSTED_SITE && Date.now || function() {
        return +new Date();
      };
      goog.globalEval = function(a) {
        if (goog.global.execScript) goog.global.execScript(a, "JavaScript"); else {
          if (!goog.global.eval) throw Error("goog.globalEval not available");
          if (null == goog.evalWorksForGlobals_) if (goog.global.eval("var _evalTest_ = 1;"), 
          "undefined" != typeof goog.global._evalTest_) {
            try {
              delete goog.global._evalTest_;
            } catch (d) {}
            goog.evalWorksForGlobals_ = !0;
          } else goog.evalWorksForGlobals_ = !1;
          if (goog.evalWorksForGlobals_) goog.global.eval(a); else {
            var b = goog.global.document, c = b.createElement("SCRIPT");
            c.type = "text/javascript";
            c.defer = !1;
            c.appendChild(b.createTextNode(a));
            b.body.appendChild(c);
            b.body.removeChild(c);
          }
        }
      };
      goog.evalWorksForGlobals_ = null;
      goog.getCssName = function(a, b) {
        var c = function c(a) {
          return goog.cssNameMapping_[a] || a;
        }, d = function d(a) {
          a = a.split("-");
          for (var b = [], d = 0; d < a.length; d++) b.push(c(a[d]));
          return b.join("-");
        }, d = goog.cssNameMapping_ ? "BY_WHOLE" == goog.cssNameMappingStyle_ ? c : d : function(a) {
          return a;
        };
        return b ? a + "-" + d(b) : d(a);
      };
      goog.setCssNameMapping = function(a, b) {
        goog.cssNameMapping_ = a;
        goog.cssNameMappingStyle_ = b;
      };
      !COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING && (goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING);
      goog.getMsg = function(a, b) {
        b && (a = a.replace(/\{\$([^}]+)}/g, function(a, d) {
          return null != b && d in b ? b[d] : a;
        }));
        return a;
      };
      goog.getMsgWithFallback = function(a, b) {
        return a;
      };
      goog.exportSymbol = function(a, b, c) {
        goog.exportPath_(a, b, c);
      };
      goog.exportProperty = function(a, b, c) {
        a[b] = c;
      };
      goog.inherits = function(a, b) {
        function c() {}
        c.prototype = b.prototype;
        a.superClass_ = b.prototype;
        a.prototype = new c();
        a.prototype.constructor = a;
        a.base = function(a, c, f) {
          for (var g = Array(arguments.length - 2), h = 2; h < arguments.length; h++) g[h - 2] = arguments[h];
          return b.prototype[c].apply(a, g);
        };
      };
      goog.base = function(a, b, c) {
        var d = arguments.callee.caller;
        if (goog.STRICT_MODE_COMPATIBLE || goog.DEBUG && !d) throw Error("arguments.caller not defined.  goog.base() cannot be used with strict mode code. See http://www.ecma-international.org/ecma-262/5.1/#sec-C");
        if (d.superClass_) {
          for (var e = Array(arguments.length - 1), f = 1; f < arguments.length; f++) e[f - 1] = arguments[f];
          return d.superClass_.constructor.apply(a, e);
        }
        e = Array(arguments.length - 2);
        for (f = 2; f < arguments.length; f++) e[f - 2] = arguments[f];
        for (var f = !1, g = a.constructor; g; g = g.superClass_ && g.superClass_.constructor) if (g.prototype[b] === d) f = !0; else if (f) return g.prototype[b].apply(a, e);
        if (a[b] === d) return a.constructor.prototype[b].apply(a, e);
        throw Error("goog.base called from a method of one name to a method of a different name");
      };
      goog.scope = function(a) {
        a.call(goog.global);
      };
      COMPILED || (goog.global.COMPILED = COMPILED);
      goog.defineClass = function(a, b) {
        var c = b.constructor, d = b.statics;
        c && c != Object.prototype.constructor || (c = function c() {
          throw Error("cannot instantiate an interface (no constructor defined).");
        });
        c = goog.defineClass.createSealingConstructor_(c, a);
        a && goog.inherits(c, a);
        delete b.constructor;
        delete b.statics;
        goog.defineClass.applyProperties_(c.prototype, b);
        null != d && (d instanceof Function ? d(c) : goog.defineClass.applyProperties_(c, d));
        return c;
      };
      goog.defineClass.SEAL_CLASS_INSTANCES = goog.DEBUG;
      goog.defineClass.createSealingConstructor_ = function(a, b) {
        if (goog.defineClass.SEAL_CLASS_INSTANCES && Object.seal instanceof Function) {
          if (b && b.prototype && b.prototype[goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_]) return a;
          var c = function c() {
            var b = a.apply(this, arguments) || this;
            b[goog.UID_PROPERTY_] = b[goog.UID_PROPERTY_];
            this.constructor === c && Object.seal(b);
            return b;
          };
          return c;
        }
        return a;
      };
      goog.defineClass.OBJECT_PROTOTYPE_FIELDS_ = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");
      goog.defineClass.applyProperties_ = function(a, b) {
        for (var c in b) Object.prototype.hasOwnProperty.call(b, c) && (a[c] = b[c]);
        for (var d = 0; d < goog.defineClass.OBJECT_PROTOTYPE_FIELDS_.length; d++) c = goog.defineClass.OBJECT_PROTOTYPE_FIELDS_[d], 
        Object.prototype.hasOwnProperty.call(b, c) && (a[c] = b[c]);
      };
      goog.tagUnsealableClass = function(a) {
        !COMPILED && goog.defineClass.SEAL_CLASS_INSTANCES && (a.prototype[goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_] = !0);
      };
      goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_ = "goog_defineClass_legacy_unsealable";
      goog.debug = {};
      goog.debug.Error = function(a) {
        if (Error.captureStackTrace) Error.captureStackTrace(this, goog.debug.Error); else {
          var b = Error().stack;
          b && (this.stack = b);
        }
        a && (this.message = String(a));
        this.reportErrorToServer = !0;
      };
      goog.inherits(goog.debug.Error, Error);
      goog.debug.Error.prototype.name = "CustomError";
      goog.dom = {};
      goog.dom.NodeType = {
        ELEMENT: 1,
        ATTRIBUTE: 2,
        TEXT: 3,
        CDATA_SECTION: 4,
        ENTITY_REFERENCE: 5,
        ENTITY: 6,
        PROCESSING_INSTRUCTION: 7,
        COMMENT: 8,
        DOCUMENT: 9,
        DOCUMENT_TYPE: 10,
        DOCUMENT_FRAGMENT: 11,
        NOTATION: 12
      };
      goog.string = {};
      goog.string.DETECT_DOUBLE_ESCAPING = !1;
      goog.string.FORCE_NON_DOM_HTML_UNESCAPING = !1;
      goog.string.Unicode = {
        NBSP: " "
      };
      goog.string.startsWith = function(a, b) {
        return 0 == a.lastIndexOf(b, 0);
      };
      goog.string.endsWith = function(a, b) {
        var c = a.length - b.length;
        return 0 <= c && a.indexOf(b, c) == c;
      };
      goog.string.caseInsensitiveStartsWith = function(a, b) {
        return 0 == goog.string.caseInsensitiveCompare(b, a.substr(0, b.length));
      };
      goog.string.caseInsensitiveEndsWith = function(a, b) {
        return 0 == goog.string.caseInsensitiveCompare(b, a.substr(a.length - b.length, b.length));
      };
      goog.string.caseInsensitiveEquals = function(a, b) {
        return a.toLowerCase() == b.toLowerCase();
      };
      goog.string.subs = function(a, b) {
        for (var c = a.split("%s"), d = "", e = Array.prototype.slice.call(arguments, 1); e.length && 1 < c.length; ) d += c.shift() + e.shift();
        return d + c.join("%s");
      };
      goog.string.collapseWhitespace = function(a) {
        return a.replace(/[\s\xa0]+/g, " ").replace(/^\s+|\s+$/g, "");
      };
      goog.string.isEmptyOrWhitespace = function(a) {
        return /^[\s\xa0]*$/.test(a);
      };
      goog.string.isEmptyString = function(a) {
        return 0 == a.length;
      };
      goog.string.isEmpty = goog.string.isEmptyOrWhitespace;
      goog.string.isEmptyOrWhitespaceSafe = function(a) {
        return goog.string.isEmptyOrWhitespace(goog.string.makeSafe(a));
      };
      goog.string.isEmptySafe = goog.string.isEmptyOrWhitespaceSafe;
      goog.string.isBreakingWhitespace = function(a) {
        return !/[^\t\n\r ]/.test(a);
      };
      goog.string.isAlpha = function(a) {
        return !/[^a-zA-Z]/.test(a);
      };
      goog.string.isNumeric = function(a) {
        return !/[^0-9]/.test(a);
      };
      goog.string.isAlphaNumeric = function(a) {
        return !/[^a-zA-Z0-9]/.test(a);
      };
      goog.string.isSpace = function(a) {
        return " " == a;
      };
      goog.string.isUnicodeChar = function(a) {
        return 1 == a.length && " " <= a && "~" >= a || "" <= a && "�" >= a;
      };
      goog.string.stripNewlines = function(a) {
        return a.replace(/(\r\n|\r|\n)+/g, " ");
      };
      goog.string.canonicalizeNewlines = function(a) {
        return a.replace(/(\r\n|\r|\n)/g, "\n");
      };
      goog.string.normalizeWhitespace = function(a) {
        return a.replace(/\xa0|\s/g, " ");
      };
      goog.string.normalizeSpaces = function(a) {
        return a.replace(/\xa0|[ \t]+/g, " ");
      };
      goog.string.collapseBreakingSpaces = function(a) {
        return a.replace(/[\t\r\n ]+/g, " ").replace(/^[\t\r\n ]+|[\t\r\n ]+$/g, "");
      };
      goog.string.trim = goog.TRUSTED_SITE && String.prototype.trim ? function(a) {
        return a.trim();
      } : function(a) {
        return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "");
      };
      goog.string.trimLeft = function(a) {
        return a.replace(/^[\s\xa0]+/, "");
      };
      goog.string.trimRight = function(a) {
        return a.replace(/[\s\xa0]+$/, "");
      };
      goog.string.caseInsensitiveCompare = function(a, b) {
        var c = String(a).toLowerCase(), d = String(b).toLowerCase();
        return c < d ? -1 : c == d ? 0 : 1;
      };
      goog.string.numberAwareCompare_ = function(a, b, c) {
        if (a == b) return 0;
        if (!a) return -1;
        if (!b) return 1;
        for (var d = a.toLowerCase().match(c), e = b.toLowerCase().match(c), f = Math.min(d.length, e.length), g = 0; g < f; g++) {
          c = d[g];
          var h = e[g];
          if (c != h) return a = parseInt(c, 10), !isNaN(a) && (b = parseInt(h, 10), !isNaN(b) && a - b) ? a - b : c < h ? -1 : 1;
        }
        return d.length != e.length ? d.length - e.length : a < b ? -1 : 1;
      };
      goog.string.intAwareCompare = function(a, b) {
        return goog.string.numberAwareCompare_(a, b, /\d+|\D+/g);
      };
      goog.string.floatAwareCompare = function(a, b) {
        return goog.string.numberAwareCompare_(a, b, /\d+|\.\d+|\D+/g);
      };
      goog.string.numerateCompare = goog.string.floatAwareCompare;
      goog.string.urlEncode = function(a) {
        return encodeURIComponent(String(a));
      };
      goog.string.urlDecode = function(a) {
        return decodeURIComponent(a.replace(/\+/g, " "));
      };
      goog.string.newLineToBr = function(a, b) {
        return a.replace(/(\r\n|\r|\n)/g, b ? "<br />" : "<br>");
      };
      goog.string.htmlEscape = function(a, b) {
        if (b) a = a.replace(goog.string.AMP_RE_, "&amp;").replace(goog.string.LT_RE_, "&lt;").replace(goog.string.GT_RE_, "&gt;").replace(goog.string.QUOT_RE_, "&quot;").replace(goog.string.SINGLE_QUOTE_RE_, "&#39;").replace(goog.string.NULL_RE_, "&#0;"), 
        goog.string.DETECT_DOUBLE_ESCAPING && (a = a.replace(goog.string.E_RE_, "&#101;")); else {
          if (!goog.string.ALL_RE_.test(a)) return a;
          -1 != a.indexOf("&") && (a = a.replace(goog.string.AMP_RE_, "&amp;"));
          -1 != a.indexOf("<") && (a = a.replace(goog.string.LT_RE_, "&lt;"));
          -1 != a.indexOf(">") && (a = a.replace(goog.string.GT_RE_, "&gt;"));
          -1 != a.indexOf('"') && (a = a.replace(goog.string.QUOT_RE_, "&quot;"));
          -1 != a.indexOf("'") && (a = a.replace(goog.string.SINGLE_QUOTE_RE_, "&#39;"));
          -1 != a.indexOf("\0") && (a = a.replace(goog.string.NULL_RE_, "&#0;"));
          goog.string.DETECT_DOUBLE_ESCAPING && -1 != a.indexOf("e") && (a = a.replace(goog.string.E_RE_, "&#101;"));
        }
        return a;
      };
      goog.string.AMP_RE_ = /&/g;
      goog.string.LT_RE_ = /</g;
      goog.string.GT_RE_ = />/g;
      goog.string.QUOT_RE_ = /"/g;
      goog.string.SINGLE_QUOTE_RE_ = /'/g;
      goog.string.NULL_RE_ = /\x00/g;
      goog.string.E_RE_ = /e/g;
      goog.string.ALL_RE_ = goog.string.DETECT_DOUBLE_ESCAPING ? /[\x00&<>"'e]/ : /[\x00&<>"']/;
      goog.string.unescapeEntities = function(a) {
        return goog.string.contains(a, "&") ? !goog.string.FORCE_NON_DOM_HTML_UNESCAPING && "document" in goog.global ? goog.string.unescapeEntitiesUsingDom_(a) : goog.string.unescapePureXmlEntities_(a) : a;
      };
      goog.string.unescapeEntitiesWithDocument = function(a, b) {
        return goog.string.contains(a, "&") ? goog.string.unescapeEntitiesUsingDom_(a, b) : a;
      };
      goog.string.unescapeEntitiesUsingDom_ = function(a, b) {
        var c = {
          "&amp;": "&",
          "&lt;": "<",
          "&gt;": ">",
          "&quot;": '"'
        }, d;
        d = b ? b.createElement("div") : goog.global.document.createElement("div");
        return a.replace(goog.string.HTML_ENTITY_PATTERN_, function(a, b) {
          var g = c[a];
          if (g) return g;
          if ("#" == b.charAt(0)) {
            var h = Number("0" + b.substr(1));
            isNaN(h) || (g = String.fromCharCode(h));
          }
          g || (d.innerHTML = a + " ", g = d.firstChild.nodeValue.slice(0, -1));
          return c[a] = g;
        });
      };
      goog.string.unescapePureXmlEntities_ = function(a) {
        return a.replace(/&([^;]+);/g, function(a, c) {
          switch (c) {
           case "amp":
            return "&";

           case "lt":
            return "<";

           case "gt":
            return ">";

           case "quot":
            return '"';

           default:
            if ("#" == c.charAt(0)) {
              var d = Number("0" + c.substr(1));
              if (!isNaN(d)) return String.fromCharCode(d);
            }
            return a;
          }
        });
      };
      goog.string.HTML_ENTITY_PATTERN_ = /&([^;\s<&]+);?/g;
      goog.string.whitespaceEscape = function(a, b) {
        return goog.string.newLineToBr(a.replace(/  /g, " &#160;"), b);
      };
      goog.string.preserveSpaces = function(a) {
        return a.replace(/(^|[\n ]) /g, "$1" + goog.string.Unicode.NBSP);
      };
      goog.string.stripQuotes = function(a, b) {
        for (var c = b.length, d = 0; d < c; d++) {
          var e = 1 == c ? b : b.charAt(d);
          if (a.charAt(0) == e && a.charAt(a.length - 1) == e) return a.substring(1, a.length - 1);
        }
        return a;
      };
      goog.string.truncate = function(a, b, c) {
        c && (a = goog.string.unescapeEntities(a));
        a.length > b && (a = a.substring(0, b - 3) + "...");
        c && (a = goog.string.htmlEscape(a));
        return a;
      };
      goog.string.truncateMiddle = function(a, b, c, d) {
        c && (a = goog.string.unescapeEntities(a));
        if (d && a.length > b) {
          d > b && (d = b);
          var e = a.length - d;
          a = a.substring(0, b - d) + "..." + a.substring(e);
        } else a.length > b && (d = Math.floor(b / 2), e = a.length - d, a = a.substring(0, d + b % 2) + "..." + a.substring(e));
        c && (a = goog.string.htmlEscape(a));
        return a;
      };
      goog.string.specialEscapeChars_ = {
        "\0": "\\0",
        "\b": "\\b",
        "\f": "\\f",
        "\n": "\\n",
        "\r": "\\r",
        "\t": "\\t",
        "\v": "\\x0B",
        '"': '\\"',
        "\\": "\\\\",
        "<": "<"
      };
      goog.string.jsEscapeCache_ = {
        "'": "\\'"
      };
      goog.string.quote = function(a) {
        a = String(a);
        for (var b = [ '"' ], c = 0; c < a.length; c++) {
          var d = a.charAt(c), e = d.charCodeAt(0);
          b[c + 1] = goog.string.specialEscapeChars_[d] || (31 < e && 127 > e ? d : goog.string.escapeChar(d));
        }
        b.push('"');
        return b.join("");
      };
      goog.string.escapeString = function(a) {
        for (var b = [], c = 0; c < a.length; c++) b[c] = goog.string.escapeChar(a.charAt(c));
        return b.join("");
      };
      goog.string.escapeChar = function(a) {
        if (a in goog.string.jsEscapeCache_) return goog.string.jsEscapeCache_[a];
        if (a in goog.string.specialEscapeChars_) return goog.string.jsEscapeCache_[a] = goog.string.specialEscapeChars_[a];
        var b, c = a.charCodeAt(0);
        if (31 < c && 127 > c) b = a; else {
          256 > c ? (b = "\\x", 16 > c || 256 < c) && (b += "0") : (b = "\\u", 4096 > c && (b += "0"));
          b += c.toString(16).toUpperCase();
        }
        return goog.string.jsEscapeCache_[a] = b;
      };
      goog.string.contains = function(a, b) {
        return -1 != a.indexOf(b);
      };
      goog.string.caseInsensitiveContains = function(a, b) {
        return goog.string.contains(a.toLowerCase(), b.toLowerCase());
      };
      goog.string.countOf = function(a, b) {
        return a && b ? a.split(b).length - 1 : 0;
      };
      goog.string.removeAt = function(a, b, c) {
        var d = a;
        0 <= b && b < a.length && 0 < c && (d = a.substr(0, b) + a.substr(b + c, a.length - b - c));
        return d;
      };
      goog.string.remove = function(a, b) {
        var c = new RegExp(goog.string.regExpEscape(b), "");
        return a.replace(c, "");
      };
      goog.string.removeAll = function(a, b) {
        var c = new RegExp(goog.string.regExpEscape(b), "g");
        return a.replace(c, "");
      };
      goog.string.regExpEscape = function(a) {
        return String(a).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08");
      };
      goog.string.repeat = String.prototype.repeat ? function(a, b) {
        return a.repeat(b);
      } : function(a, b) {
        return Array(b + 1).join(a);
      };
      goog.string.padNumber = function(a, b, c) {
        a = goog.isDef(c) ? a.toFixed(c) : String(a);
        c = a.indexOf(".");
        -1 == c && (c = a.length);
        return goog.string.repeat("0", Math.max(0, b - c)) + a;
      };
      goog.string.makeSafe = function(a) {
        return null == a ? "" : String(a);
      };
      goog.string.buildString = function(a) {
        return Array.prototype.join.call(arguments, "");
      };
      goog.string.getRandomString = function() {
        return Math.floor(2147483648 * Math.random()).toString(36) + Math.abs(Math.floor(2147483648 * Math.random()) ^ goog.now()).toString(36);
      };
      goog.string.compareVersions = function(a, b) {
        for (var c = 0, d = goog.string.trim(String(a)).split("."), e = goog.string.trim(String(b)).split("."), f = Math.max(d.length, e.length), g = 0; 0 == c && g < f; g++) {
          var h = d[g] || "", k = e[g] || "", l = RegExp("(\\d*)(\\D*)", "g"), p = RegExp("(\\d*)(\\D*)", "g");
          do {
            var m = l.exec(h) || [ "", "", "" ], n = p.exec(k) || [ "", "", "" ];
            if (0 == m[0].length && 0 == n[0].length) break;
            var c = 0 == m[1].length ? 0 : parseInt(m[1], 10), q = 0 == n[1].length ? 0 : parseInt(n[1], 10), c = goog.string.compareElements_(c, q) || goog.string.compareElements_(0 == m[2].length, 0 == n[2].length) || goog.string.compareElements_(m[2], n[2]);
          } while (0 == c);
        }
        return c;
      };
      goog.string.compareElements_ = function(a, b) {
        return a < b ? -1 : a > b ? 1 : 0;
      };
      goog.string.hashCode = function(a) {
        for (var b = 0, c = 0; c < a.length; ++c) b = 31 * b + a.charCodeAt(c) >>> 0;
        return b;
      };
      goog.string.uniqueStringCounter_ = 2147483648 * Math.random() | 0;
      goog.string.createUniqueString = function() {
        return "goog_" + goog.string.uniqueStringCounter_++;
      };
      goog.string.toNumber = function(a) {
        var b = Number(a);
        return 0 == b && goog.string.isEmptyOrWhitespace(a) ? NaN : b;
      };
      goog.string.isLowerCamelCase = function(a) {
        return /^[a-z]+([A-Z][a-z]*)*$/.test(a);
      };
      goog.string.isUpperCamelCase = function(a) {
        return /^([A-Z][a-z]*)+$/.test(a);
      };
      goog.string.toCamelCase = function(a) {
        return String(a).replace(/\-([a-z])/g, function(a, c) {
          return c.toUpperCase();
        });
      };
      goog.string.toSelectorCase = function(a) {
        return String(a).replace(/([A-Z])/g, "-$1").toLowerCase();
      };
      goog.string.toTitleCase = function(a, b) {
        var c = goog.isString(b) ? goog.string.regExpEscape(b) : "\\s";
        return a.replace(new RegExp("(^" + (c ? "|[" + c + "]+" : "") + ")([a-z])", "g"), function(a, b, c) {
          return b + c.toUpperCase();
        });
      };
      goog.string.capitalize = function(a) {
        return String(a.charAt(0)).toUpperCase() + String(a.substr(1)).toLowerCase();
      };
      goog.string.parseInt = function(a) {
        isFinite(a) && (a = String(a));
        return goog.isString(a) ? /^\s*-?0x/i.test(a) ? parseInt(a, 16) : parseInt(a, 10) : NaN;
      };
      goog.string.splitLimit = function(a, b, c) {
        a = a.split(b);
        for (var d = []; 0 < c && a.length; ) d.push(a.shift()), c--;
        a.length && d.push(a.join(b));
        return d;
      };
      goog.string.editDistance = function(a, b) {
        var c = [], d = [];
        if (a == b) return 0;
        if (!a.length || !b.length) return Math.max(a.length, b.length);
        for (var e = 0; e < b.length + 1; e++) c[e] = e;
        for (e = 0; e < a.length; e++) {
          d[0] = e + 1;
          for (var f = 0; f < b.length; f++) d[f + 1] = Math.min(d[f] + 1, c[f + 1] + 1, c[f] + Number(a[e] != b[f]));
          for (f = 0; f < c.length; f++) c[f] = d[f];
        }
        return d[b.length];
      };
      goog.asserts = {};
      goog.asserts.ENABLE_ASSERTS = goog.DEBUG;
      goog.asserts.AssertionError = function(a, b) {
        b.unshift(a);
        goog.debug.Error.call(this, goog.string.subs.apply(null, b));
        b.shift();
        this.messagePattern = a;
      };
      goog.inherits(goog.asserts.AssertionError, goog.debug.Error);
      goog.asserts.AssertionError.prototype.name = "AssertionError";
      goog.asserts.DEFAULT_ERROR_HANDLER = function(a) {
        throw a;
      };
      goog.asserts.errorHandler_ = goog.asserts.DEFAULT_ERROR_HANDLER;
      goog.asserts.doAssertFailure_ = function(a, b, c, d) {
        var e = "Assertion failed";
        if (c) var e = e + ": " + c, f = d; else a && (e += ": " + a, f = b);
        a = new goog.asserts.AssertionError("" + e, f || []);
        goog.asserts.errorHandler_(a);
      };
      goog.asserts.setErrorHandler = function(a) {
        goog.asserts.ENABLE_ASSERTS && (goog.asserts.errorHandler_ = a);
      };
      goog.asserts.assert = function(a, b, c) {
        goog.asserts.ENABLE_ASSERTS && !a && goog.asserts.doAssertFailure_("", null, b, Array.prototype.slice.call(arguments, 2));
        return a;
      };
      goog.asserts.fail = function(a, b) {
        goog.asserts.ENABLE_ASSERTS && goog.asserts.errorHandler_(new goog.asserts.AssertionError("Failure" + (a ? ": " + a : ""), Array.prototype.slice.call(arguments, 1)));
      };
      goog.asserts.assertNumber = function(a, b, c) {
        goog.asserts.ENABLE_ASSERTS && !goog.isNumber(a) && goog.asserts.doAssertFailure_("Expected number but got %s: %s.", [ goog.typeOf(a), a ], b, Array.prototype.slice.call(arguments, 2));
        return a;
      };
      goog.asserts.assertString = function(a, b, c) {
        goog.asserts.ENABLE_ASSERTS && !goog.isString(a) && goog.asserts.doAssertFailure_("Expected string but got %s: %s.", [ goog.typeOf(a), a ], b, Array.prototype.slice.call(arguments, 2));
        return a;
      };
      goog.asserts.assertFunction = function(a, b, c) {
        goog.asserts.ENABLE_ASSERTS && !goog.isFunction(a) && goog.asserts.doAssertFailure_("Expected function but got %s: %s.", [ goog.typeOf(a), a ], b, Array.prototype.slice.call(arguments, 2));
        return a;
      };
      goog.asserts.assertObject = function(a, b, c) {
        goog.asserts.ENABLE_ASSERTS && !goog.isObject(a) && goog.asserts.doAssertFailure_("Expected object but got %s: %s.", [ goog.typeOf(a), a ], b, Array.prototype.slice.call(arguments, 2));
        return a;
      };
      goog.asserts.assertArray = function(a, b, c) {
        goog.asserts.ENABLE_ASSERTS && !goog.isArray(a) && goog.asserts.doAssertFailure_("Expected array but got %s: %s.", [ goog.typeOf(a), a ], b, Array.prototype.slice.call(arguments, 2));
        return a;
      };
      goog.asserts.assertBoolean = function(a, b, c) {
        goog.asserts.ENABLE_ASSERTS && !goog.isBoolean(a) && goog.asserts.doAssertFailure_("Expected boolean but got %s: %s.", [ goog.typeOf(a), a ], b, Array.prototype.slice.call(arguments, 2));
        return a;
      };
      goog.asserts.assertElement = function(a, b, c) {
        !goog.asserts.ENABLE_ASSERTS || goog.isObject(a) && a.nodeType == goog.dom.NodeType.ELEMENT || goog.asserts.doAssertFailure_("Expected Element but got %s: %s.", [ goog.typeOf(a), a ], b, Array.prototype.slice.call(arguments, 2));
        return a;
      };
      goog.asserts.assertInstanceof = function(a, b, c, d) {
        !goog.asserts.ENABLE_ASSERTS || a instanceof b || goog.asserts.doAssertFailure_("Expected instanceof %s but got %s.", [ goog.asserts.getType_(b), goog.asserts.getType_(a) ], c, Array.prototype.slice.call(arguments, 3));
        return a;
      };
      goog.asserts.assertObjectPrototypeIsIntact = function() {
        for (var a in Object.prototype) goog.asserts.fail(a + " should not be enumerable in Object.prototype.");
      };
      goog.asserts.getType_ = function(a) {
        return a instanceof Function ? a.displayName || a.name || "unknown type name" : a instanceof Object ? a.constructor.displayName || a.constructor.name || Object.prototype.toString.call(a) : null === a ? "null" : "undefined" === typeof a ? "undefined" : _typeof(a);
      };
      goog.array = {};
      goog.NATIVE_ARRAY_PROTOTYPES = goog.TRUSTED_SITE;
      goog.array.ASSUME_NATIVE_FUNCTIONS = !1;
      goog.array.peek = function(a) {
        return a[a.length - 1];
      };
      goog.array.last = goog.array.peek;
      goog.array.indexOf = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.indexOf) ? function(a, b, c) {
        goog.asserts.assert(null != a.length);
        return Array.prototype.indexOf.call(a, b, c);
      } : function(a, b, c) {
        c = null == c ? 0 : 0 > c ? Math.max(0, a.length + c) : c;
        if (goog.isString(a)) return goog.isString(b) && 1 == b.length ? a.indexOf(b, c) : -1;
        for (;c < a.length; c++) if (c in a && a[c] === b) return c;
        return -1;
      };
      goog.array.lastIndexOf = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.lastIndexOf) ? function(a, b, c) {
        goog.asserts.assert(null != a.length);
        return Array.prototype.lastIndexOf.call(a, b, null == c ? a.length - 1 : c);
      } : function(a, b, c) {
        c = null == c ? a.length - 1 : c;
        0 > c && (c = Math.max(0, a.length + c));
        if (goog.isString(a)) return goog.isString(b) && 1 == b.length ? a.lastIndexOf(b, c) : -1;
        for (;0 <= c; c--) if (c in a && a[c] === b) return c;
        return -1;
      };
      goog.array.forEach = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.forEach) ? function(a, b, c) {
        goog.asserts.assert(null != a.length);
        Array.prototype.forEach.call(a, b, c);
      } : function(a, b, c) {
        for (var d = a.length, e = goog.isString(a) ? a.split("") : a, f = 0; f < d; f++) f in e && b.call(c, e[f], f, a);
      };
      goog.array.forEachRight = function(a, b, c) {
        for (var d = a.length, e = goog.isString(a) ? a.split("") : a, d = d - 1; 0 <= d; --d) d in e && b.call(c, e[d], d, a);
      };
      goog.array.filter = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.filter) ? function(a, b, c) {
        goog.asserts.assert(null != a.length);
        return Array.prototype.filter.call(a, b, c);
      } : function(a, b, c) {
        for (var d = a.length, e = [], f = 0, g = goog.isString(a) ? a.split("") : a, h = 0; h < d; h++) if (h in g) {
          var k = g[h];
          b.call(c, k, h, a) && (e[f++] = k);
        }
        return e;
      };
      goog.array.map = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.map) ? function(a, b, c) {
        goog.asserts.assert(null != a.length);
        return Array.prototype.map.call(a, b, c);
      } : function(a, b, c) {
        for (var d = a.length, e = Array(d), f = goog.isString(a) ? a.split("") : a, g = 0; g < d; g++) g in f && (e[g] = b.call(c, f[g], g, a));
        return e;
      };
      goog.array.reduce = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.reduce) ? function(a, b, c, d) {
        goog.asserts.assert(null != a.length);
        d && (b = goog.bind(b, d));
        return Array.prototype.reduce.call(a, b, c);
      } : function(a, b, c, d) {
        var e = c;
        goog.array.forEach(a, function(c, g) {
          e = b.call(d, e, c, g, a);
        });
        return e;
      };
      goog.array.reduceRight = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.reduceRight) ? function(a, b, c, d) {
        goog.asserts.assert(null != a.length);
        goog.asserts.assert(null != b);
        d && (b = goog.bind(b, d));
        return Array.prototype.reduceRight.call(a, b, c);
      } : function(a, b, c, d) {
        var e = c;
        goog.array.forEachRight(a, function(c, g) {
          e = b.call(d, e, c, g, a);
        });
        return e;
      };
      goog.array.some = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.some) ? function(a, b, c) {
        goog.asserts.assert(null != a.length);
        return Array.prototype.some.call(a, b, c);
      } : function(a, b, c) {
        for (var d = a.length, e = goog.isString(a) ? a.split("") : a, f = 0; f < d; f++) if (f in e && b.call(c, e[f], f, a)) return !0;
        return !1;
      };
      goog.array.every = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.every) ? function(a, b, c) {
        goog.asserts.assert(null != a.length);
        return Array.prototype.every.call(a, b, c);
      } : function(a, b, c) {
        for (var d = a.length, e = goog.isString(a) ? a.split("") : a, f = 0; f < d; f++) if (f in e && !b.call(c, e[f], f, a)) return !1;
        return !0;
      };
      goog.array.count = function(a, b, c) {
        var d = 0;
        goog.array.forEach(a, function(a, f, g) {
          b.call(c, a, f, g) && ++d;
        }, c);
        return d;
      };
      goog.array.find = function(a, b, c) {
        b = goog.array.findIndex(a, b, c);
        return 0 > b ? null : goog.isString(a) ? a.charAt(b) : a[b];
      };
      goog.array.findIndex = function(a, b, c) {
        for (var d = a.length, e = goog.isString(a) ? a.split("") : a, f = 0; f < d; f++) if (f in e && b.call(c, e[f], f, a)) return f;
        return -1;
      };
      goog.array.findRight = function(a, b, c) {
        b = goog.array.findIndexRight(a, b, c);
        return 0 > b ? null : goog.isString(a) ? a.charAt(b) : a[b];
      };
      goog.array.findIndexRight = function(a, b, c) {
        for (var d = a.length, e = goog.isString(a) ? a.split("") : a, d = d - 1; 0 <= d; d--) if (d in e && b.call(c, e[d], d, a)) return d;
        return -1;
      };
      goog.array.contains = function(a, b) {
        return 0 <= goog.array.indexOf(a, b);
      };
      goog.array.isEmpty = function(a) {
        return 0 == a.length;
      };
      goog.array.clear = function(a) {
        if (!goog.isArray(a)) for (var b = a.length - 1; 0 <= b; b--) delete a[b];
        a.length = 0;
      };
      goog.array.insert = function(a, b) {
        goog.array.contains(a, b) || a.push(b);
      };
      goog.array.insertAt = function(a, b, c) {
        goog.array.splice(a, c, 0, b);
      };
      goog.array.insertArrayAt = function(a, b, c) {
        goog.partial(goog.array.splice, a, c, 0).apply(null, b);
      };
      goog.array.insertBefore = function(a, b, c) {
        var d;
        2 == arguments.length || 0 > (d = goog.array.indexOf(a, c)) ? a.push(b) : goog.array.insertAt(a, b, d);
      };
      goog.array.remove = function(a, b) {
        var c = goog.array.indexOf(a, b), d;
        (d = 0 <= c) && goog.array.removeAt(a, c);
        return d;
      };
      goog.array.removeAt = function(a, b) {
        goog.asserts.assert(null != a.length);
        return 1 == Array.prototype.splice.call(a, b, 1).length;
      };
      goog.array.removeIf = function(a, b, c) {
        b = goog.array.findIndex(a, b, c);
        return 0 <= b && (goog.array.removeAt(a, b), !0);
      };
      goog.array.removeAllIf = function(a, b, c) {
        var d = 0;
        goog.array.forEachRight(a, function(e, f) {
          b.call(c, e, f, a) && goog.array.removeAt(a, f) && d++;
        });
        return d;
      };
      goog.array.concat = function(a) {
        return Array.prototype.concat.apply(Array.prototype, arguments);
      };
      goog.array.join = function(a) {
        return Array.prototype.concat.apply(Array.prototype, arguments);
      };
      goog.array.toArray = function(a) {
        var b = a.length;
        if (0 < b) {
          for (var c = Array(b), d = 0; d < b; d++) c[d] = a[d];
          return c;
        }
        return [];
      };
      goog.array.clone = goog.array.toArray;
      goog.array.extend = function(a, b) {
        for (var c = 1; c < arguments.length; c++) {
          var d = arguments[c];
          if (goog.isArrayLike(d)) {
            var e = a.length || 0, f = d.length || 0;
            a.length = e + f;
            for (var g = 0; g < f; g++) a[e + g] = d[g];
          } else a.push(d);
        }
      };
      goog.array.splice = function(a, b, c, d) {
        goog.asserts.assert(null != a.length);
        return Array.prototype.splice.apply(a, goog.array.slice(arguments, 1));
      };
      goog.array.slice = function(a, b, c) {
        goog.asserts.assert(null != a.length);
        return 2 >= arguments.length ? Array.prototype.slice.call(a, b) : Array.prototype.slice.call(a, b, c);
      };
      goog.array.removeDuplicates = function(a, b, c) {
        b = b || a;
        var d = function d(a) {
          return goog.isObject(a) ? "o" + goog.getUid(a) : ("undefined" === typeof a ? "undefined" : _typeof(a)).charAt(0) + a;
        };
        c = c || d;
        for (var d = {}, e = 0, f = 0; f < a.length; ) {
          var g = a[f++], h = c(g);
          Object.prototype.hasOwnProperty.call(d, h) || (d[h] = !0, b[e++] = g);
        }
        b.length = e;
      };
      goog.array.binarySearch = function(a, b, c) {
        return goog.array.binarySearch_(a, c || goog.array.defaultCompare, !1, b);
      };
      goog.array.binarySelect = function(a, b, c) {
        return goog.array.binarySearch_(a, b, !0, void 0, c);
      };
      goog.array.binarySearch_ = function(a, b, c, d, e) {
        for (var f = 0, g = a.length, h; f < g; ) {
          var k = f + g >> 1, l;
          l = c ? b.call(e, a[k], k, a) : b(d, a[k]);
          0 < l ? f = k + 1 : (g = k, h = !l);
        }
        return h ? f : ~f;
      };
      goog.array.sort = function(a, b) {
        a.sort(b || goog.array.defaultCompare);
      };
      goog.array.stableSort = function(a, b) {
        for (var c = 0; c < a.length; c++) a[c] = {
          index: c,
          value: a[c]
        };
        var d = b || goog.array.defaultCompare;
        goog.array.sort(a, function(a, b) {
          return d(a.value, b.value) || a.index - b.index;
        });
        for (c = 0; c < a.length; c++) a[c] = a[c].value;
      };
      goog.array.sortByKey = function(a, b, c) {
        var d = c || goog.array.defaultCompare;
        goog.array.sort(a, function(a, c) {
          return d(b(a), b(c));
        });
      };
      goog.array.sortObjectsByKey = function(a, b, c) {
        goog.array.sortByKey(a, function(a) {
          return a[b];
        }, c);
      };
      goog.array.isSorted = function(a, b, c) {
        b = b || goog.array.defaultCompare;
        for (var d = 1; d < a.length; d++) {
          var e = b(a[d - 1], a[d]);
          if (0 < e || 0 == e && c) return !1;
        }
        return !0;
      };
      goog.array.equals = function(a, b, c) {
        if (!goog.isArrayLike(a) || !goog.isArrayLike(b) || a.length != b.length) return !1;
        var d = a.length;
        c = c || goog.array.defaultCompareEquality;
        for (var e = 0; e < d; e++) if (!c(a[e], b[e])) return !1;
        return !0;
      };
      goog.array.compare3 = function(a, b, c) {
        c = c || goog.array.defaultCompare;
        for (var d = Math.min(a.length, b.length), e = 0; e < d; e++) {
          var f = c(a[e], b[e]);
          if (0 != f) return f;
        }
        return goog.array.defaultCompare(a.length, b.length);
      };
      goog.array.defaultCompare = function(a, b) {
        return a > b ? 1 : a < b ? -1 : 0;
      };
      goog.array.inverseDefaultCompare = function(a, b) {
        return -goog.array.defaultCompare(a, b);
      };
      goog.array.defaultCompareEquality = function(a, b) {
        return a === b;
      };
      goog.array.binaryInsert = function(a, b, c) {
        c = goog.array.binarySearch(a, b, c);
        return 0 > c && (goog.array.insertAt(a, b, -(c + 1)), !0);
      };
      goog.array.binaryRemove = function(a, b, c) {
        b = goog.array.binarySearch(a, b, c);
        return 0 <= b && goog.array.removeAt(a, b);
      };
      goog.array.bucket = function(a, b, c) {
        for (var d = {}, e = 0; e < a.length; e++) {
          var f = a[e], g = b.call(c, f, e, a);
          goog.isDef(g) && (d[g] || (d[g] = [])).push(f);
        }
        return d;
      };
      goog.array.toObject = function(a, b, c) {
        var d = {};
        goog.array.forEach(a, function(e, f) {
          d[b.call(c, e, f, a)] = e;
        });
        return d;
      };
      goog.array.range = function(a, b, c) {
        var d = [], e = 0, f = a;
        c = c || 1;
        void 0 !== b && (e = a, f = b);
        if (0 > c * (f - e)) return [];
        if (0 < c) for (a = e; a < f; a += c) d.push(a); else for (a = e; a > f; a += c) d.push(a);
        return d;
      };
      goog.array.repeat = function(a, b) {
        for (var c = [], d = 0; d < b; d++) c[d] = a;
        return c;
      };
      goog.array.flatten = function(a) {
        for (var b = [], c = 0; c < arguments.length; c++) {
          var d = arguments[c];
          if (goog.isArray(d)) for (var e = 0; e < d.length; e += 8192) for (var f = goog.array.slice(d, e, e + 8192), f = goog.array.flatten.apply(null, f), g = 0; g < f.length; g++) b.push(f[g]); else b.push(d);
        }
        return b;
      };
      goog.array.rotate = function(a, b) {
        goog.asserts.assert(null != a.length);
        a.length && (b %= a.length, 0 < b ? Array.prototype.unshift.apply(a, a.splice(-b, b)) : 0 > b && Array.prototype.push.apply(a, a.splice(0, -b)));
        return a;
      };
      goog.array.moveItem = function(a, b, c) {
        goog.asserts.assert(0 <= b && b < a.length);
        goog.asserts.assert(0 <= c && c < a.length);
        b = Array.prototype.splice.call(a, b, 1);
        Array.prototype.splice.call(a, c, 0, b[0]);
      };
      goog.array.zip = function(a) {
        if (!arguments.length) return [];
        for (var b = [], c = arguments[0].length, d = 1; d < arguments.length; d++) arguments[d].length < c && (c = arguments[d].length);
        for (d = 0; d < c; d++) {
          for (var e = [], f = 0; f < arguments.length; f++) e.push(arguments[f][d]);
          b.push(e);
        }
        return b;
      };
      goog.array.shuffle = function(a, b) {
        for (var c = b || Math.random, d = a.length - 1; 0 < d; d--) {
          var e = Math.floor(c() * (d + 1)), f = a[d];
          a[d] = a[e];
          a[e] = f;
        }
      };
      goog.array.copyByIndex = function(a, b) {
        var c = [];
        goog.array.forEach(b, function(b) {
          c.push(a[b]);
        });
        return c;
      };
      goog.crypt = {};
      goog.crypt.stringToByteArray = function(a) {
        for (var b = [], c = 0, d = 0; d < a.length; d++) {
          for (var e = a.charCodeAt(d); 255 < e; ) b[c++] = 255 & e, e >>= 8;
          b[c++] = e;
        }
        return b;
      };
      goog.crypt.byteArrayToString = function(a) {
        if (8192 >= a.length) return String.fromCharCode.apply(null, a);
        for (var b = "", c = 0; c < a.length; c += 8192) var d = goog.array.slice(a, c, c + 8192), b = b + String.fromCharCode.apply(null, d);
        return b;
      };
      goog.crypt.byteArrayToHex = function(a) {
        return goog.array.map(a, function(a) {
          a = a.toString(16);
          return 1 < a.length ? a : "0" + a;
        }).join("");
      };
      goog.crypt.hexToByteArray = function(a) {
        goog.asserts.assert(0 == a.length % 2, "Key string length must be multiple of 2");
        for (var b = [], c = 0; c < a.length; c += 2) b.push(parseInt(a.substring(c, c + 2), 16));
        return b;
      };
      goog.crypt.stringToUtf8ByteArray = function(a) {
        for (var b = [], c = 0, d = 0; d < a.length; d++) {
          var e = a.charCodeAt(d);
          128 > e ? b[c++] = e : (2048 > e ? b[c++] = e >> 6 | 192 : (55296 == (64512 & e) && d + 1 < a.length && 56320 == (64512 & a.charCodeAt(d + 1)) ? (e = 65536 + ((1023 & e) << 10) + (1023 & a.charCodeAt(++d)), 
          b[c++] = e >> 18 | 240, b[c++] = e >> 12 & 63 | 128) : b[c++] = e >> 12 | 224, b[c++] = e >> 6 & 63 | 128), 
          b[c++] = 63 & e | 128);
        }
        return b;
      };
      goog.crypt.utf8ByteArrayToString = function(a) {
        for (var b = [], c = 0, d = 0; c < a.length; ) {
          var e = a[c++];
          if (128 > e) b[d++] = String.fromCharCode(e); else if (191 < e && 224 > e) {
            var f = a[c++];
            b[d++] = String.fromCharCode((31 & e) << 6 | 63 & f);
          } else if (239 < e && 365 > e) {
            var f = a[c++], g = a[c++], h = a[c++], e = ((7 & e) << 18 | (63 & f) << 12 | (63 & g) << 6 | 63 & h) - 65536;
            b[d++] = String.fromCharCode(55296 + (e >> 10));
            b[d++] = String.fromCharCode(56320 + (1023 & e));
          } else f = a[c++], g = a[c++], b[d++] = String.fromCharCode((15 & e) << 12 | (63 & f) << 6 | 63 & g);
        }
        return b.join("");
      };
      goog.crypt.xorByteArray = function(a, b) {
        goog.asserts.assert(a.length == b.length, "XOR array lengths must match");
        for (var c = [], d = 0; d < a.length; d++) c.push(a[d] ^ b[d]);
        return c;
      };
      goog.labs = {};
      goog.labs.userAgent = {};
      goog.labs.userAgent.util = {};
      goog.labs.userAgent.util.getNativeUserAgentString_ = function() {
        var a = goog.labs.userAgent.util.getNavigator_();
        return a && (a = a.userAgent) ? a : "";
      };
      goog.labs.userAgent.util.getNavigator_ = function() {
        return goog.global.navigator;
      };
      goog.labs.userAgent.util.userAgent_ = goog.labs.userAgent.util.getNativeUserAgentString_();
      goog.labs.userAgent.util.setUserAgent = function(a) {
        goog.labs.userAgent.util.userAgent_ = a || goog.labs.userAgent.util.getNativeUserAgentString_();
      };
      goog.labs.userAgent.util.getUserAgent = function() {
        return goog.labs.userAgent.util.userAgent_;
      };
      goog.labs.userAgent.util.matchUserAgent = function(a) {
        var b = goog.labs.userAgent.util.getUserAgent();
        return goog.string.contains(b, a);
      };
      goog.labs.userAgent.util.matchUserAgentIgnoreCase = function(a) {
        var b = goog.labs.userAgent.util.getUserAgent();
        return goog.string.caseInsensitiveContains(b, a);
      };
      goog.labs.userAgent.util.extractVersionTuples = function(a) {
        for (var b = RegExp("(\\w[\\w ]+)/([^\\s]+)\\s*(?:\\((.*?)\\))?", "g"), c = [], d; d = b.exec(a); ) c.push([ d[1], d[2], d[3] || void 0 ]);
        return c;
      };
      goog.object = {};
      goog.object.forEach = function(a, b, c) {
        for (var d in a) b.call(c, a[d], d, a);
      };
      goog.object.filter = function(a, b, c) {
        var d = {}, e;
        for (e in a) b.call(c, a[e], e, a) && (d[e] = a[e]);
        return d;
      };
      goog.object.map = function(a, b, c) {
        var d = {}, e;
        for (e in a) d[e] = b.call(c, a[e], e, a);
        return d;
      };
      goog.object.some = function(a, b, c) {
        for (var d in a) if (b.call(c, a[d], d, a)) return !0;
        return !1;
      };
      goog.object.every = function(a, b, c) {
        for (var d in a) if (!b.call(c, a[d], d, a)) return !1;
        return !0;
      };
      goog.object.getCount = function(a) {
        var b = 0, c;
        for (c in a) b++;
        return b;
      };
      goog.object.getAnyKey = function(a) {
        for (var b in a) return b;
      };
      goog.object.getAnyValue = function(a) {
        for (var b in a) return a[b];
      };
      goog.object.contains = function(a, b) {
        return goog.object.containsValue(a, b);
      };
      goog.object.getValues = function(a) {
        var b = [], c = 0, d;
        for (d in a) b[c++] = a[d];
        return b;
      };
      goog.object.getKeys = function(a) {
        var b = [], c = 0, d;
        for (d in a) b[c++] = d;
        return b;
      };
      goog.object.getValueByKeys = function(a, b) {
        for (var c = goog.isArrayLike(b), d = c ? b : arguments, c = c ? 0 : 1; c < d.length && (a = a[d[c]], 
        goog.isDef(a)); c++) ;
        return a;
      };
      goog.object.containsKey = function(a, b) {
        return null !== a && b in a;
      };
      goog.object.containsValue = function(a, b) {
        for (var c in a) if (a[c] == b) return !0;
        return !1;
      };
      goog.object.findKey = function(a, b, c) {
        for (var d in a) if (b.call(c, a[d], d, a)) return d;
      };
      goog.object.findValue = function(a, b, c) {
        return (b = goog.object.findKey(a, b, c)) && a[b];
      };
      goog.object.isEmpty = function(a) {
        for (var b in a) return !1;
        return !0;
      };
      goog.object.clear = function(a) {
        for (var b in a) delete a[b];
      };
      goog.object.remove = function(a, b) {
        var c;
        (c = b in a) && delete a[b];
        return c;
      };
      goog.object.add = function(a, b, c) {
        if (null !== a && b in a) throw Error('The object already contains the key "' + b + '"');
        goog.object.set(a, b, c);
      };
      goog.object.get = function(a, b, c) {
        return null !== a && b in a ? a[b] : c;
      };
      goog.object.set = function(a, b, c) {
        a[b] = c;
      };
      goog.object.setIfUndefined = function(a, b, c) {
        return b in a ? a[b] : a[b] = c;
      };
      goog.object.setWithReturnValueIfNotSet = function(a, b, c) {
        if (b in a) return a[b];
        c = c();
        return a[b] = c;
      };
      goog.object.equals = function(a, b) {
        for (var c in a) if (!(c in b) || a[c] !== b[c]) return !1;
        for (c in b) if (!(c in a)) return !1;
        return !0;
      };
      goog.object.clone = function(a) {
        var b = {}, c;
        for (c in a) b[c] = a[c];
        return b;
      };
      goog.object.unsafeClone = function(a) {
        var b = goog.typeOf(a);
        if ("object" == b || "array" == b) {
          if (goog.isFunction(a.clone)) return a.clone();
          var b = "array" == b ? [] : {}, c;
          for (c in a) b[c] = goog.object.unsafeClone(a[c]);
          return b;
        }
        return a;
      };
      goog.object.transpose = function(a) {
        var b = {}, c;
        for (c in a) b[a[c]] = c;
        return b;
      };
      goog.object.PROTOTYPE_FIELDS_ = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");
      goog.object.extend = function(a, b) {
        for (var c, d, e = 1; e < arguments.length; e++) {
          d = arguments[e];
          for (c in d) a[c] = d[c];
          for (var f = 0; f < goog.object.PROTOTYPE_FIELDS_.length; f++) c = goog.object.PROTOTYPE_FIELDS_[f], 
          Object.prototype.hasOwnProperty.call(d, c) && (a[c] = d[c]);
        }
      };
      goog.object.create = function(a) {
        var b = arguments.length;
        if (1 == b && goog.isArray(arguments[0])) return goog.object.create.apply(null, arguments[0]);
        if (b % 2) throw Error("Uneven number of arguments");
        for (var c = {}, d = 0; d < b; d += 2) c[arguments[d]] = arguments[d + 1];
        return c;
      };
      goog.object.createSet = function(a) {
        var b = arguments.length;
        if (1 == b && goog.isArray(arguments[0])) return goog.object.createSet.apply(null, arguments[0]);
        for (var c = {}, d = 0; d < b; d++) c[arguments[d]] = !0;
        return c;
      };
      goog.object.createImmutableView = function(a) {
        var b = a;
        Object.isFrozen && !Object.isFrozen(a) && (b = Object.create(a), Object.freeze(b));
        return b;
      };
      goog.object.isImmutableView = function(a) {
        return !!Object.isFrozen && Object.isFrozen(a);
      };
      goog.labs.userAgent.browser = {};
      goog.labs.userAgent.browser.matchOpera_ = function() {
        return goog.labs.userAgent.util.matchUserAgent("Opera") || goog.labs.userAgent.util.matchUserAgent("OPR");
      };
      goog.labs.userAgent.browser.matchIE_ = function() {
        return goog.labs.userAgent.util.matchUserAgent("Trident") || goog.labs.userAgent.util.matchUserAgent("MSIE");
      };
      goog.labs.userAgent.browser.matchEdge_ = function() {
        return goog.labs.userAgent.util.matchUserAgent("Edge");
      };
      goog.labs.userAgent.browser.matchFirefox_ = function() {
        return goog.labs.userAgent.util.matchUserAgent("Firefox");
      };
      goog.labs.userAgent.browser.matchSafari_ = function() {
        return goog.labs.userAgent.util.matchUserAgent("Safari") && !(goog.labs.userAgent.browser.matchChrome_() || goog.labs.userAgent.browser.matchCoast_() || goog.labs.userAgent.browser.matchOpera_() || goog.labs.userAgent.browser.matchEdge_() || goog.labs.userAgent.browser.isSilk() || goog.labs.userAgent.util.matchUserAgent("Android"));
      };
      goog.labs.userAgent.browser.matchCoast_ = function() {
        return goog.labs.userAgent.util.matchUserAgent("Coast");
      };
      goog.labs.userAgent.browser.matchIosWebview_ = function() {
        return (goog.labs.userAgent.util.matchUserAgent("iPad") || goog.labs.userAgent.util.matchUserAgent("iPhone")) && !goog.labs.userAgent.browser.matchSafari_() && !goog.labs.userAgent.browser.matchChrome_() && !goog.labs.userAgent.browser.matchCoast_() && goog.labs.userAgent.util.matchUserAgent("AppleWebKit");
      };
      goog.labs.userAgent.browser.matchChrome_ = function() {
        return (goog.labs.userAgent.util.matchUserAgent("Chrome") || goog.labs.userAgent.util.matchUserAgent("CriOS")) && !goog.labs.userAgent.browser.matchOpera_() && !goog.labs.userAgent.browser.matchEdge_();
      };
      goog.labs.userAgent.browser.matchAndroidBrowser_ = function() {
        return goog.labs.userAgent.util.matchUserAgent("Android") && !(goog.labs.userAgent.browser.isChrome() || goog.labs.userAgent.browser.isFirefox() || goog.labs.userAgent.browser.isOpera() || goog.labs.userAgent.browser.isSilk());
      };
      goog.labs.userAgent.browser.isOpera = goog.labs.userAgent.browser.matchOpera_;
      goog.labs.userAgent.browser.isIE = goog.labs.userAgent.browser.matchIE_;
      goog.labs.userAgent.browser.isEdge = goog.labs.userAgent.browser.matchEdge_;
      goog.labs.userAgent.browser.isFirefox = goog.labs.userAgent.browser.matchFirefox_;
      goog.labs.userAgent.browser.isSafari = goog.labs.userAgent.browser.matchSafari_;
      goog.labs.userAgent.browser.isCoast = goog.labs.userAgent.browser.matchCoast_;
      goog.labs.userAgent.browser.isIosWebview = goog.labs.userAgent.browser.matchIosWebview_;
      goog.labs.userAgent.browser.isChrome = goog.labs.userAgent.browser.matchChrome_;
      goog.labs.userAgent.browser.isAndroidBrowser = goog.labs.userAgent.browser.matchAndroidBrowser_;
      goog.labs.userAgent.browser.isSilk = function() {
        return goog.labs.userAgent.util.matchUserAgent("Silk");
      };
      goog.labs.userAgent.browser.getVersion = function() {
        function a(a) {
          a = goog.array.find(a, d);
          return c[a] || "";
        }
        var b = goog.labs.userAgent.util.getUserAgent();
        if (goog.labs.userAgent.browser.isIE()) return goog.labs.userAgent.browser.getIEVersion_(b);
        var b = goog.labs.userAgent.util.extractVersionTuples(b), c = {};
        goog.array.forEach(b, function(a) {
          c[a[0]] = a[1];
        });
        var d = goog.partial(goog.object.containsKey, c);
        return goog.labs.userAgent.browser.isOpera() ? a([ "Version", "Opera", "OPR" ]) : goog.labs.userAgent.browser.isEdge() ? a([ "Edge" ]) : goog.labs.userAgent.browser.isChrome() ? a([ "Chrome", "CriOS" ]) : (b = b[2]) && b[1] || "";
      };
      goog.labs.userAgent.browser.isVersionOrHigher = function(a) {
        return 0 <= goog.string.compareVersions(goog.labs.userAgent.browser.getVersion(), a);
      };
      goog.labs.userAgent.browser.getIEVersion_ = function(a) {
        var b = /rv: *([\d\.]*)/.exec(a);
        if (b && b[1]) return b[1];
        var b = "", c = /MSIE +([\d\.]+)/.exec(a);
        if (c && c[1]) if (a = /Trident\/(\d.\d)/.exec(a), "7.0" == c[1]) if (a && a[1]) switch (a[1]) {
         case "4.0":
          b = "8.0";
          break;

         case "5.0":
          b = "9.0";
          break;

         case "6.0":
          b = "10.0";
          break;

         case "7.0":
          b = "11.0";
        } else b = "7.0"; else b = c[1];
        return b;
      };
      goog.labs.userAgent.engine = {};
      goog.labs.userAgent.engine.isPresto = function() {
        return goog.labs.userAgent.util.matchUserAgent("Presto");
      };
      goog.labs.userAgent.engine.isTrident = function() {
        return goog.labs.userAgent.util.matchUserAgent("Trident") || goog.labs.userAgent.util.matchUserAgent("MSIE");
      };
      goog.labs.userAgent.engine.isEdge = function() {
        return goog.labs.userAgent.util.matchUserAgent("Edge");
      };
      goog.labs.userAgent.engine.isWebKit = function() {
        return goog.labs.userAgent.util.matchUserAgentIgnoreCase("WebKit") && !goog.labs.userAgent.engine.isEdge();
      };
      goog.labs.userAgent.engine.isGecko = function() {
        return goog.labs.userAgent.util.matchUserAgent("Gecko") && !goog.labs.userAgent.engine.isWebKit() && !goog.labs.userAgent.engine.isTrident() && !goog.labs.userAgent.engine.isEdge();
      };
      goog.labs.userAgent.engine.getVersion = function() {
        var a = goog.labs.userAgent.util.getUserAgent();
        if (a) {
          var a = goog.labs.userAgent.util.extractVersionTuples(a), b = goog.labs.userAgent.engine.getEngineTuple_(a);
          if (b) return "Gecko" == b[0] ? goog.labs.userAgent.engine.getVersionForKey_(a, "Firefox") : b[1];
          var a = a[0], c;
          if (a && (c = a[2]) && (c = /Trident\/([^\s;]+)/.exec(c))) return c[1];
        }
        return "";
      };
      goog.labs.userAgent.engine.getEngineTuple_ = function(a) {
        if (!goog.labs.userAgent.engine.isEdge()) return a[1];
        for (var b = 0; b < a.length; b++) {
          var c = a[b];
          if ("Edge" == c[0]) return c;
        }
      };
      goog.labs.userAgent.engine.isVersionOrHigher = function(a) {
        return 0 <= goog.string.compareVersions(goog.labs.userAgent.engine.getVersion(), a);
      };
      goog.labs.userAgent.engine.getVersionForKey_ = function(a, b) {
        var c = goog.array.find(a, function(a) {
          return b == a[0];
        });
        return c && c[1] || "";
      };
      goog.labs.userAgent.platform = {};
      goog.labs.userAgent.platform.isAndroid = function() {
        return goog.labs.userAgent.util.matchUserAgent("Android");
      };
      goog.labs.userAgent.platform.isIpod = function() {
        return goog.labs.userAgent.util.matchUserAgent("iPod");
      };
      goog.labs.userAgent.platform.isIphone = function() {
        return goog.labs.userAgent.util.matchUserAgent("iPhone") && !goog.labs.userAgent.util.matchUserAgent("iPod") && !goog.labs.userAgent.util.matchUserAgent("iPad");
      };
      goog.labs.userAgent.platform.isIpad = function() {
        return goog.labs.userAgent.util.matchUserAgent("iPad");
      };
      goog.labs.userAgent.platform.isIos = function() {
        return goog.labs.userAgent.platform.isIphone() || goog.labs.userAgent.platform.isIpad() || goog.labs.userAgent.platform.isIpod();
      };
      goog.labs.userAgent.platform.isMacintosh = function() {
        return goog.labs.userAgent.util.matchUserAgent("Macintosh");
      };
      goog.labs.userAgent.platform.isLinux = function() {
        return goog.labs.userAgent.util.matchUserAgent("Linux");
      };
      goog.labs.userAgent.platform.isWindows = function() {
        return goog.labs.userAgent.util.matchUserAgent("Windows");
      };
      goog.labs.userAgent.platform.isChromeOS = function() {
        return goog.labs.userAgent.util.matchUserAgent("CrOS");
      };
      goog.labs.userAgent.platform.getVersion = function() {
        var a = goog.labs.userAgent.util.getUserAgent(), b = "";
        goog.labs.userAgent.platform.isWindows() ? (b = /Windows (?:NT|Phone) ([0-9.]+)/, 
        b = (a = b.exec(a)) ? a[1] : "0.0") : goog.labs.userAgent.platform.isIos() ? (b = /(?:iPhone|iPod|iPad|CPU)\s+OS\s+(\S+)/, 
        b = (a = b.exec(a)) && a[1].replace(/_/g, ".")) : goog.labs.userAgent.platform.isMacintosh() ? (b = /Mac OS X ([0-9_.]+)/, 
        b = (a = b.exec(a)) ? a[1].replace(/_/g, ".") : "10") : goog.labs.userAgent.platform.isAndroid() ? (b = /Android\s+([^\);]+)(\)|;)/, 
        b = (a = b.exec(a)) && a[1]) : goog.labs.userAgent.platform.isChromeOS() && (b = /(?:CrOS\s+(?:i686|x86_64)\s+([0-9.]+))/, 
        b = (a = b.exec(a)) && a[1]);
        return b || "";
      };
      goog.labs.userAgent.platform.isVersionOrHigher = function(a) {
        return 0 <= goog.string.compareVersions(goog.labs.userAgent.platform.getVersion(), a);
      };
      goog.userAgent = {};
      goog.userAgent.ASSUME_IE = !1;
      goog.userAgent.ASSUME_EDGE = !1;
      goog.userAgent.ASSUME_GECKO = !1;
      goog.userAgent.ASSUME_WEBKIT = !1;
      goog.userAgent.ASSUME_MOBILE_WEBKIT = !1;
      goog.userAgent.ASSUME_OPERA = !1;
      goog.userAgent.ASSUME_ANY_VERSION = !1;
      goog.userAgent.BROWSER_KNOWN_ = goog.userAgent.ASSUME_IE || goog.userAgent.ASSUME_EDGE || goog.userAgent.ASSUME_GECKO || goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_OPERA;
      goog.userAgent.getUserAgentString = function() {
        return goog.labs.userAgent.util.getUserAgent();
      };
      goog.userAgent.getNavigator = function() {
        return goog.global.navigator || null;
      };
      goog.userAgent.OPERA = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_OPERA : goog.labs.userAgent.browser.isOpera();
      goog.userAgent.IE = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_IE : goog.labs.userAgent.browser.isIE();
      goog.userAgent.EDGE = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_EDGE : goog.labs.userAgent.engine.isEdge();
      goog.userAgent.EDGE_OR_IE = goog.userAgent.EDGE || goog.userAgent.IE;
      goog.userAgent.GECKO = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_GECKO : goog.labs.userAgent.engine.isGecko();
      goog.userAgent.WEBKIT = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_MOBILE_WEBKIT : goog.labs.userAgent.engine.isWebKit();
      goog.userAgent.isMobile_ = function() {
        return goog.userAgent.WEBKIT && goog.labs.userAgent.util.matchUserAgent("Mobile");
      };
      goog.userAgent.MOBILE = goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.isMobile_();
      goog.userAgent.SAFARI = goog.userAgent.WEBKIT;
      goog.userAgent.determinePlatform_ = function() {
        var a = goog.userAgent.getNavigator();
        return a && a.platform || "";
      };
      goog.userAgent.PLATFORM = goog.userAgent.determinePlatform_();
      goog.userAgent.ASSUME_MAC = !1;
      goog.userAgent.ASSUME_WINDOWS = !1;
      goog.userAgent.ASSUME_LINUX = !1;
      goog.userAgent.ASSUME_X11 = !1;
      goog.userAgent.ASSUME_ANDROID = !1;
      goog.userAgent.ASSUME_IPHONE = !1;
      goog.userAgent.ASSUME_IPAD = !1;
      goog.userAgent.PLATFORM_KNOWN_ = goog.userAgent.ASSUME_MAC || goog.userAgent.ASSUME_WINDOWS || goog.userAgent.ASSUME_LINUX || goog.userAgent.ASSUME_X11 || goog.userAgent.ASSUME_ANDROID || goog.userAgent.ASSUME_IPHONE || goog.userAgent.ASSUME_IPAD;
      goog.userAgent.MAC = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_MAC : goog.labs.userAgent.platform.isMacintosh();
      goog.userAgent.WINDOWS = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_WINDOWS : goog.labs.userAgent.platform.isWindows();
      goog.userAgent.isLegacyLinux_ = function() {
        return goog.labs.userAgent.platform.isLinux() || goog.labs.userAgent.platform.isChromeOS();
      };
      goog.userAgent.LINUX = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_LINUX : goog.userAgent.isLegacyLinux_();
      goog.userAgent.isX11_ = function() {
        var a = goog.userAgent.getNavigator();
        return !!a && goog.string.contains(a.appVersion || "", "X11");
      };
      goog.userAgent.X11 = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_X11 : goog.userAgent.isX11_();
      goog.userAgent.ANDROID = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_ANDROID : goog.labs.userAgent.platform.isAndroid();
      goog.userAgent.IPHONE = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_IPHONE : goog.labs.userAgent.platform.isIphone();
      goog.userAgent.IPAD = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_IPAD : goog.labs.userAgent.platform.isIpad();
      goog.userAgent.operaVersion_ = function() {
        var a = goog.global.opera.version;
        try {
          return a();
        } catch (b) {
          return a;
        }
      };
      goog.userAgent.determineVersion_ = function() {
        if (goog.userAgent.OPERA && goog.global.opera) return goog.userAgent.operaVersion_();
        var a = "", b = goog.userAgent.getVersionRegexResult_();
        b && (a = b ? b[1] : "");
        return goog.userAgent.IE && (b = goog.userAgent.getDocumentMode_(), b > parseFloat(a)) ? String(b) : a;
      };
      goog.userAgent.getVersionRegexResult_ = function() {
        var a = goog.userAgent.getUserAgentString();
        if (goog.userAgent.GECKO) return /rv\:([^\);]+)(\)|;)/.exec(a);
        if (goog.userAgent.EDGE) return /Edge\/([\d\.]+)/.exec(a);
        if (goog.userAgent.IE) return /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);
        if (goog.userAgent.WEBKIT) return /WebKit\/(\S+)/.exec(a);
      };
      goog.userAgent.getDocumentMode_ = function() {
        var a = goog.global.document;
        return a ? a.documentMode : void 0;
      };
      goog.userAgent.VERSION = goog.userAgent.determineVersion_();
      goog.userAgent.compare = function(a, b) {
        return goog.string.compareVersions(a, b);
      };
      goog.userAgent.isVersionOrHigherCache_ = {};
      goog.userAgent.isVersionOrHigher = function(a) {
        return goog.userAgent.ASSUME_ANY_VERSION || goog.userAgent.isVersionOrHigherCache_[a] || (goog.userAgent.isVersionOrHigherCache_[a] = 0 <= goog.string.compareVersions(goog.userAgent.VERSION, a));
      };
      goog.userAgent.isVersion = goog.userAgent.isVersionOrHigher;
      goog.userAgent.isDocumentModeOrHigher = function(a) {
        return Number(goog.userAgent.DOCUMENT_MODE) >= a;
      };
      goog.userAgent.isDocumentMode = goog.userAgent.isDocumentModeOrHigher;
      goog.userAgent.DOCUMENT_MODE = function() {
        var a = goog.global.document, b = goog.userAgent.getDocumentMode_();
        return a && goog.userAgent.IE ? b || ("CSS1Compat" == a.compatMode ? parseInt(goog.userAgent.VERSION, 10) : 5) : void 0;
      }();
      goog.userAgent.product = {};
      goog.userAgent.product.ASSUME_FIREFOX = !1;
      goog.userAgent.product.ASSUME_IPHONE = !1;
      goog.userAgent.product.ASSUME_IPAD = !1;
      goog.userAgent.product.ASSUME_ANDROID = !1;
      goog.userAgent.product.ASSUME_CHROME = !1;
      goog.userAgent.product.ASSUME_SAFARI = !1;
      goog.userAgent.product.PRODUCT_KNOWN_ = goog.userAgent.ASSUME_IE || goog.userAgent.ASSUME_EDGE || goog.userAgent.ASSUME_OPERA || goog.userAgent.product.ASSUME_FIREFOX || goog.userAgent.product.ASSUME_IPHONE || goog.userAgent.product.ASSUME_IPAD || goog.userAgent.product.ASSUME_ANDROID || goog.userAgent.product.ASSUME_CHROME || goog.userAgent.product.ASSUME_SAFARI;
      goog.userAgent.product.OPERA = goog.userAgent.OPERA;
      goog.userAgent.product.IE = goog.userAgent.IE;
      goog.userAgent.product.EDGE = goog.userAgent.EDGE;
      goog.userAgent.product.FIREFOX = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_FIREFOX : goog.labs.userAgent.browser.isFirefox();
      goog.userAgent.product.isIphoneOrIpod_ = function() {
        return goog.labs.userAgent.platform.isIphone() || goog.labs.userAgent.platform.isIpod();
      };
      goog.userAgent.product.IPHONE = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_IPHONE : goog.userAgent.product.isIphoneOrIpod_();
      goog.userAgent.product.IPAD = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_IPAD : goog.labs.userAgent.platform.isIpad();
      goog.userAgent.product.ANDROID = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_ANDROID : goog.labs.userAgent.browser.isAndroidBrowser();
      goog.userAgent.product.CHROME = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_CHROME : goog.labs.userAgent.browser.isChrome();
      goog.userAgent.product.isSafariDesktop_ = function() {
        return goog.labs.userAgent.browser.isSafari() && !goog.labs.userAgent.platform.isIos();
      };
      goog.userAgent.product.SAFARI = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_SAFARI : goog.userAgent.product.isSafariDesktop_();
      goog.crypt.base64 = {};
      goog.crypt.base64.byteToCharMap_ = null;
      goog.crypt.base64.charToByteMap_ = null;
      goog.crypt.base64.byteToCharMapWebSafe_ = null;
      goog.crypt.base64.ENCODED_VALS_BASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      goog.crypt.base64.ENCODED_VALS = goog.crypt.base64.ENCODED_VALS_BASE + "+/=";
      goog.crypt.base64.ENCODED_VALS_WEBSAFE = goog.crypt.base64.ENCODED_VALS_BASE + "-_.";
      goog.crypt.base64.ASSUME_NATIVE_SUPPORT_ = goog.userAgent.GECKO || goog.userAgent.WEBKIT && !goog.userAgent.product.SAFARI || goog.userAgent.OPERA;
      goog.crypt.base64.HAS_NATIVE_ENCODE_ = goog.crypt.base64.ASSUME_NATIVE_SUPPORT_ || "function" == typeof goog.global.btoa;
      goog.crypt.base64.HAS_NATIVE_DECODE_ = goog.crypt.base64.ASSUME_NATIVE_SUPPORT_ || !goog.userAgent.product.SAFARI && !goog.userAgent.IE && "function" == typeof goog.global.atob;
      goog.crypt.base64.encodeByteArray = function(a, b) {
        goog.asserts.assert(goog.isArrayLike(a), "encodeByteArray takes an array as a parameter");
        goog.crypt.base64.init_();
        for (var c = b ? goog.crypt.base64.byteToCharMapWebSafe_ : goog.crypt.base64.byteToCharMap_, d = [], e = 0; e < a.length; e += 3) {
          var f = a[e], g = e + 1 < a.length, h = g ? a[e + 1] : 0, k = e + 2 < a.length, l = k ? a[e + 2] : 0, p = f >> 2, f = (3 & f) << 4 | h >> 4, h = (15 & h) << 2 | l >> 6, l = 63 & l;
          k || (l = 64, g || (h = 64));
          d.push(c[p], c[f], c[h], c[l]);
        }
        return d.join("");
      };
      goog.crypt.base64.encodeString = function(a, b) {
        return goog.crypt.base64.HAS_NATIVE_ENCODE_ && !b ? goog.global.btoa(a) : goog.crypt.base64.encodeByteArray(goog.crypt.stringToByteArray(a), b);
      };
      goog.crypt.base64.decodeString = function(a, b) {
        if (goog.crypt.base64.HAS_NATIVE_DECODE_ && !b) return goog.global.atob(a);
        var c = "";
        goog.crypt.base64.decodeStringInternal_(a, function(a) {
          c += String.fromCharCode(a);
        });
        return c;
      };
      goog.crypt.base64.decodeStringToByteArray = function(a, b) {
        var c = [];
        goog.crypt.base64.decodeStringInternal_(a, function(a) {
          c.push(a);
        });
        return c;
      };
      goog.crypt.base64.decodeStringToUint8Array = function(a) {
        goog.asserts.assert(!goog.userAgent.IE || goog.userAgent.isVersionOrHigher("10"), "Browser does not support typed arrays");
        var b = new Uint8Array(Math.ceil(3 * a.length / 4)), c = 0;
        goog.crypt.base64.decodeStringInternal_(a, function(a) {
          b[c++] = a;
        });
        return b.subarray(0, c);
      };
      goog.crypt.base64.decodeStringInternal_ = function(a, b) {
        function c(b) {
          for (;d < a.length; ) {
            var c = a.charAt(d++), e = goog.crypt.base64.charToByteMap_[c];
            if (null != e) return e;
            if (!goog.string.isEmptyOrWhitespace(c)) throw Error("Unknown base64 encoding at char: " + c);
          }
          return b;
        }
        goog.crypt.base64.init_();
        for (var d = 0; ;) {
          var e = c(-1), f = c(0), g = c(64), h = c(64);
          if (64 === h && -1 === e) break;
          b(e << 2 | f >> 4);
          64 != g && (b(f << 4 & 240 | g >> 2), 64 != h && b(g << 6 & 192 | h));
        }
      };
      goog.crypt.base64.init_ = function() {
        if (!goog.crypt.base64.byteToCharMap_) {
          goog.crypt.base64.byteToCharMap_ = {};
          goog.crypt.base64.charToByteMap_ = {};
          goog.crypt.base64.byteToCharMapWebSafe_ = {};
          for (var a = 0; a < goog.crypt.base64.ENCODED_VALS.length; a++) goog.crypt.base64.byteToCharMap_[a] = goog.crypt.base64.ENCODED_VALS.charAt(a), 
          goog.crypt.base64.charToByteMap_[goog.crypt.base64.byteToCharMap_[a]] = a, goog.crypt.base64.byteToCharMapWebSafe_[a] = goog.crypt.base64.ENCODED_VALS_WEBSAFE.charAt(a), 
          a >= goog.crypt.base64.ENCODED_VALS_BASE.length && (goog.crypt.base64.charToByteMap_[goog.crypt.base64.ENCODED_VALS_WEBSAFE.charAt(a)] = a);
        }
      };
      goog.json = {};
      goog.json.USE_NATIVE_JSON = !1;
      goog.json.isValid = function(a) {
        return !/^\s*$/.test(a) && /^[\],:{}\s\u2028\u2029]*$/.test(a.replace(/\\["\\\/bfnrtu]/g, "@").replace(/(?:"[^"\\\n\r\u2028\u2029\x00-\x08\x0a-\x1f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)[\s\u2028\u2029]*(?=:|,|]|}|$)/g, "]").replace(/(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g, ""));
      };
      goog.json.parse = goog.json.USE_NATIVE_JSON ? goog.global.JSON.parse : function(a) {
        a = String(a);
        if (goog.json.isValid(a)) try {
          return eval("(" + a + ")");
        } catch (b) {}
        throw Error("Invalid JSON string: " + a);
      };
      goog.json.unsafeParse = goog.json.USE_NATIVE_JSON ? goog.global.JSON.parse : function(a) {
        return eval("(" + a + ")");
      };
      goog.json.serialize = goog.json.USE_NATIVE_JSON ? goog.global.JSON.stringify : function(a, b) {
        return new goog.json.Serializer(b).serialize(a);
      };
      goog.json.Serializer = function(a) {
        this.replacer_ = a;
      };
      goog.json.Serializer.prototype.serialize = function(a) {
        var b = [];
        this.serializeInternal(a, b);
        return b.join("");
      };
      goog.json.Serializer.prototype.serializeInternal = function(a, b) {
        if (null == a) b.push("null"); else {
          if ("object" == ("undefined" === typeof a ? "undefined" : _typeof(a))) {
            if (goog.isArray(a)) {
              this.serializeArray(a, b);
              return;
            }
            if (!(a instanceof String || a instanceof Number || a instanceof Boolean)) {
              this.serializeObject_(a, b);
              return;
            }
            a = a.valueOf();
          }
          switch ("undefined" === typeof a ? "undefined" : _typeof(a)) {
           case "string":
            this.serializeString_(a, b);
            break;

           case "number":
            this.serializeNumber_(a, b);
            break;

           case "boolean":
            b.push(String(a));
            break;

           case "function":
            b.push("null");
            break;

           default:
            throw Error("Unknown type: " + ("undefined" === typeof a ? "undefined" : _typeof(a)));
          }
        }
      };
      goog.json.Serializer.charToJsonCharCache_ = {
        '"': '\\"',
        "\\": "\\\\",
        "/": "\\/",
        "\b": "\\b",
        "\f": "\\f",
        "\n": "\\n",
        "\r": "\\r",
        "\t": "\\t",
        "\v": "\\u000b"
      };
      goog.json.Serializer.charsToReplace_ = /\uffff/.test("￿") ? /[\\\"\x00-\x1f\x7f-\uffff]/g : /[\\\"\x00-\x1f\x7f-\xff]/g;
      goog.json.Serializer.prototype.serializeString_ = function(a, b) {
        b.push('"', a.replace(goog.json.Serializer.charsToReplace_, function(a) {
          var b = goog.json.Serializer.charToJsonCharCache_[a];
          b || (b = "\\u" + (65536 | a.charCodeAt(0)).toString(16).substr(1), goog.json.Serializer.charToJsonCharCache_[a] = b);
          return b;
        }), '"');
      };
      goog.json.Serializer.prototype.serializeNumber_ = function(a, b) {
        b.push(isFinite(a) && !isNaN(a) ? String(a) : "null");
      };
      goog.json.Serializer.prototype.serializeArray = function(a, b) {
        var c = a.length;
        b.push("[");
        for (var d = "", e = 0; e < c; e++) b.push(d), d = a[e], this.serializeInternal(this.replacer_ ? this.replacer_.call(a, String(e), d) : d, b), 
        d = ",";
        b.push("]");
      };
      goog.json.Serializer.prototype.serializeObject_ = function(a, b) {
        b.push("{");
        var c = "", d;
        for (d in a) if (Object.prototype.hasOwnProperty.call(a, d)) {
          var e = a[d];
          "function" != typeof e && (b.push(c), this.serializeString_(d, b), b.push(":"), 
          this.serializeInternal(this.replacer_ ? this.replacer_.call(a, d, e) : e, b), c = ",");
        }
        b.push("}");
      };
      var jspb = {
        Map: function Map(a, b) {
          this.arr_ = a;
          this.valueCtor_ = b;
          this.map_ = {};
          this.arrClean = !0;
          0 < this.arr_.length && this.loadFromArray_();
        }
      };
      jspb.Map.prototype.loadFromArray_ = function() {
        for (var a = 0; a < this.arr_.length; a++) {
          var b = this.arr_[a], c = b[0];
          this.map_[c.toString()] = new jspb.Map.Entry_(c, b[1]);
        }
        this.arrClean = !0;
      };
      jspb.Map.prototype.toArray = function() {
        if (this.arrClean) {
          if (this.valueCtor_) {
            var a = this.map_, b;
            for (b in a) if (Object.prototype.hasOwnProperty.call(a, b)) {
              var c = a[b].valueWrapper;
              c && c.toArray();
            }
          }
        } else {
          this.arr_.length = 0;
          a = this.stringKeys_();
          a.sort();
          for (b = 0; b < a.length; b++) {
            var d = this.map_[a[b]];
            (c = d.valueWrapper) && c.toArray();
            this.arr_.push([ d.key, d.value ]);
          }
          this.arrClean = !0;
        }
        return this.arr_;
      };
      jspb.Map.prototype.toObject = function(a, b) {
        for (var c = this.toArray(), d = [], e = 0; e < c.length; e++) {
          var f = this.map_[c[e][0].toString()];
          this.wrapEntry_(f);
          var g = f.valueWrapper;
          g ? (goog.asserts.assert(b), d.push([ f.key, b(a, g) ])) : d.push([ f.key, f.value ]);
        }
        return d;
      };
      jspb.Map.fromObject = function(a, b, c) {
        b = new jspb.Map([], b);
        for (var d = 0; d < a.length; d++) {
          var e = a[d][0], f = c(a[d][1]);
          b.set(e, f);
        }
        return b;
      };
      jspb.Map.ArrayIteratorIterable_ = function(a) {
        this.idx_ = 0;
        this.arr_ = a;
      };
      jspb.Map.ArrayIteratorIterable_.prototype.next = function() {
        return this.idx_ < this.arr_.length ? {
          done: !1,
          value: this.arr_[this.idx_++]
        } : {
          done: !0,
          value: void 0
        };
      };
      $jscomp.initSymbol();
      "undefined" != typeof Symbol && ($jscomp.initSymbol(), $jscomp.initSymbolIterator(), 
      jspb.Map.ArrayIteratorIterable_.prototype[Symbol.iterator] = function() {
        return this;
      });
      jspb.Map.prototype.getLength = function() {
        return this.stringKeys_().length;
      };
      jspb.Map.prototype.clear = function() {
        this.map_ = {};
        this.arrClean = !1;
      };
      jspb.Map.prototype.del = function(a) {
        a = a.toString();
        var b = this.map_.hasOwnProperty(a);
        delete this.map_[a];
        this.arrClean = !1;
        return b;
      };
      jspb.Map.prototype.getEntryList = function() {
        var a = [], b = this.stringKeys_();
        b.sort();
        for (var c = 0; c < b.length; c++) {
          var d = this.map_[b[c]];
          a.push([ d.key, d.value ]);
        }
        return a;
      };
      jspb.Map.prototype.entries = function() {
        var a = [], b = this.stringKeys_();
        b.sort();
        for (var c = 0; c < b.length; c++) {
          var d = this.map_[b[c]];
          a.push([ d.key, this.wrapEntry_(d) ]);
        }
        return new jspb.Map.ArrayIteratorIterable_(a);
      };
      jspb.Map.prototype.keys = function() {
        var a = [], b = this.stringKeys_();
        b.sort();
        for (var c = 0; c < b.length; c++) a.push(this.map_[b[c]].key);
        return new jspb.Map.ArrayIteratorIterable_(a);
      };
      jspb.Map.prototype.values = function() {
        var a = [], b = this.stringKeys_();
        b.sort();
        for (var c = 0; c < b.length; c++) a.push(this.wrapEntry_(this.map_[b[c]]));
        return new jspb.Map.ArrayIteratorIterable_(a);
      };
      jspb.Map.prototype.forEach = function(a, b) {
        var c = this.stringKeys_();
        c.sort();
        for (var d = 0; d < c.length; d++) {
          var e = this.map_[c[d]];
          a.call(b, this.wrapEntry_(e), e.key, this);
        }
      };
      jspb.Map.prototype.set = function(a, b) {
        var c = new jspb.Map.Entry_(a);
        this.valueCtor_ ? (c.valueWrapper = b, c.value = b.toArray()) : c.value = b;
        this.map_[a.toString()] = c;
        this.arrClean = !1;
        return this;
      };
      jspb.Map.prototype.wrapEntry_ = function(a) {
        return this.valueCtor_ ? (a.valueWrapper || (a.valueWrapper = new this.valueCtor_(a.value)), 
        a.valueWrapper) : a.value;
      };
      jspb.Map.prototype.get = function(a) {
        if (a = this.map_[a.toString()]) return this.wrapEntry_(a);
      };
      jspb.Map.prototype.has = function(a) {
        return a.toString() in this.map_;
      };
      jspb.Map.prototype.serializeBinary = function(a, b, c, d, e) {
        var f = this.stringKeys_();
        f.sort();
        for (var g = 0; g < f.length; g++) {
          var h = this.map_[f[g]];
          b.beginSubMessage(a);
          c.call(b, 1, h.key);
          this.valueCtor_ ? d.call(b, 2, this.wrapEntry_(h), e) : d.call(b, 2, h.value);
          b.endSubMessage();
        }
      };
      jspb.Map.deserializeBinary = function(a, b, c, d, e) {
        for (var f = void 0, g = void 0; b.nextField() && !b.isEndGroup(); ) {
          var h = b.getFieldNumber();
          1 == h ? f = c.call(b) : 2 == h && (a.valueCtor_ ? (g = new a.valueCtor_(), d.call(b, g, e)) : g = d.call(b));
        }
        goog.asserts.assert(void 0 != f);
        goog.asserts.assert(void 0 != g);
        a.set(f, g);
      };
      jspb.Map.prototype.stringKeys_ = function() {
        var a = this.map_, b = [], c;
        for (c in a) Object.prototype.hasOwnProperty.call(a, c) && b.push(c);
        return b;
      };
      jspb.Map.Entry_ = function(a, b) {
        this.key = a;
        this.value = b;
        this.valueWrapper = void 0;
      };
      jspb.ExtensionFieldInfo = function(a, b, c, d, e) {
        this.fieldIndex = a;
        this.fieldName = b;
        this.ctor = c;
        this.toObjectFn = d;
        this.isRepeated = e;
      };
      jspb.ExtensionFieldBinaryInfo = function(a, b, c, d, e, f) {
        this.fieldInfo = a;
        this.binaryReaderFn = b;
        this.binaryWriterFn = c;
        this.binaryMessageSerializeFn = d;
        this.binaryMessageDeserializeFn = e;
        this.isPacked = f;
      };
      jspb.ExtensionFieldInfo.prototype.isMessageType = function() {
        return !!this.ctor;
      };
      jspb.Message = function() {};
      jspb.Message.GENERATE_TO_OBJECT = !0;
      jspb.Message.GENERATE_FROM_OBJECT = !goog.DISALLOW_TEST_ONLY_CODE;
      jspb.Message.GENERATE_TO_STRING = !0;
      jspb.Message.ASSUME_LOCAL_ARRAYS = !1;
      jspb.Message.MINIMIZE_MEMORY_ALLOCATIONS = COMPILED;
      jspb.Message.SUPPORTS_UINT8ARRAY_ = "function" == typeof Uint8Array;
      jspb.Message.prototype.getJsPbMessageId = function() {
        return this.messageId_;
      };
      jspb.Message.getIndex_ = function(a, b) {
        return b + a.arrayIndexOffset_;
      };
      jspb.Message.initialize = function(a, b, c, d, e, f) {
        a.wrappers_ = jspb.Message.MINIMIZE_MEMORY_ALLOCATIONS ? null : {};
        b || (b = c ? [ c ] : []);
        a.messageId_ = c ? String(c) : void 0;
        a.arrayIndexOffset_ = 0 === c ? -1 : 0;
        a.array = b;
        jspb.Message.materializeExtensionObject_(a, d);
        a.convertedFloatingPointFields_ = {};
        if (e) for (b = 0; b < e.length; b++) c = e[b], c < a.pivot_ ? (c = jspb.Message.getIndex_(a, c), 
        a.array[c] = a.array[c] || (jspb.Message.MINIMIZE_MEMORY_ALLOCATIONS ? jspb.Message.EMPTY_LIST_SENTINEL_ : [])) : a.extensionObject_[c] = a.extensionObject_[c] || (jspb.Message.MINIMIZE_MEMORY_ALLOCATIONS ? jspb.Message.EMPTY_LIST_SENTINEL_ : []);
        f && f.length && goog.array.forEach(f, goog.partial(jspb.Message.computeOneofCase, a));
      };
      jspb.Message.EMPTY_LIST_SENTINEL_ = goog.DEBUG && Object.freeze ? Object.freeze([]) : [];
      jspb.Message.isArray_ = function(a) {
        return jspb.Message.ASSUME_LOCAL_ARRAYS ? a instanceof Array : goog.isArray(a);
      };
      jspb.Message.materializeExtensionObject_ = function(a, b) {
        if (a.array.length) {
          var c = a.array.length - 1, d = a.array[c];
          if (d && "object" == ("undefined" === typeof d ? "undefined" : _typeof(d)) && !jspb.Message.isArray_(d) && !(jspb.Message.SUPPORTS_UINT8ARRAY_ && d instanceof Uint8Array)) {
            a.pivot_ = c - a.arrayIndexOffset_;
            a.extensionObject_ = d;
            return;
          }
        }
        -1 < b ? (a.pivot_ = b, c = jspb.Message.getIndex_(a, b), a.extensionObject_ = jspb.Message.MINIMIZE_MEMORY_ALLOCATIONS ? null : a.array[c] = {}) : a.pivot_ = Number.MAX_VALUE;
      };
      jspb.Message.maybeInitEmptyExtensionObject_ = function(a) {
        var b = jspb.Message.getIndex_(a, a.pivot_);
        a.array[b] || (a.extensionObject_ = a.array[b] = {});
      };
      jspb.Message.toObjectList = function(a, b, c) {
        for (var d = [], e = 0; e < a.length; e++) d[e] = b.call(a[e], c, a[e]);
        return d;
      };
      jspb.Message.toObjectExtension = function(a, b, c, d, e) {
        for (var f in c) {
          var g = c[f], h = d.call(a, g);
          if (h) {
            for (var k in g.fieldName) if (g.fieldName.hasOwnProperty(k)) break;
            b[k] = g.toObjectFn ? g.isRepeated ? jspb.Message.toObjectList(h, g.toObjectFn, e) : g.toObjectFn(e, h) : h;
          }
        }
      };
      jspb.Message.serializeBinaryExtensions = function(a, b, c, d) {
        for (var e in c) {
          var f = c[e], g = f.fieldInfo;
          if (!f.binaryWriterFn) throw Error("Message extension present that was generated without binary serialization support");
          var h = d.call(a, g);
          if (h) if (g.isMessageType()) {
            if (!f.binaryMessageSerializeFn) throw Error("Message extension present holding submessage without binary support enabled, and message is being serialized to binary format");
            f.binaryWriterFn.call(b, g.fieldIndex, h, f.binaryMessageSerializeFn);
          } else f.binaryWriterFn.call(b, g.fieldIndex, h);
        }
      };
      jspb.Message.readBinaryExtension = function(a, b, c, d, e) {
        var f = c[b.getFieldNumber()];
        if (f) {
          c = f.fieldInfo;
          if (!f.binaryReaderFn) throw Error("Deserializing extension whose generated code does not support binary format");
          var g;
          c.isMessageType() ? (g = new c.ctor(), f.binaryReaderFn.call(b, g, f.binaryMessageDeserializeFn)) : g = f.binaryReaderFn.call(b);
          c.isRepeated && !f.isPacked ? (b = d.call(a, c)) ? b.push(g) : e.call(a, c, [ g ]) : e.call(a, c, g);
        } else b.skipField();
      };
      jspb.Message.getField = function(a, b) {
        if (b < a.pivot_) {
          var c = jspb.Message.getIndex_(a, b), d = a.array[c];
          return d === jspb.Message.EMPTY_LIST_SENTINEL_ ? a.array[c] = [] : d;
        }
        d = a.extensionObject_[b];
        return d === jspb.Message.EMPTY_LIST_SENTINEL_ ? a.extensionObject_[b] = [] : d;
      };
      jspb.Message.getOptionalFloatingPointField = function(a, b) {
        var c = jspb.Message.getField(a, b);
        return null == c ? c : +c;
      };
      jspb.Message.getRepeatedFloatingPointField = function(a, b) {
        var c = jspb.Message.getField(a, b);
        a.convertedFloatingPointFields_ || (a.convertedFloatingPointFields_ = {});
        if (!a.convertedFloatingPointFields_[b]) {
          for (var d = 0; d < c.length; d++) c[d] = +c[d];
          a.convertedFloatingPointFields_[b] = !0;
        }
        return c;
      };
      jspb.Message.bytesAsB64 = function(a) {
        if (null == a || goog.isString(a)) return a;
        if (jspb.Message.SUPPORTS_UINT8ARRAY_ && a instanceof Uint8Array) return goog.crypt.base64.encodeByteArray(a);
        goog.asserts.fail("Cannot coerce to b64 string: " + goog.typeOf(a));
        return null;
      };
      jspb.Message.bytesAsU8 = function(a) {
        if (null == a || a instanceof Uint8Array) return a;
        if (goog.isString(a)) return goog.crypt.base64.decodeStringToUint8Array(a);
        goog.asserts.fail("Cannot coerce to Uint8Array: " + goog.typeOf(a));
        return null;
      };
      jspb.Message.bytesListAsB64 = function(a) {
        jspb.Message.assertConsistentTypes_(a);
        return !a.length || goog.isString(a[0]) ? a : goog.array.map(a, jspb.Message.bytesAsB64);
      };
      jspb.Message.bytesListAsU8 = function(a) {
        jspb.Message.assertConsistentTypes_(a);
        return !a.length || a[0] instanceof Uint8Array ? a : goog.array.map(a, jspb.Message.bytesAsU8);
      };
      jspb.Message.assertConsistentTypes_ = function(a) {
        if (goog.DEBUG && a && 1 < a.length) {
          var b = goog.typeOf(a[0]);
          goog.array.forEach(a, function(a) {
            goog.typeOf(a) != b && goog.asserts.fail("Inconsistent type in JSPB repeated field array. Got " + goog.typeOf(a) + " expected " + b);
          });
        }
      };
      jspb.Message.getFieldWithDefault = function(a, b, c) {
        a = jspb.Message.getField(a, b);
        return null == a ? c : a;
      };
      jspb.Message.getFieldProto3 = jspb.Message.getFieldWithDefault;
      jspb.Message.getMapField = function(a, b, c, d) {
        a.wrappers_ || (a.wrappers_ = {});
        if (b in a.wrappers_) return a.wrappers_[b];
        if (!c) return c = jspb.Message.getField(a, b), c || (c = [], jspb.Message.setField(a, b, c)), 
        a.wrappers_[b] = new jspb.Map(c, d);
      };
      jspb.Message.setField = function(a, b, c) {
        b < a.pivot_ ? a.array[jspb.Message.getIndex_(a, b)] = c : a.extensionObject_[b] = c;
      };
      jspb.Message.addToRepeatedField = function(a, b, c, d) {
        a = jspb.Message.getField(a, b);
        void 0 != d ? a.splice(d, 0, c) : a.push(c);
      };
      jspb.Message.setOneofField = function(a, b, c, d) {
        (c = jspb.Message.computeOneofCase(a, c)) && c !== b && void 0 !== d && (a.wrappers_ && c in a.wrappers_ && (a.wrappers_[c] = void 0), 
        jspb.Message.setField(a, c, void 0));
        jspb.Message.setField(a, b, d);
      };
      jspb.Message.computeOneofCase = function(a, b) {
        var c, d;
        goog.array.forEach(b, function(b) {
          var f = jspb.Message.getField(a, b);
          goog.isDefAndNotNull(f) && (c = b, d = f, jspb.Message.setField(a, b, void 0));
        });
        return c ? (jspb.Message.setField(a, c, d), c) : 0;
      };
      jspb.Message.getWrapperField = function(a, b, c, d) {
        a.wrappers_ || (a.wrappers_ = {});
        if (!a.wrappers_[c]) {
          var e = jspb.Message.getField(a, c);
          (d || e) && (a.wrappers_[c] = new b(e));
        }
        return a.wrappers_[c];
      };
      jspb.Message.getRepeatedWrapperField = function(a, b, c) {
        jspb.Message.wrapRepeatedField_(a, b, c);
        b = a.wrappers_[c];
        b == jspb.Message.EMPTY_LIST_SENTINEL_ && (b = a.wrappers_[c] = []);
        return b;
      };
      jspb.Message.wrapRepeatedField_ = function(a, b, c) {
        a.wrappers_ || (a.wrappers_ = {});
        if (!a.wrappers_[c]) {
          for (var d = jspb.Message.getField(a, c), e = [], f = 0; f < d.length; f++) e[f] = new b(d[f]);
          a.wrappers_[c] = e;
        }
      };
      jspb.Message.setWrapperField = function(a, b, c) {
        a.wrappers_ || (a.wrappers_ = {});
        var d = c ? c.toArray() : c;
        a.wrappers_[b] = c;
        jspb.Message.setField(a, b, d);
      };
      jspb.Message.setOneofWrapperField = function(a, b, c, d) {
        a.wrappers_ || (a.wrappers_ = {});
        var e = d ? d.toArray() : d;
        a.wrappers_[b] = d;
        jspb.Message.setOneofField(a, b, c, e);
      };
      jspb.Message.setRepeatedWrapperField = function(a, b, c) {
        a.wrappers_ || (a.wrappers_ = {});
        c = c || [];
        for (var d = [], e = 0; e < c.length; e++) d[e] = c[e].toArray();
        a.wrappers_[b] = c;
        jspb.Message.setField(a, b, d);
      };
      jspb.Message.addToRepeatedWrapperField = function(a, b, c, d, e) {
        jspb.Message.wrapRepeatedField_(a, d, b);
        var f = a.wrappers_[b];
        f || (f = a.wrappers_[b] = []);
        c = c || new d();
        a = jspb.Message.getField(a, b);
        void 0 != e ? (f.splice(e, 0, c), a.splice(e, 0, c.toArray())) : (f.push(c), a.push(c.toArray()));
        return c;
      };
      jspb.Message.toMap = function(a, b, c, d) {
        for (var e = {}, f = 0; f < a.length; f++) e[b.call(a[f])] = c ? c.call(a[f], d, a[f]) : a[f];
        return e;
      };
      jspb.Message.prototype.syncMapFields_ = function() {
        if (this.wrappers_) for (var a in this.wrappers_) {
          var b = this.wrappers_[a];
          if (goog.isArray(b)) for (var c = 0; c < b.length; c++) b[c] && b[c].toArray(); else b && b.toArray();
        }
      };
      jspb.Message.prototype.toArray = function() {
        this.syncMapFields_();
        return this.array;
      };
      jspb.Message.GENERATE_TO_STRING && (jspb.Message.prototype.toString = function() {
        this.syncMapFields_();
        return this.array.toString();
      });
      jspb.Message.prototype.getExtension = function(a) {
        if (this.extensionObject_) {
          this.wrappers_ || (this.wrappers_ = {});
          var b = a.fieldIndex;
          if (a.isRepeated) {
            if (a.isMessageType()) return this.wrappers_[b] || (this.wrappers_[b] = goog.array.map(this.extensionObject_[b] || [], function(b) {
              return new a.ctor(b);
            })), this.wrappers_[b];
          } else if (a.isMessageType()) return !this.wrappers_[b] && this.extensionObject_[b] && (this.wrappers_[b] = new a.ctor(this.extensionObject_[b])), 
          this.wrappers_[b];
          return this.extensionObject_[b];
        }
      };
      jspb.Message.prototype.setExtension = function(a, b) {
        this.wrappers_ || (this.wrappers_ = {});
        jspb.Message.maybeInitEmptyExtensionObject_(this);
        var c = a.fieldIndex;
        a.isRepeated ? (b = b || [], a.isMessageType() ? (this.wrappers_[c] = b, this.extensionObject_[c] = goog.array.map(b, function(a) {
          return a.toArray();
        })) : this.extensionObject_[c] = b) : a.isMessageType() ? (this.wrappers_[c] = b, 
        this.extensionObject_[c] = b ? b.toArray() : b) : this.extensionObject_[c] = b;
        return this;
      };
      jspb.Message.difference = function(a, b) {
        if (!(a instanceof b.constructor)) throw Error("Messages have different types.");
        var c = a.toArray(), d = b.toArray(), e = [], f = 0, g = c.length > d.length ? c.length : d.length;
        a.getJsPbMessageId() && (e[0] = a.getJsPbMessageId(), f = 1);
        for (;f < g; f++) jspb.Message.compareFields(c[f], d[f]) || (e[f] = d[f]);
        return new a.constructor(e);
      };
      jspb.Message.equals = function(a, b) {
        return a == b || !(!a || !b) && a instanceof b.constructor && jspb.Message.compareFields(a.toArray(), b.toArray());
      };
      jspb.Message.compareExtensions = function(a, b) {
        a = a || {};
        b = b || {};
        var c = {}, d;
        for (d in a) c[d] = 0;
        for (d in b) c[d] = 0;
        for (d in c) if (!jspb.Message.compareFields(a[d], b[d])) return !1;
        return !0;
      };
      jspb.Message.compareFields = function(a, b) {
        if (a == b) return !0;
        if (!goog.isObject(a) || !goog.isObject(b) || a.constructor != b.constructor) return !1;
        if (jspb.Message.SUPPORTS_UINT8ARRAY_ && a.constructor === Uint8Array) {
          if (a.length != b.length) return !1;
          for (var c = 0; c < a.length; c++) if (a[c] != b[c]) return !1;
          return !0;
        }
        if (a.constructor === Array) {
          for (var d = void 0, e = void 0, f = Math.max(a.length, b.length), c = 0; c < f; c++) {
            var g = a[c], h = b[c];
            g && g.constructor == Object && (goog.asserts.assert(void 0 === d), goog.asserts.assert(c === a.length - 1), 
            d = g, g = void 0);
            h && h.constructor == Object && (goog.asserts.assert(void 0 === e), goog.asserts.assert(c === b.length - 1), 
            e = h, h = void 0);
            if (!jspb.Message.compareFields(g, h)) return !1;
          }
          return !d && !e || (d = d || {}, e = e || {}, jspb.Message.compareExtensions(d, e));
        }
        if (a.constructor === Object) return jspb.Message.compareExtensions(a, b);
        throw Error("Invalid type in JSPB array");
      };
      jspb.Message.prototype.cloneMessage = function() {
        return jspb.Message.cloneMessage(this);
      };
      jspb.Message.prototype.clone = function() {
        return jspb.Message.cloneMessage(this);
      };
      jspb.Message.clone = function(a) {
        return jspb.Message.cloneMessage(a);
      };
      jspb.Message.cloneMessage = function(a) {
        return new a.constructor(jspb.Message.clone_(a.toArray()));
      };
      jspb.Message.copyInto = function(a, b) {
        goog.asserts.assertInstanceof(a, jspb.Message);
        goog.asserts.assertInstanceof(b, jspb.Message);
        goog.asserts.assert(a.constructor == b.constructor, "Copy source and target message should have the same type.");
        for (var c = jspb.Message.clone(a), d = b.toArray(), e = c.toArray(), f = d.length = 0; f < e.length; f++) d[f] = e[f];
        b.wrappers_ = c.wrappers_;
        b.extensionObject_ = c.extensionObject_;
      };
      jspb.Message.clone_ = function(a) {
        var b;
        if (goog.isArray(a)) {
          for (var c = Array(a.length), d = 0; d < a.length; d++) null != (b = a[d]) && (c[d] = "object" == ("undefined" === typeof b ? "undefined" : _typeof(b)) ? jspb.Message.clone_(b) : b);
          return c;
        }
        if (jspb.Message.SUPPORTS_UINT8ARRAY_ && a instanceof Uint8Array) return new Uint8Array(a);
        c = {};
        for (d in a) null != (b = a[d]) && (c[d] = "object" == ("undefined" === typeof b ? "undefined" : _typeof(b)) ? jspb.Message.clone_(b) : b);
        return c;
      };
      jspb.Message.registerMessageType = function(a, b) {
        jspb.Message.registry_[a] = b;
        b.messageId = a;
      };
      jspb.Message.registry_ = {};
      jspb.Message.messageSetExtensions = {};
      jspb.Message.messageSetExtensionsBinary = {};
      jspb.BinaryConstants = {};
      jspb.ConstBinaryMessage = function() {};
      jspb.BinaryMessage = function() {};
      jspb.BinaryConstants.FieldType = {
        INVALID: -1,
        DOUBLE: 1,
        FLOAT: 2,
        INT64: 3,
        UINT64: 4,
        INT32: 5,
        FIXED64: 6,
        FIXED32: 7,
        BOOL: 8,
        STRING: 9,
        GROUP: 10,
        MESSAGE: 11,
        BYTES: 12,
        UINT32: 13,
        ENUM: 14,
        SFIXED32: 15,
        SFIXED64: 16,
        SINT32: 17,
        SINT64: 18,
        FHASH64: 30,
        VHASH64: 31
      };
      jspb.BinaryConstants.WireType = {
        INVALID: -1,
        VARINT: 0,
        FIXED64: 1,
        DELIMITED: 2,
        START_GROUP: 3,
        END_GROUP: 4,
        FIXED32: 5
      };
      jspb.BinaryConstants.FieldTypeToWireType = function(a) {
        var b = jspb.BinaryConstants.FieldType, c = jspb.BinaryConstants.WireType;
        switch (a) {
         case b.INT32:
         case b.INT64:
         case b.UINT32:
         case b.UINT64:
         case b.SINT32:
         case b.SINT64:
         case b.BOOL:
         case b.ENUM:
         case b.VHASH64:
          return c.VARINT;

         case b.DOUBLE:
         case b.FIXED64:
         case b.SFIXED64:
         case b.FHASH64:
          return c.FIXED64;

         case b.STRING:
         case b.MESSAGE:
         case b.BYTES:
          return c.DELIMITED;

         case b.FLOAT:
         case b.FIXED32:
         case b.SFIXED32:
          return c.FIXED32;

         default:
          return c.INVALID;
        }
      };
      jspb.BinaryConstants.INVALID_FIELD_NUMBER = -1;
      jspb.BinaryConstants.FLOAT32_EPS = 1.401298464324817e-45;
      jspb.BinaryConstants.FLOAT32_MIN = 1.1754943508222875e-38;
      jspb.BinaryConstants.FLOAT32_MAX = 3.4028234663852886e38;
      jspb.BinaryConstants.FLOAT64_EPS = 5e-324;
      jspb.BinaryConstants.FLOAT64_MIN = 2.2250738585072014e-308;
      jspb.BinaryConstants.FLOAT64_MAX = 1.7976931348623157e308;
      jspb.BinaryConstants.TWO_TO_20 = 1048576;
      jspb.BinaryConstants.TWO_TO_23 = 8388608;
      jspb.BinaryConstants.TWO_TO_31 = 2147483648;
      jspb.BinaryConstants.TWO_TO_32 = 4294967296;
      jspb.BinaryConstants.TWO_TO_52 = 4503599627370496;
      jspb.BinaryConstants.TWO_TO_63 = 0x8000000000000000;
      jspb.BinaryConstants.TWO_TO_64 = 0x10000000000000000;
      jspb.BinaryConstants.ZERO_HASH = "\0\0\0\0\0\0\0\0";
      jspb.utils = {};
      jspb.utils.split64Low = 0;
      jspb.utils.split64High = 0;
      jspb.utils.splitUint64 = function(a) {
        var b = a >>> 0;
        a = Math.floor((a - b) / jspb.BinaryConstants.TWO_TO_32) >>> 0;
        jspb.utils.split64Low = b;
        jspb.utils.split64High = a;
      };
      jspb.utils.splitInt64 = function(a) {
        var b = 0 > a;
        a = Math.abs(a);
        var c = a >>> 0;
        a = Math.floor((a - c) / jspb.BinaryConstants.TWO_TO_32);
        a >>>= 0;
        b && (a = ~a >>> 0, c = 1 + (~c >>> 0), 4294967295 < c && (c = 0, a++, 4294967295 < a && (a = 0)));
        jspb.utils.split64Low = c;
        jspb.utils.split64High = a;
      };
      jspb.utils.splitZigzag64 = function(a) {
        var b = 0 > a;
        a = 2 * Math.abs(a);
        jspb.utils.splitUint64(a);
        a = jspb.utils.split64Low;
        var c = jspb.utils.split64High;
        b && (0 == a ? 0 == c ? c = a = 4294967295 : (c--, a = 4294967295) : a--);
        jspb.utils.split64Low = a;
        jspb.utils.split64High = c;
      };
      jspb.utils.splitFloat32 = function(a) {
        var b = 0 > a ? 1 : 0;
        a = b ? -a : a;
        var c;
        0 === a ? 0 < 1 / a ? (jspb.utils.split64High = 0, jspb.utils.split64Low = 0) : (jspb.utils.split64High = 0, 
        jspb.utils.split64Low = 2147483648) : isNaN(a) ? (jspb.utils.split64High = 0, jspb.utils.split64Low = 2147483647) : a > jspb.BinaryConstants.FLOAT32_MAX ? (jspb.utils.split64High = 0, 
        jspb.utils.split64Low = (b << 31 | 2139095040) >>> 0) : a < jspb.BinaryConstants.FLOAT32_MIN ? (a = Math.round(a / Math.pow(2, -149)), 
        jspb.utils.split64High = 0, jspb.utils.split64Low = (b << 31 | a) >>> 0) : (c = Math.floor(Math.log(a) / Math.LN2), 
        a *= Math.pow(2, -c), a = 8388607 & Math.round(a * jspb.BinaryConstants.TWO_TO_23), 
        jspb.utils.split64High = 0, jspb.utils.split64Low = (b << 31 | c + 127 << 23 | a) >>> 0);
      };
      jspb.utils.splitFloat64 = function(a) {
        var b = 0 > a ? 1 : 0;
        a = b ? -a : a;
        if (0 === a) jspb.utils.split64High = 0 < 1 / a ? 0 : 2147483648, jspb.utils.split64Low = 0; else if (isNaN(a)) jspb.utils.split64High = 2147483647, 
        jspb.utils.split64Low = 4294967295; else if (a > jspb.BinaryConstants.FLOAT64_MAX) jspb.utils.split64High = (b << 31 | 2146435072) >>> 0, 
        jspb.utils.split64Low = 0; else if (a < jspb.BinaryConstants.FLOAT64_MIN) {
          var c = a / Math.pow(2, -1074);
          a = c / jspb.BinaryConstants.TWO_TO_32;
          jspb.utils.split64High = (b << 31 | a) >>> 0;
          jspb.utils.split64Low = c >>> 0;
        } else {
          var d = Math.floor(Math.log(a) / Math.LN2);
          1024 == d && (d = 1023);
          c = a * Math.pow(2, -d);
          a = c * jspb.BinaryConstants.TWO_TO_20 & 1048575;
          c = c * jspb.BinaryConstants.TWO_TO_52 >>> 0;
          jspb.utils.split64High = (b << 31 | d + 1023 << 20 | a) >>> 0;
          jspb.utils.split64Low = c;
        }
      };
      jspb.utils.splitHash64 = function(a) {
        var b = a.charCodeAt(0), c = a.charCodeAt(1), d = a.charCodeAt(2), e = a.charCodeAt(3), f = a.charCodeAt(4), g = a.charCodeAt(5), h = a.charCodeAt(6);
        a = a.charCodeAt(7);
        jspb.utils.split64Low = b + (c << 8) + (d << 16) + (e << 24) >>> 0;
        jspb.utils.split64High = f + (g << 8) + (h << 16) + (a << 24) >>> 0;
      };
      jspb.utils.joinUint64 = function(a, b) {
        return b * jspb.BinaryConstants.TWO_TO_32 + a;
      };
      jspb.utils.joinInt64 = function(a, b) {
        var c = 2147483648 & b;
        c && (a = 1 + ~a >>> 0, b = ~b >>> 0, 0 == a && (b = b + 1 >>> 0));
        var d = jspb.utils.joinUint64(a, b);
        return c ? -d : d;
      };
      jspb.utils.joinZigzag64 = function(a, b) {
        var c = 1 & a;
        a = (a >>> 1 | b << 31) >>> 0;
        b >>>= 1;
        c && (a = a + 1 >>> 0, 0 == a && (b = b + 1 >>> 0));
        var d = jspb.utils.joinUint64(a, b);
        return c ? -d : d;
      };
      jspb.utils.joinFloat32 = function(a, b) {
        var c = 2 * (a >> 31) + 1, d = a >>> 23 & 255, e = 8388607 & a;
        return 255 == d ? e ? NaN : Infinity * c : 0 == d ? c * Math.pow(2, -149) * e : c * Math.pow(2, d - 150) * (e + Math.pow(2, 23));
      };
      jspb.utils.joinFloat64 = function(a, b) {
        var c = 2 * (b >> 31) + 1, d = b >>> 20 & 2047, e = jspb.BinaryConstants.TWO_TO_32 * (1048575 & b) + a;
        return 2047 == d ? e ? NaN : Infinity * c : 0 == d ? c * Math.pow(2, -1074) * e : c * Math.pow(2, d - 1075) * (e + jspb.BinaryConstants.TWO_TO_52);
      };
      jspb.utils.joinHash64 = function(a, b) {
        return String.fromCharCode(a >>> 0 & 255, a >>> 8 & 255, a >>> 16 & 255, a >>> 24 & 255, b >>> 0 & 255, b >>> 8 & 255, b >>> 16 & 255, b >>> 24 & 255);
      };
      jspb.utils.DIGITS = "0123456789abcdef".split("");
      jspb.utils.joinUnsignedDecimalString = function(a, b) {
        function c(a) {
          for (var b = 1e7, c = 0; 7 > c; c++) {
            var b = b / 10, d = a / b % 10 >>> 0;
            (0 != d || h) && (h = !0, k += g[d]);
          }
        }
        if (2097151 >= b) return "" + (jspb.BinaryConstants.TWO_TO_32 * b + a);
        var d = (a >>> 24 | b << 8) >>> 0 & 16777215, e = b >> 16 & 65535, f = (16777215 & a) + 6777216 * d + 6710656 * e, d = d + 8147497 * e, e = 2 * e;
        1e7 <= f && (d += Math.floor(f / 1e7), f %= 1e7);
        1e7 <= d && (e += Math.floor(d / 1e7), d %= 1e7);
        var g = jspb.utils.DIGITS, h = !1, k = "";
        (e || h) && c(e);
        (d || h) && c(d);
        (f || h) && c(f);
        return k;
      };
      jspb.utils.joinSignedDecimalString = function(a, b) {
        var c = 2147483648 & b;
        c && (a = 1 + ~a >>> 0, b = ~b + (0 == a ? 1 : 0) >>> 0);
        var d = jspb.utils.joinUnsignedDecimalString(a, b);
        return c ? "-" + d : d;
      };
      jspb.utils.hash64ToDecimalString = function(a, b) {
        jspb.utils.splitHash64(a);
        var c = jspb.utils.split64Low, d = jspb.utils.split64High;
        return b ? jspb.utils.joinSignedDecimalString(c, d) : jspb.utils.joinUnsignedDecimalString(c, d);
      };
      jspb.utils.hash64ArrayToDecimalStrings = function(a, b) {
        for (var c = Array(a.length), d = 0; d < a.length; d++) c[d] = jspb.utils.hash64ToDecimalString(a[d], b);
        return c;
      };
      jspb.utils.decimalStringToHash64 = function(a) {
        function b(a, b) {
          for (var c = 0; 8 > c && (1 !== a || 0 < b); c++) {
            var d = a * e[c] + b;
            e[c] = 255 & d;
            b = d >>> 8;
          }
        }
        function c() {
          for (var a = 0; 8 > a; a++) e[a] = 255 & ~e[a];
        }
        goog.asserts.assert(0 < a.length);
        var d = !1;
        "-" === a[0] && (d = !0, a = a.slice(1));
        for (var e = [ 0, 0, 0, 0, 0, 0, 0, 0 ], f = 0; f < a.length; f++) b(10, jspb.utils.DIGITS.indexOf(a[f]));
        d && (c(), b(1, 1));
        return String.fromCharCode.apply(null, e);
      };
      jspb.utils.splitDecimalString = function(a) {
        jspb.utils.splitHash64(jspb.utils.decimalStringToHash64(a));
      };
      jspb.utils.hash64ToHexString = function(a) {
        var b = Array(18);
        b[0] = "0";
        b[1] = "x";
        for (var c = 0; 8 > c; c++) {
          var d = a.charCodeAt(7 - c);
          b[2 * c + 2] = jspb.utils.DIGITS[d >> 4];
          b[2 * c + 3] = jspb.utils.DIGITS[15 & d];
        }
        return b.join("");
      };
      jspb.utils.hexStringToHash64 = function(a) {
        a = a.toLowerCase();
        goog.asserts.assert(18 == a.length);
        goog.asserts.assert("0" == a[0]);
        goog.asserts.assert("x" == a[1]);
        for (var b = "", c = 0; 8 > c; c++) var d = jspb.utils.DIGITS.indexOf(a[2 * c + 2]), e = jspb.utils.DIGITS.indexOf(a[2 * c + 3]), b = String.fromCharCode(16 * d + e) + b;
        return b;
      };
      jspb.utils.hash64ToNumber = function(a, b) {
        jspb.utils.splitHash64(a);
        var c = jspb.utils.split64Low, d = jspb.utils.split64High;
        return b ? jspb.utils.joinInt64(c, d) : jspb.utils.joinUint64(c, d);
      };
      jspb.utils.numberToHash64 = function(a) {
        jspb.utils.splitInt64(a);
        return jspb.utils.joinHash64(jspb.utils.split64Low, jspb.utils.split64High);
      };
      jspb.utils.countVarints = function(a, b, c) {
        for (var d = 0, e = b; e < c; e++) d += a[e] >> 7;
        return c - b - d;
      };
      jspb.utils.countVarintFields = function(a, b, c, d) {
        var e = 0;
        d = 8 * d + jspb.BinaryConstants.WireType.VARINT;
        if (128 > d) for (;b < c && a[b++] == d; ) for (e++; ;) {
          var f = a[b++];
          if (0 == (128 & f)) break;
        } else for (;b < c; ) {
          for (f = d; 128 < f; ) {
            if (a[b] != (127 & f | 128)) return e;
            b++;
            f >>= 7;
          }
          if (a[b++] != f) break;
          for (e++; f = a[b++], 0 != (128 & f); ) ;
        }
        return e;
      };
      jspb.utils.countFixedFields_ = function(a, b, c, d, e) {
        var f = 0;
        if (128 > d) for (;b < c && a[b++] == d; ) f++, b += e; else for (;b < c; ) {
          for (var g = d; 128 < g; ) {
            if (a[b++] != (127 & g | 128)) return f;
            g >>= 7;
          }
          if (a[b++] != g) break;
          f++;
          b += e;
        }
        return f;
      };
      jspb.utils.countFixed32Fields = function(a, b, c, d) {
        return jspb.utils.countFixedFields_(a, b, c, 8 * d + jspb.BinaryConstants.WireType.FIXED32, 4);
      };
      jspb.utils.countFixed64Fields = function(a, b, c, d) {
        return jspb.utils.countFixedFields_(a, b, c, 8 * d + jspb.BinaryConstants.WireType.FIXED64, 8);
      };
      jspb.utils.countDelimitedFields = function(a, b, c, d) {
        var e = 0;
        for (d = 8 * d + jspb.BinaryConstants.WireType.DELIMITED; b < c; ) {
          for (var f = d; 128 < f; ) {
            if (a[b++] != (127 & f | 128)) return e;
            f >>= 7;
          }
          if (a[b++] != f) break;
          e++;
          for (var g = 0, h = 1; f = a[b++], g += (127 & f) * h, h *= 128, 0 != (128 & f); ) ;
          b += g;
        }
        return e;
      };
      jspb.utils.debugBytesToTextFormat = function(a) {
        var b = '"';
        if (a) {
          a = jspb.utils.byteSourceToUint8Array(a);
          for (var c = 0; c < a.length; c++) b += "\\x", 16 > a[c] && (b += "0"), b += a[c].toString(16);
        }
        return b + '"';
      };
      jspb.utils.debugScalarToTextFormat = function(a) {
        return goog.isString(a) ? goog.string.quote(a) : a.toString();
      };
      jspb.utils.stringToByteArray = function(a) {
        for (var b = new Uint8Array(a.length), c = 0; c < a.length; c++) {
          var d = a.charCodeAt(c);
          if (255 < d) throw Error("Conversion error: string contains codepoint outside of byte range");
          b[c] = d;
        }
        return b;
      };
      jspb.utils.byteSourceToUint8Array = function(a) {
        if (a.constructor === Uint8Array) return a;
        if (a.constructor === ArrayBuffer || a.constructor === Array) return new Uint8Array(a);
        if (a.constructor === String) return goog.crypt.base64.decodeStringToUint8Array(a);
        goog.asserts.fail("Type not convertible to Uint8Array.");
        return new Uint8Array(0);
      };
      jspb.BinaryIterator = function(a, b, c) {
        this.elements_ = this.nextMethod_ = this.decoder_ = null;
        this.cursor_ = 0;
        this.nextValue_ = null;
        this.atEnd_ = !0;
        this.init_(a, b, c);
      };
      jspb.BinaryIterator.prototype.init_ = function(a, b, c) {
        a && b && (this.decoder_ = a, this.nextMethod_ = b);
        this.elements_ = c || null;
        this.cursor_ = 0;
        this.nextValue_ = null;
        this.atEnd_ = !this.decoder_ && !this.elements_;
        this.next();
      };
      jspb.BinaryIterator.instanceCache_ = [];
      jspb.BinaryIterator.alloc = function(a, b, c) {
        if (jspb.BinaryIterator.instanceCache_.length) {
          var d = jspb.BinaryIterator.instanceCache_.pop();
          d.init_(a, b, c);
          return d;
        }
        return new jspb.BinaryIterator(a, b, c);
      };
      jspb.BinaryIterator.prototype.free = function() {
        this.clear();
        100 > jspb.BinaryIterator.instanceCache_.length && jspb.BinaryIterator.instanceCache_.push(this);
      };
      jspb.BinaryIterator.prototype.clear = function() {
        this.decoder_ && this.decoder_.free();
        this.elements_ = this.nextMethod_ = this.decoder_ = null;
        this.cursor_ = 0;
        this.nextValue_ = null;
        this.atEnd_ = !0;
      };
      jspb.BinaryIterator.prototype.get = function() {
        return this.nextValue_;
      };
      jspb.BinaryIterator.prototype.atEnd = function() {
        return this.atEnd_;
      };
      jspb.BinaryIterator.prototype.next = function() {
        var a = this.nextValue_;
        this.decoder_ ? this.decoder_.atEnd() ? (this.nextValue_ = null, this.atEnd_ = !0) : this.nextValue_ = this.nextMethod_.call(this.decoder_) : this.elements_ && (this.cursor_ == this.elements_.length ? (this.nextValue_ = null, 
        this.atEnd_ = !0) : this.nextValue_ = this.elements_[this.cursor_++]);
        return a;
      };
      jspb.BinaryDecoder = function(a, b, c) {
        this.bytes_ = null;
        this.tempHigh_ = this.tempLow_ = this.cursor_ = this.end_ = this.start_ = 0;
        this.error_ = !1;
        a && this.setBlock(a, b, c);
      };
      jspb.BinaryDecoder.instanceCache_ = [];
      jspb.BinaryDecoder.alloc = function(a, b, c) {
        if (jspb.BinaryDecoder.instanceCache_.length) {
          var d = jspb.BinaryDecoder.instanceCache_.pop();
          a && d.setBlock(a, b, c);
          return d;
        }
        return new jspb.BinaryDecoder(a, b, c);
      };
      jspb.BinaryDecoder.prototype.free = function() {
        this.clear();
        100 > jspb.BinaryDecoder.instanceCache_.length && jspb.BinaryDecoder.instanceCache_.push(this);
      };
      jspb.BinaryDecoder.prototype.clone = function() {
        return jspb.BinaryDecoder.alloc(this.bytes_, this.start_, this.end_ - this.start_);
      };
      jspb.BinaryDecoder.prototype.clear = function() {
        this.bytes_ = null;
        this.cursor_ = this.end_ = this.start_ = 0;
        this.error_ = !1;
      };
      jspb.BinaryDecoder.prototype.getBuffer = function() {
        return this.bytes_;
      };
      jspb.BinaryDecoder.prototype.setBlock = function(a, b, c) {
        this.bytes_ = jspb.utils.byteSourceToUint8Array(a);
        this.start_ = goog.isDef(b) ? b : 0;
        this.end_ = goog.isDef(c) ? this.start_ + c : this.bytes_.length;
        this.cursor_ = this.start_;
      };
      jspb.BinaryDecoder.prototype.getEnd = function() {
        return this.end_;
      };
      jspb.BinaryDecoder.prototype.setEnd = function(a) {
        this.end_ = a;
      };
      jspb.BinaryDecoder.prototype.reset = function() {
        this.cursor_ = this.start_;
      };
      jspb.BinaryDecoder.prototype.getCursor = function() {
        return this.cursor_;
      };
      jspb.BinaryDecoder.prototype.setCursor = function(a) {
        this.cursor_ = a;
      };
      jspb.BinaryDecoder.prototype.advance = function(a) {
        this.cursor_ += a;
        goog.asserts.assert(this.cursor_ <= this.end_);
      };
      jspb.BinaryDecoder.prototype.atEnd = function() {
        return this.cursor_ == this.end_;
      };
      jspb.BinaryDecoder.prototype.pastEnd = function() {
        return this.cursor_ > this.end_;
      };
      jspb.BinaryDecoder.prototype.getError = function() {
        return this.error_ || 0 > this.cursor_ || this.cursor_ > this.end_;
      };
      jspb.BinaryDecoder.prototype.readSplitVarint64_ = function() {
        for (var a, b = 0, c, d = 0; 4 > d; d++) if (a = this.bytes_[this.cursor_++], b |= (127 & a) << 7 * d, 
        128 > a) {
          this.tempLow_ = b >>> 0;
          this.tempHigh_ = 0;
          return;
        }
        a = this.bytes_[this.cursor_++];
        b |= (127 & a) << 28;
        c = 0 | (127 & a) >> 4;
        if (128 > a) this.tempLow_ = b >>> 0, this.tempHigh_ = c >>> 0; else {
          for (d = 0; 5 > d; d++) if (a = this.bytes_[this.cursor_++], c |= (127 & a) << 7 * d + 3, 
          128 > a) {
            this.tempLow_ = b >>> 0;
            this.tempHigh_ = c >>> 0;
            return;
          }
          goog.asserts.fail("Failed to read varint, encoding is invalid.");
          this.error_ = !0;
        }
      };
      jspb.BinaryDecoder.prototype.skipVarint = function() {
        for (;128 & this.bytes_[this.cursor_]; ) this.cursor_++;
        this.cursor_++;
      };
      jspb.BinaryDecoder.prototype.unskipVarint = function(a) {
        for (;128 < a; ) this.cursor_--, a >>>= 7;
        this.cursor_--;
      };
      jspb.BinaryDecoder.prototype.readUnsignedVarint32 = function() {
        var a, b = this.bytes_;
        a = b[this.cursor_ + 0];
        var c = 127 & a;
        if (128 > a) return this.cursor_ += 1, goog.asserts.assert(this.cursor_ <= this.end_), 
        c;
        a = b[this.cursor_ + 1];
        c |= (127 & a) << 7;
        if (128 > a) return this.cursor_ += 2, goog.asserts.assert(this.cursor_ <= this.end_), 
        c;
        a = b[this.cursor_ + 2];
        c |= (127 & a) << 14;
        if (128 > a) return this.cursor_ += 3, goog.asserts.assert(this.cursor_ <= this.end_), 
        c;
        a = b[this.cursor_ + 3];
        c |= (127 & a) << 21;
        if (128 > a) return this.cursor_ += 4, goog.asserts.assert(this.cursor_ <= this.end_), 
        c;
        a = b[this.cursor_ + 4];
        c |= (15 & a) << 28;
        if (128 > a) return goog.asserts.assert(0 == (240 & a)), this.cursor_ += 5, goog.asserts.assert(this.cursor_ <= this.end_), 
        c >>> 0;
        goog.asserts.assert(240 == (240 & a));
        goog.asserts.assert(255 == b[this.cursor_ + 5]);
        goog.asserts.assert(255 == b[this.cursor_ + 6]);
        goog.asserts.assert(255 == b[this.cursor_ + 7]);
        goog.asserts.assert(255 == b[this.cursor_ + 8]);
        goog.asserts.assert(1 == b[this.cursor_ + 9]);
        this.cursor_ += 10;
        goog.asserts.assert(this.cursor_ <= this.end_);
        return c;
      };
      jspb.BinaryDecoder.prototype.readSignedVarint32 = jspb.BinaryDecoder.prototype.readUnsignedVarint32;
      jspb.BinaryDecoder.prototype.readUnsignedVarint32String = function() {
        return this.readUnsignedVarint32().toString();
      };
      jspb.BinaryDecoder.prototype.readSignedVarint32String = function() {
        return this.readSignedVarint32().toString();
      };
      jspb.BinaryDecoder.prototype.readZigzagVarint32 = function() {
        var a = this.readUnsignedVarint32();
        return a >>> 1 ^ -(1 & a);
      };
      jspb.BinaryDecoder.prototype.readUnsignedVarint64 = function() {
        this.readSplitVarint64_();
        return jspb.utils.joinUint64(this.tempLow_, this.tempHigh_);
      };
      jspb.BinaryDecoder.prototype.readUnsignedVarint64String = function() {
        this.readSplitVarint64_();
        return jspb.utils.joinUnsignedDecimalString(this.tempLow_, this.tempHigh_);
      };
      jspb.BinaryDecoder.prototype.readSignedVarint64 = function() {
        this.readSplitVarint64_();
        return jspb.utils.joinInt64(this.tempLow_, this.tempHigh_);
      };
      jspb.BinaryDecoder.prototype.readSignedVarint64String = function() {
        this.readSplitVarint64_();
        return jspb.utils.joinSignedDecimalString(this.tempLow_, this.tempHigh_);
      };
      jspb.BinaryDecoder.prototype.readZigzagVarint64 = function() {
        this.readSplitVarint64_();
        return jspb.utils.joinZigzag64(this.tempLow_, this.tempHigh_);
      };
      jspb.BinaryDecoder.prototype.readZigzagVarint64String = function() {
        return this.readZigzagVarint64().toString();
      };
      jspb.BinaryDecoder.prototype.readUint8 = function() {
        var a = this.bytes_[this.cursor_ + 0];
        this.cursor_ += 1;
        goog.asserts.assert(this.cursor_ <= this.end_);
        return a;
      };
      jspb.BinaryDecoder.prototype.readUint16 = function() {
        var a = this.bytes_[this.cursor_ + 0], b = this.bytes_[this.cursor_ + 1];
        this.cursor_ += 2;
        goog.asserts.assert(this.cursor_ <= this.end_);
        return a << 0 | b << 8;
      };
      jspb.BinaryDecoder.prototype.readUint32 = function() {
        var a = this.bytes_[this.cursor_ + 0], b = this.bytes_[this.cursor_ + 1], c = this.bytes_[this.cursor_ + 2], d = this.bytes_[this.cursor_ + 3];
        this.cursor_ += 4;
        goog.asserts.assert(this.cursor_ <= this.end_);
        return (a << 0 | b << 8 | c << 16 | d << 24) >>> 0;
      };
      jspb.BinaryDecoder.prototype.readUint64 = function() {
        var a = this.readUint32(), b = this.readUint32();
        return jspb.utils.joinUint64(a, b);
      };
      jspb.BinaryDecoder.prototype.readUint64String = function() {
        var a = this.readUint32(), b = this.readUint32();
        return jspb.utils.joinUnsignedDecimalString(a, b);
      };
      jspb.BinaryDecoder.prototype.readInt8 = function() {
        var a = this.bytes_[this.cursor_ + 0];
        this.cursor_ += 1;
        goog.asserts.assert(this.cursor_ <= this.end_);
        return a << 24 >> 24;
      };
      jspb.BinaryDecoder.prototype.readInt16 = function() {
        var a = this.bytes_[this.cursor_ + 0], b = this.bytes_[this.cursor_ + 1];
        this.cursor_ += 2;
        goog.asserts.assert(this.cursor_ <= this.end_);
        return (a << 0 | b << 8) << 16 >> 16;
      };
      jspb.BinaryDecoder.prototype.readInt32 = function() {
        var a = this.bytes_[this.cursor_ + 0], b = this.bytes_[this.cursor_ + 1], c = this.bytes_[this.cursor_ + 2], d = this.bytes_[this.cursor_ + 3];
        this.cursor_ += 4;
        goog.asserts.assert(this.cursor_ <= this.end_);
        return a << 0 | b << 8 | c << 16 | d << 24;
      };
      jspb.BinaryDecoder.prototype.readInt64 = function() {
        var a = this.readUint32(), b = this.readUint32();
        return jspb.utils.joinInt64(a, b);
      };
      jspb.BinaryDecoder.prototype.readInt64String = function() {
        var a = this.readUint32(), b = this.readUint32();
        return jspb.utils.joinSignedDecimalString(a, b);
      };
      jspb.BinaryDecoder.prototype.readFloat = function() {
        var a = this.readUint32();
        return jspb.utils.joinFloat32(a, 0);
      };
      jspb.BinaryDecoder.prototype.readDouble = function() {
        var a = this.readUint32(), b = this.readUint32();
        return jspb.utils.joinFloat64(a, b);
      };
      jspb.BinaryDecoder.prototype.readBool = function() {
        return !!this.bytes_[this.cursor_++];
      };
      jspb.BinaryDecoder.prototype.readEnum = function() {
        return this.readSignedVarint32();
      };
      jspb.BinaryDecoder.prototype.readString = function(a) {
        var b = this.bytes_, c = this.cursor_;
        a = c + a;
        for (var d = []; c < a; ) {
          var e = b[c++];
          if (128 > e) d.push(e); else if (!(192 > e)) if (224 > e) {
            var f = b[c++];
            d.push((31 & e) << 6 | 63 & f);
          } else if (240 > e) {
            var f = b[c++], g = b[c++];
            d.push((15 & e) << 12 | (63 & f) << 6 | 63 & g);
          } else if (248 > e) {
            var f = b[c++], g = b[c++], h = b[c++], e = (7 & e) << 18 | (63 & f) << 12 | (63 & g) << 6 | 63 & h, e = e - 65536;
            d.push(55296 + (e >> 10 & 1023), 56320 + (1023 & e));
          }
        }
        b = String.fromCharCode.apply(null, d);
        this.cursor_ = c;
        return b;
      };
      jspb.BinaryDecoder.prototype.readStringWithLength = function() {
        var a = this.readUnsignedVarint32();
        return this.readString(a);
      };
      jspb.BinaryDecoder.prototype.readBytes = function(a) {
        if (0 > a || this.cursor_ + a > this.bytes_.length) return this.error_ = !0, goog.asserts.fail("Invalid byte length!"), 
        new Uint8Array(0);
        var b = this.bytes_.subarray(this.cursor_, this.cursor_ + a);
        this.cursor_ += a;
        goog.asserts.assert(this.cursor_ <= this.end_);
        return b;
      };
      jspb.BinaryDecoder.prototype.readVarintHash64 = function() {
        this.readSplitVarint64_();
        return jspb.utils.joinHash64(this.tempLow_, this.tempHigh_);
      };
      jspb.BinaryDecoder.prototype.readFixedHash64 = function() {
        var a = this.bytes_, b = this.cursor_, c = a[b + 0], d = a[b + 1], e = a[b + 2], f = a[b + 3], g = a[b + 4], h = a[b + 5], k = a[b + 6], a = a[b + 7];
        this.cursor_ += 8;
        return String.fromCharCode(c, d, e, f, g, h, k, a);
      };
      jspb.BinaryReader = function(a, b, c) {
        this.decoder_ = jspb.BinaryDecoder.alloc(a, b, c);
        this.fieldCursor_ = this.decoder_.getCursor();
        this.nextField_ = jspb.BinaryConstants.INVALID_FIELD_NUMBER;
        this.nextWireType_ = jspb.BinaryConstants.WireType.INVALID;
        this.error_ = !1;
        this.readCallbacks_ = null;
      };
      jspb.BinaryReader.instanceCache_ = [];
      jspb.BinaryReader.alloc = function(a, b, c) {
        if (jspb.BinaryReader.instanceCache_.length) {
          var d = jspb.BinaryReader.instanceCache_.pop();
          a && d.decoder_.setBlock(a, b, c);
          return d;
        }
        return new jspb.BinaryReader(a, b, c);
      };
      jspb.BinaryReader.prototype.alloc = jspb.BinaryReader.alloc;
      jspb.BinaryReader.prototype.free = function() {
        this.decoder_.clear();
        this.nextField_ = jspb.BinaryConstants.INVALID_FIELD_NUMBER;
        this.nextWireType_ = jspb.BinaryConstants.WireType.INVALID;
        this.error_ = !1;
        this.readCallbacks_ = null;
        100 > jspb.BinaryReader.instanceCache_.length && jspb.BinaryReader.instanceCache_.push(this);
      };
      jspb.BinaryReader.prototype.getFieldCursor = function() {
        return this.fieldCursor_;
      };
      jspb.BinaryReader.prototype.getCursor = function() {
        return this.decoder_.getCursor();
      };
      jspb.BinaryReader.prototype.getBuffer = function() {
        return this.decoder_.getBuffer();
      };
      jspb.BinaryReader.prototype.getFieldNumber = function() {
        return this.nextField_;
      };
      jspb.BinaryReader.prototype.getWireType = function() {
        return this.nextWireType_;
      };
      jspb.BinaryReader.prototype.isEndGroup = function() {
        return this.nextWireType_ == jspb.BinaryConstants.WireType.END_GROUP;
      };
      jspb.BinaryReader.prototype.getError = function() {
        return this.error_ || this.decoder_.getError();
      };
      jspb.BinaryReader.prototype.setBlock = function(a, b, c) {
        this.decoder_.setBlock(a, b, c);
        this.nextField_ = jspb.BinaryConstants.INVALID_FIELD_NUMBER;
        this.nextWireType_ = jspb.BinaryConstants.WireType.INVALID;
      };
      jspb.BinaryReader.prototype.reset = function() {
        this.decoder_.reset();
        this.nextField_ = jspb.BinaryConstants.INVALID_FIELD_NUMBER;
        this.nextWireType_ = jspb.BinaryConstants.WireType.INVALID;
      };
      jspb.BinaryReader.prototype.advance = function(a) {
        this.decoder_.advance(a);
      };
      jspb.BinaryReader.prototype.nextField = function() {
        if (this.decoder_.atEnd()) return !1;
        if (this.getError()) return goog.asserts.fail("Decoder hit an error"), !1;
        this.fieldCursor_ = this.decoder_.getCursor();
        var a = this.decoder_.readUnsignedVarint32(), b = a >>> 3, a = 7 & a;
        if (a != jspb.BinaryConstants.WireType.VARINT && a != jspb.BinaryConstants.WireType.FIXED32 && a != jspb.BinaryConstants.WireType.FIXED64 && a != jspb.BinaryConstants.WireType.DELIMITED && a != jspb.BinaryConstants.WireType.START_GROUP && a != jspb.BinaryConstants.WireType.END_GROUP) return goog.asserts.fail("Invalid wire type"), 
        this.error_ = !0, !1;
        this.nextField_ = b;
        this.nextWireType_ = a;
        return !0;
      };
      jspb.BinaryReader.prototype.unskipHeader = function() {
        this.decoder_.unskipVarint(this.nextField_ << 3 | this.nextWireType_);
      };
      jspb.BinaryReader.prototype.skipMatchingFields = function() {
        var a = this.nextField_;
        for (this.unskipHeader(); this.nextField() && this.getFieldNumber() == a; ) this.skipField();
        this.decoder_.atEnd() || this.unskipHeader();
      };
      jspb.BinaryReader.prototype.skipVarintField = function() {
        this.nextWireType_ != jspb.BinaryConstants.WireType.VARINT ? (goog.asserts.fail("Invalid wire type for skipVarintField"), 
        this.skipField()) : this.decoder_.skipVarint();
      };
      jspb.BinaryReader.prototype.skipDelimitedField = function() {
        if (this.nextWireType_ != jspb.BinaryConstants.WireType.DELIMITED) goog.asserts.fail("Invalid wire type for skipDelimitedField"), 
        this.skipField(); else {
          var a = this.decoder_.readUnsignedVarint32();
          this.decoder_.advance(a);
        }
      };
      jspb.BinaryReader.prototype.skipFixed32Field = function() {
        this.nextWireType_ != jspb.BinaryConstants.WireType.FIXED32 ? (goog.asserts.fail("Invalid wire type for skipFixed32Field"), 
        this.skipField()) : this.decoder_.advance(4);
      };
      jspb.BinaryReader.prototype.skipFixed64Field = function() {
        this.nextWireType_ != jspb.BinaryConstants.WireType.FIXED64 ? (goog.asserts.fail("Invalid wire type for skipFixed64Field"), 
        this.skipField()) : this.decoder_.advance(8);
      };
      jspb.BinaryReader.prototype.skipGroup = function() {
        var a = [ this.nextField_ ];
        do {
          if (!this.nextField()) {
            goog.asserts.fail("Unmatched start-group tag: stream EOF");
            this.error_ = !0;
            break;
          }
          if (this.nextWireType_ == jspb.BinaryConstants.WireType.START_GROUP) a.push(this.nextField_); else if (this.nextWireType_ == jspb.BinaryConstants.WireType.END_GROUP && this.nextField_ != a.pop()) {
            goog.asserts.fail("Unmatched end-group tag");
            this.error_ = !0;
            break;
          }
        } while (0 < a.length);
      };
      jspb.BinaryReader.prototype.skipField = function() {
        switch (this.nextWireType_) {
         case jspb.BinaryConstants.WireType.VARINT:
          this.skipVarintField();
          break;

         case jspb.BinaryConstants.WireType.FIXED64:
          this.skipFixed64Field();
          break;

         case jspb.BinaryConstants.WireType.DELIMITED:
          this.skipDelimitedField();
          break;

         case jspb.BinaryConstants.WireType.FIXED32:
          this.skipFixed32Field();
          break;

         case jspb.BinaryConstants.WireType.START_GROUP:
          this.skipGroup();
          break;

         default:
          goog.asserts.fail("Invalid wire encoding for field.");
        }
      };
      jspb.BinaryReader.prototype.registerReadCallback = function(a, b) {
        goog.isNull(this.readCallbacks_) && (this.readCallbacks_ = {});
        goog.asserts.assert(!this.readCallbacks_[a]);
        this.readCallbacks_[a] = b;
      };
      jspb.BinaryReader.prototype.runReadCallback = function(a) {
        goog.asserts.assert(!goog.isNull(this.readCallbacks_));
        a = this.readCallbacks_[a];
        goog.asserts.assert(a);
        return a(this);
      };
      jspb.BinaryReader.prototype.readAny = function(a) {
        this.nextWireType_ = jspb.BinaryConstants.FieldTypeToWireType(a);
        var b = jspb.BinaryConstants.FieldType;
        switch (a) {
         case b.DOUBLE:
          return this.readDouble();

         case b.FLOAT:
          return this.readFloat();

         case b.INT64:
          return this.readInt64();

         case b.UINT64:
          return this.readUint64();

         case b.INT32:
          return this.readInt32();

         case b.FIXED64:
          return this.readFixed64();

         case b.FIXED32:
          return this.readFixed32();

         case b.BOOL:
          return this.readBool();

         case b.STRING:
          return this.readString();

         case b.GROUP:
          goog.asserts.fail("Group field type not supported in readAny()");

         case b.MESSAGE:
          goog.asserts.fail("Message field type not supported in readAny()");

         case b.BYTES:
          return this.readBytes();

         case b.UINT32:
          return this.readUint32();

         case b.ENUM:
          return this.readEnum();

         case b.SFIXED32:
          return this.readSfixed32();

         case b.SFIXED64:
          return this.readSfixed64();

         case b.SINT32:
          return this.readSint32();

         case b.SINT64:
          return this.readSint64();

         case b.FHASH64:
          return this.readFixedHash64();

         case b.VHASH64:
          return this.readVarintHash64();

         default:
          goog.asserts.fail("Invalid field type in readAny()");
        }
        return 0;
      };
      jspb.BinaryReader.prototype.readMessage = function(a, b) {
        goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.DELIMITED);
        var c = this.decoder_.getEnd(), d = this.decoder_.readUnsignedVarint32(), d = this.decoder_.getCursor() + d;
        this.decoder_.setEnd(d);
        b(a, this);
        this.decoder_.setCursor(d);
        this.decoder_.setEnd(c);
      };
      jspb.BinaryReader.prototype.readGroup = function(a, b, c) {
        goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.START_GROUP);
        goog.asserts.assert(this.nextField_ == a);
        c(b, this);
        this.error_ || this.nextWireType_ == jspb.BinaryConstants.WireType.END_GROUP || (goog.asserts.fail("Group submessage did not end with an END_GROUP tag"), 
        this.error_ = !0);
      };
      jspb.BinaryReader.prototype.getFieldDecoder = function() {
        goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.DELIMITED);
        var a = this.decoder_.readUnsignedVarint32(), b = this.decoder_.getCursor(), c = b + a, a = jspb.BinaryDecoder.alloc(this.decoder_.getBuffer(), b, a);
        this.decoder_.setCursor(c);
        return a;
      };
      jspb.BinaryReader.prototype.readInt32 = function() {
        goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.VARINT);
        return this.decoder_.readSignedVarint32();
      };
      jspb.BinaryReader.prototype.readInt32String = function() {
        goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.VARINT);
        return this.decoder_.readSignedVarint32String();
      };
      jspb.BinaryReader.prototype.readInt64 = function() {
        goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.VARINT);
        return this.decoder_.readSignedVarint64();
      };
      jspb.BinaryReader.prototype.readInt64String = function() {
        goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.VARINT);
        return this.decoder_.readSignedVarint64String();
      };
      jspb.BinaryReader.prototype.readUint32 = function() {
        goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.VARINT);
        return this.decoder_.readUnsignedVarint32();
      };
      jspb.BinaryReader.prototype.readUint32String = function() {
        goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.VARINT);
        return this.decoder_.readUnsignedVarint32String();
      };
      jspb.BinaryReader.prototype.readUint64 = function() {
        goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.VARINT);
        return this.decoder_.readUnsignedVarint64();
      };
      jspb.BinaryReader.prototype.readUint64String = function() {
        goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.VARINT);
        return this.decoder_.readUnsignedVarint64String();
      };
      jspb.BinaryReader.prototype.readSint32 = function() {
        goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.VARINT);
        return this.decoder_.readZigzagVarint32();
      };
      jspb.BinaryReader.prototype.readSint64 = function() {
        goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.VARINT);
        return this.decoder_.readZigzagVarint64();
      };
      jspb.BinaryReader.prototype.readSint64String = function() {
        goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.VARINT);
        return this.decoder_.readZigzagVarint64String();
      };
      jspb.BinaryReader.prototype.readFixed32 = function() {
        goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.FIXED32);
        return this.decoder_.readUint32();
      };
      jspb.BinaryReader.prototype.readFixed64 = function() {
        goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.FIXED64);
        return this.decoder_.readUint64();
      };
      jspb.BinaryReader.prototype.readFixed64String = function() {
        goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.FIXED64);
        return this.decoder_.readUint64String();
      };
      jspb.BinaryReader.prototype.readSfixed32 = function() {
        goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.FIXED32);
        return this.decoder_.readInt32();
      };
      jspb.BinaryReader.prototype.readSfixed32String = function() {
        goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.FIXED32);
        return this.decoder_.readInt32().toString();
      };
      jspb.BinaryReader.prototype.readSfixed64 = function() {
        goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.FIXED64);
        return this.decoder_.readInt64();
      };
      jspb.BinaryReader.prototype.readSfixed64String = function() {
        goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.FIXED64);
        return this.decoder_.readInt64String();
      };
      jspb.BinaryReader.prototype.readFloat = function() {
        goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.FIXED32);
        return this.decoder_.readFloat();
      };
      jspb.BinaryReader.prototype.readDouble = function() {
        goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.FIXED64);
        return this.decoder_.readDouble();
      };
      jspb.BinaryReader.prototype.readBool = function() {
        goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.VARINT);
        return !!this.decoder_.readUnsignedVarint32();
      };
      jspb.BinaryReader.prototype.readEnum = function() {
        goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.VARINT);
        return this.decoder_.readSignedVarint64();
      };
      jspb.BinaryReader.prototype.readString = function() {
        goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.DELIMITED);
        var a = this.decoder_.readUnsignedVarint32();
        return this.decoder_.readString(a);
      };
      jspb.BinaryReader.prototype.readBytes = function() {
        goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.DELIMITED);
        var a = this.decoder_.readUnsignedVarint32();
        return this.decoder_.readBytes(a);
      };
      jspb.BinaryReader.prototype.readVarintHash64 = function() {
        goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.VARINT);
        return this.decoder_.readVarintHash64();
      };
      jspb.BinaryReader.prototype.readFixedHash64 = function() {
        goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.FIXED64);
        return this.decoder_.readFixedHash64();
      };
      jspb.BinaryReader.prototype.readPackedField_ = function(a) {
        goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.DELIMITED);
        for (var b = this.decoder_.readUnsignedVarint32(), b = this.decoder_.getCursor() + b, c = []; this.decoder_.getCursor() < b; ) c.push(a.call(this.decoder_));
        return c;
      };
      jspb.BinaryReader.prototype.readPackedInt32 = function() {
        return this.readPackedField_(this.decoder_.readSignedVarint32);
      };
      jspb.BinaryReader.prototype.readPackedInt32String = function() {
        return this.readPackedField_(this.decoder_.readSignedVarint32String);
      };
      jspb.BinaryReader.prototype.readPackedInt64 = function() {
        return this.readPackedField_(this.decoder_.readSignedVarint64);
      };
      jspb.BinaryReader.prototype.readPackedInt64String = function() {
        return this.readPackedField_(this.decoder_.readSignedVarint64String);
      };
      jspb.BinaryReader.prototype.readPackedUint32 = function() {
        return this.readPackedField_(this.decoder_.readUnsignedVarint32);
      };
      jspb.BinaryReader.prototype.readPackedUint32String = function() {
        return this.readPackedField_(this.decoder_.readUnsignedVarint32String);
      };
      jspb.BinaryReader.prototype.readPackedUint64 = function() {
        return this.readPackedField_(this.decoder_.readUnsignedVarint64);
      };
      jspb.BinaryReader.prototype.readPackedUint64String = function() {
        return this.readPackedField_(this.decoder_.readUnsignedVarint64String);
      };
      jspb.BinaryReader.prototype.readPackedSint32 = function() {
        return this.readPackedField_(this.decoder_.readZigzagVarint32);
      };
      jspb.BinaryReader.prototype.readPackedSint64 = function() {
        return this.readPackedField_(this.decoder_.readZigzagVarint64);
      };
      jspb.BinaryReader.prototype.readPackedSint64String = function() {
        return this.readPackedField_(this.decoder_.readZigzagVarint64String);
      };
      jspb.BinaryReader.prototype.readPackedFixed32 = function() {
        return this.readPackedField_(this.decoder_.readUint32);
      };
      jspb.BinaryReader.prototype.readPackedFixed64 = function() {
        return this.readPackedField_(this.decoder_.readUint64);
      };
      jspb.BinaryReader.prototype.readPackedFixed64String = function() {
        return this.readPackedField_(this.decoder_.readUint64String);
      };
      jspb.BinaryReader.prototype.readPackedSfixed32 = function() {
        return this.readPackedField_(this.decoder_.readInt32);
      };
      jspb.BinaryReader.prototype.readPackedSfixed64 = function() {
        return this.readPackedField_(this.decoder_.readInt64);
      };
      jspb.BinaryReader.prototype.readPackedSfixed64String = function() {
        return this.readPackedField_(this.decoder_.readInt64String);
      };
      jspb.BinaryReader.prototype.readPackedFloat = function() {
        return this.readPackedField_(this.decoder_.readFloat);
      };
      jspb.BinaryReader.prototype.readPackedDouble = function() {
        return this.readPackedField_(this.decoder_.readDouble);
      };
      jspb.BinaryReader.prototype.readPackedBool = function() {
        return this.readPackedField_(this.decoder_.readBool);
      };
      jspb.BinaryReader.prototype.readPackedEnum = function() {
        return this.readPackedField_(this.decoder_.readEnum);
      };
      jspb.BinaryReader.prototype.readPackedVarintHash64 = function() {
        return this.readPackedField_(this.decoder_.readVarintHash64);
      };
      jspb.BinaryReader.prototype.readPackedFixedHash64 = function() {
        return this.readPackedField_(this.decoder_.readFixedHash64);
      };
      jspb.BinaryEncoder = function() {
        this.buffer_ = [];
      };
      jspb.BinaryEncoder.prototype.length = function() {
        return this.buffer_.length;
      };
      jspb.BinaryEncoder.prototype.end = function() {
        var a = this.buffer_;
        this.buffer_ = [];
        return a;
      };
      jspb.BinaryEncoder.prototype.writeSplitVarint64 = function(a, b) {
        goog.asserts.assert(a == Math.floor(a));
        goog.asserts.assert(b == Math.floor(b));
        goog.asserts.assert(0 <= a && a < jspb.BinaryConstants.TWO_TO_32);
        for (goog.asserts.assert(0 <= b && b < jspb.BinaryConstants.TWO_TO_32); 0 < b || 127 < a; ) this.buffer_.push(127 & a | 128), 
        a = (a >>> 7 | b << 25) >>> 0, b >>>= 7;
        this.buffer_.push(a);
      };
      jspb.BinaryEncoder.prototype.writeSplitFixed64 = function(a, b) {
        goog.asserts.assert(a == Math.floor(a));
        goog.asserts.assert(b == Math.floor(b));
        goog.asserts.assert(0 <= a && a < jspb.BinaryConstants.TWO_TO_32);
        goog.asserts.assert(0 <= b && b < jspb.BinaryConstants.TWO_TO_32);
        this.writeUint32(a);
        this.writeUint32(b);
      };
      jspb.BinaryEncoder.prototype.writeUnsignedVarint32 = function(a) {
        goog.asserts.assert(a == Math.floor(a));
        for (goog.asserts.assert(0 <= a && a < jspb.BinaryConstants.TWO_TO_32); 127 < a; ) this.buffer_.push(127 & a | 128), 
        a >>>= 7;
        this.buffer_.push(a);
      };
      jspb.BinaryEncoder.prototype.writeSignedVarint32 = function(a) {
        goog.asserts.assert(a == Math.floor(a));
        goog.asserts.assert(a >= -jspb.BinaryConstants.TWO_TO_31 && a < jspb.BinaryConstants.TWO_TO_31);
        if (0 <= a) this.writeUnsignedVarint32(a); else {
          for (var b = 0; 9 > b; b++) this.buffer_.push(127 & a | 128), a >>= 7;
          this.buffer_.push(1);
        }
      };
      jspb.BinaryEncoder.prototype.writeUnsignedVarint64 = function(a) {
        goog.asserts.assert(a == Math.floor(a));
        goog.asserts.assert(0 <= a && a < jspb.BinaryConstants.TWO_TO_64);
        jspb.utils.splitInt64(a);
        this.writeSplitVarint64(jspb.utils.split64Low, jspb.utils.split64High);
      };
      jspb.BinaryEncoder.prototype.writeSignedVarint64 = function(a) {
        goog.asserts.assert(a == Math.floor(a));
        goog.asserts.assert(a >= -jspb.BinaryConstants.TWO_TO_63 && a < jspb.BinaryConstants.TWO_TO_63);
        jspb.utils.splitInt64(a);
        this.writeSplitVarint64(jspb.utils.split64Low, jspb.utils.split64High);
      };
      jspb.BinaryEncoder.prototype.writeZigzagVarint32 = function(a) {
        goog.asserts.assert(a == Math.floor(a));
        goog.asserts.assert(a >= -jspb.BinaryConstants.TWO_TO_31 && a < jspb.BinaryConstants.TWO_TO_31);
        this.writeUnsignedVarint32((a << 1 ^ a >> 31) >>> 0);
      };
      jspb.BinaryEncoder.prototype.writeZigzagVarint64 = function(a) {
        goog.asserts.assert(a == Math.floor(a));
        goog.asserts.assert(a >= -jspb.BinaryConstants.TWO_TO_63 && a < jspb.BinaryConstants.TWO_TO_63);
        jspb.utils.splitZigzag64(a);
        this.writeSplitVarint64(jspb.utils.split64Low, jspb.utils.split64High);
      };
      jspb.BinaryEncoder.prototype.writeZigzagVarint64String = function(a) {
        this.writeZigzagVarint64(parseInt(a, 10));
      };
      jspb.BinaryEncoder.prototype.writeUint8 = function(a) {
        goog.asserts.assert(a == Math.floor(a));
        goog.asserts.assert(0 <= a && 256 > a);
        this.buffer_.push(a >>> 0 & 255);
      };
      jspb.BinaryEncoder.prototype.writeUint16 = function(a) {
        goog.asserts.assert(a == Math.floor(a));
        goog.asserts.assert(0 <= a && 65536 > a);
        this.buffer_.push(a >>> 0 & 255);
        this.buffer_.push(a >>> 8 & 255);
      };
      jspb.BinaryEncoder.prototype.writeUint32 = function(a) {
        goog.asserts.assert(a == Math.floor(a));
        goog.asserts.assert(0 <= a && a < jspb.BinaryConstants.TWO_TO_32);
        this.buffer_.push(a >>> 0 & 255);
        this.buffer_.push(a >>> 8 & 255);
        this.buffer_.push(a >>> 16 & 255);
        this.buffer_.push(a >>> 24 & 255);
      };
      jspb.BinaryEncoder.prototype.writeUint64 = function(a) {
        goog.asserts.assert(a == Math.floor(a));
        goog.asserts.assert(0 <= a && a < jspb.BinaryConstants.TWO_TO_64);
        jspb.utils.splitUint64(a);
        this.writeUint32(jspb.utils.split64Low);
        this.writeUint32(jspb.utils.split64High);
      };
      jspb.BinaryEncoder.prototype.writeInt8 = function(a) {
        goog.asserts.assert(a == Math.floor(a));
        goog.asserts.assert(-128 <= a && 128 > a);
        this.buffer_.push(a >>> 0 & 255);
      };
      jspb.BinaryEncoder.prototype.writeInt16 = function(a) {
        goog.asserts.assert(a == Math.floor(a));
        goog.asserts.assert(-32768 <= a && 32768 > a);
        this.buffer_.push(a >>> 0 & 255);
        this.buffer_.push(a >>> 8 & 255);
      };
      jspb.BinaryEncoder.prototype.writeInt32 = function(a) {
        goog.asserts.assert(a == Math.floor(a));
        goog.asserts.assert(a >= -jspb.BinaryConstants.TWO_TO_31 && a < jspb.BinaryConstants.TWO_TO_31);
        this.buffer_.push(a >>> 0 & 255);
        this.buffer_.push(a >>> 8 & 255);
        this.buffer_.push(a >>> 16 & 255);
        this.buffer_.push(a >>> 24 & 255);
      };
      jspb.BinaryEncoder.prototype.writeInt64 = function(a) {
        goog.asserts.assert(a == Math.floor(a));
        goog.asserts.assert(a >= -jspb.BinaryConstants.TWO_TO_63 && a < jspb.BinaryConstants.TWO_TO_63);
        jspb.utils.splitInt64(a);
        this.writeSplitFixed64(jspb.utils.split64Low, jspb.utils.split64High);
      };
      jspb.BinaryEncoder.prototype.writeInt64String = function(a) {
        goog.asserts.assert(a == Math.floor(a));
        goog.asserts.assert(a >= -jspb.BinaryConstants.TWO_TO_63 && a < jspb.BinaryConstants.TWO_TO_63);
        jspb.utils.splitHash64(jspb.utils.decimalStringToHash64(a));
        this.writeSplitFixed64(jspb.utils.split64Low, jspb.utils.split64High);
      };
      jspb.BinaryEncoder.prototype.writeFloat = function(a) {
        goog.asserts.assert(a >= -jspb.BinaryConstants.FLOAT32_MAX && a <= jspb.BinaryConstants.FLOAT32_MAX);
        jspb.utils.splitFloat32(a);
        this.writeUint32(jspb.utils.split64Low);
      };
      jspb.BinaryEncoder.prototype.writeDouble = function(a) {
        goog.asserts.assert(a >= -jspb.BinaryConstants.FLOAT64_MAX && a <= jspb.BinaryConstants.FLOAT64_MAX);
        jspb.utils.splitFloat64(a);
        this.writeUint32(jspb.utils.split64Low);
        this.writeUint32(jspb.utils.split64High);
      };
      jspb.BinaryEncoder.prototype.writeBool = function(a) {
        goog.asserts.assert(goog.isBoolean(a));
        this.buffer_.push(a ? 1 : 0);
      };
      jspb.BinaryEncoder.prototype.writeEnum = function(a) {
        goog.asserts.assert(a == Math.floor(a));
        goog.asserts.assert(a >= -jspb.BinaryConstants.TWO_TO_31 && a < jspb.BinaryConstants.TWO_TO_31);
        this.writeSignedVarint32(a);
      };
      jspb.BinaryEncoder.prototype.writeBytes = function(a) {
        this.buffer_.push.apply(this.buffer_, a);
      };
      jspb.BinaryEncoder.prototype.writeVarintHash64 = function(a) {
        jspb.utils.splitHash64(a);
        this.writeSplitVarint64(jspb.utils.split64Low, jspb.utils.split64High);
      };
      jspb.BinaryEncoder.prototype.writeFixedHash64 = function(a) {
        jspb.utils.splitHash64(a);
        this.writeUint32(jspb.utils.split64Low);
        this.writeUint32(jspb.utils.split64High);
      };
      jspb.BinaryEncoder.prototype.writeString = function(a) {
        for (var b = this.buffer_.length, c = 0; c < a.length; c++) {
          var d = a.charCodeAt(c);
          if (128 > d) this.buffer_.push(d); else if (2048 > d) this.buffer_.push(d >> 6 | 192), 
          this.buffer_.push(63 & d | 128); else if (65536 > d) if (55296 <= d && 56319 >= d && c + 1 < a.length) {
            var e = a.charCodeAt(c + 1);
            56320 <= e && 57343 >= e && (d = 1024 * (d - 55296) + e - 56320 + 65536, this.buffer_.push(d >> 18 | 240), 
            this.buffer_.push(d >> 12 & 63 | 128), this.buffer_.push(d >> 6 & 63 | 128), this.buffer_.push(63 & d | 128), 
            c++);
          } else this.buffer_.push(d >> 12 | 224), this.buffer_.push(d >> 6 & 63 | 128), this.buffer_.push(63 & d | 128);
        }
        return this.buffer_.length - b;
      };
      jspb.arith = {};
      jspb.arith.UInt64 = function(a, b) {
        this.lo = a;
        this.hi = b;
      };
      jspb.arith.UInt64.prototype.cmp = function(a) {
        return this.hi < a.hi || this.hi == a.hi && this.lo < a.lo ? -1 : this.hi == a.hi && this.lo == a.lo ? 0 : 1;
      };
      jspb.arith.UInt64.prototype.rightShift = function() {
        return new jspb.arith.UInt64((this.lo >>> 1 | (1 & this.hi) << 31) >>> 0, this.hi >>> 1 >>> 0);
      };
      jspb.arith.UInt64.prototype.leftShift = function() {
        return new jspb.arith.UInt64(this.lo << 1 >>> 0, (this.hi << 1 | this.lo >>> 31) >>> 0);
      };
      jspb.arith.UInt64.prototype.msb = function() {
        return !!(2147483648 & this.hi);
      };
      jspb.arith.UInt64.prototype.lsb = function() {
        return !!(1 & this.lo);
      };
      jspb.arith.UInt64.prototype.zero = function() {
        return 0 == this.lo && 0 == this.hi;
      };
      jspb.arith.UInt64.prototype.add = function(a) {
        return new jspb.arith.UInt64((this.lo + a.lo & 4294967295) >>> 0 >>> 0, ((this.hi + a.hi & 4294967295) >>> 0) + (4294967296 <= this.lo + a.lo ? 1 : 0) >>> 0);
      };
      jspb.arith.UInt64.prototype.sub = function(a) {
        return new jspb.arith.UInt64((this.lo - a.lo & 4294967295) >>> 0 >>> 0, ((this.hi - a.hi & 4294967295) >>> 0) - (0 > this.lo - a.lo ? 1 : 0) >>> 0);
      };
      jspb.arith.UInt64.mul32x32 = function(a, b) {
        for (var c = 65535 & a, d = a >>> 16, e = 65535 & b, f = b >>> 16, g = c * e + 65536 * (c * f & 65535) + 65536 * (d * e & 65535), c = d * f + (c * f >>> 16) + (d * e >>> 16); 4294967296 <= g; ) g -= 4294967296, 
        c += 1;
        return new jspb.arith.UInt64(g >>> 0, c >>> 0);
      };
      jspb.arith.UInt64.prototype.mul = function(a) {
        var b = jspb.arith.UInt64.mul32x32(this.lo, a);
        a = jspb.arith.UInt64.mul32x32(this.hi, a);
        a.hi = a.lo;
        a.lo = 0;
        return b.add(a);
      };
      jspb.arith.UInt64.prototype.div = function(a) {
        if (0 == a) return [];
        var b = new jspb.arith.UInt64(0, 0), c = new jspb.arith.UInt64(this.lo, this.hi);
        a = new jspb.arith.UInt64(a, 0);
        for (var d = new jspb.arith.UInt64(1, 0); !a.msb(); ) a = a.leftShift(), d = d.leftShift();
        for (;!d.zero(); ) 0 >= a.cmp(c) && (b = b.add(d), c = c.sub(a)), a = a.rightShift(), 
        d = d.rightShift();
        return [ b, c ];
      };
      jspb.arith.UInt64.prototype.toString = function() {
        for (var a = "", b = this; !b.zero(); ) var b = b.div(10), c = b[0], a = b[1].lo + a, b = c;
        "" == a && (a = "0");
        return a;
      };
      jspb.arith.UInt64.fromString = function(a) {
        for (var b = new jspb.arith.UInt64(0, 0), c = new jspb.arith.UInt64(0, 0), d = 0; d < a.length; d++) {
          if ("0" > a[d] || "9" < a[d]) return null;
          var e = parseInt(a[d], 10);
          c.lo = e;
          b = b.mul(10).add(c);
        }
        return b;
      };
      jspb.arith.UInt64.prototype.clone = function() {
        return new jspb.arith.UInt64(this.lo, this.hi);
      };
      jspb.arith.Int64 = function(a, b) {
        this.lo = a;
        this.hi = b;
      };
      jspb.arith.Int64.prototype.add = function(a) {
        return new jspb.arith.Int64((this.lo + a.lo & 4294967295) >>> 0 >>> 0, ((this.hi + a.hi & 4294967295) >>> 0) + (4294967296 <= this.lo + a.lo ? 1 : 0) >>> 0);
      };
      jspb.arith.Int64.prototype.sub = function(a) {
        return new jspb.arith.Int64((this.lo - a.lo & 4294967295) >>> 0 >>> 0, ((this.hi - a.hi & 4294967295) >>> 0) - (0 > this.lo - a.lo ? 1 : 0) >>> 0);
      };
      jspb.arith.Int64.prototype.clone = function() {
        return new jspb.arith.Int64(this.lo, this.hi);
      };
      jspb.arith.Int64.prototype.toString = function() {
        var a = 0 != (2147483648 & this.hi), b = new jspb.arith.UInt64(this.lo, this.hi);
        a && (b = new jspb.arith.UInt64(0, 0).sub(b));
        return (a ? "-" : "") + b.toString();
      };
      jspb.arith.Int64.fromString = function(a) {
        var b = 0 < a.length && "-" == a[0];
        b && (a = a.substring(1));
        a = jspb.arith.UInt64.fromString(a);
        if (null === a) return null;
        b && (a = new jspb.arith.UInt64(0, 0).sub(a));
        return new jspb.arith.Int64(a.lo, a.hi);
      };
      jspb.BinaryWriter = function() {
        this.blocks_ = [];
        this.totalLength_ = 0;
        this.encoder_ = new jspb.BinaryEncoder();
        this.bookmarks_ = [];
      };
      jspb.BinaryWriter.prototype.appendUint8Array_ = function(a) {
        var b = this.encoder_.end();
        this.blocks_.push(b);
        this.blocks_.push(a);
        this.totalLength_ += b.length + a.length;
      };
      jspb.BinaryWriter.prototype.beginDelimited_ = function(a) {
        this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.DELIMITED);
        a = this.encoder_.end();
        this.blocks_.push(a);
        this.totalLength_ += a.length;
        a.push(this.totalLength_);
        return a;
      };
      jspb.BinaryWriter.prototype.endDelimited_ = function(a) {
        var b = a.pop(), b = this.totalLength_ + this.encoder_.length() - b;
        for (goog.asserts.assert(0 <= b); 127 < b; ) a.push(127 & b | 128), b >>>= 7, this.totalLength_++;
        a.push(b);
        this.totalLength_++;
      };
      jspb.BinaryWriter.prototype.writeSerializedMessage = function(a, b, c) {
        this.appendUint8Array_(a.subarray(b, c));
      };
      jspb.BinaryWriter.prototype.maybeWriteSerializedMessage = function(a, b, c) {
        null != a && null != b && null != c && this.writeSerializedMessage(a, b, c);
      };
      jspb.BinaryWriter.prototype.reset = function() {
        this.blocks_ = [];
        this.encoder_.end();
        this.totalLength_ = 0;
        this.bookmarks_ = [];
      };
      jspb.BinaryWriter.prototype.getResultBuffer = function() {
        goog.asserts.assert(0 == this.bookmarks_.length);
        for (var a = new Uint8Array(this.totalLength_ + this.encoder_.length()), b = this.blocks_, c = b.length, d = 0, e = 0; e < c; e++) {
          var f = b[e];
          a.set(f, d);
          d += f.length;
        }
        b = this.encoder_.end();
        a.set(b, d);
        d += b.length;
        goog.asserts.assert(d == a.length);
        this.blocks_ = [ a ];
        return a;
      };
      jspb.BinaryWriter.prototype.getResultBase64String = function() {
        return goog.crypt.base64.encodeByteArray(this.getResultBuffer());
      };
      jspb.BinaryWriter.prototype.beginSubMessage = function(a) {
        this.bookmarks_.push(this.beginDelimited_(a));
      };
      jspb.BinaryWriter.prototype.endSubMessage = function() {
        goog.asserts.assert(0 <= this.bookmarks_.length);
        this.endDelimited_(this.bookmarks_.pop());
      };
      jspb.BinaryWriter.prototype.writeFieldHeader_ = function(a, b) {
        goog.asserts.assert(1 <= a && a == Math.floor(a));
        this.encoder_.writeUnsignedVarint32(8 * a + b);
      };
      jspb.BinaryWriter.prototype.writeAny = function(a, b, c) {
        var d = jspb.BinaryConstants.FieldType;
        switch (a) {
         case d.DOUBLE:
          this.writeDouble(b, c);
          break;

         case d.FLOAT:
          this.writeFloat(b, c);
          break;

         case d.INT64:
          this.writeInt64(b, c);
          break;

         case d.UINT64:
          this.writeUint64(b, c);
          break;

         case d.INT32:
          this.writeInt32(b, c);
          break;

         case d.FIXED64:
          this.writeFixed64(b, c);
          break;

         case d.FIXED32:
          this.writeFixed32(b, c);
          break;

         case d.BOOL:
          this.writeBool(b, c);
          break;

         case d.STRING:
          this.writeString(b, c);
          break;

         case d.GROUP:
          goog.asserts.fail("Group field type not supported in writeAny()");
          break;

         case d.MESSAGE:
          goog.asserts.fail("Message field type not supported in writeAny()");
          break;

         case d.BYTES:
          this.writeBytes(b, c);
          break;

         case d.UINT32:
          this.writeUint32(b, c);
          break;

         case d.ENUM:
          this.writeEnum(b, c);
          break;

         case d.SFIXED32:
          this.writeSfixed32(b, c);
          break;

         case d.SFIXED64:
          this.writeSfixed64(b, c);
          break;

         case d.SINT32:
          this.writeSint32(b, c);
          break;

         case d.SINT64:
          this.writeSint64(b, c);
          break;

         case d.FHASH64:
          this.writeFixedHash64(b, c);
          break;

         case d.VHASH64:
          this.writeVarintHash64(b, c);
          break;

         default:
          goog.asserts.fail("Invalid field type in writeAny()");
        }
      };
      jspb.BinaryWriter.prototype.writeUnsignedVarint32_ = function(a, b) {
        null != b && (this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.VARINT), this.encoder_.writeUnsignedVarint32(b));
      };
      jspb.BinaryWriter.prototype.writeSignedVarint32_ = function(a, b) {
        null != b && (this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.VARINT), this.encoder_.writeSignedVarint32(b));
      };
      jspb.BinaryWriter.prototype.writeUnsignedVarint64_ = function(a, b) {
        null != b && (this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.VARINT), this.encoder_.writeUnsignedVarint64(b));
      };
      jspb.BinaryWriter.prototype.writeSignedVarint64_ = function(a, b) {
        null != b && (this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.VARINT), this.encoder_.writeSignedVarint64(b));
      };
      jspb.BinaryWriter.prototype.writeZigzagVarint32_ = function(a, b) {
        null != b && (this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.VARINT), this.encoder_.writeZigzagVarint32(b));
      };
      jspb.BinaryWriter.prototype.writeZigzagVarint64_ = function(a, b) {
        null != b && (this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.VARINT), this.encoder_.writeZigzagVarint64(b));
      };
      jspb.BinaryWriter.prototype.writeZigzagVarint64String_ = function(a, b) {
        null != b && (this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.VARINT), this.encoder_.writeZigzagVarint64String(b));
      };
      jspb.BinaryWriter.prototype.writeInt32 = function(a, b) {
        null != b && (goog.asserts.assert(b >= -jspb.BinaryConstants.TWO_TO_31 && b < jspb.BinaryConstants.TWO_TO_31), 
        this.writeSignedVarint32_(a, b));
      };
      jspb.BinaryWriter.prototype.writeInt32String = function(a, b) {
        if (null != b) {
          var c = parseInt(b, 10);
          goog.asserts.assert(c >= -jspb.BinaryConstants.TWO_TO_31 && c < jspb.BinaryConstants.TWO_TO_31);
          this.writeSignedVarint32_(a, c);
        }
      };
      jspb.BinaryWriter.prototype.writeInt64 = function(a, b) {
        null != b && (goog.asserts.assert(b >= -jspb.BinaryConstants.TWO_TO_63 && b < jspb.BinaryConstants.TWO_TO_63), 
        this.writeSignedVarint64_(a, b));
      };
      jspb.BinaryWriter.prototype.writeInt64String = function(a, b) {
        if (null != b) {
          var c = jspb.arith.Int64.fromString(b);
          this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.VARINT);
          this.encoder_.writeSplitVarint64(c.lo, c.hi);
        }
      };
      jspb.BinaryWriter.prototype.writeUint32 = function(a, b) {
        null != b && (goog.asserts.assert(0 <= b && b < jspb.BinaryConstants.TWO_TO_32), 
        this.writeUnsignedVarint32_(a, b));
      };
      jspb.BinaryWriter.prototype.writeUint32String = function(a, b) {
        if (null != b) {
          var c = parseInt(b, 10);
          goog.asserts.assert(0 <= c && c < jspb.BinaryConstants.TWO_TO_32);
          this.writeUnsignedVarint32_(a, c);
        }
      };
      jspb.BinaryWriter.prototype.writeUint64 = function(a, b) {
        null != b && (goog.asserts.assert(0 <= b && b < jspb.BinaryConstants.TWO_TO_64), 
        this.writeUnsignedVarint64_(a, b));
      };
      jspb.BinaryWriter.prototype.writeUint64String = function(a, b) {
        if (null != b) {
          var c = jspb.arith.UInt64.fromString(b);
          this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.VARINT);
          this.encoder_.writeSplitVarint64(c.lo, c.hi);
        }
      };
      jspb.BinaryWriter.prototype.writeSint32 = function(a, b) {
        null != b && (goog.asserts.assert(b >= -jspb.BinaryConstants.TWO_TO_31 && b < jspb.BinaryConstants.TWO_TO_31), 
        this.writeZigzagVarint32_(a, b));
      };
      jspb.BinaryWriter.prototype.writeSint64 = function(a, b) {
        null != b && (goog.asserts.assert(b >= -jspb.BinaryConstants.TWO_TO_63 && b < jspb.BinaryConstants.TWO_TO_63), 
        this.writeZigzagVarint64_(a, b));
      };
      jspb.BinaryWriter.prototype.writeSint64String = function(a, b) {
        null != b && (goog.asserts.assert(b >= -jspb.BinaryConstants.TWO_TO_63 && b < jspb.BinaryConstants.TWO_TO_63), 
        this.writeZigzagVarint64String_(a, b));
      };
      jspb.BinaryWriter.prototype.writeFixed32 = function(a, b) {
        null != b && (goog.asserts.assert(0 <= b && b < jspb.BinaryConstants.TWO_TO_32), 
        this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.FIXED32), this.encoder_.writeUint32(b));
      };
      jspb.BinaryWriter.prototype.writeFixed64 = function(a, b) {
        null != b && (goog.asserts.assert(0 <= b && b < jspb.BinaryConstants.TWO_TO_64), 
        this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.FIXED64), this.encoder_.writeUint64(b));
      };
      jspb.BinaryWriter.prototype.writeFixed64String = function(a, b) {
        if (null != b) {
          var c = jspb.arith.UInt64.fromString(b);
          this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.FIXED64);
          this.encoder_.writeSplitFixed64(c.lo, c.hi);
        }
      };
      jspb.BinaryWriter.prototype.writeSfixed32 = function(a, b) {
        null != b && (goog.asserts.assert(b >= -jspb.BinaryConstants.TWO_TO_31 && b < jspb.BinaryConstants.TWO_TO_31), 
        this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.FIXED32), this.encoder_.writeInt32(b));
      };
      jspb.BinaryWriter.prototype.writeSfixed64 = function(a, b) {
        null != b && (goog.asserts.assert(b >= -jspb.BinaryConstants.TWO_TO_63 && b < jspb.BinaryConstants.TWO_TO_63), 
        this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.FIXED64), this.encoder_.writeInt64(b));
      };
      jspb.BinaryWriter.prototype.writeSfixed64String = function(a, b) {
        if (null != b) {
          var c = jspb.arith.Int64.fromString(b);
          this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.FIXED64);
          this.encoder_.writeSplitFixed64(c.lo, c.hi);
        }
      };
      jspb.BinaryWriter.prototype.writeFloat = function(a, b) {
        null != b && (this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.FIXED32), 
        this.encoder_.writeFloat(b));
      };
      jspb.BinaryWriter.prototype.writeDouble = function(a, b) {
        null != b && (this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.FIXED64), 
        this.encoder_.writeDouble(b));
      };
      jspb.BinaryWriter.prototype.writeBool = function(a, b) {
        null != b && (goog.asserts.assert(goog.isBoolean(b)), this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.VARINT), 
        this.encoder_.writeBool(b));
      };
      jspb.BinaryWriter.prototype.writeEnum = function(a, b) {
        null != b && (goog.asserts.assert(b >= -jspb.BinaryConstants.TWO_TO_31 && b < jspb.BinaryConstants.TWO_TO_31), 
        this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.VARINT), this.encoder_.writeSignedVarint32(b));
      };
      jspb.BinaryWriter.prototype.writeString = function(a, b) {
        if (null != b) {
          var c = this.beginDelimited_(a);
          this.encoder_.writeString(b);
          this.endDelimited_(c);
        }
      };
      jspb.BinaryWriter.prototype.writeBytes = function(a, b) {
        if (null != b) {
          var c = jspb.utils.byteSourceToUint8Array(b);
          this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.DELIMITED);
          this.encoder_.writeUnsignedVarint32(c.length);
          this.appendUint8Array_(c);
        }
      };
      jspb.BinaryWriter.prototype.writeMessage = function(a, b, c) {
        null != b && (a = this.beginDelimited_(a), c(b, this), this.endDelimited_(a));
      };
      jspb.BinaryWriter.prototype.writeGroup = function(a, b, c) {
        null != b && (this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.START_GROUP), 
        c(b, this), this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.END_GROUP));
      };
      jspb.BinaryWriter.prototype.writeFixedHash64 = function(a, b) {
        null != b && (goog.asserts.assert(8 == b.length), this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.FIXED64), 
        this.encoder_.writeFixedHash64(b));
      };
      jspb.BinaryWriter.prototype.writeVarintHash64 = function(a, b) {
        null != b && (goog.asserts.assert(8 == b.length), this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.VARINT), 
        this.encoder_.writeVarintHash64(b));
      };
      jspb.BinaryWriter.prototype.writeRepeatedInt32 = function(a, b) {
        if (null != b) for (var c = 0; c < b.length; c++) this.writeSignedVarint32_(a, b[c]);
      };
      jspb.BinaryWriter.prototype.writeRepeatedInt32String = function(a, b) {
        if (null != b) for (var c = 0; c < b.length; c++) this.writeInt32String(a, b[c]);
      };
      jspb.BinaryWriter.prototype.writeRepeatedInt64 = function(a, b) {
        if (null != b) for (var c = 0; c < b.length; c++) this.writeSignedVarint64_(a, b[c]);
      };
      jspb.BinaryWriter.prototype.writeRepeatedInt64String = function(a, b) {
        if (null != b) for (var c = 0; c < b.length; c++) this.writeInt64String(a, b[c]);
      };
      jspb.BinaryWriter.prototype.writeRepeatedUint32 = function(a, b) {
        if (null != b) for (var c = 0; c < b.length; c++) this.writeUnsignedVarint32_(a, b[c]);
      };
      jspb.BinaryWriter.prototype.writeRepeatedUint32String = function(a, b) {
        if (null != b) for (var c = 0; c < b.length; c++) this.writeUint32String(a, b[c]);
      };
      jspb.BinaryWriter.prototype.writeRepeatedUint64 = function(a, b) {
        if (null != b) for (var c = 0; c < b.length; c++) this.writeUnsignedVarint64_(a, b[c]);
      };
      jspb.BinaryWriter.prototype.writeRepeatedUint64String = function(a, b) {
        if (null != b) for (var c = 0; c < b.length; c++) this.writeUint64String(a, b[c]);
      };
      jspb.BinaryWriter.prototype.writeRepeatedSint32 = function(a, b) {
        if (null != b) for (var c = 0; c < b.length; c++) this.writeZigzagVarint32_(a, b[c]);
      };
      jspb.BinaryWriter.prototype.writeRepeatedSint64 = function(a, b) {
        if (null != b) for (var c = 0; c < b.length; c++) this.writeZigzagVarint64_(a, b[c]);
      };
      jspb.BinaryWriter.prototype.writeRepeatedSint64String = function(a, b) {
        if (null != b) for (var c = 0; c < b.length; c++) this.writeZigzagVarint64String_(a, b[c]);
      };
      jspb.BinaryWriter.prototype.writeRepeatedFixed32 = function(a, b) {
        if (null != b) for (var c = 0; c < b.length; c++) this.writeFixed32(a, b[c]);
      };
      jspb.BinaryWriter.prototype.writeRepeatedFixed64 = function(a, b) {
        if (null != b) for (var c = 0; c < b.length; c++) this.writeFixed64(a, b[c]);
      };
      jspb.BinaryWriter.prototype.writeRepeatedFixed64String = function(a, b) {
        if (null != b) for (var c = 0; c < b.length; c++) this.writeFixed64String(a, b[c]);
      };
      jspb.BinaryWriter.prototype.writeRepeatedSfixed32 = function(a, b) {
        if (null != b) for (var c = 0; c < b.length; c++) this.writeSfixed32(a, b[c]);
      };
      jspb.BinaryWriter.prototype.writeRepeatedSfixed64 = function(a, b) {
        if (null != b) for (var c = 0; c < b.length; c++) this.writeSfixed64(a, b[c]);
      };
      jspb.BinaryWriter.prototype.writeRepeatedSfixed64String = function(a, b) {
        if (null != b) for (var c = 0; c < b.length; c++) this.writeSfixed64String(a, b[c]);
      };
      jspb.BinaryWriter.prototype.writeRepeatedFloat = function(a, b) {
        if (null != b) for (var c = 0; c < b.length; c++) this.writeFloat(a, b[c]);
      };
      jspb.BinaryWriter.prototype.writeRepeatedDouble = function(a, b) {
        if (null != b) for (var c = 0; c < b.length; c++) this.writeDouble(a, b[c]);
      };
      jspb.BinaryWriter.prototype.writeRepeatedBool = function(a, b) {
        if (null != b) for (var c = 0; c < b.length; c++) this.writeBool(a, b[c]);
      };
      jspb.BinaryWriter.prototype.writeRepeatedEnum = function(a, b) {
        if (null != b) for (var c = 0; c < b.length; c++) this.writeEnum(a, b[c]);
      };
      jspb.BinaryWriter.prototype.writeRepeatedString = function(a, b) {
        if (null != b) for (var c = 0; c < b.length; c++) this.writeString(a, b[c]);
      };
      jspb.BinaryWriter.prototype.writeRepeatedBytes = function(a, b) {
        if (null != b) for (var c = 0; c < b.length; c++) this.writeBytes(a, b[c]);
      };
      jspb.BinaryWriter.prototype.writeRepeatedMessage = function(a, b, c) {
        if (null != b) for (var d = 0; d < b.length; d++) {
          var e = this.beginDelimited_(a);
          c(b[d], this);
          this.endDelimited_(e);
        }
      };
      jspb.BinaryWriter.prototype.writeRepeatedGroup = function(a, b, c) {
        if (null != b) for (var d = 0; d < b.length; d++) this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.START_GROUP), 
        c(b[d], this), this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.END_GROUP);
      };
      jspb.BinaryWriter.prototype.writeRepeatedFixedHash64 = function(a, b) {
        if (null != b) for (var c = 0; c < b.length; c++) this.writeFixedHash64(a, b[c]);
      };
      jspb.BinaryWriter.prototype.writeRepeatedVarintHash64 = function(a, b) {
        if (null != b) for (var c = 0; c < b.length; c++) this.writeVarintHash64(a, b[c]);
      };
      jspb.BinaryWriter.prototype.writePackedInt32 = function(a, b) {
        if (null != b && b.length) {
          for (var c = this.beginDelimited_(a), d = 0; d < b.length; d++) this.encoder_.writeSignedVarint32(b[d]);
          this.endDelimited_(c);
        }
      };
      jspb.BinaryWriter.prototype.writePackedInt32String = function(a, b) {
        if (null != b && b.length) {
          for (var c = this.beginDelimited_(a), d = 0; d < b.length; d++) this.encoder_.writeSignedVarint32(parseInt(b[d], 10));
          this.endDelimited_(c);
        }
      };
      jspb.BinaryWriter.prototype.writePackedInt64 = function(a, b) {
        if (null != b && b.length) {
          for (var c = this.beginDelimited_(a), d = 0; d < b.length; d++) this.encoder_.writeSignedVarint64(b[d]);
          this.endDelimited_(c);
        }
      };
      jspb.BinaryWriter.prototype.writePackedInt64String = function(a, b) {
        if (null != b && b.length) {
          for (var c = this.beginDelimited_(a), d = 0; d < b.length; d++) {
            var e = jspb.arith.Int64.fromString(b[d]);
            this.encoder_.writeSplitVarint64(e.lo, e.hi);
          }
          this.endDelimited_(c);
        }
      };
      jspb.BinaryWriter.prototype.writePackedUint32 = function(a, b) {
        if (null != b && b.length) {
          for (var c = this.beginDelimited_(a), d = 0; d < b.length; d++) this.encoder_.writeUnsignedVarint32(b[d]);
          this.endDelimited_(c);
        }
      };
      jspb.BinaryWriter.prototype.writePackedUint32String = function(a, b) {
        if (null != b && b.length) {
          for (var c = this.beginDelimited_(a), d = 0; d < b.length; d++) this.encoder_.writeUnsignedVarint32(parseInt(b[d], 10));
          this.endDelimited_(c);
        }
      };
      jspb.BinaryWriter.prototype.writePackedUint64 = function(a, b) {
        if (null != b && b.length) {
          for (var c = this.beginDelimited_(a), d = 0; d < b.length; d++) this.encoder_.writeUnsignedVarint64(b[d]);
          this.endDelimited_(c);
        }
      };
      jspb.BinaryWriter.prototype.writePackedUint64String = function(a, b) {
        if (null != b && b.length) {
          for (var c = this.beginDelimited_(a), d = 0; d < b.length; d++) {
            var e = jspb.arith.UInt64.fromString(b[d]);
            this.encoder_.writeSplitVarint64(e.lo, e.hi);
          }
          this.endDelimited_(c);
        }
      };
      jspb.BinaryWriter.prototype.writePackedSint32 = function(a, b) {
        if (null != b && b.length) {
          for (var c = this.beginDelimited_(a), d = 0; d < b.length; d++) this.encoder_.writeZigzagVarint32(b[d]);
          this.endDelimited_(c);
        }
      };
      jspb.BinaryWriter.prototype.writePackedSint64 = function(a, b) {
        if (null != b && b.length) {
          for (var c = this.beginDelimited_(a), d = 0; d < b.length; d++) this.encoder_.writeZigzagVarint64(b[d]);
          this.endDelimited_(c);
        }
      };
      jspb.BinaryWriter.prototype.writePackedSint64String = function(a, b) {
        if (null != b && b.length) {
          for (var c = this.beginDelimited_(a), d = 0; d < b.length; d++) this.encoder_.writeZigzagVarint64(parseInt(b[d], 10));
          this.endDelimited_(c);
        }
      };
      jspb.BinaryWriter.prototype.writePackedFixed32 = function(a, b) {
        if (null != b && b.length) {
          this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.DELIMITED);
          this.encoder_.writeUnsignedVarint32(4 * b.length);
          for (var c = 0; c < b.length; c++) this.encoder_.writeUint32(b[c]);
        }
      };
      jspb.BinaryWriter.prototype.writePackedFixed64 = function(a, b) {
        if (null != b && b.length) {
          this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.DELIMITED);
          this.encoder_.writeUnsignedVarint32(8 * b.length);
          for (var c = 0; c < b.length; c++) this.encoder_.writeUint64(b[c]);
        }
      };
      jspb.BinaryWriter.prototype.writePackedFixed64String = function(a, b) {
        if (null != b && b.length) {
          this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.DELIMITED);
          this.encoder_.writeUnsignedVarint32(8 * b.length);
          for (var c = 0; c < b.length; c++) {
            var d = jspb.arith.UInt64.fromString(b[c]);
            this.encoder_.writeSplitFixed64(d.lo, d.hi);
          }
        }
      };
      jspb.BinaryWriter.prototype.writePackedSfixed32 = function(a, b) {
        if (null != b && b.length) {
          this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.DELIMITED);
          this.encoder_.writeUnsignedVarint32(4 * b.length);
          for (var c = 0; c < b.length; c++) this.encoder_.writeInt32(b[c]);
        }
      };
      jspb.BinaryWriter.prototype.writePackedSfixed64 = function(a, b) {
        if (null != b && b.length) {
          this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.DELIMITED);
          this.encoder_.writeUnsignedVarint32(8 * b.length);
          for (var c = 0; c < b.length; c++) this.encoder_.writeInt64(b[c]);
        }
      };
      jspb.BinaryWriter.prototype.writePackedSfixed64String = function(a, b) {
        if (null != b && b.length) {
          this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.DELIMITED);
          this.encoder_.writeUnsignedVarint32(8 * b.length);
          for (var c = 0; c < b.length; c++) this.encoder_.writeInt64String(b[c]);
        }
      };
      jspb.BinaryWriter.prototype.writePackedFloat = function(a, b) {
        if (null != b && b.length) {
          this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.DELIMITED);
          this.encoder_.writeUnsignedVarint32(4 * b.length);
          for (var c = 0; c < b.length; c++) this.encoder_.writeFloat(b[c]);
        }
      };
      jspb.BinaryWriter.prototype.writePackedDouble = function(a, b) {
        if (null != b && b.length) {
          this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.DELIMITED);
          this.encoder_.writeUnsignedVarint32(8 * b.length);
          for (var c = 0; c < b.length; c++) this.encoder_.writeDouble(b[c]);
        }
      };
      jspb.BinaryWriter.prototype.writePackedBool = function(a, b) {
        if (null != b && b.length) {
          this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.DELIMITED);
          this.encoder_.writeUnsignedVarint32(b.length);
          for (var c = 0; c < b.length; c++) this.encoder_.writeBool(b[c]);
        }
      };
      jspb.BinaryWriter.prototype.writePackedEnum = function(a, b) {
        if (null != b && b.length) {
          for (var c = this.beginDelimited_(a), d = 0; d < b.length; d++) this.encoder_.writeEnum(b[d]);
          this.endDelimited_(c);
        }
      };
      jspb.BinaryWriter.prototype.writePackedFixedHash64 = function(a, b) {
        if (null != b && b.length) {
          this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.DELIMITED);
          this.encoder_.writeUnsignedVarint32(8 * b.length);
          for (var c = 0; c < b.length; c++) this.encoder_.writeFixedHash64(b[c]);
        }
      };
      jspb.BinaryWriter.prototype.writePackedVarintHash64 = function(a, b) {
        if (null != b && b.length) {
          for (var c = this.beginDelimited_(a), d = 0; d < b.length; d++) this.encoder_.writeVarintHash64(b[d]);
          this.endDelimited_(c);
        }
      };
      exports.Map = jspb.Map;
      exports.Message = jspb.Message;
      exports.BinaryReader = jspb.BinaryReader;
      exports.BinaryWriter = jspb.BinaryWriter;
      exports.ExtensionFieldInfo = jspb.ExtensionFieldInfo;
      exports.ExtensionFieldBinaryInfo = jspb.ExtensionFieldBinaryInfo;
      exports.exportSymbol = goog.exportSymbol;
      exports.inherits = goog.inherits;
      exports.object = {
        extend: goog.object.extend
      };
      exports.typeOf = goog.typeOf;
      cc._RF.pop();
    }).call(this, "undefined" !== typeof global ? global : "undefined" !== typeof self ? self : "undefined" !== typeof window ? window : {});
  }, {} ],
  gzip: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "08841/yBvBCWo9TtLYnD6ad", "gzip");
    "use strict";
    cc.Codec.GZip = function Jacob__GZip(data) {
      this.data = data;
      this.debug = false;
      this.gpflags = void 0;
      this.files = 0;
      this.unzipped = [];
      this.buf32k = new Array(32768);
      this.bIdx = 0;
      this.modeZIP = false;
      this.bytepos = 0;
      this.bb = 1;
      this.bits = 0;
      this.nameBuf = [];
      this.fileout = void 0;
      this.literalTree = new Array(cc.Codec.GZip.LITERALS);
      this.distanceTree = new Array(32);
      this.treepos = 0;
      this.Places = null;
      this.len = 0;
      this.fpos = new Array(17);
      this.fpos[0] = 0;
      this.flens = void 0;
      this.fmax = void 0;
    };
    cc.Codec.GZip.gunzip = function(string) {
      string.constructor === Array || string.constructor === String;
      var gzip = new cc.Codec.GZip(string);
      return gzip.gunzip()[0][0];
    };
    cc.Codec.GZip.HufNode = function() {
      this.b0 = 0;
      this.b1 = 0;
      this.jump = null;
      this.jumppos = -1;
    };
    cc.Codec.GZip.LITERALS = 288;
    cc.Codec.GZip.NAMEMAX = 256;
    cc.Codec.GZip.bitReverse = [ 0, 128, 64, 192, 32, 160, 96, 224, 16, 144, 80, 208, 48, 176, 112, 240, 8, 136, 72, 200, 40, 168, 104, 232, 24, 152, 88, 216, 56, 184, 120, 248, 4, 132, 68, 196, 36, 164, 100, 228, 20, 148, 84, 212, 52, 180, 116, 244, 12, 140, 76, 204, 44, 172, 108, 236, 28, 156, 92, 220, 60, 188, 124, 252, 2, 130, 66, 194, 34, 162, 98, 226, 18, 146, 82, 210, 50, 178, 114, 242, 10, 138, 74, 202, 42, 170, 106, 234, 26, 154, 90, 218, 58, 186, 122, 250, 6, 134, 70, 198, 38, 166, 102, 230, 22, 150, 86, 214, 54, 182, 118, 246, 14, 142, 78, 206, 46, 174, 110, 238, 30, 158, 94, 222, 62, 190, 126, 254, 1, 129, 65, 193, 33, 161, 97, 225, 17, 145, 81, 209, 49, 177, 113, 241, 9, 137, 73, 201, 41, 169, 105, 233, 25, 153, 89, 217, 57, 185, 121, 249, 5, 133, 69, 197, 37, 165, 101, 229, 21, 149, 85, 213, 53, 181, 117, 245, 13, 141, 77, 205, 45, 173, 109, 237, 29, 157, 93, 221, 61, 189, 125, 253, 3, 131, 67, 195, 35, 163, 99, 227, 19, 147, 83, 211, 51, 179, 115, 243, 11, 139, 75, 203, 43, 171, 107, 235, 27, 155, 91, 219, 59, 187, 123, 251, 7, 135, 71, 199, 39, 167, 103, 231, 23, 151, 87, 215, 55, 183, 119, 247, 15, 143, 79, 207, 47, 175, 111, 239, 31, 159, 95, 223, 63, 191, 127, 255 ];
    cc.Codec.GZip.cplens = [ 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0 ];
    cc.Codec.GZip.cplext = [ 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 99, 99 ];
    cc.Codec.GZip.cpdist = [ 1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577 ];
    cc.Codec.GZip.cpdext = [ 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13 ];
    cc.Codec.GZip.border = [ 16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15 ];
    cc.Codec.GZip.prototype.gunzip = function() {
      this.outputArr = [];
      this.nextFile();
      return this.unzipped;
    };
    cc.Codec.GZip.prototype.readByte = function() {
      this.bits += 8;
      return this.bytepos < this.data.length ? this.data.charCodeAt(this.bytepos++) : -1;
    };
    cc.Codec.GZip.prototype.byteAlign = function() {
      this.bb = 1;
    };
    cc.Codec.GZip.prototype.readBit = function() {
      var carry;
      this.bits++;
      carry = 1 & this.bb;
      this.bb >>= 1;
      if (0 === this.bb) {
        this.bb = this.readByte();
        carry = 1 & this.bb;
        this.bb = this.bb >> 1 | 128;
      }
      return carry;
    };
    cc.Codec.GZip.prototype.readBits = function(a) {
      var res = 0, i = a;
      while (i--) res = res << 1 | this.readBit();
      a && (res = cc.Codec.GZip.bitReverse[res] >> 8 - a);
      return res;
    };
    cc.Codec.GZip.prototype.flushBuffer = function() {
      this.bIdx = 0;
    };
    cc.Codec.GZip.prototype.addBuffer = function(a) {
      this.buf32k[this.bIdx++] = a;
      this.outputArr.push(String.fromCharCode(a));
      32768 === this.bIdx && (this.bIdx = 0);
    };
    cc.Codec.GZip.prototype.IsPat = function() {
      while (1) {
        if (this.fpos[this.len] >= this.fmax) return -1;
        if (this.flens[this.fpos[this.len]] === this.len) return this.fpos[this.len]++;
        this.fpos[this.len]++;
      }
    };
    cc.Codec.GZip.prototype.Rec = function() {
      var curplace = this.Places[this.treepos];
      var tmp;
      if (17 === this.len) return -1;
      this.treepos++;
      this.len++;
      tmp = this.IsPat();
      if (tmp >= 0) curplace.b0 = tmp; else {
        curplace.b0 = 32768;
        if (this.Rec()) return -1;
      }
      tmp = this.IsPat();
      if (tmp >= 0) {
        curplace.b1 = tmp;
        curplace.jump = null;
      } else {
        curplace.b1 = 32768;
        curplace.jump = this.Places[this.treepos];
        curplace.jumppos = this.treepos;
        if (this.Rec()) return -1;
      }
      this.len--;
      return 0;
    };
    cc.Codec.GZip.prototype.CreateTree = function(currentTree, numval, lengths, show) {
      var i;
      this.Places = currentTree;
      this.treepos = 0;
      this.flens = lengths;
      this.fmax = numval;
      for (i = 0; i < 17; i++) this.fpos[i] = 0;
      this.len = 0;
      if (this.Rec()) return -1;
      return 0;
    };
    cc.Codec.GZip.prototype.DecodeValue = function(currentTree) {
      var len, i, xtreepos = 0, X = currentTree[xtreepos], b;
      while (1) {
        b = this.readBit();
        if (b) {
          if (!(32768 & X.b1)) return X.b1;
          X = X.jump;
          len = currentTree.length;
          for (i = 0; i < len; i++) if (currentTree[i] === X) {
            xtreepos = i;
            break;
          }
        } else {
          if (!(32768 & X.b0)) return X.b0;
          xtreepos++;
          X = currentTree[xtreepos];
        }
      }
      return -1;
    };
    cc.Codec.GZip.prototype.DeflateLoop = function() {
      var last, c, type, i, len;
      do {
        last = this.readBit();
        type = this.readBits(2);
        if (0 === type) {
          var blockLen, cSum;
          this.byteAlign();
          blockLen = this.readByte();
          blockLen |= this.readByte() << 8;
          cSum = this.readByte();
          cSum |= this.readByte() << 8;
          65535 & (blockLen ^ ~cSum) && document.write("BlockLen checksum mismatch\n");
          while (blockLen--) {
            c = this.readByte();
            this.addBuffer(c);
          }
        } else if (1 === type) {
          var j;
          while (1) {
            j = cc.Codec.GZip.bitReverse[this.readBits(7)] >> 1;
            if (j > 23) {
              j = j << 1 | this.readBit();
              if (j > 199) {
                j -= 128;
                j = j << 1 | this.readBit();
              } else {
                j -= 48;
                j > 143 && (j += 136);
              }
            } else j += 256;
            if (j < 256) this.addBuffer(j); else {
              if (256 === j) break;
              var len, dist;
              j -= 257;
              len = this.readBits(cc.Codec.GZip.cplext[j]) + cc.Codec.GZip.cplens[j];
              j = cc.Codec.GZip.bitReverse[this.readBits(5)] >> 3;
              if (cc.Codec.GZip.cpdext[j] > 8) {
                dist = this.readBits(8);
                dist |= this.readBits(cc.Codec.GZip.cpdext[j] - 8) << 8;
              } else dist = this.readBits(cc.Codec.GZip.cpdext[j]);
              dist += cc.Codec.GZip.cpdist[j];
              for (j = 0; j < len; j++) {
                var c = this.buf32k[this.bIdx - dist & 32767];
                this.addBuffer(c);
              }
            }
          }
        } else if (2 === type) {
          var j, n, literalCodes, distCodes, lenCodes;
          var ll = new Array(320);
          literalCodes = 257 + this.readBits(5);
          distCodes = 1 + this.readBits(5);
          lenCodes = 4 + this.readBits(4);
          for (j = 0; j < 19; j++) ll[j] = 0;
          for (j = 0; j < lenCodes; j++) ll[cc.Codec.GZip.border[j]] = this.readBits(3);
          len = this.distanceTree.length;
          for (i = 0; i < len; i++) this.distanceTree[i] = new cc.Codec.GZip.HufNode();
          if (this.CreateTree(this.distanceTree, 19, ll, 0)) {
            this.flushBuffer();
            return 1;
          }
          n = literalCodes + distCodes;
          i = 0;
          var z = -1;
          while (i < n) {
            z++;
            j = this.DecodeValue(this.distanceTree);
            if (j < 16) ll[i++] = j; else if (16 === j) {
              var l;
              j = 3 + this.readBits(2);
              if (i + j > n) {
                this.flushBuffer();
                return 1;
              }
              l = i ? ll[i - 1] : 0;
              while (j--) ll[i++] = l;
            } else {
              j = 17 === j ? 3 + this.readBits(3) : 11 + this.readBits(7);
              if (i + j > n) {
                this.flushBuffer();
                return 1;
              }
              while (j--) ll[i++] = 0;
            }
          }
          len = this.literalTree.length;
          for (i = 0; i < len; i++) this.literalTree[i] = new cc.Codec.GZip.HufNode();
          if (this.CreateTree(this.literalTree, literalCodes, ll, 0)) {
            this.flushBuffer();
            return 1;
          }
          len = this.literalTree.length;
          for (i = 0; i < len; i++) this.distanceTree[i] = new cc.Codec.GZip.HufNode();
          var ll2 = new Array();
          for (i = literalCodes; i < ll.length; i++) ll2[i - literalCodes] = ll[i];
          if (this.CreateTree(this.distanceTree, distCodes, ll2, 0)) {
            this.flushBuffer();
            return 1;
          }
          while (1) {
            j = this.DecodeValue(this.literalTree);
            if (j >= 256) {
              var len, dist;
              j -= 256;
              if (0 === j) break;
              j--;
              len = this.readBits(cc.Codec.GZip.cplext[j]) + cc.Codec.GZip.cplens[j];
              j = this.DecodeValue(this.distanceTree);
              if (cc.Codec.GZip.cpdext[j] > 8) {
                dist = this.readBits(8);
                dist |= this.readBits(cc.Codec.GZip.cpdext[j] - 8) << 8;
              } else dist = this.readBits(cc.Codec.GZip.cpdext[j]);
              dist += cc.Codec.GZip.cpdist[j];
              while (len--) {
                var c = this.buf32k[this.bIdx - dist & 32767];
                this.addBuffer(c);
              }
            } else this.addBuffer(j);
          }
        }
      } while (!last);
      this.flushBuffer();
      this.byteAlign();
      return 0;
    };
    cc.Codec.GZip.prototype.unzipFile = function(name) {
      var i;
      this.gunzip();
      for (i = 0; i < this.unzipped.length; i++) if (this.unzipped[i][1] === name) return this.unzipped[i][0];
    };
    cc.Codec.GZip.prototype.nextFile = function() {
      this.outputArr = [];
      this.modeZIP = false;
      var tmp = [];
      tmp[0] = this.readByte();
      tmp[1] = this.readByte();
      if (120 === tmp[0] && 218 === tmp[1]) {
        this.DeflateLoop();
        this.unzipped[this.files] = [ this.outputArr.join(""), "geonext.gxt" ];
        this.files++;
      }
      if (31 === tmp[0] && 139 === tmp[1]) {
        this.skipdir();
        this.unzipped[this.files] = [ this.outputArr.join(""), "file" ];
        this.files++;
      }
      if (80 === tmp[0] && 75 === tmp[1]) {
        this.modeZIP = true;
        tmp[2] = this.readByte();
        tmp[3] = this.readByte();
        if (3 === tmp[2] && 4 === tmp[3]) {
          tmp[0] = this.readByte();
          tmp[1] = this.readByte();
          this.gpflags = this.readByte();
          this.gpflags |= this.readByte() << 8;
          var method = this.readByte();
          method |= this.readByte() << 8;
          this.readByte();
          this.readByte();
          this.readByte();
          this.readByte();
          var compSize = this.readByte();
          compSize |= this.readByte() << 8;
          compSize |= this.readByte() << 16;
          compSize |= this.readByte() << 24;
          var size = this.readByte();
          size |= this.readByte() << 8;
          size |= this.readByte() << 16;
          size |= this.readByte() << 24;
          var filelen = this.readByte();
          filelen |= this.readByte() << 8;
          var extralen = this.readByte();
          extralen |= this.readByte() << 8;
          i = 0;
          this.nameBuf = [];
          while (filelen--) {
            var c = this.readByte();
            "/" === c | ":" === c ? i = 0 : i < cc.Codec.GZip.NAMEMAX - 1 && (this.nameBuf[i++] = String.fromCharCode(c));
          }
          this.fileout || (this.fileout = this.nameBuf);
          var i = 0;
          while (i < extralen) {
            c = this.readByte();
            i++;
          }
          if (8 === method) {
            this.DeflateLoop();
            this.unzipped[this.files] = [ this.outputArr.join(""), this.nameBuf.join("") ];
            this.files++;
          }
          this.skipdir();
        }
      }
    };
    cc.Codec.GZip.prototype.skipdir = function() {
      var tmp = [];
      var compSize, size, os, i, c;
      if (8 & this.gpflags) {
        tmp[0] = this.readByte();
        tmp[1] = this.readByte();
        tmp[2] = this.readByte();
        tmp[3] = this.readByte();
        compSize = this.readByte();
        compSize |= this.readByte() << 8;
        compSize |= this.readByte() << 16;
        compSize |= this.readByte() << 24;
        size = this.readByte();
        size |= this.readByte() << 8;
        size |= this.readByte() << 16;
        size |= this.readByte() << 24;
      }
      this.modeZIP && this.nextFile();
      tmp[0] = this.readByte();
      if (8 !== tmp[0]) return 0;
      this.gpflags = this.readByte();
      this.readByte();
      this.readByte();
      this.readByte();
      this.readByte();
      this.readByte();
      os = this.readByte();
      if (4 & this.gpflags) {
        tmp[0] = this.readByte();
        tmp[2] = this.readByte();
        this.len = tmp[0] + 256 * tmp[1];
        for (i = 0; i < this.len; i++) this.readByte();
      }
      if (8 & this.gpflags) {
        i = 0;
        this.nameBuf = [];
        while (c = this.readByte()) {
          "7" !== c && ":" !== c || (i = 0);
          i < cc.Codec.GZip.NAMEMAX - 1 && (this.nameBuf[i++] = c);
        }
      }
      if (16 & this.gpflags) while (c = this.readByte()) ;
      if (2 & this.gpflags) {
        this.readByte();
        this.readByte();
      }
      this.DeflateLoop();
      size = this.readByte();
      size |= this.readByte() << 8;
      size |= this.readByte() << 16;
      size |= this.readByte() << 24;
      this.modeZIP && this.nextFile();
    };
    cc._RF.pop();
  }, {} ],
  initialize_pb: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "e9299ELMN1NrLMWDUOzu85/", "initialize_pb");
    "use strict";
    var jspb = require("google-protobuf");
    var goog = jspb;
    var global = Function("return this")();
    goog.exportSymbol("proto.BINInitializeRequest", null, global);
    goog.exportSymbol("proto.BINInitializeResponse", null, global);
    proto.BINInitializeRequest = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINInitializeRequest, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINInitializeRequest.displayName = "proto.BINInitializeRequest");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINInitializeRequest.prototype.toObject = function(opt_includeInstance) {
        return proto.BINInitializeRequest.toObject(opt_includeInstance, this);
      };
      proto.BINInitializeRequest.toObject = function(includeInstance, msg) {
        var f, obj = {
          cp: jspb.Message.getField(msg, 1),
          appversion: jspb.Message.getField(msg, 2),
          deviceid: jspb.Message.getField(msg, 3),
          deviceinfo: jspb.Message.getField(msg, 4),
          country: jspb.Message.getField(msg, 5),
          language: jspb.Message.getField(msg, 6),
          pakagename: jspb.Message.getField(msg, 7),
          liteversion: jspb.Message.getField(msg, 8),
          referencecode: jspb.Message.getField(msg, 9)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINInitializeRequest.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINInitializeRequest();
      return proto.BINInitializeRequest.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINInitializeRequest.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readString();
          msg.setCp(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setAppversion(value);
          break;

         case 3:
          var value = reader.readString();
          msg.setDeviceid(value);
          break;

         case 4:
          var value = reader.readString();
          msg.setDeviceinfo(value);
          break;

         case 5:
          var value = reader.readString();
          msg.setCountry(value);
          break;

         case 6:
          var value = reader.readString();
          msg.setLanguage(value);
          break;

         case 7:
          var value = reader.readString();
          msg.setPakagename(value);
          break;

         case 8:
          var value = reader.readBool();
          msg.setLiteversion(value);
          break;

         case 9:
          var value = reader.readString();
          msg.setReferencecode(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINInitializeRequest.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINInitializeRequest.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINInitializeRequest.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeString(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeString(3, f);
      f = jspb.Message.getField(this, 4);
      null != f && writer.writeString(4, f);
      f = jspb.Message.getField(this, 5);
      null != f && writer.writeString(5, f);
      f = jspb.Message.getField(this, 6);
      null != f && writer.writeString(6, f);
      f = jspb.Message.getField(this, 7);
      null != f && writer.writeString(7, f);
      f = jspb.Message.getField(this, 8);
      null != f && writer.writeBool(8, f);
      f = jspb.Message.getField(this, 9);
      null != f && writer.writeString(9, f);
    };
    proto.BINInitializeRequest.prototype.getCp = function() {
      return jspb.Message.getFieldWithDefault(this, 1, "");
    };
    proto.BINInitializeRequest.prototype.setCp = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINInitializeRequest.prototype.clearCp = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINInitializeRequest.prototype.hasCp = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINInitializeRequest.prototype.getAppversion = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINInitializeRequest.prototype.setAppversion = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINInitializeRequest.prototype.clearAppversion = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINInitializeRequest.prototype.hasAppversion = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINInitializeRequest.prototype.getDeviceid = function() {
      return jspb.Message.getFieldWithDefault(this, 3, "");
    };
    proto.BINInitializeRequest.prototype.setDeviceid = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINInitializeRequest.prototype.clearDeviceid = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINInitializeRequest.prototype.hasDeviceid = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINInitializeRequest.prototype.getDeviceinfo = function() {
      return jspb.Message.getFieldWithDefault(this, 4, "");
    };
    proto.BINInitializeRequest.prototype.setDeviceinfo = function(value) {
      jspb.Message.setField(this, 4, value);
    };
    proto.BINInitializeRequest.prototype.clearDeviceinfo = function() {
      jspb.Message.setField(this, 4, void 0);
    };
    proto.BINInitializeRequest.prototype.hasDeviceinfo = function() {
      return null != jspb.Message.getField(this, 4);
    };
    proto.BINInitializeRequest.prototype.getCountry = function() {
      return jspb.Message.getFieldWithDefault(this, 5, "");
    };
    proto.BINInitializeRequest.prototype.setCountry = function(value) {
      jspb.Message.setField(this, 5, value);
    };
    proto.BINInitializeRequest.prototype.clearCountry = function() {
      jspb.Message.setField(this, 5, void 0);
    };
    proto.BINInitializeRequest.prototype.hasCountry = function() {
      return null != jspb.Message.getField(this, 5);
    };
    proto.BINInitializeRequest.prototype.getLanguage = function() {
      return jspb.Message.getFieldWithDefault(this, 6, "");
    };
    proto.BINInitializeRequest.prototype.setLanguage = function(value) {
      jspb.Message.setField(this, 6, value);
    };
    proto.BINInitializeRequest.prototype.clearLanguage = function() {
      jspb.Message.setField(this, 6, void 0);
    };
    proto.BINInitializeRequest.prototype.hasLanguage = function() {
      return null != jspb.Message.getField(this, 6);
    };
    proto.BINInitializeRequest.prototype.getPakagename = function() {
      return jspb.Message.getFieldWithDefault(this, 7, "");
    };
    proto.BINInitializeRequest.prototype.setPakagename = function(value) {
      jspb.Message.setField(this, 7, value);
    };
    proto.BINInitializeRequest.prototype.clearPakagename = function() {
      jspb.Message.setField(this, 7, void 0);
    };
    proto.BINInitializeRequest.prototype.hasPakagename = function() {
      return null != jspb.Message.getField(this, 7);
    };
    proto.BINInitializeRequest.prototype.getLiteversion = function() {
      return jspb.Message.getFieldWithDefault(this, 8, false);
    };
    proto.BINInitializeRequest.prototype.setLiteversion = function(value) {
      jspb.Message.setField(this, 8, value);
    };
    proto.BINInitializeRequest.prototype.clearLiteversion = function() {
      jspb.Message.setField(this, 8, void 0);
    };
    proto.BINInitializeRequest.prototype.hasLiteversion = function() {
      return null != jspb.Message.getField(this, 8);
    };
    proto.BINInitializeRequest.prototype.getReferencecode = function() {
      return jspb.Message.getFieldWithDefault(this, 9, "");
    };
    proto.BINInitializeRequest.prototype.setReferencecode = function(value) {
      jspb.Message.setField(this, 9, value);
    };
    proto.BINInitializeRequest.prototype.clearReferencecode = function() {
      jspb.Message.setField(this, 9, void 0);
    };
    proto.BINInitializeRequest.prototype.hasReferencecode = function() {
      return null != jspb.Message.getField(this, 9);
    };
    proto.BINInitializeResponse = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, proto.BINInitializeResponse.repeatedFields_, null);
    };
    goog.inherits(proto.BINInitializeResponse, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINInitializeResponse.displayName = "proto.BINInitializeResponse");
    proto.BINInitializeResponse.repeatedFields_ = [ 16, 19 ];
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINInitializeResponse.prototype.toObject = function(opt_includeInstance) {
        return proto.BINInitializeResponse.toObject(opt_includeInstance, this);
      };
      proto.BINInitializeResponse.toObject = function(includeInstance, msg) {
        var f, obj = {
          responsecode: jspb.Message.getField(msg, 1),
          message: jspb.Message.getField(msg, 2),
          currentappversion: jspb.Message.getField(msg, 3),
          downloadurl: jspb.Message.getField(msg, 4),
          cashcurrency: jspb.Message.getField(msg, 5),
          goldcurrency: jspb.Message.getField(msg, 6),
          forceupdate: jspb.Message.getField(msg, 7),
          enablequickplay: jspb.Message.getField(msg, 8),
          enablecashsystem: jspb.Message.getField(msg, 9),
          enablepurchasecash: jspb.Message.getField(msg, 10),
          enabletopup: jspb.Message.getField(msg, 11),
          enablecashtogold: jspb.Message.getField(msg, 12),
          enablecashtransfer: jspb.Message.getField(msg, 13),
          enablegiftcode: jspb.Message.getField(msg, 14),
          cashtogoldratio: jspb.Message.getField(msg, 15),
          hotlinesList: jspb.Message.getField(msg, 16),
          fanpageurl: jspb.Message.getField(msg, 17),
          websiteurl: jspb.Message.getField(msg, 18),
          enablegameidsList: jspb.Message.getField(msg, 19),
          resetpwsmssyntax: jspb.Message.getField(msg, 20)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINInitializeResponse.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINInitializeResponse();
      return proto.BINInitializeResponse.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINInitializeResponse.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readBool();
          msg.setResponsecode(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setMessage(value);
          break;

         case 3:
          var value = reader.readString();
          msg.setCurrentappversion(value);
          break;

         case 4:
          var value = reader.readString();
          msg.setDownloadurl(value);
          break;

         case 5:
          var value = reader.readString();
          msg.setCashcurrency(value);
          break;

         case 6:
          var value = reader.readString();
          msg.setGoldcurrency(value);
          break;

         case 7:
          var value = reader.readBool();
          msg.setForceupdate(value);
          break;

         case 8:
          var value = reader.readBool();
          msg.setEnablequickplay(value);
          break;

         case 9:
          var value = reader.readBool();
          msg.setEnablecashsystem(value);
          break;

         case 10:
          var value = reader.readBool();
          msg.setEnablepurchasecash(value);
          break;

         case 11:
          var value = reader.readBool();
          msg.setEnabletopup(value);
          break;

         case 12:
          var value = reader.readBool();
          msg.setEnablecashtogold(value);
          break;

         case 13:
          var value = reader.readBool();
          msg.setEnablecashtransfer(value);
          break;

         case 14:
          var value = reader.readBool();
          msg.setEnablegiftcode(value);
          break;

         case 15:
          var value = reader.readInt32();
          msg.setCashtogoldratio(value);
          break;

         case 16:
          var value = reader.readString();
          msg.addHotlines(value);
          break;

         case 17:
          var value = reader.readString();
          msg.setFanpageurl(value);
          break;

         case 18:
          var value = reader.readString();
          msg.setWebsiteurl(value);
          break;

         case 19:
          var value = reader.readInt32();
          msg.addEnablegameids(value);
          break;

         case 20:
          var value = reader.readString();
          msg.setResetpwsmssyntax(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINInitializeResponse.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINInitializeResponse.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINInitializeResponse.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeBool(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeString(3, f);
      f = jspb.Message.getField(this, 4);
      null != f && writer.writeString(4, f);
      f = jspb.Message.getField(this, 5);
      null != f && writer.writeString(5, f);
      f = jspb.Message.getField(this, 6);
      null != f && writer.writeString(6, f);
      f = jspb.Message.getField(this, 7);
      null != f && writer.writeBool(7, f);
      f = jspb.Message.getField(this, 8);
      null != f && writer.writeBool(8, f);
      f = jspb.Message.getField(this, 9);
      null != f && writer.writeBool(9, f);
      f = jspb.Message.getField(this, 10);
      null != f && writer.writeBool(10, f);
      f = jspb.Message.getField(this, 11);
      null != f && writer.writeBool(11, f);
      f = jspb.Message.getField(this, 12);
      null != f && writer.writeBool(12, f);
      f = jspb.Message.getField(this, 13);
      null != f && writer.writeBool(13, f);
      f = jspb.Message.getField(this, 14);
      null != f && writer.writeBool(14, f);
      f = jspb.Message.getField(this, 15);
      null != f && writer.writeInt32(15, f);
      f = this.getHotlinesList();
      f.length > 0 && writer.writeRepeatedString(16, f);
      f = jspb.Message.getField(this, 17);
      null != f && writer.writeString(17, f);
      f = jspb.Message.getField(this, 18);
      null != f && writer.writeString(18, f);
      f = this.getEnablegameidsList();
      f.length > 0 && writer.writeRepeatedInt32(19, f);
      f = jspb.Message.getField(this, 20);
      null != f && writer.writeString(20, f);
    };
    proto.BINInitializeResponse.prototype.getResponsecode = function() {
      return jspb.Message.getFieldWithDefault(this, 1, false);
    };
    proto.BINInitializeResponse.prototype.setResponsecode = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINInitializeResponse.prototype.clearResponsecode = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINInitializeResponse.prototype.hasResponsecode = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINInitializeResponse.prototype.getMessage = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINInitializeResponse.prototype.setMessage = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINInitializeResponse.prototype.clearMessage = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINInitializeResponse.prototype.hasMessage = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINInitializeResponse.prototype.getCurrentappversion = function() {
      return jspb.Message.getFieldWithDefault(this, 3, "");
    };
    proto.BINInitializeResponse.prototype.setCurrentappversion = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINInitializeResponse.prototype.clearCurrentappversion = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINInitializeResponse.prototype.hasCurrentappversion = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINInitializeResponse.prototype.getDownloadurl = function() {
      return jspb.Message.getFieldWithDefault(this, 4, "");
    };
    proto.BINInitializeResponse.prototype.setDownloadurl = function(value) {
      jspb.Message.setField(this, 4, value);
    };
    proto.BINInitializeResponse.prototype.clearDownloadurl = function() {
      jspb.Message.setField(this, 4, void 0);
    };
    proto.BINInitializeResponse.prototype.hasDownloadurl = function() {
      return null != jspb.Message.getField(this, 4);
    };
    proto.BINInitializeResponse.prototype.getCashcurrency = function() {
      return jspb.Message.getFieldWithDefault(this, 5, "");
    };
    proto.BINInitializeResponse.prototype.setCashcurrency = function(value) {
      jspb.Message.setField(this, 5, value);
    };
    proto.BINInitializeResponse.prototype.clearCashcurrency = function() {
      jspb.Message.setField(this, 5, void 0);
    };
    proto.BINInitializeResponse.prototype.hasCashcurrency = function() {
      return null != jspb.Message.getField(this, 5);
    };
    proto.BINInitializeResponse.prototype.getGoldcurrency = function() {
      return jspb.Message.getFieldWithDefault(this, 6, "");
    };
    proto.BINInitializeResponse.prototype.setGoldcurrency = function(value) {
      jspb.Message.setField(this, 6, value);
    };
    proto.BINInitializeResponse.prototype.clearGoldcurrency = function() {
      jspb.Message.setField(this, 6, void 0);
    };
    proto.BINInitializeResponse.prototype.hasGoldcurrency = function() {
      return null != jspb.Message.getField(this, 6);
    };
    proto.BINInitializeResponse.prototype.getForceupdate = function() {
      return jspb.Message.getFieldWithDefault(this, 7, false);
    };
    proto.BINInitializeResponse.prototype.setForceupdate = function(value) {
      jspb.Message.setField(this, 7, value);
    };
    proto.BINInitializeResponse.prototype.clearForceupdate = function() {
      jspb.Message.setField(this, 7, void 0);
    };
    proto.BINInitializeResponse.prototype.hasForceupdate = function() {
      return null != jspb.Message.getField(this, 7);
    };
    proto.BINInitializeResponse.prototype.getEnablequickplay = function() {
      return jspb.Message.getFieldWithDefault(this, 8, false);
    };
    proto.BINInitializeResponse.prototype.setEnablequickplay = function(value) {
      jspb.Message.setField(this, 8, value);
    };
    proto.BINInitializeResponse.prototype.clearEnablequickplay = function() {
      jspb.Message.setField(this, 8, void 0);
    };
    proto.BINInitializeResponse.prototype.hasEnablequickplay = function() {
      return null != jspb.Message.getField(this, 8);
    };
    proto.BINInitializeResponse.prototype.getEnablecashsystem = function() {
      return jspb.Message.getFieldWithDefault(this, 9, false);
    };
    proto.BINInitializeResponse.prototype.setEnablecashsystem = function(value) {
      jspb.Message.setField(this, 9, value);
    };
    proto.BINInitializeResponse.prototype.clearEnablecashsystem = function() {
      jspb.Message.setField(this, 9, void 0);
    };
    proto.BINInitializeResponse.prototype.hasEnablecashsystem = function() {
      return null != jspb.Message.getField(this, 9);
    };
    proto.BINInitializeResponse.prototype.getEnablepurchasecash = function() {
      return jspb.Message.getFieldWithDefault(this, 10, false);
    };
    proto.BINInitializeResponse.prototype.setEnablepurchasecash = function(value) {
      jspb.Message.setField(this, 10, value);
    };
    proto.BINInitializeResponse.prototype.clearEnablepurchasecash = function() {
      jspb.Message.setField(this, 10, void 0);
    };
    proto.BINInitializeResponse.prototype.hasEnablepurchasecash = function() {
      return null != jspb.Message.getField(this, 10);
    };
    proto.BINInitializeResponse.prototype.getEnabletopup = function() {
      return jspb.Message.getFieldWithDefault(this, 11, false);
    };
    proto.BINInitializeResponse.prototype.setEnabletopup = function(value) {
      jspb.Message.setField(this, 11, value);
    };
    proto.BINInitializeResponse.prototype.clearEnabletopup = function() {
      jspb.Message.setField(this, 11, void 0);
    };
    proto.BINInitializeResponse.prototype.hasEnabletopup = function() {
      return null != jspb.Message.getField(this, 11);
    };
    proto.BINInitializeResponse.prototype.getEnablecashtogold = function() {
      return jspb.Message.getFieldWithDefault(this, 12, false);
    };
    proto.BINInitializeResponse.prototype.setEnablecashtogold = function(value) {
      jspb.Message.setField(this, 12, value);
    };
    proto.BINInitializeResponse.prototype.clearEnablecashtogold = function() {
      jspb.Message.setField(this, 12, void 0);
    };
    proto.BINInitializeResponse.prototype.hasEnablecashtogold = function() {
      return null != jspb.Message.getField(this, 12);
    };
    proto.BINInitializeResponse.prototype.getEnablecashtransfer = function() {
      return jspb.Message.getFieldWithDefault(this, 13, false);
    };
    proto.BINInitializeResponse.prototype.setEnablecashtransfer = function(value) {
      jspb.Message.setField(this, 13, value);
    };
    proto.BINInitializeResponse.prototype.clearEnablecashtransfer = function() {
      jspb.Message.setField(this, 13, void 0);
    };
    proto.BINInitializeResponse.prototype.hasEnablecashtransfer = function() {
      return null != jspb.Message.getField(this, 13);
    };
    proto.BINInitializeResponse.prototype.getEnablegiftcode = function() {
      return jspb.Message.getFieldWithDefault(this, 14, false);
    };
    proto.BINInitializeResponse.prototype.setEnablegiftcode = function(value) {
      jspb.Message.setField(this, 14, value);
    };
    proto.BINInitializeResponse.prototype.clearEnablegiftcode = function() {
      jspb.Message.setField(this, 14, void 0);
    };
    proto.BINInitializeResponse.prototype.hasEnablegiftcode = function() {
      return null != jspb.Message.getField(this, 14);
    };
    proto.BINInitializeResponse.prototype.getCashtogoldratio = function() {
      return jspb.Message.getFieldWithDefault(this, 15, 0);
    };
    proto.BINInitializeResponse.prototype.setCashtogoldratio = function(value) {
      jspb.Message.setField(this, 15, value);
    };
    proto.BINInitializeResponse.prototype.clearCashtogoldratio = function() {
      jspb.Message.setField(this, 15, void 0);
    };
    proto.BINInitializeResponse.prototype.hasCashtogoldratio = function() {
      return null != jspb.Message.getField(this, 15);
    };
    proto.BINInitializeResponse.prototype.getHotlinesList = function() {
      return jspb.Message.getField(this, 16);
    };
    proto.BINInitializeResponse.prototype.setHotlinesList = function(value) {
      jspb.Message.setField(this, 16, value || []);
    };
    proto.BINInitializeResponse.prototype.addHotlines = function(value, opt_index) {
      jspb.Message.addToRepeatedField(this, 16, value, opt_index);
    };
    proto.BINInitializeResponse.prototype.clearHotlinesList = function() {
      this.setHotlinesList([]);
    };
    proto.BINInitializeResponse.prototype.getFanpageurl = function() {
      return jspb.Message.getFieldWithDefault(this, 17, "");
    };
    proto.BINInitializeResponse.prototype.setFanpageurl = function(value) {
      jspb.Message.setField(this, 17, value);
    };
    proto.BINInitializeResponse.prototype.clearFanpageurl = function() {
      jspb.Message.setField(this, 17, void 0);
    };
    proto.BINInitializeResponse.prototype.hasFanpageurl = function() {
      return null != jspb.Message.getField(this, 17);
    };
    proto.BINInitializeResponse.prototype.getWebsiteurl = function() {
      return jspb.Message.getFieldWithDefault(this, 18, "");
    };
    proto.BINInitializeResponse.prototype.setWebsiteurl = function(value) {
      jspb.Message.setField(this, 18, value);
    };
    proto.BINInitializeResponse.prototype.clearWebsiteurl = function() {
      jspb.Message.setField(this, 18, void 0);
    };
    proto.BINInitializeResponse.prototype.hasWebsiteurl = function() {
      return null != jspb.Message.getField(this, 18);
    };
    proto.BINInitializeResponse.prototype.getEnablegameidsList = function() {
      return jspb.Message.getField(this, 19);
    };
    proto.BINInitializeResponse.prototype.setEnablegameidsList = function(value) {
      jspb.Message.setField(this, 19, value || []);
    };
    proto.BINInitializeResponse.prototype.addEnablegameids = function(value, opt_index) {
      jspb.Message.addToRepeatedField(this, 19, value, opt_index);
    };
    proto.BINInitializeResponse.prototype.clearEnablegameidsList = function() {
      this.setEnablegameidsList([]);
    };
    proto.BINInitializeResponse.prototype.getResetpwsmssyntax = function() {
      return jspb.Message.getFieldWithDefault(this, 20, "");
    };
    proto.BINInitializeResponse.prototype.setResetpwsmssyntax = function(value) {
      jspb.Message.setField(this, 20, value);
    };
    proto.BINInitializeResponse.prototype.clearResetpwsmssyntax = function() {
      jspb.Message.setField(this, 20, void 0);
    };
    proto.BINInitializeResponse.prototype.hasResetpwsmssyntax = function() {
      return null != jspb.Message.getField(this, 20);
    };
    goog.object.extend(exports, proto);
    cc._RF.pop();
  }, {
    "google-protobuf": "google-protobuf"
  } ],
  jar_pb: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ae9c02Lc+dI4797cTG7ZyIp", "jar_pb");
    "use strict";
    var jspb = require("google-protobuf");
    var goog = jspb;
    var global = Function("return this")();
    var map_field_entry_pb = require("./map_field_entry_pb.js");
    goog.exportSymbol("proto.BINJarInfo", null, global);
    goog.exportSymbol("proto.BINJarRequest", null, global);
    goog.exportSymbol("proto.BINJarResponse", null, global);
    proto.BINJarRequest = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, proto.BINJarRequest.repeatedFields_, null);
    };
    goog.inherits(proto.BINJarRequest, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINJarRequest.displayName = "proto.BINJarRequest");
    proto.BINJarRequest.repeatedFields_ = [ 3 ];
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINJarRequest.prototype.toObject = function(opt_includeInstance) {
        return proto.BINJarRequest.toObject(opt_includeInstance, this);
      };
      proto.BINJarRequest.toObject = function(includeInstance, msg) {
        var f, obj = {
          zoneid: jspb.Message.getField(msg, 1),
          jartype: jspb.Message.getField(msg, 2),
          argsList: jspb.Message.toObjectList(msg.getArgsList(), map_field_entry_pb.BINMapFieldEntry.toObject, includeInstance)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINJarRequest.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINJarRequest();
      return proto.BINJarRequest.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINJarRequest.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt32();
          msg.setZoneid(value);
          break;

         case 2:
          var value = reader.readInt32();
          msg.setJartype(value);
          break;

         case 3:
          var value = new map_field_entry_pb.BINMapFieldEntry();
          reader.readMessage(value, map_field_entry_pb.BINMapFieldEntry.deserializeBinaryFromReader);
          msg.addArgs(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINJarRequest.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINJarRequest.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINJarRequest.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt32(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeInt32(2, f);
      f = this.getArgsList();
      f.length > 0 && writer.writeRepeatedMessage(3, f, map_field_entry_pb.BINMapFieldEntry.serializeBinaryToWriter);
    };
    proto.BINJarRequest.prototype.getZoneid = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINJarRequest.prototype.setZoneid = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINJarRequest.prototype.clearZoneid = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINJarRequest.prototype.hasZoneid = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINJarRequest.prototype.getJartype = function() {
      return jspb.Message.getFieldWithDefault(this, 2, 0);
    };
    proto.BINJarRequest.prototype.setJartype = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINJarRequest.prototype.clearJartype = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINJarRequest.prototype.hasJartype = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINJarRequest.prototype.getArgsList = function() {
      return jspb.Message.getRepeatedWrapperField(this, map_field_entry_pb.BINMapFieldEntry, 3);
    };
    proto.BINJarRequest.prototype.setArgsList = function(value) {
      jspb.Message.setRepeatedWrapperField(this, 3, value);
    };
    proto.BINJarRequest.prototype.addArgs = function(opt_value, opt_index) {
      return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.BINMapFieldEntry, opt_index);
    };
    proto.BINJarRequest.prototype.clearArgsList = function() {
      this.setArgsList([]);
    };
    proto.BINJarResponse = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, proto.BINJarResponse.repeatedFields_, null);
    };
    goog.inherits(proto.BINJarResponse, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINJarResponse.displayName = "proto.BINJarResponse");
    proto.BINJarResponse.repeatedFields_ = [ 4, 5 ];
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINJarResponse.prototype.toObject = function(opt_includeInstance) {
        return proto.BINJarResponse.toObject(opt_includeInstance, this);
      };
      proto.BINJarResponse.toObject = function(includeInstance, msg) {
        var f, obj = {
          responsecode: jspb.Message.getField(msg, 1),
          message: jspb.Message.getField(msg, 2),
          jarvalue: jspb.Message.getField(msg, 3),
          argsList: jspb.Message.toObjectList(msg.getArgsList(), map_field_entry_pb.BINMapFieldEntry.toObject, includeInstance),
          jarinfoList: jspb.Message.toObjectList(msg.getJarinfoList(), proto.BINJarInfo.toObject, includeInstance)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINJarResponse.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINJarResponse();
      return proto.BINJarResponse.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINJarResponse.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readBool();
          msg.setResponsecode(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setMessage(value);
          break;

         case 3:
          var value = reader.readInt64();
          msg.setJarvalue(value);
          break;

         case 4:
          var value = new map_field_entry_pb.BINMapFieldEntry();
          reader.readMessage(value, map_field_entry_pb.BINMapFieldEntry.deserializeBinaryFromReader);
          msg.addArgs(value);
          break;

         case 5:
          var value = new proto.BINJarInfo();
          reader.readMessage(value, proto.BINJarInfo.deserializeBinaryFromReader);
          msg.addJarinfo(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINJarResponse.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINJarResponse.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINJarResponse.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeBool(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeInt64(3, f);
      f = this.getArgsList();
      f.length > 0 && writer.writeRepeatedMessage(4, f, map_field_entry_pb.BINMapFieldEntry.serializeBinaryToWriter);
      f = this.getJarinfoList();
      f.length > 0 && writer.writeRepeatedMessage(5, f, proto.BINJarInfo.serializeBinaryToWriter);
    };
    proto.BINJarResponse.prototype.getResponsecode = function() {
      return jspb.Message.getFieldWithDefault(this, 1, false);
    };
    proto.BINJarResponse.prototype.setResponsecode = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINJarResponse.prototype.clearResponsecode = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINJarResponse.prototype.hasResponsecode = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINJarResponse.prototype.getMessage = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINJarResponse.prototype.setMessage = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINJarResponse.prototype.clearMessage = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINJarResponse.prototype.hasMessage = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINJarResponse.prototype.getJarvalue = function() {
      return jspb.Message.getFieldWithDefault(this, 3, 0);
    };
    proto.BINJarResponse.prototype.setJarvalue = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINJarResponse.prototype.clearJarvalue = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINJarResponse.prototype.hasJarvalue = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINJarResponse.prototype.getArgsList = function() {
      return jspb.Message.getRepeatedWrapperField(this, map_field_entry_pb.BINMapFieldEntry, 4);
    };
    proto.BINJarResponse.prototype.setArgsList = function(value) {
      jspb.Message.setRepeatedWrapperField(this, 4, value);
    };
    proto.BINJarResponse.prototype.addArgs = function(opt_value, opt_index) {
      return jspb.Message.addToRepeatedWrapperField(this, 4, opt_value, proto.BINMapFieldEntry, opt_index);
    };
    proto.BINJarResponse.prototype.clearArgsList = function() {
      this.setArgsList([]);
    };
    proto.BINJarResponse.prototype.getJarinfoList = function() {
      return jspb.Message.getRepeatedWrapperField(this, proto.BINJarInfo, 5);
    };
    proto.BINJarResponse.prototype.setJarinfoList = function(value) {
      jspb.Message.setRepeatedWrapperField(this, 5, value);
    };
    proto.BINJarResponse.prototype.addJarinfo = function(opt_value, opt_index) {
      return jspb.Message.addToRepeatedWrapperField(this, 5, opt_value, proto.BINJarInfo, opt_index);
    };
    proto.BINJarResponse.prototype.clearJarinfoList = function() {
      this.setJarinfoList([]);
    };
    proto.BINJarInfo = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINJarInfo, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINJarInfo.displayName = "proto.BINJarInfo");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINJarInfo.prototype.toObject = function(opt_includeInstance) {
        return proto.BINJarInfo.toObject(opt_includeInstance, this);
      };
      proto.BINJarInfo.toObject = function(includeInstance, msg) {
        var f, obj = {
          gameid: jspb.Message.getField(msg, 1),
          value: jspb.Message.getField(msg, 2),
          jartype: jspb.Message.getField(msg, 3)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINJarInfo.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINJarInfo();
      return proto.BINJarInfo.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINJarInfo.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt64();
          msg.setGameid(value);
          break;

         case 2:
          var value = reader.readInt64();
          msg.setValue(value);
          break;

         case 3:
          var value = reader.readInt32();
          msg.setJartype(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINJarInfo.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINJarInfo.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINJarInfo.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt64(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeInt64(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeInt32(3, f);
    };
    proto.BINJarInfo.prototype.getGameid = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINJarInfo.prototype.setGameid = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINJarInfo.prototype.clearGameid = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINJarInfo.prototype.hasGameid = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINJarInfo.prototype.getValue = function() {
      return jspb.Message.getFieldWithDefault(this, 2, 0);
    };
    proto.BINJarInfo.prototype.setValue = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINJarInfo.prototype.clearValue = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINJarInfo.prototype.hasValue = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINJarInfo.prototype.getJartype = function() {
      return jspb.Message.getFieldWithDefault(this, 3, 0);
    };
    proto.BINJarInfo.prototype.setJartype = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINJarInfo.prototype.clearJartype = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINJarInfo.prototype.hasJartype = function() {
      return null != jspb.Message.getField(this, 3);
    };
    goog.object.extend(exports, proto);
    cc._RF.pop();
  }, {
    "./map_field_entry_pb.js": "map_field_entry_pb",
    "google-protobuf": "google-protobuf"
  } ],
  labelCell: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a6527xMI35HwY9ELBXxJ3eR", "labelCell");
    "use strict";
    cc.Class({
      extends: require("viewCell"),
      properties: {
        prefabData: cc.Prefab,
        card: cc.Mask
      },
      onLoad: function onLoad() {},
      init: function init(index, data, reload, group) {
        this.node.removeAllChildren(true);
        var obj = data.array[index];
        var bgCellWidth = this.node.getContentSize().width;
        var lengthData = Object.keys(obj).length;
        var lastItem = obj[Object.keys(obj)[lengthData - 1]];
        var re2 = /[,]/g;
        var findComma = lastItem.toString().search(re2);
        var card = -1 !== findComma ? obj[Object.keys(obj)[lengthData - 1]].split(",") : [];
        card.length > 1 && (lengthData -= 1);
        var percentCell = [ .3, .15, .15, .15, .25 ];
        for (var i = 0; i < lengthData; i++) {
          var nodeChild = new cc.Node();
          nodeChild.parent = this.node;
          var message = nodeChild.addComponent(cc.Label);
          var posX = (i - lengthData / 2 + .5) * bgCellWidth / (lengthData + 1);
          message.node.setPositionX(posX);
          message.fontSize = 20;
          message.string = obj[Object.keys(obj)[i]].toString();
        }
        if (card.length > 1) {
          for (var j = 0; j < card.length; j++) {
            var item = cc.instantiate(this.prefabData);
            var cardValue = card[j];
            item.setScale(.2, .2);
            var posX = 0;
            posX = 0 === j ? .05 * -item.getContentSize().width : 2 === j ? .05 * item.getContentSize().width : 0;
            var posY = 0;
            item.getComponent("CardItem").replaceCard(cardValue);
            item.setPositionY(posY);
            item.setPositionX(posX);
            this.card.node.addChild(item);
          }
          this.node.addChild(this.card.node);
        }
      }
    });
    cc._RF.pop();
  }, {
    viewCell: "viewCell"
  } ],
  level_pb: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "75a1bT9U15IjJHi+1BPFhOu", "level_pb");
    "use strict";
    var jspb = require("google-protobuf");
    var goog = jspb;
    var global = Function("return this")();
    goog.exportSymbol("proto.BINLevel", null, global);
    goog.exportSymbol("proto.BINLevelUpResponse", null, global);
    goog.exportSymbol("proto.BINMedal", null, global);
    goog.exportSymbol("proto.BINMedalUpResponse", null, global);
    goog.exportSymbol("proto.BINVipLevel", null, global);
    proto.BINLevel = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINLevel, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINLevel.displayName = "proto.BINLevel");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINLevel.prototype.toObject = function(opt_includeInstance) {
        return proto.BINLevel.toObject(opt_includeInstance, this);
      };
      proto.BINLevel.toObject = function(includeInstance, msg) {
        var f, obj = {
          level: jspb.Message.getField(msg, 1),
          name: jspb.Message.getField(msg, 2),
          cashgift: jspb.Message.getField(msg, 3),
          goldgift: jspb.Message.getField(msg, 4),
          maxexp: jspb.Message.getField(msg, 5)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINLevel.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINLevel();
      return proto.BINLevel.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINLevel.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt32();
          msg.setLevel(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setName(value);
          break;

         case 3:
          var value = reader.readInt64();
          msg.setCashgift(value);
          break;

         case 4:
          var value = reader.readInt64();
          msg.setGoldgift(value);
          break;

         case 5:
          var value = reader.readInt64();
          msg.setMaxexp(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINLevel.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINLevel.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINLevel.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt32(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeInt64(3, f);
      f = jspb.Message.getField(this, 4);
      null != f && writer.writeInt64(4, f);
      f = jspb.Message.getField(this, 5);
      null != f && writer.writeInt64(5, f);
    };
    proto.BINLevel.prototype.getLevel = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINLevel.prototype.setLevel = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINLevel.prototype.clearLevel = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINLevel.prototype.hasLevel = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINLevel.prototype.getName = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINLevel.prototype.setName = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINLevel.prototype.clearName = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINLevel.prototype.hasName = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINLevel.prototype.getCashgift = function() {
      return jspb.Message.getFieldWithDefault(this, 3, 0);
    };
    proto.BINLevel.prototype.setCashgift = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINLevel.prototype.clearCashgift = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINLevel.prototype.hasCashgift = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINLevel.prototype.getGoldgift = function() {
      return jspb.Message.getFieldWithDefault(this, 4, 0);
    };
    proto.BINLevel.prototype.setGoldgift = function(value) {
      jspb.Message.setField(this, 4, value);
    };
    proto.BINLevel.prototype.clearGoldgift = function() {
      jspb.Message.setField(this, 4, void 0);
    };
    proto.BINLevel.prototype.hasGoldgift = function() {
      return null != jspb.Message.getField(this, 4);
    };
    proto.BINLevel.prototype.getMaxexp = function() {
      return jspb.Message.getFieldWithDefault(this, 5, 0);
    };
    proto.BINLevel.prototype.setMaxexp = function(value) {
      jspb.Message.setField(this, 5, value);
    };
    proto.BINLevel.prototype.clearMaxexp = function() {
      jspb.Message.setField(this, 5, void 0);
    };
    proto.BINLevel.prototype.hasMaxexp = function() {
      return null != jspb.Message.getField(this, 5);
    };
    proto.BINMedal = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINMedal, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINMedal.displayName = "proto.BINMedal");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINMedal.prototype.toObject = function(opt_includeInstance) {
        return proto.BINMedal.toObject(opt_includeInstance, this);
      };
      proto.BINMedal.toObject = function(includeInstance, msg) {
        var f, obj = {
          medal: jspb.Message.getField(msg, 1),
          name: jspb.Message.getField(msg, 2),
          maxlevel: jspb.Message.getField(msg, 3)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINMedal.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINMedal();
      return proto.BINMedal.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINMedal.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt32();
          msg.setMedal(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setName(value);
          break;

         case 3:
          var value = reader.readInt32();
          msg.setMaxlevel(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINMedal.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINMedal.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINMedal.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt32(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeInt32(3, f);
    };
    proto.BINMedal.prototype.getMedal = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINMedal.prototype.setMedal = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINMedal.prototype.clearMedal = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINMedal.prototype.hasMedal = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINMedal.prototype.getName = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINMedal.prototype.setName = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINMedal.prototype.clearName = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINMedal.prototype.hasName = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINMedal.prototype.getMaxlevel = function() {
      return jspb.Message.getFieldWithDefault(this, 3, 0);
    };
    proto.BINMedal.prototype.setMaxlevel = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINMedal.prototype.clearMaxlevel = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINMedal.prototype.hasMaxlevel = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINVipLevel = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINVipLevel, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINVipLevel.displayName = "proto.BINVipLevel");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINVipLevel.prototype.toObject = function(opt_includeInstance) {
        return proto.BINVipLevel.toObject(opt_includeInstance, this);
      };
      proto.BINVipLevel.toObject = function(includeInstance, msg) {
        var f, obj = {
          vip: jspb.Message.getField(msg, 1),
          name: jspb.Message.getField(msg, 2),
          maxpoint: jspb.Message.getField(msg, 3),
          totalcashpurchase: jspb.Message.getField(msg, 4),
          maxpartopup: jspb.Message.getField(msg, 5),
          maxturntopup: jspb.Message.getField(msg, 6),
          minbalanceaftertopup: jspb.Message.getField(msg, 7),
          cashtransfertax: jspb.Message.getField(msg, 8),
          cashreceived: jspb.Message.getField(msg, 9)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINVipLevel.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINVipLevel();
      return proto.BINVipLevel.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINVipLevel.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt32();
          msg.setVip(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setName(value);
          break;

         case 3:
          var value = reader.readInt64();
          msg.setMaxpoint(value);
          break;

         case 4:
          var value = reader.readInt64();
          msg.setTotalcashpurchase(value);
          break;

         case 5:
          var value = reader.readInt32();
          msg.setMaxpartopup(value);
          break;

         case 6:
          var value = reader.readInt32();
          msg.setMaxturntopup(value);
          break;

         case 7:
          var value = reader.readInt32();
          msg.setMinbalanceaftertopup(value);
          break;

         case 8:
          var value = reader.readInt32();
          msg.setCashtransfertax(value);
          break;

         case 9:
          var value = reader.readInt32();
          msg.setCashreceived(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINVipLevel.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINVipLevel.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINVipLevel.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt32(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeInt64(3, f);
      f = jspb.Message.getField(this, 4);
      null != f && writer.writeInt64(4, f);
      f = jspb.Message.getField(this, 5);
      null != f && writer.writeInt32(5, f);
      f = jspb.Message.getField(this, 6);
      null != f && writer.writeInt32(6, f);
      f = jspb.Message.getField(this, 7);
      null != f && writer.writeInt32(7, f);
      f = jspb.Message.getField(this, 8);
      null != f && writer.writeInt32(8, f);
      f = jspb.Message.getField(this, 9);
      null != f && writer.writeInt32(9, f);
    };
    proto.BINVipLevel.prototype.getVip = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINVipLevel.prototype.setVip = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINVipLevel.prototype.clearVip = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINVipLevel.prototype.hasVip = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINVipLevel.prototype.getName = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINVipLevel.prototype.setName = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINVipLevel.prototype.clearName = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINVipLevel.prototype.hasName = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINVipLevel.prototype.getMaxpoint = function() {
      return jspb.Message.getFieldWithDefault(this, 3, 0);
    };
    proto.BINVipLevel.prototype.setMaxpoint = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINVipLevel.prototype.clearMaxpoint = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINVipLevel.prototype.hasMaxpoint = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINVipLevel.prototype.getTotalcashpurchase = function() {
      return jspb.Message.getFieldWithDefault(this, 4, 0);
    };
    proto.BINVipLevel.prototype.setTotalcashpurchase = function(value) {
      jspb.Message.setField(this, 4, value);
    };
    proto.BINVipLevel.prototype.clearTotalcashpurchase = function() {
      jspb.Message.setField(this, 4, void 0);
    };
    proto.BINVipLevel.prototype.hasTotalcashpurchase = function() {
      return null != jspb.Message.getField(this, 4);
    };
    proto.BINVipLevel.prototype.getMaxpartopup = function() {
      return jspb.Message.getFieldWithDefault(this, 5, 0);
    };
    proto.BINVipLevel.prototype.setMaxpartopup = function(value) {
      jspb.Message.setField(this, 5, value);
    };
    proto.BINVipLevel.prototype.clearMaxpartopup = function() {
      jspb.Message.setField(this, 5, void 0);
    };
    proto.BINVipLevel.prototype.hasMaxpartopup = function() {
      return null != jspb.Message.getField(this, 5);
    };
    proto.BINVipLevel.prototype.getMaxturntopup = function() {
      return jspb.Message.getFieldWithDefault(this, 6, 0);
    };
    proto.BINVipLevel.prototype.setMaxturntopup = function(value) {
      jspb.Message.setField(this, 6, value);
    };
    proto.BINVipLevel.prototype.clearMaxturntopup = function() {
      jspb.Message.setField(this, 6, void 0);
    };
    proto.BINVipLevel.prototype.hasMaxturntopup = function() {
      return null != jspb.Message.getField(this, 6);
    };
    proto.BINVipLevel.prototype.getMinbalanceaftertopup = function() {
      return jspb.Message.getFieldWithDefault(this, 7, 0);
    };
    proto.BINVipLevel.prototype.setMinbalanceaftertopup = function(value) {
      jspb.Message.setField(this, 7, value);
    };
    proto.BINVipLevel.prototype.clearMinbalanceaftertopup = function() {
      jspb.Message.setField(this, 7, void 0);
    };
    proto.BINVipLevel.prototype.hasMinbalanceaftertopup = function() {
      return null != jspb.Message.getField(this, 7);
    };
    proto.BINVipLevel.prototype.getCashtransfertax = function() {
      return jspb.Message.getFieldWithDefault(this, 8, 0);
    };
    proto.BINVipLevel.prototype.setCashtransfertax = function(value) {
      jspb.Message.setField(this, 8, value);
    };
    proto.BINVipLevel.prototype.clearCashtransfertax = function() {
      jspb.Message.setField(this, 8, void 0);
    };
    proto.BINVipLevel.prototype.hasCashtransfertax = function() {
      return null != jspb.Message.getField(this, 8);
    };
    proto.BINVipLevel.prototype.getCashreceived = function() {
      return jspb.Message.getFieldWithDefault(this, 9, 0);
    };
    proto.BINVipLevel.prototype.setCashreceived = function(value) {
      jspb.Message.setField(this, 9, value);
    };
    proto.BINVipLevel.prototype.clearCashreceived = function() {
      jspb.Message.setField(this, 9, void 0);
    };
    proto.BINVipLevel.prototype.hasCashreceived = function() {
      return null != jspb.Message.getField(this, 9);
    };
    proto.BINLevelUpResponse = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINLevelUpResponse, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINLevelUpResponse.displayName = "proto.BINLevelUpResponse");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINLevelUpResponse.prototype.toObject = function(opt_includeInstance) {
        return proto.BINLevelUpResponse.toObject(opt_includeInstance, this);
      };
      proto.BINLevelUpResponse.toObject = function(includeInstance, msg) {
        var f, obj = {
          responsecode: jspb.Message.getField(msg, 1),
          message: jspb.Message.getField(msg, 2),
          currentexp: jspb.Message.getField(msg, 3),
          levelup: jspb.Message.getField(msg, 4),
          newlevel: (f = msg.getNewlevel()) && proto.BINLevel.toObject(includeInstance, f)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINLevelUpResponse.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINLevelUpResponse();
      return proto.BINLevelUpResponse.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINLevelUpResponse.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readBool();
          msg.setResponsecode(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setMessage(value);
          break;

         case 3:
          var value = reader.readInt64();
          msg.setCurrentexp(value);
          break;

         case 4:
          var value = reader.readBool();
          msg.setLevelup(value);
          break;

         case 5:
          var value = new proto.BINLevel();
          reader.readMessage(value, proto.BINLevel.deserializeBinaryFromReader);
          msg.setNewlevel(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINLevelUpResponse.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINLevelUpResponse.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINLevelUpResponse.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeBool(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeInt64(3, f);
      f = jspb.Message.getField(this, 4);
      null != f && writer.writeBool(4, f);
      f = this.getNewlevel();
      null != f && writer.writeMessage(5, f, proto.BINLevel.serializeBinaryToWriter);
    };
    proto.BINLevelUpResponse.prototype.getResponsecode = function() {
      return jspb.Message.getFieldWithDefault(this, 1, false);
    };
    proto.BINLevelUpResponse.prototype.setResponsecode = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINLevelUpResponse.prototype.clearResponsecode = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINLevelUpResponse.prototype.hasResponsecode = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINLevelUpResponse.prototype.getMessage = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINLevelUpResponse.prototype.setMessage = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINLevelUpResponse.prototype.clearMessage = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINLevelUpResponse.prototype.hasMessage = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINLevelUpResponse.prototype.getCurrentexp = function() {
      return jspb.Message.getFieldWithDefault(this, 3, 0);
    };
    proto.BINLevelUpResponse.prototype.setCurrentexp = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINLevelUpResponse.prototype.clearCurrentexp = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINLevelUpResponse.prototype.hasCurrentexp = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINLevelUpResponse.prototype.getLevelup = function() {
      return jspb.Message.getFieldWithDefault(this, 4, false);
    };
    proto.BINLevelUpResponse.prototype.setLevelup = function(value) {
      jspb.Message.setField(this, 4, value);
    };
    proto.BINLevelUpResponse.prototype.clearLevelup = function() {
      jspb.Message.setField(this, 4, void 0);
    };
    proto.BINLevelUpResponse.prototype.hasLevelup = function() {
      return null != jspb.Message.getField(this, 4);
    };
    proto.BINLevelUpResponse.prototype.getNewlevel = function() {
      return jspb.Message.getWrapperField(this, proto.BINLevel, 5);
    };
    proto.BINLevelUpResponse.prototype.setNewlevel = function(value) {
      jspb.Message.setWrapperField(this, 5, value);
    };
    proto.BINLevelUpResponse.prototype.clearNewlevel = function() {
      this.setNewlevel(void 0);
    };
    proto.BINLevelUpResponse.prototype.hasNewlevel = function() {
      return null != jspb.Message.getField(this, 5);
    };
    proto.BINMedalUpResponse = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINMedalUpResponse, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINMedalUpResponse.displayName = "proto.BINMedalUpResponse");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINMedalUpResponse.prototype.toObject = function(opt_includeInstance) {
        return proto.BINMedalUpResponse.toObject(opt_includeInstance, this);
      };
      proto.BINMedalUpResponse.toObject = function(includeInstance, msg) {
        var f, obj = {
          responsecode: jspb.Message.getField(msg, 1),
          message: jspb.Message.getField(msg, 2),
          newmedal: (f = msg.getNewmedal()) && proto.BINMedal.toObject(includeInstance, f),
          currentlevel: jspb.Message.getField(msg, 4)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINMedalUpResponse.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINMedalUpResponse();
      return proto.BINMedalUpResponse.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINMedalUpResponse.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readBool();
          msg.setResponsecode(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setMessage(value);
          break;

         case 3:
          var value = new proto.BINMedal();
          reader.readMessage(value, proto.BINMedal.deserializeBinaryFromReader);
          msg.setNewmedal(value);
          break;

         case 4:
          var value = reader.readInt32();
          msg.setCurrentlevel(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINMedalUpResponse.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINMedalUpResponse.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINMedalUpResponse.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeBool(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = this.getNewmedal();
      null != f && writer.writeMessage(3, f, proto.BINMedal.serializeBinaryToWriter);
      f = jspb.Message.getField(this, 4);
      null != f && writer.writeInt32(4, f);
    };
    proto.BINMedalUpResponse.prototype.getResponsecode = function() {
      return jspb.Message.getFieldWithDefault(this, 1, false);
    };
    proto.BINMedalUpResponse.prototype.setResponsecode = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINMedalUpResponse.prototype.clearResponsecode = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINMedalUpResponse.prototype.hasResponsecode = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINMedalUpResponse.prototype.getMessage = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINMedalUpResponse.prototype.setMessage = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINMedalUpResponse.prototype.clearMessage = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINMedalUpResponse.prototype.hasMessage = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINMedalUpResponse.prototype.getNewmedal = function() {
      return jspb.Message.getWrapperField(this, proto.BINMedal, 3);
    };
    proto.BINMedalUpResponse.prototype.setNewmedal = function(value) {
      jspb.Message.setWrapperField(this, 3, value);
    };
    proto.BINMedalUpResponse.prototype.clearNewmedal = function() {
      this.setNewmedal(void 0);
    };
    proto.BINMedalUpResponse.prototype.hasNewmedal = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINMedalUpResponse.prototype.getCurrentlevel = function() {
      return jspb.Message.getFieldWithDefault(this, 4, 0);
    };
    proto.BINMedalUpResponse.prototype.setCurrentlevel = function(value) {
      jspb.Message.setField(this, 4, value);
    };
    proto.BINMedalUpResponse.prototype.clearCurrentlevel = function() {
      jspb.Message.setField(this, 4, void 0);
    };
    proto.BINMedalUpResponse.prototype.hasCurrentlevel = function() {
      return null != jspb.Message.getField(this, 4);
    };
    goog.object.extend(exports, proto);
    cc._RF.pop();
  }, {
    "google-protobuf": "google-protobuf"
  } ],
  login_pb: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "c7660hPv/tMKLWGZpK+b1aY", "login_pb");
    "use strict";
    var jspb = require("google-protobuf");
    var goog = jspb;
    var global = Function("return this")();
    var user_info_pb = require("./user_info_pb.js");
    goog.exportSymbol("proto.BINLoginRequest", null, global);
    goog.exportSymbol("proto.BINLoginResponse", null, global);
    proto.BINLoginRequest = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINLoginRequest, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINLoginRequest.displayName = "proto.BINLoginRequest");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINLoginRequest.prototype.toObject = function(opt_includeInstance) {
        return proto.BINLoginRequest.toObject(opt_includeInstance, this);
      };
      proto.BINLoginRequest.toObject = function(includeInstance, msg) {
        var f, obj = {
          username: jspb.Message.getField(msg, 1),
          password: jspb.Message.getField(msg, 2)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINLoginRequest.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINLoginRequest();
      return proto.BINLoginRequest.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINLoginRequest.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readString();
          msg.setUsername(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setPassword(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINLoginRequest.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINLoginRequest.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINLoginRequest.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeString(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
    };
    proto.BINLoginRequest.prototype.getUsername = function() {
      return jspb.Message.getFieldWithDefault(this, 1, "");
    };
    proto.BINLoginRequest.prototype.setUsername = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINLoginRequest.prototype.clearUsername = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINLoginRequest.prototype.hasUsername = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINLoginRequest.prototype.getPassword = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINLoginRequest.prototype.setPassword = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINLoginRequest.prototype.clearPassword = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINLoginRequest.prototype.hasPassword = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINLoginResponse = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINLoginResponse, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINLoginResponse.displayName = "proto.BINLoginResponse");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINLoginResponse.prototype.toObject = function(opt_includeInstance) {
        return proto.BINLoginResponse.toObject(opt_includeInstance, this);
      };
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
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINLoginResponse.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINLoginResponse();
      return proto.BINLoginResponse.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINLoginResponse.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readBool();
          msg.setResponsecode(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setMessage(value);
          break;

         case 3:
          var value = new user_info_pb.BINUserInfo();
          reader.readMessage(value, user_info_pb.BINUserInfo.deserializeBinaryFromReader);
          msg.setUserinfo(value);
          break;

         case 4:
          var value = new user_info_pb.BINUserSetting();
          reader.readMessage(value, user_info_pb.BINUserSetting.deserializeBinaryFromReader);
          msg.setUsersetting(value);
          break;

         case 5:
          var value = reader.readString();
          msg.setSessionid(value);
          break;

         case 6:
          var value = reader.readBool();
          msg.setHasplayingmatch(value);
          break;

         case 7:
          var value = reader.readBool();
          msg.setEnabledebuglag(value);
          break;

         case 8:
          var value = reader.readBool();
          msg.setEnableevent(value);
          break;

         case 9:
          var value = reader.readBool();
          msg.setEnablenotification(value);
          break;

         case 10:
          var value = reader.readBool();
          msg.setEnabletx(value);
          break;

         case 11:
          var value = reader.readString();
          msg.setNoticetext(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINLoginResponse.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINLoginResponse.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINLoginResponse.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeBool(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = this.getUserinfo();
      null != f && writer.writeMessage(3, f, user_info_pb.BINUserInfo.serializeBinaryToWriter);
      f = this.getUsersetting();
      null != f && writer.writeMessage(4, f, user_info_pb.BINUserSetting.serializeBinaryToWriter);
      f = jspb.Message.getField(this, 5);
      null != f && writer.writeString(5, f);
      f = jspb.Message.getField(this, 6);
      null != f && writer.writeBool(6, f);
      f = jspb.Message.getField(this, 7);
      null != f && writer.writeBool(7, f);
      f = jspb.Message.getField(this, 8);
      null != f && writer.writeBool(8, f);
      f = jspb.Message.getField(this, 9);
      null != f && writer.writeBool(9, f);
      f = jspb.Message.getField(this, 10);
      null != f && writer.writeBool(10, f);
      f = jspb.Message.getField(this, 11);
      null != f && writer.writeString(11, f);
    };
    proto.BINLoginResponse.prototype.getResponsecode = function() {
      return jspb.Message.getFieldWithDefault(this, 1, false);
    };
    proto.BINLoginResponse.prototype.setResponsecode = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINLoginResponse.prototype.clearResponsecode = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINLoginResponse.prototype.hasResponsecode = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINLoginResponse.prototype.getMessage = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINLoginResponse.prototype.setMessage = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINLoginResponse.prototype.clearMessage = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINLoginResponse.prototype.hasMessage = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINLoginResponse.prototype.getUserinfo = function() {
      return jspb.Message.getWrapperField(this, user_info_pb.BINUserInfo, 3);
    };
    proto.BINLoginResponse.prototype.setUserinfo = function(value) {
      jspb.Message.setWrapperField(this, 3, value);
    };
    proto.BINLoginResponse.prototype.clearUserinfo = function() {
      this.setUserinfo(void 0);
    };
    proto.BINLoginResponse.prototype.hasUserinfo = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINLoginResponse.prototype.getUsersetting = function() {
      return jspb.Message.getWrapperField(this, user_info_pb.BINUserSetting, 4);
    };
    proto.BINLoginResponse.prototype.setUsersetting = function(value) {
      jspb.Message.setWrapperField(this, 4, value);
    };
    proto.BINLoginResponse.prototype.clearUsersetting = function() {
      this.setUsersetting(void 0);
    };
    proto.BINLoginResponse.prototype.hasUsersetting = function() {
      return null != jspb.Message.getField(this, 4);
    };
    proto.BINLoginResponse.prototype.getSessionid = function() {
      return jspb.Message.getFieldWithDefault(this, 5, "");
    };
    proto.BINLoginResponse.prototype.setSessionid = function(value) {
      jspb.Message.setField(this, 5, value);
    };
    proto.BINLoginResponse.prototype.clearSessionid = function() {
      jspb.Message.setField(this, 5, void 0);
    };
    proto.BINLoginResponse.prototype.hasSessionid = function() {
      return null != jspb.Message.getField(this, 5);
    };
    proto.BINLoginResponse.prototype.getHasplayingmatch = function() {
      return jspb.Message.getFieldWithDefault(this, 6, false);
    };
    proto.BINLoginResponse.prototype.setHasplayingmatch = function(value) {
      jspb.Message.setField(this, 6, value);
    };
    proto.BINLoginResponse.prototype.clearHasplayingmatch = function() {
      jspb.Message.setField(this, 6, void 0);
    };
    proto.BINLoginResponse.prototype.hasHasplayingmatch = function() {
      return null != jspb.Message.getField(this, 6);
    };
    proto.BINLoginResponse.prototype.getEnabledebuglag = function() {
      return jspb.Message.getFieldWithDefault(this, 7, false);
    };
    proto.BINLoginResponse.prototype.setEnabledebuglag = function(value) {
      jspb.Message.setField(this, 7, value);
    };
    proto.BINLoginResponse.prototype.clearEnabledebuglag = function() {
      jspb.Message.setField(this, 7, void 0);
    };
    proto.BINLoginResponse.prototype.hasEnabledebuglag = function() {
      return null != jspb.Message.getField(this, 7);
    };
    proto.BINLoginResponse.prototype.getEnableevent = function() {
      return jspb.Message.getFieldWithDefault(this, 8, false);
    };
    proto.BINLoginResponse.prototype.setEnableevent = function(value) {
      jspb.Message.setField(this, 8, value);
    };
    proto.BINLoginResponse.prototype.clearEnableevent = function() {
      jspb.Message.setField(this, 8, void 0);
    };
    proto.BINLoginResponse.prototype.hasEnableevent = function() {
      return null != jspb.Message.getField(this, 8);
    };
    proto.BINLoginResponse.prototype.getEnablenotification = function() {
      return jspb.Message.getFieldWithDefault(this, 9, false);
    };
    proto.BINLoginResponse.prototype.setEnablenotification = function(value) {
      jspb.Message.setField(this, 9, value);
    };
    proto.BINLoginResponse.prototype.clearEnablenotification = function() {
      jspb.Message.setField(this, 9, void 0);
    };
    proto.BINLoginResponse.prototype.hasEnablenotification = function() {
      return null != jspb.Message.getField(this, 9);
    };
    proto.BINLoginResponse.prototype.getEnabletx = function() {
      return jspb.Message.getFieldWithDefault(this, 10, false);
    };
    proto.BINLoginResponse.prototype.setEnabletx = function(value) {
      jspb.Message.setField(this, 10, value);
    };
    proto.BINLoginResponse.prototype.clearEnabletx = function() {
      jspb.Message.setField(this, 10, void 0);
    };
    proto.BINLoginResponse.prototype.hasEnabletx = function() {
      return null != jspb.Message.getField(this, 10);
    };
    proto.BINLoginResponse.prototype.getNoticetext = function() {
      return jspb.Message.getFieldWithDefault(this, 11, "");
    };
    proto.BINLoginResponse.prototype.setNoticetext = function(value) {
      jspb.Message.setField(this, 11, value);
    };
    proto.BINLoginResponse.prototype.clearNoticetext = function() {
      jspb.Message.setField(this, 11, void 0);
    };
    proto.BINLoginResponse.prototype.hasNoticetext = function() {
      return null != jspb.Message.getField(this, 11);
    };
    goog.object.extend(exports, proto);
    cc._RF.pop();
  }, {
    "./user_info_pb.js": "user_info_pb",
    "google-protobuf": "google-protobuf"
  } ],
  logout_pb: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "388b2sDm/pO4bRpSWwm+3dF", "logout_pb");
    "use strict";
    var jspb = require("google-protobuf");
    var goog = jspb;
    var global = Function("return this")();
    goog.exportSymbol("proto.BINLogoutRequest", null, global);
    goog.exportSymbol("proto.BINLogoutResponse", null, global);
    proto.BINLogoutRequest = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINLogoutRequest, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINLogoutRequest.displayName = "proto.BINLogoutRequest");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINLogoutRequest.prototype.toObject = function(opt_includeInstance) {
        return proto.BINLogoutRequest.toObject(opt_includeInstance, this);
      };
      proto.BINLogoutRequest.toObject = function(includeInstance, msg) {
        var f, obj = {
          dologout: jspb.Message.getField(msg, 1)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINLogoutRequest.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINLogoutRequest();
      return proto.BINLogoutRequest.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINLogoutRequest.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readBool();
          msg.setDologout(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINLogoutRequest.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINLogoutRequest.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINLogoutRequest.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeBool(1, f);
    };
    proto.BINLogoutRequest.prototype.getDologout = function() {
      return jspb.Message.getFieldWithDefault(this, 1, false);
    };
    proto.BINLogoutRequest.prototype.setDologout = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINLogoutRequest.prototype.clearDologout = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINLogoutRequest.prototype.hasDologout = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINLogoutResponse = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINLogoutResponse, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINLogoutResponse.displayName = "proto.BINLogoutResponse");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINLogoutResponse.prototype.toObject = function(opt_includeInstance) {
        return proto.BINLogoutResponse.toObject(opt_includeInstance, this);
      };
      proto.BINLogoutResponse.toObject = function(includeInstance, msg) {
        var f, obj = {
          responsecode: jspb.Message.getField(msg, 1),
          message: jspb.Message.getField(msg, 2)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINLogoutResponse.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINLogoutResponse();
      return proto.BINLogoutResponse.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINLogoutResponse.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readBool();
          msg.setResponsecode(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setMessage(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINLogoutResponse.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINLogoutResponse.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINLogoutResponse.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeBool(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
    };
    proto.BINLogoutResponse.prototype.getResponsecode = function() {
      return jspb.Message.getFieldWithDefault(this, 1, false);
    };
    proto.BINLogoutResponse.prototype.setResponsecode = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINLogoutResponse.prototype.clearResponsecode = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINLogoutResponse.prototype.hasResponsecode = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINLogoutResponse.prototype.getMessage = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINLogoutResponse.prototype.setMessage = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINLogoutResponse.prototype.clearMessage = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINLogoutResponse.prototype.hasMessage = function() {
      return null != jspb.Message.getField(this, 2);
    };
    goog.object.extend(exports, proto);
    cc._RF.pop();
  }, {
    "google-protobuf": "google-protobuf"
  } ],
  lookup_game_history_pb: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "9f907WDcV9If4U0MxHlexWu", "lookup_game_history_pb");
    "use strict";
    var jspb = require("google-protobuf");
    var goog = jspb;
    var global = Function("return this")();
    var map_field_entry_pb = require("./map_field_entry_pb.js");
    goog.exportSymbol("proto.BINGameHistory", null, global);
    goog.exportSymbol("proto.BINLookUpGameHistoryRequest", null, global);
    goog.exportSymbol("proto.BINLookUpGameHistoryResponse", null, global);
    proto.BINLookUpGameHistoryRequest = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, proto.BINLookUpGameHistoryRequest.repeatedFields_, null);
    };
    goog.inherits(proto.BINLookUpGameHistoryRequest, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINLookUpGameHistoryRequest.displayName = "proto.BINLookUpGameHistoryRequest");
    proto.BINLookUpGameHistoryRequest.repeatedFields_ = [ 5 ];
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINLookUpGameHistoryRequest.prototype.toObject = function(opt_includeInstance) {
        return proto.BINLookUpGameHistoryRequest.toObject(opt_includeInstance, this);
      };
      proto.BINLookUpGameHistoryRequest.toObject = function(includeInstance, msg) {
        var f, obj = {
          firstresult: jspb.Message.getField(msg, 1),
          maxresult: jspb.Message.getField(msg, 2),
          orderbyfield: jspb.Message.getField(msg, 3),
          asc: jspb.Message.getField(msg, 4),
          argsList: jspb.Message.toObjectList(msg.getArgsList(), map_field_entry_pb.BINMapFieldEntry.toObject, includeInstance)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINLookUpGameHistoryRequest.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINLookUpGameHistoryRequest();
      return proto.BINLookUpGameHistoryRequest.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINLookUpGameHistoryRequest.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt32();
          msg.setFirstresult(value);
          break;

         case 2:
          var value = reader.readInt32();
          msg.setMaxresult(value);
          break;

         case 3:
          var value = reader.readInt32();
          msg.setOrderbyfield(value);
          break;

         case 4:
          var value = reader.readBool();
          msg.setAsc(value);
          break;

         case 5:
          var value = new map_field_entry_pb.BINMapFieldEntry();
          reader.readMessage(value, map_field_entry_pb.BINMapFieldEntry.deserializeBinaryFromReader);
          msg.addArgs(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINLookUpGameHistoryRequest.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINLookUpGameHistoryRequest.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINLookUpGameHistoryRequest.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt32(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeInt32(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeInt32(3, f);
      f = jspb.Message.getField(this, 4);
      null != f && writer.writeBool(4, f);
      f = this.getArgsList();
      f.length > 0 && writer.writeRepeatedMessage(5, f, map_field_entry_pb.BINMapFieldEntry.serializeBinaryToWriter);
    };
    proto.BINLookUpGameHistoryRequest.prototype.getFirstresult = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINLookUpGameHistoryRequest.prototype.setFirstresult = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINLookUpGameHistoryRequest.prototype.clearFirstresult = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINLookUpGameHistoryRequest.prototype.hasFirstresult = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINLookUpGameHistoryRequest.prototype.getMaxresult = function() {
      return jspb.Message.getFieldWithDefault(this, 2, 0);
    };
    proto.BINLookUpGameHistoryRequest.prototype.setMaxresult = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINLookUpGameHistoryRequest.prototype.clearMaxresult = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINLookUpGameHistoryRequest.prototype.hasMaxresult = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINLookUpGameHistoryRequest.prototype.getOrderbyfield = function() {
      return jspb.Message.getFieldWithDefault(this, 3, 0);
    };
    proto.BINLookUpGameHistoryRequest.prototype.setOrderbyfield = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINLookUpGameHistoryRequest.prototype.clearOrderbyfield = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINLookUpGameHistoryRequest.prototype.hasOrderbyfield = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINLookUpGameHistoryRequest.prototype.getAsc = function() {
      return jspb.Message.getFieldWithDefault(this, 4, false);
    };
    proto.BINLookUpGameHistoryRequest.prototype.setAsc = function(value) {
      jspb.Message.setField(this, 4, value);
    };
    proto.BINLookUpGameHistoryRequest.prototype.clearAsc = function() {
      jspb.Message.setField(this, 4, void 0);
    };
    proto.BINLookUpGameHistoryRequest.prototype.hasAsc = function() {
      return null != jspb.Message.getField(this, 4);
    };
    proto.BINLookUpGameHistoryRequest.prototype.getArgsList = function() {
      return jspb.Message.getRepeatedWrapperField(this, map_field_entry_pb.BINMapFieldEntry, 5);
    };
    proto.BINLookUpGameHistoryRequest.prototype.setArgsList = function(value) {
      jspb.Message.setRepeatedWrapperField(this, 5, value);
    };
    proto.BINLookUpGameHistoryRequest.prototype.addArgs = function(opt_value, opt_index) {
      return jspb.Message.addToRepeatedWrapperField(this, 5, opt_value, proto.BINMapFieldEntry, opt_index);
    };
    proto.BINLookUpGameHistoryRequest.prototype.clearArgsList = function() {
      this.setArgsList([]);
    };
    proto.BINGameHistory = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINGameHistory, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINGameHistory.displayName = "proto.BINGameHistory");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINGameHistory.prototype.toObject = function(opt_includeInstance) {
        return proto.BINGameHistory.toObject(opt_includeInstance, this);
      };
      proto.BINGameHistory.toObject = function(includeInstance, msg) {
        var f, obj = {
          first: jspb.Message.getField(msg, 1),
          second: jspb.Message.getField(msg, 2),
          third: jspb.Message.getField(msg, 3),
          fourth: jspb.Message.getField(msg, 4),
          fifth: jspb.Message.getField(msg, 5),
          sixth: jspb.Message.getField(msg, 6),
          seventh: jspb.Message.getField(msg, 7),
          eighth: jspb.Message.getField(msg, 8),
          ninth: jspb.Message.getField(msg, 9),
          tenth: jspb.Message.getField(msg, 10)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINGameHistory.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINGameHistory();
      return proto.BINGameHistory.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINGameHistory.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readString();
          msg.setFirst(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setSecond(value);
          break;

         case 3:
          var value = reader.readString();
          msg.setThird(value);
          break;

         case 4:
          var value = reader.readString();
          msg.setFourth(value);
          break;

         case 5:
          var value = reader.readString();
          msg.setFifth(value);
          break;

         case 6:
          var value = reader.readString();
          msg.setSixth(value);
          break;

         case 7:
          var value = reader.readString();
          msg.setSeventh(value);
          break;

         case 8:
          var value = reader.readString();
          msg.setEighth(value);
          break;

         case 9:
          var value = reader.readString();
          msg.setNinth(value);
          break;

         case 10:
          var value = reader.readString();
          msg.setTenth(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINGameHistory.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINGameHistory.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINGameHistory.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeString(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeString(3, f);
      f = jspb.Message.getField(this, 4);
      null != f && writer.writeString(4, f);
      f = jspb.Message.getField(this, 5);
      null != f && writer.writeString(5, f);
      f = jspb.Message.getField(this, 6);
      null != f && writer.writeString(6, f);
      f = jspb.Message.getField(this, 7);
      null != f && writer.writeString(7, f);
      f = jspb.Message.getField(this, 8);
      null != f && writer.writeString(8, f);
      f = jspb.Message.getField(this, 9);
      null != f && writer.writeString(9, f);
      f = jspb.Message.getField(this, 10);
      null != f && writer.writeString(10, f);
    };
    proto.BINGameHistory.prototype.getFirst = function() {
      return jspb.Message.getFieldWithDefault(this, 1, "");
    };
    proto.BINGameHistory.prototype.setFirst = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINGameHistory.prototype.clearFirst = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINGameHistory.prototype.hasFirst = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINGameHistory.prototype.getSecond = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINGameHistory.prototype.setSecond = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINGameHistory.prototype.clearSecond = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINGameHistory.prototype.hasSecond = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINGameHistory.prototype.getThird = function() {
      return jspb.Message.getFieldWithDefault(this, 3, "");
    };
    proto.BINGameHistory.prototype.setThird = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINGameHistory.prototype.clearThird = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINGameHistory.prototype.hasThird = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINGameHistory.prototype.getFourth = function() {
      return jspb.Message.getFieldWithDefault(this, 4, "");
    };
    proto.BINGameHistory.prototype.setFourth = function(value) {
      jspb.Message.setField(this, 4, value);
    };
    proto.BINGameHistory.prototype.clearFourth = function() {
      jspb.Message.setField(this, 4, void 0);
    };
    proto.BINGameHistory.prototype.hasFourth = function() {
      return null != jspb.Message.getField(this, 4);
    };
    proto.BINGameHistory.prototype.getFifth = function() {
      return jspb.Message.getFieldWithDefault(this, 5, "");
    };
    proto.BINGameHistory.prototype.setFifth = function(value) {
      jspb.Message.setField(this, 5, value);
    };
    proto.BINGameHistory.prototype.clearFifth = function() {
      jspb.Message.setField(this, 5, void 0);
    };
    proto.BINGameHistory.prototype.hasFifth = function() {
      return null != jspb.Message.getField(this, 5);
    };
    proto.BINGameHistory.prototype.getSixth = function() {
      return jspb.Message.getFieldWithDefault(this, 6, "");
    };
    proto.BINGameHistory.prototype.setSixth = function(value) {
      jspb.Message.setField(this, 6, value);
    };
    proto.BINGameHistory.prototype.clearSixth = function() {
      jspb.Message.setField(this, 6, void 0);
    };
    proto.BINGameHistory.prototype.hasSixth = function() {
      return null != jspb.Message.getField(this, 6);
    };
    proto.BINGameHistory.prototype.getSeventh = function() {
      return jspb.Message.getFieldWithDefault(this, 7, "");
    };
    proto.BINGameHistory.prototype.setSeventh = function(value) {
      jspb.Message.setField(this, 7, value);
    };
    proto.BINGameHistory.prototype.clearSeventh = function() {
      jspb.Message.setField(this, 7, void 0);
    };
    proto.BINGameHistory.prototype.hasSeventh = function() {
      return null != jspb.Message.getField(this, 7);
    };
    proto.BINGameHistory.prototype.getEighth = function() {
      return jspb.Message.getFieldWithDefault(this, 8, "");
    };
    proto.BINGameHistory.prototype.setEighth = function(value) {
      jspb.Message.setField(this, 8, value);
    };
    proto.BINGameHistory.prototype.clearEighth = function() {
      jspb.Message.setField(this, 8, void 0);
    };
    proto.BINGameHistory.prototype.hasEighth = function() {
      return null != jspb.Message.getField(this, 8);
    };
    proto.BINGameHistory.prototype.getNinth = function() {
      return jspb.Message.getFieldWithDefault(this, 9, "");
    };
    proto.BINGameHistory.prototype.setNinth = function(value) {
      jspb.Message.setField(this, 9, value);
    };
    proto.BINGameHistory.prototype.clearNinth = function() {
      jspb.Message.setField(this, 9, void 0);
    };
    proto.BINGameHistory.prototype.hasNinth = function() {
      return null != jspb.Message.getField(this, 9);
    };
    proto.BINGameHistory.prototype.getTenth = function() {
      return jspb.Message.getFieldWithDefault(this, 10, "");
    };
    proto.BINGameHistory.prototype.setTenth = function(value) {
      jspb.Message.setField(this, 10, value);
    };
    proto.BINGameHistory.prototype.clearTenth = function() {
      jspb.Message.setField(this, 10, void 0);
    };
    proto.BINGameHistory.prototype.hasTenth = function() {
      return null != jspb.Message.getField(this, 10);
    };
    proto.BINLookUpGameHistoryResponse = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, proto.BINLookUpGameHistoryResponse.repeatedFields_, null);
    };
    goog.inherits(proto.BINLookUpGameHistoryResponse, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINLookUpGameHistoryResponse.displayName = "proto.BINLookUpGameHistoryResponse");
    proto.BINLookUpGameHistoryResponse.repeatedFields_ = [ 3, 4 ];
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINLookUpGameHistoryResponse.prototype.toObject = function(opt_includeInstance) {
        return proto.BINLookUpGameHistoryResponse.toObject(opt_includeInstance, this);
      };
      proto.BINLookUpGameHistoryResponse.toObject = function(includeInstance, msg) {
        var f, obj = {
          responsecode: jspb.Message.getField(msg, 1),
          message: jspb.Message.getField(msg, 2),
          historiesList: jspb.Message.toObjectList(msg.getHistoriesList(), proto.BINGameHistory.toObject, includeInstance),
          argsList: jspb.Message.toObjectList(msg.getArgsList(), map_field_entry_pb.BINMapFieldEntry.toObject, includeInstance)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINLookUpGameHistoryResponse.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINLookUpGameHistoryResponse();
      return proto.BINLookUpGameHistoryResponse.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINLookUpGameHistoryResponse.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readBool();
          msg.setResponsecode(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setMessage(value);
          break;

         case 3:
          var value = new proto.BINGameHistory();
          reader.readMessage(value, proto.BINGameHistory.deserializeBinaryFromReader);
          msg.addHistories(value);
          break;

         case 4:
          var value = new map_field_entry_pb.BINMapFieldEntry();
          reader.readMessage(value, map_field_entry_pb.BINMapFieldEntry.deserializeBinaryFromReader);
          msg.addArgs(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINLookUpGameHistoryResponse.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINLookUpGameHistoryResponse.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINLookUpGameHistoryResponse.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeBool(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = this.getHistoriesList();
      f.length > 0 && writer.writeRepeatedMessage(3, f, proto.BINGameHistory.serializeBinaryToWriter);
      f = this.getArgsList();
      f.length > 0 && writer.writeRepeatedMessage(4, f, map_field_entry_pb.BINMapFieldEntry.serializeBinaryToWriter);
    };
    proto.BINLookUpGameHistoryResponse.prototype.getResponsecode = function() {
      return jspb.Message.getFieldWithDefault(this, 1, false);
    };
    proto.BINLookUpGameHistoryResponse.prototype.setResponsecode = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINLookUpGameHistoryResponse.prototype.clearResponsecode = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINLookUpGameHistoryResponse.prototype.hasResponsecode = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINLookUpGameHistoryResponse.prototype.getMessage = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINLookUpGameHistoryResponse.prototype.setMessage = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINLookUpGameHistoryResponse.prototype.clearMessage = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINLookUpGameHistoryResponse.prototype.hasMessage = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINLookUpGameHistoryResponse.prototype.getHistoriesList = function() {
      return jspb.Message.getRepeatedWrapperField(this, proto.BINGameHistory, 3);
    };
    proto.BINLookUpGameHistoryResponse.prototype.setHistoriesList = function(value) {
      jspb.Message.setRepeatedWrapperField(this, 3, value);
    };
    proto.BINLookUpGameHistoryResponse.prototype.addHistories = function(opt_value, opt_index) {
      return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.BINGameHistory, opt_index);
    };
    proto.BINLookUpGameHistoryResponse.prototype.clearHistoriesList = function() {
      this.setHistoriesList([]);
    };
    proto.BINLookUpGameHistoryResponse.prototype.getArgsList = function() {
      return jspb.Message.getRepeatedWrapperField(this, map_field_entry_pb.BINMapFieldEntry, 4);
    };
    proto.BINLookUpGameHistoryResponse.prototype.setArgsList = function(value) {
      jspb.Message.setRepeatedWrapperField(this, 4, value);
    };
    proto.BINLookUpGameHistoryResponse.prototype.addArgs = function(opt_value, opt_index) {
      return jspb.Message.addToRepeatedWrapperField(this, 4, opt_value, proto.BINMapFieldEntry, opt_index);
    };
    proto.BINLookUpGameHistoryResponse.prototype.clearArgsList = function() {
      this.setArgsList([]);
    };
    goog.object.extend(exports, proto);
    cc._RF.pop();
  }, {
    "./map_field_entry_pb.js": "map_field_entry_pb",
    "google-protobuf": "google-protobuf"
  } ],
  lookup_room_pb: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "655a4ZJAQhPf57BoVLdjAgW", "lookup_room_pb");
    "use strict";
    var jspb = require("google-protobuf");
    var goog = jspb;
    var global = Function("return this")();
    goog.exportSymbol("proto.BINLookUpRoomRequest", null, global);
    goog.exportSymbol("proto.BINLookUpRoomResponse", null, global);
    goog.exportSymbol("proto.BINRoomInfo", null, global);
    proto.BINLookUpRoomRequest = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINLookUpRoomRequest, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINLookUpRoomRequest.displayName = "proto.BINLookUpRoomRequest");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINLookUpRoomRequest.prototype.toObject = function(opt_includeInstance) {
        return proto.BINLookUpRoomRequest.toObject(opt_includeInstance, this);
      };
      proto.BINLookUpRoomRequest.toObject = function(includeInstance, msg) {
        var f, obj = {
          zoneid: jspb.Message.getField(msg, 1),
          type: jspb.Message.getField(msg, 2),
          firstresult: jspb.Message.getField(msg, 3),
          maxresult: jspb.Message.getField(msg, 4),
          orderbyfield: jspb.Message.getField(msg, 5),
          asc: jspb.Message.getField(msg, 6),
          roomgroup: jspb.Message.getField(msg, 7)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINLookUpRoomRequest.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINLookUpRoomRequest();
      return proto.BINLookUpRoomRequest.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINLookUpRoomRequest.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt32();
          msg.setZoneid(value);
          break;

         case 2:
          var value = reader.readInt32();
          msg.setType(value);
          break;

         case 3:
          var value = reader.readInt32();
          msg.setFirstresult(value);
          break;

         case 4:
          var value = reader.readInt32();
          msg.setMaxresult(value);
          break;

         case 5:
          var value = reader.readInt32();
          msg.setOrderbyfield(value);
          break;

         case 6:
          var value = reader.readBool();
          msg.setAsc(value);
          break;

         case 7:
          var value = reader.readInt32();
          msg.setRoomgroup(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINLookUpRoomRequest.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINLookUpRoomRequest.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINLookUpRoomRequest.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt32(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeInt32(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeInt32(3, f);
      f = jspb.Message.getField(this, 4);
      null != f && writer.writeInt32(4, f);
      f = jspb.Message.getField(this, 5);
      null != f && writer.writeInt32(5, f);
      f = jspb.Message.getField(this, 6);
      null != f && writer.writeBool(6, f);
      f = jspb.Message.getField(this, 7);
      null != f && writer.writeInt32(7, f);
    };
    proto.BINLookUpRoomRequest.prototype.getZoneid = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINLookUpRoomRequest.prototype.setZoneid = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINLookUpRoomRequest.prototype.clearZoneid = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINLookUpRoomRequest.prototype.hasZoneid = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINLookUpRoomRequest.prototype.getType = function() {
      return jspb.Message.getFieldWithDefault(this, 2, 0);
    };
    proto.BINLookUpRoomRequest.prototype.setType = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINLookUpRoomRequest.prototype.clearType = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINLookUpRoomRequest.prototype.hasType = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINLookUpRoomRequest.prototype.getFirstresult = function() {
      return jspb.Message.getFieldWithDefault(this, 3, 0);
    };
    proto.BINLookUpRoomRequest.prototype.setFirstresult = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINLookUpRoomRequest.prototype.clearFirstresult = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINLookUpRoomRequest.prototype.hasFirstresult = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINLookUpRoomRequest.prototype.getMaxresult = function() {
      return jspb.Message.getFieldWithDefault(this, 4, 0);
    };
    proto.BINLookUpRoomRequest.prototype.setMaxresult = function(value) {
      jspb.Message.setField(this, 4, value);
    };
    proto.BINLookUpRoomRequest.prototype.clearMaxresult = function() {
      jspb.Message.setField(this, 4, void 0);
    };
    proto.BINLookUpRoomRequest.prototype.hasMaxresult = function() {
      return null != jspb.Message.getField(this, 4);
    };
    proto.BINLookUpRoomRequest.prototype.getOrderbyfield = function() {
      return jspb.Message.getFieldWithDefault(this, 5, 0);
    };
    proto.BINLookUpRoomRequest.prototype.setOrderbyfield = function(value) {
      jspb.Message.setField(this, 5, value);
    };
    proto.BINLookUpRoomRequest.prototype.clearOrderbyfield = function() {
      jspb.Message.setField(this, 5, void 0);
    };
    proto.BINLookUpRoomRequest.prototype.hasOrderbyfield = function() {
      return null != jspb.Message.getField(this, 5);
    };
    proto.BINLookUpRoomRequest.prototype.getAsc = function() {
      return jspb.Message.getFieldWithDefault(this, 6, false);
    };
    proto.BINLookUpRoomRequest.prototype.setAsc = function(value) {
      jspb.Message.setField(this, 6, value);
    };
    proto.BINLookUpRoomRequest.prototype.clearAsc = function() {
      jspb.Message.setField(this, 6, void 0);
    };
    proto.BINLookUpRoomRequest.prototype.hasAsc = function() {
      return null != jspb.Message.getField(this, 6);
    };
    proto.BINLookUpRoomRequest.prototype.getRoomgroup = function() {
      return jspb.Message.getFieldWithDefault(this, 7, 0);
    };
    proto.BINLookUpRoomRequest.prototype.setRoomgroup = function(value) {
      jspb.Message.setField(this, 7, value);
    };
    proto.BINLookUpRoomRequest.prototype.clearRoomgroup = function() {
      jspb.Message.setField(this, 7, void 0);
    };
    proto.BINLookUpRoomRequest.prototype.hasRoomgroup = function() {
      return null != jspb.Message.getField(this, 7);
    };
    proto.BINRoomInfo = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINRoomInfo, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINRoomInfo.displayName = "proto.BINRoomInfo");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINRoomInfo.prototype.toObject = function(opt_includeInstance) {
        return proto.BINRoomInfo.toObject(opt_includeInstance, this);
      };
      proto.BINRoomInfo.toObject = function(includeInstance, msg) {
        var f, obj = {
          roomindex: jspb.Message.getField(msg, 1),
          minbet: jspb.Message.getField(msg, 2),
          minentermoney: jspb.Message.getField(msg, 3),
          playersize: jspb.Message.getField(msg, 4),
          playingplayer: jspb.Message.getField(msg, 5),
          isplaying: jspb.Message.getField(msg, 6),
          roomconfig: jspb.Message.getField(msg, 7)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINRoomInfo.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINRoomInfo();
      return proto.BINRoomInfo.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINRoomInfo.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt32();
          msg.setRoomindex(value);
          break;

         case 2:
          var value = reader.readInt32();
          msg.setMinbet(value);
          break;

         case 3:
          var value = reader.readInt64();
          msg.setMinentermoney(value);
          break;

         case 4:
          var value = reader.readInt32();
          msg.setPlayersize(value);
          break;

         case 5:
          var value = reader.readInt32();
          msg.setPlayingplayer(value);
          break;

         case 6:
          var value = reader.readBool();
          msg.setIsplaying(value);
          break;

         case 7:
          var value = reader.readString();
          msg.setRoomconfig(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINRoomInfo.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINRoomInfo.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINRoomInfo.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt32(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeInt32(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeInt64(3, f);
      f = jspb.Message.getField(this, 4);
      null != f && writer.writeInt32(4, f);
      f = jspb.Message.getField(this, 5);
      null != f && writer.writeInt32(5, f);
      f = jspb.Message.getField(this, 6);
      null != f && writer.writeBool(6, f);
      f = jspb.Message.getField(this, 7);
      null != f && writer.writeString(7, f);
    };
    proto.BINRoomInfo.prototype.getRoomindex = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINRoomInfo.prototype.setRoomindex = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINRoomInfo.prototype.clearRoomindex = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINRoomInfo.prototype.hasRoomindex = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINRoomInfo.prototype.getMinbet = function() {
      return jspb.Message.getFieldWithDefault(this, 2, 0);
    };
    proto.BINRoomInfo.prototype.setMinbet = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINRoomInfo.prototype.clearMinbet = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINRoomInfo.prototype.hasMinbet = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINRoomInfo.prototype.getMinentermoney = function() {
      return jspb.Message.getFieldWithDefault(this, 3, 0);
    };
    proto.BINRoomInfo.prototype.setMinentermoney = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINRoomInfo.prototype.clearMinentermoney = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINRoomInfo.prototype.hasMinentermoney = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINRoomInfo.prototype.getPlayersize = function() {
      return jspb.Message.getFieldWithDefault(this, 4, 0);
    };
    proto.BINRoomInfo.prototype.setPlayersize = function(value) {
      jspb.Message.setField(this, 4, value);
    };
    proto.BINRoomInfo.prototype.clearPlayersize = function() {
      jspb.Message.setField(this, 4, void 0);
    };
    proto.BINRoomInfo.prototype.hasPlayersize = function() {
      return null != jspb.Message.getField(this, 4);
    };
    proto.BINRoomInfo.prototype.getPlayingplayer = function() {
      return jspb.Message.getFieldWithDefault(this, 5, 0);
    };
    proto.BINRoomInfo.prototype.setPlayingplayer = function(value) {
      jspb.Message.setField(this, 5, value);
    };
    proto.BINRoomInfo.prototype.clearPlayingplayer = function() {
      jspb.Message.setField(this, 5, void 0);
    };
    proto.BINRoomInfo.prototype.hasPlayingplayer = function() {
      return null != jspb.Message.getField(this, 5);
    };
    proto.BINRoomInfo.prototype.getIsplaying = function() {
      return jspb.Message.getFieldWithDefault(this, 6, false);
    };
    proto.BINRoomInfo.prototype.setIsplaying = function(value) {
      jspb.Message.setField(this, 6, value);
    };
    proto.BINRoomInfo.prototype.clearIsplaying = function() {
      jspb.Message.setField(this, 6, void 0);
    };
    proto.BINRoomInfo.prototype.hasIsplaying = function() {
      return null != jspb.Message.getField(this, 6);
    };
    proto.BINRoomInfo.prototype.getRoomconfig = function() {
      return jspb.Message.getFieldWithDefault(this, 7, "");
    };
    proto.BINRoomInfo.prototype.setRoomconfig = function(value) {
      jspb.Message.setField(this, 7, value);
    };
    proto.BINRoomInfo.prototype.clearRoomconfig = function() {
      jspb.Message.setField(this, 7, void 0);
    };
    proto.BINRoomInfo.prototype.hasRoomconfig = function() {
      return null != jspb.Message.getField(this, 7);
    };
    proto.BINLookUpRoomResponse = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, proto.BINLookUpRoomResponse.repeatedFields_, null);
    };
    goog.inherits(proto.BINLookUpRoomResponse, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINLookUpRoomResponse.displayName = "proto.BINLookUpRoomResponse");
    proto.BINLookUpRoomResponse.repeatedFields_ = [ 3 ];
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINLookUpRoomResponse.prototype.toObject = function(opt_includeInstance) {
        return proto.BINLookUpRoomResponse.toObject(opt_includeInstance, this);
      };
      proto.BINLookUpRoomResponse.toObject = function(includeInstance, msg) {
        var f, obj = {
          responsecode: jspb.Message.getField(msg, 1),
          message: jspb.Message.getField(msg, 2),
          roominfosList: jspb.Message.toObjectList(msg.getRoominfosList(), proto.BINRoomInfo.toObject, includeInstance)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINLookUpRoomResponse.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINLookUpRoomResponse();
      return proto.BINLookUpRoomResponse.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINLookUpRoomResponse.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readBool();
          msg.setResponsecode(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setMessage(value);
          break;

         case 3:
          var value = new proto.BINRoomInfo();
          reader.readMessage(value, proto.BINRoomInfo.deserializeBinaryFromReader);
          msg.addRoominfos(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINLookUpRoomResponse.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINLookUpRoomResponse.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINLookUpRoomResponse.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeBool(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = this.getRoominfosList();
      f.length > 0 && writer.writeRepeatedMessage(3, f, proto.BINRoomInfo.serializeBinaryToWriter);
    };
    proto.BINLookUpRoomResponse.prototype.getResponsecode = function() {
      return jspb.Message.getFieldWithDefault(this, 1, false);
    };
    proto.BINLookUpRoomResponse.prototype.setResponsecode = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINLookUpRoomResponse.prototype.clearResponsecode = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINLookUpRoomResponse.prototype.hasResponsecode = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINLookUpRoomResponse.prototype.getMessage = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINLookUpRoomResponse.prototype.setMessage = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINLookUpRoomResponse.prototype.clearMessage = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINLookUpRoomResponse.prototype.hasMessage = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINLookUpRoomResponse.prototype.getRoominfosList = function() {
      return jspb.Message.getRepeatedWrapperField(this, proto.BINRoomInfo, 3);
    };
    proto.BINLookUpRoomResponse.prototype.setRoominfosList = function(value) {
      jspb.Message.setRepeatedWrapperField(this, 3, value);
    };
    proto.BINLookUpRoomResponse.prototype.addRoominfos = function(opt_value, opt_index) {
      return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.BINRoomInfo, opt_index);
    };
    proto.BINLookUpRoomResponse.prototype.clearRoominfosList = function() {
      this.setRoominfosList([]);
    };
    goog.object.extend(exports, proto);
    cc._RF.pop();
  }, {
    "google-protobuf": "google-protobuf"
  } ],
  map_field_entry_pb: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "80202BPp7lGnbXHPPyo9onI", "map_field_entry_pb");
    "use strict";
    var jspb = require("google-protobuf");
    var goog = jspb;
    var global = Function("return this")();
    goog.exportSymbol("proto.BINMapFieldEntry", null, global);
    proto.BINMapFieldEntry = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINMapFieldEntry, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINMapFieldEntry.displayName = "proto.BINMapFieldEntry");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINMapFieldEntry.prototype.toObject = function(opt_includeInstance) {
        return proto.BINMapFieldEntry.toObject(opt_includeInstance, this);
      };
      proto.BINMapFieldEntry.toObject = function(includeInstance, msg) {
        var f, obj = {
          key: jspb.Message.getField(msg, 1),
          value: jspb.Message.getField(msg, 2)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINMapFieldEntry.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINMapFieldEntry();
      return proto.BINMapFieldEntry.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINMapFieldEntry.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readString();
          msg.setKey(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setValue(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINMapFieldEntry.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINMapFieldEntry.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINMapFieldEntry.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeString(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
    };
    proto.BINMapFieldEntry.prototype.getKey = function() {
      return jspb.Message.getFieldWithDefault(this, 1, "");
    };
    proto.BINMapFieldEntry.prototype.setKey = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINMapFieldEntry.prototype.clearKey = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINMapFieldEntry.prototype.hasKey = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINMapFieldEntry.prototype.getValue = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINMapFieldEntry.prototype.setValue = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINMapFieldEntry.prototype.clearValue = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINMapFieldEntry.prototype.hasValue = function() {
      return null != jspb.Message.getField(this, 2);
    };
    goog.object.extend(exports, proto);
    cc._RF.pop();
  }, {
    "google-protobuf": "google-protobuf"
  } ],
  match_begin_pb: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "6edb0dTOK1AFrkB4HWIHNwG", "match_begin_pb");
    "use strict";
    var jspb = require("google-protobuf");
    var goog = jspb;
    var global = Function("return this")();
    goog.exportSymbol("proto.BINMatchBeginRequest", null, global);
    goog.exportSymbol("proto.BINMatchBeginResponse", null, global);
    proto.BINMatchBeginRequest = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINMatchBeginRequest, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINMatchBeginRequest.displayName = "proto.BINMatchBeginRequest");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINMatchBeginRequest.prototype.toObject = function(opt_includeInstance) {
        return proto.BINMatchBeginRequest.toObject(opt_includeInstance, this);
      };
      proto.BINMatchBeginRequest.toObject = function(includeInstance, msg) {
        var f, obj = {
          roomindex: jspb.Message.getField(msg, 1)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINMatchBeginRequest.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINMatchBeginRequest();
      return proto.BINMatchBeginRequest.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINMatchBeginRequest.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt32();
          msg.setRoomindex(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINMatchBeginRequest.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINMatchBeginRequest.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINMatchBeginRequest.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt32(1, f);
    };
    proto.BINMatchBeginRequest.prototype.getRoomindex = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINMatchBeginRequest.prototype.setRoomindex = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINMatchBeginRequest.prototype.clearRoomindex = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINMatchBeginRequest.prototype.hasRoomindex = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINMatchBeginResponse = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINMatchBeginResponse, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINMatchBeginResponse.displayName = "proto.BINMatchBeginResponse");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINMatchBeginResponse.prototype.toObject = function(opt_includeInstance) {
        return proto.BINMatchBeginResponse.toObject(opt_includeInstance, this);
      };
      proto.BINMatchBeginResponse.toObject = function(includeInstance, msg) {
        var f, obj = {
          responsecode: jspb.Message.getField(msg, 1),
          message: jspb.Message.getField(msg, 2),
          countdowntimer: jspb.Message.getField(msg, 3),
          zoneid: jspb.Message.getField(msg, 4)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINMatchBeginResponse.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINMatchBeginResponse();
      return proto.BINMatchBeginResponse.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINMatchBeginResponse.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readBool();
          msg.setResponsecode(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setMessage(value);
          break;

         case 3:
          var value = reader.readInt32();
          msg.setCountdowntimer(value);
          break;

         case 4:
          var value = reader.readInt32();
          msg.setZoneid(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINMatchBeginResponse.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINMatchBeginResponse.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINMatchBeginResponse.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeBool(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeInt32(3, f);
      f = jspb.Message.getField(this, 4);
      null != f && writer.writeInt32(4, f);
    };
    proto.BINMatchBeginResponse.prototype.getResponsecode = function() {
      return jspb.Message.getFieldWithDefault(this, 1, false);
    };
    proto.BINMatchBeginResponse.prototype.setResponsecode = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINMatchBeginResponse.prototype.clearResponsecode = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINMatchBeginResponse.prototype.hasResponsecode = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINMatchBeginResponse.prototype.getMessage = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINMatchBeginResponse.prototype.setMessage = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINMatchBeginResponse.prototype.clearMessage = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINMatchBeginResponse.prototype.hasMessage = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINMatchBeginResponse.prototype.getCountdowntimer = function() {
      return jspb.Message.getFieldWithDefault(this, 3, 0);
    };
    proto.BINMatchBeginResponse.prototype.setCountdowntimer = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINMatchBeginResponse.prototype.clearCountdowntimer = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINMatchBeginResponse.prototype.hasCountdowntimer = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINMatchBeginResponse.prototype.getZoneid = function() {
      return jspb.Message.getFieldWithDefault(this, 4, 0);
    };
    proto.BINMatchBeginResponse.prototype.setZoneid = function(value) {
      jspb.Message.setField(this, 4, value);
    };
    proto.BINMatchBeginResponse.prototype.clearZoneid = function() {
      jspb.Message.setField(this, 4, void 0);
    };
    proto.BINMatchBeginResponse.prototype.hasZoneid = function() {
      return null != jspb.Message.getField(this, 4);
    };
    goog.object.extend(exports, proto);
    cc._RF.pop();
  }, {
    "google-protobuf": "google-protobuf"
  } ],
  match_end_pb: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "18ceavTi6pIFr/KS0fB4NVv", "match_end_pb");
    "use strict";
    var jspb = require("google-protobuf");
    var goog = jspb;
    var global = Function("return this")();
    var map_field_entry_pb = require("./map_field_entry_pb.js");
    var text_emoticon_pb = require("./text_emoticon_pb.js");
    goog.exportSymbol("proto.BINMatchEndRequest", null, global);
    goog.exportSymbol("proto.BINMatchEndResponse", null, global);
    proto.BINMatchEndRequest = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINMatchEndRequest, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINMatchEndRequest.displayName = "proto.BINMatchEndRequest");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINMatchEndRequest.prototype.toObject = function(opt_includeInstance) {
        return proto.BINMatchEndRequest.toObject(opt_includeInstance, this);
      };
      proto.BINMatchEndRequest.toObject = function(includeInstance, msg) {
        var f, obj = {
          roomindex: jspb.Message.getField(msg, 1)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINMatchEndRequest.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINMatchEndRequest();
      return proto.BINMatchEndRequest.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINMatchEndRequest.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt32();
          msg.setRoomindex(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINMatchEndRequest.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINMatchEndRequest.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINMatchEndRequest.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt32(1, f);
    };
    proto.BINMatchEndRequest.prototype.getRoomindex = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINMatchEndRequest.prototype.setRoomindex = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINMatchEndRequest.prototype.clearRoomindex = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINMatchEndRequest.prototype.hasRoomindex = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINMatchEndResponse = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, proto.BINMatchEndResponse.repeatedFields_, null);
    };
    goog.inherits(proto.BINMatchEndResponse, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINMatchEndResponse.displayName = "proto.BINMatchEndResponse");
    proto.BINMatchEndResponse.repeatedFields_ = [ 3, 4, 5, 6, 8 ];
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINMatchEndResponse.prototype.toObject = function(opt_includeInstance) {
        return proto.BINMatchEndResponse.toObject(opt_includeInstance, this);
      };
      proto.BINMatchEndResponse.toObject = function(includeInstance, msg) {
        var f, obj = {
          responsecode: jspb.Message.getField(msg, 1),
          message: jspb.Message.getField(msg, 2),
          winninguseridsList: jspb.Message.getField(msg, 3),
          losinguseridsList: jspb.Message.getField(msg, 4),
          drawuseridsList: jspb.Message.getField(msg, 5),
          textemoticonsList: jspb.Message.toObjectList(msg.getTextemoticonsList(), text_emoticon_pb.BINTextEmoticon.toObject, includeInstance),
          countdowntimer: jspb.Message.getField(msg, 7),
          argsList: jspb.Message.toObjectList(msg.getArgsList(), map_field_entry_pb.BINMapFieldEntry.toObject, includeInstance),
          zoneid: jspb.Message.getField(msg, 9)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINMatchEndResponse.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINMatchEndResponse();
      return proto.BINMatchEndResponse.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINMatchEndResponse.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readBool();
          msg.setResponsecode(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setMessage(value);
          break;

         case 3:
          var value = reader.readInt64();
          msg.addWinninguserids(value);
          break;

         case 4:
          var value = reader.readInt64();
          msg.addLosinguserids(value);
          break;

         case 5:
          var value = reader.readInt64();
          msg.addDrawuserids(value);
          break;

         case 6:
          var value = new text_emoticon_pb.BINTextEmoticon();
          reader.readMessage(value, text_emoticon_pb.BINTextEmoticon.deserializeBinaryFromReader);
          msg.addTextemoticons(value);
          break;

         case 7:
          var value = reader.readInt32();
          msg.setCountdowntimer(value);
          break;

         case 8:
          var value = new map_field_entry_pb.BINMapFieldEntry();
          reader.readMessage(value, map_field_entry_pb.BINMapFieldEntry.deserializeBinaryFromReader);
          msg.addArgs(value);
          break;

         case 9:
          var value = reader.readInt32();
          msg.setZoneid(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINMatchEndResponse.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINMatchEndResponse.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINMatchEndResponse.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeBool(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = this.getWinninguseridsList();
      f.length > 0 && writer.writeRepeatedInt64(3, f);
      f = this.getLosinguseridsList();
      f.length > 0 && writer.writeRepeatedInt64(4, f);
      f = this.getDrawuseridsList();
      f.length > 0 && writer.writeRepeatedInt64(5, f);
      f = this.getTextemoticonsList();
      f.length > 0 && writer.writeRepeatedMessage(6, f, text_emoticon_pb.BINTextEmoticon.serializeBinaryToWriter);
      f = jspb.Message.getField(this, 7);
      null != f && writer.writeInt32(7, f);
      f = this.getArgsList();
      f.length > 0 && writer.writeRepeatedMessage(8, f, map_field_entry_pb.BINMapFieldEntry.serializeBinaryToWriter);
      f = jspb.Message.getField(this, 9);
      null != f && writer.writeInt32(9, f);
    };
    proto.BINMatchEndResponse.prototype.getResponsecode = function() {
      return jspb.Message.getFieldWithDefault(this, 1, false);
    };
    proto.BINMatchEndResponse.prototype.setResponsecode = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINMatchEndResponse.prototype.clearResponsecode = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINMatchEndResponse.prototype.hasResponsecode = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINMatchEndResponse.prototype.getMessage = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINMatchEndResponse.prototype.setMessage = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINMatchEndResponse.prototype.clearMessage = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINMatchEndResponse.prototype.hasMessage = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINMatchEndResponse.prototype.getWinninguseridsList = function() {
      return jspb.Message.getField(this, 3);
    };
    proto.BINMatchEndResponse.prototype.setWinninguseridsList = function(value) {
      jspb.Message.setField(this, 3, value || []);
    };
    proto.BINMatchEndResponse.prototype.addWinninguserids = function(value, opt_index) {
      jspb.Message.addToRepeatedField(this, 3, value, opt_index);
    };
    proto.BINMatchEndResponse.prototype.clearWinninguseridsList = function() {
      this.setWinninguseridsList([]);
    };
    proto.BINMatchEndResponse.prototype.getLosinguseridsList = function() {
      return jspb.Message.getField(this, 4);
    };
    proto.BINMatchEndResponse.prototype.setLosinguseridsList = function(value) {
      jspb.Message.setField(this, 4, value || []);
    };
    proto.BINMatchEndResponse.prototype.addLosinguserids = function(value, opt_index) {
      jspb.Message.addToRepeatedField(this, 4, value, opt_index);
    };
    proto.BINMatchEndResponse.prototype.clearLosinguseridsList = function() {
      this.setLosinguseridsList([]);
    };
    proto.BINMatchEndResponse.prototype.getDrawuseridsList = function() {
      return jspb.Message.getField(this, 5);
    };
    proto.BINMatchEndResponse.prototype.setDrawuseridsList = function(value) {
      jspb.Message.setField(this, 5, value || []);
    };
    proto.BINMatchEndResponse.prototype.addDrawuserids = function(value, opt_index) {
      jspb.Message.addToRepeatedField(this, 5, value, opt_index);
    };
    proto.BINMatchEndResponse.prototype.clearDrawuseridsList = function() {
      this.setDrawuseridsList([]);
    };
    proto.BINMatchEndResponse.prototype.getTextemoticonsList = function() {
      return jspb.Message.getRepeatedWrapperField(this, text_emoticon_pb.BINTextEmoticon, 6);
    };
    proto.BINMatchEndResponse.prototype.setTextemoticonsList = function(value) {
      jspb.Message.setRepeatedWrapperField(this, 6, value);
    };
    proto.BINMatchEndResponse.prototype.addTextemoticons = function(opt_value, opt_index) {
      return jspb.Message.addToRepeatedWrapperField(this, 6, opt_value, proto.BINTextEmoticon, opt_index);
    };
    proto.BINMatchEndResponse.prototype.clearTextemoticonsList = function() {
      this.setTextemoticonsList([]);
    };
    proto.BINMatchEndResponse.prototype.getCountdowntimer = function() {
      return jspb.Message.getFieldWithDefault(this, 7, 0);
    };
    proto.BINMatchEndResponse.prototype.setCountdowntimer = function(value) {
      jspb.Message.setField(this, 7, value);
    };
    proto.BINMatchEndResponse.prototype.clearCountdowntimer = function() {
      jspb.Message.setField(this, 7, void 0);
    };
    proto.BINMatchEndResponse.prototype.hasCountdowntimer = function() {
      return null != jspb.Message.getField(this, 7);
    };
    proto.BINMatchEndResponse.prototype.getArgsList = function() {
      return jspb.Message.getRepeatedWrapperField(this, map_field_entry_pb.BINMapFieldEntry, 8);
    };
    proto.BINMatchEndResponse.prototype.setArgsList = function(value) {
      jspb.Message.setRepeatedWrapperField(this, 8, value);
    };
    proto.BINMatchEndResponse.prototype.addArgs = function(opt_value, opt_index) {
      return jspb.Message.addToRepeatedWrapperField(this, 8, opt_value, proto.BINMapFieldEntry, opt_index);
    };
    proto.BINMatchEndResponse.prototype.clearArgsList = function() {
      this.setArgsList([]);
    };
    proto.BINMatchEndResponse.prototype.getZoneid = function() {
      return jspb.Message.getFieldWithDefault(this, 9, 0);
    };
    proto.BINMatchEndResponse.prototype.setZoneid = function(value) {
      jspb.Message.setField(this, 9, value);
    };
    proto.BINMatchEndResponse.prototype.clearZoneid = function() {
      jspb.Message.setField(this, 9, void 0);
    };
    proto.BINMatchEndResponse.prototype.hasZoneid = function() {
      return null != jspb.Message.getField(this, 9);
    };
    goog.object.extend(exports, proto);
    cc._RF.pop();
  }, {
    "./map_field_entry_pb.js": "map_field_entry_pb",
    "./text_emoticon_pb.js": "text_emoticon_pb",
    "google-protobuf": "google-protobuf"
  } ],
  minipoker: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "7f5dawAnnVIOKHZvkmp4wmM", "minipoker");
    "use strict";
    var NetworkManager = require("NetworkManager");
    var MiniPoker = cc.Class({
      extends: cc.Component,
      properties: {
        cardView: cc.Mask,
        cardPrefab: cc.Prefab,
        isFinishSpin: true,
        isRun: false,
        stepCard: 9,
        number: 5,
        time_move: 1,
        list_item: [],
        list_recent_value: null,
        enterRoomResponse: null,
        enterZoneResponse: null,
        betType: 0,
        moneyBet: cc.Label,
        userMoney: cc.Label,
        jarMoney: cc.Label,
        isRequestJar: false,
        jarValue: 0,
        roomIndex: 0
      },
      statics: {
        instance: null
      },
      exitRoom: function exitRoom() {
        cc.director.loadScene("Table");
      },
      setKeyBet: function setKeyBet(key) {
        this.betType = key;
      },
      getKeyBet: function getKeyBet() {
        return this.betType;
      },
      requestJar: function requestJar() {
        if (!this.isRequestJar) {
          cc.log("request jar", this.betType + 1);
          this.isRequestJar = false;
          NetworkManager.getJarRequest(Common.getZoneId(), this.betType + 1);
        }
      },
      getTurnMiniPokerRequest: function getTurnMiniPokerRequest(turnType) {
        var entries = [];
        var entry = new proto.BINMapFieldEntry();
        entry.setKey("turnSlotType");
        entry.setValue(turnType.toString());
        entries.push(entry);
        NetworkManager.getTurnMessageFromServer(0, entries);
      },
      getBetMoney: function getBetMoney() {
        var args = this.getEnterRoomResponse();
        var argsList = args.getArgsList()[0];
        var json = null;
        "initValue" === argsList.getKey() && (json = argsList.getValue());
        var bet = this.getKeyBet();
        var results = JSON.parse(json);
        var betStepValue = results.turnValueCash;
        var betMoney = betStepValue[bet];
        return betMoney;
      },
      betToggleOneEvent: function betToggleOneEvent() {
        cc.log("bet type 1:", this.betType);
        this.setKeyBet(0);
        this.moneyBet.string = this.getBetMoney();
        this.requestJar();
      },
      betToggleTwoEvent: function betToggleTwoEvent() {
        cc.log("bet type 2:", this.betType);
        this.setKeyBet(1);
        this.moneyBet.string = this.getBetMoney();
        this.requestJar();
      },
      betToggleThreeEvent: function betToggleThreeEvent() {
        cc.log("bet type 3:", this.betType);
        this.setKeyBet(2);
        this.moneyBet.string = this.getBetMoney();
        this.requestJar();
      },
      initDataFromLoading: function initDataFromLoading(enterZone, enterRoom) {
        this.setEnterZoneResponse(enterZone);
        Common.setMiniGameZoneId(enterZone.getZoneid());
        this.setEnterRoomResponse(enterRoom);
        this.init(enterRoom);
      },
      init: function init(response) {
        var roomPlay = response.getRoomplay();
        this.roomIndex = roomPlay.getRoomindex();
        if (response.getArgsList().length > 0) {
          var entry = response.getArgsList()[0];
          "initValue" === entry.getKey() && this.initValue(entry.getValue());
        }
      },
      initValue: function initValue(json) {
        var results = JSON.parse(json);
        cc.log("results =", results);
        this.moneyBet.string = Common.numberFormatWithCommas(results.turnValueCash[this.betType]);
        var val = results.jarValue;
        this.jarMoney.string = Common.numberFormatWithCommas(val);
      },
      setEnterZoneResponse: function setEnterZoneResponse(res) {
        this.enterZoneResponse = res;
      },
      getEnterZoneResponse: function getEnterZoneResponse() {
        return this.enterZoneResponse;
      },
      getEnterRoomResponse: function getEnterRoomResponse() {
        return this.enterRoomResponse;
      },
      setEnterRoomResponse: function setEnterRoomResponse(resp) {
        this.enterRoomResponse = resp;
      },
      takeTurn: function takeTurn() {
        this.getTurnMiniPokerRequest(this.betType + 1);
      },
      initFirstCard: function initFirstCard() {
        var random_number = Common.genRandomNumber(null, this.stepCard, this.number);
        var items_value = Common.genArrayToMultiArray(random_number, this.stepCard, this.number);
        this.list_recent_value = Common.create2DArray(this.stepCard);
        for (var i = 0; i < this.stepCard; i++) for (var j = 0; j < this.number; j++) {
          var item = cc.instantiate(this.cardPrefab);
          var posX = (j - 2) * item.getContentSize().width * .75;
          var posY = (i - 1) * item.getContentSize().height;
          item.getComponent("CardItem").replaceCard(items_value[i][j]);
          item.setPositionY(posY);
          item.setPositionX(posX);
          this.list_item.push(item);
          this.cardView.node.addChild(item);
        }
        this.list_recent_value = items_value;
      },
      onLoad: function onLoad() {
        MiniPoker.instance = this;
        this.userMoney.string = Common.numberFormatWithCommas(Common.getCash());
        window.ws.onmessage = this.ongamestatus.bind(this);
        this.betType = 0;
        this.initFirstCard();
        setInterval(function() {
          this.requestJar();
        }.bind(this), 5e3);
        Common.setMiniPokerSceneInstance(cc.director.getScene());
      },
      ongamestatus: function ongamestatus(event) {
        if (null !== event.data || "undefined" !== event.data) {
          var lstMessage = NetworkManager.parseFrom(event.data, event.data.byteLength);
          cc.log("list message size:" + lstMessage.length);
          if (lstMessage.length > 0) for (var i = 0; i < lstMessage.length; i++) {
            var buffer = lstMessage[i];
            this.handleMessage(buffer);
          }
        }
      },
      implementSpinMiniPokerCards: function implementSpinMiniPokerCards(carx, response) {
        cc.log("carx =", carx);
        var text_emoticon = response.getTextemoticonsList()[0];
        this.isFinishSpin = false;
        var isBreakJar = 54 === text_emoticon.getEmoticonid();
        var random_number = Common.genRandomNumber(carx, this.stepCard, this.number);
        var items_value = Common.genArrayToMultiArray(random_number, this.stepCard, this.number);
        items_value[this.stepCard - 2] = carx;
        if (items_value.length * this.number != this.list_item.length) return;
        for (var i = 0; i < this.list_item.length; i++) {
          var x = parseInt(i / this.number);
          var y = parseInt(i % this.number);
          if (i < 3 * this.number) {
            var i1 = this.stepCard - (3 - x);
            var j1 = y;
            this.list_item[i].getComponent("CardItem").replaceCard(this.list_recent_value[i1][j1]);
          }
          var posX = (y - 2) * this.list_item[i].getContentSize().width * .75;
          var posY = (x - 1) * this.list_item[i].getContentSize().height;
          this.list_item[i].setPositionX(posX);
          this.list_item[i].setPositionY(posY);
        }
        this.list_recent_value = items_value;
        for (var i = 0; i < this.list_item.length; i++) {
          var x = parseInt(i / this.number);
          var y = parseInt(i % this.number);
          var card = this.list_item[i];
          var card_value = items_value[x][y];
          i >= 3 * this.number && card.getComponent("CardItem").replaceCard(card_value);
          var h = card.getContentSize().height;
          var move1 = cc.moveBy(.2, cc.p(0, .25 * h));
          var move2 = cc.moveBy(.15, cc.p(0, .25 * h));
          var move3 = cc.moveBy(this.time_move, cc.p(0, -(this.stepCard - 3) * h - .5 * h));
          var delay = cc.delayTime(.3 * y);
          if (i == this.list_item.length - 1) {
            var call_func = cc.callFunc(function() {
              cc.log("FINISH!!!!");
            });
            card.runAction(cc.sequence(delay, move1, move3, move2, call_func));
          } else card.runAction(cc.sequence(delay, move1, move3, move2));
        }
      },
      matchEndResponseHandler: function matchEndResponseHandler(response) {
        cc.log("match end response handler:", response.toObject());
        if (response.getResponsecode() && response.getArgsList().length > 0) for (var i = 0; i < response.getArgsList().length; i++) if ("currentCards" === response.getArgsList()[i].getKey()) {
          var str = response.getArgsList()[i].getValue();
          var currentCards = str.split(",").map(Number);
          this.implementSpinMiniPokerCards(currentCards, response);
        }
        response.hasMessage() && "" !== response.getMessage();
      },
      updateMoneyMessageResponseHandler: function updateMoneyMessageResponseHandler(resp) {
        cc.log("update money response: ", resp.toObject());
        if (resp.getResponsecode()) {
          var moneyBox = resp.getMoneyboxesList()[0];
          moneyBox.getUserid() === Common.getUserInfo().userid && (this.userMoney.string = Common.numberFormatWithCommas(moneyBox.getCurrentmoney()));
        }
        resp.hasMessage() && "" !== resp.getMessage();
      },
      exitRoomResponseHandler: function exitRoomResponseHandler(resp) {
        cc.log("exit room response handler:", resp.toObject());
        resp.getResponsecode();
        resp.hasMessage() && "" !== resp.getMessage();
      },
      exitZoneResponseHandler: function exitZoneResponseHandler(resp) {
        cc.log("exit zone response handler:", resp.toObject());
        resp.getResponsecode();
        resp.hasMessage() && "" !== resp.getMessage();
      },
      jarResponseHandler: function jarResponseHandler(resp) {
        cc.log("jar response handler:", resp.toObject());
        if (resp.getResponsecode()) {
          var jar_type_response = 0;
          var preJarValue = this.jarValue;
          this.jarValue = resp.getJarvalue();
          if (resp.getArgsList().length > 0) {
            var entry = resp.getArgsList()[0];
            "jarType" === entry.getKey() && (jar_type_response = parseInt(entry.getValue().toString()));
          }
          if (jar_type_response === this.betType + 1) {
            this.jarType === jar_type_response ? Common.updateMoney(this.jarMoney, preJarValue, preJarValue, this.jarValue) : this.jarMoney.string = Common.numberFormatWithCommas(this.jarValue);
            this.jarType = jar_type_response;
          }
        }
      },
      handleMessage: function handleMessage(buffer) {
        switch (buffer.message_id) {
         case NetworkManager.MESSAGE_ID.UPDATE_MONEY:
          var msg = buffer.response;
          this.updateMoneyMessageResponseHandler(msg);
          break;

         case NetworkManager.MESSAGE_ID.MATCH_END:
          this.matchEndResponseHandler(buffer.response);
          break;

         case NetworkManager.MESSAGE_ID.EXIT_ROOM:
          var msg = buffer.response;
          this.exitRoomResponsehandler(msg);
          break;

         case NetworkManager.MESSAGE_ID.EXIT_ZONE:
          var msg = buffer.response;
          this.exitZoneResponseHandler(msg);
          break;

         case NetworkManager.MESSAGE_ID.JAR:
          var msg = buffer.response;
          this.jarResponseHandler(msg);
        }
      },
      calculateTurnType: function calculateTurnType() {
        return this.getKeyBet() + 1;
      }
    });
    cc._RF.pop();
  }, {
    NetworkManager: "NetworkManager"
  } ],
  notification_pb: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "7f3cdPhuAlDbLc1BFo4oNtM", "notification_pb");
    "use strict";
    var jspb = require("google-protobuf");
    var goog = jspb;
    var global = Function("return this")();
    goog.exportSymbol("proto.BINEmergencyNotificationResponse", null, global);
    goog.exportSymbol("proto.BINHeadlineResponse", null, global);
    goog.exportSymbol("proto.BINNews", null, global);
    proto.BINNews = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINNews, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINNews.displayName = "proto.BINNews");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINNews.prototype.toObject = function(opt_includeInstance) {
        return proto.BINNews.toObject(opt_includeInstance, this);
      };
      proto.BINNews.toObject = function(includeInstance, msg) {
        var f, obj = {
          tag: jspb.Message.getField(msg, 1),
          displayname: jspb.Message.getField(msg, 2),
          action: jspb.Message.getField(msg, 3),
          subject: jspb.Message.getField(msg, 4)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINNews.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINNews();
      return proto.BINNews.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINNews.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readString();
          msg.setTag(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setDisplayname(value);
          break;

         case 3:
          var value = reader.readString();
          msg.setAction(value);
          break;

         case 4:
          var value = reader.readString();
          msg.setSubject(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINNews.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINNews.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINNews.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeString(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeString(3, f);
      f = jspb.Message.getField(this, 4);
      null != f && writer.writeString(4, f);
    };
    proto.BINNews.prototype.getTag = function() {
      return jspb.Message.getFieldWithDefault(this, 1, "");
    };
    proto.BINNews.prototype.setTag = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINNews.prototype.clearTag = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINNews.prototype.hasTag = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINNews.prototype.getDisplayname = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINNews.prototype.setDisplayname = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINNews.prototype.clearDisplayname = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINNews.prototype.hasDisplayname = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINNews.prototype.getAction = function() {
      return jspb.Message.getFieldWithDefault(this, 3, "");
    };
    proto.BINNews.prototype.setAction = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINNews.prototype.clearAction = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINNews.prototype.hasAction = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINNews.prototype.getSubject = function() {
      return jspb.Message.getFieldWithDefault(this, 4, "");
    };
    proto.BINNews.prototype.setSubject = function(value) {
      jspb.Message.setField(this, 4, value);
    };
    proto.BINNews.prototype.clearSubject = function() {
      jspb.Message.setField(this, 4, void 0);
    };
    proto.BINNews.prototype.hasSubject = function() {
      return null != jspb.Message.getField(this, 4);
    };
    proto.BINHeadlineResponse = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, proto.BINHeadlineResponse.repeatedFields_, null);
    };
    goog.inherits(proto.BINHeadlineResponse, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINHeadlineResponse.displayName = "proto.BINHeadlineResponse");
    proto.BINHeadlineResponse.repeatedFields_ = [ 3 ];
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINHeadlineResponse.prototype.toObject = function(opt_includeInstance) {
        return proto.BINHeadlineResponse.toObject(opt_includeInstance, this);
      };
      proto.BINHeadlineResponse.toObject = function(includeInstance, msg) {
        var f, obj = {
          responsecode: jspb.Message.getField(msg, 1),
          message: jspb.Message.getField(msg, 2),
          headlinesList: jspb.Message.toObjectList(msg.getHeadlinesList(), proto.BINNews.toObject, includeInstance)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINHeadlineResponse.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINHeadlineResponse();
      return proto.BINHeadlineResponse.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINHeadlineResponse.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readBool();
          msg.setResponsecode(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setMessage(value);
          break;

         case 3:
          var value = new proto.BINNews();
          reader.readMessage(value, proto.BINNews.deserializeBinaryFromReader);
          msg.addHeadlines(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINHeadlineResponse.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINHeadlineResponse.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINHeadlineResponse.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeBool(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = this.getHeadlinesList();
      f.length > 0 && writer.writeRepeatedMessage(3, f, proto.BINNews.serializeBinaryToWriter);
    };
    proto.BINHeadlineResponse.prototype.getResponsecode = function() {
      return jspb.Message.getFieldWithDefault(this, 1, false);
    };
    proto.BINHeadlineResponse.prototype.setResponsecode = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINHeadlineResponse.prototype.clearResponsecode = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINHeadlineResponse.prototype.hasResponsecode = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINHeadlineResponse.prototype.getMessage = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINHeadlineResponse.prototype.setMessage = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINHeadlineResponse.prototype.clearMessage = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINHeadlineResponse.prototype.hasMessage = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINHeadlineResponse.prototype.getHeadlinesList = function() {
      return jspb.Message.getRepeatedWrapperField(this, proto.BINNews, 3);
    };
    proto.BINHeadlineResponse.prototype.setHeadlinesList = function(value) {
      jspb.Message.setRepeatedWrapperField(this, 3, value);
    };
    proto.BINHeadlineResponse.prototype.addHeadlines = function(opt_value, opt_index) {
      return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.BINNews, opt_index);
    };
    proto.BINHeadlineResponse.prototype.clearHeadlinesList = function() {
      this.setHeadlinesList([]);
    };
    proto.BINEmergencyNotificationResponse = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, proto.BINEmergencyNotificationResponse.repeatedFields_, null);
    };
    goog.inherits(proto.BINEmergencyNotificationResponse, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINEmergencyNotificationResponse.displayName = "proto.BINEmergencyNotificationResponse");
    proto.BINEmergencyNotificationResponse.repeatedFields_ = [ 3, 4 ];
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINEmergencyNotificationResponse.prototype.toObject = function(opt_includeInstance) {
        return proto.BINEmergencyNotificationResponse.toObject(opt_includeInstance, this);
      };
      proto.BINEmergencyNotificationResponse.toObject = function(includeInstance, msg) {
        var f, obj = {
          responsecode: jspb.Message.getField(msg, 1),
          message: jspb.Message.getField(msg, 2),
          notificationsList: jspb.Message.getField(msg, 3),
          headlinesList: jspb.Message.toObjectList(msg.getHeadlinesList(), proto.BINNews.toObject, includeInstance)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINEmergencyNotificationResponse.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINEmergencyNotificationResponse();
      return proto.BINEmergencyNotificationResponse.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINEmergencyNotificationResponse.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readBool();
          msg.setResponsecode(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setMessage(value);
          break;

         case 3:
          var value = reader.readString();
          msg.addNotifications(value);
          break;

         case 4:
          var value = new proto.BINNews();
          reader.readMessage(value, proto.BINNews.deserializeBinaryFromReader);
          msg.addHeadlines(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINEmergencyNotificationResponse.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINEmergencyNotificationResponse.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINEmergencyNotificationResponse.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeBool(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = this.getNotificationsList();
      f.length > 0 && writer.writeRepeatedString(3, f);
      f = this.getHeadlinesList();
      f.length > 0 && writer.writeRepeatedMessage(4, f, proto.BINNews.serializeBinaryToWriter);
    };
    proto.BINEmergencyNotificationResponse.prototype.getResponsecode = function() {
      return jspb.Message.getFieldWithDefault(this, 1, false);
    };
    proto.BINEmergencyNotificationResponse.prototype.setResponsecode = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINEmergencyNotificationResponse.prototype.clearResponsecode = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINEmergencyNotificationResponse.prototype.hasResponsecode = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINEmergencyNotificationResponse.prototype.getMessage = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINEmergencyNotificationResponse.prototype.setMessage = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINEmergencyNotificationResponse.prototype.clearMessage = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINEmergencyNotificationResponse.prototype.hasMessage = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINEmergencyNotificationResponse.prototype.getNotificationsList = function() {
      return jspb.Message.getField(this, 3);
    };
    proto.BINEmergencyNotificationResponse.prototype.setNotificationsList = function(value) {
      jspb.Message.setField(this, 3, value || []);
    };
    proto.BINEmergencyNotificationResponse.prototype.addNotifications = function(value, opt_index) {
      jspb.Message.addToRepeatedField(this, 3, value, opt_index);
    };
    proto.BINEmergencyNotificationResponse.prototype.clearNotificationsList = function() {
      this.setNotificationsList([]);
    };
    proto.BINEmergencyNotificationResponse.prototype.getHeadlinesList = function() {
      return jspb.Message.getRepeatedWrapperField(this, proto.BINNews, 4);
    };
    proto.BINEmergencyNotificationResponse.prototype.setHeadlinesList = function(value) {
      jspb.Message.setRepeatedWrapperField(this, 4, value);
    };
    proto.BINEmergencyNotificationResponse.prototype.addHeadlines = function(opt_value, opt_index) {
      return jspb.Message.addToRepeatedWrapperField(this, 4, opt_value, proto.BINNews, opt_index);
    };
    proto.BINEmergencyNotificationResponse.prototype.clearHeadlinesList = function() {
      this.setHeadlinesList([]);
    };
    goog.object.extend(exports, proto);
    cc._RF.pop();
  }, {
    "google-protobuf": "google-protobuf"
  } ],
  ping_pb: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2bc48HxAxFL+6MLtz8T+UXF", "ping_pb");
    "use strict";
    var jspb = require("google-protobuf");
    var goog = jspb;
    var global = Function("return this")();
    goog.exportSymbol("proto.BINPingRequest", null, global);
    goog.exportSymbol("proto.BINPingResponse", null, global);
    proto.BINPingRequest = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINPingRequest, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINPingRequest.displayName = "proto.BINPingRequest");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINPingRequest.prototype.toObject = function(opt_includeInstance) {
        return proto.BINPingRequest.toObject(opt_includeInstance, this);
      };
      proto.BINPingRequest.toObject = function(includeInstance, msg) {
        var f, obj = {
          disconecttime: jspb.Message.getField(msg, 1)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINPingRequest.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINPingRequest();
      return proto.BINPingRequest.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINPingRequest.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt32();
          msg.setDisconecttime(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINPingRequest.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINPingRequest.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINPingRequest.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt32(1, f);
    };
    proto.BINPingRequest.prototype.getDisconecttime = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINPingRequest.prototype.setDisconecttime = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINPingRequest.prototype.clearDisconecttime = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINPingRequest.prototype.hasDisconecttime = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINPingResponse = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINPingResponse, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINPingResponse.displayName = "proto.BINPingResponse");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINPingResponse.prototype.toObject = function(opt_includeInstance) {
        return proto.BINPingResponse.toObject(opt_includeInstance, this);
      };
      proto.BINPingResponse.toObject = function(includeInstance, msg) {
        var f, obj = {
          responsecode: jspb.Message.getField(msg, 1),
          message: jspb.Message.getField(msg, 2),
          disconnect: jspb.Message.getField(msg, 3)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINPingResponse.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINPingResponse();
      return proto.BINPingResponse.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINPingResponse.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readBool();
          msg.setResponsecode(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setMessage(value);
          break;

         case 3:
          var value = reader.readBool();
          msg.setDisconnect(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINPingResponse.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINPingResponse.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINPingResponse.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeBool(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeBool(3, f);
    };
    proto.BINPingResponse.prototype.getResponsecode = function() {
      return jspb.Message.getFieldWithDefault(this, 1, false);
    };
    proto.BINPingResponse.prototype.setResponsecode = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINPingResponse.prototype.clearResponsecode = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINPingResponse.prototype.hasResponsecode = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINPingResponse.prototype.getMessage = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINPingResponse.prototype.setMessage = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINPingResponse.prototype.clearMessage = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINPingResponse.prototype.hasMessage = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINPingResponse.prototype.getDisconnect = function() {
      return jspb.Message.getFieldWithDefault(this, 3, false);
    };
    proto.BINPingResponse.prototype.setDisconnect = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINPingResponse.prototype.clearDisconnect = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINPingResponse.prototype.hasDisconnect = function() {
      return null != jspb.Message.getField(this, 3);
    };
    goog.object.extend(exports, proto);
    cc._RF.pop();
  }, {
    "google-protobuf": "google-protobuf"
  } ],
  player_pb: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2046f49/HlJN6jceCHMkzBb", "player_pb");
    "use strict";
    var jspb = require("google-protobuf");
    var goog = jspb;
    var global = Function("return this")();
    var map_field_entry_pb = require("./map_field_entry_pb.js");
    goog.exportSymbol("proto.BINPlayer", null, global);
    proto.BINPlayer = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, proto.BINPlayer.repeatedFields_, null);
    };
    goog.inherits(proto.BINPlayer, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINPlayer.displayName = "proto.BINPlayer");
    proto.BINPlayer.repeatedFields_ = [ 11 ];
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINPlayer.prototype.toObject = function(opt_includeInstance) {
        return proto.BINPlayer.toObject(opt_includeInstance, this);
      };
      proto.BINPlayer.toObject = function(includeInstance, msg) {
        var f, obj = {
          userid: jspb.Message.getField(msg, 1),
          username: jspb.Message.getField(msg, 2),
          displayname: jspb.Message.getField(msg, 3),
          avatarid: jspb.Message.getField(msg, 4),
          level: jspb.Message.getField(msg, 5),
          cash: jspb.Message.getField(msg, 6),
          gold: jspb.Message.getField(msg, 7),
          ready: jspb.Message.getField(msg, 8),
          exitaftermatchend: jspb.Message.getField(msg, 9),
          tableindex: jspb.Message.getField(msg, 10),
          argsList: jspb.Message.toObjectList(msg.getArgsList(), map_field_entry_pb.BINMapFieldEntry.toObject, includeInstance)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINPlayer.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINPlayer();
      return proto.BINPlayer.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINPlayer.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt64();
          msg.setUserid(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setUsername(value);
          break;

         case 3:
          var value = reader.readString();
          msg.setDisplayname(value);
          break;

         case 4:
          var value = reader.readInt32();
          msg.setAvatarid(value);
          break;

         case 5:
          var value = reader.readInt32();
          msg.setLevel(value);
          break;

         case 6:
          var value = reader.readInt64();
          msg.setCash(value);
          break;

         case 7:
          var value = reader.readInt64();
          msg.setGold(value);
          break;

         case 8:
          var value = reader.readBool();
          msg.setReady(value);
          break;

         case 9:
          var value = reader.readBool();
          msg.setExitaftermatchend(value);
          break;

         case 10:
          var value = reader.readInt32();
          msg.setTableindex(value);
          break;

         case 11:
          var value = new map_field_entry_pb.BINMapFieldEntry();
          reader.readMessage(value, map_field_entry_pb.BINMapFieldEntry.deserializeBinaryFromReader);
          msg.addArgs(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINPlayer.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINPlayer.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINPlayer.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt64(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeString(3, f);
      f = jspb.Message.getField(this, 4);
      null != f && writer.writeInt32(4, f);
      f = jspb.Message.getField(this, 5);
      null != f && writer.writeInt32(5, f);
      f = jspb.Message.getField(this, 6);
      null != f && writer.writeInt64(6, f);
      f = jspb.Message.getField(this, 7);
      null != f && writer.writeInt64(7, f);
      f = jspb.Message.getField(this, 8);
      null != f && writer.writeBool(8, f);
      f = jspb.Message.getField(this, 9);
      null != f && writer.writeBool(9, f);
      f = jspb.Message.getField(this, 10);
      null != f && writer.writeInt32(10, f);
      f = this.getArgsList();
      f.length > 0 && writer.writeRepeatedMessage(11, f, map_field_entry_pb.BINMapFieldEntry.serializeBinaryToWriter);
    };
    proto.BINPlayer.prototype.getUserid = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINPlayer.prototype.setUserid = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINPlayer.prototype.clearUserid = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINPlayer.prototype.hasUserid = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINPlayer.prototype.getUsername = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINPlayer.prototype.setUsername = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINPlayer.prototype.clearUsername = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINPlayer.prototype.hasUsername = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINPlayer.prototype.getDisplayname = function() {
      return jspb.Message.getFieldWithDefault(this, 3, "");
    };
    proto.BINPlayer.prototype.setDisplayname = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINPlayer.prototype.clearDisplayname = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINPlayer.prototype.hasDisplayname = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINPlayer.prototype.getAvatarid = function() {
      return jspb.Message.getFieldWithDefault(this, 4, 0);
    };
    proto.BINPlayer.prototype.setAvatarid = function(value) {
      jspb.Message.setField(this, 4, value);
    };
    proto.BINPlayer.prototype.clearAvatarid = function() {
      jspb.Message.setField(this, 4, void 0);
    };
    proto.BINPlayer.prototype.hasAvatarid = function() {
      return null != jspb.Message.getField(this, 4);
    };
    proto.BINPlayer.prototype.getLevel = function() {
      return jspb.Message.getFieldWithDefault(this, 5, 0);
    };
    proto.BINPlayer.prototype.setLevel = function(value) {
      jspb.Message.setField(this, 5, value);
    };
    proto.BINPlayer.prototype.clearLevel = function() {
      jspb.Message.setField(this, 5, void 0);
    };
    proto.BINPlayer.prototype.hasLevel = function() {
      return null != jspb.Message.getField(this, 5);
    };
    proto.BINPlayer.prototype.getCash = function() {
      return jspb.Message.getFieldWithDefault(this, 6, 0);
    };
    proto.BINPlayer.prototype.setCash = function(value) {
      jspb.Message.setField(this, 6, value);
    };
    proto.BINPlayer.prototype.clearCash = function() {
      jspb.Message.setField(this, 6, void 0);
    };
    proto.BINPlayer.prototype.hasCash = function() {
      return null != jspb.Message.getField(this, 6);
    };
    proto.BINPlayer.prototype.getGold = function() {
      return jspb.Message.getFieldWithDefault(this, 7, 0);
    };
    proto.BINPlayer.prototype.setGold = function(value) {
      jspb.Message.setField(this, 7, value);
    };
    proto.BINPlayer.prototype.clearGold = function() {
      jspb.Message.setField(this, 7, void 0);
    };
    proto.BINPlayer.prototype.hasGold = function() {
      return null != jspb.Message.getField(this, 7);
    };
    proto.BINPlayer.prototype.getReady = function() {
      return jspb.Message.getFieldWithDefault(this, 8, false);
    };
    proto.BINPlayer.prototype.setReady = function(value) {
      jspb.Message.setField(this, 8, value);
    };
    proto.BINPlayer.prototype.clearReady = function() {
      jspb.Message.setField(this, 8, void 0);
    };
    proto.BINPlayer.prototype.hasReady = function() {
      return null != jspb.Message.getField(this, 8);
    };
    proto.BINPlayer.prototype.getExitaftermatchend = function() {
      return jspb.Message.getFieldWithDefault(this, 9, false);
    };
    proto.BINPlayer.prototype.setExitaftermatchend = function(value) {
      jspb.Message.setField(this, 9, value);
    };
    proto.BINPlayer.prototype.clearExitaftermatchend = function() {
      jspb.Message.setField(this, 9, void 0);
    };
    proto.BINPlayer.prototype.hasExitaftermatchend = function() {
      return null != jspb.Message.getField(this, 9);
    };
    proto.BINPlayer.prototype.getTableindex = function() {
      return jspb.Message.getFieldWithDefault(this, 10, 0);
    };
    proto.BINPlayer.prototype.setTableindex = function(value) {
      jspb.Message.setField(this, 10, value);
    };
    proto.BINPlayer.prototype.clearTableindex = function() {
      jspb.Message.setField(this, 10, void 0);
    };
    proto.BINPlayer.prototype.hasTableindex = function() {
      return null != jspb.Message.getField(this, 10);
    };
    proto.BINPlayer.prototype.getArgsList = function() {
      return jspb.Message.getRepeatedWrapperField(this, map_field_entry_pb.BINMapFieldEntry, 11);
    };
    proto.BINPlayer.prototype.setArgsList = function(value) {
      jspb.Message.setRepeatedWrapperField(this, 11, value);
    };
    proto.BINPlayer.prototype.addArgs = function(opt_value, opt_index) {
      return jspb.Message.addToRepeatedWrapperField(this, 11, opt_value, proto.BINMapFieldEntry, opt_index);
    };
    proto.BINPlayer.prototype.clearArgsList = function() {
      this.setArgsList([]);
    };
    goog.object.extend(exports, proto);
    cc._RF.pop();
  }, {
    "./map_field_entry_pb.js": "map_field_entry_pb",
    "google-protobuf": "google-protobuf"
  } ],
  purchase_money_pb: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "035594gL4tEpYQ/U8eNgnRh", "purchase_money_pb");
    "use strict";
    var jspb = require("google-protobuf");
    var goog = jspb;
    var global = Function("return this")();
    goog.exportSymbol("proto.BINCardConfigRequest", null, global);
    goog.exportSymbol("proto.BINCardConfigResponse", null, global);
    goog.exportSymbol("proto.BINCardProduct", null, global);
    goog.exportSymbol("proto.BINCardProvider", null, global);
    goog.exportSymbol("proto.BINGoldConfigRequest", null, global);
    goog.exportSymbol("proto.BINGoldConfigResponse", null, global);
    goog.exportSymbol("proto.BINGoldProduct", null, global);
    goog.exportSymbol("proto.BINPurchaseGoldRequest", null, global);
    goog.exportSymbol("proto.BINPurchaseGoldResponse", null, global);
    goog.exportSymbol("proto.BINPurchaseMoneyRequest", null, global);
    goog.exportSymbol("proto.BINPurchaseMoneyResponse", null, global);
    goog.exportSymbol("proto.BINSmsConfigRequest", null, global);
    goog.exportSymbol("proto.BINSmsConfigResponse", null, global);
    goog.exportSymbol("proto.BINSmsNumber", null, global);
    goog.exportSymbol("proto.BINSmsProvider", null, global);
    goog.exportSymbol("proto.BINSmsSyntax", null, global);
    proto.BINCardConfigRequest = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINCardConfigRequest, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINCardConfigRequest.displayName = "proto.BINCardConfigRequest");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINCardConfigRequest.prototype.toObject = function(opt_includeInstance) {
        return proto.BINCardConfigRequest.toObject(opt_includeInstance, this);
      };
      proto.BINCardConfigRequest.toObject = function(includeInstance, msg) {
        var f, obj = {
          type: jspb.Message.getField(msg, 1)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINCardConfigRequest.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINCardConfigRequest();
      return proto.BINCardConfigRequest.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINCardConfigRequest.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt32();
          msg.setType(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINCardConfigRequest.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINCardConfigRequest.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINCardConfigRequest.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt32(1, f);
    };
    proto.BINCardConfigRequest.prototype.getType = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINCardConfigRequest.prototype.setType = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINCardConfigRequest.prototype.clearType = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINCardConfigRequest.prototype.hasType = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINCardProduct = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINCardProduct, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINCardProduct.displayName = "proto.BINCardProduct");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINCardProduct.prototype.toObject = function(opt_includeInstance) {
        return proto.BINCardProduct.toObject(opt_includeInstance, this);
      };
      proto.BINCardProduct.toObject = function(includeInstance, msg) {
        var f, obj = {
          productid: jspb.Message.getField(msg, 1),
          parvalue: jspb.Message.getField(msg, 2),
          cashvalue: jspb.Message.getField(msg, 3),
          description: jspb.Message.getField(msg, 4),
          promotion: jspb.Message.getField(msg, 5)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINCardProduct.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINCardProduct();
      return proto.BINCardProduct.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINCardProduct.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt32();
          msg.setProductid(value);
          break;

         case 2:
          var value = reader.readInt32();
          msg.setParvalue(value);
          break;

         case 3:
          var value = reader.readInt32();
          msg.setCashvalue(value);
          break;

         case 4:
          var value = reader.readString();
          msg.setDescription(value);
          break;

         case 5:
          var value = reader.readInt32();
          msg.setPromotion(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINCardProduct.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINCardProduct.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINCardProduct.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt32(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeInt32(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeInt32(3, f);
      f = jspb.Message.getField(this, 4);
      null != f && writer.writeString(4, f);
      f = jspb.Message.getField(this, 5);
      null != f && writer.writeInt32(5, f);
    };
    proto.BINCardProduct.prototype.getProductid = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINCardProduct.prototype.setProductid = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINCardProduct.prototype.clearProductid = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINCardProduct.prototype.hasProductid = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINCardProduct.prototype.getParvalue = function() {
      return jspb.Message.getFieldWithDefault(this, 2, 0);
    };
    proto.BINCardProduct.prototype.setParvalue = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINCardProduct.prototype.clearParvalue = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINCardProduct.prototype.hasParvalue = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINCardProduct.prototype.getCashvalue = function() {
      return jspb.Message.getFieldWithDefault(this, 3, 0);
    };
    proto.BINCardProduct.prototype.setCashvalue = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINCardProduct.prototype.clearCashvalue = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINCardProduct.prototype.hasCashvalue = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINCardProduct.prototype.getDescription = function() {
      return jspb.Message.getFieldWithDefault(this, 4, "");
    };
    proto.BINCardProduct.prototype.setDescription = function(value) {
      jspb.Message.setField(this, 4, value);
    };
    proto.BINCardProduct.prototype.clearDescription = function() {
      jspb.Message.setField(this, 4, void 0);
    };
    proto.BINCardProduct.prototype.hasDescription = function() {
      return null != jspb.Message.getField(this, 4);
    };
    proto.BINCardProduct.prototype.getPromotion = function() {
      return jspb.Message.getFieldWithDefault(this, 5, 0);
    };
    proto.BINCardProduct.prototype.setPromotion = function(value) {
      jspb.Message.setField(this, 5, value);
    };
    proto.BINCardProduct.prototype.clearPromotion = function() {
      jspb.Message.setField(this, 5, void 0);
    };
    proto.BINCardProduct.prototype.hasPromotion = function() {
      return null != jspb.Message.getField(this, 5);
    };
    proto.BINCardProvider = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, proto.BINCardProvider.repeatedFields_, null);
    };
    goog.inherits(proto.BINCardProvider, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINCardProvider.displayName = "proto.BINCardProvider");
    proto.BINCardProvider.repeatedFields_ = [ 4 ];
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINCardProvider.prototype.toObject = function(opt_includeInstance) {
        return proto.BINCardProvider.toObject(opt_includeInstance, this);
      };
      proto.BINCardProvider.toObject = function(includeInstance, msg) {
        var f, obj = {
          providerid: jspb.Message.getField(msg, 1),
          providercode: jspb.Message.getField(msg, 2),
          providername: jspb.Message.getField(msg, 3),
          productsList: jspb.Message.toObjectList(msg.getProductsList(), proto.BINCardProduct.toObject, includeInstance)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINCardProvider.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINCardProvider();
      return proto.BINCardProvider.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINCardProvider.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt32();
          msg.setProviderid(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setProvidercode(value);
          break;

         case 3:
          var value = reader.readString();
          msg.setProvidername(value);
          break;

         case 4:
          var value = new proto.BINCardProduct();
          reader.readMessage(value, proto.BINCardProduct.deserializeBinaryFromReader);
          msg.addProducts(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINCardProvider.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINCardProvider.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINCardProvider.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt32(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeString(3, f);
      f = this.getProductsList();
      f.length > 0 && writer.writeRepeatedMessage(4, f, proto.BINCardProduct.serializeBinaryToWriter);
    };
    proto.BINCardProvider.prototype.getProviderid = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINCardProvider.prototype.setProviderid = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINCardProvider.prototype.clearProviderid = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINCardProvider.prototype.hasProviderid = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINCardProvider.prototype.getProvidercode = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINCardProvider.prototype.setProvidercode = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINCardProvider.prototype.clearProvidercode = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINCardProvider.prototype.hasProvidercode = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINCardProvider.prototype.getProvidername = function() {
      return jspb.Message.getFieldWithDefault(this, 3, "");
    };
    proto.BINCardProvider.prototype.setProvidername = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINCardProvider.prototype.clearProvidername = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINCardProvider.prototype.hasProvidername = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINCardProvider.prototype.getProductsList = function() {
      return jspb.Message.getRepeatedWrapperField(this, proto.BINCardProduct, 4);
    };
    proto.BINCardProvider.prototype.setProductsList = function(value) {
      jspb.Message.setRepeatedWrapperField(this, 4, value);
    };
    proto.BINCardProvider.prototype.addProducts = function(opt_value, opt_index) {
      return jspb.Message.addToRepeatedWrapperField(this, 4, opt_value, proto.BINCardProduct, opt_index);
    };
    proto.BINCardProvider.prototype.clearProductsList = function() {
      this.setProductsList([]);
    };
    proto.BINCardConfigResponse = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, proto.BINCardConfigResponse.repeatedFields_, null);
    };
    goog.inherits(proto.BINCardConfigResponse, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINCardConfigResponse.displayName = "proto.BINCardConfigResponse");
    proto.BINCardConfigResponse.repeatedFields_ = [ 3 ];
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINCardConfigResponse.prototype.toObject = function(opt_includeInstance) {
        return proto.BINCardConfigResponse.toObject(opt_includeInstance, this);
      };
      proto.BINCardConfigResponse.toObject = function(includeInstance, msg) {
        var f, obj = {
          responsecode: jspb.Message.getField(msg, 1),
          message: jspb.Message.getField(msg, 2),
          providersList: jspb.Message.toObjectList(msg.getProvidersList(), proto.BINCardProvider.toObject, includeInstance),
          enablesecuritycheck: jspb.Message.getField(msg, 4)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINCardConfigResponse.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINCardConfigResponse();
      return proto.BINCardConfigResponse.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINCardConfigResponse.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readBool();
          msg.setResponsecode(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setMessage(value);
          break;

         case 3:
          var value = new proto.BINCardProvider();
          reader.readMessage(value, proto.BINCardProvider.deserializeBinaryFromReader);
          msg.addProviders(value);
          break;

         case 4:
          var value = reader.readBool();
          msg.setEnablesecuritycheck(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINCardConfigResponse.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINCardConfigResponse.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINCardConfigResponse.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeBool(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = this.getProvidersList();
      f.length > 0 && writer.writeRepeatedMessage(3, f, proto.BINCardProvider.serializeBinaryToWriter);
      f = jspb.Message.getField(this, 4);
      null != f && writer.writeBool(4, f);
    };
    proto.BINCardConfigResponse.prototype.getResponsecode = function() {
      return jspb.Message.getFieldWithDefault(this, 1, false);
    };
    proto.BINCardConfigResponse.prototype.setResponsecode = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINCardConfigResponse.prototype.clearResponsecode = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINCardConfigResponse.prototype.hasResponsecode = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINCardConfigResponse.prototype.getMessage = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINCardConfigResponse.prototype.setMessage = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINCardConfigResponse.prototype.clearMessage = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINCardConfigResponse.prototype.hasMessage = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINCardConfigResponse.prototype.getProvidersList = function() {
      return jspb.Message.getRepeatedWrapperField(this, proto.BINCardProvider, 3);
    };
    proto.BINCardConfigResponse.prototype.setProvidersList = function(value) {
      jspb.Message.setRepeatedWrapperField(this, 3, value);
    };
    proto.BINCardConfigResponse.prototype.addProviders = function(opt_value, opt_index) {
      return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.BINCardProvider, opt_index);
    };
    proto.BINCardConfigResponse.prototype.clearProvidersList = function() {
      this.setProvidersList([]);
    };
    proto.BINCardConfigResponse.prototype.getEnablesecuritycheck = function() {
      return jspb.Message.getFieldWithDefault(this, 4, false);
    };
    proto.BINCardConfigResponse.prototype.setEnablesecuritycheck = function(value) {
      jspb.Message.setField(this, 4, value);
    };
    proto.BINCardConfigResponse.prototype.clearEnablesecuritycheck = function() {
      jspb.Message.setField(this, 4, void 0);
    };
    proto.BINCardConfigResponse.prototype.hasEnablesecuritycheck = function() {
      return null != jspb.Message.getField(this, 4);
    };
    proto.BINPurchaseMoneyRequest = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINPurchaseMoneyRequest, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINPurchaseMoneyRequest.displayName = "proto.BINPurchaseMoneyRequest");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINPurchaseMoneyRequest.prototype.toObject = function(opt_includeInstance) {
        return proto.BINPurchaseMoneyRequest.toObject(opt_includeInstance, this);
      };
      proto.BINPurchaseMoneyRequest.toObject = function(includeInstance, msg) {
        var f, obj = {
          provider: jspb.Message.getField(msg, 1),
          cardserial: jspb.Message.getField(msg, 2),
          cardpin: jspb.Message.getField(msg, 3),
          securitykey: jspb.Message.getField(msg, 4),
          captcha: jspb.Message.getField(msg, 5),
          tocash: jspb.Message.getField(msg, 6)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINPurchaseMoneyRequest.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINPurchaseMoneyRequest();
      return proto.BINPurchaseMoneyRequest.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINPurchaseMoneyRequest.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readString();
          msg.setProvider(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setCardserial(value);
          break;

         case 3:
          var value = reader.readString();
          msg.setCardpin(value);
          break;

         case 4:
          var value = reader.readString();
          msg.setSecuritykey(value);
          break;

         case 5:
          var value = reader.readString();
          msg.setCaptcha(value);
          break;

         case 6:
          var value = reader.readBool();
          msg.setTocash(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINPurchaseMoneyRequest.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINPurchaseMoneyRequest.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINPurchaseMoneyRequest.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeString(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeString(3, f);
      f = jspb.Message.getField(this, 4);
      null != f && writer.writeString(4, f);
      f = jspb.Message.getField(this, 5);
      null != f && writer.writeString(5, f);
      f = jspb.Message.getField(this, 6);
      null != f && writer.writeBool(6, f);
    };
    proto.BINPurchaseMoneyRequest.prototype.getProvider = function() {
      return jspb.Message.getFieldWithDefault(this, 1, "");
    };
    proto.BINPurchaseMoneyRequest.prototype.setProvider = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINPurchaseMoneyRequest.prototype.clearProvider = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINPurchaseMoneyRequest.prototype.hasProvider = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINPurchaseMoneyRequest.prototype.getCardserial = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINPurchaseMoneyRequest.prototype.setCardserial = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINPurchaseMoneyRequest.prototype.clearCardserial = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINPurchaseMoneyRequest.prototype.hasCardserial = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINPurchaseMoneyRequest.prototype.getCardpin = function() {
      return jspb.Message.getFieldWithDefault(this, 3, "");
    };
    proto.BINPurchaseMoneyRequest.prototype.setCardpin = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINPurchaseMoneyRequest.prototype.clearCardpin = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINPurchaseMoneyRequest.prototype.hasCardpin = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINPurchaseMoneyRequest.prototype.getSecuritykey = function() {
      return jspb.Message.getFieldWithDefault(this, 4, "");
    };
    proto.BINPurchaseMoneyRequest.prototype.setSecuritykey = function(value) {
      jspb.Message.setField(this, 4, value);
    };
    proto.BINPurchaseMoneyRequest.prototype.clearSecuritykey = function() {
      jspb.Message.setField(this, 4, void 0);
    };
    proto.BINPurchaseMoneyRequest.prototype.hasSecuritykey = function() {
      return null != jspb.Message.getField(this, 4);
    };
    proto.BINPurchaseMoneyRequest.prototype.getCaptcha = function() {
      return jspb.Message.getFieldWithDefault(this, 5, "");
    };
    proto.BINPurchaseMoneyRequest.prototype.setCaptcha = function(value) {
      jspb.Message.setField(this, 5, value);
    };
    proto.BINPurchaseMoneyRequest.prototype.clearCaptcha = function() {
      jspb.Message.setField(this, 5, void 0);
    };
    proto.BINPurchaseMoneyRequest.prototype.hasCaptcha = function() {
      return null != jspb.Message.getField(this, 5);
    };
    proto.BINPurchaseMoneyRequest.prototype.getTocash = function() {
      return jspb.Message.getFieldWithDefault(this, 6, false);
    };
    proto.BINPurchaseMoneyRequest.prototype.setTocash = function(value) {
      jspb.Message.setField(this, 6, value);
    };
    proto.BINPurchaseMoneyRequest.prototype.clearTocash = function() {
      jspb.Message.setField(this, 6, void 0);
    };
    proto.BINPurchaseMoneyRequest.prototype.hasTocash = function() {
      return null != jspb.Message.getField(this, 6);
    };
    proto.BINPurchaseMoneyResponse = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINPurchaseMoneyResponse, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINPurchaseMoneyResponse.displayName = "proto.BINPurchaseMoneyResponse");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINPurchaseMoneyResponse.prototype.toObject = function(opt_includeInstance) {
        return proto.BINPurchaseMoneyResponse.toObject(opt_includeInstance, this);
      };
      proto.BINPurchaseMoneyResponse.toObject = function(includeInstance, msg) {
        var f, obj = {
          responsecode: jspb.Message.getField(msg, 1),
          message: jspb.Message.getField(msg, 2)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINPurchaseMoneyResponse.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINPurchaseMoneyResponse();
      return proto.BINPurchaseMoneyResponse.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINPurchaseMoneyResponse.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readBool();
          msg.setResponsecode(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setMessage(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINPurchaseMoneyResponse.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINPurchaseMoneyResponse.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINPurchaseMoneyResponse.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeBool(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
    };
    proto.BINPurchaseMoneyResponse.prototype.getResponsecode = function() {
      return jspb.Message.getFieldWithDefault(this, 1, false);
    };
    proto.BINPurchaseMoneyResponse.prototype.setResponsecode = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINPurchaseMoneyResponse.prototype.clearResponsecode = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINPurchaseMoneyResponse.prototype.hasResponsecode = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINPurchaseMoneyResponse.prototype.getMessage = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINPurchaseMoneyResponse.prototype.setMessage = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINPurchaseMoneyResponse.prototype.clearMessage = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINPurchaseMoneyResponse.prototype.hasMessage = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINSmsConfigRequest = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINSmsConfigRequest, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINSmsConfigRequest.displayName = "proto.BINSmsConfigRequest");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINSmsConfigRequest.prototype.toObject = function(opt_includeInstance) {
        return proto.BINSmsConfigRequest.toObject(opt_includeInstance, this);
      };
      proto.BINSmsConfigRequest.toObject = function(includeInstance, msg) {
        var f, obj = {
          type: jspb.Message.getField(msg, 1)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINSmsConfigRequest.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINSmsConfigRequest();
      return proto.BINSmsConfigRequest.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINSmsConfigRequest.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt32();
          msg.setType(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINSmsConfigRequest.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINSmsConfigRequest.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINSmsConfigRequest.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt32(1, f);
    };
    proto.BINSmsConfigRequest.prototype.getType = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINSmsConfigRequest.prototype.setType = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINSmsConfigRequest.prototype.clearType = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINSmsConfigRequest.prototype.hasType = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINSmsSyntax = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINSmsSyntax, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINSmsSyntax.displayName = "proto.BINSmsSyntax");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINSmsSyntax.prototype.toObject = function(opt_includeInstance) {
        return proto.BINSmsSyntax.toObject(opt_includeInstance, this);
      };
      proto.BINSmsSyntax.toObject = function(includeInstance, msg) {
        var f, obj = {
          syntaxid: jspb.Message.getField(msg, 1),
          syntax: jspb.Message.getField(msg, 2),
          parvalue: jspb.Message.getField(msg, 3),
          cashvalue: jspb.Message.getField(msg, 4),
          targetnumber: jspb.Message.getField(msg, 5),
          description: jspb.Message.getField(msg, 6),
          promotion: jspb.Message.getField(msg, 7)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINSmsSyntax.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINSmsSyntax();
      return proto.BINSmsSyntax.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINSmsSyntax.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt32();
          msg.setSyntaxid(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setSyntax(value);
          break;

         case 3:
          var value = reader.readInt32();
          msg.setParvalue(value);
          break;

         case 4:
          var value = reader.readInt32();
          msg.setCashvalue(value);
          break;

         case 5:
          var value = reader.readString();
          msg.setTargetnumber(value);
          break;

         case 6:
          var value = reader.readString();
          msg.setDescription(value);
          break;

         case 7:
          var value = reader.readInt32();
          msg.setPromotion(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINSmsSyntax.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINSmsSyntax.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINSmsSyntax.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt32(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeInt32(3, f);
      f = jspb.Message.getField(this, 4);
      null != f && writer.writeInt32(4, f);
      f = jspb.Message.getField(this, 5);
      null != f && writer.writeString(5, f);
      f = jspb.Message.getField(this, 6);
      null != f && writer.writeString(6, f);
      f = jspb.Message.getField(this, 7);
      null != f && writer.writeInt32(7, f);
    };
    proto.BINSmsSyntax.prototype.getSyntaxid = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINSmsSyntax.prototype.setSyntaxid = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINSmsSyntax.prototype.clearSyntaxid = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINSmsSyntax.prototype.hasSyntaxid = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINSmsSyntax.prototype.getSyntax = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINSmsSyntax.prototype.setSyntax = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINSmsSyntax.prototype.clearSyntax = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINSmsSyntax.prototype.hasSyntax = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINSmsSyntax.prototype.getParvalue = function() {
      return jspb.Message.getFieldWithDefault(this, 3, 0);
    };
    proto.BINSmsSyntax.prototype.setParvalue = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINSmsSyntax.prototype.clearParvalue = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINSmsSyntax.prototype.hasParvalue = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINSmsSyntax.prototype.getCashvalue = function() {
      return jspb.Message.getFieldWithDefault(this, 4, 0);
    };
    proto.BINSmsSyntax.prototype.setCashvalue = function(value) {
      jspb.Message.setField(this, 4, value);
    };
    proto.BINSmsSyntax.prototype.clearCashvalue = function() {
      jspb.Message.setField(this, 4, void 0);
    };
    proto.BINSmsSyntax.prototype.hasCashvalue = function() {
      return null != jspb.Message.getField(this, 4);
    };
    proto.BINSmsSyntax.prototype.getTargetnumber = function() {
      return jspb.Message.getFieldWithDefault(this, 5, "");
    };
    proto.BINSmsSyntax.prototype.setTargetnumber = function(value) {
      jspb.Message.setField(this, 5, value);
    };
    proto.BINSmsSyntax.prototype.clearTargetnumber = function() {
      jspb.Message.setField(this, 5, void 0);
    };
    proto.BINSmsSyntax.prototype.hasTargetnumber = function() {
      return null != jspb.Message.getField(this, 5);
    };
    proto.BINSmsSyntax.prototype.getDescription = function() {
      return jspb.Message.getFieldWithDefault(this, 6, "");
    };
    proto.BINSmsSyntax.prototype.setDescription = function(value) {
      jspb.Message.setField(this, 6, value);
    };
    proto.BINSmsSyntax.prototype.clearDescription = function() {
      jspb.Message.setField(this, 6, void 0);
    };
    proto.BINSmsSyntax.prototype.hasDescription = function() {
      return null != jspb.Message.getField(this, 6);
    };
    proto.BINSmsSyntax.prototype.getPromotion = function() {
      return jspb.Message.getFieldWithDefault(this, 7, 0);
    };
    proto.BINSmsSyntax.prototype.setPromotion = function(value) {
      jspb.Message.setField(this, 7, value);
    };
    proto.BINSmsSyntax.prototype.clearPromotion = function() {
      jspb.Message.setField(this, 7, void 0);
    };
    proto.BINSmsSyntax.prototype.hasPromotion = function() {
      return null != jspb.Message.getField(this, 7);
    };
    proto.BINSmsProvider = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, proto.BINSmsProvider.repeatedFields_, null);
    };
    goog.inherits(proto.BINSmsProvider, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINSmsProvider.displayName = "proto.BINSmsProvider");
    proto.BINSmsProvider.repeatedFields_ = [ 4 ];
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINSmsProvider.prototype.toObject = function(opt_includeInstance) {
        return proto.BINSmsProvider.toObject(opt_includeInstance, this);
      };
      proto.BINSmsProvider.toObject = function(includeInstance, msg) {
        var f, obj = {
          providerid: jspb.Message.getField(msg, 1),
          providercode: jspb.Message.getField(msg, 2),
          providername: jspb.Message.getField(msg, 3),
          syntaxesList: jspb.Message.toObjectList(msg.getSyntaxesList(), proto.BINSmsSyntax.toObject, includeInstance)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINSmsProvider.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINSmsProvider();
      return proto.BINSmsProvider.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINSmsProvider.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt32();
          msg.setProviderid(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setProvidercode(value);
          break;

         case 3:
          var value = reader.readString();
          msg.setProvidername(value);
          break;

         case 4:
          var value = new proto.BINSmsSyntax();
          reader.readMessage(value, proto.BINSmsSyntax.deserializeBinaryFromReader);
          msg.addSyntaxes(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINSmsProvider.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINSmsProvider.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINSmsProvider.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt32(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeString(3, f);
      f = this.getSyntaxesList();
      f.length > 0 && writer.writeRepeatedMessage(4, f, proto.BINSmsSyntax.serializeBinaryToWriter);
    };
    proto.BINSmsProvider.prototype.getProviderid = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINSmsProvider.prototype.setProviderid = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINSmsProvider.prototype.clearProviderid = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINSmsProvider.prototype.hasProviderid = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINSmsProvider.prototype.getProvidercode = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINSmsProvider.prototype.setProvidercode = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINSmsProvider.prototype.clearProvidercode = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINSmsProvider.prototype.hasProvidercode = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINSmsProvider.prototype.getProvidername = function() {
      return jspb.Message.getFieldWithDefault(this, 3, "");
    };
    proto.BINSmsProvider.prototype.setProvidername = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINSmsProvider.prototype.clearProvidername = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINSmsProvider.prototype.hasProvidername = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINSmsProvider.prototype.getSyntaxesList = function() {
      return jspb.Message.getRepeatedWrapperField(this, proto.BINSmsSyntax, 4);
    };
    proto.BINSmsProvider.prototype.setSyntaxesList = function(value) {
      jspb.Message.setRepeatedWrapperField(this, 4, value);
    };
    proto.BINSmsProvider.prototype.addSyntaxes = function(opt_value, opt_index) {
      return jspb.Message.addToRepeatedWrapperField(this, 4, opt_value, proto.BINSmsSyntax, opt_index);
    };
    proto.BINSmsProvider.prototype.clearSyntaxesList = function() {
      this.setSyntaxesList([]);
    };
    proto.BINSmsNumber = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, proto.BINSmsNumber.repeatedFields_, null);
    };
    goog.inherits(proto.BINSmsNumber, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINSmsNumber.displayName = "proto.BINSmsNumber");
    proto.BINSmsNumber.repeatedFields_ = [ 4 ];
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINSmsNumber.prototype.toObject = function(opt_includeInstance) {
        return proto.BINSmsNumber.toObject(opt_includeInstance, this);
      };
      proto.BINSmsNumber.toObject = function(includeInstance, msg) {
        var f, obj = {
          number: jspb.Message.getField(msg, 1),
          samesyntax: jspb.Message.getField(msg, 2),
          dayquota: jspb.Message.getField(msg, 3),
          providersList: jspb.Message.toObjectList(msg.getProvidersList(), proto.BINSmsProvider.toObject, includeInstance)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINSmsNumber.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINSmsNumber();
      return proto.BINSmsNumber.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINSmsNumber.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readString();
          msg.setNumber(value);
          break;

         case 2:
          var value = reader.readBool();
          msg.setSamesyntax(value);
          break;

         case 3:
          var value = reader.readInt32();
          msg.setDayquota(value);
          break;

         case 4:
          var value = new proto.BINSmsProvider();
          reader.readMessage(value, proto.BINSmsProvider.deserializeBinaryFromReader);
          msg.addProviders(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINSmsNumber.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINSmsNumber.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINSmsNumber.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeString(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeBool(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeInt32(3, f);
      f = this.getProvidersList();
      f.length > 0 && writer.writeRepeatedMessage(4, f, proto.BINSmsProvider.serializeBinaryToWriter);
    };
    proto.BINSmsNumber.prototype.getNumber = function() {
      return jspb.Message.getFieldWithDefault(this, 1, "");
    };
    proto.BINSmsNumber.prototype.setNumber = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINSmsNumber.prototype.clearNumber = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINSmsNumber.prototype.hasNumber = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINSmsNumber.prototype.getSamesyntax = function() {
      return jspb.Message.getFieldWithDefault(this, 2, false);
    };
    proto.BINSmsNumber.prototype.setSamesyntax = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINSmsNumber.prototype.clearSamesyntax = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINSmsNumber.prototype.hasSamesyntax = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINSmsNumber.prototype.getDayquota = function() {
      return jspb.Message.getFieldWithDefault(this, 3, 0);
    };
    proto.BINSmsNumber.prototype.setDayquota = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINSmsNumber.prototype.clearDayquota = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINSmsNumber.prototype.hasDayquota = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINSmsNumber.prototype.getProvidersList = function() {
      return jspb.Message.getRepeatedWrapperField(this, proto.BINSmsProvider, 4);
    };
    proto.BINSmsNumber.prototype.setProvidersList = function(value) {
      jspb.Message.setRepeatedWrapperField(this, 4, value);
    };
    proto.BINSmsNumber.prototype.addProviders = function(opt_value, opt_index) {
      return jspb.Message.addToRepeatedWrapperField(this, 4, opt_value, proto.BINSmsProvider, opt_index);
    };
    proto.BINSmsNumber.prototype.clearProvidersList = function() {
      this.setProvidersList([]);
    };
    proto.BINSmsConfigResponse = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, proto.BINSmsConfigResponse.repeatedFields_, null);
    };
    goog.inherits(proto.BINSmsConfigResponse, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINSmsConfigResponse.displayName = "proto.BINSmsConfigResponse");
    proto.BINSmsConfigResponse.repeatedFields_ = [ 3 ];
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINSmsConfigResponse.prototype.toObject = function(opt_includeInstance) {
        return proto.BINSmsConfigResponse.toObject(opt_includeInstance, this);
      };
      proto.BINSmsConfigResponse.toObject = function(includeInstance, msg) {
        var f, obj = {
          responsecode: jspb.Message.getField(msg, 1),
          message: jspb.Message.getField(msg, 2),
          numbersList: jspb.Message.toObjectList(msg.getNumbersList(), proto.BINSmsNumber.toObject, includeInstance)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINSmsConfigResponse.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINSmsConfigResponse();
      return proto.BINSmsConfigResponse.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINSmsConfigResponse.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readBool();
          msg.setResponsecode(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setMessage(value);
          break;

         case 3:
          var value = new proto.BINSmsNumber();
          reader.readMessage(value, proto.BINSmsNumber.deserializeBinaryFromReader);
          msg.addNumbers(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINSmsConfigResponse.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINSmsConfigResponse.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINSmsConfigResponse.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeBool(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = this.getNumbersList();
      f.length > 0 && writer.writeRepeatedMessage(3, f, proto.BINSmsNumber.serializeBinaryToWriter);
    };
    proto.BINSmsConfigResponse.prototype.getResponsecode = function() {
      return jspb.Message.getFieldWithDefault(this, 1, false);
    };
    proto.BINSmsConfigResponse.prototype.setResponsecode = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINSmsConfigResponse.prototype.clearResponsecode = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINSmsConfigResponse.prototype.hasResponsecode = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINSmsConfigResponse.prototype.getMessage = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINSmsConfigResponse.prototype.setMessage = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINSmsConfigResponse.prototype.clearMessage = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINSmsConfigResponse.prototype.hasMessage = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINSmsConfigResponse.prototype.getNumbersList = function() {
      return jspb.Message.getRepeatedWrapperField(this, proto.BINSmsNumber, 3);
    };
    proto.BINSmsConfigResponse.prototype.setNumbersList = function(value) {
      jspb.Message.setRepeatedWrapperField(this, 3, value);
    };
    proto.BINSmsConfigResponse.prototype.addNumbers = function(opt_value, opt_index) {
      return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.BINSmsNumber, opt_index);
    };
    proto.BINSmsConfigResponse.prototype.clearNumbersList = function() {
      this.setNumbersList([]);
    };
    proto.BINGoldProduct = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINGoldProduct, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINGoldProduct.displayName = "proto.BINGoldProduct");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINGoldProduct.prototype.toObject = function(opt_includeInstance) {
        return proto.BINGoldProduct.toObject(opt_includeInstance, this);
      };
      proto.BINGoldProduct.toObject = function(includeInstance, msg) {
        var f, obj = {
          productid: jspb.Message.getField(msg, 1),
          cashvalue: jspb.Message.getField(msg, 2),
          goldvalue: jspb.Message.getField(msg, 3),
          promotion: jspb.Message.getField(msg, 4)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINGoldProduct.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINGoldProduct();
      return proto.BINGoldProduct.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINGoldProduct.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt32();
          msg.setProductid(value);
          break;

         case 2:
          var value = reader.readInt32();
          msg.setCashvalue(value);
          break;

         case 3:
          var value = reader.readInt32();
          msg.setGoldvalue(value);
          break;

         case 4:
          var value = reader.readInt32();
          msg.setPromotion(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINGoldProduct.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINGoldProduct.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINGoldProduct.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt32(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeInt32(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeInt32(3, f);
      f = jspb.Message.getField(this, 4);
      null != f && writer.writeInt32(4, f);
    };
    proto.BINGoldProduct.prototype.getProductid = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINGoldProduct.prototype.setProductid = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINGoldProduct.prototype.clearProductid = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINGoldProduct.prototype.hasProductid = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINGoldProduct.prototype.getCashvalue = function() {
      return jspb.Message.getFieldWithDefault(this, 2, 0);
    };
    proto.BINGoldProduct.prototype.setCashvalue = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINGoldProduct.prototype.clearCashvalue = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINGoldProduct.prototype.hasCashvalue = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINGoldProduct.prototype.getGoldvalue = function() {
      return jspb.Message.getFieldWithDefault(this, 3, 0);
    };
    proto.BINGoldProduct.prototype.setGoldvalue = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINGoldProduct.prototype.clearGoldvalue = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINGoldProduct.prototype.hasGoldvalue = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINGoldProduct.prototype.getPromotion = function() {
      return jspb.Message.getFieldWithDefault(this, 4, 0);
    };
    proto.BINGoldProduct.prototype.setPromotion = function(value) {
      jspb.Message.setField(this, 4, value);
    };
    proto.BINGoldProduct.prototype.clearPromotion = function() {
      jspb.Message.setField(this, 4, void 0);
    };
    proto.BINGoldProduct.prototype.hasPromotion = function() {
      return null != jspb.Message.getField(this, 4);
    };
    proto.BINGoldConfigRequest = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINGoldConfigRequest, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINGoldConfigRequest.displayName = "proto.BINGoldConfigRequest");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINGoldConfigRequest.prototype.toObject = function(opt_includeInstance) {
        return proto.BINGoldConfigRequest.toObject(opt_includeInstance, this);
      };
      proto.BINGoldConfigRequest.toObject = function(includeInstance, msg) {
        var f, obj = {
          type: jspb.Message.getField(msg, 1)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINGoldConfigRequest.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINGoldConfigRequest();
      return proto.BINGoldConfigRequest.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINGoldConfigRequest.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt32();
          msg.setType(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINGoldConfigRequest.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINGoldConfigRequest.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINGoldConfigRequest.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt32(1, f);
    };
    proto.BINGoldConfigRequest.prototype.getType = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINGoldConfigRequest.prototype.setType = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINGoldConfigRequest.prototype.clearType = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINGoldConfigRequest.prototype.hasType = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINGoldConfigResponse = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, proto.BINGoldConfigResponse.repeatedFields_, null);
    };
    goog.inherits(proto.BINGoldConfigResponse, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINGoldConfigResponse.displayName = "proto.BINGoldConfigResponse");
    proto.BINGoldConfigResponse.repeatedFields_ = [ 3 ];
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINGoldConfigResponse.prototype.toObject = function(opt_includeInstance) {
        return proto.BINGoldConfigResponse.toObject(opt_includeInstance, this);
      };
      proto.BINGoldConfigResponse.toObject = function(includeInstance, msg) {
        var f, obj = {
          responsecode: jspb.Message.getField(msg, 1),
          message: jspb.Message.getField(msg, 2),
          goldproductsList: jspb.Message.toObjectList(msg.getGoldproductsList(), proto.BINGoldProduct.toObject, includeInstance)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINGoldConfigResponse.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINGoldConfigResponse();
      return proto.BINGoldConfigResponse.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINGoldConfigResponse.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readBool();
          msg.setResponsecode(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setMessage(value);
          break;

         case 3:
          var value = new proto.BINGoldProduct();
          reader.readMessage(value, proto.BINGoldProduct.deserializeBinaryFromReader);
          msg.addGoldproducts(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINGoldConfigResponse.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINGoldConfigResponse.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINGoldConfigResponse.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeBool(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = this.getGoldproductsList();
      f.length > 0 && writer.writeRepeatedMessage(3, f, proto.BINGoldProduct.serializeBinaryToWriter);
    };
    proto.BINGoldConfigResponse.prototype.getResponsecode = function() {
      return jspb.Message.getFieldWithDefault(this, 1, false);
    };
    proto.BINGoldConfigResponse.prototype.setResponsecode = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINGoldConfigResponse.prototype.clearResponsecode = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINGoldConfigResponse.prototype.hasResponsecode = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINGoldConfigResponse.prototype.getMessage = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINGoldConfigResponse.prototype.setMessage = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINGoldConfigResponse.prototype.clearMessage = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINGoldConfigResponse.prototype.hasMessage = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINGoldConfigResponse.prototype.getGoldproductsList = function() {
      return jspb.Message.getRepeatedWrapperField(this, proto.BINGoldProduct, 3);
    };
    proto.BINGoldConfigResponse.prototype.setGoldproductsList = function(value) {
      jspb.Message.setRepeatedWrapperField(this, 3, value);
    };
    proto.BINGoldConfigResponse.prototype.addGoldproducts = function(opt_value, opt_index) {
      return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.BINGoldProduct, opt_index);
    };
    proto.BINGoldConfigResponse.prototype.clearGoldproductsList = function() {
      this.setGoldproductsList([]);
    };
    proto.BINPurchaseGoldRequest = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINPurchaseGoldRequest, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINPurchaseGoldRequest.displayName = "proto.BINPurchaseGoldRequest");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINPurchaseGoldRequest.prototype.toObject = function(opt_includeInstance) {
        return proto.BINPurchaseGoldRequest.toObject(opt_includeInstance, this);
      };
      proto.BINPurchaseGoldRequest.toObject = function(includeInstance, msg) {
        var f, obj = {
          productid: jspb.Message.getField(msg, 1)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINPurchaseGoldRequest.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINPurchaseGoldRequest();
      return proto.BINPurchaseGoldRequest.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINPurchaseGoldRequest.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt32();
          msg.setProductid(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINPurchaseGoldRequest.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINPurchaseGoldRequest.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINPurchaseGoldRequest.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt32(1, f);
    };
    proto.BINPurchaseGoldRequest.prototype.getProductid = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINPurchaseGoldRequest.prototype.setProductid = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINPurchaseGoldRequest.prototype.clearProductid = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINPurchaseGoldRequest.prototype.hasProductid = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINPurchaseGoldResponse = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINPurchaseGoldResponse, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINPurchaseGoldResponse.displayName = "proto.BINPurchaseGoldResponse");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINPurchaseGoldResponse.prototype.toObject = function(opt_includeInstance) {
        return proto.BINPurchaseGoldResponse.toObject(opt_includeInstance, this);
      };
      proto.BINPurchaseGoldResponse.toObject = function(includeInstance, msg) {
        var f, obj = {
          responsecode: jspb.Message.getField(msg, 1),
          message: jspb.Message.getField(msg, 2)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINPurchaseGoldResponse.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINPurchaseGoldResponse();
      return proto.BINPurchaseGoldResponse.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINPurchaseGoldResponse.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readBool();
          msg.setResponsecode(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setMessage(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINPurchaseGoldResponse.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINPurchaseGoldResponse.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINPurchaseGoldResponse.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeBool(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
    };
    proto.BINPurchaseGoldResponse.prototype.getResponsecode = function() {
      return jspb.Message.getFieldWithDefault(this, 1, false);
    };
    proto.BINPurchaseGoldResponse.prototype.setResponsecode = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINPurchaseGoldResponse.prototype.clearResponsecode = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINPurchaseGoldResponse.prototype.hasResponsecode = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINPurchaseGoldResponse.prototype.getMessage = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINPurchaseGoldResponse.prototype.setMessage = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINPurchaseGoldResponse.prototype.clearMessage = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINPurchaseGoldResponse.prototype.hasMessage = function() {
      return null != jspb.Message.getField(this, 2);
    };
    goog.object.extend(exports, proto);
    cc._RF.pop();
  }, {
    "google-protobuf": "google-protobuf"
  } ],
  register_pb: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "e764fNsZeFEubUyA8lCOkFJ", "register_pb");
    "use strict";
    var jspb = require("google-protobuf");
    var goog = jspb;
    var global = Function("return this")();
    goog.exportSymbol("proto.BINRegisterRequest", null, global);
    goog.exportSymbol("proto.BINRegisterResponse", null, global);
    proto.BINRegisterRequest = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINRegisterRequest, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINRegisterRequest.displayName = "proto.BINRegisterRequest");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINRegisterRequest.prototype.toObject = function(opt_includeInstance) {
        return proto.BINRegisterRequest.toObject(opt_includeInstance, this);
      };
      proto.BINRegisterRequest.toObject = function(includeInstance, msg) {
        var f, obj = {
          username: jspb.Message.getField(msg, 1),
          password: jspb.Message.getField(msg, 2),
          confirmpassword: jspb.Message.getField(msg, 3),
          displayname: jspb.Message.getField(msg, 4),
          mobile: jspb.Message.getField(msg, 5)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINRegisterRequest.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINRegisterRequest();
      return proto.BINRegisterRequest.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINRegisterRequest.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readString();
          msg.setUsername(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setPassword(value);
          break;

         case 3:
          var value = reader.readString();
          msg.setConfirmpassword(value);
          break;

         case 4:
          var value = reader.readString();
          msg.setDisplayname(value);
          break;

         case 5:
          var value = reader.readString();
          msg.setMobile(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINRegisterRequest.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINRegisterRequest.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINRegisterRequest.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeString(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeString(3, f);
      f = jspb.Message.getField(this, 4);
      null != f && writer.writeString(4, f);
      f = jspb.Message.getField(this, 5);
      null != f && writer.writeString(5, f);
    };
    proto.BINRegisterRequest.prototype.getUsername = function() {
      return jspb.Message.getFieldWithDefault(this, 1, "");
    };
    proto.BINRegisterRequest.prototype.setUsername = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINRegisterRequest.prototype.clearUsername = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINRegisterRequest.prototype.hasUsername = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINRegisterRequest.prototype.getPassword = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINRegisterRequest.prototype.setPassword = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINRegisterRequest.prototype.clearPassword = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINRegisterRequest.prototype.hasPassword = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINRegisterRequest.prototype.getConfirmpassword = function() {
      return jspb.Message.getFieldWithDefault(this, 3, "");
    };
    proto.BINRegisterRequest.prototype.setConfirmpassword = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINRegisterRequest.prototype.clearConfirmpassword = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINRegisterRequest.prototype.hasConfirmpassword = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINRegisterRequest.prototype.getDisplayname = function() {
      return jspb.Message.getFieldWithDefault(this, 4, "");
    };
    proto.BINRegisterRequest.prototype.setDisplayname = function(value) {
      jspb.Message.setField(this, 4, value);
    };
    proto.BINRegisterRequest.prototype.clearDisplayname = function() {
      jspb.Message.setField(this, 4, void 0);
    };
    proto.BINRegisterRequest.prototype.hasDisplayname = function() {
      return null != jspb.Message.getField(this, 4);
    };
    proto.BINRegisterRequest.prototype.getMobile = function() {
      return jspb.Message.getFieldWithDefault(this, 5, "");
    };
    proto.BINRegisterRequest.prototype.setMobile = function(value) {
      jspb.Message.setField(this, 5, value);
    };
    proto.BINRegisterRequest.prototype.clearMobile = function() {
      jspb.Message.setField(this, 5, void 0);
    };
    proto.BINRegisterRequest.prototype.hasMobile = function() {
      return null != jspb.Message.getField(this, 5);
    };
    proto.BINRegisterResponse = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINRegisterResponse, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINRegisterResponse.displayName = "proto.BINRegisterResponse");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINRegisterResponse.prototype.toObject = function(opt_includeInstance) {
        return proto.BINRegisterResponse.toObject(opt_includeInstance, this);
      };
      proto.BINRegisterResponse.toObject = function(includeInstance, msg) {
        var f, obj = {
          responsecode: jspb.Message.getField(msg, 1),
          message: jspb.Message.getField(msg, 2)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINRegisterResponse.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINRegisterResponse();
      return proto.BINRegisterResponse.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINRegisterResponse.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readBool();
          msg.setResponsecode(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setMessage(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINRegisterResponse.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINRegisterResponse.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINRegisterResponse.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeBool(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
    };
    proto.BINRegisterResponse.prototype.getResponsecode = function() {
      return jspb.Message.getFieldWithDefault(this, 1, false);
    };
    proto.BINRegisterResponse.prototype.setResponsecode = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINRegisterResponse.prototype.clearResponsecode = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINRegisterResponse.prototype.hasResponsecode = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINRegisterResponse.prototype.getMessage = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINRegisterResponse.prototype.setMessage = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINRegisterResponse.prototype.clearMessage = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINRegisterResponse.prototype.hasMessage = function() {
      return null != jspb.Message.getField(this, 2);
    };
    goog.object.extend(exports, proto);
    cc._RF.pop();
  }, {
    "google-protobuf": "google-protobuf"
  } ],
  tableView: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "1d15atdx51ExJ6u0pe1cxvK", "tableView");
    "use strict";
    var ScrollModel = cc.Enum({
      Horizontal: 0,
      Vertical: 1
    });
    var ScrollDirection = cc.Enum({
      None: 0,
      Up: 1,
      Down: 2,
      Left: 3,
      Rigth: 4
    });
    var Direction = cc.Enum({
      LEFT_TO_RIGHT__TOP_TO_BOTTOM: 0,
      TOP_TO_BOTTOM__LEFT_TO_RIGHT: 1
    });
    var ViewType = cc.Enum({
      Scroll: 0,
      Flip: 1
    });
    var _searchMaskParent = function _searchMaskParent(node) {
      var Mask = cc.Mask;
      if (Mask) {
        var index = 0;
        for (var curr = node; curr && cc.Node.isNode(curr); curr = curr._parent, ++index) if (curr.getComponent(Mask)) return {
          index: index,
          node: curr
        };
      }
      return null;
    };
    function quickSort(arr, cb) {
      if (arr.length <= 1) return arr;
      var pivotIndex = Math.floor(arr.length / 2);
      var pivot = arr[pivotIndex];
      var left = [];
      var right = [];
      for (var i = 0; i < arr.length; i++) i !== pivotIndex && (cb ? cb(arr[i], pivot) ? left.push(arr[i]) : right.push(arr[i]) : arr[i] <= pivot ? left.push(arr[i]) : right.push(arr[i]));
      return quickSort(left, cb).concat([ pivot ], quickSort(right, cb));
    }
    var tableView = cc.Class({
      extends: cc.ScrollView,
      editor: false,
      properties: {
        _data: null,
        _minCellIndex: 0,
        _maxCellIndex: 0,
        _paramCount: 0,
        _count: 0,
        _cellCount: 0,
        _showCellCount: 0,
        _groupCellCount: null,
        _scrollDirection: ScrollDirection.None,
        _cellPool: null,
        _view: null,
        _page: 0,
        _pageTotal: 0,
        _touchLayer: cc.Node,
        _loadSuccess: false,
        _initSuccess: false,
        _scheduleInit: false,
        cell: {
          default: null,
          type: cc.Prefab,
          notify: function notify(oldValue) {}
        },
        ScrollModel: {
          default: 0,
          type: ScrollModel,
          notify: function notify(oldValue) {
            if (this.ScrollModel === ScrollModel.Horizontal) {
              this.horizontal = true;
              this.vertical = false;
              this.verticalScrollBar = null;
            } else {
              this.vertical = true;
              this.horizontal = false;
              this.horizontalScrollBar = null;
            }
          },
          tooltip: "横向纵向滑动"
        },
        ViewType: {
          default: 0,
          type: ViewType,
          notify: function notify(oldValue) {
            this.ViewType === ViewType.Flip ? this.inertia = false : this.inertia = true;
          },
          tooltip: "为Scroll时,不做解释\n为Flipw时，在Scroll的基础上增加翻页的行为"
        },
        isFill: {
          default: false,
          tooltip: "当节点不能铺满一页时，选择isFill为true会填充节点铺满整个view"
        },
        Direction: {
          default: 0,
          type: Direction,
          tooltip: "规定cell的排列方向"
        },
        pageChangeEvents: {
          default: [],
          type: cc.Component.EventHandler,
          tooltip: "仅当ViewType为pageView时有效，初始化或翻页时触发回调，向回调传入两个参数，参数一为当前处于哪一页，参数二为一共多少页"
        }
      },
      statics: {
        _cellPoolCache: {}
      },
      onLoad: function onLoad() {
        window.s = this;
        var self = this;
        tableView._tableView.push(this);
        var destroy = this.node.destroy;
        this.node.destroy = function() {
          self.clear();
          destroy.call(self.node);
        };
        var _onPreDestroy = this.node._onPreDestroy;
        this.node._onPreDestroy = function() {
          self.clear();
          _onPreDestroy.call(self.node);
        };
      },
      onDestroy: function onDestroy() {
        cc.eventManager.removeListener(this._touchListener);
        this._touchListener.release();
        for (var key in tableView._tableView) {
          cc.log("key =", key);
          if (tableView._tableView[key] === this) {
            tableView._tableView.splice(key);
            cc.log("_tableView =", tableView._tableView);
            return;
          }
        }
      },
      _addListenerToTouchLayer: function _addListenerToTouchLayer() {
        this._touchLayer = new cc.Node();
        var widget = this._touchLayer.addComponent(cc.Widget);
        widget.isAlignTop = true;
        widget.isAlignBottom = true;
        widget.isAlignLeft = true;
        widget.isAlignRight = true;
        widget.top = 0;
        widget.bottom = 0;
        widget.left = 0;
        widget.right = 0;
        widget.isAlignOnce = false;
        this._touchLayer.parent = this._view;
        var self = this;
        this._touchListener = cc.EventListener.create({
          event: cc.EventListener.TOUCH_ONE_BY_ONE,
          swallowTouches: false,
          ower: this._touchLayer,
          mask: _searchMaskParent(this._touchLayer),
          onTouchBegan: function onTouchBegan(touch, event) {
            var pos = touch.getLocation();
            var node = this.ower;
            if (node._hitTest(pos, this)) {
              self._touchstart(touch);
              return true;
            }
            return false;
          },
          onTouchMoved: function onTouchMoved(touch, event) {
            self._touchmove(touch);
          },
          onTouchEnded: function onTouchEnded(touch, event) {
            self._touchend(touch);
          }
        });
        this._touchListener.retain();
        cc.eventManager.addListener(this._touchListener, this._touchLayer);
      },
      _setStopPropagation: function _setStopPropagation() {
        this.node.on("touchstart", function(event) {
          event.stopPropagation();
        });
        this.node.on("touchmove", function(event) {
          event.stopPropagation();
        });
        this.node.on("touchend", function(event) {
          event.stopPropagation();
        });
        this.node.on("touchcancel", function(event) {
          event.stopPropagation();
        });
      },
      _initCell: function _initCell(cell, reload) {
        if (this.ScrollModel === ScrollModel.Horizontal && this.Direction === Direction.TOP_TO_BOTTOM__LEFT_TO_RIGHT || this.ScrollModel === ScrollModel.Vertical && this.Direction === Direction.LEFT_TO_RIGHT__TOP_TO_BOTTOM) {
          var tag = cell.tag * cell.childrenCount;
          cc.log("cell.childrenCount =", cell.childrenCount);
          for (var index = 0; index < cell.childrenCount; ++index) {
            var node = cell.children[index];
            var viewCell = node.getComponent("viewCell");
            if (viewCell) {
              viewCell._cellInit_(this);
              viewCell.init(tag + index, this._data, reload, [ cell.tag, index ]);
            }
          }
        } else if (this.ViewType === ViewType.Flip) {
          var tag = Math.floor(cell.tag / this._showCellCount);
          var tagnum = tag * this._showCellCount * cell.childrenCount;
          for (var index = 0; index < cell.childrenCount; ++index) {
            var node = cell.children[index];
            var viewCell = node.getComponent("viewCell");
            if (viewCell) {
              viewCell._cellInit_(this);
              viewCell.init(this._showCellCount * index + cell.tag % this._showCellCount + tagnum, this._data, reload, [ index + tag * cell.childrenCount, index ]);
            }
          }
        } else for (var index = 0; index < cell.childrenCount; ++index) {
          var node = cell.children[index];
          var viewCell = node.getComponent("viewCell");
          if (viewCell) {
            viewCell._cellInit_(this);
            viewCell.init(index * this._count + cell.tag, this._data, reload, [ index, index ]);
          }
        }
      },
      _setCellPosition: function _setCellPosition(node, index) {
        if (this.ScrollModel === ScrollModel.Horizontal) {
          node.x = 0 === index ? -this.content.width * this.content.anchorX + node.width * node.anchorX : this.content.getChildByTag(index - 1).x + node.width;
          node.y = (node.anchorY - this.content.anchorY) * node.height;
        } else {
          node.y = 0 === index ? this.content.height * (1 - this.content.anchorY) - node.height * (1 - node.anchorY) : this.content.getChildByTag(index - 1).y - node.height;
          node.x = (node.anchorX - this.content.anchorX) * node.width;
        }
      },
      _addCell: function _addCell(index) {
        var cell = this._getCell();
        this._setCellAttr(cell, index);
        this._setCellPosition(cell, index);
        cell.parent = this.content;
        this._initCell(cell);
      },
      _setCellAttr: function _setCellAttr(cell, index) {
        cell.setSiblingIndex(index >= cell.tag ? this._cellCount : 0);
        cell.tag = index;
      },
      _addCellsToView: function _addCellsToView() {
        for (var index = 0; index <= this._maxCellIndex; ++index) this._addCell(index);
      },
      _getCell: function _getCell() {
        if (0 === this._cellPool.size()) {
          var cell = cc.instantiate(this.cell);
          var node = new cc.Node();
          node.anchorX = .5;
          node.anchorY = .5;
          var length = 0;
          if (this.ScrollModel === ScrollModel.Horizontal) {
            node.width = cell.width;
            var childrenCount = Math.floor(this.content.height / cell.height);
            node.height = this.content.height;
            for (var index = 0; index < childrenCount; ++index) {
              cell || (cell = cc.instantiate(this.cell));
              cell.x = (cell.anchorX - .5) * cell.width;
              cell.y = node.height / 2 - cell.height * (1 - cell.anchorY) - length;
              length += cell.height;
              cell.parent = node;
              cell = null;
            }
          } else {
            node.height = cell.height;
            var childrenCount = Math.floor(this.content.width / cell.width);
            node.width = this.content.width;
            for (var index = 0; index < childrenCount; ++index) {
              cell || (cell = cc.instantiate(this.cell));
              cell.y = (cell.anchorY - .5) * cell.height;
              cell.x = -node.width / 2 + cell.width * cell.anchorX + length;
              length += cell.width;
              cell.parent = node;
              cell = null;
            }
          }
          this._cellPool.put(node);
        }
        var cell = this._cellPool.get();
        return cell;
      },
      _getCellSize: function _getCellSize() {
        var cell = this._getCell();
        var cellSize = cell.getContentSize();
        this._cellPool.put(cell);
        return cellSize;
      },
      _getGroupCellCount: function _getGroupCellCount() {
        var cell = this._getCell();
        var groupCellCount = cell.childrenCount;
        this._cellPool.put(cell);
        return groupCellCount;
      },
      clear: function clear() {
        for (var index = this.content.childrenCount - 1; index >= 0; --index) this._cellPool.put(this.content.children[index]);
        this._cellCount = 0;
        this._showCellCount = 0;
      },
      reload: function reload(data) {
        void 0 !== data && (this._data = data);
        for (var index = this.content.childrenCount - 1; index >= 0; --index) this._initCell(this.content.children[index], true);
      },
      _getCellPoolCacheName: function _getCellPoolCacheName() {
        return this.ScrollModel === ScrollModel.Horizontal ? this.cell.name + "h" + this.content.height : this.cell.name + "w" + this.content.width;
      },
      _initTableView: function _initTableView() {
        this._scheduleInit = false;
        this._cellPool && this.clear();
        var name = this._getCellPoolCacheName();
        tableView._cellPoolCache[name] || (tableView._cellPoolCache[name] = new cc.NodePool("viewCell"));
        this._cellPool = tableView._cellPoolCache[name];
        this._cellSize = this._getCellSize();
        this._groupCellCount = this._getGroupCellCount();
        this._count = Math.ceil(this._paramCount / this._groupCellCount);
        if (this.ScrollModel === ScrollModel.Horizontal) {
          this._view.width = this.node.width;
          this._view.x = (this._view.anchorX - this.node.anchorX) * this._view.width;
          this._cellCount = Math.ceil(this._view.width / this._cellSize.width) + 1;
          if (this.ViewType === ViewType.Flip) if (this._cellCount > this._count) {
            this.isFill ? this._cellCount = Math.floor(this._view.width / this._cellSize.width) : this._cellCount = this._count;
            this._showCellCount = this._cellCount;
            this._pageTotal = 1;
          } else {
            this._pageTotal = Math.ceil(this._count / (this._cellCount - 1));
            this._count = this._pageTotal * (this._cellCount - 1);
            this._showCellCount = this._cellCount - 1;
          } else if (this._cellCount > this._count) {
            this.isFill ? this._cellCount = Math.floor(this._view.width / this._cellSize.width) : this._cellCount = this._count;
            this._showCellCount = this._cellCount;
          } else this._showCellCount = this._cellCount - 1;
          this.content.width = this._count * this._cellSize.width;
          this.stopAutoScroll();
          this.scrollToLeft();
        } else {
          this._view.height = this.node.height;
          this._view.y = (this._view.anchorY - this.node.anchorY) * this._view.height;
          this._cellCount = Math.ceil(this._view.height / this._cellSize.height) + 1;
          if (this.ViewType === ViewType.Flip) if (this._cellCount > this._count) {
            this.isFill ? this._cellCount = Math.floor(this._view.height / this._cellSize.height) : this._cellCount = this._count;
            this._showCellCount = this._cellCount;
            this._pageTotal = 1;
          } else {
            this._pageTotal = Math.ceil(this._count / (this._cellCount - 1));
            this._count = this._pageTotal * (this._cellCount - 1);
            this._showCellCount = this._cellCount - 1;
          } else if (this._cellCount > this._count) {
            this.isFill ? this._cellCount = Math.floor(this._view.height / this._cellSize.height) : this._cellCount = this._count;
            this._showCellCount = this._cellCount;
          } else this._showCellCount = this._cellCount - 1;
          this.content.height = this._count * this._cellSize.height;
          this.stopAutoScroll();
          this.scrollToTop();
        }
        this._changePageNum(1 - this._page);
        this._lastOffset = this.getScrollOffset();
        this._minCellIndex = 0;
        this._maxCellIndex = this._cellCount - 1;
        this._addCellsToView();
        this._initSuccess = true;
      },
      initTableView: function initTableView(paramCount, data) {
        this._paramCount = paramCount;
        this._data = data;
        if (this._loadSuccess) this._scheduleInit || this._initTableView(); else {
          if (this.ScrollModel === ScrollModel.Horizontal) {
            this.horizontal = true;
            this.vertical = false;
          } else {
            this.vertical = true;
            this.horizontal = false;
          }
          this._view = this.content.parent;
          this.verticalScrollBar && this.verticalScrollBar.node.on("size-changed", function() {
            this._updateScrollBar(this._getHowMuchOutOfBoundary());
          }, this);
          this.horizontalScrollBar && this.horizontalScrollBar.node.on("size-changed", function() {
            this._updateScrollBar(this._getHowMuchOutOfBoundary());
          }, this);
          this._addListenerToTouchLayer();
          this._setStopPropagation();
          if (this.node.getComponent(cc.Widget) || this._view.getComponent(cc.Widget) || this.content.getComponent(cc.Widget)) {
            this.scheduleOnce(this._initTableView);
            this._scheduleInit = true;
          } else this._initTableView();
          this._loadSuccess = true;
        }
      },
      stopAutoScroll: function stopAutoScroll() {
        if (this._scheduleInit) {
          this.scheduleOnce(function() {
            this.stopAutoScroll();
          });
          return;
        }
        this._scrollDirection = ScrollDirection.None;
        this._super();
      },
      scrollToBottom: function scrollToBottom(timeInSecond, attenuated) {
        if (this._scheduleInit) {
          this.scheduleOnce(function() {
            this.scrollToBottom(timeInSecond, attenuated);
          });
          return;
        }
        this._scrollDirection = ScrollDirection.Up;
        this._super(timeInSecond, attenuated);
      },
      scrollToTop: function scrollToTop(timeInSecond, attenuated) {
        if (this._scheduleInit) {
          this.scheduleOnce(function() {
            this.scrollToTop(timeInSecond, attenuated);
          });
          return;
        }
        this._scrollDirection = ScrollDirection.Down;
        this._super(timeInSecond, attenuated);
      },
      scrollToLeft: function scrollToLeft(timeInSecond, attenuated) {
        if (this._scheduleInit) {
          this.scheduleOnce(function() {
            this.scrollToLeft(timeInSecond, attenuated);
          });
          return;
        }
        this._scrollDirection = ScrollDirection.Rigth;
        this._super(timeInSecond, attenuated);
      },
      scrollToRight: function scrollToRight(timeInSecond, attenuated) {
        if (this._scheduleInit) {
          this.scheduleOnce(function() {
            this.scrollToRight(timeInSecond, attenuated);
          });
          return;
        }
        this._scrollDirection = ScrollDirection.Left;
        this._super(timeInSecond, attenuated);
      },
      scrollToOffset: function scrollToOffset(offset, timeInSecond, attenuated) {
        if (this._scheduleInit) {
          this.scheduleOnce(function() {
            this.scrollToOffset(offset, timeInSecond, attenuated);
          });
          return;
        }
        var nowoffset = this.getScrollOffset();
        var p = cc.pSub(offset, nowoffset);
        this.ScrollModel === ScrollModel.Horizontal ? p.x > 0 ? this._scrollDirection = ScrollDirection.Left : p.x < 0 && (this._scrollDirection = ScrollDirection.Rigth) : p.y > 0 ? this._scrollDirection = ScrollDirection.Up : p.y < 0 && (this._scrollDirection = ScrollDirection.Down);
        this._super(offset, timeInSecond, attenuated);
      },
      addScrollEvent: function addScrollEvent(target, component, handler) {
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;
        this.scrollEvents.push(eventHandler);
      },
      removeScrollEvent: function removeScrollEvent(target) {
        for (var key in this.scrollEvents) {
          var eventHandler = this.scrollEvents[key];
          if (eventHandler.target === target) {
            this.scrollEvents.splice(key, 1);
            return;
          }
        }
      },
      clearScrollEvent: function clearScrollEvent() {
        this.scrollEvents = [];
      },
      addPageEvent: function addPageEvent(target, component, handler) {
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;
        this.pageChangeEvents.push(eventHandler);
      },
      removePageEvent: function removePageEvent(target) {
        for (var key in this.pageChangeEvents) {
          var eventHandler = this.pageChangeEvents[key];
          if (eventHandler.target === target) {
            this.pageChangeEvents.splice(key, 1);
            return;
          }
        }
      },
      clearPageEvent: function clearPageEvent() {
        this.pageChangeEvents = [];
      },
      scrollToNextPage: function scrollToNextPage() {
        this.scrollToPage(this._page + 1);
      },
      scrollToLastPage: function scrollToLastPage() {
        this.scrollToPage(this._page - 1);
      },
      scrollToPage: function scrollToPage(page) {
        if (this.ViewType !== ViewType.Flip || page === this._page) return;
        if (page < 1 || page > this._pageTotal) return;
        var time = .3 * Math.abs(page - this._page);
        this._changePageNum(page - this._page);
        if (this._initSuccess) {
          var x = this._view.width;
          var y = this._view.height;
          x = (this._page - 1) * x;
          y = (this._page - 1) * y;
          this.scrollToOffset({
            x: x,
            y: y
          }, time);
        } else this.scheduleOnce(function() {
          var x = this._view.width;
          var y = this._view.height;
          x = (this._page - 1) * x;
          y = (this._page - 1) * y;
          this.scrollToOffset({
            x: x,
            y: y
          }, time);
        });
      },
      getCells: function getCells(callback) {
        var self = this;
        var f = function f() {
          var cells = [];
          var nodes = quickSort(self.content.children, function(a, b) {
            return a.tag < b.tag;
          });
          for (var key in nodes) {
            var node = nodes[key];
            for (var k in node.children) cells.push(node.children[k]);
          }
          callback(cells);
        };
        this._initSuccess ? f() : this.scheduleOnce(f);
      },
      getData: function getData() {
        return this._data;
      },
      getGroupsRange: function getGroupsRange(callback) {
        var self = this;
        var f = function f() {
          var arr = [];
          for (var i = self._minCellIndex; i <= self._maxCellIndex; i++) arr.push(i);
          callback(arr);
        };
        this._initSuccess ? f() : this.scheduleOnce(f);
      },
      _changePageNum: function _changePageNum(num) {
        this._page += num;
        this._page <= 0 ? this._page = 1 : this._page > this._pageTotal && (this._page = this._pageTotal);
        for (var key in this.pageChangeEvents) {
          var event = this.pageChangeEvents[key];
          event.emit([ this._page, this._pageTotal ]);
        }
      },
      _touchstart: function _touchstart(event) {
        this.ScrollModel === ScrollModel.Horizontal ? this.horizontal = false : this.vertical = false;
      },
      _touchmove: function _touchmove(event) {
        if (this.horizontal === this.vertical) {
          var startL = event.getStartLocation();
          var l = event.getLocation();
          if (this.ScrollModel === ScrollModel.Horizontal) {
            if (Math.abs(l.x - startL.x) <= 7) return;
          } else if (Math.abs(l.y - startL.y) <= 7) return;
          this.ScrollModel === ScrollModel.Horizontal ? this.horizontal = true : this.vertical = true;
        }
      },
      _touchend: function _touchend(event) {
        this.ScrollModel === ScrollModel.Horizontal ? this.horizontal = true : this.vertical = true;
        this.ViewType === ViewType.Flip && this._pageTotal > 1 && this._pageMove(event);
      },
      _pageMove: function _pageMove(event) {
        var x = this._view.width;
        var y = this._view.height;
        if (this.ViewType === ViewType.Flip) {
          var offset = this.getScrollOffset();
          var offsetMax = this.getMaxScrollOffset();
          if (this.ScrollModel === ScrollModel.Horizontal) {
            if (offset.x >= 0 || offset.x <= -offsetMax.x) return;
            y = 0;
            if (Math.abs(event.getLocation().x - event.getStartLocation().x) > this._view.width / 4) if (this._scrollDirection === ScrollDirection.Left) {
              if (!(this._page < this._pageTotal)) return;
              this._changePageNum(1);
            } else if (this._scrollDirection === ScrollDirection.Rigth) {
              if (!(this._page > 1)) return;
              this._changePageNum(-1);
            }
          } else {
            if (offset.y >= offsetMax.y || offset.y <= 0) return;
            x = 0;
            if (Math.abs(event.getLocation().y - event.getStartLocation().y) > this._view.height / 4) if (this._scrollDirection === ScrollDirection.Up) {
              if (!(this._page < this._pageTotal)) return;
              this._changePageNum(1);
            } else if (this._scrollDirection === ScrollDirection.Down) {
              if (!(this._page > 1)) return;
              this._changePageNum(-1);
            }
          }
          x = (this._page - 1) * x;
          y = (this._page - 1) * y;
          this.scrollToOffset({
            x: x,
            y: y
          }, .3);
        }
      },
      _getBoundingBoxToWorld: function _getBoundingBoxToWorld(node) {
        var p = node.convertToWorldSpace(cc.p(0, 0));
        return cc.rect(p.x, p.y, node.width, node.height);
      },
      _updateCells: function _updateCells() {
        if (this.ScrollModel === ScrollModel.Horizontal) {
          if (this._scrollDirection === ScrollDirection.Left) {
            if (this._maxCellIndex < this._count - 1) {
              var viewBox = this._getBoundingBoxToWorld(this._view);
              do {
                var node = this.content.getChildByTag(this._minCellIndex);
                var nodeBox = this._getBoundingBoxToWorld(node);
                if (!(nodeBox.xMax <= viewBox.xMin)) break;
                node.x = this.content.getChildByTag(this._maxCellIndex).x + node.width;
                this._minCellIndex++;
                this._maxCellIndex++;
                if (nodeBox.xMax + (this._maxCellIndex - this._minCellIndex + 1) * node.width > viewBox.xMin) {
                  this._setCellAttr(node, this._maxCellIndex);
                  this._initCell(node);
                }
              } while (this._maxCellIndex !== this._count - 1);
            }
          } else if (this._scrollDirection === ScrollDirection.Rigth && this._minCellIndex > 0) {
            var viewBox = this._getBoundingBoxToWorld(this._view);
            do {
              var node = this.content.getChildByTag(this._maxCellIndex);
              var nodeBox = this._getBoundingBoxToWorld(node);
              if (!(nodeBox.xMin >= viewBox.xMax)) break;
              node.x = this.content.getChildByTag(this._minCellIndex).x - node.width;
              this._minCellIndex--;
              this._maxCellIndex--;
              if (nodeBox.xMin - (this._maxCellIndex - this._minCellIndex + 1) * node.width < viewBox.xMax) {
                this._setCellAttr(node, this._minCellIndex);
                this._initCell(node);
              }
            } while (0 !== this._minCellIndex);
          }
        } else if (this._scrollDirection === ScrollDirection.Up) {
          if (this._maxCellIndex < this._count - 1) {
            var viewBox = this._getBoundingBoxToWorld(this._view);
            do {
              var node = this.content.getChildByTag(this._minCellIndex);
              var nodeBox = this._getBoundingBoxToWorld(node);
              if (!(nodeBox.yMin >= viewBox.yMax)) break;
              node.y = this.content.getChildByTag(this._maxCellIndex).y - node.height;
              this._minCellIndex++;
              this._maxCellIndex++;
              if (nodeBox.yMin - (this._maxCellIndex - this._minCellIndex + 1) * node.height < viewBox.yMax) {
                this._setCellAttr(node, this._maxCellIndex);
                this._initCell(node);
              }
            } while (this._maxCellIndex !== this._count - 1);
          }
        } else if (this._scrollDirection === ScrollDirection.Down && this._minCellIndex > 0) {
          var viewBox = this._getBoundingBoxToWorld(this._view);
          do {
            var node = this.content.getChildByTag(this._maxCellIndex);
            var nodeBox = this._getBoundingBoxToWorld(node);
            if (!(nodeBox.yMax <= viewBox.yMin)) break;
            node.y = this.content.getChildByTag(this._minCellIndex).y + node.height;
            this._minCellIndex--;
            this._maxCellIndex--;
            if (nodeBox.yMax + (this._maxCellIndex - this._minCellIndex + 1) * node.width > viewBox.yMin) {
              this._setCellAttr(node, this._minCellIndex);
              this._initCell(node);
            }
          } while (0 !== this._minCellIndex);
        }
      },
      _getScrollDirection: function _getScrollDirection() {
        var offset = this.getScrollOffset();
        var lastOffset = this._lastOffset;
        this._lastOffset = offset;
        offset = cc.pSub(offset, lastOffset);
        this.ScrollModel === ScrollModel.Horizontal ? offset.x > 0 ? this._scrollDirection = ScrollDirection.Rigth : offset.x < 0 ? this._scrollDirection = ScrollDirection.Left : this._scrollDirection = ScrollDirection.None : offset.y < 0 ? this._scrollDirection = ScrollDirection.Down : offset.y > 0 ? this._scrollDirection = ScrollDirection.Up : this._scrollDirection = ScrollDirection.None;
      },
      update: function update(dt) {
        this._super(dt);
        if (!this._initSuccess || this._cellCount === this._showCellCount || 1 === this._pageTotal) return;
        this._getScrollDirection();
        this._updateCells();
      }
    });
    tableView._tableView = [];
    tableView.reload = function() {
      for (var key in tableView._tableView) tableView._tableView[key].reload();
    };
    tableView.clear = function() {
      for (var key in tableView._tableView) tableView._tableView[key].clear();
    };
    cc.tableView = module.export = tableView;
    cc._RF.pop();
  }, {} ],
  text_emoticon_pb: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "fcc9beNNQZA77aWmnH+XavD", "text_emoticon_pb");
    "use strict";
    var jspb = require("google-protobuf");
    var goog = jspb;
    var global = Function("return this")();
    goog.exportSymbol("proto.BINTextEmoticon", null, global);
    proto.BINTextEmoticon = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINTextEmoticon, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINTextEmoticon.displayName = "proto.BINTextEmoticon");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINTextEmoticon.prototype.toObject = function(opt_includeInstance) {
        return proto.BINTextEmoticon.toObject(opt_includeInstance, this);
      };
      proto.BINTextEmoticon.toObject = function(includeInstance, msg) {
        var f, obj = {
          userid: jspb.Message.getField(msg, 1),
          emoticonid: jspb.Message.getField(msg, 2),
          message: jspb.Message.getField(msg, 3)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINTextEmoticon.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINTextEmoticon();
      return proto.BINTextEmoticon.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINTextEmoticon.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt64();
          msg.setUserid(value);
          break;

         case 2:
          var value = reader.readInt32();
          msg.setEmoticonid(value);
          break;

         case 3:
          var value = reader.readString();
          msg.setMessage(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINTextEmoticon.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINTextEmoticon.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINTextEmoticon.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt64(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeInt32(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeString(3, f);
    };
    proto.BINTextEmoticon.prototype.getUserid = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINTextEmoticon.prototype.setUserid = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINTextEmoticon.prototype.clearUserid = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINTextEmoticon.prototype.hasUserid = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINTextEmoticon.prototype.getEmoticonid = function() {
      return jspb.Message.getFieldWithDefault(this, 2, 0);
    };
    proto.BINTextEmoticon.prototype.setEmoticonid = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINTextEmoticon.prototype.clearEmoticonid = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINTextEmoticon.prototype.hasEmoticonid = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINTextEmoticon.prototype.getMessage = function() {
      return jspb.Message.getFieldWithDefault(this, 3, "");
    };
    proto.BINTextEmoticon.prototype.setMessage = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINTextEmoticon.prototype.clearMessage = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINTextEmoticon.prototype.hasMessage = function() {
      return null != jspb.Message.getField(this, 3);
    };
    goog.object.extend(exports, proto);
    cc._RF.pop();
  }, {
    "google-protobuf": "google-protobuf"
  } ],
  turn_pb: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2e9delg/pVBsZmxlmvUai+Q", "turn_pb");
    "use strict";
    var jspb = require("google-protobuf");
    var goog = jspb;
    var global = Function("return this")();
    var map_field_entry_pb = require("./map_field_entry_pb.js");
    goog.exportSymbol("proto.BINTurnRequest", null, global);
    goog.exportSymbol("proto.BINTurnResponse", null, global);
    proto.BINTurnRequest = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, proto.BINTurnRequest.repeatedFields_, null);
    };
    goog.inherits(proto.BINTurnRequest, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINTurnRequest.displayName = "proto.BINTurnRequest");
    proto.BINTurnRequest.repeatedFields_ = [ 2 ];
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINTurnRequest.prototype.toObject = function(opt_includeInstance) {
        return proto.BINTurnRequest.toObject(opt_includeInstance, this);
      };
      proto.BINTurnRequest.toObject = function(includeInstance, msg) {
        var f, obj = {
          roomindex: jspb.Message.getField(msg, 1),
          argsList: jspb.Message.toObjectList(msg.getArgsList(), map_field_entry_pb.BINMapFieldEntry.toObject, includeInstance)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINTurnRequest.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINTurnRequest();
      return proto.BINTurnRequest.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINTurnRequest.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt32();
          msg.setRoomindex(value);
          break;

         case 2:
          var value = new map_field_entry_pb.BINMapFieldEntry();
          reader.readMessage(value, map_field_entry_pb.BINMapFieldEntry.deserializeBinaryFromReader);
          msg.addArgs(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINTurnRequest.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINTurnRequest.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINTurnRequest.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt32(1, f);
      f = this.getArgsList();
      f.length > 0 && writer.writeRepeatedMessage(2, f, map_field_entry_pb.BINMapFieldEntry.serializeBinaryToWriter);
    };
    proto.BINTurnRequest.prototype.getRoomindex = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINTurnRequest.prototype.setRoomindex = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINTurnRequest.prototype.clearRoomindex = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINTurnRequest.prototype.hasRoomindex = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINTurnRequest.prototype.getArgsList = function() {
      return jspb.Message.getRepeatedWrapperField(this, map_field_entry_pb.BINMapFieldEntry, 2);
    };
    proto.BINTurnRequest.prototype.setArgsList = function(value) {
      jspb.Message.setRepeatedWrapperField(this, 2, value);
    };
    proto.BINTurnRequest.prototype.addArgs = function(opt_value, opt_index) {
      return jspb.Message.addToRepeatedWrapperField(this, 2, opt_value, proto.BINMapFieldEntry, opt_index);
    };
    proto.BINTurnRequest.prototype.clearArgsList = function() {
      this.setArgsList([]);
    };
    proto.BINTurnResponse = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, proto.BINTurnResponse.repeatedFields_, null);
    };
    goog.inherits(proto.BINTurnResponse, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINTurnResponse.displayName = "proto.BINTurnResponse");
    proto.BINTurnResponse.repeatedFields_ = [ 7 ];
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINTurnResponse.prototype.toObject = function(opt_includeInstance) {
        return proto.BINTurnResponse.toObject(opt_includeInstance, this);
      };
      proto.BINTurnResponse.toObject = function(includeInstance, msg) {
        var f, obj = {
          responsecode: jspb.Message.getField(msg, 1),
          message: jspb.Message.getField(msg, 2),
          currentturnuserid: jspb.Message.getField(msg, 3),
          nextturnuserid: jspb.Message.getField(msg, 4),
          matchend: jspb.Message.getField(msg, 5),
          countdowntimer: jspb.Message.getField(msg, 6),
          argsList: jspb.Message.toObjectList(msg.getArgsList(), map_field_entry_pb.BINMapFieldEntry.toObject, includeInstance),
          zoneid: jspb.Message.getField(msg, 8)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINTurnResponse.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINTurnResponse();
      return proto.BINTurnResponse.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINTurnResponse.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readBool();
          msg.setResponsecode(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setMessage(value);
          break;

         case 3:
          var value = reader.readInt64();
          msg.setCurrentturnuserid(value);
          break;

         case 4:
          var value = reader.readInt64();
          msg.setNextturnuserid(value);
          break;

         case 5:
          var value = reader.readBool();
          msg.setMatchend(value);
          break;

         case 6:
          var value = reader.readInt32();
          msg.setCountdowntimer(value);
          break;

         case 7:
          var value = new map_field_entry_pb.BINMapFieldEntry();
          reader.readMessage(value, map_field_entry_pb.BINMapFieldEntry.deserializeBinaryFromReader);
          msg.addArgs(value);
          break;

         case 8:
          var value = reader.readInt32();
          msg.setZoneid(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINTurnResponse.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINTurnResponse.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINTurnResponse.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeBool(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeInt64(3, f);
      f = jspb.Message.getField(this, 4);
      null != f && writer.writeInt64(4, f);
      f = jspb.Message.getField(this, 5);
      null != f && writer.writeBool(5, f);
      f = jspb.Message.getField(this, 6);
      null != f && writer.writeInt32(6, f);
      f = this.getArgsList();
      f.length > 0 && writer.writeRepeatedMessage(7, f, map_field_entry_pb.BINMapFieldEntry.serializeBinaryToWriter);
      f = jspb.Message.getField(this, 8);
      null != f && writer.writeInt32(8, f);
    };
    proto.BINTurnResponse.prototype.getResponsecode = function() {
      return jspb.Message.getFieldWithDefault(this, 1, false);
    };
    proto.BINTurnResponse.prototype.setResponsecode = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINTurnResponse.prototype.clearResponsecode = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINTurnResponse.prototype.hasResponsecode = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINTurnResponse.prototype.getMessage = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINTurnResponse.prototype.setMessage = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINTurnResponse.prototype.clearMessage = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINTurnResponse.prototype.hasMessage = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINTurnResponse.prototype.getCurrentturnuserid = function() {
      return jspb.Message.getFieldWithDefault(this, 3, 0);
    };
    proto.BINTurnResponse.prototype.setCurrentturnuserid = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINTurnResponse.prototype.clearCurrentturnuserid = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINTurnResponse.prototype.hasCurrentturnuserid = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINTurnResponse.prototype.getNextturnuserid = function() {
      return jspb.Message.getFieldWithDefault(this, 4, 0);
    };
    proto.BINTurnResponse.prototype.setNextturnuserid = function(value) {
      jspb.Message.setField(this, 4, value);
    };
    proto.BINTurnResponse.prototype.clearNextturnuserid = function() {
      jspb.Message.setField(this, 4, void 0);
    };
    proto.BINTurnResponse.prototype.hasNextturnuserid = function() {
      return null != jspb.Message.getField(this, 4);
    };
    proto.BINTurnResponse.prototype.getMatchend = function() {
      return jspb.Message.getFieldWithDefault(this, 5, false);
    };
    proto.BINTurnResponse.prototype.setMatchend = function(value) {
      jspb.Message.setField(this, 5, value);
    };
    proto.BINTurnResponse.prototype.clearMatchend = function() {
      jspb.Message.setField(this, 5, void 0);
    };
    proto.BINTurnResponse.prototype.hasMatchend = function() {
      return null != jspb.Message.getField(this, 5);
    };
    proto.BINTurnResponse.prototype.getCountdowntimer = function() {
      return jspb.Message.getFieldWithDefault(this, 6, 0);
    };
    proto.BINTurnResponse.prototype.setCountdowntimer = function(value) {
      jspb.Message.setField(this, 6, value);
    };
    proto.BINTurnResponse.prototype.clearCountdowntimer = function() {
      jspb.Message.setField(this, 6, void 0);
    };
    proto.BINTurnResponse.prototype.hasCountdowntimer = function() {
      return null != jspb.Message.getField(this, 6);
    };
    proto.BINTurnResponse.prototype.getArgsList = function() {
      return jspb.Message.getRepeatedWrapperField(this, map_field_entry_pb.BINMapFieldEntry, 7);
    };
    proto.BINTurnResponse.prototype.setArgsList = function(value) {
      jspb.Message.setRepeatedWrapperField(this, 7, value);
    };
    proto.BINTurnResponse.prototype.addArgs = function(opt_value, opt_index) {
      return jspb.Message.addToRepeatedWrapperField(this, 7, opt_value, proto.BINMapFieldEntry, opt_index);
    };
    proto.BINTurnResponse.prototype.clearArgsList = function() {
      this.setArgsList([]);
    };
    proto.BINTurnResponse.prototype.getZoneid = function() {
      return jspb.Message.getFieldWithDefault(this, 8, 0);
    };
    proto.BINTurnResponse.prototype.setZoneid = function(value) {
      jspb.Message.setField(this, 8, value);
    };
    proto.BINTurnResponse.prototype.clearZoneid = function() {
      jspb.Message.setField(this, 8, void 0);
    };
    proto.BINTurnResponse.prototype.hasZoneid = function() {
      return null != jspb.Message.getField(this, 8);
    };
    goog.object.extend(exports, proto);
    cc._RF.pop();
  }, {
    "./map_field_entry_pb.js": "map_field_entry_pb",
    "google-protobuf": "google-protobuf"
  } ],
  update_money_pb: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "c22374boRJDcqYRTQntSn8/", "update_money_pb");
    "use strict";
    var jspb = require("google-protobuf");
    var goog = jspb;
    var global = Function("return this")();
    goog.exportSymbol("proto.BINMoneyBox", null, global);
    goog.exportSymbol("proto.BINUpdateMoneyResponse", null, global);
    proto.BINMoneyBox = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINMoneyBox, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINMoneyBox.displayName = "proto.BINMoneyBox");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINMoneyBox.prototype.toObject = function(opt_includeInstance) {
        return proto.BINMoneyBox.toObject(opt_includeInstance, this);
      };
      proto.BINMoneyBox.toObject = function(includeInstance, msg) {
        var f, obj = {
          userid: jspb.Message.getField(msg, 1),
          iscash: jspb.Message.getField(msg, 2),
          changemoney: jspb.Message.getField(msg, 3),
          currentmoney: jspb.Message.getField(msg, 4),
          displaychangemoney: jspb.Message.getField(msg, 5),
          reason: jspb.Message.getField(msg, 6)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINMoneyBox.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINMoneyBox();
      return proto.BINMoneyBox.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINMoneyBox.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt64();
          msg.setUserid(value);
          break;

         case 2:
          var value = reader.readBool();
          msg.setIscash(value);
          break;

         case 3:
          var value = reader.readInt64();
          msg.setChangemoney(value);
          break;

         case 4:
          var value = reader.readInt64();
          msg.setCurrentmoney(value);
          break;

         case 5:
          var value = reader.readInt64();
          msg.setDisplaychangemoney(value);
          break;

         case 6:
          var value = reader.readString();
          msg.setReason(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINMoneyBox.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINMoneyBox.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINMoneyBox.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt64(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeBool(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeInt64(3, f);
      f = jspb.Message.getField(this, 4);
      null != f && writer.writeInt64(4, f);
      f = jspb.Message.getField(this, 5);
      null != f && writer.writeInt64(5, f);
      f = jspb.Message.getField(this, 6);
      null != f && writer.writeString(6, f);
    };
    proto.BINMoneyBox.prototype.getUserid = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINMoneyBox.prototype.setUserid = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINMoneyBox.prototype.clearUserid = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINMoneyBox.prototype.hasUserid = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINMoneyBox.prototype.getIscash = function() {
      return jspb.Message.getFieldWithDefault(this, 2, false);
    };
    proto.BINMoneyBox.prototype.setIscash = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINMoneyBox.prototype.clearIscash = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINMoneyBox.prototype.hasIscash = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINMoneyBox.prototype.getChangemoney = function() {
      return jspb.Message.getFieldWithDefault(this, 3, 0);
    };
    proto.BINMoneyBox.prototype.setChangemoney = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINMoneyBox.prototype.clearChangemoney = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINMoneyBox.prototype.hasChangemoney = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINMoneyBox.prototype.getCurrentmoney = function() {
      return jspb.Message.getFieldWithDefault(this, 4, 0);
    };
    proto.BINMoneyBox.prototype.setCurrentmoney = function(value) {
      jspb.Message.setField(this, 4, value);
    };
    proto.BINMoneyBox.prototype.clearCurrentmoney = function() {
      jspb.Message.setField(this, 4, void 0);
    };
    proto.BINMoneyBox.prototype.hasCurrentmoney = function() {
      return null != jspb.Message.getField(this, 4);
    };
    proto.BINMoneyBox.prototype.getDisplaychangemoney = function() {
      return jspb.Message.getFieldWithDefault(this, 5, 0);
    };
    proto.BINMoneyBox.prototype.setDisplaychangemoney = function(value) {
      jspb.Message.setField(this, 5, value);
    };
    proto.BINMoneyBox.prototype.clearDisplaychangemoney = function() {
      jspb.Message.setField(this, 5, void 0);
    };
    proto.BINMoneyBox.prototype.hasDisplaychangemoney = function() {
      return null != jspb.Message.getField(this, 5);
    };
    proto.BINMoneyBox.prototype.getReason = function() {
      return jspb.Message.getFieldWithDefault(this, 6, "");
    };
    proto.BINMoneyBox.prototype.setReason = function(value) {
      jspb.Message.setField(this, 6, value);
    };
    proto.BINMoneyBox.prototype.clearReason = function() {
      jspb.Message.setField(this, 6, void 0);
    };
    proto.BINMoneyBox.prototype.hasReason = function() {
      return null != jspb.Message.getField(this, 6);
    };
    proto.BINUpdateMoneyResponse = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, proto.BINUpdateMoneyResponse.repeatedFields_, null);
    };
    goog.inherits(proto.BINUpdateMoneyResponse, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINUpdateMoneyResponse.displayName = "proto.BINUpdateMoneyResponse");
    proto.BINUpdateMoneyResponse.repeatedFields_ = [ 3 ];
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINUpdateMoneyResponse.prototype.toObject = function(opt_includeInstance) {
        return proto.BINUpdateMoneyResponse.toObject(opt_includeInstance, this);
      };
      proto.BINUpdateMoneyResponse.toObject = function(includeInstance, msg) {
        var f, obj = {
          responsecode: jspb.Message.getField(msg, 1),
          message: jspb.Message.getField(msg, 2),
          moneyboxesList: jspb.Message.toObjectList(msg.getMoneyboxesList(), proto.BINMoneyBox.toObject, includeInstance),
          zoneid: jspb.Message.getField(msg, 4)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINUpdateMoneyResponse.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINUpdateMoneyResponse();
      return proto.BINUpdateMoneyResponse.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINUpdateMoneyResponse.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readBool();
          msg.setResponsecode(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setMessage(value);
          break;

         case 3:
          var value = new proto.BINMoneyBox();
          reader.readMessage(value, proto.BINMoneyBox.deserializeBinaryFromReader);
          msg.addMoneyboxes(value);
          break;

         case 4:
          var value = reader.readInt32();
          msg.setZoneid(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINUpdateMoneyResponse.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINUpdateMoneyResponse.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINUpdateMoneyResponse.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeBool(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = this.getMoneyboxesList();
      f.length > 0 && writer.writeRepeatedMessage(3, f, proto.BINMoneyBox.serializeBinaryToWriter);
      f = jspb.Message.getField(this, 4);
      null != f && writer.writeInt32(4, f);
    };
    proto.BINUpdateMoneyResponse.prototype.getResponsecode = function() {
      return jspb.Message.getFieldWithDefault(this, 1, false);
    };
    proto.BINUpdateMoneyResponse.prototype.setResponsecode = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINUpdateMoneyResponse.prototype.clearResponsecode = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINUpdateMoneyResponse.prototype.hasResponsecode = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINUpdateMoneyResponse.prototype.getMessage = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINUpdateMoneyResponse.prototype.setMessage = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINUpdateMoneyResponse.prototype.clearMessage = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINUpdateMoneyResponse.prototype.hasMessage = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINUpdateMoneyResponse.prototype.getMoneyboxesList = function() {
      return jspb.Message.getRepeatedWrapperField(this, proto.BINMoneyBox, 3);
    };
    proto.BINUpdateMoneyResponse.prototype.setMoneyboxesList = function(value) {
      jspb.Message.setRepeatedWrapperField(this, 3, value);
    };
    proto.BINUpdateMoneyResponse.prototype.addMoneyboxes = function(opt_value, opt_index) {
      return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.BINMoneyBox, opt_index);
    };
    proto.BINUpdateMoneyResponse.prototype.clearMoneyboxesList = function() {
      this.setMoneyboxesList([]);
    };
    proto.BINUpdateMoneyResponse.prototype.getZoneid = function() {
      return jspb.Message.getFieldWithDefault(this, 4, 0);
    };
    proto.BINUpdateMoneyResponse.prototype.setZoneid = function(value) {
      jspb.Message.setField(this, 4, value);
    };
    proto.BINUpdateMoneyResponse.prototype.clearZoneid = function() {
      jspb.Message.setField(this, 4, void 0);
    };
    proto.BINUpdateMoneyResponse.prototype.hasZoneid = function() {
      return null != jspb.Message.getField(this, 4);
    };
    goog.object.extend(exports, proto);
    cc._RF.pop();
  }, {
    "google-protobuf": "google-protobuf"
  } ],
  user_info_pb: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f09aep2cblFwYv5I9oyg6+t", "user_info_pb");
    "use strict";
    var jspb = require("google-protobuf");
    var goog = jspb;
    var global = Function("return this")();
    var level_pb = require("./level_pb.js");
    goog.exportSymbol("proto.BINUserInfo", null, global);
    goog.exportSymbol("proto.BINUserSetting", null, global);
    proto.BINUserInfo = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINUserInfo, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINUserInfo.displayName = "proto.BINUserInfo");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINUserInfo.prototype.toObject = function(opt_includeInstance) {
        return proto.BINUserInfo.toObject(opt_includeInstance, this);
      };
      proto.BINUserInfo.toObject = function(includeInstance, msg) {
        var f, obj = {
          userid: jspb.Message.getField(msg, 1),
          username: jspb.Message.getField(msg, 2),
          displayname: jspb.Message.getField(msg, 3),
          avatarid: jspb.Message.getField(msg, 4),
          sex: jspb.Message.getField(msg, 5),
          age: jspb.Message.getField(msg, 6),
          level: (f = msg.getLevel()) && level_pb.BINLevel.toObject(includeInstance, f),
          medal: (f = msg.getMedal()) && level_pb.BINMedal.toObject(includeInstance, f),
          trustedindex: jspb.Message.getField(msg, 9),
          exp: jspb.Message.getField(msg, 10),
          cash: jspb.Message.getField(msg, 11),
          gold: jspb.Message.getField(msg, 12),
          totalmatch: jspb.Message.getField(msg, 13),
          totalwin: jspb.Message.getField(msg, 14),
          totalcashexchanged: jspb.Message.getField(msg, 15),
          totalmoneyexchanged: jspb.Message.getField(msg, 16),
          totalmoneycharged: jspb.Message.getField(msg, 17),
          lastlogintime: jspb.Message.getField(msg, 18),
          isonline: jspb.Message.getField(msg, 19),
          usertype: jspb.Message.getField(msg, 20),
          email: jspb.Message.getField(msg, 21),
          mobile: jspb.Message.getField(msg, 22),
          identity: jspb.Message.getField(msg, 23),
          accountverified: jspb.Message.getField(msg, 24),
          disablecashtransaction: jspb.Message.getField(msg, 25),
          securitykeyset: jspb.Message.getField(msg, 26),
          cashlock: jspb.Message.getField(msg, 27),
          goldlock: jspb.Message.getField(msg, 28),
          viplevel: (f = msg.getViplevel()) && level_pb.BINVipLevel.toObject(includeInstance, f),
          vippoint: jspb.Message.getField(msg, 30),
          remoteip: jspb.Message.getField(msg, 31)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINUserInfo.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINUserInfo();
      return proto.BINUserInfo.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINUserInfo.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt64();
          msg.setUserid(value);
          break;

         case 2:
          var value = reader.readString();
          msg.setUsername(value);
          break;

         case 3:
          var value = reader.readString();
          msg.setDisplayname(value);
          break;

         case 4:
          var value = reader.readInt32();
          msg.setAvatarid(value);
          break;

         case 5:
          var value = reader.readInt32();
          msg.setSex(value);
          break;

         case 6:
          var value = reader.readInt32();
          msg.setAge(value);
          break;

         case 7:
          var value = new level_pb.BINLevel();
          reader.readMessage(value, level_pb.BINLevel.deserializeBinaryFromReader);
          msg.setLevel(value);
          break;

         case 8:
          var value = new level_pb.BINMedal();
          reader.readMessage(value, level_pb.BINMedal.deserializeBinaryFromReader);
          msg.setMedal(value);
          break;

         case 9:
          var value = reader.readInt64();
          msg.setTrustedindex(value);
          break;

         case 10:
          var value = reader.readInt64();
          msg.setExp(value);
          break;

         case 11:
          var value = reader.readInt64();
          msg.setCash(value);
          break;

         case 12:
          var value = reader.readInt64();
          msg.setGold(value);
          break;

         case 13:
          var value = reader.readInt32();
          msg.setTotalmatch(value);
          break;

         case 14:
          var value = reader.readInt32();
          msg.setTotalwin(value);
          break;

         case 15:
          var value = reader.readInt64();
          msg.setTotalcashexchanged(value);
          break;

         case 16:
          var value = reader.readInt64();
          msg.setTotalmoneyexchanged(value);
          break;

         case 17:
          var value = reader.readInt64();
          msg.setTotalmoneycharged(value);
          break;

         case 18:
          var value = reader.readInt64();
          msg.setLastlogintime(value);
          break;

         case 19:
          var value = reader.readBool();
          msg.setIsonline(value);
          break;

         case 20:
          var value = reader.readInt32();
          msg.setUsertype(value);
          break;

         case 21:
          var value = reader.readString();
          msg.setEmail(value);
          break;

         case 22:
          var value = reader.readString();
          msg.setMobile(value);
          break;

         case 23:
          var value = reader.readString();
          msg.setIdentity(value);
          break;

         case 24:
          var value = reader.readBool();
          msg.setAccountverified(value);
          break;

         case 25:
          var value = reader.readBool();
          msg.setDisablecashtransaction(value);
          break;

         case 26:
          var value = reader.readBool();
          msg.setSecuritykeyset(value);
          break;

         case 27:
          var value = reader.readInt64();
          msg.setCashlock(value);
          break;

         case 28:
          var value = reader.readInt64();
          msg.setGoldlock(value);
          break;

         case 29:
          var value = new level_pb.BINVipLevel();
          reader.readMessage(value, level_pb.BINVipLevel.deserializeBinaryFromReader);
          msg.setViplevel(value);
          break;

         case 30:
          var value = reader.readInt64();
          msg.setVippoint(value);
          break;

         case 31:
          var value = reader.readString();
          msg.setRemoteip(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINUserInfo.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINUserInfo.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINUserInfo.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt64(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeString(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeString(3, f);
      f = jspb.Message.getField(this, 4);
      null != f && writer.writeInt32(4, f);
      f = jspb.Message.getField(this, 5);
      null != f && writer.writeInt32(5, f);
      f = jspb.Message.getField(this, 6);
      null != f && writer.writeInt32(6, f);
      f = this.getLevel();
      null != f && writer.writeMessage(7, f, level_pb.BINLevel.serializeBinaryToWriter);
      f = this.getMedal();
      null != f && writer.writeMessage(8, f, level_pb.BINMedal.serializeBinaryToWriter);
      f = jspb.Message.getField(this, 9);
      null != f && writer.writeInt64(9, f);
      f = jspb.Message.getField(this, 10);
      null != f && writer.writeInt64(10, f);
      f = jspb.Message.getField(this, 11);
      null != f && writer.writeInt64(11, f);
      f = jspb.Message.getField(this, 12);
      null != f && writer.writeInt64(12, f);
      f = jspb.Message.getField(this, 13);
      null != f && writer.writeInt32(13, f);
      f = jspb.Message.getField(this, 14);
      null != f && writer.writeInt32(14, f);
      f = jspb.Message.getField(this, 15);
      null != f && writer.writeInt64(15, f);
      f = jspb.Message.getField(this, 16);
      null != f && writer.writeInt64(16, f);
      f = jspb.Message.getField(this, 17);
      null != f && writer.writeInt64(17, f);
      f = jspb.Message.getField(this, 18);
      null != f && writer.writeInt64(18, f);
      f = jspb.Message.getField(this, 19);
      null != f && writer.writeBool(19, f);
      f = jspb.Message.getField(this, 20);
      null != f && writer.writeInt32(20, f);
      f = jspb.Message.getField(this, 21);
      null != f && writer.writeString(21, f);
      f = jspb.Message.getField(this, 22);
      null != f && writer.writeString(22, f);
      f = jspb.Message.getField(this, 23);
      null != f && writer.writeString(23, f);
      f = jspb.Message.getField(this, 24);
      null != f && writer.writeBool(24, f);
      f = jspb.Message.getField(this, 25);
      null != f && writer.writeBool(25, f);
      f = jspb.Message.getField(this, 26);
      null != f && writer.writeBool(26, f);
      f = jspb.Message.getField(this, 27);
      null != f && writer.writeInt64(27, f);
      f = jspb.Message.getField(this, 28);
      null != f && writer.writeInt64(28, f);
      f = this.getViplevel();
      null != f && writer.writeMessage(29, f, level_pb.BINVipLevel.serializeBinaryToWriter);
      f = jspb.Message.getField(this, 30);
      null != f && writer.writeInt64(30, f);
      f = jspb.Message.getField(this, 31);
      null != f && writer.writeString(31, f);
    };
    proto.BINUserInfo.prototype.getUserid = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINUserInfo.prototype.setUserid = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINUserInfo.prototype.clearUserid = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINUserInfo.prototype.hasUserid = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINUserInfo.prototype.getUsername = function() {
      return jspb.Message.getFieldWithDefault(this, 2, "");
    };
    proto.BINUserInfo.prototype.setUsername = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINUserInfo.prototype.clearUsername = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINUserInfo.prototype.hasUsername = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINUserInfo.prototype.getDisplayname = function() {
      return jspb.Message.getFieldWithDefault(this, 3, "");
    };
    proto.BINUserInfo.prototype.setDisplayname = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINUserInfo.prototype.clearDisplayname = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINUserInfo.prototype.hasDisplayname = function() {
      return null != jspb.Message.getField(this, 3);
    };
    proto.BINUserInfo.prototype.getAvatarid = function() {
      return jspb.Message.getFieldWithDefault(this, 4, 0);
    };
    proto.BINUserInfo.prototype.setAvatarid = function(value) {
      jspb.Message.setField(this, 4, value);
    };
    proto.BINUserInfo.prototype.clearAvatarid = function() {
      jspb.Message.setField(this, 4, void 0);
    };
    proto.BINUserInfo.prototype.hasAvatarid = function() {
      return null != jspb.Message.getField(this, 4);
    };
    proto.BINUserInfo.prototype.getSex = function() {
      return jspb.Message.getFieldWithDefault(this, 5, 0);
    };
    proto.BINUserInfo.prototype.setSex = function(value) {
      jspb.Message.setField(this, 5, value);
    };
    proto.BINUserInfo.prototype.clearSex = function() {
      jspb.Message.setField(this, 5, void 0);
    };
    proto.BINUserInfo.prototype.hasSex = function() {
      return null != jspb.Message.getField(this, 5);
    };
    proto.BINUserInfo.prototype.getAge = function() {
      return jspb.Message.getFieldWithDefault(this, 6, 0);
    };
    proto.BINUserInfo.prototype.setAge = function(value) {
      jspb.Message.setField(this, 6, value);
    };
    proto.BINUserInfo.prototype.clearAge = function() {
      jspb.Message.setField(this, 6, void 0);
    };
    proto.BINUserInfo.prototype.hasAge = function() {
      return null != jspb.Message.getField(this, 6);
    };
    proto.BINUserInfo.prototype.getLevel = function() {
      return jspb.Message.getWrapperField(this, level_pb.BINLevel, 7);
    };
    proto.BINUserInfo.prototype.setLevel = function(value) {
      jspb.Message.setWrapperField(this, 7, value);
    };
    proto.BINUserInfo.prototype.clearLevel = function() {
      this.setLevel(void 0);
    };
    proto.BINUserInfo.prototype.hasLevel = function() {
      return null != jspb.Message.getField(this, 7);
    };
    proto.BINUserInfo.prototype.getMedal = function() {
      return jspb.Message.getWrapperField(this, level_pb.BINMedal, 8);
    };
    proto.BINUserInfo.prototype.setMedal = function(value) {
      jspb.Message.setWrapperField(this, 8, value);
    };
    proto.BINUserInfo.prototype.clearMedal = function() {
      this.setMedal(void 0);
    };
    proto.BINUserInfo.prototype.hasMedal = function() {
      return null != jspb.Message.getField(this, 8);
    };
    proto.BINUserInfo.prototype.getTrustedindex = function() {
      return jspb.Message.getFieldWithDefault(this, 9, 0);
    };
    proto.BINUserInfo.prototype.setTrustedindex = function(value) {
      jspb.Message.setField(this, 9, value);
    };
    proto.BINUserInfo.prototype.clearTrustedindex = function() {
      jspb.Message.setField(this, 9, void 0);
    };
    proto.BINUserInfo.prototype.hasTrustedindex = function() {
      return null != jspb.Message.getField(this, 9);
    };
    proto.BINUserInfo.prototype.getExp = function() {
      return jspb.Message.getFieldWithDefault(this, 10, 0);
    };
    proto.BINUserInfo.prototype.setExp = function(value) {
      jspb.Message.setField(this, 10, value);
    };
    proto.BINUserInfo.prototype.clearExp = function() {
      jspb.Message.setField(this, 10, void 0);
    };
    proto.BINUserInfo.prototype.hasExp = function() {
      return null != jspb.Message.getField(this, 10);
    };
    proto.BINUserInfo.prototype.getCash = function() {
      return jspb.Message.getFieldWithDefault(this, 11, 0);
    };
    proto.BINUserInfo.prototype.setCash = function(value) {
      jspb.Message.setField(this, 11, value);
    };
    proto.BINUserInfo.prototype.clearCash = function() {
      jspb.Message.setField(this, 11, void 0);
    };
    proto.BINUserInfo.prototype.hasCash = function() {
      return null != jspb.Message.getField(this, 11);
    };
    proto.BINUserInfo.prototype.getGold = function() {
      return jspb.Message.getFieldWithDefault(this, 12, 0);
    };
    proto.BINUserInfo.prototype.setGold = function(value) {
      jspb.Message.setField(this, 12, value);
    };
    proto.BINUserInfo.prototype.clearGold = function() {
      jspb.Message.setField(this, 12, void 0);
    };
    proto.BINUserInfo.prototype.hasGold = function() {
      return null != jspb.Message.getField(this, 12);
    };
    proto.BINUserInfo.prototype.getTotalmatch = function() {
      return jspb.Message.getFieldWithDefault(this, 13, 0);
    };
    proto.BINUserInfo.prototype.setTotalmatch = function(value) {
      jspb.Message.setField(this, 13, value);
    };
    proto.BINUserInfo.prototype.clearTotalmatch = function() {
      jspb.Message.setField(this, 13, void 0);
    };
    proto.BINUserInfo.prototype.hasTotalmatch = function() {
      return null != jspb.Message.getField(this, 13);
    };
    proto.BINUserInfo.prototype.getTotalwin = function() {
      return jspb.Message.getFieldWithDefault(this, 14, 0);
    };
    proto.BINUserInfo.prototype.setTotalwin = function(value) {
      jspb.Message.setField(this, 14, value);
    };
    proto.BINUserInfo.prototype.clearTotalwin = function() {
      jspb.Message.setField(this, 14, void 0);
    };
    proto.BINUserInfo.prototype.hasTotalwin = function() {
      return null != jspb.Message.getField(this, 14);
    };
    proto.BINUserInfo.prototype.getTotalcashexchanged = function() {
      return jspb.Message.getFieldWithDefault(this, 15, 0);
    };
    proto.BINUserInfo.prototype.setTotalcashexchanged = function(value) {
      jspb.Message.setField(this, 15, value);
    };
    proto.BINUserInfo.prototype.clearTotalcashexchanged = function() {
      jspb.Message.setField(this, 15, void 0);
    };
    proto.BINUserInfo.prototype.hasTotalcashexchanged = function() {
      return null != jspb.Message.getField(this, 15);
    };
    proto.BINUserInfo.prototype.getTotalmoneyexchanged = function() {
      return jspb.Message.getFieldWithDefault(this, 16, 0);
    };
    proto.BINUserInfo.prototype.setTotalmoneyexchanged = function(value) {
      jspb.Message.setField(this, 16, value);
    };
    proto.BINUserInfo.prototype.clearTotalmoneyexchanged = function() {
      jspb.Message.setField(this, 16, void 0);
    };
    proto.BINUserInfo.prototype.hasTotalmoneyexchanged = function() {
      return null != jspb.Message.getField(this, 16);
    };
    proto.BINUserInfo.prototype.getTotalmoneycharged = function() {
      return jspb.Message.getFieldWithDefault(this, 17, 0);
    };
    proto.BINUserInfo.prototype.setTotalmoneycharged = function(value) {
      jspb.Message.setField(this, 17, value);
    };
    proto.BINUserInfo.prototype.clearTotalmoneycharged = function() {
      jspb.Message.setField(this, 17, void 0);
    };
    proto.BINUserInfo.prototype.hasTotalmoneycharged = function() {
      return null != jspb.Message.getField(this, 17);
    };
    proto.BINUserInfo.prototype.getLastlogintime = function() {
      return jspb.Message.getFieldWithDefault(this, 18, 0);
    };
    proto.BINUserInfo.prototype.setLastlogintime = function(value) {
      jspb.Message.setField(this, 18, value);
    };
    proto.BINUserInfo.prototype.clearLastlogintime = function() {
      jspb.Message.setField(this, 18, void 0);
    };
    proto.BINUserInfo.prototype.hasLastlogintime = function() {
      return null != jspb.Message.getField(this, 18);
    };
    proto.BINUserInfo.prototype.getIsonline = function() {
      return jspb.Message.getFieldWithDefault(this, 19, false);
    };
    proto.BINUserInfo.prototype.setIsonline = function(value) {
      jspb.Message.setField(this, 19, value);
    };
    proto.BINUserInfo.prototype.clearIsonline = function() {
      jspb.Message.setField(this, 19, void 0);
    };
    proto.BINUserInfo.prototype.hasIsonline = function() {
      return null != jspb.Message.getField(this, 19);
    };
    proto.BINUserInfo.prototype.getUsertype = function() {
      return jspb.Message.getFieldWithDefault(this, 20, 0);
    };
    proto.BINUserInfo.prototype.setUsertype = function(value) {
      jspb.Message.setField(this, 20, value);
    };
    proto.BINUserInfo.prototype.clearUsertype = function() {
      jspb.Message.setField(this, 20, void 0);
    };
    proto.BINUserInfo.prototype.hasUsertype = function() {
      return null != jspb.Message.getField(this, 20);
    };
    proto.BINUserInfo.prototype.getEmail = function() {
      return jspb.Message.getFieldWithDefault(this, 21, "");
    };
    proto.BINUserInfo.prototype.setEmail = function(value) {
      jspb.Message.setField(this, 21, value);
    };
    proto.BINUserInfo.prototype.clearEmail = function() {
      jspb.Message.setField(this, 21, void 0);
    };
    proto.BINUserInfo.prototype.hasEmail = function() {
      return null != jspb.Message.getField(this, 21);
    };
    proto.BINUserInfo.prototype.getMobile = function() {
      return jspb.Message.getFieldWithDefault(this, 22, "");
    };
    proto.BINUserInfo.prototype.setMobile = function(value) {
      jspb.Message.setField(this, 22, value);
    };
    proto.BINUserInfo.prototype.clearMobile = function() {
      jspb.Message.setField(this, 22, void 0);
    };
    proto.BINUserInfo.prototype.hasMobile = function() {
      return null != jspb.Message.getField(this, 22);
    };
    proto.BINUserInfo.prototype.getIdentity = function() {
      return jspb.Message.getFieldWithDefault(this, 23, "");
    };
    proto.BINUserInfo.prototype.setIdentity = function(value) {
      jspb.Message.setField(this, 23, value);
    };
    proto.BINUserInfo.prototype.clearIdentity = function() {
      jspb.Message.setField(this, 23, void 0);
    };
    proto.BINUserInfo.prototype.hasIdentity = function() {
      return null != jspb.Message.getField(this, 23);
    };
    proto.BINUserInfo.prototype.getAccountverified = function() {
      return jspb.Message.getFieldWithDefault(this, 24, false);
    };
    proto.BINUserInfo.prototype.setAccountverified = function(value) {
      jspb.Message.setField(this, 24, value);
    };
    proto.BINUserInfo.prototype.clearAccountverified = function() {
      jspb.Message.setField(this, 24, void 0);
    };
    proto.BINUserInfo.prototype.hasAccountverified = function() {
      return null != jspb.Message.getField(this, 24);
    };
    proto.BINUserInfo.prototype.getDisablecashtransaction = function() {
      return jspb.Message.getFieldWithDefault(this, 25, false);
    };
    proto.BINUserInfo.prototype.setDisablecashtransaction = function(value) {
      jspb.Message.setField(this, 25, value);
    };
    proto.BINUserInfo.prototype.clearDisablecashtransaction = function() {
      jspb.Message.setField(this, 25, void 0);
    };
    proto.BINUserInfo.prototype.hasDisablecashtransaction = function() {
      return null != jspb.Message.getField(this, 25);
    };
    proto.BINUserInfo.prototype.getSecuritykeyset = function() {
      return jspb.Message.getFieldWithDefault(this, 26, false);
    };
    proto.BINUserInfo.prototype.setSecuritykeyset = function(value) {
      jspb.Message.setField(this, 26, value);
    };
    proto.BINUserInfo.prototype.clearSecuritykeyset = function() {
      jspb.Message.setField(this, 26, void 0);
    };
    proto.BINUserInfo.prototype.hasSecuritykeyset = function() {
      return null != jspb.Message.getField(this, 26);
    };
    proto.BINUserInfo.prototype.getCashlock = function() {
      return jspb.Message.getFieldWithDefault(this, 27, 0);
    };
    proto.BINUserInfo.prototype.setCashlock = function(value) {
      jspb.Message.setField(this, 27, value);
    };
    proto.BINUserInfo.prototype.clearCashlock = function() {
      jspb.Message.setField(this, 27, void 0);
    };
    proto.BINUserInfo.prototype.hasCashlock = function() {
      return null != jspb.Message.getField(this, 27);
    };
    proto.BINUserInfo.prototype.getGoldlock = function() {
      return jspb.Message.getFieldWithDefault(this, 28, 0);
    };
    proto.BINUserInfo.prototype.setGoldlock = function(value) {
      jspb.Message.setField(this, 28, value);
    };
    proto.BINUserInfo.prototype.clearGoldlock = function() {
      jspb.Message.setField(this, 28, void 0);
    };
    proto.BINUserInfo.prototype.hasGoldlock = function() {
      return null != jspb.Message.getField(this, 28);
    };
    proto.BINUserInfo.prototype.getViplevel = function() {
      return jspb.Message.getWrapperField(this, level_pb.BINVipLevel, 29);
    };
    proto.BINUserInfo.prototype.setViplevel = function(value) {
      jspb.Message.setWrapperField(this, 29, value);
    };
    proto.BINUserInfo.prototype.clearViplevel = function() {
      this.setViplevel(void 0);
    };
    proto.BINUserInfo.prototype.hasViplevel = function() {
      return null != jspb.Message.getField(this, 29);
    };
    proto.BINUserInfo.prototype.getVippoint = function() {
      return jspb.Message.getFieldWithDefault(this, 30, 0);
    };
    proto.BINUserInfo.prototype.setVippoint = function(value) {
      jspb.Message.setField(this, 30, value);
    };
    proto.BINUserInfo.prototype.clearVippoint = function() {
      jspb.Message.setField(this, 30, void 0);
    };
    proto.BINUserInfo.prototype.hasVippoint = function() {
      return null != jspb.Message.getField(this, 30);
    };
    proto.BINUserInfo.prototype.getRemoteip = function() {
      return jspb.Message.getFieldWithDefault(this, 31, "");
    };
    proto.BINUserInfo.prototype.setRemoteip = function(value) {
      jspb.Message.setField(this, 31, value);
    };
    proto.BINUserInfo.prototype.clearRemoteip = function() {
      jspb.Message.setField(this, 31, void 0);
    };
    proto.BINUserInfo.prototype.hasRemoteip = function() {
      return null != jspb.Message.getField(this, 31);
    };
    proto.BINUserSetting = function(opt_data) {
      jspb.Message.initialize(this, opt_data, 0, -1, null, null);
    };
    goog.inherits(proto.BINUserSetting, jspb.Message);
    goog.DEBUG && !COMPILED && (proto.BINUserSetting.displayName = "proto.BINUserSetting");
    if (jspb.Message.GENERATE_TO_OBJECT) {
      proto.BINUserSetting.prototype.toObject = function(opt_includeInstance) {
        return proto.BINUserSetting.toObject(opt_includeInstance, this);
      };
      proto.BINUserSetting.toObject = function(includeInstance, msg) {
        var f, obj = {
          userid: jspb.Message.getField(msg, 1),
          autoready: jspb.Message.getField(msg, 2),
          autodenyinvitation: jspb.Message.getField(msg, 3)
        };
        includeInstance && (obj.$jspbMessageInstance = msg);
        return obj;
      };
    }
    proto.BINUserSetting.deserializeBinary = function(bytes) {
      var reader = new jspb.BinaryReader(bytes);
      var msg = new proto.BINUserSetting();
      return proto.BINUserSetting.deserializeBinaryFromReader(msg, reader);
    };
    proto.BINUserSetting.deserializeBinaryFromReader = function(msg, reader) {
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        var field = reader.getFieldNumber();
        switch (field) {
         case 1:
          var value = reader.readInt64();
          msg.setUserid(value);
          break;

         case 2:
          var value = reader.readBool();
          msg.setAutoready(value);
          break;

         case 3:
          var value = reader.readBool();
          msg.setAutodenyinvitation(value);
          break;

         default:
          reader.skipField();
        }
      }
      return msg;
    };
    proto.BINUserSetting.serializeBinaryToWriter = function(message, writer) {
      message.serializeBinaryToWriter(writer);
    };
    proto.BINUserSetting.prototype.serializeBinary = function() {
      var writer = new jspb.BinaryWriter();
      this.serializeBinaryToWriter(writer);
      return writer.getResultBuffer();
    };
    proto.BINUserSetting.prototype.serializeBinaryToWriter = function(writer) {
      var f = void 0;
      f = jspb.Message.getField(this, 1);
      null != f && writer.writeInt64(1, f);
      f = jspb.Message.getField(this, 2);
      null != f && writer.writeBool(2, f);
      f = jspb.Message.getField(this, 3);
      null != f && writer.writeBool(3, f);
    };
    proto.BINUserSetting.prototype.getUserid = function() {
      return jspb.Message.getFieldWithDefault(this, 1, 0);
    };
    proto.BINUserSetting.prototype.setUserid = function(value) {
      jspb.Message.setField(this, 1, value);
    };
    proto.BINUserSetting.prototype.clearUserid = function() {
      jspb.Message.setField(this, 1, void 0);
    };
    proto.BINUserSetting.prototype.hasUserid = function() {
      return null != jspb.Message.getField(this, 1);
    };
    proto.BINUserSetting.prototype.getAutoready = function() {
      return jspb.Message.getFieldWithDefault(this, 2, false);
    };
    proto.BINUserSetting.prototype.setAutoready = function(value) {
      jspb.Message.setField(this, 2, value);
    };
    proto.BINUserSetting.prototype.clearAutoready = function() {
      jspb.Message.setField(this, 2, void 0);
    };
    proto.BINUserSetting.prototype.hasAutoready = function() {
      return null != jspb.Message.getField(this, 2);
    };
    proto.BINUserSetting.prototype.getAutodenyinvitation = function() {
      return jspb.Message.getFieldWithDefault(this, 3, false);
    };
    proto.BINUserSetting.prototype.setAutodenyinvitation = function(value) {
      jspb.Message.setField(this, 3, value);
    };
    proto.BINUserSetting.prototype.clearAutodenyinvitation = function() {
      jspb.Message.setField(this, 3, void 0);
    };
    proto.BINUserSetting.prototype.hasAutodenyinvitation = function() {
      return null != jspb.Message.getField(this, 3);
    };
    goog.object.extend(exports, proto);
    cc._RF.pop();
  }, {
    "./level_pb.js": "level_pb",
    "google-protobuf": "google-protobuf"
  } ],
  viewCell: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "d1ecaWAeW5DLbK1xPGJ0WPn", "viewCell");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        tableView: {
          default: null,
          visible: false
        },
        _isCellInit_: false,
        _longClicked_: false
      },
      _cellAddMethodToNode_: function _cellAddMethodToNode_() {
        this.node.clicked = this.clicked.bind(this);
      },
      _cellAddTouch_: function _cellAddTouch_() {
        this.node.on(cc.Node.EventType.TOUCH_START, function(event) {
          if (true === this.node.active && 0 !== this.node.opacity && !this._longClicked_) {
            this._longClicked_ = true;
            this.scheduleOnce(this._longClicked, 1.5);
          }
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, function() {
          if (this._longClicked_) {
            this._longClicked_ = false;
            this.unschedule(this._longClicked);
          }
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_END, function() {
          this.clicked();
          if (this._longClicked_) {
            this._longClicked_ = false;
            this.unschedule(this._longClicked);
          }
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, function() {
          if (this._longClicked_) {
            this._longClicked_ = false;
            this.unschedule(this._longClicked);
          }
        }, this);
      },
      _cellInit_: function _cellInit_(tableView) {
        this.tableView = tableView;
        if (!this._isCellInit_) {
          this._cellAddMethodToNode_();
          this._cellAddTouch_();
          this._isCellInit_ = true;
        }
      },
      _longClicked: function _longClicked() {
        this._longClicked_ = false;
        this.node.emit(cc.Node.EventType.TOUCH_CANCEL);
        this.longClicked();
      },
      longClicked: function longClicked() {},
      clicked: function clicked() {},
      init: function init(index, data, reload, group) {
        cc.log("data =", data);
      }
    });
    cc._RF.pop();
  }, {} ]
}, {}, [ "Nohu", "Card", "CardItem", "Types", "NetworkManager", "ZipUtils", "base64", "enter_room_pb", "enter_zone_pb", "exit_room_pb", "filter_room_pb", "google-protobuf", "gzip", "initialize_pb", "jar_pb", "level_pb", "login_pb", "logout_pb", "lookup_game_history_pb", "lookup_room_pb", "map_field_entry_pb", "match_begin_pb", "match_end_pb", "notification_pb", "ping_pb", "player_pb", "purchase_money_pb", "register_pb", "text_emoticon_pb", "turn_pb", "update_money_pb", "user_info_pb", "ChargeItem", "GameItem", "GameList", "HistoryItem", "ProviderItem", "UserInfo", "cellPromotion", "labelCell", "tableView", "viewCell", "CommonPopup", "Popup", "PopupIngameItem", "PopupLeftItem", "PopupSetting", "BaseScene", "Intro", "Lobby", "UILobby", "Login", "minipoker", "Register", "TableItem", "TableList", "PopupTaiXiu", "BaCayScripts", "MButton", "ToastScripts" ]);