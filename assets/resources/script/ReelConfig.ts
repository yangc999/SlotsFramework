// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

export enum EaseType {
    Linear, 
    InSine, 
    InCubic, 
    InQuint, 
    InCirc, 
    InElastic, 
    InQuad, 
    InQuart, 
    InExpo, 
    InBack, 
    InBounce, 
    OutSine, 
    OutCubic, 
    OutQuint, 
    OutCirc, 
    OutElastic, 
    OutQuad, 
    OutQuart, 
    OutExpo, 
    OutBack, 
    OutBounce, 
}

@ccclass("ReelConfig")
export default class ReelConfig {

    @property({
        tooltip: "滚动速度", 
        type: cc.Float, 
    })
    spinSpeed: number = 0;

    @property({
        tooltip: "加速滚动速度", 
        type: cc.Float, 
    })
    superSpeed: number = 0;

    @property({
        tooltip: "加速缓动类型", 
        type: cc.Enum(EaseType), 
    })
    accEase: EaseType = EaseType.Linear;

    @property({
        tooltip: "滚动速度", 
        type: cc.Float, 
    })
    accDuration: number = 0;
    
    @property({
        tooltip: "减速缓动类型", 
        type: cc.Enum(EaseType), 
    })
    slowEase: EaseType = EaseType.Linear;

    @property({
        tooltip: "减速时长", 
        type: cc.Float, 
    })
    slowDuration: number = 0;

    @property({
        tooltip: "回弹缓动类型", 
        type: cc.Enum(EaseType), 
    })
    bounceEase: EaseType = EaseType.Linear;

    @property({
        tooltip: "回弹时长", 
        type: cc.Float, 
    })
    bounceDuration: number = 0;

    @property({
        tooltip: "延迟停止时间", 
        type: cc.Float, 
    })
    delayDuration: number = 0;
}
