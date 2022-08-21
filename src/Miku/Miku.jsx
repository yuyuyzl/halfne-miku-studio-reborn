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
        const dt = Math.min(timestamp - lastTime.current,50);
        console.log(timestamp,dt);
        lastTime.current = timestamp;
        let currentRenderState=parseConfig(model,control,physics);
        setRenderState(currentRenderState);
        if(dt>1000||dt<0||!runPhysics)setPhysics(physics => {
            return getInitPhysics(parseConfig(model,control),false);
        }); else if(dt!==0)
        setPhysics(physics => {
            return updatePhysics(physics,currentRenderState,dt);
        })
    }
    useEffect(()=> {
        work(timestamp);
    },[timestamp,runPhysics]);
    return <div className="miku">
        {/*<div className="debug">{JSON.stringify(control)}</div>*/}
        <Part renderState={renderState}></Part>
    </div>
}