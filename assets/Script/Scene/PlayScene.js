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
        room_index : 0
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
            if (!res.getMessage().empty()){
                Common.showToast(res.getMessage());
            }
            if (res.getResponsecode() && res.getScope() == SCOPE_CHAT.CHAT_ROOM) {
                if (res.getRoomIndex() == this.room_index) {
                    /*
                    xu ly hien thi message cho thang noi
                    */
                    var userId = res.getSenderuserid();
                    var message = res.getInstantmessage();

                    //show lich su chat
                    // if (lstMsgChat.size() == MAX_ITEM_CHAT){  //neu lon hon max so dong chat
                    //     lstMsgChat.erase(lstMsgChat.begin());
                    // }
                    //
                    // ItemChat itemChat = ItemChat();
                    // itemChat.setEmoticonId(response->textemoticonid());
                    // itemChat.setMessageChat(message.c_str());
                    // itemChat.setSenderUserId(response->senderuserid());
                    // itemChat.setSenderUserName(response->senderusername());
                    // itemChat.setColorCode(response->colorcode());
                    // lstMsgChat.push_back(itemChat);
                    //
                    // PopupChat* popupChat = (PopupChat*) this->getChildByTag(POPUP_TAG_CHAT);
                    // if (popupChat != nullptr){
                    //     popupChat->showHistoryChat(itemChat, (int)lstMsgChat.size());
                    // }
                }
            }
        }
    },

    instantMessageHistoryResponseHandler: function(res){
        if(res != null){
            cc.log("chat room response: %s", res);
            if (!res.getMessage().empty()){
                Common.showToast(res.getMessage());
            }
            if (res.getResponsecode() && res.getScope() == SCOPE_CHAT.CHAT_ROOM) {

            }
        }
    },

    viewUserInfoResponseHandler: function (res) {
        if (res != null){
            CCLOG("view userinfo response: %s", res);
            if (res.getResponsecode()){
                //call popup user infor
            }
            if (!res.getMessage().empty()){
                Common.showToast(res.getMessage());
            }
        }
    },

    textEmoticonResponseHandler: function(res){
        if (text_emoticon_response != null){
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

            if (!res.getMessage().empty()){
                Common.showToast(res.getMessage());
            }
        }
    },

    replyToInviteResponseHandler: function(res){
        if (res != 0){
            cc.log("reply to invite response: %s", res);
            if (!res.getMessage().empty()){
                Common.showToast(res.getMessage());
            }
        }
    },

    exitRoomResponseHandler: function(res) {
        if (res != 0) {
            cc.log("exit room response: %s", res);
            if (!res.getMessage().empty()){
                Common.showToast(res.getMessage());
            }

            if (res.getResponsecode()) {
                if (!res.getExitaftermatchend()) {
                 //enter_room_response = 0; //xoa bien luu trang thai dang choi khi nguoi choi join lai ban choi
                    //int default_room_type = Common::getInstance()->getRequestRoomType() !=
                 //-1 ? Common::getInstance()->getRequestRoomType() : ROOM_TYPE::XU;

                 //this->notEnoughmoney = exit_room_response->notenoughmoney();
                 //this->message = exit_room_response->has_message() ? exit_room_response->message() : "";
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
    },
    getMinBet(){
        return this.minBet;
    },
    // addCountDown(countDown, start){
    //     auto background_countDown = MSprite::create(BGK_COUNTDOWN);
    //     background_countDown->setPosition(MVec2(width / 2 + background_countDown->getWidth()*0.2f,
    //     height*0.6 - background_countDown->getHeight() / 2));
    //     background_countDown->setTag(TAG_TIME_COUNTDOWN);
    //     this->addChild(background_countDown);
    //
    //     //string bg = !start ? CHANGE_OWNER : WAIT_NEXT_MATCH;
    //     auto background_countDownLeft = MSprite::create(WAIT_NEXT_MATCH);
    //     background_countDownLeft->setPosition(Vec2(-background_countDownLeft->getWidth(),
    //         background_countDown->getHeight() / 2 -
    //             background_countDownLeft->getHeight() / 2));
    //     background_countDown->addChild(background_countDownLeft);
    //
    //     auto timerCountDown = MLabel::createCountDown(countDown);
    //     timerCountDown->setPosition(Vec2(background_countDown->getWidth() / 2, background_countDown->getHeight()*0.5));
    //     background_countDown->addChild(timerCountDown);
    //
    //     background_countDown->runAction(Sequence::create(DelayTime::create(countDown), RemoveSelf::create(), NULL));
    // },
    showValueMatch(value_match){
        if (value_match.length != null){
            // lb_value_match->setString(StringUtils::format("#%s", value_match.c_str()));
        }
    },

    btnExitClick(){
        if (!this.check_exit_room) {
            NetworkManager.getExitRoomMessageFromServer(Common.getZoneId(), this.roomIndex);
        }
        else {
            NetworkManager.getCancelExitRoomMessageFromServer(Common.getZoneId(), this.roomIndex);
        }
        this.check_exit_room = !this.check_exit_room;
    },

    showBtnPlayerAction(isShow) {
        this.btn_raise.node.active = isShow;
        this.btn_call.node.active = isShow;
        this.btn_all_in.node.active = isShow;
        this.btn_fold.node.active = isShow;
        this.btn_condescend.node.active = isShow;

        // if (isShow){
        //     btn_raise->setEnabled(false);
        //
        //     btn_call->setEnabled(false);
        //
        //     btn_all_in->setEnabled(false);
        //
        //     btn_fold->setEnabled(false);
        //
        //     btn_condescend->setEnabled(false);
        // }
    }

});

