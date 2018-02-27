
cc.Class({
    extends: require('viewCell'),

    properties: {
        prefabData: cc.Prefab,
        card: cc.Mask,
        bg_cell: cc.SpriteFrame
    },

    // use this for initialization
    onLoad: function () {

    },
    init: function (index, data, reload, group) {

        this.node.removeAllChildren(true);
        var obj = data.array[index];

        var bgCellWidth = this.node.getContentSize().width;

        var lengthData = Object.keys(obj).length;

        var lastItem = obj[Object.keys(obj)[lengthData-1]];

        var re2 = /[,]/g;
        var findComma = lastItem.toString().search(re2);
        var card = findComma !== -1 ? obj[Object.keys(obj)[lengthData-1]].split(',') : [];

        if(card.length > 1){
            lengthData = lengthData-1;
        }

        var nodeBg = new cc.Node();
        nodeBg.parent = this.node;
        var bgCell = nodeBg.addComponent(cc.Sprite);

        bgCell.spriteFrame = this.bg_cell;

        var percentRow  = [0.1, 0.1, 0.1, 0.1];

        cc.log("percent =", percentRow);

        var messPosX = 0;
        for(var i = 0; i < lengthData; i++){
            var strTime = obj[Object.keys(obj)[i]].toString();
            // if(i === 0){
            //     strTime = Common.wordWrap(strTime, 40);
            // }
            var nodeChild = new cc.Node();
            nodeChild.parent = this.node;
            var message = nodeChild.addComponent(cc.Label);
            var widthLbl = message.node.getContentSize().width;

            console.log("messPosX =", messPosX);
            var posX = (i - lengthData/2 + 0.2)* bgCellWidth / (lengthData + 1);
            if(index === 0){
                posX = (i - lengthData/2 + 0.2)* bgCellWidth / (lengthData + 1) + widthLbl/2;
            }
            // var posX = (i - lengthData/2)* bgCellWidth / lengthData + bgCellWidth * (percentRow[i-1] + percentRow[i]);
            // var posX = (i - lengthData/2 )* widthLbl*0.2;
            var posY = - 10;
            message.node.setPositionX(posX);
            message.node.setPositionY(posY);
            message.node.color = cc.color(112,48,22,255);
            message.fontSize = 20;
            message.string = strTime;
        }
        // messPosX = message.node.getPositionX();
        if(card.length > 1){
            this.card.node.active = true;
            for(var j = 0; j < card.length; j++){

                var item = cc.instantiate(this.prefabData).getComponent('CardItem');
                var cardValue = card[j];
                item.node.setScale(0.25,0.25);
                var posX =  (j - card.length/2 )* item.node.getContentSize().width*0.1;
                // if(j === 0){
                //     posX = - item.node.getContentSize().width*0.1 ;
                // } else if(j === 2){
                //     posX = item.node.getContentSize().width*0.1 ;
                // } else {
                //     posX = 0;
                // }

                var posY = 0;

                item.replaceCard(cardValue);
                item.setBg(false);
                item.node.setPositionY(posY);
                item.node.setPositionX(posX);

                this.card.node.addChild(item.node);

            }

            this.node.addChild(this.card.node);
        } else {
            this.card.node.active = false;
        }


    }
});
