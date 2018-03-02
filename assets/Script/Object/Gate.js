var Gate = cc.Class({
    properties: {
        gateID: 0,
        userCount: 0,
        totalBet: 0,
        userBet: 0
    },

    ctor: function(gateID, userCount, totalBet, userBet) {
        this.gateID = gateID;
        this.userCount = userCount;
        this.totalBet = totalBet;
        this.userBet = userBet;
    }
});