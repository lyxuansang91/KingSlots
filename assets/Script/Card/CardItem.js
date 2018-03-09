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
        },
        texSuitBigPoker: {
            default: [],
            type: cc.SpriteFrame
        },
        texSuitSmallPoker: {
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
        var pointValue = this.getPoint(cardValue);
        var suitValue = this.getSuit(cardValue);

        var card = new Types.Card(pointValue, suitValue, Common.getZoneId());

        var isFaceCard = false;
        if(Common.getZoneId() === Config.TAG_GAME_ITEM.MINI_POKER){
            if(card.point > 9 && card.point <= 12){
                isFaceCard = true;
            }
        } else {
            if(card.point > 10){
                isFaceCard = true;
            }
        }

        if (isFaceCard) {
            if(Common.getZoneId() === Config.TAG_GAME_ITEM.MINI_POKER){
                this.mainPic.spriteFrame = this.texFaces[card.point - 10];
            } else {
                this.mainPic.spriteFrame = this.texFaces[card.point - 10 - 1];
            }
        }
        else {
            if(Common.getZoneId() === Config.TAG_GAME_ITEM.MINI_POKER){
                this.mainPic.spriteFrame = this.texSuitBigPoker[card.suit];
            } else {
                this.mainPic.spriteFrame = this.texSuitBig[card.suit];
            }
        }

        // for jsb
        this.point.string = card.pointName;

        if (card.isRedSuit) {
            this.point.node.color = this.redTextColor;
        }
        else {
            this.point.node.color = this.blackTextColor;
        }
        if(Common.getZoneId() === Config.TAG_GAME_ITEM.MINI_POKER){
            this.suit.spriteFrame = this.texSuitSmallPoker[card.suit];
        } else {
            this.suit.spriteFrame = this.texSuitSmall[card.suit];
        }

    },
    setBg: function (isBoolean) {
        if(isBoolean === false){
            this.node.getComponent(cc.Sprite).spriteFrame = null;
        }
    },
    getPoint: function (cardValue) {
        var point = Math.ceil(cardValue / 4);

        return point;
    },
    getSuit: function (cardValue) {
        var suit = cardValue % 4;

        return suit;
    }
});
