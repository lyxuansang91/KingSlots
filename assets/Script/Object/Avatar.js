
cc.Class({
    extends: cc.Component,

    properties: {
        progressBar : cc.ProgressBar,
        bar : cc.Node,
        colors : [cc.Color],
        light_round : cc.ParticleSystem,
        light_follow : cc.ParticleSystem,
        cards : cc.Node,
        bet_money : cc.Node,
        username: cc.Label,
        user_money: cc.Label,
        bet_status: cc.Node,
        playerId: 0
    },

    onLoad : function () {
        this.deltaTime = 0;
        this.duration = 0;
        this.isProgressing = false;
        this.light_follow.stopSystem();
    },

    init: function (duration) {
        this.duration = duration;
        this.deltaTime = 0;
        this.progressBar.progress = 0;
        this.isProgressing = true;
        this.checkColorProcess();
        this.light_follow.resetSystem();
    },

    setParticlePosition: function (index) {
        var r = this.node.width/2;
        var angel = (90 - index*360)*Math.PI/180;
        var x = r*Math.cos(angel);
        var y = r*Math.sin(angel);

        this.light_follow.node.setPosition(cc.p(x,y));
    },

    stop: function () {
        this.isProgressing = false;
        this.duration = 0;
        this.progressBar.progress = 0;
        this.light_follow.stopSystem();
    },

    update: function (dt) {
        if(this.isProgressing){
            this.deltaTime += dt;
            this.progressBar.progress = this.deltaTime/this.duration;
            this.setParticlePosition(this.progressBar.progress);

            if (this.deltaTime > this.duration) {
                this.deltaTime = 0;
                //this.isProgressing = false;
                this.progressBar.progress = 0;
            }
        }
    },

    checkColorProcess: function () {
        if(this.colors.length < 3){
            return;
        }
        this.bar.stopAllActions();
        this.bar.color = this.colors[0];

        var action1 = cc.tintTo(this.duration/2,
            this.colors[1].r,this.colors[1].g,this.colors[1].b);

        var action2 = cc.tintTo(this.duration/4,
            this.colors[2].r,this.colors[1].g,this.colors[2].b);

        this.bar.runAction(cc.sequence(action1,action2));
    },

    cardPosition: function () {

    },

    avatarPosition: function (index,capacity,size_table) {

        var point = cc.p(0,0);
        if(capacity == 5){
            if(index == 0){

                this.cards.active = false;
                this.bet_money.active = false;

                point = cc.p(-0.05,-0.5);

            }else if(index == 1){

                this.cards.setPosition(cc.p(-this.node.width*0.825,-this.node.height*0.2));
                this.bet_money.setPosition(cc.p(-this.node.width*0.825,this.node.height*0.2));

                point = cc.p(0.45,-0.25);

            }else if(index == 2){

                this.cards.setPosition(cc.p(-this.node.width*0.65,-this.node.height*0.8));
                this.bet_money.setPosition(cc.p(-this.node.width*0.65,-this.node.height*1.125));

                point = cc.p(0.3,0.55);

            }else if(index == 3){

                this.cards.setPosition(cc.p(this.node.width*0.65,-this.node.height*0.8));
                this.bet_money.setPosition(cc.p(this.node.width*0.65,-this.node.height*1.125));

                point = cc.p(-0.3,0.55);

            }else if(index == 4){

                this.cards.setPosition(cc.p(this.node.width*0.825,-this.node.height*0.2));
                this.bet_money.setPosition(cc.p(this.node.width*0.85,this.node.height*0.2));

                point = cc.p(-0.45,-0.25);
            }
        }else if(capacity == 9){
            if(index == 0){

                this.cards.active = false;
                this.bet_money.active = false;

                point = cc.p(-0.075,-0.5);

            }else if(index == 1){

                this.cards.setPosition(cc.p(-this.node.width*0.525,this.node.height*0.6));
                this.bet_money.setPosition(cc.p(-this.node.width*0.525,this.node.height*0.95));

                point = cc.p(0.35,-0.5);
            }else if(index == 2){

                this.cards.setPosition(cc.p(-this.node.width*0.825,-this.node.height*0.1));
                this.bet_money.setPosition(cc.p(-this.node.width*0.825,this.node.height*0.25));

                point = cc.p(0.5,-0.15);
            }else if(index == 3){

                this.cards.setPosition(cc.p(-this.node.width*0.755,-this.node.height*0.8));
                this.bet_money.setPosition(cc.p(-this.node.width*0.755,-this.node.height*0.45));

                point = cc.p(0.45,0.35);
            }else if(index == 4){

                this.cards.setPosition(cc.p(0,-this.node.height*1.35));
                this.bet_money.setPosition(cc.p(0,-this.node.height*1.0));

                point = cc.p(0.25,0.565);
            }else if(index == 5){

                this.cards.setPosition(cc.p(0,-this.node.height*1.35));
                this.bet_money.setPosition(cc.p(0,-this.node.height*1.0));

                point = cc.p(-0.25,0.565);
            }else if(index == 6){

                this.cards.setPosition(cc.p(this.node.width*0.755,-this.node.height*0.8));
                this.bet_money.setPosition(cc.p(this.node.width*0.755,-this.node.height*0.45));

                point = cc.p(-0.45,0.35);
            }else if(index == 7){

                this.cards.setPosition(cc.p(this.node.width*0.825,-this.node.height*0.1));
                this.bet_money.setPosition(cc.p(this.node.width*0.825,this.node.height*0.25));

                point = cc.p(-0.5,-0.15);
            }else if(index == 8){

                this.cards.setPosition(cc.p(this.node.width*0.525,this.node.height*0.6));
                this.bet_money.setPosition(cc.p(this.node.width*0.525,this.node.height*0.95));

                point = cc.p(-0.35,-0.5);
            }
        }

        if(capacity == 5){
            if(index != 0){
                this.node.scale = 0.7;
            }
        }else if(capacity == 9){
            if(index != 0){
                this.node.scale = 0.65;
            }
        }

        return cc.p(point.x * size_table.width,point.y * size_table.height);
    },

    avatarInfomation(username, userMoney) {
        this.username.string = username;
        this.user_money.string = userMoney;
    },

    loadAvatar(image_index, id, _name,  _money, roomIndex, player) {

        this.player = player;
        this.roomIndex = roomIndex;

        if (image_index > 100021){
            image_index = 100000;
        }

        this.playerId = id;
        this.username.string = _name;
        this.user_money.string = _money;

        //show trang thai nguoi choi, hay nguoi cho
        // this.showPlayer(player);
    },

    showPlayer(player){
        // if (player){
        //     this.node.setO
        // }
        // else {
        //     this->avatar->setOpacity(100);
        // }
    },

    getPlayerId(){
        return this.playerId;
    },

    isPlayer(){
        return this.player;
    },

});
