
cc.Class({
    extends: require('viewCell'),

    properties: {
        textData: {
            default: [],
            type: cc.Label
        },
        prefabData: cc.Prefab,
        card: cc.Mask
    },

    // use this for initialization
    onLoad: function () {

    },
    init: function (index, data, reload, group) {
        this.node.removeAllChildren(true);
        var obj = data.array[index];

        var lengthData = Object.keys(obj).length;
        var card = obj[Object.keys(obj)[lengthData-1]].split(',');

        if(card.length > 1){
            lengthData = lengthData-1;
        }


        var percentCell = [0.3, 0.15, 0.15, 0.15, 0.25];
        for(var i = 0; i < lengthData; i++){
            var nodeChild = new cc.Node();
            nodeChild.parent = this.node;
            var message = nodeChild.addComponent(cc.Label);
            var posX = (i - lengthData/2 + 0.5)* 600 / (lengthData + 1);
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


    },
    clicked: function () {
        this._target.show('下标:' + this.index.string);
    }
});
