
cc.Class({
    extends: require('viewCell'),

    properties: {
        prefabData: cc.Prefab,
        card: cc.Mask
    },

    // use this for initialization
    onLoad: function () {

    },
    init: function (index, data, reload, group) {

        this.node.removeAllChildren(true);
        var obj = data.array[index];

        // var url = "resources/common/popup/popup_ingame/popup_gold_noidung.png";
        // var image = cc.url.raw(url);
        // var texture = cc.textureCache.addImage(image);
        // if(index != 0){
        //     this.node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        // }
        //
        //
        var bgCellWidth = this.node.getContentSize().width;
        // var bgCellHeight = this.node.getContentSize().height;
        // this.node.setContentSize(bgCellWidth, bgCellHeight);
        //
        // this.card.node.setContentSize(cc.size(this.card.node.getContentSize().width, bgCellHeight));

        var lengthData = Object.keys(obj).length;

        var lastItem = obj[Object.keys(obj)[lengthData-1]];

        var re2 = /[,]/g;
        var findComma = lastItem.toString().search(re2);
        var card = findComma !== -1 ? obj[Object.keys(obj)[lengthData-1]].split(',') : [];

        if(card.length > 1){
            lengthData = lengthData-1;
        }


        var percentCell = [0.3, 0.15, 0.15, 0.15, 0.25];
        for(var i = 0; i < lengthData; i++){
            var nodeChild = new cc.Node();
            nodeChild.parent = this.node;
            var message = nodeChild.addComponent(cc.Label);
            var posX = (i - lengthData/2 + 0.5)* bgCellWidth / (lengthData + 1);
            message.node.setPositionX(posX);
            message.fontSize = 20;
            message.string = obj[Object.keys(obj)[i]].toString();

        }

        if(card.length > 1){
            for(var j = 0; j < card.length; j++){

                var item = cc.instantiate(this.prefabData);
                var cardValue = card[j];
                item.setScale(0.2,0.2);
                var posX =  0;
                if(j === 0){
                    posX = - item.getContentSize().width*0.05 ;
                } else if(j === 2){
                    posX = item.getContentSize().width*0.05 ;
                } else {
                    posX = 0;
                }

                var posY = 0;

                item.getComponent('CardItem').replaceCard(cardValue);
                item.setPositionY(posY);
                item.setPositionX(posX);

                this.card.node.addChild(item);

            }

            this.node.addChild(this.card.node);
        }


    }
});
