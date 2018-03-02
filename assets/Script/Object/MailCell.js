cc.Class({
    extends: require('viewCell'),

    properties: {

        lbl_title: cc.RichText,
        lbl_sender: cc.Label,
        btn_delete: cc.Button
    },


    init: function (index, data, reload, group) {

        var obj = data.array[index];

        this.lbl_title.string = obj[Object.keys(obj)[0]].toString();
        this.lbl_sender.string = obj[Object.keys(obj)[1]].toString();

    }


});
