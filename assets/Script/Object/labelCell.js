
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
        const twoItem = this.node.getChildByName("twoItem");
        var item1_2 = twoItem.getChildByName("item1").getComponent(cc.Label);
        item1_2.string = "";

        var item2_2 = twoItem.getChildByName("item2").getComponent(cc.Label);
        item2_2.string = "";

        //========

        const threeItem = this.node.getChildByName("threeItem");
        var item1_3 = threeItem.getChildByName("item1").getComponent(cc.Label);
        item1_3.string = "";

        var item2_3 = threeItem.getChildByName("item2").getComponent(cc.Label);
        item2_3.string = "";

        var item3_3 = threeItem.getChildByName("item3").getComponent(cc.Label);
        item3_3.string = "";

        //========

        const fourItem = this.node.getChildByName("fourItem");
        var item1_4 = fourItem.getChildByName("item1").getComponent(cc.Label);
        item1_4.string = "";

        var item2_4 = fourItem.getChildByName("item2").getComponent(cc.Label);
        item2_4.string = "";

        var item3_4 = fourItem.getChildByName("item3").getComponent(cc.Label);
        item3_4.string = "";

        var item4_4 = fourItem.getChildByName("item4").getComponent(cc.Label);
        item4_4.string = "";

        this.node_card = fourItem.getChildByName("item4").getChildByName("card");
        this.node_card.removeAllChildren();

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

        }else if(lengthData == 2){
            this.list_text.push(item1_2);
            this.list_text.push(item2_2);

        }

        var background = this.node.getChildByName("background").getComponent(cc.Sprite);

        if(index == 0){
            background.spriteFrame = this.frame_title;
        }else{
            background.spriteFrame = this.frame_cell;
        }
    },

    init: function (index, data, reload, group) {
        cc.log("index =", index);
        var obj = data.array[index];

        delete obj.date_time;

        cc.log("data : ",obj);

        var lengthData = Object.keys(obj).length;

        this.resetCell(lengthData,index);

        if(this.list_text.length != lengthData){
            return;
        }

        var lastItem = obj[Object.keys(obj)[lengthData-1]];

        var re2 = /[,]/g;
        var findComma = lastItem.toString().search(re2);
        var card = findComma !== -1 ? obj[Object.keys(obj)[lengthData-1]].split(',') : [];

        for(var i = 0; i < lengthData; i++){
            var text = obj[Object.keys(obj)[i]].toString();
            if(lengthData == 4 && i == 0 && index != 0){
                text = "#" + text;
            }

            if(i == lengthData - 1 && index != 0){
                if(card.length > 1){ // chuỗi trả về là 1 phần tử khi rỗng
                    for(var j = 0; j < card.length; j++){

                        var item = cc.instantiate(this.prefabData).getComponent('CardItem');
                        var cardValue = card[j];
                        item.node.setScale(0.225,0.225);
                        var posX =  (j - card.length/2.0 + 0.5)* item.node.getContentSize().width*0.1;
                        var posY = 0;

                        item.replaceCard(cardValue);
                        item.setBg(false);
                        item.node.setPositionY(posY);
                        item.node.setPositionX(posX);

                        this.node_card.addChild(item.node);
                    }
                }else{
                    this.list_text[i].string = text;
                    this.list_text[i].node.color = cc.color(94,60,17,255);
                }
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
