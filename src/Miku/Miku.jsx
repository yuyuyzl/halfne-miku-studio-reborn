import './Miku.less'
import Part from "./Part";
import {useEffect, useRef, useState} from "react";
import {getInitPhysics, parseConfig, work} from "../Engine/core";

export default function Miku(props){
    const {control,timestamp,model,runPhysics}=props;
    const lastTime=useRef(timestamp);
    const [physics,setPhysics]=useState(()=>getInitPhysics(parseConfig(model,control)));
    const [renderState,setRenderState]=useState();


    useEffect(()=> {
        const dt = Math.min(timestamp - lastTime.current, 50);
        // console.log(timestamp,dt);
        lastTime.current = timestamp;
        work(dt,model,control,physics,setPhysics,setRenderState,runPhysics);
    },[control,timestamp,runPhysics]);
    return <div className="miku">
        {/*<div className="debug">{JSON.stringify(control)}</div>*/}
        <Part renderState={renderState}/>
    </div>
}
