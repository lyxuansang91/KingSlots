var NetworkManager = require("NetworkManager");
var BaseScene = require("BaseScene");

cc.Class({
    extends: BaseScene,

    properties: {
        btn_exit : cc.Button,
        btn_purchase : cc.Button,
        btn_message : cc.Button,
        btn_setting : cc.Button,
        btn_raise: cc.Button,
        btn_call: cc.Button,
        btn_all_in: cc.Button,
        btn_fold: cc.Button,
        btn_condescend: cc.Button,
        //so nguoi choi toi da vao ban
        capacity_size : 5,
        room_index : 0,
        timer : cc.Label,
    },

    update : function(dt){
        this.onGameEvent();
    },

    onLoad: function () {
        cc.log("Play scene");
    },

    onDestroy: function() {
        this.unscheduleAllCallbacks();
    },

    onGameEvent: function() {
        var self = this;
        NetworkManager.checkEvent(function(buffer) {
            return self.handleMessage(buffer);
        });
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
            case NetworkManager.MESSAGE_ID.INSTANT_MESSAGE:
                this.instantMessageResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.INSTANT_MESSAGE_HISTORY:
                this.instantMessageHistoryResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.VIEW_USER_INFO:
                this.viewUserInfoResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.SEND_TEXT_EMOTICON:
                this.textEmoticonResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.RELY_INVITATION:
                this.replyToInviteResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.EXIT_ROOM:
                this.exitRoomResponseHandler(msg);
                break;
            default:
                isDone = false;
                break;
        }
        return isDone;
    },

    instantMessageResponseHandler: function(res){
        if(res != null){
            cc.log("chat room response: %s", res);
            if (res.getMessage() != null){
                Common.showToast(res.getMessage());
            }
            if (res.getResponsecode() && res.getScope() === Config.SCOPE_CHAT.CHAT_ROOM) {
                // if (res.getRoomIndex() === this.room_index) {
                //     /*
                //     xu ly hien thi message cho thang noi
                //     */
                //     var userId = res.getSenderuserid();
                //     var message = res.getInstantmessage();
                //
                //     //show lich su chat
                //     // if (lstMsgChat.size() == MAX_ITEM_CHAT){  //neu lon hon max so dong chat
                //     //     lstMsgChat.erase(lstMsgChat.begin());
                //     // }
                //     //
                //     // ItemChat itemChat = ItemChat();
                //     // itemChat.setEmoticonId(response->textemoticonid());
                //     // itemChat.setMessageChat(message.c_str());
                //     // itemChat.setSenderUserId(response->senderuserid());
                //     // itemChat.setSenderUserName(response->senderusername());
                //     // itemChat.setColorCode(response->colorcode());
                //     // lstMsgChat.push_back(itemChat);
                //     //
                //     // PopupChat* popupChat = (PopupChat*) this->getChildByTag(POPUP_TAG_CHAT);
                //     // if (popupChat != nullptr){
                //     //     popupChat->showHistoryChat(itemChat, (int)lstMsgChat.size());
                //     // }
                // }
            }
        }
    },

    instantMessageHistoryResponseHandler: function(res){
        if(res != null){
            cc.log("chat room response: %s", res);
            if (res.getMessage() != null){
                Common.showToast(res.getMessage());
            }
            if (res.getResponsecode() && res.getScope() === Config.SCOPE_CHAT.CHAT_ROOM) {

            }
        }
    },

    viewUserInfoResponseHandler: function (res) {
        if (res != null){
            if (res.getResponsecode()){
                //call popup user infor
            }
            if (res.getMessage() != null){
                Common.showToast(res.getMessage());
            }
        }
    },

    textEmoticonResponseHandler: function(res){
        if (res !== null){
            cc.log("text emoticon response: %s", res);

            if (res.getResponsecode()){
                var textEmoticonId = res.getTextemoticonid(); //vat nem
                // Avatar* senderAvatar = findAvatarOfPlayer(text_emoticon_response->senderuserid());//avatar nguoi nem
                // Avatar* targerAvatar = findAvatarOfPlayer(text_emoticon_response->targetuserid());  //avatar nguoi bi nem
                //
                // if (senderAvatar != 0 && targerAvatar != 0){
                //    //hieu ung nem
                //    this->addNemAnimation(senderAvatar, targerAvatar, textEmoticonId);
                // }
            }

            if (res.getMessage() != null){
                Common.showToast(res.getMessage());
            }
        }
    },

    replyToInviteResponseHandler: function(res){
        if (res !== null){
            cc.log("reply to invite response: %s", res);
            if (res.getMessage() != null){
                Common.showToast(res.getMessage());
            }
        }
    },

    exitRoomResponseHandler: function(res) {
        cc.log("exit room response: ", res);
        if (res != null) {
            if (res.getMessage() != null){
                Common.showToast(res.getMessage());
            }

            if (res.getResponsecode()) {
                if (!res.getExitaftermatchend()) {
                 //enter_room_response = 0; //xoa bien luu trang thai dang choi khi nguoi choi join lai ban choi
                    //int default_room_type = Common::getInstance()->getRequestRoomType() !=
                 //-1 ? Common::getInstance()->getRequestRoomType() : ROOM_TYPE::XU;

                    this.notEnoughmoney = res.getNotenoughmoney();
                    this.message = res.getMessage();
                    cc.director.loadScene('Login');
                }
                else {
                    //showToast(getLanguageStringWithKey("TXT_REGISTER_EXITROOM").c_str(), TIME_SHOW_TOAST);
                }
            }
        }
    },
    //Tu atula
    setRoomIndex(roomIndex){
        cc.log("roomIndex =", roomIndex);
        this.roomIndex = roomIndex;
    },
    getRoomIndex() {
        return this.roomIndex;
    },
    setVipRoom(is_vip_room){
        this.is_vip_room = is_vip_room;
    },
    isVipRoom(){
        return this.is_vip_room;
    },
    setPassWordRequired(passwordRequired){
        this.passwordRequired = passwordRequired;
    },
    getPassWordRequired() {
            return this.passwordRequired;
    },
    setPlayerList(player_list){
        this.player_list = player_list;
    },
    getPlayerList(){
        return this.player_list;
    },
    setCreateRoom(is_create_room){
        this.is_create_room = is_create_room;
    },
    isCreateRoom(){
        return this.is_create_room;
    },
    setWaitingPlayerList(waiting_player_list){
        this.waiting_player_list = waiting_player_list;
    },
    getWaitingPlayerList(){
        return this.waiting_player_list;
    },
    setEnterRoomResponse(reEnterRoomResponse){
        this.enter_room_response = reEnterRoomResponse;
    },
    getEnterRoomResponse(){
        return this.enter_room_response;
    },
    setMinBet(minBet){
        this.minBet = minBet;
        this.bet_money.string = minBet;
    },
    getMinBet(){
        return this.minBet;
    },
    addCountDown(countDown, start){
        this.timer.string = countDown;
        this.timer.node.runAction(cc.sequence(cc.delayTime(countDown), cc.removeSelf()));
        // countDown-- ;

    },
    showValueMatch(value_match){
        if (value_match.length != null){
            // lb_value_match->setString(StringUtils::format("#%s", value_match.c_str()));
        }
    },

    btnExitClick(){
        if (!this.check_exit_room) {
            NetworkManager.getExitRoomMessageFromServer(Common.ZONE_ID.POKER, this.roomIndex);
        }
        else {
            NetworkManager.getCancelExitRoomMessageFromServer(Common.ZONE_ID.POKER, this.roomIndex);
        }
        this.check_exit_room = !this.check_exit_room;
    },

    showBtnPlayerAction(isShow) {
        this.btn_raise.node.active = isShow;
        this.btn_call.node.active = isShow;
        this.btn_all_in.node.active = isShow;
        this.btn_fold.node.active = isShow;
        this.btn_condescend.node.active = isShow;
    },

    showBtnPlayerActionArr(player_action){
        this.showBtnPlayerAction(true);

        for (var i = 0; i < player_action.length; i++){
            switch (player_action[i])
            {
                case Config.PLAYER_ACTION.RAISE:
                    this.btn_raise.node.active = true;
                    break;
                case Config.PLAYER_ACTION.CALL:
                    this.btn_condescend.node.active = false;
                    this.btn_call.node.active = true;
                    break;
                case Config.PLAYER_ACTION.ALL_IN:
                    this.btn_all_in.node.active = true;
                    break;
                case Config.PLAYER_ACTION.FOLD:
                    this.btn_fold.node.active = true;
                    break;
                case Config.PLAYER_ACTION.CONDESCEND:
                    this.btn_call.node.active = false;
                    this.btn_condescend.node.active = true;
                    break;
                default:
                    break;
            }
        }
    },

    hiddenPlayStatus(player_id){
        var tag_name = player_id.toString();
        // if (this->getChildByName(tag_name) != nullptr){
        //     this->removeChildByName(tag_name);
        //     this->removeChildByName(TAG_NAME_BG_PLAY_STATUS + tag_name);
        // }
    },

    showTextEmoticon(txt, emoticonId, avatar, cardSize, isPoint){
        // string tag_name = StringUtils::format("%lld_%s", avatar->getPlayerId(), TAG_NAME_EMOTICON);
        // if (!txt.empty()){
        //     this->removeChildByName(tag_name);
        //
        //     if (emoticonId == TEXT_EMOTICON_XITO::XITO_FOLD || emoticonId == TEXT_EMOTICON_LIENG::LIENG_FOLD){
        //         return;
        //     }
        //
        //     MSprite* sp_point = MSprite::create(EFFECT_BGR);
        //     sp_point->setAnchorPoint(Point::ANCHOR_MIDDLE_BOTTOM);
        //     sp_point->setName(tag_name);
        //     sp_point->setLocalZOrder(1);
        //     this->addChild(sp_point);
        //
        //     if (!isPoint){
        //         MLabel* lb_point = MLabel::createBMFont(FONT_CARD_TYPE, txt);
        //         lb_point->setTag(1);
        //         lb_point->setAnchorPoint(Point::ANCHOR_MIDDLE);
        //         lb_point->setPosition(Vec2(sp_point->getWidth() / 2, sp_point->getHeight() * 0.5f));
        //         sp_point->addChild(lb_point);
        //     }
        //     else {
        //         vector<string> str_point_type = Common::getInstance()->split(txt, ' ');
        //
        //         if (str_point_type.size() >= 1){
        //             Node* node_point = Node::create();
        //             node_point->setTag(1);
        //             node_point->setContentSize(sp_point->getContentSize());
        //
        //             string str_type = "";
        //             if (str_point_type.size() > 1){
        //                 for (int i = 1; i < str_point_type.size(); i++){
        //                     if (i != (str_point_type.size() - 1)){
        //                         str_type += str_point_type[i] + " ";
        //                     }
        //                     else {
        //                         str_type += str_point_type[i];
        //                     }
        //                 }
        //             }
        //
        //             MLabel* lb_point = MLabel::createBMFont(FONT_CARD_POINT, str_point_type[0]);
        //             MLabel* lb_type = MLabel::createBMFont(FONT_CARD_TYPE, str_type);
        //
        //             lb_point->setAnchorPoint(Point::ANCHOR_MIDDLE_LEFT);
        //             lb_type->setAnchorPoint(Point::ANCHOR_MIDDLE_LEFT);
        //
        //             node_point->addChild(lb_point);
        //             node_point->addChild(lb_type);
        //
        //             float width_text = lb_point->getWidth() + lb_type->getWidth() + 5;
        //
        //             lb_point->setPosition(Vec2(node_point->getContentSize().width / 2 - width_text / 2, node_point->getContentSize().height * 0.5f));
        //             lb_type->setPosition(Vec2(lb_point->getPositionX() + lb_point->getWidth() + 5, lb_point->getPositionY()));
        //
        //             sp_point->addChild(node_point);
        //         }
        //     }
        //
        //
        //     if (avatar->getPositionIndex() == 0 && avatar->isPlayer() && avatar->getPlayerId() == Common::getInstance()->getUserId()){
        //         sp_point->setLocalZOrder(INDEX_CARD + 1);
        //         if (Common::getInstance()->getZoneId() == zone::XITO || Common::getInstance()->getZoneId() == zone::POKER){
        //             sp_point->setPosition(Vec2(origin.x + visibleSize.width * paddingInitCard + (cardSize - 1) * cardWidth() * 0.25f
        //                 , posYCard() - cardWidth() * CARD_RATIO * 0.39f));
        //         }
        //     else {
        //             sp_point->setPosition(Vec2(origin.x + visibleSize.width * paddingInitCard + (cardSize - 1) * cardWidth() * 0.5f
        //                 , posYCard() - cardWidth() * CARD_RATIO * 0.39f));
        //         }
        //     }
        // else {
        //         sp_point->setScale(0.7f);
        //         sp_point->setPosition(getInitPos(avatar, cardSize));
        //     }
        //
        //
        // }
    },

    hiddenTextEmotion(player_id){
        // var tag_name = StringUtils::format("%lld_%s", player_id, TAG_NAME_EMOTICON);
        // if (this->getChildByName(tag_name) != nullptr){
        //     this->removeChildByName(tag_name);
        // }
    },

    showPlayStatus(turnType, avatar){
        // string texture_name = StringUtils::format(IMG_PLAY_STATUS, turnType);
        // string tag_name = StringUtils::toString(avatar->getPlayerId());
        // MSprite* sp_play_status = (MSprite*) this->getChildByName(tag_name);
        // MSprite* sp_bg_status = (MSprite*) this->getChildByName(TAG_NAME_BG_PLAY_STATUS + tag_name);
        // if (sp_play_status == nullptr && sp_bg_status == nullptr){
        //     sp_bg_status = MSprite::create(IMG_BG_PLAY_STATUS);
        //     sp_bg_status->setName(TAG_NAME_BG_PLAY_STATUS + tag_name);
        //     sp_bg_status->setAnchorPoint(Point::ANCHOR_MIDDLE_BOTTOM);
        //     this->addChild(sp_bg_status, INDEX_CARD + 1);
        //     sp_bg_status->setPosition(Vec2(avatar->getPositionX(), avatar->getPositionY() - avatar->getContentSize().height * 0.3f));
        //
        //     sp_play_status = MSprite::create(texture_name);
        //     sp_play_status->setAnchorPoint(Point::ANCHOR_MIDDLE_BOTTOM);
        //     sp_play_status->setName(tag_name);
        //
        //     sp_play_status->setPosition(Vec2(avatar->getPositionX(), avatar->getPositionY() - avatar->getContentSize().height * 0.3f));
        //     this->addChild(sp_play_status, INDEX_CARD + 1);
        // }
        // else {
        //     sp_play_status->loadEnryptTexture(texture_name);
        // }
        //
        // //animation
        // sp_bg_status->setScale(0);
        // sp_play_status->setScale(0);
        //
        // sp_bg_status->runAction(Sequence::create(ScaleTo::create(0.096f, 0.4f, 1.2f), ScaleTo::create(0.124f, 1.0f, 1.0f), NULL));
        // sp_play_status->runAction(Sequence::create(ScaleTo::create(0.066f, 1.25f), ScaleTo::create(0.154f, 1.0f), NULL));
    },

});

