// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

import SymbolConfig from "./SymbolConfig";
import VMParent from "../../modelView/VMParent";

@ccclass
export default class SlotsModel extends VMParent {

    // @property(cc.Label)
    // label: cc.Label = null;

    // @property
    // text: string = 'hello';

    @property([SymbolConfig])
    symbols: SymbolConfig[] = [];

    data = {
        finCells: [],
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        for (let index = 0; index < this.node.children.length; index++) {
            this.data.finCells.push([]);
        }
        super.onLoad();
    }

    start () {

    }

    // update (dt) {}

    getTag () {
        return this.tag;
    }
}
