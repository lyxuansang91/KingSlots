var TXMatch = cc.Class({
    properties: {
        sestionID: 0,
        first: 0,
        second: 0,
        third: 0
    },

    ctor: function(sestionID, first, second, third) {
        this.sestionID = sestionID;
        this.first = first;
        this.second = second;
        this.third = third;
    },
    setSestionID: function(value) {
        this.sestionID = value;
    },
    setResult: function(first, second, third) {
        this.first = first;
        this.second = second;
        this.third = third;
    },

    getResult: function () {
        return [this.first,this.second,this.third];
    },

    sum: function() {
        return this.first + this.second + this.third;
    },
    duplicate: function() {
        return new TXMatch(this.sestionID, this.first, this.second, this.third);
    }
});