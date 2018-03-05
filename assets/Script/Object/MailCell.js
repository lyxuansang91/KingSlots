var PopupMail = require('PopupMail');
cc.Class({
    extends: require('viewCell'),

    properties: {

        lbl_title: cc.RichText,
        lbl_sender: cc.Label,
        btn_delete: cc.Button
    },


    init: function (index, data, reload, group) {
        if(data !== null){
            var obj = data.array[index];

            this.lbl_title.string = obj[Object.keys(obj)[0]].toString();
            this.lbl_sender.string = obj[Object.keys(obj)[1]].toString();

            this.btn_delete.node.tag = index;

        } else {
            this.node.active = false;
        }

    },

    deleteEvent: function (e) {


        // // self.tableView.getComponent(cc.tableView).initTableView(data.length, { array: data, target: this });
        // var tableView = this.node.getComponent(cc.tableView);
        //
        // cc.log("tableview =", this.node);

        var tag = e.target._tag;

        cc.log("tag =", tag);

        PopupMail.instance.deleteMail(tag);

    }


});
