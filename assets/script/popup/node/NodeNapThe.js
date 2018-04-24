var NetworkManager = require('NetworkManager');

cc.Class({
    extends: cc.Component,

    properties: {
        edit_number : cc.EditBox,
        edit_serial : cc.EditBox,
        scroll_view : cc.ScrollView,
        itemProviderPrefab : cc.Prefab,

        isValid_viettel : false,
        isValid_mobifone : false,
        isValid_vinaphone: false,

        node_nm_viettel : cc.Node,
        node_nm_vina : cc.Node,
        node_nm_mobi : cc.Node,

        nm_frames : [cc.SpriteFrame],
    },
    purchaseMoney: function() {
        if(this.providercode !== null) {
            var cardSerial = this.edit_serial.string;
            var cardPin = this.edit_number.string;
            NetworkManager.requestPurchaseMoneyMessage(this.providercode, cardSerial, cardPin, "", "");
        } else {
            cc.log("Không tồn tại provider code");
        }
    },

    initTabLeft: function() {
        cc.log("provider list:", Common.providerLists);
        this.tabString = Common.providerLists.map(function(provider) {
            return provider.providername;
        });
        this.tabInfo = Common.providerLists.map(function(provider) {
            return {
                productsList: provider.productsList,
                providercode: provider.providercode,
            };
        });

        for(var i = 0; i < this.tabString.length; i++){
            if(this.tabString[i] == "Viettel"){
                this.isValid_viettel = true;
            }else if(this.tabString[i] == "Vinaphone"){
                this.isValid_vinaphone = true;
            }else if(this.tabString[i] == "Mobifone"){
                this.isValid_mobifone = true;
            }
        }

        this.resetButton();

        this.onEventData("Vinaphone");
    },

    onLoad: function () {
        // this.initTabLeft();
    },

    resetButton : function () {
        this.node_nm_viettel.getComponent(cc.Sprite).spriteFrame = this.nm_frames[0];
        this.node_nm_vina.getComponent(cc.Sprite).spriteFrame = this.nm_frames[0];
        this.node_nm_mobi.getComponent(cc.Sprite).spriteFrame = this.nm_frames[0];
    },

    onEventData: function (data) {

        if(data == "Viettel"){
            if(!this.isValid_viettel){
                Common.showToast("Nhà mạng Viettel hiện không nhận nạp thẻ.",2);
                return;
            }else{
                this.resetButton();
                this.node_nm_viettel.getComponent(cc.Sprite).spriteFrame = this.nm_frames[1];
            }
        }else if(data == "Mobifone"){
            if(!this.isValid_mobifone){
                Common.showToast("Nhà mạng Mobifone hiện không nhận nạp thẻ.",2);
                return;
            }else{
                this.resetButton();
                this.node_nm_mobi.getComponent(cc.Sprite).spriteFrame = this.nm_frames[1];
            }
        }else if(data == "Vinaphone"){
            if(!this.isValid_vinaphone){
                Common.showToast("Nhà mạng Vinaphone hiện không nhận nạp thẻ.",2);
                return;
            }else{
                this.resetButton();
                this.node_nm_vina.getComponent(cc.Sprite).spriteFrame = this.nm_frames[1];
            }
        }

        var innerSize = cc.size(0,
            this.scroll_view.content.getContentSize().height);

        var index = null;
        for(var i = 0; i < this.tabString.length; i++){
            if(data == this.tabString[i]){
                index = i;
            }
        }
        if(index == null){
            return;
        }

        var productList = this.tabInfo[index].productsList;
        this.providercode = this.tabInfo[index].providercode;
        cc.log("provider code:", this.providercode);
        var num = productList.length;

        this.scroll_view.content.removeAllChildren();
        for(var i = 0; i < num; i++){
            var item = cc.instantiate(this.itemProviderPrefab);
            item.getComponent('ItemProvider').init(productList[i].parvalue,productList[i].cashvalue);
            var size = item.getComponent('ItemProvider').node.getContentSize();

            item.setPosition(cc.p(size.width*(i*1.0 + 0.5),0));

            innerSize.width += size.width*1.0;

            this.scroll_view.content.addChild(item);
        }

        this.scroll_view.content.setContentSize(innerSize);
    },

    onLeftEvent: function(event,data) {
        console.log("data : ",data);

        this.onEventData(data);

    },

    _getdata: function (val, headCell, num) {
        var array = [];
        var headObj = {};
        headObj.parvalue = headCell[0];
        headObj.promotion = headCell[1];
        headObj.cashvalue = headCell[2];

        array.push(headObj);

        if(val !== null){
            for (var i = 0; i < num; ++i) {
                var obj = {};
                obj.parvalue = val[i].parvalue;
                obj.promotion = val[i].promotion;
                obj.cashvalue = val[i].cashvalue;
                array.push(obj);
            }
        }

        return array;
    },

    demo: function (index) {
        cc.log(">>>>>>>>> demo func ",index);
    },
    purchaseMoneyResponseHandler: function(resp) {
        cc.log("purchase money response handler:", resp.toObject());
        if(resp.getResponsecode()) {
            // TODO HERE
            this.edit_number.string = "";
            this.edit_serial.string = "";
        }

        if(resp.hasMessage() && resp.getMessage() !== "") {
            Common.showToast(resp.getMessage(), 2);
        }
    },
    handleMessage: function(buffer) {
        var isDone = true;
        var resp = buffer.response;
        switch(buffer.message_id) {
            case NetworkManager.MESSAGE_ID.PURCHASE_MONEY:
                this.purchaseMoneyResponseHandler(resp);
                break;
            default:
                isDone = false;
                break;
        }
        return isDone;
    },
    onGameEvent: function() {
        NetworkManager.checkEvent(function(buffer) {
            return this.handleMessage(buffer);
        }.bind(this));
    },
    update: function(dt) {
        this.onGameEvent();
    },

    start: function () {

    },
});
