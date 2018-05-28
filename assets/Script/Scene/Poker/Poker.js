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
        sprite_cover_card: cc.Node,
        card_prefab: cc.Prefab,
        lb_money_bet: cc.Label

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
            case NetworkManager.MESSAGE_ID.READY_TO_PLAY:
                this.readyToPlayResponse(msg);
                break;
            case NetworkManager.MESSAGE_ID.BET:
                this.betResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.UPDATE_MONEY:
                this.updateMoneyResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.MATCH_END:
                this.matchEndResponseHandler(msg);
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
                                    avatar.getComponent("Avatar").resetProcessCircleBar();
                                    avatar.getComponent("Avatar").updateProgressCircleBar(entry.getValue());
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
                    else if (entry.getKey() === "communityCard"){
                        var lst_card = entry.getValue().split(",");

                        prepareCommunityCard(lst_card);
                    }
                    else if (entry.getKey() === "turnPokerType"){
                        //hien thi tren avatar current turn trang thai tuong ung voi turnPokerType tra ve
                        var json_val = entry.getValue();
                        turntype_values = parseTurnType(json_val);
                    }
                    else if (entry.getKey() === "currentMoneyBet"){
                        var json_val = entry.getValue();
                        if (json_val != null){
                            var moneybet_values = parseTurnType(json_val);

                            for (var j = 0; j < moneybet_values.length; j++){
                                var avatar = this.findAvatarOfPlayer(moneybet_values[j].getFirst());
                                if (avatar != 0 && moneybet_values[j].getSecond > 0){
                                    avatar.getComponent("Avatar").setBetMoney(moneybet_values[j].getSecond());
                                }
                            }
                        }
                    }
                    else if (entry.getKey() === "currentPlayerAction"){
                        var json_val = entry.getValue();
                        this.player_action = parseNextPlayerAction(json_val);
                        this.showBtnPlayerAction(player_action);
                    }
                    else if (entry.getKey() === "totalMoneyBet"){
                        //hien thi tong tien dat tren ban choi
                        this.setMoneyBetTable(entry.getValue());
                    }
                    else if (entry.getKey() === "limitBetRatio"){
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

    findWaiting(player_id){
        for (var i = 0; i < this.lst_player.length; i++){
            if (!this.lst_player[i].isPlayer() && lst_player[i].getID() == player_id){
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
        if (response !== 0) {
            cc.log("startMatchResponseHandler =", response);
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

                    avatar_first_turn.getComponent("Avatar").resetProcessCircleBar();
                    avatar_first_turn.getComponent("Avatar").updateProgressCircleBar(response.getCountdowntimer());
                }

                if (response.getArgsList().length > 0)  {  //truong hop da dat cuoc thi chia bai
                    for (var i = 0; i < response.getArgsList().length; i++){
                        if (response.getArgsList()[i].getKey() === "currentCards" && this.findAvatarOfPlayer(Common.getUserId()) !== 0){
                            var current_card_values = response.getArgsList()[i].getValue().split(",");
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

    matchBeginResponseHandler(matchbeginresponse){
        if (matchbeginresponse !== null) {
            if (matchbeginresponse.hasMessage() && matchbeginresponse.getMessage() !== "") {
                Common.showToast(matchbeginresponse.getMessage());
            }
            if(matchbeginresponse.hasZoneid()){
                if (matchbeginresponse.getResponsecode()) {
                    var first_turn_user_id = Common.getFirstTurnUserId();

                    var avatar = this.findAvatarOfPlayer(first_turn_user_id);
                    if (avatar !== null && matchbeginresponse.getCountdowntimer() > 0){
                        avatar.getComponent("Avatar").resetProcessCircleBar();
                        avatar.getComponent("Avatar").updateProgressCircleBar(matchbeginresponse.getCountdowntimer());

                        //hien thi cac action cua nguoi choi
                        if (Common.getUserId() === first_turn_user_id){
                            this.showBtnPlayerAction(this.player_action);
                        }
                    }

                    this.showCall(first_turn_user_id);
                }
            }
        }
    },

    playerEnterRoomResponseHandler(newplayerresponse){
        if (newplayerresponse !== 0) {
            cc.log("newplayerresponse =", newplayerresponse);
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
        if (_player_exit_room_response !== 0) {
            cc.log("_player_exit_room_response =", _player_exit_room_response);
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
                        newOnwer.getComponent("Avatar").setBetMoney(0);
                    }
                }

                for (var i = 0; i < leng; i++) {
                    //xoa nguoi choi khoi ban choi
                    var user_id = this.lst_player[i].getID();
                    if (user_id === _player_exit_room_response.getExituserid()){
                        // this.lst_player.erase(lst_player.begin() + i);

                        var avatar = this.findAvatarOfPlayer(_player_exit_room_response.getExituserid());
                        if (avatar !== 0){
                            //avatar = [];
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
        avatar.removeFromParent(true);
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
                            var item = cc.instantiate(this.card_prefab);
                            item.setScale(0.5, 0.5);
                            // var toPos = cc.p(pokerAvatar.getPositionX(), pokerAvatar.getPositionY()).addSelf(avatar.getCardCoverPosition());
                            // toPos.addSelf(cc.p(0.5*j*item.node.getContentSize().width,0));
                            var posX = (j - 1) * item.getContentSize().width/2;
                            var posY = - item.getContentSize().height/2;
                            item.getComponent('CardItem').replaceCard(objNextCards.card_value[j]);
                            item.setPositionY(posY);
                            item.setPositionX(posX);
                            // item.setPosition(toPos);

                            this.node.addChild(item);

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
        if (moneyBet === 0){
            this.lb_money_bet.node.active = false;
            return;
        }
        this.lb_money_bet.string = moneyBet;
        this.lb_money_bet.node.active = true;
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

    resetDisplayAvatar(){
        if (!avatars.empty()){
         for (var i = 0; i < this.avatars.length; i++){
             //avatars[i].clear();
              //hiddenPlayStatus(avatars[i]->getPlayerId());
              //hiddenTextEmotion(avatars[i]->getPlayerId());

               if (avatars[i].getParent() != 0){
                   avatars[i].removeFromParent(true);
                }
            }

            this.avatars.cleanup();
        }
    },

    readyToPlayResponse(msg){
        cc.log("ready to play response =", msg);
        if (msg !== 0) {
            if (msg.getResponsecode()){
                var ready_player_id = msg.getReadyuserid();
                var table_index = msg.getTableindex();
                var player = this.findWaiting(ready_player_id);

                if (player != 0){
                    //day vao lst playing
                    player.setTableIndex(table_index);
                    player.setPlayer(true);

                    //remove avatar tren ban choi
                    this.resetDisplayAvatar();
                    //dat waiting player len ban choi
                    displayInfoRemainCard(this.lst_player);

                    var sizePlayer = getCurrentSizePlayers();
                }

                // int countDown = ready_to_play_response->countdowntimer() / 1000;
                // if (this->getChildByTag(TAG_TIME_COUNTDOWN) != nullptr){
                //     this->removeChildByTag(TAG_TIME_COUNTDOWN);
                // }
                //this.addCountDown(countDown, true);
            }

            if (msg.hasMessage()){
                Common.showToast(msg.getMessage());
            }
        }
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
                                    avatar_current_turn.getComponent("Avatar").setBetMoney(moneyTurn);
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
        var sizeCard = cardWidth() * 0.75;
        var width_card_tags = 4 * sizeCard * 1.1;
        for (var i = 0; i < lstCard.length; i++){
            var item = cc.instantiate(this.card_prefab);

            var item = cc.instantiate(this.card_prefab);
            var posX = (i - 1) * item.getContentSize().width/2;
            var posY = - item.getContentSize().height/2;
            item.getComponent('CardItem').replaceCard(lstCard[i]);
            item.setPositionY(posY);
            item.setPositionX(posX);

            this.node.addChild(item);

            // PokerCardSprite* cardSprite = PokerCardSprite::createCard(Card(lstCard[i]), sizeCard);
            // cardSprite->setPosition(MVec2(visibleSize.width * 0.5f + width_card_tags * 0.5f + 0.5f * sizeCard,
            // visibleSize.height * 0.63f ));  //+ cardSprite->getHeight() / 2
            //
            // var moveTo = MoveTo::create(0.3f*(0.4f+i), MVec2(visibleSize.width * 0.5f - width_card_tags * 0.5f + (i + card_community.size()) * 1.1f * sizeCard,
            // visibleSize.height * 0.63f));
            //
            // this->addChild(cardSprite);
            // cardSprite->runAction(moveTo);

            this.card_community_tag.push(item);
        }

        this.card_community.push(lstCard);
    },

    matchEndResponseHandler(endmatchresponse){

        if (endmatchresponse !== null) {
            if (endmatchresponse.hasMessage() && endmatchresponse.getMessage() !== "") {
                Common.showToast(endmatchresponse.getMessage());
            }
            if(endmatchresponse.hasZoneid()){
                var zoneId = endmatchresponse.getZoneid();

                    if (endmatchresponse.getResponsecode()) {
                        this.showBtnPlayerAction(false);

                        for (var i = 0; i < this.avatars.length; i++){
                            if (this.avatars[i].getComponent("Avatar").isPlayer()){
                                // this.avatars[i]->resetProcessCircleBar();
                                hiddenPlayStatus(this.avatars[i].getComponent("Avatar").getPlayerId());
                                this.avatars[i].getComponent("Avatar").setBetMoney(0);
                            }
                        }

                        handleWinLose(endmatchresponse);

                        //lat bai cua nguoi choi
                        for (var i = 0; i < endmatchresponse.getArgsList().length; i++) {
                            var entry = endmatchresponse.getArgsList()[i];
                            if (entry.getKey() === "currentCards"){
                                var json_val = entry.getValue();
                                var card_values = this.parseCardValue(json_val);
                                if (card_values !== null) {
                                    for (var j = 0; j < card_values.length; j++) {
                                        if (Common.getUserId() !== card_values[j].getFirst()) {
                                            var avatar = this.findAvatarOfPlayer(card_values[j].getFirst());
                                            if (avatar !== null){
                                                // //lat cay bai con lai cua avatar
                                                // avatar->flipCards(card_values[j].second);
                                            }
                                        }
                                    }
                                }
                            }
                            else if (entry.getKey() === "highLightCard"){
                                var json_val = entry.getValue();
                                var card_values = this.parseCardValue(json_val);
                                if (card_values !== null) {
                                    var lst_user_id_highlight;
                                    for (var it in card_values){
                                        showHighLightCard(card_values[it].getFirst(), card_values[it].getSecond());
                                        lst_user_id_highlight.push(card_values[it].getFirst());
                                    }

                                    for (var i in this.avatars){
                                        if (this.avatars[i].getComponent("Avatar").isPlayer() && !Common.containInList(lst_user_id_highlight, this.avatars[i].getComponent("Avatar").getPlayerId())){
                                            if (this.avatars[i].getComponent("Avatar").getPlayerId() === Common.getUserId()){
                                                for (var itCard in this.card_tag){
                                                    // itCard->addHidden();
                                                    // itCard->showHidden(true);
                                                }
                                            }
                                        else {
                                                // pokerAvatar->addAllHiddenCard();
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        for (var i = 0; i < endmatchresponse.getTextemoticonsList().length; i++) {
                            var text_emoticon = endmatchresponse.getTextemoticonsList()[i];
                            //get user id
                            var user_id = text_emoticon.getUserid();
                            //get text_emotion_id
                            var emotion_id = text_emoticon.getEmoticonid();
                            //string txt msg
                            var msg_emoticon = text_emoticon.getMessage();

                            var avatar = this.findAvatarOfPlayer(user_id);
                            if (avatar !== null){
                                showTextEmoticon(msg_emoticon, emotion_id, avatar, 2);
                            }
                        }

                        //reset tien tren ban choi
                        setMoneyBetTable(0);
                    }

            }
        }
    },

    preparenewMatchHandler(response){
        // BINPrepareNewMatchResponse *response = (BINPrepareNewMatchResponse*)
        // Common::getInstance()->checkEvent(NetworkManager::PREPARE_NEW_MATCH);
        if (response !== null) {

            if (response.getResponsecode()){
                // this.player_action.clear();

                // //show coutdown bat dau van tiep theo
                // if (this->getChildByTag(TAG_TIME_COUNTDOWN) != nullptr){
                //     this->removeChildByTag(TAG_TIME_COUNTDOWN);
                // }
                // addCountDown(response->countdowntimer() / 1000, true);

                // //clear carg_tag
                // for (var i = 0; i < this.card_tag.length; i++) {
                //     if (this.card_tag[i]->getParent() !== null) {
                //         card_tag[i]->removeFromParentAndCleanup(true);
                //     }
                // }
                // card_tag.clear();

                //clear card community
                for (var i = 0; i < this.card_community_tag.length; i++) {
                    if (this.card_community_tag[i].getParent() != null) {
                        // card_community_tag[i]->removeFromParentAndCleanup(true);
                    }
                }
                // this.card_community.clear();
                // this.card_community_tag.clear();

                //clear card in avatar
                for (var i = 0; i < this.avatars.length; i++) {
                    if (this.avatars[i].getComponent("Avatar").isPlayer()){
                        // avatars[i]->clear();
                        hiddenTextEmotion(this.avatars[i].getComponent("Avatar").getPlayerId());
                        this.avatars[i].getComponent("Avatar").setBetMoney(0);

                        // //reset allin
                        // if (avatars[i]->isAllIn()){
                        //     avatars[i]->setAllIn(false);
                        // }
                    }
                }

                showTitleBtnCall(0);

                //reset action nguoi choi
                this.showBtnPlayerAction(false);

                //clear money bet
                setMoneyBetTable(0);

                var sizePlayer = this.getCurrentSizePlayers();

                if (Common.getUserId() === Common.getOwnerUserId() && sizePlayer >= 2) {
                    //btn_start_match->setVisible(true);
                }
            }

            if (response.hasMessage()){
                Common.showToast(response.getMessage());
            }
        }
    },

    betResponseHandler(response){
    //     BINBetResponse *response = (BINBetResponse *)Common::getInstance()
    // ->checkEvent(NetworkManager::BET);
        if (response !== null) {
            if (response.hasMessage() && response.getMessage() !== "") {
                Common.showToast(response.getMessage());
            }
        }
    },

    updateMoneyResponseHandler(updatemoneyresponse){

        if (updatemoneyresponse !== null) {
            if (updatemoneyresponse.hasMessage() && updatemoneyresponse.getMessage() !== "") {
                Common.showToast(updatemoneyresponse.getMessage());
            }
            if(updatemoneyresponse.hasZoneid()){
                var zoneId = updatemoneyresponse.getZoneid();

                if (updatemoneyresponse.getResponsecode()) {
                    /// code in here
                    if (updatemoneyresponse.getMoneyboxesList().length > 0) {
                        var moneyBox;
                        var origin_money; //so tien ma nguoi choi dang co
                        var player;

                        var avatar;
                        for (var i = 0; i < updatemoneyresponse.getMoneyboxesList().length; i++) {
                            moneyBox = updatemoneyresponse.getMoneyboxesList()[i]; //money_boxe : userId , money, reason
                            var isCash = moneyBox.getIscash();
                            player = this.findPlayer(moneyBox.getUserid());

                            if (player !== null){
                                //lay ra tien cua nguoi choi dua vao cash hay gold
                                origin_money = moneyBox.getCurrentmoney();

                                //set lai tien cho nguoi choi
                                player.setMoney(isCash, origin_money);

                                //neu la nguoi dang nhap thi cap nhat lai tien vao common
                                if (moneyBox.getUserid() === Common.getUserId()){
                                    if (isCash){
                                        Common.setCash(origin_money);
                                    }
                                    else {
                                        Common.setGold(origin_money);
                                    }
                                }

                                avatar = this.findAvatarOfPlayer(moneyBox.getUserid());
                                if (avatar !== null){
                                    avatar.setMoney(origin_money);
                                    if (Common.getFirstTurnUserId() === null){
                                        avatar.getComponent("Avatar").setBetMoney(moneyBox.getDisplaychangemoney());
                                        avatar.showStatusBet(Config.PLAYER_ACTION.BET);
                                    }

                                    if (moneyBox.getDisplaychangemoney() !== 0 ){
                                        // var moneyText = MLabel::createUpdateMoney(moneyBox.displaychangemoney());
                                        // moneyText->setPosition(Vec2(avatar->getPosition().x,
                                        //     avatar->getPosition().y + avatar->getHeight()* avatar->getScale() / 2));
                                        // this->addChild(moneyText, INDEX_UPDATE_MONEY);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    showCall(player_id){
        //neu thang tiep theo danh la minh thi hien thi theo bao nhieu
        //vi du: thang dang danh raise 10 thi hien thi call la 10
        if (player_id === Common.getUserId()){
            var avatar = this.findAvatarOfPlayer(player_id);
            var max_raise_money = 0;
            if (this.avatars.length !== 0){
                max_raise_money = this.avatars[0].getComponent("Avatar").getBetMoney();
                for (var it in this.avatars){
                    if (this.avatars[it].getComponent("Avatar").isPlayer()
                        && this.avatars[it].getComponent("Avatar").getBetMoney() > max_raise_money){
                        max_raise_money = this.avatars[it].getComponent("Avatar").getBetMoney();
                    }
                }
            }
            if (max_raise_money !== 0 && avatar !== null && max_raise_money > avatar.getComponent("Avatar").getBetMoney()){
                var money_call = max_raise_money - avatar.getComponent("Avatar").getBetMoney();
                if (money_call > Common.getCash()){
                    money_call = Common.getCash();
                }
                this.showTitleBtnCall(money_call);
            }
        }
    },

    showTitleBtnCall(money){
        // if (money > 0){
        //     btn_call->setTitleText(StringUtils::format("%s +%s", getLanguageStringWithKey("TITLE_BTN_CALL").c_str(), Common::getInstance()->numberFormatWithCommas(money).c_str()));
        //     //lb_call->setString(StringUtils::format("%s +%s", getLanguageStringWithKey("TITLE_BTN_CALL").c_str(), Common::getInstance()->numberFormatWithCommas(money).c_str()));
        // }
        // else {
        //     btn_call->setTitleText(getLanguageStringWithKey("TITLE_BTN_CALL"));
        //     //lb_call->setString(getLanguageStringWithKey("TITLE_BTN_CALL"));
        // }
        //
        // btn_call->setTitlePosition();
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
