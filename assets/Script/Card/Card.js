var Suit = cc.Enum({
    Spade: 1,
    Heart: 2,
    Club: 3,
    Diamond: 4,
});

var A2_10JQK = 'NAN,A,2,3,4,5,6,7,8,9,10,J,Q,K'.split(',');

/**
 * @class Card
 * @constructor
 * @param {Number} point
 */
function Card (cardValue) {
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
            get: function () {
                return A2_10JQK[this.point];
            }
        },
        suitName: {
            get: function () {
                return Suit[this.suit];
            }
        },
        isBlackSuit: {
            get: function () {
                return this.suit === Suit.Spade || this.suit === Suit.Club;
            }
        },
        isRedSuit: {
            get: function () {
                return this.suit === Suit.Heart || this.suit === Suit.Diamond;
            }
        }
    });
}

module.exports = {
    Suit: Suit,
    Card: Card
};