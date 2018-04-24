
cc.Class({
    extends: require('viewCell'),

    properties: {
        prefabData: cc.Prefab,
        frame_title : cc.SpriteFrame,
        frame_cell : cc.SpriteFrame
    },

    // use this for initialization
    onLoad: function () {

    },

    resetCell: function (lengthData,index) {

        const sevenItem = this.node.getChildByName("sevenItem");
        var item1_7 = sevenItem.getChildByName("item1").getComponent(cc.Label);
        item1_7.string = "";

        var item2_7 = sevenItem.getChildByName("item2").getComponent(cc.Label);
        item2_7.string = "";

        var item3_7 = sevenItem.getChildByName("item3").getComponent(cc.Label);
        item3_7.string = "";

        var item4_7 = sevenItem.getChildByName("item4").getComponent(cc.Label);
        item4_7.string = "";

        var item5_7 = sevenItem.getChildByName("item5").getComponent(cc.Label);
        item5_7.string = "";

        var item6_7 = sevenItem.getChildByName("item6").getComponent(cc.Label);
        item6_7.string = "";

        var item7_7 = sevenItem.getChildByName("item7").getComponent(cc.Label);
        item7_7.string = "";



        const eightItem = this.node.getChildByName("eightItem");
        var item1_8 = eightItem.getChildByName("item1").getComponent(cc.Label);
        item1_8.string = "";

        var item2_8 = eightItem.getChildByName("item2").getComponent(cc.Label);
        item2_8.string = "";

        var item3_8 = eightItem.getChildByName("item3").getComponent(cc.Label);
        item3_8.string = "";

        var item4_8 = eightItem.getChildByName("item4").getComponent(cc.Label);
        item4_8.string = "";

        var item5_8 = eightItem.getChildByName("item5").getComponent(cc.Label);
        item5_8.string = "";

        var item6_8 = eightItem.getChildByName("item6").getComponent(cc.Label);
        item6_8.string = "";

        var item7_8 = eightItem.getChildByName("item7").getComponent(cc.Label);
        item7_8.string = "";

        var item8_8 = eightItem.getChildByName("item8").getComponent(cc.Label);
        item8_8.string = "";

        this.list_text = [];

        if(lengthData == 8){
            this.list_text.push(item1_8);
            this.list_text.push(item2_8);
            this.list_text.push(item3_8);
            this.list_text.push(item4_8);
            this.list_text.push(item5_8);
            this.list_text.push(item6_8);
            this.list_text.push(item7_8);
            this.list_text.push(item8_8);

        }else if(lengthData == 7){
            this.list_text.push(item1_7);
            this.list_text.push(item2_7);
            this.list_text.push(item3_7);
            this.list_text.push(item4_7);
            this.list_text.push(item5_7);
            this.list_text.push(item6_7);
            this.list_text.push(item7_7);

        }


        var background = this.node.getChildByName("background").getComponent(cc.Sprite);

        if(index == 0){
            background.spriteFrame = this.frame_title;
        }else{
            background.spriteFrame = this.frame_cell;
        }
    },

    init: function (index, data, reload, group) {
        var obj = data.array[index];

        // delete obj.date_time;

        var lengthData = Object.keys(obj).length;

        this.resetCell(lengthData,index);

        if(this.list_text.length != lengthData){
            return;
        }

        for(var i = 0; i < lengthData; i++){
            var text = obj[Object.keys(obj)[i]].toString();
            // if(index != 0){
            //     text = Common.wordWrap(text, 40);
            // }

            if(i == lengthData && index != 0){
                this.list_text[i].string = text;
                // this.list_text[i].node.color = cc.color(94,60,17,255);
            }else{
                this.list_text[i].string = text;
                if(index == 0){
                    // this.list_text[i].node.color = cc.color(255,248,198,255);
                }else{
                    // this.list_text[i].node.color = cc.color(94,60,17,255);
                }
            }
        }
    }
});
