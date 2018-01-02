var NetworkManager = require('NetworkManager');

cc.Class({
    extends: cc.Component,

    properties: {
        cardPrefab: cc.Prefab,
        cardView: cc.Mask,
        updateMoneyResponse: [],
        cards: []
    },

    // use this for initialization
    onLoad: function () {
        window.ws.onmessage = this.ongamestatus.bind(this);
        // var stepCard = 12;
        // var rs = this.genRandomNumber(null,stepCard);
        // var test = this.genArrayToMultiArray(rs, stepCard);
        // for(var i = 0; i < test.length; i++){
        //     for(var j = 0; j < test[i].length; j++){
        //         var item = cc.instantiate(this.cardPrefab);
        //         var cardValue = test[i][j];
        //         var posX =  0;
        //         if(j === 0){
        //             posX = - item.getContentSize().width ;
        //         } else if(j === 2){
        //             posX = item.getContentSize().width ;
        //         } else {
        //             posX = 0;
        //         }
        //
        //         var posY = 0;
        //         if(i === 0){
        //             posY = item.getContentSize().height;
        //         } else if (i === 1){
        //             posY = 0;
        //         } else {
        //             posY = - (i - 1)*item.getContentSize().height;
        //         }
        //
        //         item.getComponent('CardItem').init(cardValue);
        //         item.setPositionY(posY);
        //         item.setPositionX(posX);
        //
        //         this.cardView.node.addChild(item);
        //     }
        //
        // }


    },

    quayEvent: function () {
        cc.log("ba cay =", this.node);
        // int valMoney = (isCash ? turnCashValue[indexCash] : turnGoldValue[indexCash]);
        // int money = (isCash ? (int)Common::getInstance()->getCash() : (int)Common::getInstance()->getGold());
        // if(valMoney > money){
        //     string message = getLanguageStringWithKey("MESSAGE_NOTENOUGHMONEY1") +
        //         (isCash ? getLanguageStringWithKey("TXT_KEN") : getLanguageStringWithKey("TXT_COIN")) +
        //         getLanguageStringWithKey("MESSAGE_NOTENOUGHMONEY2");
        //     this->showToast(message.c_str(), 2);
        //     return;
        // }
        // if (autoSpin) {
        //     return;
        // }

        // if (!isRunning) {
            this.getTurnMiniThreeCardsRequest(1);
        // }else{
        //     this->showToast(getLanguageStringWithKey("MESSAGE_WAIT").c_str(), 2);
        // }
    },
    getTurnMiniThreeCardsRequest: function(turnType) {

        // cangatAnimation();
        // isRunning = true;

        var entries = [];
        var entry = new proto.BINMapFieldEntry();
        entry.setKey("turnSlotType");
        entry.setValue(turnType.toString());
        entries.push(entry);
        NetworkManager.getTurnMessageFromServer(0, entries);
    },
    ongamestatus: function(event) {
        if(event.data!==null || event.data !== 'undefined') {
            var lstMessage = NetworkManager.parseFrom(event.data, event.data.byteLength);
            // cc.log("lstMessage =", lstMessage.shift());
            if(lstMessage.length > 0) {
                for(var i = 0; i < lstMessage.length; i++){
                    var buffer = lstMessage[i];
                    this.handleMessage(buffer);
                }
            }
        }
    },

    handleMessage: function(buffer) {
        cc.log("buffer =", buffer.message_id);
        switch (buffer.message_id) {
            case NetworkManager.MESSAGE_ID.UPDATE_MONEY:
                var msg = buffer.response;
                this.updateMoneyMessageResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.MATCH_END:
                this.matchEndResponseHandler(buffer.response);
                break;
            // case NetworkManager.MESSAGE_ID.EXIT_ROOM:
            //     var msg = buffer.response;
            //     this.exitRoomResponsehandler(msg);
            //     break;
            // case NetworkManager.MESSAGE_ID.ENTER_ROOM:
            //     var msg = buffer.response;
            //     this.enterRoomResponseHandler(msg);
            //     break;
            // case NetworkManager.MESSAGE_ID.EXIT_ZONE:
            //     var msg = buffer.response;
            //     this.exitZoneResponseHandler(msg);
            //     break;
        }
    },
    updateMoneyMessageResponseHandler: function (response) {
        if (response.getResponsecode()){
            this.setBinUpdateMoney(response);
            this.removeTurnUpdateMoney();
        }
    },
    setBinUpdateMoney: function(response) {
        this.updateMoneyResponse = response;
    },
    getBINUpdateMoneyResponse: function(){
        return this.updateMoneyResponse;
    },
    removeTurnUpdateMoney: function(){
        var updateMoneyResponse = this.getBINUpdateMoneyResponse();
        cc.log("updateMoneyResponse =", updateMoneyResponse.getMoneyboxesList());
        if(updateMoneyResponse.getResponsecode()) {
            for(var i = 0; i < updateMoneyResponse.getMoneyboxesList().length; i++) {
                var money_box = updateMoneyResponse.getMoneyboxesList()[i];
                if(money_box.getReason() === "miniBacaySpin") {
                    var origin_money = money_box.getCurrentmoney();
                    //set lai tien cho nguoi choi

                    Common.setCash(origin_money);
                    //this->moneyEvent->onEventMoneyMiniGame(true,origin_money);

                }
            }
        }
    },
    matchEndResponseHandler: function(response) {
        if (response.getResponsecode()) {
            if (response.getArgsList().length > 0) {
                for (var i = 0; i < response.getArgsList().length; i++) {
                    if (response.getArgsList()[i].getKey() === "currentCards") {
                        var str = response.getArgsList()[i].getValue();
                        var currentCards = str.split(',').map(Number);
                        this.implementSpinMiniThreeCards(currentCards,response);
                    }
                }
            }

            /*if (response->textemoticons_size() > 0){
             BINTextEmoticon emoticon = response->textemoticons(0);
             handleRanking(emoticon.emoticonid(), emoticon.message());
             }*/

        } else {
            // isRunning = false;
            // autoSpin = false;
            //btn_auto_quay->loadDecryptTextTure(MINIPOKER_CHECK_BOX_UNSELECT);

        }
        /* if (response->has_message() && !response->message().empty())
         this->showToast(response->message().c_str(), 2);*/
    },
    implementSpinMiniThreeCards: function(carx,response) {
        this.cardView.node.removeAllChildren(true);
        var text_emoticon = response.getTextemoticonsList()[0];
        var isFinishSpin = false;
        var isBreakJar = (text_emoticon.getEmoticonid() === 54); //54: nổ hũ

        var stepCard = 4;

        var rs = this.genRandomNumber(carx, stepCard * 3);
        var test = this.genArrayToMultiArray(rs, stepCard);
        test[stepCard-2] = carx;
        cc.log("test carx =", test.length);
        for(var i = 0; i < test.length; i++){
            for(var j = 0; j < test[i].length; j++){
                var item = cc.instantiate(this.cardPrefab);
                var cardValue = test[i][j];
                var posX =  0;
                if(j === 0){
                    posX = - item.getContentSize().width ;
                } else if(j === 2){
                    posX = item.getContentSize().width ;
                } else {
                    posX = 0;
                }

                var posY = 0;

                if(i === 0){
                    posY = - item.getContentSize().height;
                } else if (i === 1){
                    posY = 0;
                } else {
                    posY = (i - 1)*item.getContentSize().height;
                }


                item.getComponent('CardItem').replaceCard(cardValue);

                item.setPositionY(posY);
                item.setPositionX(posX);

                this.cardView.node.addChild(item);

                var paddingCard = item.getContentSize().height;

                var moveAction = cc.moveBy(1.5 + j*0.25,
                    cc.p(0, - (test.length - 3)*paddingCard));

                if(j === 0){
                    moveAction = cc.moveBy(1.5 + j*0.25,
                        cc.p(0, - (test.length - 3)*paddingCard));
                }else{
                    moveAction = cc.moveBy((j-1) + 1.5 + (j-1)*0.25 + (test.length - test[i].length) / stepCard,
                        cc.p(0, (test.length - 4)*paddingCard));
                    // moveAction = cc.moveBy(1.5 + j*0.25,
                    //     cc.p(0, - (test.length - 4)*paddingCard));
                }

                if(j === 2){
                    // auto callFunc = CallFunc::create([=]{
                    //     if (response->textemoticons_size() > 0){
                    //         BINTextEmoticon emoticon = response->textemoticons(0);
                    //         handleRanking(emoticon.emoticonid(), emoticon.message(), getBINUpdateMoneyResponse());
                    //     }
                    // });

                    // auto callFuncAutoSpin = CallFunc::create([=]{
                    //     if(!isBreakJar)
                    //         isFinishSpin = true;
                    // });

                    item.runAction(cc.sequence(moveAction, cc.moveBy(1.5, cc.p(0, -paddingCard))));
                }else{
                    if(j === 0){
                        item.runAction(moveAction);
                    }else{
                        item.runAction(cc.sequence(moveAction, cc.moveBy(1.5, cc.p(0, -paddingCard))));
                    }

                }

                // var moveAction = cc.moveBy(1.5, cc.p(0,- (test.length - 3)*item.getContentSize().height));
                item.runAction(moveAction);

            }

        }


    },
    _onDealEnd: function() {
        cc.log("run action");
    },
    checkCard: function(card_values,value){
        for (var i = 0; i < card_values.length; i++){
            if(value === card_values[i]){
                return true;
            }
        }
        return false;
    },
    genRandomNumber: function (arrCard, stepCard) {
        arrCard = arrCard === null ? [0,0,0] : arrCard;
        cc.log("stepCard =", stepCard);
        var results = [];
        do {
            var cardValue = Math.floor(Math.random() * 36) + 1;
            if(!results.includes(cardValue) && !arrCard.includes(cardValue)){
                results.push(cardValue);
            }
        }
        while (results.length < stepCard);
        return results;
    },
    genArrayToMultiArray: function (arrNumber, stepCard) {
        cc.log("arrNumber =", arrNumber);
        var i , j  , results = [];
        var number = Math.ceil(arrNumber.length/3);
        cc.log("number =", number);
        for(i = 0; i < number; i++){
            results[i]=new Array(3);
            for(j = 0; j < 3 ; j++){
                var k = i*3 + j;
                results[i][j] = arrNumber[k];
            }
        }
        return results;
    }

});
