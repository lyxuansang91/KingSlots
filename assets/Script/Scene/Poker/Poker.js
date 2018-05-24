var PlayScene = require("PlayScene");
var PokerPlayer = require("PokerPlayer");
var NetworkManager = require("NetworkManager");
var Poker = cc.Class({
    extends: PlayScene,

    properties: {
        table: cc.Node,
        avatar_prefab : cc.Prefab,
        lst_player: [],
        avatars: [],
        player_action: [],
        countIncrease: 10,
        sprite_cover_card: cc.Node

    },
    statics: {
        instance: null
    },

    onGameEvent: function() {
        var self = this;
        NetworkManager.checkEvent(function(buffer) {
            return self.handleMessage(buffer);
        });

    },
    update: function(dt) {
        this.onGameEvent();
    },

    onLoad: function () {
        Poker.instance = this;
        this.capacity = 5;
        // this.initAvatar(this.capacity);
    },

    initDataFromLoading: function(roomPlay, playerList, waitingPlayerList, createRoom, reEnterRoomResponse){
        this.setRoomIndex(roomPlay.getRoomindex());
        this.setVipRoom(roomPlay.getViproom());
        this.setPassWordRequired(roomPlay.getPasswordrequired());
        this.setPlayerList(playerList);
        this.setCreateRoom(createRoom);
        this.setWaitingPlayerList(waitingPlayerList);
        this.setEnterRoomResponse(reEnterRoomResponse);
        // this.setOwnerUserId(Common.getOwnerUserId());
        this.setMinBet(roomPlay.getMinbet());

        if (this.isCreateRoom()){
            var current_user_id = Common.getUserId();
            Common.setOwnerUserId(current_user_id);
        }

        this.setListPlayerFromParams(playerList, waitingPlayerList);

        if (reEnterRoomResponse !== 0) {
            this.handleReEnterRoom(reEnterRoomResponse);
        }
    },

    handleMessage: function(e) {
        const buffer = e;
        var isDone = this._super(buffer);
        if(isDone) {
            return true;
        }
        isDone = true;
        var msg = buffer.response;
        switch (buffer.message_id) {
            case NetworkManager.MESSAGE_ID.START_MATCH:
                this.startMatchResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.PLAYER_ENTER_ROOM:
                this.playerEnterRoomResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.PLAYER_EXIT_ROOM:
                this.playerExitRoomResponse(msg);
                break;
            case NetworkManager.MESSAGE_ID.PLAYER_EXIT_AFTER_MATCH_END:
                this.playerExitAfterMatchEndResponse(msg);
                break;
            case NetworkManager.MESSAGE_ID.CANCEL_EXIT_AFTER_MATCH_END:
                this.cancelExitAfterMatchEndResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.TURN:
                this.turnResponse(msg);
                break;
            default:
                isDone = false;
                break;
        }
        return isDone;
    },

    setListPlayerFromParams(player_list, waiting_player_list){
        if (this.lst_player.length != null) this.lst_player = [];

        for (var i = 0; i < player_list.length; i++) {
            cc.log("lst player i =", this.convertFromBINPlayer(player_list[i]));
            this.lst_player.push(this.convertFromBINPlayer(player_list[i]));
        }

        for (var i = 0; i < waiting_player_list.length; i++) {
            cc.log("waiting_player_list i =", waiting_player_list[i]);
            var pokerPlayer = this.convertFromBINPlayer(waiting_player_list[i]);
            pokerPlayer.setPlayer(false);
            this.lst_player.push(pokerPlayer);
        }

        cc.log("this.lst_player =", this.lst_player);

        this.displayInfoRemainCard(this.lst_player);
    },

    convertFromBINPlayer(binplayer){
        var uid = binplayer.getUserid();

        var numberCard = 0;

        var player = new PokerPlayer(binplayer.getDisplayname().length === 0 ? binplayer.getUsername() : binplayer.getDisplayname(), uid, numberCard, binplayer.getCash(),
            binplayer.getGold(), 0, binplayer.getTableindex(), binplayer.getAvatarid());
        return player;
    },

    displayInfoRemainCard(remain_card_infos){
        this.currentTableIndex = -1;

        for (i = 0; i < remain_card_infos.length; i++) {
            var val = remain_card_infos[i].getID();
            cc.log("val =", val);

            if (Common.getUserId() === val) {
                this.currentTableIndex = remain_card_infos[i].getTableIndex();
                break;
            }
        }

        var len = remain_card_infos.length;
        for (var i = 0; i < len; i++) {
            this.setPositionPlayer(remain_card_infos[i], i);
        }

        //an nut moi choi o vi tri position_index = 0 neu nguoi minh la nguoi cho
        /*for (Avatar* avatar : avatars){
            if (avatar->getPositionIndex() == 0 && avatar->getPlayerId() != Common::getInstance()->getUserId()){
                showBtnInvite(0, false);
                avatar->setPositionX(originX + width / 2);
                break;
            }
        }*/
    },

    setPositionPlayer(player, position){
        cc.log("player =", player);
        cc.log("position =", position);
        if (player.getTableIndex() < 0){
            return;
        }

        if (player.getTableIndex() >= 5 && player.getId() !== Common.getUserId()){
            return;
        }

        var position_index;  //vi tri that cua nguoi choi

    //     auto avatar = PokerAvatar::create();
    //     avatar->setAnchorPoint(Point::ANCHOR_MIDDLE);
    //     //int position_index = avatar_position[position];
    //     //tinh toan vi tri that cua nguoi choi
        if (player.getTableIndex() >= this.currentTableIndex){
            position_index = player.getTableIndex() - this.currentTableIndex;
        }
        else {
            position_index = player.getTableIndex() - this.currentTableIndex + this.capacity;
        }

        if (position_index >= this.capacity){
            position_index = 0;
        }

        var user_name = player.getName();
        var user_id = player.getID();
        var gold = player.getGold();
        var cash = player.getCash();
    //
        var buffer = cash;
        var image_index = player.getAvatarId();

        var avatar = cc.instantiate(this.avatar_prefab);
        var avatar_comp = avatar.getComponent("Avatar");
        var pos = avatar_comp.avatarPosition(position_index,this.capacity,this.table.getContentSize());
        avatar_comp.loadAvatar(image_index, position_index, user_id, user_name, cash, this.getRoomIndex(), player.isPlayer());
        // avatar_comp.setPlayerId(user_id);
        avatar.setPosition(pos);

        this.table.addChild(avatar,Config.index.AVATAR);

        avatar_comp.init(10);


    //
    //     avatar->loadAvatar(image_index, position_index, user_id, user_name, buffer, roomIndex, player.isPlayer());
    //     avatar->setPosition(getPositionAvatar(position_index));
    //
    //     if (position_index == 0){
    //         if (isUserPlaying()) {
    //             setPositionBetMoneyForMe(avatar);
    //         }
    //         else {
    //             showBtnInvite(0, false);
    //             avatar->setPositionX(originX + width / 2);
    //         }
    //     }
    //     else {
    //         avatar->zoom();
    //     }
    //
    //     if (getOwnerUserId() == Common::getInstance()->convertStringToInt(user_id)){  //neu la chuong
    //         avatar->showChuong(true);
    //     }
    // else {
    //         avatar->showChuong(false);
    //     }
    //
        this.avatars.push(avatar);
        cc.log("avatars =", this.avatars);
    //
    //     if (avatar->getParent() == nullptr)
    //         this->addChild(avatar);
    },

    handleReEnterRoom(enter_room_response){
        if (enter_room_response.hasMessage()){
            Common.showToast(enter_room_response.getMessage());
        }
        if (enter_room_response.getResponsecode()){
            if (enter_room_response.getRoomisplaying()) { //dang choi thi an nut start match di
                //btn_start_match->setVisible(false);
            }

            if (enter_room_response.getEnterroomstatus() === Config.PlayerState.WAITING && enter_room_response.getRoomisplaying()){
                // showNotifyWating();
            }

            if (enter_room_response.getArgsList().length > 0) {
                var table_status = 0;

                var turntype_values;

                for (var i = 0; i < enter_room_response.getArgsList().length; i++) {
                    var entry = enter_room_response.getArgsList()[i];
                    if (entry.getKey() === "tableStatus" && entry.getValue().length !== 0){
                        table_status = parseInt(entry.getValue());

                        if (table_status !== Config.TABLE_STATUS.NOT_PLAYING){
                            var temp = 0;

                            for (var i = 0; i < this.avatars.length; i++) {
                                if (this.avatars[i] !== 0 && this.avatars[i].getComponent("Avatar").isPlayer()
                                    && this.avatars[i].getComponent("Avatar").getPlayerId() !== Common.getUserId()){
                                    var pair_card_other = [];
                                    pair_card_other[this.avatars[i].getComponent("Avatar").getPlayerId()] = temp;
                                    var vt_pair_card_other = [];
                                    vt_pair_card_other.push({
                                        player_id: this.avatars[i].getComponent("Avatar").getPlayerId(),
                                        card_value: temp
                                    });
                                    // vt_pair_card_other.push(pair_card_other);
                                    this.distributeNextCard(vt_pair_card_other, false);
                                }
                            }
                        }
                    }
                    else if (entry.getKey() === "startMatchCdRemaining"){ //thoi gian coutdown bat dau van
                        if (entry.getValue().length !== 0) {
                            var sizePlayer = this.getCurrentSizePlayers();
                            if (table_status === Config.TABLE_STATUS.NOT_PLAYING && this.isUserPlaying() && sizePlayer > 1){
                                var countDown = entry.getValue() / 1000;
                                // if (this->getChildByTag(TAG_TIME_COUNTDOWN) != nullptr){
                                //     this->removeChildByTag(TAG_TIME_COUNTDOWN);
                                // }
                                // addCountDown(countDown, true);
                            }
                            else {
                                var avatar = this.findAvatarOfPlayer(enter_room_response.getCurrentturnuserid());
                                if (avatar !== 0){
                                    // avatar->resetProcessCircleBar();
                                    // avatar->updateProgressCircleBar(100, Common::getInstance()->convertStringToInt(entry.value()));
                                }
                            }
                        }
                    }
                    else if (entry.getKey() === "currentCards"){
                        //////////////////////////////////////
                        var json_val = entry.getValue();
                        var card_values = this.parseCardValue(json_val);
                        if (card_values != null) {
                            for (var j = 0; j < card_values.length; j++) {
                                if (Common.getUserId() === card_values[j].getFirst()) {
                                    var avatar = this.findAvatarOfPlayer(card_values[j].getFirst());
                                    var my_pair_card = [];
                                    my_pair_card[avatar.getPlayerId()] = card_values[j].getSecond();
                                    var my_vt_pair_card = [];
                                    my_vt_pair_card.push({
                                        player_id: avatar.getPlayerId(),
                                        card_value: card_values[j].getSecond()
                                    });
                                    // my_vt_pair_card.push(my_pair_card);
                                    this.distributeNextCard(my_vt_pair_card);
                                }
                            else if (table_status === Config.TABLE_STATUS.MATCH_END){
                                    var avatar = this.findAvatarOfPlayer(card_values[j].getFirst());
                                    if (avatar != 0){
                                        avatar.flipCards(card_values[j].getSecond());
                                    }
                                }
                            }
                        }
                    }
                    else if (entry.getKey() == "communityCard"){
                        var lst_card = entry.getValue().split(",");

                        prepareCommunityCard(lst_card);
                    }
                    else if (entry.getKey() == "turnPokerType"){
                        //hien thi tren avatar current turn trang thai tuong ung voi turnPokerType tra ve
                        var json_val = entry.getValue();
                        turntype_values = parseTurnType(json_val);
                    }
                    else if (entry.getKey() == "currentMoneyBet"){
                        var json_val = entry.getValue();
                        if (json_val != null){
                            var moneybet_values = parseTurnType(json_val);

                            for (var j = 0; j < moneybet_values.length; j++){
                                var avatar = this.findAvatarOfPlayer(moneybet_values[j].getFirst());
                                if (avatar != 0 && moneybet_values[j].getSecond > 0){
                                    avatar.setBetMoney(moneybet_values[j].getSecond());
                                }
                            }
                        }
                    }
                    else if (entry.getKey() == "currentPlayerAction"){
                        var json_val = entry.getValue();
                        this.player_action = parseNextPlayerAction(json_val);
                        showBtnPlayerAction(player_action);
                    }
                    else if (entry.getKey() == "totalMoneyBet"){
                        //hien thi tong tien dat tren ban choi
                        setMoneyBetTable(entry.getValue());
                    }
                    else if (entry.getKey() == "limitBetRatio"){
                        this.countIncrease = entry.getValue();
                    }
                }

                if (turntype_values != null){
                    for (var j = 0; j < turntype_values.length; j++){
                        var avatar = this.findAvatarOfPlayer(turntype_values[j].getFirst());
                        if (avatar != 0 && turntype_values[j].getSecond() > 0){
                            avatar.setPlayStatus(turntype_values[j].getSecond());
                            showPlayStatus(turntype_values[j].getSecond(), avatar);
                        }
                    }
                }
            }
        }
    },

    getCurrentSizePlayers(){
        var result = 0;

        for (var i = 0; i < this.lst_player.length; i++){
            if (this.lst_player[i].isPlayer()){
                result++;
            }
        }

        return result;
    },

    isUserPlaying(){
        var user_id = Common.getUserId();
        var player = this.findPlayer(user_id);
        if (player !== 0){
            return true;
        }
        return false;
    },

    findPlayer(player_id){

        for (var i = 0; i < this.lst_player.length; i++){
            if (this.lst_player[i].isPlayer() && this.lst_player[i].getID() === player_id){
                return this.lst_player[i];
            }
        }
        return null;
    },

    findAvatarOfPlayer(player_id){
        cc.log("player id =", player_id);
        for (var i = 0; i < this.avatars.length; i++){
            cc.log("this.avatars =", this.avatars);
            if (this.avatars[i].getComponent("Avatar").getPlayerId() === player_id){
                return this.avatars[i];
            }
        }
        return null;
    },

    parseCardValue(json_value){
        var result = [];
        try {
            for (var itr = 0; itr < json_value.length; itr++) {
                var val = itr.getValue();
                var card_values = val.split(",");
                var user_id = itr.getName();
                result.push(user_id, card_values);
            }
        }
        catch (e) {
            cc.log("exception");
            result = [];
        }

        return result;
    },

    startMatchResponseHandler(response){
        cc.log("startMatchResponseHandler =", response);
        if (response !== 0) {
            if (response.hasMessage() && response.getMessage() != null){
                Common.showToast(response.getMessage());
            }
            if (response.getResponsecode()) {
                // if (this->getChildByTag(TAG_TIME_COUNTDOWN) != nullptr){
                //     this->removeChildByTag(TAG_TIME_COUNTDOWN);
                // }

                //an nut start match
                //btn_start_match->setVisible(false);

                Common.setFirstTurnUserId(response.getFirstturnuserid());

                var avatar_first_turn = this.findAvatarOfPlayer(response.getFirstturnuserid());
                if (avatar_first_turn !== 0 && response.getCountdowntimer() > 0) {
                    // avatar_first_turn->resetProcessCircleBar();
                    // avatar_first_turn->updateProgressCircleBar(100, response->countdowntimer());
                }

                if (response.getArgsList().length > 0)  {  //truong hop da dat cuoc thi chia bai
                    for (var i = 0; i < response.getArgsList().length; i++){
                        if (response.getArgsList()[i].getKey() === "currentCards" && this.findAvatarOfPlayer(Common.getUserId()) !== 0){
                            var current_card_values = response.getArgsList()[i].getValue().split(",");
                            var pair_card_current = [];
                            pair_card_current.push({
                                player_id: Common.getUserId(),
                                card_value: current_card_values
                            });
                            // pair_card_current[Common.getUserId()] = current_card_values;
                            var vt_pair_card_current = [];
                            vt_pair_card_current.push({
                                player_id: Common.getUserId(),
                                card_value: current_card_values
                            });
                            cc.log("vt_pair_card_current =", vt_pair_card_current);
                            this.distributeNextCard(vt_pair_card_current);
                        }
                    else if (response.getArgsList()[i].getKey() === "nextPlayerAction"){
                            var json_val = response.getArgsList()[i].getValue();
                            cc.log("json_val =", json_val);
                            this.player_action = this.parseNextPlayerAction(json_val);
                        }
                        else if (response.getArgsList()[i].getKey() === "totalMoneyBet"){
                            //hien thi tong tien dat tren ban choi
                            cc.log("totalMoneyBet =", response.getArgsList()[i].getValue());
                            this.setMoneyBetTable(response.getArgsList()[i].getValue());
                        }
                        else if (response.getArgsList()[i].getKey() === "limitBetRatio"){
                            cc.log("limitBetRatio =", response.getArgsList()[i].getValue());
                            this.countIncrease = response.getArgsList()[i].getValue();
                        }
                        else if (response.getArgsList()[i].getKey() === "sid"){
                            cc.log("sid =", response.getArgsList()[i].getValue());
                            this.showValueMatch(response.getArgsList()[i].getValue());
                        }
                    }
                }

                if (Common.getFirstTurnUserId() === 0){  //lan dau chia bai
                    //show card cover
                    var other_card;
                    for (var i = 0; i < this.avatars.length; i++){
                        if (this.avatars[i].getComponent("Avatar").isPlayer()
                            && this.avatars[i].getComponent("Avatar").getPlayerId() !== Common.getUserId()){
                            var pair_card_other = [];
                            pair_card_other[this.avatars[i].getComponent("Avatar").getPlayerId()] = other_card;
                            var vt_pair_card_other = [];
                            vt_pair_card_other.push({
                                player_id: this.avatars[i].getComponent("Avatar").getPlayerId(),
                                card_value: other_card
                            });
                            // vt_pair_card_other.push(pair_card_other);
                            this.distributeNextCard(vt_pair_card_other);
                        }
                    }
                }
            }
        }
    },

    playerEnterRoomResponseHandler(newplayerresponse){
        cc.log("newplayerresponse =", newplayerresponse);
        if (newplayerresponse !== 0) {
            if (newplayerresponse.getResponsecode()) {
                var player = this.convertFromBINPlayer(newplayerresponse.getPlayer());

                //neu la nguoi choi
                if (newplayerresponse.getEnterroomstatus() === Config.PlayerState.PLAYING){
                    //player_list.push_back(newplayerresponse->player());
                    player.setPlayer(true);
                    this.lst_player.push(player);
                    this.setPositionPlayer(player, this.lst_player.length - 1);

                    var sizePlayer = this.getCurrentSizePlayers();

                    if (Common.getUserId() === Common.getOwnerUserId() && sizePlayer >= 2){
                        //btn_start_match->setVisible(true);
                    }

                    if (sizePlayer >= 2 && newplayerresponse.getChangeownerroomcd() > 0) {
                        // if (this->getChildByTag(TAG_TIME_COUNTDOWN) != nullptr){
                        //     this->removeChildByTag(TAG_TIME_COUNTDOWN);
                        // }
                        //
                        // int time_wait = newplayerresponse->changeownerroomcd() / 1000;
                        // addCountDown(time_wait, true);
                    }
                }
                else {
                    // xu ly voi nguoi cho
                    if (newplayerresponse.getEnterroomstatus() === Config.PlayerState.WAITING){
                        player.setPlayer(false);
                        this.lst_player.push(player);
                        this.setPositionPlayer(player, this.lst_player.length - 1);
                    }
                }
            }
            else {
                Common.showToast(newplayerresponse.getMessage());
            }
        }
    },

    playerExitRoomResponse(_player_exit_room_response){
        cc.log("_player_exit_room_response =", _player_exit_room_response);
        if (_player_exit_room_response !== 0) {
            if (_player_exit_room_response.getResponsecode()) {
                var leng = this.lst_player.length;

                var ownerUserId = _player_exit_room_response.getOwneruserid();

                if (ownerUserId !== 0){
                    Common.setOwnerUserId(ownerUserId);
                    this.is_create_room = Common.getUserId() === ownerUserId;
                    // displayLockRoomForOwner(ownerUserId);

                    //show chuong moi
                    var newOnwer = this.findAvatarOfPlayer(ownerUserId);
                    if (newOnwer !== 0){
                        // newOnwer->showChuong(true);
                        // newOnwer->setBetMoney(0);
                    }
                }

                for (var i = 0; i < leng; i++) {
                    //xoa nguoi choi khoi ban choi
                    var user_id = this.lst_player[i].getID();
                    if (user_id === _player_exit_room_response.getExituserid()){
                        // this.lst_player.erase(lst_player.begin() + i);

                        var avatar = this.findAvatarOfPlayer(_player_exit_room_response.getExituserid());
                        if (avatar !== 0){
                            avatar = [];
                            // hiddenPlayStatus(_player_exit_room_response.getExituserid());
                            // hiddenTextEmotion(_player_exit_room_response.getExituserid());
                            //xoa avatar khoi ban choi (khong hien thi nua)
                            this.removeOutTablePlay(avatar);
                            //xoa khoi danh sach luu avatars
                            // avatars.erase(std::remove(avatars.begin(), avatars.end(), avatar), avatars.end());
                        }

                        break;
                    }
                }

                var sizePlayer = this.getCurrentSizePlayers();

                if (sizePlayer < 2){
                    //btn_start_match->setVisible(false);
                    // this->removeChildByTag(TAG_TIME_COUNTDOWN);
                }
            }

            if (_player_exit_room_response.hasMessage()){
                Common.showToast(_player_exit_room_response.getMessage());
            }
        }
    },

    removeOutTablePlay(avatar){
        // this->removeChild(avatar, true);
    },

    cancelExitAfterMatchEndResponseHandler(cancel_exit_room_response){
        cc.log("cancel_exit_room_response =", cancel_exit_room_response);
        if (cancel_exit_room_response !== 0 && cancel_exit_room_response.getCancelexituserid()) {
            if (cancel_exit_room_response.getResponsecode()) {

                var cancelExitUserId = cancel_exit_room_response.getCancelexituserid();
                var playCancelExitRoom = this.findPlayer(cancelExitUserId);

                if (playCancelExitRoom !== 0){
                    var avatar = this.findAvatarOfPlayer(cancel_exit_room_response.getCancelexituserid());
                    if (avatar !== 0){
                        // avatar->showRegisterExitRoom(false);
                        if (cancel_exit_room_response.getCancelexituserid() === Common.getUserId()){
                            Common.showToast("TXT_CANCEL_EXITROOM");
                        }
                    }
                }
            }
            else {
                Common.showToast(cancel_exit_room_response.getMessage());
            }
        }
    },

    playerExitAfterMatchEndResponse(exit_room_player_response){
        cc.log("exit_room_player_response =", exit_room_player_response);
        if (exit_room_player_response !== 0) {
            if (exit_room_player_response.getResponsecode()) {
                var leng = this.lst_player.length;
                for (var i = 0; i < leng; i++) {
                    //reset position
                    var user_id = this.lst_player[i].getID();
                    if (user_id === exit_room_player_response.getExituserid()){
                        var avatar = this.findAvatarOfPlayer(exit_room_player_response.getExituserid());
                        if (avatar !== 0){
                            // avatar->showRegisterExitRoom(true);
                        }
                        break;
                    }
                }
            }
        }
    },

    distributeNextCard(nextCards, animation){

        if (nextCards.length !== 0){
            this.sprite_cover_card.active = true;

            var call_hidden_cover_card_func = cc.callFunc(function () {
                this.sprite_cover_card.active = false;
            },this);

            var init_pos_card = this.sprite_cover_card.getContentSize().width;
            var width_card_tags = 0;
            for (var i = 0; i < nextCards.length; i++){
                var objNextCards = nextCards[i];
                cc.log("objNextCards player id =", objNextCards.player_id);
                cc.log("objNextCards value =", objNextCards.card_value);
                var pokerAvatar = this.findAvatarOfPlayer(objNextCards.player_id);
                var avatar = pokerAvatar.getComponent("Avatar");
                cc.log("pokerAvatar =", pokerAvatar);
                if (pokerAvatar !== null){
                    var from = this.sprite_cover_card.getPosition();
                    var to;

                    if (objNextCards.player_id === Common.getUserId()){
                        for (var j = 0; j < objNextCards.card_value.length; j++){
                            cc.log("nguoi choi");
                            // var sizeCard = cardWidth();
                            //
                            // Card card;
                            // card.setValue(nextCards[i].second[j]);
                            //
                            // PokerCardSprite* card_cover = PokerCardSprite::createCard(card, cardWidth());
                            // this->addChild(card_cover, INDEX_CARD);
                            //
                            // to = Vec2(originX + visibleSize.width * paddingInitCard + card_tag.size() * cardWidth() * 0.5f
                            //     , posYCard());
                            // if (animation){
                            //     card_cover->setPosition(from);
                            //     card_cover->runAction(Sequence::create(Spawn::create(MoveTo::create(0.4f + 0.4f * j, to), NULL)
                            // , call_hidden_cover_card_func, NULL));
                            // }
                            // else {
                            //     card_cover->setPosition(to);
                            //     sprite_cover_card->setVisible(false);
                            // }
                            //
                            // card_tag.push_back(card_cover);
                        }
                    }
                else {
                        for (var j = 0; j < 2; j++){
                            var card_cover = cc.instantiate(this.sprite_cover_card);
                            card_cover.active = true;
                            var toPos = cc.p(pokerAvatar.getPositionX(), pokerAvatar.getPositionY()).addSelf(avatar.getCardCoverPosition());
                            toPos.addSelf(cc.p(0.5*j*card_cover.width,0));

                            console.log("width : ",card_cover.width);
                            console.log("to : ",toPos);
                            avatar.addCardCover(card_cover);

                            card_cover.runAction(cc.moveTo(0.5 + j*0.5, toPos).easing(cc.easeCubicActionOut()));
                            this.node.addChild(card_cover);
                            //
                            // if (animation){
                            //ss
                            // }else {
                            //     card_cover.setPosition(to);
                            //     card_cover.active = false;
                            // }
                        }

                        // pokerAvatar->showBetMoney();
                    }
                }
            }
        }
    },

    parseNextPlayerAction(json_value){
        var card_values = [];
        try {
            for (var i = 0; i < json_value.length; i++){
                card_values.push(json_value[i]);
            }
        }
        catch (e) {
            card_values = [];
        }

        return card_values;
    },

    setMoneyBetTable(moneyBet){
        // if (moneyBet == 0){
        //     lb_money_bet->setVisible(false);
        //     return;
        // }
        // lb_money_bet->setString(Common::getInstance()->numberFormat(moneyBet));
        // lb_money_bet->setVisible(true);
    },

    raiseEvent(){
        this.onEventTypeConfirm(1000, Config.PLAYER_ACTION.RAISE);
    },

    callEvent(){
        this.onEventTypeConfirm(1000, Config.PLAYER_ACTION.CALL);
    },

    foldEvent(){
        this.onEventTypeConfirm(1000, Config.PLAYER_ACTION.FOLD);
    },

    allInEvent(){
        this.onEventTypeConfirm(1000, Config.PLAYER_ACTION.ALL_IN);
    },

    condescendEvent(){
        this.onEventTypeConfirm(1000, Config.PLAYER_ACTION.CONDESCEND);
    },

    onEventTypeConfirm(enventType, turnType, raiseMoney){
        // if (enventType == OnEvenConfirmRaise::EVENT_CONFIRM_OK){
            var entries = [];

            var entryTurnType = new proto.BINMapFieldEntry();
            entryTurnType.setKey("turnPokerType");
            entryTurnType.setValue(turnType.toString());
            entries.push(entryTurnType);

            if (turnType === Config.PLAYER_ACTION.RAISE){
                var entryTurnMoney = new proto.BINMapFieldEntry();
                entryTurnMoney.setKey("turnPokerMoney");
                entryTurnMoney.setValue(raiseMoney);
                entries.push(entryTurnMoney);
            }
            NetworkManager.getTurnMessageFromServer(Common.ZONE_ID.POKER, this.roomIndex, entries);
        // }
    },

    turnResponse(turnresponse){
        cc.log("turnresponse =", turnresponse);
        if (turnresponse !== 0) {
            if (turnresponse.hasMessage() && turnresponse.getMessage() !== "") {
                Common.showToast(turnresponse.getMessage());
            }
            if(turnresponse.hasZoneid()){
                var zoneId = turnresponse.getZoneid();
                    if (turnresponse.getResponsecode()) {
                        var current_turn_id = turnresponse.getCurrentturnuserid();
                        var next_turn_id = turnresponse.getNextturnuserid();

                        cc.log("current_turn_id =", current_turn_id);
                        cc.log("next_turn_id =", next_turn_id);

                        if (next_turn_id > 0){
                            Common.setFirstTurnUserId(next_turn_id);
                        }

                        //neu la nguoi choi hien tai thi reset countdown
                        var avatar_current_turn = this.findAvatarOfPlayer(current_turn_id);
                        cc.log("avatar_current_turn =", avatar_current_turn);
                        if (avatar_current_turn !== null){
                            this.stopProcessCircleBar();
                            avatar_current_turn.getComponent("Avatar").init(10);
                            this.showBtnPlayerAction(false);

                            // showRaise(false);
                        }

                        //neu chua ket thuc van choi
                        if (!turnresponse.getMatchend()){
                            //set countdown cho nguoi tiep theo
                            var avatar_next_turn = this.findAvatarOfPlayer(next_turn_id);
                            cc.log("avatar_next_turn =", avatar_next_turn);
                            if (avatar_next_turn !== null){
                                this.stopProcessCircleBar();
                                avatar_next_turn.getComponent("Avatar").init(10);
                                // avatar_next_turn.updateProgressCircleBar(100, turnresponse.getCountdowntimer());
                            }
                        }

                        if (turnresponse.getArgsList().length > 0) {
                            for (var i = 0; i < turnresponse.getArgsList().length; i++){
                                var entry = turnresponse.getArgsList()[i];
                                if (entry.getKey() === "nextPlayerAction" && next_turn_id === Common.getUserId()) {
                                    var json_val = entry.getValue();
                                    this.player_action = this.parseNextPlayerAction(json_val);
                                    //hien thi cac action cua next turn
                                    this.showBtnPlayerAction(this.player_action);
                                }
                            else if (entry.getKey() === "communityCard"){
                                    var lst_card = entry.getValue().split(",");

                                    this.prepareCommunityCard(lst_card);
                                }
                                else if (entry.getKey() === "totalMoneyBet"){  //tong cuoc tren ban
                                    // auto callFuncSetTotalMoneyBet = CallFunc::create([=]{
                                    //     //clear status theo, va to
                                    //     for (PokerAvatar* xtAvatar : avatars){
                                    //         if (xtAvatar->isPlayer()){
                                    //             if (xtAvatar->getTurnType() == PLAYER_ACTION::CONDESCEND){
                                    //                 hiddenPlayStatus(xtAvatar->getPlayerId());
                                    //             }
                                    //             if (xtAvatar->getTurnType() == PLAYER_ACTION::CALL
                                    //                 || xtAvatar->getTurnType() == PLAYER_ACTION::RAISE){
                                    //                 hiddenPlayStatus(xtAvatar->getPlayerId());
                                    //                 throwMoney(xtAvatar, true);
                                    //             }
                                    //         else if (xtAvatar->getTurnType() == PLAYER_ACTION::ALL_IN && !xtAvatar->isAllIn()){
                                    //                 throwMoney(xtAvatar, true);
                                    //                 xtAvatar->setAllIn(true);
                                    //             }
                                    //             xtAvatar->setBetMoney(0);
                                    //         }
                                    //     }
                                    //
                                    //     //hien thi tong tien dat tren ban choi
                                    //     //setMoneyBetTable(Common::getInstance()->convertStringToLongLong(entry.value()));
                                    // });
                                    //
                                    // bkgTable->runAction(Sequence::create(DelayTime::create(0.6f), callFuncSetTotalMoneyBet, DelayTime::create(0.1f),
                                    // CallFunc::create([=]{ setMoneyBetTable(Common::getInstance()->convertStringToLongLong(entry.value()));
                                    // }), nullptr));
                                }
                                else if (entry.getKey() === "turnPokerType" && avatar_current_turn !== 0){
                                    //hien thi tren avatar current turn trang thai tuong ung voi turnXiToType tra ve
                                    var turnType = entry.getValue();
                                    if (turnType > 0){
                                        // avatar_current_turn->setPlayStatus(turnType);
                                        // showPlayStatus(turnType, avatar_current_turn);

                                        if (turnType === Config.PLAYER_ACTION.RAISE){  //neu to thi clear to va theo cua nhung thang khac
                                            for (var i = 0; i < this.avatars.length; i++){
                                                if (this.avatars[i] !== avatar_current_turn && this.avatars[i].getComponent("Avatar").isPlayer()
                                                    && (this.avatars[i].getComponent("Avatar").getTurnType() === Config.PLAYER_ACTION.CALL
                                                    || this.avatars[i].getComponent("Avatar").getTurnType() === Config.PLAYER_ACTION.RAISE
                                                        || this.avatars[i].getComponent("Avatar").getTurnType() === Config.PLAYER_ACTION.CONDESCEND)){
                                                    // hiddenPlayStatus(xtAvatar->getPlayerId());
                                                }
                                            }
                                        }
                                    }
                                }
                                else if (entry.getKey() === "currentMoneyBet" && avatar_current_turn !== 0){
                                    var moneyTurn = entry.getValue();
                                    // avatar_current_turn->setBetMoney(moneyTurn);
                                }
                            }

                            // showCall(next_turn_id);

                        }
                    }

            }
        }
    },

    stopProcessCircleBar(){
        for (var i = 0; i < this.avatars.length; i++){
            this.avatars[i].getComponent("Avatar").stop();
        }
    },

    prepareCommunityCard(lstCard){
        var last_community;
        if (this.card_community.length === 0){
            last_community = lstCard;
        }
        else {
            for (var i = 0; i < lstCard.length; i++){
                if (!Common.containInList(this.card_community, lstCard[i])){
                    last_community.push(lstCard[i]);
                }
            }
        }

        this.showCommunityCard(last_community);
    },

    showCommunityCard(lstCard){
        // var sizeCard = cardWidth() * 0.75;
        // var width_card_tags = 4 * sizeCard * 1.1;
        // for (var i = 0; i < lstCard.length; i++){
        //     PokerCardSprite* cardSprite = PokerCardSprite::createCard(Card(lstCard[i]), sizeCard);
        //     cardSprite->setPosition(MVec2(visibleSize.width * 0.5f + width_card_tags * 0.5f + 0.5f * sizeCard,
        //     visibleSize.height * 0.63f ));  //+ cardSprite->getHeight() / 2
        //
        //     auto moveTo = MoveTo::create(0.3f*(0.4f+i), MVec2(visibleSize.width * 0.5f - width_card_tags * 0.5f + (i + card_community.size()) * 1.1f * sizeCard,
        //     visibleSize.height * 0.63f));
        //
        //     this->addChild(cardSprite);
        //     cardSprite->runAction(moveTo);
        //
        //     card_community_tag.push_back(cardSprite);
        // }
        //
        // this.card_community.insert(card_community.end(), lstCard.begin(), lstCard.end());
    },


    initAvatar: function (capacity) {

        for(var i = 0; i < capacity; i++){
            var avatar = cc.instantiate(this.avatar_prefab);
            var avatar_comp = avatar.getComponent("Avatar");
            var pos = avatar_comp.avatarPosition(i,capacity,this.table.getContentSize());
            avatar.setPosition(pos);

            this.table.addChild(avatar,Config.index.AVATAR);

            avatar_comp.init(10);
        }
    }
});
