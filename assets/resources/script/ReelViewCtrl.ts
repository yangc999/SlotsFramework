// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

import ReelConfig from "./ReelConfig";
import {EaseType} from "./ReelConfig";
import Stately = require('stately.js');

@ccclass
export default class ReelViewCtrl extends cc.Component {

    @property(cc.Node)
    rootNode: cc.Node = null;

    @property(cc.Prefab)
    cellPrefab: cc.Prefab = null;

    @property(ReelConfig)
    config: ReelConfig = new ReelConfig();

    @property(cc.Size)
    cellSize: cc.Size = new cc.Size(0, 0);

    @property(cc.Vec2)
    cellCount: cc.Vec2 = new cc.Vec2(0, 0);

    @property(cc.Vec2)
    cellGap: cc.Vec2 = new cc.Vec2(0, 0);

    lastSpeed: number = 0;
    lastOffset: number = 0;
    overOffset: number = 0;
    rollingSpeed: number = 0;
    stateDuration: number = 0;
    mask: cc.Node = null;
    container: cc.Node = null;
    fsmUpdate: Function = null;
    fsm: Stately = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var self = this;
        var VM = this.node.getComponent("ReelModel");
        this.mask = cc.find("mask", this.node);
        this.container = cc.find("mask/container", this.node);
        function switchUpdateFunc (event, oldState, newState) {
            cc.log("newState:", newState);
            self.stateDuration = 0;
            switch (newState) {
                case "IDLE":
                    self.reset();
                    VM.reset();
                    self.fsmUpdate = self.idleUpdate;
                    break;
                case "ACC":
                    self.fsmUpdate = self.accUpdate;
                    break;
                case "SPIN":
                    self.fsmUpdate = self.spinUpdate;
                    break;
                case "SUPER":
                    self.fsmUpdate = self.superUpdate;
                    break;
                case "FIN":
                    self.fsmUpdate = self.finUpdate;
                    break;
                case "OVER":
                    self.fsmUpdate = self.overUpdate;
                    break;
                case "BOUNCE":
                    self.lastOffset = self.overOffset;
                    self.fsmUpdate = self.bounceUpdate;
                    break;
                default:
                    break;
            };
        };
        this.fsm = Stately.machine({
            "IDLE": {
                onEnter: switchUpdateFunc, 
                "acc": function () {
                    return this.ACC;
                }, 
            }, 
            "ACC": {
                onEnter: switchUpdateFunc, 
                "spin": function () {
                    return this.SPIN;
                }, 
            }, 
            "SPIN": {
                onEnter: switchUpdateFunc, 
                "super": function () {
                    return this.SUPER;
                }, 
                "fin": function () {
                    return this.FIN;
                }, 
            }, 
            "SUPER": {
                onEnter: switchUpdateFunc, 
                "fin": function () {
                    return this.FIN;
                }, 
            }, 
            "FIN": {
                onEnter: switchUpdateFunc, 
                "over": function () {
                    return this.OVER;
                }
            }, 
            "OVER": {
                onEnter: switchUpdateFunc, 
                "bounce": function () {
                    return this.BOUNCE;
                }, 
            }, 
            "BOUNCE": {
                onEnter: switchUpdateFunc, 
                "idle": function () {
                    return this.IDLE;
                }
            }, 
        });
    }

    start () {
        this.rollingSpeed = 0;
        this.node.width = this.cellSize.width * this.cellCount.x + this.cellGap.x * (this.cellCount.x-1);
        this.node.height = this.cellSize.height * this.cellCount.y + this.cellGap.y * (this.cellCount.y-1);
        this.mask.width = this.node.width;
        this.mask.height = this.node.height;
        var VM = this.node.getComponent("ReelModel");
        for (var i = 0; i < this.cellCount.y+2; i++) {
            var cell = cc.instantiate(this.cellPrefab);
            var cellCtrl = cell.getComponent("CellViewCtrl");
            cellCtrl.visibleSize = this.cellSize;
            var cellVM = cell.getComponent("CellModel");
            cellVM.rootNode = this.rootNode;
            cellVM.watchPath = VM.getTag() + ".cellData." + i.toString();
            this.container.addChild(cell);
        }
    }

    update (dt) {
        if (this.fsmUpdate) {
            this.fsmUpdate(dt);
        }
    }

    idleUpdate (dt) {
        this.stateDuration += dt;
        var cfg = this.config;
    }

    accUpdate (dt) {
        this.stateDuration += dt;
        var cfg = this.config;
        var VM = this.node.getComponent("ReelModel");
        var ratio = Math.min(1, this.stateDuration/cfg.accDuration);
        var finRatio = this.easeFunc(cfg.accEase)(ratio);
        this.rollingSpeed = cc.misc.lerp(0, cfg.spinSpeed, finRatio);
        var step = this.rollingSpeed * dt;
        this.container.y += step;
        if (this.rollingSpeed > 0) {
            // reach this bottom of view
            var len = this.container.children.length;
            var bottomCell = this.container.children[len-1];
            var bottomEdge = this.mask.y - this.mask.height/2;
            var dis = this.container.y + bottomCell.y - bottomEdge;
            if (dis >= 0) {
                this.container.y -= this.cellSize.height;
                VM.updateCellData();
            }
        }
        if (this.rollingSpeed < 0) {
            // reach this top of view
            var len = this.container.children.length;
            var topCell = this.container.children[0];
            var topEdge = this.mask.y + this.mask.height/2;
            var dis = topEdge - topCell.y - this.container.y;
            if (dis >= 0) {
                this.container.y += this.cellSize.height;
                VM.updateCellDataReverse();
            }
        }
        if (this.stateDuration >= cfg.accDuration) {
            this.fsm.spin();
        }
    }

    spinUpdate (dt) {
        this.stateDuration += dt;
        var cfg = this.config;
        var VM = this.node.getComponent("ReelModel");
        this.rollingSpeed = cfg.spinSpeed;
        this.lastSpeed = this.rollingSpeed;
        var step = this.rollingSpeed * dt;
        this.container.y += step;
        if (this.rollingSpeed > 0) {
            // reach this bottom of view
            var len = this.container.children.length;
            var bottomCell = this.container.children[len-1];
            var bottomEdge = this.mask.y - this.mask.height/2;
            var dis = this.container.y + bottomCell.y - bottomEdge;
            if (dis >= 0) {
                this.container.y -= this.cellSize.height;
                VM.updateCellData();
            }
        }
        if (this.rollingSpeed < 0) {
            // reach this top of view
            var len = this.container.children.length;
            var topCell = this.container.children[0];
            var topEdge = this.mask.y + this.mask.height/2;
            var dis = topEdge - topCell.y - this.container.y;
            if (dis >= 0) {
                this.container.y += this.cellSize.height;
                VM.updateCellDataReverse();
            }
        }
    }

    superUpdate (dt) {
        this.stateDuration += dt;
        var cfg = this.config;
        var VM = this.node.getComponent("ReelModel");
        this.rollingSpeed = cfg.superSpeed;
        this.lastSpeed = this.rollingSpeed;
        var step = this.rollingSpeed * dt;
        this.container.y += step;
        if (this.rollingSpeed > 0) {
            // reach this bottom of view
            var len = this.container.children.length;
            var bottomCell = this.container.children[len-1];
            var bottomEdge = this.mask.y - this.mask.height/2;
            var dis = this.container.y + bottomCell.y - bottomEdge;
            if (dis >= 0) {
                this.container.y -= this.cellSize.height;
                VM.updateCellData();
            }
        }
        if (this.rollingSpeed < 0) {
            // reach this top of view
            var len = this.container.children.length;
            var topCell = this.container.children[0];
            var topEdge = this.mask.y + this.mask.height/2;
            var dis = topEdge - topCell.y - this.container.y;
            if (dis >= 0) {
                this.container.y += this.cellSize.height;
                VM.updateCellDataReverse();
            }
        }
    }

    finUpdate (dt) {
        this.stateDuration += dt;
        var cfg = this.config;
        var VM = this.node.getComponent("ReelModel");
        this.rollingSpeed = this.lastSpeed;
        var step = this.rollingSpeed * dt;
        this.container.y += step;
        var passHalf = false;
        if (this.rollingSpeed > 0) {
            // reach this bottom of view
            var len = this.container.children.length;
            var bottomCell = this.container.children[len-1];
            var bottomEdge = this.mask.y - this.mask.height/2;
            var dis = this.container.y + bottomCell.y - bottomEdge;
            if (dis >= 0) {
                this.container.y -= this.cellSize.height;
                VM.finCellData();
            }
            passHalf = this.container.y >= 0;
        }
        if (this.rollingSpeed < 0) {
            // reach this top of view
            var len = this.container.children.length;
            var topCell = this.container.children[0];
            var topEdge = this.mask.y + this.mask.height/2;
            var dis = topEdge - topCell.y - this.container.y;
            if (dis >= 0) {
                this.container.y += this.cellSize.height;
                VM.finCellDataReverse();
            }
            passHalf = this.container.y <= 0;
        }
        if (VM.finComplete && passHalf) {
            this.fsm.over();
        }
    }

    overUpdate (dt) {
        this.stateDuration += dt;
        var cfg = this.config;
        var VM = this.node.getComponent("ReelModel");
        var ratio = Math.min(1, this.stateDuration/cfg.slowDuration);
        var finRatio = this.easeFunc(cfg.slowEase)(ratio);
        this.rollingSpeed = cc.misc.lerp(this.lastSpeed, 0, finRatio);
        var step = this.rollingSpeed * dt;
        this.container.y += step;
        this.overOffset += step;
        if (this.rollingSpeed > 0) {
            // reach this bottom of view
            var len = this.container.children.length;
            var bottomCell = this.container.children[len-1];
            var bottomEdge = this.mask.y - this.mask.height/2;
            var dis = this.container.y + bottomCell.y - bottomEdge;
            if (dis >= 0) {
                this.container.y -= this.cellSize.height;
                VM.overCellData();
            }
        }
        if (this.rollingSpeed < 0) {
            // reach this top of view
            var len = this.container.children.length;
            var topCell = this.container.children[0];
            var topEdge = this.mask.y + this.mask.height/2;
            var dis = topEdge - topCell.y - this.container.y;
            if (dis >= 0) {
                this.container.y += this.cellSize.height;
                VM.overCellDataReverse();
            }
        }
        if (this.rollingSpeed == 0) {
            this.fsm.bounce();
        }
    }

    bounceUpdate (dt) {
        this.stateDuration += dt;
        var cfg = this.config;
        var VM = this.node.getComponent("ReelModel");
        var ratio = Math.min(1, this.stateDuration/cfg.bounceDuration);
        var finRatio = this.easeFunc(cfg.bounceEase)(ratio);
        // this.rollingSpeed = -this.overOffset/cfg.bounceDuration;
        // var step = this.rollingSpeed * dt;
        // this.container.y += step;
        var curY = cc.misc.lerp(this.overOffset, 0, finRatio);
        var step = curY - this.lastOffset;
        this.lastOffset = curY;
        this.container.y += step;
        if (step > 0) {
            // reach this bottom of view
            var len = this.container.children.length;
            var bottomCell = this.container.children[len-1];
            var bottomEdge = this.mask.y - this.mask.height/2;
            var dis = this.container.y + bottomCell.y - bottomEdge;
            if (dis >= 0) {
                this.container.y -= this.cellSize.height;
                VM.restoreCellDataReverse();
            }
        }
        if (step < 0) {
            // reach this top of view
            var len = this.container.children.length;
            var topCell = this.container.children[0];
            var topEdge = this.mask.y + this.mask.height/2;
            var dis = topEdge - topCell.y - this.container.y;
            if (dis >= 0) {
                this.container.y += this.cellSize.height;
                VM.restoreCellData();
            }
        }
        if (this.stateDuration >= cfg.bounceDuration) {
            this.container.y = 0;
            this.fsm.idle();
        }
    }

    reset () {
        this.lastSpeed = 0;
        this.lastOffset = 0;
        this.overOffset = 0;
    }

    easeFunc (type: EaseType): Function {
        switch (type) {
            case EaseType.Linear:
                return this.linear;
                break;
            case EaseType.InSine:
                return cc.easing.sineIn;
                break;
            case EaseType.InCubic:
                return cc.easing.cubicIn;
                break;
            case EaseType.InQuint:
                return cc.easing.quintIn;
                break;
            case EaseType.InCirc:
                return cc.easing.circIn;
                break;
            case EaseType.InElastic:
                return cc.easing.elasticIn;
                break;
            case EaseType.InQuad:
                return cc.easing.quadIn;
                break;
            case EaseType.InQuart:
                return cc.easing.quartIn;
                break;
            case EaseType.InExpo:
                return cc.easing.expoIn;
                break;
            case EaseType.InBack:
                return cc.easing.backIn;
                break;
            case EaseType.InBounce:
                return cc.easing.bounceIn;
                break;
            case EaseType.OutSine:
                return cc.easing.sineOut;
                break;
            case EaseType.OutCubic:
                return cc.easing.cubicOut;
                break;
            case EaseType.OutQuint:
                return cc.easing.quintOut;
                break;
            case EaseType.OutCirc:
                return cc.easing.circOut;
                break;
            case EaseType.OutElastic:
                return cc.easing.elasticOut;
                break;
            case EaseType.OutQuad:
                return cc.easing.quadOut;
                break;
            case EaseType.OutQuart:
                return cc.easing.quartOut;
                break;
            case EaseType.OutExpo:
                return cc.easing.expoOut;
                break;
            case EaseType.OutBack:
                return cc.easing.backOut;
                break;
            case EaseType.OutBounce:
                return cc.easing.bounceOut;
                break;
            default:
                return this.linear;
                break;
        }
    }

    linear (t: number): number {
        return t;
    }

    // test code
    startSpin () {
        this.fsm.acc();
    }

    stopSpin () {
        this.fsm.fin();
    }

    superSpin () {
        this.fsm.super();
    }
}
