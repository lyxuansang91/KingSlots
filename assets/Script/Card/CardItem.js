var Types = require('Types');
cc.Class({
    extends: cc.Component,

    properties: {
        point: cc.Label,
        suit: cc.Sprite,
        mainPic: cc.Sprite,
        cardBG: cc.Sprite,
        // resources
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

    // use this for initialization
    onLoad: function () {
        if(Common.getZoneId() !== Config.TAG_GAME_ITEM.MINI_BACAY) {
            this.node.getComponent(cc.Sprite).spriteFrame = null;
        }
    },

    init: function () {
        this.texBackBG = this.texFrontBG;
        this.mainPic.node.active = false;
        this.point.node.active = false;
        this.point.node.active = false;
        this.suit.node.active = null;

    },
    replaceCard: function (cardValue) {
        // cc.log("cardValue =", cardValue);
        var pointValue = CardType.getPoint(cardValue);
        var suitValue = CardType.getSuit(cardValue);

        var card = new Types.Card(pointValue, suitValue);

        var isFaceCard = card.point > 10;

        if (isFaceCard) {
            this.mainPic.spriteFrame = this.texFaces[card.point - 10 - 1];
        }
        else {
            this.mainPic.spriteFrame = this.texSuitBig[card.suit];
        }

        // for jsb
        this.point.string = card.pointName;

        if (card.isRedSuit) {
            this.point.node.color = this.redTextColor;
        }
        else {
            this.point.node.color = this.blackTextColor;
        }

        this.suit.spriteFrame = this.texSuitSmall[card.suit];

    },
    setBg: function (isBoolean) {
        if(isBoolean === false){
            this.node.getComponent(cc.Sprite).spriteFrame = null;
        }
    }
});
