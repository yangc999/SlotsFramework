// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

import VMParent from "../../modelView/VMParent";
import SymbolConfig from "./SymbolConfig";
import ReelConfig from "./ReelConfig";

@ccclass
export default class ReelModel extends VMParent {

    // @property(cc.Label)
    // label: cc.Label = null;

    // @property
    // text: string = 'hello';

    @property(ReelConfig)
    config: ReelConfig = new ReelConfig();

    @property([SymbolConfig])
    symbols: SymbolConfig[] = [];

    @property([cc.String])
    initCell: string[] = [];

    @property([cc.String])
    rollCell: string[] = [];

    @property([cc.String])
    finCell: string[] = [];

    rollIndex: number = 0;
    finIndex: number = 0;
    overIndex: number = 0;
    finComplete: boolean = false;

    data = {
        cellData: [],
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.initCellData();
    }

    // update (dt) {}

    initCellData () {;
        this.initCell.forEach(element => {
            this.data.cellData.push(element);
        });
    }

    updateCellData () {
        cc.log("updateCell");
        var data = this.rollCell[this.rollIndex];
        if (data) {
            this.data.cellData.push(data);
            this.data.cellData.shift();
            this.rollIndex = ++this.rollIndex % this.rollCell.length;   
        }
    }

    updateCellDataReverse () {
        cc.log("updateCell");
        var data = this.rollCell[this.rollCell.length-this.rollIndex-1];
        if (data) {
            this.data.cellData.unshift(data);
            this.data.cellData.pop();
            this.rollIndex = ++this.rollIndex % this.rollCell.length; 
        }
    }

    finCellData () {
        var data = this.finCell[this.finIndex];
        if (data) {
            this.data.cellData.push(data);
            this.data.cellData.shift();
            ++this.finIndex;
            this.finComplete = (this.finIndex >= this.finCell.length);
        }
    }

    finCellDataReverse () {
        var data = this.finCell[this.finCell.length-this.finIndex-1];
        if (data) {
            this.data.cellData.unshift(data);
            this.data.cellData.pop();
            ++this.finIndex;
            this.finComplete = (this.finIndex >= this.finCell.length);
        }
    }

    overCellData () {
        var idx = (this.rollIndex + this.overIndex) % this.data.cellData.length;
        var data = this.rollCell[idx];
        if (data) {
            this.data.cellData.push(data);
            this.data.cellData.shift();
            ++this.overIndex;
        }
    }

    overCellDataReverse () {
        var idx = (this.rollIndex + this.overIndex) % this.data.cellData.length;
        var data = this.rollCell[this.rollCell.length-idx-1];
        if (data) {
            this.data.cellData.unshift(data);
            this.data.cellData.pop();
            ++this.overIndex;  
        }
    }

    restoreCellData () {
        var head = this.overIndex;
        var data = this.finCell[head];
        if (data) {
            this.data.cellData.unshift(data);
            this.data.cellData.pop();
            --this.overIndex;
        }
    }

    restoreCellDataReverse () {
        var tail = this.finCell.length-this.overIndex-1;
        var data = this.finCell[tail];
        if (data) {
            this.data.cellData.push(data);
            this.data.cellData.shift();
            --this.overIndex;
        }
    }

    reset () {
        this.finIndex = 0;
        this.overIndex = 0;
        this.finComplete = false;
    }

    getTag () {
        return this.tag;
    }
}
