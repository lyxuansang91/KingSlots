cc.Class({
    extends: cc.Component,

    properties: {
    },

    update : function(dt){
    },

    onLoad: function () {

    },
    ctor: function (n, i, number, c, g, pos, tableIndex, avatarId) {
        cc.log("n =", n);
        this.name = n;
        this.id = i;
        this.cash = c;
        this.gold = g;
        this.avatar_id = avatarId;
        this._win = false;
        this.numberCard = number;
        this.position = pos;
        this.tableIndex = tableIndex;
        this.player = true;
    },
    getName : function() {
        return this.name;
    },

    getID: function() {
        return this.id;
    },

    getCash: function() {
        return this.cash;
    },

    getGold: function() {
        return this.gold;
    },

    getMoney: function(isCash) {
        return isCash ? this.cash : this.gold;
    },

    getAvatarId: function(){
        if (this.avatar_id < 100000){
            return 0;
        }
        return this.avatar_id;
    },

    isPlayer: function(){
        return this.player;
    },

    //=========== set
    setPlayer: function(player){
        this.player = player;
    },

    setName: function(n) {
        this.name = n;
    },

    setID: function(i) {
        this.id = i;
    },

    setCash: function(c){
        this.cash = c;
    },

    setGold: function(g){
        this.gold = g;
    },

    isWin: function() {
        return this._win;
    },

    setWin: function(_win) {
        this._win = _win;
    },

    //set tien cho nguoi choi la cash hay gold
    setMoney: function(isCash, money){
        if (isCash){
            this.cash = money;
        }
        else {
            this.gold = money;
        }
    },

    getNumberCard: function() {
        return this.numberCard;
    },

    setNumberCard: function(number){
        this.numberCard = number;
    },

    getPostion: function() {
        return this.position;
    },

    setPostion: function(position) {
        this.position = position;
    },

    getTableIndex: function() {
        return this.tableIndex;
    },

    setTableIndex: function(tableIndex) {
        this.tableIndex = tableIndex;
    },

    getState: function() {
        return this.state;
    },

    setState: function(state) {
        this.state = state;
    }

});

