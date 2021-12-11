
export const getConfig=(config,path)=>{
    let pathList=path.split('.');
    let currentConfig=config;
    while(currentConfig&&pathList.length){
        // eslint-disable-next-line no-loop-func
        currentConfig=currentConfig.components.filter(o=>o.id===pathList[0])[0];
        pathList=pathList.slice(1);
    }
    return currentConfig;
}

export const rotateVec=(x0,y0,a=0)=>{
    const radA=-a*Math.PI/180;
    try{
        return{
            x:  x0*Math.cos(radA)+y0*Math.sin(radA),
            y:  -x0*Math.sin(radA)+y0*Math.cos(radA),
        }
    }catch (e){
        return undefined;
    }
}

export const toRelative=(x,y,absPos)=>{
    return rotateVec(x-absPos.x,y-absPos.y,-absPos.rotation);
}
export const toAbsolute=(x0,y0,absPos)=>{
    let {x,y}=rotateVec(x0,y0,absPos.rotation);
    return {x:x+absPos.x,y:y+absPos.y};
}

export const getAbsolutePos=(config,path)=>{
    let pathList=path.split('.');
    let currentConfig=config;
    let revList=[];
    while(currentConfig&&pathList.length){
        if(typeof currentConfig.x==='function')return undefined;
        if(typeof currentConfig.y==='function')return undefined;
        if(typeof currentConfig.rotation==='function')return undefined;
        revList.unshift(currentConfig);
        // eslint-disable-next-line no-loop-func
        currentConfig=currentConfig.components.filter(o=>o.id===pathList[0])[0];
        pathList=pathList.slice(1);
    }
    if(!currentConfig)return undefined;
    if(typeof currentConfig.x==='function')return undefined;
    if(typeof currentConfig.y==='function')return undefined;
    //console.log(currentConfig,revList,config);
    let x0=0;
    let y0=0;
    let rotation0=0;
    while(revList.length){
        x0+=currentConfig.x;
        y0+=currentConfig.y;
        rotation0+=isNaN(+currentConfig.rotation)?0:+currentConfig.rotation;
        currentConfig=revList[0];
        revList=revList.slice(1);
        const {x,y}=rotateVec(x0,y0,currentConfig.rotation||0);
        x0=x;
        y0=y;
    }
    return {x:x0,y:y0,rotation:rotation0};
}

export const physicsRotation=(path,offset=0)=>(control,config,physics)=>{
    const selfPos=getAbsolutePos(config,path);
    if(!selfPos)return undefined;
    if(!physics[path])return 0;
    const dx=selfPos?.x-physics[path]?.px;
    const dy=selfPos?.y-physics[path]?.py;
    return Math.atan2(dy,dx)/Math.PI*180+90-selfPos.rotation+offset;
}
export const physicsScaleY=(path)=>(control,config,physics)=>{
    const selfPos=getAbsolutePos(config,path);
    const selfConfig=getConfig(config,path);
    if(!selfPos)return undefined;
    if(!physics[path])return 1;
    const dx=selfPos?.x-physics[path]?.px;
    const dy=selfPos?.y-physics[path]?.py;
    return Math.sqrt((dx*dx+dy*dy)/(selfConfig.massX*selfConfig.massX+selfConfig.massY*selfConfig.massY));
}