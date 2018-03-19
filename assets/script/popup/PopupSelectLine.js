var Popup = require('Popup');

cc.Class({
    extends: Popup,

    properties: {
        item : cc.Prefab,
        content : cc.Node,
    },

    onLoad : function () {

    },

    init: function (line_selected,callBack) {
        this.callBack = callBack;

        this.initLine(line_selected);
    },

    initLine: function (line_selected) {
        const num_item_row = 5;
        const size = this.content.getContentSize();
        const width_row_size = size.width / num_item_row;
        const height_row_size = size.height / 4;

        this.list_items = [];

        for (var i = 0; i < 20; i++) {
            var pos = cc.p(-size.width/2 + width_row_size * (parseInt(i % num_item_row) + 0.5),
                - height_row_size * (parseInt(i / num_item_row) + 0.5));
            var item = cc.instantiate(this.item);
            var item_comp = item.getComponent("ItemSelectLine");
            item_comp.init(i + 1,function (index) {

                this.callBack(Config.ON_EVENT.EVENT_SELECT_LINE,index);
            }.bind(this));

            item.setPosition(cc.p(pos.x, pos.y));
            this.list_items.push(item_comp);

            this.content.addChild(item);
        }

        this.showLine(line_selected);
    },
    
    onLineSelected: function () {
        
    },

    setDataLineWithType : function(line_selected,line_type) {
        this.setType(line_type);
        this.setDataLine(line_selected);
    },

    setDataLine: function(line_selected) {
        this.showLine(line_selected);
    },

    showLine: function(line_selected){
        for (var i = 0; i < this.list_items.length; i++){

            var selected = false;

            for(var j = 0; j < line_selected.length; j++){
                var it_selected = line_selected[j];
                if ((i + 1) == it_selected){
                    selected = true;
                    break;
                }
            }

            this.list_items[i].change(selected);
        }
    },

    setType: function(line_type) {
        this.line_type = line_type;
    },

    getType: function () {
        return this.line_type;
    },

    chonChan: function () {
        this.setDataLine([ 2, 4, 6, 8, 10, 12, 14, 16, 18, 20 ]);
        this.callBack(Config.ON_EVENT.EVENT_SELECT_LINE_BY_TYPE,Config.SELECT_LINE_TYPE.DONG_CHAN);
    },

    chonLe: function () {
        this.setDataLine([ 1, 3, 5, 7, 9, 11, 13, 15, 17, 19 ]);
        this.callBack(Config.ON_EVENT.EVENT_SELECT_LINE_BY_TYPE,Config.SELECT_LINE_TYPE.DONG_LE);
    },

    chonTatCa: function () {
        this.setDataLine([ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20 ]);
        this.callBack(Config.ON_EVENT.EVENT_SELECT_LINE_BY_TYPE,Config.SELECT_LINE_TYPE.DONG_ALL);
    },

    chonLai: function () {
        this.setDataLine([]);
        this.callBack(Config.ON_EVENT.EVENT_SELECT_LINE_BY_TYPE,Config.SELECT_LINE_TYPE.CHON_LAI);
    }
});
