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

        var isFaceCard = false;
        if(pointValue > 9 && pointValue <= 12){
            isFaceCard = true;
        }

        if (isFaceCard) {
            this.mainPic.spriteFrame = this.texFaces[pointValue - 10];
        }
        else {
            this.mainPic.spriteFrame = this.texSuitBigPoker[suitValue];
        }

        // for jsb
        this.point.string = Common.getPointName(pointValue);

        if (Common.isRedSuit(suitValue)) {
            this.point.node.color = this.redTextColor;
        }
        else {
            this.point.node.color = this.blackTextColor;
        }
        this.suit.spriteFrame = this.texSuitSmallPoker[suitValue];

    },
    getPoint: function (cardValue) {
        var point = Math.ceil(cardValue / 4);

        return point;
    },
    getSuit: function (cardValue) {
        var suit = cardValue % 4;

        return suit;
    },
    addHidden() {
        // hidden = Sprite::createWithSpriteFrameName(IMG_CARD_HIDDEN);
        // hidden->setColor(Color3B::BLACK);
        // hidden->setOpacity(90);
        // hidden->setScale(this->getWidth()/hidden->getContentSize().width,
        //     this->getHeight()/hidden->getContentSize().height);
        // hidden->setPosition(Vec2(this->getWidth()/2,this->getHeight()/2));
        // this->addChild(hidden);
        // hidden->setVisible(false);
    },
    showHidden(show){
        // hidden->setVisible(show);
    }
});
