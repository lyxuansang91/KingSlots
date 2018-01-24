var NetworkManager = require('NetworkManager');
var HISTORY_SPIN = 1;
var HISTORY_BREAK_JAR = 2;
var HISTORY_TOP_USER = 3;
var lstCardConfig = [];
var list_nhamang = [];
var PopupIngame = cc.Class({
    extends: cc.Component,

    properties: {
        titleString: cc.Sprite,
        leftPrefab: cc.Prefab,
        scrollView: cc.ScrollView,
        historyType: 1,
        chargePrefab: cc.Prefab,
        historyPrefab: cc.Prefab,
        providerPrefab: cc.Prefab,
        contentPopup: cc.Node,
        tableView: cc.Node,
        tabScrollView: cc.ScrollView,
        providerTableView: cc.Node,
    },

    statics: {
        instance: null
    },

    // use this for initialization
    onLoad: function () {
        PopupIngame.instance = this;
        this.contentPopup.active = false;
        this.tableView.active = true;
        window.ws.onmessage = this.ongamestatus.bind(this);
    },
    setHistoryType: function (historyType) {
        this.historyType = historyType;
    },
    ongamestatus: function(event) {
        if(event.data!==null || event.data !== 'undefined') {
            var lstMessage = NetworkManager.parseFrom(event.data, event.data.byteLength);
            if(lstMessage.length > 0) {
                cc.log("lstMessage =", lstMessage);
                for(var i = 0; i < lstMessage.length; i++) {
                    var buffer = lstMessage[i];
                    this.handleMessage(buffer);
                }
            }
        }
    },
    handleMessage: function(buffer) {
        switch (buffer.message_id) {
            case NetworkManager.MESSAGE_ID.LOOK_UP_GAME_HISTORY:
                var msg = buffer.response;
                this.lookupGameMiniPokerResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.CARD_CONFIG:
                var msg = buffer.response;
                this.getCardConfigResponse(msg);
                break;
        }
    },
    lookupGameMiniPokerResponseHandler: function(response) {
        if (response !== 0) {
            cc.log("look up game history response: ", response);
            if (response.hasMessage() && !response.getMessage()) {
                //show toast message
            }

            if (response.getResponsecode()) {
                switch (this.historyType) {
                    case HISTORY_BREAK_JAR:
                    {
                        var number = response.getHistoriesList().length;
                        var headCell = ["Thời gian", "Tên", "Đặt", "Thắng", "Bộ bài"];
                        var data = this._getdata(headCell,response.getHistoriesList(), number);
                        // var item = cc.instantiate(this.historyPrefab).getComponent("HistoryItem");
                        // // this.node.addChild(item.node);
                        // // item.tableView.getComponent(cc.tableView).initTableView(data.length, { array: data, target: this });
                        // item.init(data, this);

                        this.tableView.getComponent(cc.tableView).initTableView(data.length, { array: data, target: this });
                    }
                        break;
                    case HISTORY_SPIN:
                    {
                        var number = response.getHistoriesList().length;
                        var headCell = ["Thời gian", "Tên", "Đặt", "Thắng", "Bộ bài"];
                        var data = this._getdata(headCell,response.getHistoriesList(), number);
                        // var item = cc.instantiate(this.historyPrefab).getComponent("HistoryItem");
                        // // this.node.addChild(item.node);
                        // // item.tableView.getComponent(cc.tableView).initTableView(data.length, { array: data, target: this });
                        // item.init(data, this);
                        this.tableView.getComponent(cc.tableView).initTableView(data.length, { array: data, target: this });
                    }
                        break;
                    case HISTORY_TOP_USER:
                    {
                        var number = response.getHistoriesList().length;
                        var headCell = ["Thời gian", "Tên", "Đặt", "Thắng", "Bộ bài"];
                        var data = this._getdata(headCell,response.getHistoriesList(), number);
                        // var item = cc.instantiate(this.historyPrefab).getComponent("HistoryItem");
                        // // this.node.addChild(item.node);
                        // // item.tableView.getComponent(cc.tableView).initTableView(data.length, { array: data, target: this });
                        // item.init(data, this);
                        // // item.setPosition(cc.p(100,-30));

                        this.tableView.getComponent(cc.tableView).initTableView(data.length, { array: data, target: this });
                    }
                        break;
                    default:
                        break;
                }
            }

            if (response.getArgsList().length > 0) {
                var entry = response.getArgsList()[0];
                if (entry.getKey() === "totalCount")
                    this.totalCount = parseInt(entry.getValue());
            }
        }
    },
    getCardConfigResponse: function(response){
        if (response != 0) {
            if (response.getResponsecode()) {

                // // enableSecurityCheck = response.getEnablesecuritycheck();
                // // setEnableSecurityCheck(response.getEnablesecuritycheck());
                //
                // if (response.getProvidersList().length > 0){
                //     for(var t = 0 ;t < list_nhamang.length; t++){
                //         scrollView->removeChild(list_nhamang[t]);
                //     }
                //     type_selected = response->providers(0).providercode();  //mac dinh
                //
                //     auto sprite_button = MSprite::create(DOITHE_LOGO_MOBI);
                //     Size scroll_inner_contain = Size(bg_nhamang->getWidth(),
                //         sprite_button->getHeight()*1.15*response->providers_size());
                //     scrollView->setInnerContainerSize(scroll_inner_contain);
                //
                //     for (var i = 0; i < response.getProvidersList().length; i++){
                //
                //         var button_nhamang = getItemNhaMang(response.getProvidersList()[i]);
                //         button_nhamang->setPosition(Vec2(scroll_inner_contain.width/2 -
                //             button_nhamang->getWidth()/2,
                //             scroll_inner_contain.height -
                //             button_nhamang->getHeight()*1.15*(i + 1)));
                //         scrollView->addChild(button_nhamang);
                //         list_nhamang.push_back(button_nhamang);
                //
                //         if (response->providers(i).providercode() == type_selected){
                //             for (int j = 0; j < response->providers(i).products_size(); j++){
                //                 lstCardConfig.push_back(response->providers(i).products(j));
                //             }
                //
                //             viewProviderClicked(i,"");
                //         }else{
                //             if(list_nhamang.size() > i){
                //                 list_nhamang[i]->removeAllChildren();
                //             }
                //         }
                //         this->lstCardProvider.push_back(response->providers(i));
                //
                //
                //         //lstView->insertCustomItem(getItemNhaMang(response->providers(i)), i);
                //     }
                // }
                // tableView->reloadData();

                this.contentPopup.active = true;
                this.tableView.active = false;

                var listProviders = response.getProvidersList();

                var nodeChild = new cc.Node();
                nodeChild.parent = this.tabScrollView.content;
                var contentWidth = listProviders.length * 100;
                this.tabScrollView.content.setContentSize(contentWidth, this.tabScrollView.content.getContentSize().height);

                for(var i = 0; i < listProviders.length; i++){
                    var itemId = listProviders[i].getProviderid();
                    var itemCode = listProviders[i].getProvidercode();
                    var itemName = listProviders[i].getProvidername();
                    var itemProduct = listProviders[i].getProductsList();

                    var posX = (i - listProviders.length/2 + 0.5)* contentWidth / (listProviders.length + 1);
                    var item = cc.instantiate(this.providerPrefab);
                    item.getComponent("ProviderItem").init(itemName, i);
                    item.setPositionX(posX);
                    item.setPositionY(-item.getContentSize().height);
                    nodeChild.addChild(item);

                    //table view
                    var number = itemProduct.length;
                    var headCell = ["Mệnh giá thẻ", "KM", "Mon"];
                    var data = this._getChargedata(headCell,itemProduct, number);
                    this.providerTableView.getComponent(cc.tableView).initTableView(data.length, { array: data, target: this });

                }


            }
            else {
                // PopupMessageBox* popupMessage = new PopupMessageBox();
                // popupMessage->showPopup(response->message());
            }
        }
    },
    _getdata: function (headCell, val, num) {

        var array = [];
        var headObj = {};
        headObj.date_time = headCell[0];
        headObj.displayName = headCell[1];
        headObj.bet = headCell[2];
        headObj.betWin = headCell[3];
        headObj.betCard = headCell[4];
        array.push(headObj);

        for (var i = 0; i < num; ++i) {
            var obj = {};
            obj.date_time = Common.timestampToDate(val[i].getSixth());
            obj.displayName = val[i].getFirst();
            obj.bet = val[i].getThird();
            obj.betWin = val[i].getFourth();
            obj.betCard = val[i].getSecond();
            array.push(obj);
        }

        cc.log("array =", array);
        return array;
    },
    _getChargedata: function (headCell, val, num) {

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
    init: function (tab, name) {
        var nodeChild = new cc.Node();
        nodeChild.parent = this.scrollView.content;
        for(var i = 0; i < tab.length; i++){
            var item = cc.instantiate(this.leftPrefab);
            item.getComponent('PopupLeftItem').init(i+1, tab[i], name);
            var posX =  0;
            var posY = 0;

            posY = - (i + 1/2)*item.getContentSize().height ;
            item.setPositionX(posX);
            item.setPositionY(posY);
            nodeChild.addChild(item);
        }
        // this.titleString.string = tab;

    },
    disappear:function () {
        var callDisappear = cc.callFunc(function(){
            this.node.removeFromParent(true);
        },this);

        var move = cc.moveTo(0.05,cc.p(0,-200));
        this.node.runAction(cc.sequence(move,callDisappear));
    }
});
