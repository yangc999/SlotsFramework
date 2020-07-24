// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass("SymbolsConfig")
export default class SymbolsConfig {

    @property({
        tooltip: "符号键值"
    })
    key: string = "";

    @property({
        tooltip: "图片资源", 
        type: cc.SpriteFrame, 
    })
    spriteFrame: cc.SpriteFrame = null;

    @property({
        tooltip: "显示范围"
    })
    visibleRect : cc.Rect = new cc.Rect(0, 0, 0, 0);
}