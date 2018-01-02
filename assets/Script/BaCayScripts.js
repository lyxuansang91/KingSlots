var NetworkManager = require('NetworkManager');

cc.Class({
    extends: cc.Component,

    properties: {
        cardPrefab: cc.Prefab,
        cardView: cc.Mask,
        updateMoneyResponse: [],
        cards: []
    },

    exitRoom: function() {
        cc.log("click exit room");
        NetworkManager.requestExitRoomMessage(0);
    },

    // use this for initialization
    onLoad: function () {
        window.ws.onmessage = this.ongamestatus.bind(this);

        var rs = this.genRandomNumber(null);
        var test = this.genArrayToMultiArray(rs);
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
                    posY = item.getContentSize().height;
                } else if (i === 1){
                    posY = 0;
                } else {
                    posY = - (i - 1)*item.getContentSize().height;
                }

                item.getComponent('CardItem').init(cardValue);
                item.setPositionY(posY);
                item.setPositionX(posX);

                this.cardView.node.addChild(item);
            }

        }


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

    exitRoomResponsehandler: function (resp) {
        cc.log("exit room response handler:", resp);
    },

    exitZoneResponseHandler: function(resp) {
        cc.log("exit zone response handler:", resp.toObject());
        if(resp.getResponsecode()) {
            Common.setZoneId(-1);
            cc.director.loadScene("Lobby");
        }

        if(resp.hasMessage()) {
            // TODO: display message
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
            case NetworkManager.MESSAGE_ID.EXIT_ROOM:
                var msg = buffer.response;
                this.exitRoomResponsehandler(msg);
                break;
            // case NetworkManager.MESSAGE_ID.ENTER_ROOM:
            //     var msg = buffer.response;
            //     this.enterRoomResponseHandler(msg);
            //     break;
            case NetworkManager.MESSAGE_ID.EXIT_ZONE:
                var msg = buffer.response;
                this.exitZoneResponseHandler(msg);
                break;
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
        cc.log("carx =", carx);
        cc.log("response =", response);
        var text_emoticon = response.getTextemoticonsList()[0];
        var isFinishSpin = false;
        var isBreakJar = (text_emoticon.getEmoticonid() === 54); //54: nổ hũ
        /*for (int i = 0; i < 5; i++){
         for (int j = (int)cards[i].size() - 1; j >= 1; j--){
         bg_content->removeChild(cards[i][j], true);
         cards[i].erase(cards[i].begin() + j);
         }
         }*/

        //Du lieu tra ve = carx

        //Tao mang du lieu fake


        var card_values = [[]];
        var stepCard = 12;

        var rs = this.genRandomNumber(carx);
        var test = this.genArrayToMultiArray(rs);
        test[1] = carx;
        cc.log("test carx =", test);
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
                    posY = item.getContentSize().height;
                } else if (i === 1){
                    posY = 0;
                } else {
                    posY = - (i - 1)*item.getContentSize().height;
                }

                item.getComponent('CardItem').replaceCard(cardValue);
                item.setPositionY(posY);
                item.setPositionX(posX);

                this.cardView.node.addChild(item);
            }

        }

        // for (var i = 0; i < carx.length; i++) {
        //     card_values[i].push(carx[i]);
        //     cc.log("card_values", card_values);
        //     for (var k = 1; k <= 3; k++) {
        //         var card_value = 1;
        //         do{
        //             card_value = Math.floor(Math.random() * 52) + 1;
        //         } while (card_value === carx[i] || this.checkCard(card_values[i], card_value));
        //         card_values[i].push(card_value);
        //     }
        //
        //     for (var j = 0; j < card_values[i].length; j++){
        //         var nameValue = card_values[i][j] - 8;
        //         if (nameValue < 1) nameValue = nameValue + 52;
        //         if (nameValue % 4 === 0) {
        //             nameValue--;
        //         }
        //         else if (nameValue % 4 === 3) {
        //             nameValue++;
        //         }
        //
        //         var paddingCard = this.cards[i][0].getContentSize().height*this.cards[i][j].getContentSize() * 1.1;
        //
        //         if (j === 0){
        //
        //             this.cards[i][0]->setSpriteFrame(StringUtils::format(CARD_FORMAT, nameValue));
        //             cards[i][0]->setPosition(cards[i][0]->getPosition() + Vec2(0, (card_values[i].size() - 1)*paddingCard));
        //             MoveBy* move;
        //             if(i == 0){
        //                 move = MoveBy::create(1.5f + i*0.25f,
        //                     -Vec2(0, (card_values[i].size() - 1)*paddingCard));
        //             }else{
        //                 move = MoveBy::create((i-1) + 1.5f + (i-1)*0.25f + (card_values[i].size() - cards[i].size()) / stepCard,
        //                     -Vec2(0, (card_values[i].size() - 2)*paddingCard));
        //             }
        //             if(i == 2){
        //                 auto callFunc = CallFunc::create([=]{
        //                     if (response->textemoticons_size() > 0){
        //                         BINTextEmoticon emoticon = response->textemoticons(0);
        //                         handleRanking(emoticon.emoticonid(), emoticon.message(), getBINUpdateMoneyResponse());
        //                     }
        //                 });
        //
        //                 auto callFuncAutoSpin = CallFunc::create([=]{
        //                     if(!isBreakJar)
        //                         isFinishSpin = true;
        //                 });
        //
        //                 cards[i][0]->runAction(Sequence::create(move,
        //                     MoveBy::create(1.5f,Vec2(0, -paddingCard)),
        //                 callFunc, DelayTime::create(2.0f), callFuncAutoSpin, NULL));
        //             }else{
        //                 if(i == 0){
        //                     cards[i][0]->runAction(move);
        //                 }else{
        //                     cards[i][0]->runAction(Sequence::create(move,
        //                         MoveBy::create(1.5f,Vec2(0, -paddingCard)), NULL));
        //                 }
        //
        //             }
        //
        //             continue;
        //         }else{
        //             cards[i][j]->setSpriteFrame(StringUtils::format(CARD_FORMAT, nameValue));
        //             auto pos = Vec2((0.1f + 1.25f*i)*cards[i][j]->getWidth()*cards[i][j]->getScale(),
        //             bg_card_inside->getHeight() / 2 - cards[i][j]->getHeight()*cards[i][j]->getScale() / 2
        //             + (card_values[i].size() - j - 1)*paddingCard);
        //             cards[i][j]->setPosition(pos);
        //         }
        //
        //         float timeMove = 1.5f + (card_values[i].size() - cards[i].size()) / stepCard;
        //         MoveBy* move;
        //         if(i == 0){
        //             timeMove = 1.5f + i*0.25f;
        //             move = MoveBy::create(timeMove,
        //                 -Vec2(0, (card_values[i].size() - 1)*paddingCard));
        //             cards[i][j]->runAction(move);
        //         }else{
        //             move = MoveBy::create(timeMove + (i-1),
        //                 -Vec2(0, (card_values[i].size() - 2)*paddingCard));
        //             cards[i][j]->runAction(Sequence::create(move,MoveBy::create(0.25f, Vec2(0, -paddingCard)), NULL));
        //         }
        //     }
        //
        // }
    },
    checkCard: function(card_values,value){
        for (var i = 0; i < card_values.length; i++){
            if(value === card_values[i]){
                return true;
            }
        }
        return false;
    },
    genRandomNumber: function (arrCard) {
        arrCard = arrCard === null ? [0,0,0] : arrCard;
        var results = [];
        do {
            var cardValue = Math.floor(Math.random() * 36) + 1;
            if(!results.includes(cardValue) && !arrCard.includes(cardValue)){
                results.push(cardValue);
            }
        }
        while (results.length < 9);
        cc.log("results =", results);
        return results;
    },
    genArrayToMultiArray: function (arrNumber) {
        var i , j  , results = [];
        var number = Math.ceil(arrNumber.length/3);
        for(i = 0; i < number; i++){
            results[i]=new Array(3);
            for(j = 0; j < 3 ; j++){
                var k = i*number + j;
                results[i][j] = arrNumber[k];
            }
        }
        return results;
    }

});
