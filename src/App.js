import logo from './logo.svg';
import './App.less';
import Miku from "./Miku/Miku";
import {useEffect, useRef, useState} from "react";

const W=800;
const H=600;

function App() {
    const [control,setControl]=useState({});
    const stageRef=useRef();
    const updateControl=(mouseX,mouseY)=>{
        let control = {x:(mouseX-W/2)/W, y:(mouseY-H/2)/H};

        control.x = Math.atan(control.x*4)/Math.PI*2;
        control.y = Math.atan(control.y*4)/Math.PI*2;
        const right = control.x;	// -1 = left
        const fwd = control.y; 	// -1 = back

        const side_ang = right * Math.PI/2;
        const fwd_ang = fwd * Math.PI/2;

        const side_sin = Math.sin(side_ang);
        const side_cos = Math.cos(side_ang);
        const fwd_sin = Math.sin(fwd_ang);
        const fwd_cos = Math.cos(fwd_ang);
        const lean = 1-(.5-fwd_sin*.5)*side_cos;
        control={...control,right,fwd,side_ang,fwd_ang,side_sin,side_cos,fwd_sin,fwd_cos,lean};
        console.log(control);
        setControl(control);
    }
    useEffect(()=>{updateControl(400,300)},[]);
  return (
    <div className="App">
      <div
          className="stage"
          style={{width:W+'px',height:H+'px'}}
          ref={stageRef}
          onMouseMove={(e)=> {
              const stageRect=stageRef.current?.getBoundingClientRect();
              if(!stageRect)return;
              const mouseX=e.clientX-Math.floor(stageRect.x);
              const mouseY=e.clientY-Math.floor(stageRect.y);
              updateControl(mouseX,mouseY);
          }}
      >
        <Miku control={control}></Miku>
      </div>
    </div>
  );
}

export default App;
