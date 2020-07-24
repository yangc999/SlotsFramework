// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class CellViewCtrl extends cc.Component {

    // @property(cc.Label)
    // label: cc.Label = null;

    // @property
    // text: string = 'hello';
    
    visibleSize: cc.Size;

    spriteNode: cc.Node;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.spriteNode = this.node.getChildByName("spriteNode");
    }

    start () {
        this.node.width = this.visibleSize.width;
        this.node.height = this.visibleSize.height;
    }

    // update (dt) {}
}
