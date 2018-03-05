/**
 * Created by Admin on 19-12-2017.
 */
var Config = {
    index : {
        POPUP : 100,
        LOADING: 101,
    },

    TAG_GAME_ITEM: {
        BACAY: 1,
        XITO: 2,
        POKER: 3,
        PHOM: 4,
        TLMN: 5,
        TLMN_SOLO: 6,
        LIENG: 11,
        MAUBINH: 12,
        XENG: 13,
        XOCDIA: 15,
        TAIXIU: 17,
        VQMM: 18,
        MINI_POKER: 19,
        MINI_BACAY: 20,
        XOCDIA2: 21,
        EGG: 22,
        TREASURE: 23
    },

    TAG_EMOTION: {
        TAG : 1
    },

    TABLE_ORDERBY: {
        MIN_BET : 1,
        NUM_PLAYER : 2,
        INDEX : 3
    },
    POPUP_TYPE: {
        SMALL : 1,
        LARGE : 2
    },
    name : {
        COMMON_POPUP : "CommonPopup",
        POPUP_MESSAGE_BOX : "PopupMessageBox",
        POPUP_SETTING : "PopupSetting",
        POPUP_HISTORY : "PopupHistory",
        POPUP_THREECARD_HISTORY : "PopupThreeCardHistory",
        POPUP_USERINFO : "PopupUserInfo",
        POPUP_CHARGING : "PopupCharging",
        POPUP_WEBVIEW : "PopupWebview",
        POPUP_MAIL : "PopupMail",
        POPUP_GIFT : "PopupGift",
        POPUP_TAIXIU_TOP : "PopupTaiXiuTop",
        POPUP_CHANGE_PASS : "PopupChangePass",
        POPUP_CHANGE_AVATAR : "PopupChangeAvatar",
        POPUP_CHANGE_INFO : "PopupChangeInfo",
    },

    COMMON_POPUP_TYPE: {
        NORMAL : 1,
        SCROLL_TAB_IN_TOP: 2,
        SCROLL_TAB_IN_LEFT : 3,
        SCROLL_TAB_IN_TOP_LEFT : 4,
        MESSAGE_BOX : {
            CONFIRM_TYPE: 0,
            MESSAGEBOX_TYPE: 1
        }
    },


    USER_VERIFY_CONFIG_TYPE: {
        SMS : 1,
        EMAIL : 2,
        PHONE : 3
    },

    SCOPE_CHAT: {
        CHAT_ZONE: 1,
        CHAT_ROOM: 2,
        CHAT_PRIVATE: 3,
        CHAT_WORLD: 4
    },


    LookupTypeRequest : {
        sessionHist: 3,
        userBetHist: 2,
        sessionAllUserBet: 1,
        topUserDayly: 4,
        topUserWeekly: 5
    },
    CARD_CONFIG_TYPE:  {
        TYPE_GOLD: 0,
        TYPE_CASH: 1
    },

    Valid: {
        MAX_LENGTH_USERNAME: 12,
        MIN_LENGTH_USERNAME: 3,
        MAX_LENGTH_PASSWORD: 12,
        MIN_LENGTH_PASSWORD: 6,
        MIN_LENGTH_SERIA: 5,
        MAX_LENGTH_SERIA: 20,
        MAX_LENGTH_SDT: 15
    },

    Update: {
        UPDATE_DISPLAY_NAME : 1,
        UPDATE_EMAIL : 2,
        UPDATE_PHONE : 3,
        UPDATE_IDENTIFY : 4,
        UPDATE_AVATAR : 5,
        UPDATE_PASSWORD : 6,
    }
};