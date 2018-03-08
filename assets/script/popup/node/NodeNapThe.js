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

    initTabLeft: function() {
        cc.log("provider list:", Common.providerLists);
        this.tabString = Common.providerLists.map(function(provider) {
            return provider.providername;
        });
        this.tabInfo = Common.providerLists.map(function(provider) {
            return provider.productsList;
        });
        cc.log("tabString:", this.tabInfo);

        var item = cc.instantiate(this.tabLeftPrefab);
        item.getComponent("UITabLeft").setTab(this.tabString, 1, function(index){
            this.onLeftEvent(index);
        }.bind(this));
        this.ui_left.addChild(item);
    },

    onLoad: function () {
        // this.initTabLeft();
    },

    onLeftEvent: function(index) {
        var productList = this.tabInfo[index];
        cc.log("product list:", productList);
        var num = productList.length;
        var headerCell = ["Mệnh giá thẻ", "KM", "Số BIT"];
        var data = this._getdata(productList, headerCell, num);
        cc.log("table view:", this.table_view.getComponent(cc.tableView));
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
    update: function(dt) {

    },

    start: function () {

    },
});
