var NetworkManager = require('NetworkManager');

cc.Class({
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
        isRun: false
    },
    exitRoom: function() {
        cc.director.loadScene("Table");
    },

    getTurnMiniPokerRequest: function(turnType) {

        // cangatAnimation();
        // isRunning = true;

        var entries = [];
        var entry = new proto.BINMapFieldEntry();
        entry.setKey("turnSlotType");
        entry.setValue(turnType.toString());
        entries.push(entry);
        NetworkManager.getTurnMessageFromServer(0, entries);
    },

    takeTurn: function() {
        this.getTurnMiniPokerRequest(1);
    },

    initFirstCard: function() {
        for(var i = 0; i < 3; i++){
            for(var j = 0; j < 5; j++){
                var item = cc.instantiate(this.cardPrefab);
                var posX = (j - 2) * item.getContentSize().width * 0.75;
                // i = 0 --> 1
                // i = 1 --> 0
                // i = 2 --> -1
                var posY = (1 - i) * item.getContentSize().height;
                item.getComponent('CardItem').init();
                item.setPositionY(posY);
                item.setPositionX(posX);

                this.cardView.node.addChild(item);
            }

        }
    },

    // use this for initialization
    onLoad: function () {
        window.ws.onmessage = this.ongamestatus.bind(this);
        this.initFirstCard()
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
        this.cardView.node.removeAllChildren(true);
        var text_emoticon = response.getTextemoticonsList()[0];
        this.isFinishSpin = false;
        var isBreakJar = (text_emoticon.getEmoticonid() === 54); //54: nổ hũ

        var stepCard = 5;
        var number = 5;
        var random_number = Common.genRandomNumber(carx, stepCard, number);
        var items_value = Common.genArrayToMultiArray(random_number, stepCard, number);
        items_value[stepCard-2] = carx;
        var list_item = new Array(number);

        for(var i = 0; i < items_value.length; i++){ //size = stepCard
            for(var j = 0; j < items_value[i].length; j++){ //size = number
                var cardValue = items_value[i][j];
                var item = cc.instantiate(this.cardPrefab);
                var posX = (j - 2) * item.getContentSize().width * 0.75;

                var posY = (1 - i) * item.getContentSize().height;

                item.getComponent('CardItem').replaceCard(cardValue);

                item.setPositionY(posY);
                item.setPositionX(posX);

                list_item.push(item);
                this.cardView.node.addChild(item);

                var paddingCard = item.getContentSize().height;

                // var moveAction = cc.moveBy(1.5 + j*0.25,
                //     cc.p(0, - (test.length - 3)*paddingCard));
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

        }

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
