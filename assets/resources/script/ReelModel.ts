// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

import VMParent from "../../modelView/VMParent";
import VMBase from "../../modelView/VMBase";

@ccclass
export default class ReelModel extends VMBase {

    // @property(cc.Label)
    // label: cc.Label = null;

    // @property
    // text: string = 'hello';

    @property(cc.Node)
    rootNode: cc.Node = null;

    @property([cc.String])
    initCell: string[] = [];

    @property([cc.String])
    rollCell: string[] = [];

    protected tag: string = '_temp';
    
    protected data: any = {
        cellData: [],
    }

    finCell: string[] = [];
    
    rollIndex: number = 0;
    
    finIndex: number = 0;
    
    overIndex: number = 0;
    
    finComplete: boolean = false;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        if (this.data == null) return;
        this.tag = '_temp' + '<'+ this.node.uuid.replace('.', '') + '>';
        this.VM.add(this.data, this.tag);
        if (CC_EDITOR) return;
        var paths = [];
        paths.push(this.rootNode.getComponent("SlotsModel").getTag());
        paths.push("finCells");
        let index = this.node.getParent().children.findIndex(n=> n === this.node);
        if (index <= 0) index = 0;
        paths.push(index.toString());
        this.watchPath = paths.join('.');
    }

    onEnable () {
        if (CC_EDITOR) return;
        if (this.watchPath != '') {
            this.VM.bindPath(this.watchPath, this.onValueChanged, this);
        }
        this.onValueInit();
    }

    onDisable () {
        if (CC_EDITOR) return;
        if (this.watchPath != '') {
            this.VM.unbindPath(this.watchPath, this.onValueChanged, this);
        }
    }
 
    onValueInit () {
        var key = this.VM.getValue(this.watchPath);
    }

    onValueChanged(n, o, pathArr: string[]) {
        if (n) {
            for (let index = 0; index < n.length; index++) {
                this.finCell[index] = n[index]; 
            }
        }
        cc.log(this.finCell);
    }

    start () {

    }

    // update (dt) {}

    initCellData () {
        this.initCell.forEach(element => {
            this.data.cellData.push(element);
        });
    }

    updateCellData () {
        var data = this.rollCell[this.rollIndex];
        if (data) {
            this.data.cellData.push(data);
            this.data.cellData.shift();
            this.rollIndex = ++this.rollIndex % this.rollCell.length;   
        }
    }

    updateCellDataReverse () {
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
            cc.log("finComplete", this.finComplete);
        }
    }

    finCellDataReverse () {
        var data = this.finCell[this.finCell.length-this.finIndex-1];
        if (data) {
            this.data.cellData.unshift(data);
            this.data.cellData.pop();
            ++this.finIndex;
            this.finComplete = (this.finIndex >= this.finCell.length);
            cc.log("finComplete", this.finComplete);
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
