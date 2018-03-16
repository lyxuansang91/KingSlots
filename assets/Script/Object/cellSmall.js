
cc.Class({
    extends: require('viewCell'),

    properties: {
        frame_title : cc.SpriteFrame,
        frame_cell : cc.SpriteFrame
    },

    // use this for initialization
    onLoad: function () {

    },

    resetCell: function (lengthData,index) {

        const threeItem = this.node.getChildByName("threeItem");
        var item1_3 = threeItem.getChildByName("item1").getComponent(cc.Label);
        item1_3.string = "";

        var item2_3 = threeItem.getChildByName("item2").getComponent(cc.Label);
        item2_3.string = "";

        var item3_3 = threeItem.getChildByName("item3").getComponent(cc.Label);
        item3_3.string = "";

        const fourItem = this.node.getChildByName("fourItem");
        var item1_4 = fourItem.getChildByName("item1").getComponent(cc.Label);
        item1_4.string = "";

        var item2_4 = fourItem.getChildByName("item2").getComponent(cc.Label);
        item2_4.string = "";

        var item3_4 = fourItem.getChildByName("item3").getComponent(cc.Label);
        item3_4.string = "";

        var item4_4 = fourItem.getChildByName("item4").getComponent(cc.Label);
        item4_4.string = "";

        this.list_text = [];

        if(lengthData == 4){
            this.list_text.push(item1_4);
            this.list_text.push(item2_4);
            this.list_text.push(item3_4);
            this.list_text.push(item4_4);

        }else if(lengthData == 3){
            this.list_text.push(item1_3);
            this.list_text.push(item2_3);
            this.list_text.push(item3_3);

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
            if(index != 0){
                text = Common.wordWrap(text, 40);
            }
            // text = Common.wordWrap(text, 40);

            if(i == lengthData && index != 0){
                this.list_text[i].string = text;
                this.list_text[i].node.color = cc.color(94,60,17,255);
            }else{
                this.list_text[i].string = text;
                if(index == 0){
                    this.list_text[i].node.color = cc.color(255,248,198,255);
                }else{
                    this.list_text[i].node.color = cc.color(94,60,17,255);
                }
            }
        }
    }
});
