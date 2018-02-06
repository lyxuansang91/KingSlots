
cc.Class({
    extends: require('viewCell'),

    properties: {

    },

    // use this for initialization
    onLoad: function () {

    },
    init: function (index, data, reload, group) {

        this.node.removeAllChildren(true);
        var obj = data.array[index];

        var url = "resources/common/popup/popup_ingame/popup_gold_noidung.png";
        var image = cc.url.raw(url);
        var texture = cc.textureCache.addImage(image);
        if(index != 0){
            this.node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        }

        var bgCellWidth = this.node.getContentSize().width;
        var bgCellHeight = this.node.getContentSize().height;

        var lengthData = Object.keys(obj).length;

        var percentCell = [0.3, 0.15, 0.15, 0.15, 0.25];
        for(var i = 0; i < lengthData; i++){
            var nodeChild = new cc.Node();
            nodeChild.parent = this.node;
            var message = nodeChild.addComponent(cc.Label);
            var posX = (i - lengthData/2 + 0.5)* bgCellWidth / (lengthData + 1);
            var posY = bgCellHeight * 0.2;
            message.node.setPositionX(posX);
            message.node.setPositionY(-posY);
            message.node.color = cc.color(112,48,22,255);
            message.fontSize = 20;
            message.string = obj[Object.keys(obj)[i]].toString();

        }

    }
});
