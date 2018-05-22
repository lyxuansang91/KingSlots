var Player = cc.Class({
    extends: cc.Component,

    properties: {
    },
    statics: {
        instance: null
    },

    update : function(dt){
    },

    onLoad: function () {
        cc.log("Player");
        Player.instance = this;
    },
    initData: function (n, i, c, g, h) {
        this.name = n;
        this.id = i;
        this.cash = c;
        this.gold = g;
        this.avatar_id = h;
        this._win = false;
    },
    getName() {
        return this.name;
    },

    getID() {
        return this.id;
    },

    getCash() {
        return this.cash;
    },

    getGold() {
        return this.gold;
    },

    getMoney(isCash) {
        return isCash ? this.cash : this.gold;
    },

    getAvatarId(){
        if (this.avatar_id < 100000){
            return 0;
        }
        return this.avatar_id;
    },

    isPlayer(){
        return this.player;
    },

    //=========== set
    setPlayer(player){
        this.player = player;
    },

    setName(n) {
        this.name = n;
    },

    setID(i) {
        this.id = i;
    },

    setCash(c){
        this.cash = c;
    },

    setGold(g){
        this.gold = g;
    },

    isWin() {
        return this._win;
    },

    setWin(_win) {
        this._win = _win;
    },

    //set tien cho nguoi choi la cash hay gold
    setMoney(isCash, money){
        if (isCash){
            this.cash = money;
        }
        else {
            this.gold = money;
        }
    }

});

