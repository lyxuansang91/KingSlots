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
    replaceCard: function (cardValue, zoneId) {
        var pointValue = this.getPoint(cardValue);
        var suitValue = this.getSuit(cardValue);

        var isFaceCard = false;
        if(zoneId === Config.TAG_GAME_ITEM.MINI_POKER){
            if(pointValue > 9 && pointValue <= 12){
                isFaceCard = true;
            }
        } else {
            if(pointValue > 10){
                isFaceCard = true;
            }
        }

        if (isFaceCard) {
            if(zoneId === Config.TAG_GAME_ITEM.MINI_POKER){
                this.mainPic.spriteFrame = this.texFaces[pointValue - 10];
            } else {
                this.mainPic.spriteFrame = this.texFaces[pointValue - 10 - 1];
            }
        }
        else {
            if(zoneId === Config.TAG_GAME_ITEM.MINI_POKER){
                this.mainPic.spriteFrame = this.texSuitBigPoker[suitValue];
            } else {
                this.mainPic.spriteFrame = this.texSuitBig[suitValue];
            }
        }

        // for jsb
        this.point.string = Common.getPointName(pointValue, zoneId);

        if (Common.isRedSuit(suitValue, zoneId)) {
            this.point.node.color = this.redTextColor;
        }
        else {
            this.point.node.color = this.blackTextColor;
        }
        if(zoneId === Config.TAG_GAME_ITEM.MINI_POKER){
            this.suit.spriteFrame = this.texSuitSmallPoker[suitValue];
        } else {
            this.suit.spriteFrame = this.texSuitSmall[suitValue];
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
