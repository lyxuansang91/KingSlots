cc.Class({
    extends: cc.Component,

    properties: {
        scrollView: cc.ScrollView,
        tableView: cc.Node,
        providerPrefab: cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
    },

    init: function (listProviders, target) {
        this.content = this.scrollView.content;
        this.tableContent = this.tableView.content;
        for(var i = 0; i < listProviders.length; i++){
            var itemId = listProviders[i].getProviderid();
            var itemCode = listProviders[i].getProvidercode();
            var itemName = listProviders[i].getProvidername();
            var itemProduct = listProviders[i].getProductsList();
            cc.log("itemProduct =", itemProduct);

            var newChild = new cc.Node();
            newChild.parent = target.node;

            var posX = (i - listProviders.length/2 + 0.5)* 600 / (listProviders.length + 1);
            var item = cc.instantiate(this.providerPrefab);
            item.getComponent("ProviderItem").init(itemName, i);
            item.setPositionX(posX);
            item.setPositionY(-item.getContentSize().height);
            newChild.addChild(item);
            //table view
            var number = itemProduct.length;
            var headCell = ["Mệnh giá thẻ", "KM", "Mon"];
            var data = this._getdata(headCell,itemProduct, number);
            this.tableView.getComponent(cc.tableView).initTableView(data.length, { array: data, target: target.node });
        }



    },
    _getdata: function (headCell, val, num) {

        var array = [];
        var headObj = {};
        headObj.parValue = headCell[0];
        headObj.promotion = headCell[1];
        headObj.cashValue = headCell[2];
        array.push(headObj);

        for (var i = 0; i < num; ++i) {
            var obj = {};
            obj.parValue = val[i].getParvalue();
            obj.promotion = val[i].getPromotion();
            obj.cashValue = val[i].getCashvalue();
            array.push(obj);
        }

        cc.log("array =", array);
        return array;
    },
});
