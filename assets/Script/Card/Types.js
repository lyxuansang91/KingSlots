
var Suit = cc.Enum({
    Spade: 1,
    Heart: 3,
    Club: 2,
    Diamond: 0,
});

var A2_10JQK = 'NAN,A,2,3,4,5,6,7,8,9,10,J,Q,K'.split(',');

function Card (point, suit, type) {
    // cc.log("suit =", suit);
    if(type === 1){
        Suit = cc.Enum({
            Spade: 1,
            Heart: 0,
            Club: 2,
            Diamond: 3,
        });

        A2_10JQK = 'NAN,2,3,4,5,6,7,8,9,10,J,Q,K,A'.split(',');
    }
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
            value: (suit - 1) * 13 + (point - 1),
            writable: false
        },
        //
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
        },
    });
}

Card.prototype.toString = function () {
    return this.suitName + ' ' + this.pointName;
};

var cards = new Array(52);

Card.fromId = function (id) {
    return cards[id];
};

(function createCards () {
    for (var s = 1; s <= 4; s++) {
        for (var p = 1; p <= 13; p++) {
            var card = new Card(p, s);
            cards[card.id] = card;
        }
    }
})();

var ActorPlayingState = cc.Enum({
    Normal: -1,
    Stand: -1,
    Report: -1,
    Bust: -1,
});

var Outcome = cc.Enum({
    Win: -1,
    Lose: -1,
    Tie: -1,
});

var Hand = cc.Enum({
    Normal: -1,
    BlackJack: -1,
    FiveCard: -1,
});

module.exports = {
    Suit: Suit,
    Card: Card,
    ActorPlayingState: ActorPlayingState,
    Hand: Hand,
    Outcome: Outcome,
};
