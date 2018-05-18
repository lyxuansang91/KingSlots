var NetworkManager = require("NetworkManager");
var BaseScene = require("BaseScene");

cc.Class({
    extends: BaseScene,

    properties: {
        btn_exit : cc.Button,
        btn_purchase : cc.Button,
        btn_message : cc.Button,
        btn_setting : cc.Button,
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

    handleMessage: function(buffer) {
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
    }
});

