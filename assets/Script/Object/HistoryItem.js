cc.Class({
    extends: cc.Component,

    properties: {
        tableView: cc.Node,
    },

    // use this for initialization
    onLoad: function () {

    },

    init: function (data, target) {
        cc.log("data =", data);
        this.tableView.getComponent(cc.tableView).initTableView(data.length, { array: data, target: target });
    }
});
