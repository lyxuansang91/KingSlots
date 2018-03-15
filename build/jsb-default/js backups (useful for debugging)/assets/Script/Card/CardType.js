var CardType = {
getSuitName: function(t) {
return cc.Enum({
Diamond: 0,
Spade: 1,
Club: 2,
Heart: 3
})[t % 4];
},
getPointName: function(t) {
var n = "NAN,A,2,3,4,5,6,7,8,9,10,J,Q,K".split(","), e = parseInt(t / 4) + 1;
return 1 === e ? "A" : 11 === e ? "J" : 12 === e ? "Q" : 13 === e ? "K" : n[e];
},
getPoint: function(t) {
return Math.ceil(t / 4);
},
getSuit: function(t) {
return t % 4;
}
};