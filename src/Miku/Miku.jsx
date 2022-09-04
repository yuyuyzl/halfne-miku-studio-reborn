import './Miku.less'
import Part from "./Part";
import {useEffect, useRef, useState} from "react";
import {getInitPhysics, parseConfig, updatePhysics} from "../Engine/core";


export default function Miku(props){
    const {control,timestamp,model,runPhysics}=props;
    const lastTime=useRef(timestamp);
    const [physics,setPhysics]=useState(()=>getInitPhysics(parseConfig(model,control)));
    const [renderState,setRenderState]=useState();

    const work=(timestamp)=> {
        const dt = Math.min(timestamp - lastTime.current, 50);
        // console.log(timestamp,dt);
        lastTime.current = timestamp;
        const shouldResetPhysics = (dt > 200 || dt < 0 || !runPhysics);
        let _physics=physics;
        if (shouldResetPhysics) {
            _physics=getInitPhysics(parseConfig(model, control), true);
            setPhysics(_physics);
        }
        let currentRenderState = parseConfig(model, control, _physics);
        setRenderState(currentRenderState);
        if (dt !== 0 && !shouldResetPhysics)
            setPhysics(physics => {
                return updatePhysics(physics, currentRenderState, dt);
            })
    }
    useEffect(()=> {
        work(timestamp);
    },[control,timestamp,runPhysics]);
    return <div className="miku">
        {/*<div className="debug">{JSON.stringify(control)}</div>*/}
        <Part renderState={renderState}></Part>
    </div>
}