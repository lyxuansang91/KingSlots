
cc.Class({
    extends: cc.Component,

    properties: {},

    changeAlias : function (alias) {
        var text = Common.convertAlias(alias);
        var editBox = this.getComponent(cc.EditBox);
        editBox.string = text;
    }

});
