var CardType = {
    getSuitName: function (cardValue) {
        var Suit = cc.Enum({
            Spade: 1, //bich
            Heart: 3, //co
            Club: 2, //tep
            Diamond: 0, //ro
        });

        var suit = cardValue % 4;

        var suitName = Suit[suit];

        return suitName;
    },
    getPointName: function (cardValue) {
        var A2_10JQK = 'NAN,A,2,3,4,5,6,7,8,9,10,J,Q,K'.split(',');
        var point = parseInt(cardValue / 4) + 1;
        var pointName = 'NAN';
        if(point === 1){
            pointName = 'A';
        } else if(point === 11){
            pointName = 'J';
        } else if(point === 12){
            pointName = 'Q';
        } else if(point === 13){
            pointName = 'K';
        } else {
            pointName = A2_10JQK[point];
        }

        return pointName;
    },
    getPoint: function (cardValue) {
        var point = Math.ceil(cardValue / 4);

        return point;
    },
    getSuit: function (cardValue) {
        var suit = cardValue % 4;

        return suit;
    }
};