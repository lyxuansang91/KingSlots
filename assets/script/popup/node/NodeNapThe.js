var NetworkManager = require('NetworkManager');

cc.Class({
    extends: cc.Component,

    properties: {
        edit_number : cc.EditBox,
        edit_serial : cc.EditBox,
        table_view : cc.Node,
        ui_left : cc.Node,
        tabLeftPrefab: cc.Prefab,
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

        cc.log("tabString:", this.tabInfo);

        var item = cc.instantiate(this.tabLeftPrefab);
        item.getComponent("UITabLeft").setTab(this.tabString, 1, function(index){
            this.onLeftEvent(index-1);
        }.bind(this));
        this.ui_left.addChild(item);
    },

    onLoad: function () {
        // this.initTabLeft();
    },

    onLeftEvent: function(index) {
        var productList = this.tabInfo[index].productsList;
        this.providercode = this.tabInfo[index].providercode;
        cc.log("provider code:", this.providercode);
        var num = productList.length;
        var headerCell = ["Mệnh giá thẻ", "KM", "Số BIT"];
        var data = this._getdata(productList, headerCell, num);
        this.table_view.getComponent(cc.tableView).initTableView(data.length, { array: data, target: this });
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
