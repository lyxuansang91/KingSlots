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
    },

    getNumberCard() {
        return this.numberCard;
    },

    setNumberCard(number){
        this.numberCard = number;
    },

    getPostion() {
        return this.position;
    },

    setPostion(position) {
        this.position = position;
    },

    getTableIndex() {
        return this.tableIndex;
    },

    setTableIndex(tableIndex) {
        this.tableIndex = tableIndex;
    },

    getState() {
        return this.state;
    },

    setState(state) {
        this.state = state;
    }

});

