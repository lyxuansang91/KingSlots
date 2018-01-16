var NetworkManager = require('NetworkManager');

var MiniPoker = cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        cardView: cc.Mask,
        cardPrefab: cc.Prefab,
        isFinishSpin: true,
        isRun: false,
        stepCard : 9,
        number : 5,
        time_move: 1,
        list_item: [],
        list_recent_value: null,
        enterRoomResponse: null,
        enterZoneResponse: null,
        betType: 1,
        moneyBet: cc.Label,
        userMoney: cc.Label,
        jarMoney: cc.Label
    },
    statics: {
      instance: null,
    },
    exitRoom: function() {
        cc.director.loadScene("Table");
    },

    setKeyBet: function(key) {
      this.betType = key;
    },
    getKeyBet: function() {
        return this.betType;
    },
    requestJar: function() {
        NetworkManager.getJarRequest(Common.getZoneId(), this.betType);
    },
    getTurnMiniPokerRequest: function(turnType) {

        var entries = [];
        var entry = new proto.BINMapFieldEntry();
        entry.setKey("turnSlotType");
        entry.setValue(turnType.toString());
        entries.push(entry);
        NetworkManager.getTurnMessageFromServer(0, entries);
    },

    betToggleOneEvent: function(){
        this.setKeyBet(0);
        this.moneyBet.string = this.getBetMoney();
        this.requestJar();
    },
    betToggleTwoEvent: function() {
        this.setKeyBet(1);
        this.moneyBet.string = this.getBetMoney();
        this.requestJar();
    },
    betToggleThreeEvent: function() {
        this.setKeyBet(2);
        this.moneyBet.string = this.getBetMoney();
        this.requestJar();
    },

    initDataFromLoading: function(enterZone, enterRoom){
        this.setEnterZoneResponse(enterZone);
        Common.setMiniGameZoneId(enterZone.getZoneid());
        this.setEnterRoomResponse(enterRoom);
        this.init(enterRoom);
    },
    setEnterZoneResponse: function(res) {
        this.enterZoneResponse = res;
    },
    getEnterZoneResponse: function() {
        return this.enterZoneResponse;
    },
    getEnterRoomResponse: function() {
        return this.enterRoomResponse;
    },
    setEnterRoomResponse: function(resp) {
        this.enterRoomResponse = resp;
    },

    takeTurn: function() {
        this.getTurnMiniPokerRequest(this.betType);
    },

    initFirstCard: function() {
        var random_number = Common.genRandomNumber(null, this.stepCard, this.number);
        var items_value = Common.genArrayToMultiArray(random_number, this.stepCard, this.number);
        this.list_recent_value = Common.create2DArray(this.stepCard);
        for(var i = 0; i < this.stepCard; i++){
            for(var j = 0; j < this.number; j++){
                var item = cc.instantiate(this.cardPrefab);
                var posX = (j - 2) * item.getContentSize().width * 0.75;
                var posY = (i - 1) * item.getContentSize().height;
                item.getComponent('CardItem').replaceCard(items_value[i][j]);
                item.setPositionY(posY);
                item.setPositionX(posX);

                this.list_item.push(item);
                this.cardView.node.addChild(item);
            }
        }

        this.list_recent_value = items_value;
    },

    // use this for initialization
    onLoad: function () {
        MiniPoker.instance = this;
        window.ws.onmessage = this.ongamestatus.bind(this);
        this.initFirstCard();
    },
    ongamestatus: function(event) {
        if(event.data!==null || event.data !== 'undefined') {
            var lstMessage = NetworkManager.parseFrom(event.data, event.data.byteLength);
            cc.log("list message size:" + lstMessage.length);
            if(lstMessage.length > 0) {
                for(var i = 0; i < lstMessage.length; i++){
                    var buffer = lstMessage[i];
                    this.handleMessage(buffer);
                }
            }
        }
    },

    implementSpinMiniPokerCards: function(carx, response) {
        cc.log("carx =", carx);

        var text_emoticon = response.getTextemoticonsList()[0];
        this.isFinishSpin = false;
        var isBreakJar = (text_emoticon.getEmoticonid() === 54); //54: nổ hũ

        var random_number = Common.genRandomNumber(carx, this.stepCard, this.number);
        var items_value = Common.genArrayToMultiArray(random_number, this.stepCard, this.number);
        items_value[this.stepCard-2] = carx;

        /*var items_value_convert = [];
        for(var i = 0; i < items_value.length; i++){
            for(var j = 0; j < items_value[i].length; j++){
                items_value_convert.push(items_value[i][j]);
            }
        }

        var items_value_display = Common.create2DArray(this.number);
        for(var i = 0; i < items_value_convert.length; i++){
            items_value_display[i%this.number].push(items_value_convert[i]);
        }*/

        if(items_value.length * this.number != this.list_item.length){
            return;
        }

        for(var i = 0; i < this.list_item.length; i++){
            var x = parseInt(i/this.number);
            var y = parseInt(i%this.number);

            if(i < 3*this.number){
                var i1 = this.stepCard - (3 - x);
                var j1 = y;
                this.list_item[i].getComponent('CardItem').replaceCard(this.list_recent_value[i1][j1]);
            }

            var posX = (y - 2) * this.list_item[i].getContentSize().width * 0.75;
            var posY = (x - 1) * this.list_item[i].getContentSize().height;

            this.list_item[i].setPositionX(posX);
            this.list_item[i].setPositionY(posY);
        }

        this.list_recent_value = items_value;

        for(var i = 0; i < this.list_item.length; i++){
            var x = parseInt(i/this.number);
            var y = parseInt(i%this.number);

            var card = this.list_item[i];

            var card_value = items_value[x][y];
            if(i >= 3*this.number){
                card.getComponent('CardItem').replaceCard(card_value);
            }

            var h = card.getContentSize().height;

            var move1 = cc.moveBy(0.2, cc.p(0,h*0.25));
            var move2 = cc.moveBy(0.15, cc.p(0,h*0.25));
            var move3 = cc.moveBy(this.time_move,cc.p(0,-(this.stepCard - 3.0)*h - 0.5*h));
            var delay = cc.delayTime(y*0.3);

            if(i == this.list_item.length - 1){
                // khi dừng hiệu ứng
                var call_func = cc.callFunc(function () {
                    cc.log("FINISH!!!!");
                });
                card.runAction(cc.sequence(delay,move1,move3,move2,call_func));
            }else{
                card.runAction(cc.sequence(delay,move1,move3,move2));
            }
        }

        /*for(var i = 0; i < items_value.length; i++){ //size = stepCard
            for(var j = 0; j < items_value[i].length; j++){ //size = number
                var cardValue = items_value[i][j];
                var item = cc.instantiate(this.cardPrefab);
                var posX = (j - 2) * item.getContentSize().width * 0.75;
                var posY = (1 - i) * item.getContentSize().height;

                item.getComponent('CardItem').replaceCard(cardValue);

                item.setPositionY(posY);
                item.setPositionX(posX);

                this.cardView.node.addChild(item);

                //
                // if(j === 0){
                //     moveAction = cc.moveBy(1.5 + j*0.25,
                //         cc.p(0, - (test.length - 3)*paddingCard));
                // }else{
                //     moveAction = cc.moveBy((j-1) + 1.5 + (j-1)*0.25 + (test.length - test[i].length) / stepCard,
                //         cc.p(0, - (test.length - 4)*paddingCard));
                //     // moveAction = cc.moveBy(1.5 + j*0.25,
                //     //     cc.p(0, - (test.length - 3)*paddingCard));
                // }

                if(j === items_value[i].length - 1){
                //     var emoticon = response.getTextemoticonsList()[0];
                //     var emotionId = emoticon.getEmoticonid();
                //     var message = emoticon.getMessage();
                //     var moneyResponse = this.getBINUpdateMoneyResponse();
                //     var callFunc = cc.callFunc(this.handleRanking(emotionId, message, moneyResponse), this);
                //
                //     var callFuncAutoSpin = cc.callFunc(function () {
                //         if(!isBreakJar)
                //             this.isFinishSpin = true;
                //     }, this);
                //
                //     item.runAction(cc.sequence(moveAction, cc.moveBy(1.5, cc.p(0, -paddingCard)), callFunc, cc.delayTime(2), callFuncAutoSpin, null));
                //
                // }else{
                //     if(j === 0){
                //         item.runAction(moveAction);
                //     }else{
                //         item.runAction(cc.sequence(moveAction, cc.moveBy(1.5, cc.p(0, -paddingCard))));
                //     }

                }

                // item.runAction(moveAction);
            }
        }*/

    },
    matchEndResponseHandler: function(response) {
      cc.log("match end response handler:", response.toObject());
        if (response.getResponsecode()) {
            if (response.getArgsList().length > 0) {
                for (var i = 0; i < response.getArgsList().length; i++) {
                    if (response.getArgsList()[i].getKey() === "currentCards") {
                        var str = response.getArgsList()[i].getValue();
                        var currentCards = str.split(',').map(Number);
                        this.implementSpinMiniPokerCards(currentCards,response);
                    }
                }
            }

            /*if (response->textemoticons_size() > 0){
             BINTextEmoticon emoticon = response->textemoticons(0);
             handleRanking(emoticon.emoticonid(), emoticon.message());
             }*/
        } else {
            //
        }

      if(response.hasMessage() && response.getMessage() !== "") {

      }
    },
    updateMoneyMessageResponseHandler: function(resp) {
        cc.log("update money response: ", resp.toObject());
        if(resp.getResponsecode()) {

        }

        if(resp.hasMessage() && resp.getMessage() !== "") {
            // show dialog
        }
    },
    exitRoomResponseHandler: function(resp) {
        cc.log("exit room response handler:", resp.toObject());
        if(resp.getResponsecode()) {

        }
        if(resp.hasMessage() && resp.getMessage() !== "") {

        }
    },
    exitZoneResponseHandler: function(resp) {
        cc.log("exit zone response handler:", resp.toObject());
        if(resp.getResponsecode()) {

        }

        if(resp.hasMessage() && resp.getMessage() !== "") {
            // show toast
        }
    },
    handleMessage: function(buffer) {
      //  cc.log("buffer =", buffer.message_id);
        switch (buffer.message_id) {
            case NetworkManager.MESSAGE_ID.UPDATE_MONEY:
                var msg = buffer.response;
                this.updateMoneyMessageResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.MATCH_END:
                this.matchEndResponseHandler(buffer.response);
                break;
            case NetworkManager.MESSAGE_ID.EXIT_ROOM:
                var msg = buffer.response;
                this.exitRoomResponsehandler(msg);
                break;
            // // case NetworkManager.MESSAGE_ID.ENTER_ROOM:
            // //     var msg = buffer.response;
            // //     this.enterRoomResponseHandler(msg);
            // //     break;
            case NetworkManager.MESSAGE_ID.EXIT_ZONE:
                var msg = buffer.response;
                this.exitZoneResponseHandler(msg);
                break;
        }
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
