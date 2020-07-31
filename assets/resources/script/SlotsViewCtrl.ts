// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

import Stately = require('stately.js');

@ccclass
export default class SlotsViewCtrl extends cc.Component {

    // @property(cc.Label)
    // label: cc.Label = null;

    // @property
    // text: string = 'hello';

    @property({
        tooltip: "滚轴", 
        type: [cc.Node], 
    })
    reels: cc.Node[] = [];

    fsm: Stately = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // this.fsm = Stately.machine({});
    }

    start () {
        this.reels.forEach(element => {
            
        });
    }

    update (dt) {
        
    }

    // test 
    startSpin () {
        this.reels.forEach(element => {
            element.getComponent("ReelViewCtrl").startSpin();
        });
    }
    
    stopSpin () {
        var VM = this.node.getComponent("SlotsModel");
        for (let index = 0; index < VM.data.finCells.length; index++) {
            var element = VM.data.finCells[index];
            var len = element.length;
            for (let idx = 0; idx < len; idx++) {
                element.pop();
            }
            element.push("1");
            element.push("3");
            element.push("2");
            element.push("4");
            element.push("0");
        }
        this.reels.forEach(element => {
            element.getComponent("ReelViewCtrl").stopSpin();
        });
    }

    superSpin () {
        this.reels.forEach(element => {
            element.getComponent("ReelViewCtrl").superSpin();
        });
    }
}