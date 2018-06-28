var NetworkManager = require('NetworkManager');

cc.Class({
    extends: cc.Component,

    properties: {
        scroll_view : cc.ScrollView,
        smsItemPrefab: cc.Prefab,
        isValid_viettel : false,
        isValid_mobifone : false,
        isValid_vinaphone: false,

        node_nm_viettel : cc.Node,
        node_nm_vina : cc.Node,
        node_nm_mobi : cc.Node,

        nm_frames : [cc.SpriteFrame],
    },

    initTabLeft: function() {
        cc.log("sms number list:", Common.smsConfigLists);
        this.providersList = Common.smsConfigLists[0].providersList;
        this.tabString = this.providersList.map(function(provider) {
            return provider.providername;
        });

        this.providercodes = this.providersList.map(function(provider) {
            return provider.providercode;
        });

        cc.log("provider codes:", this.providercodes);

        this.tabInfo = Common.smsConfigLists.map(function(provider) {
            return provider.providerLists;
        });

        for(var i = 0; i < this.providercodes.length; i++){
            if(this.providercodes[i] == "VTT"){
                this.isValid_viettel = true;
            }else if(this.providercodes[i] == "VNP"){
                this.isValid_vinaphone = true;
            }else if(this.providercodes[i] == "VMS"){
                this.isValid_mobifone = true;
            }
        }

        this.resetButton();

        this.onEventData("VTT");
    },

    onLoad: function () {
    },

    resetButton : function () {
        this.node_nm_viettel.getComponent(cc.Sprite).spriteFrame = this.nm_frames[0];
        this.node_nm_vina.getComponent(cc.Sprite).spriteFrame = this.nm_frames[0];
        this.node_nm_mobi.getComponent(cc.Sprite).spriteFrame = this.nm_frames[0];
    },

    onEventData: function (data) {

        if(data == "VTT"){
            if(!this.isValid_viettel){
                Common.showToast("Nhà mạng Viettel hiện không nhận nạp SMS.",2);
                return;
            }else{
                this.resetButton();
                this.node_nm_viettel.getComponent(cc.Sprite).spriteFrame = this.nm_frames[1];
            }
        }else if(data == "VMS"){
            if(!this.isValid_mobifone){
                Common.showToast("Nhà mạng Mobifone hiện không nhận nạp SMS.",2);
                return;
            }else{
                this.resetButton();
                this.node_nm_mobi.getComponent(cc.Sprite).spriteFrame = this.nm_frames[1];
            }
        }else if(data == "VNP"){
            if(!this.isValid_vinaphone){
                Common.showToast("Nhà mạng Vinaphone hiện không nhận nạp SMS.",2);
                return;
            }else{
                this.resetButton();
                this.node_nm_vina.getComponent(cc.Sprite).spriteFrame = this.nm_frames[1];
            }
        }

        this.content = this.scroll_view.content;
        var innerSize = cc.size(this.content.getContentSize().width,
            this.content.getContentSize().height);

        var index = null;
        for(var i = 0; i < this.providercodes.length; i++){
            if(data == this.providercodes[i]){
                index = i;
            }
        }
        if(index == null){
            return;
        }
        var provider = this.providersList[index];
        console.log("provider", provider);
        var length = provider.syntaxesList.length;
        cc.log("length: ", length);
        this.content.removeAllChildren(false);
        for(var i = 0; i < length; i++) {
            var _syntax = provider.syntaxesList[i];
            var item = cc.instantiate(this.smsItemPrefab);
            item.getComponent("SmsItem").init(i,_syntax.parvalue, _syntax.cashvalue, _syntax.syntax, _syntax.targetnumber);
            var size = item.getComponent('SmsItem').node.getContentSize();
            if(i == 0){
                var ind = length;
                if(ind > 0) {
                    ind++;
                }
                innerSize = cc.size(innerSize.width,size.height*1.1*ind);
                this.content.setContentSize(innerSize);
            }

            var x = 0;
            var y = i;

            var posX = 0;
            var posY = (-0.5 - y)*size.height*1.15;

            item.setPositionX(posX);
            item.setPositionY(posY);
            this.content.addChild(item);
        }
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
    update: function(dt) {

    },

    start: function () {

    },
});
