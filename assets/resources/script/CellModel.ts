// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

import VMBase from "../../modelView/VMBase";
import SymbolConfig from "./SymbolConfig";

@ccclass
export default class CellModel extends VMBase {

    // @property(cc.Label)
    // label: cc.Label = null;

    // @property
    // text: string = 'hello';
    
    spriteNode: cc.Node;
    rootNode: cc.Node;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.spriteNode = this.node.getChildByName("spriteNode");
        super.onLoad();
    }

    start () {

    }

    // update (dt) {}

    onValueInit () {
        var key = this.VM.getValue(this.watchPath);
        if (key) {
            var symbols: Array<SymbolConfig> = this.rootNode.getComponent("ReelModel").symbols;
            var spr = this.spriteNode.getComponent(cc.Sprite);
            var data = symbols.find(ele => ele.key === key);
            spr.spriteFrame = data.spriteFrame;
        }
    }

    onValueChanged(n, o, pathArr: string[]) {
        let index = this.node.getParent().children.findIndex(n=> n === this.node);
        if (index == 2) {
            cc.log("changed", n.path);
        }
        if (n) {
            var symbols = this.rootNode.getComponent("ReelModel").symbols;
            var spr = this.spriteNode.getComponent(cc.Sprite);
            var data = symbols.find(ele => ele.key === n);
            spr.spriteFrame = data.spriteFrame;
        }
    }
}
