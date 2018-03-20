var NetworkManager = require('NetworkManager');

cc.Class({
    extends: cc.Component,

    properties: {
        scroll_view : cc.ScrollView,
        ui_left : cc.Node,
        tabLeftPrefab: cc.Prefab,
        smsItemPrefab: cc.Prefab
    },

    initTabLeft: function() {
        cc.log("sms number list:", Common.smsConfigLists);
        this.providersList = Common.smsConfigLists[0].providersList;
        this.tabString = this.providersList.map(function(provider) {
            return provider.providername;
        });
        this.tabInfo = Common.smsConfigLists.map(function(provider) {
            return provider.providerLists;
        });

        var item = cc.instantiate(this.tabLeftPrefab);
        item.getComponent("UITabLeft").setTab(this.tabString, 1, function(index){
            this.onLeftEvent(index-1);
        }.bind(this));
        this.ui_left.addChild(item);

    },

    onLoad: function () {
    },

    onLeftEvent: function(index) {
        this.content = this.scroll_view.content;
        var innerSize = cc.size(this.content.getContentSize().width,
            this.content.getContentSize().height);
        var padding = 0;
        cc.log("index:", index);
        var provider = this.providersList[index];
        var length = provider.syntaxesList.length;
        this.content.removeAllChildren(false);
        for(var i = 0; i < length; i++) {
            var _syntax = provider.syntaxesList[i];
            var item = cc.instantiate(this.smsItemPrefab);
            item.getComponent("SmsItem").init(_syntax.parvalue, _syntax.cashvalue, _syntax.syntax, _syntax.targetnumber);
            var size = item.getComponent('SmsItem').node.getContentSize();
            cc.log("item size:", size, ", i:", parseInt(i% 3));
            if(i == 0){
                padding = innerSize.width/3 - size.width;
                var ind = parseInt(length % 3);
                if(ind > 0) {
                    ind++;
                }
                innerSize = cc.size(innerSize.width,size.height*1.1*ind);
                this.content.setContentSize(innerSize);
            }

            var x = parseInt(i%3);
            var y = parseInt(i/3);

            var posX = (x - 1)*size.width * 1.25;
            var posY = (-0.5 - y)*size.height*1.15;

            item.setPositionX(posX);
            item.setPositionY(posY);
            this.content.addChild(item);
        }
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
