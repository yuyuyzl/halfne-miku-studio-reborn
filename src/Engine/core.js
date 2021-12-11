import {physicsScaleY,physicsRotation,getConfig,getAbsolutePos,rotateVec,toAbsolute,toRelative} from "./modelUtils";
export const parseConfig= (o,control,physics={})=> {
    const root=o;
    let modified=false;
    let remain=false;
    const _parseConfig = (o) => {
        return Object.fromEntries(Object.entries(o).map(([k, v]) => {
            switch (typeof v) {
                case "object":
                    if (Array.isArray(v)) {
                        return [k, v.map(o => _parseConfig(o))]
                    } else {
                        return [k, _parseConfig(v)]
                    }
                case "function": {
                    const result = v(control, root, physics);
                    if (result !== undefined&&typeof result!=='function') {
                        modified=true;
                        return [k, result];
                    }
                    else {
                        remain=true;
                        //console.log("remain",o,root);
                        return [k, v];
                    }
                }
                default:
                    return [k, v]
            }
        }))
    }
    const parsed=_parseConfig(o);
    if(remain){
        // eslint-disable-next-line no-throw-literal
        if(!modified)throw "Infinite Loop In Config File";
        else return parseConfig(parsed,control,physics);
    }else return parsed;
}

export const getInitPhysics=(config0)=>{
    const physics={};
    const collectPhysicsComponent=(config,currentPath)=>{
        if(config.massX!==undefined&&config.massY!==undefined){
            //if(currentPath!=='head.tailL')return;
            const absPos=getAbsolutePos(config0,currentPath);
            const p=toAbsolute(config.massX,config.massY,absPos);
            //console.log(absPos,p);
            //setDebugPoint(p);
            // debugger;
            physics[currentPath]={
                    px:p.x,
                    py:p.y,
                    vx:0,
                    vy:0,
                    rotation:absPos.rotation,
                }
        }
        config.components?.forEach(o=>{
            collectPhysicsComponent(o,(currentPath?currentPath+'.':'')+o.id);
        });
    }
    collectPhysicsComponent(config0);
    return physics;
}

export const updatePhysics=(physics,root,dt)=> {
    let newPhysics = physics;
    Object.entries(physics).forEach(([currentPath, phy]) => {
        const config = getConfig(root, currentPath);
        const absPos = getAbsolutePos(root, currentPath);
        //console.log(currentPath,phy.px,phy.py,phy.vx,phy.vy,absPos);
        // 确定加速度
        const ax = config.gravityX;
        const ay = config.gravityY;
        // 确定无束缚速度
        let vx = phy.vx + ax * dt;
        let vy = phy.vy + ay * dt;
        if (config.damp) {
            vx *= 1 - config.damp * dt;
            vy *= 1 - config.damp * dt;
        }
        // 确定无束缚绝对位置
        let px = phy.px + vx * dt;
        let py = phy.py + vy * dt;
        // 确定无束缚相对位置
        const rp = toRelative(px, py, absPos);
        let rpx = rp.x;
        let rpy = rp.y;
        // 回收到束缚圆内
        let ratio = Math.sqrt((rpx * rpx + rpy * rpy) / (config.massX * config.massX + config.massY * config.massY));
        if (ratio > 1) {
            rpx /= ratio;
            rpy /= ratio;
            ratio = 1;
        }
        if (config.rotationMin !== undefined && config.rotationMax !== undefined) {
            const selfPos = absPos;

            const newP = toAbsolute(rpx, rpy, absPos);
            const dx = selfPos?.x - newP.x;
            const dy = selfPos?.y - newP.y;
            const absoluteRotation = Math.atan2(dy, dx) / Math.PI * 180 + 90;
            const parentPath = currentPath.split('.').slice(0, -1).join('.');
            const parentRotation = getAbsolutePos(root, parentPath)?.rotation;
            const relativeRotation = absoluteRotation - parentRotation;
            //console.log(rpx,rpy)

            // let newRotation=Math.atan2(rpy,rpx)*180/Math.PI-90;
            // const parentPath=currentPath.split('.').slice(0,-1).join('.');
            // const parentRotation=getAbsolutePos(currentConfig.current,parentPath)?.rotation;
            // const relativeRotation=newRotation-parentRotation;
            //console.log(newRotation);
            let rot = 0;
            if (relativeRotation < config.rotationMin) {
                rot = config.rotationMin - relativeRotation;
            } else if (relativeRotation > config.rotationMax) {
                rot = config.rotationMax - relativeRotation;
            }
            // console.log(rot);
            const newRP = rotateVec(rpx, rpy, rot);
            rpx = newRP.x;
            rpy = newRP.y;
            //if(rot!==0)debugger;
        }
        // 计算真实位置和真实速度
        const newP = toAbsolute(rpx, rpy, absPos);
        vx = (newP.x - phy.px) / dt;
        vy = (newP.y - phy.py) / dt;
        px = newP.x;
        py = newP.y;
        newPhysics[currentPath] = {
            vx, vy, px, py,
        }
    })
    // console.log(newPhysics);
    return newPhysics;
}