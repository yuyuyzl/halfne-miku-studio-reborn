import './App.less';
import Miku from "./Miku/Miku";
import {useCallback, useEffect, useRef, useState} from "react";

import {getAbsolutePos, getConfig, parseModelJS, physicsRotation, physicsScaleY} from "./Engine/modelUtils";
import {
    Box, Button, ButtonGroup, Checkbox, FormControlLabel, FormGroup, Tab, Tabs, ToggleButton, ToggleButtonGroup
} from "@mui/material";
import FiberManualRecord from "@mui/icons-material/FiberManualRecord";
import PlayArrow from "@mui/icons-material/PlayArrow";
import Pause from "@mui/icons-material/Pause";
import FastForward from "@mui/icons-material/FastForward";
import FastRewind from "@mui/icons-material/FastRewind";
import Refresh from "@mui/icons-material/Refresh";
import FileOpen from "@mui/icons-material/FileOpen";
import Save from "@mui/icons-material/Save";
import Lock from "@mui/icons-material/Lock";
import MusicNote from "@mui/icons-material/MusicNote";
import FirstPage from "@mui/icons-material/FirstPage";
import FileSaver from 'file-saver';

import defaultConfig from './defaultModel'

const W = 800;
const H = 600;

let waitUntilNextFrame = requestAnimationFrame;

let fpsArr=[];

const formatTime=(millis)=>Math.floor(millis/1000/60)+':'+('00'+Math.floor(millis/1000%60)).slice(-2);

function TimeLine({editorTimestamp,setEditorTimestamp,record,setRecord,layer,setLayer}){
    return <div className='timeline'>
        <div className='timeline-L'>
            <div className='timeline-L-toolbar'>
                <div className='timedisplay' onWheel={e=>{setEditorTimestamp(x=>Math.max(x+e.deltaY,0))}}>
                    <b>{formatTime(editorTimestamp)}</b>
                    <span className='small'>&nbsp;{('000'+Math.floor(editorTimestamp%1000)).slice(-3)}</span>
                </div>
            </div>
            <div className='timeline-L-layer'>LAYER</div>
        </div>
        <div className='timeline-R'>
            <div className='timeline-R-time'>TIME</div>
            <div className='timeline-R-content'>CONTENT</div>
        </div>
    </div>
}

function App() {
    const stageRef = useRef();
    const latestMousePos = useRef([W/2, H/2]);
    const latestMouseDown = useRef(false);
    const audioRef = useRef();
    const [timestamp, setTimestamp] = useState(performance.now());

    const [config, setConfig] = useState(defaultConfig);

    const [control, setControl] = useState(config.parseControl());
    const [keyMapping, setKeyMapping] = useState(config.defaultKeyMapping);

    const [fpsTarget, setFpsTarget] = useState(0);
    const [fps,setFps]=useState(0);

    const [tabPage, setTabPage] = useState(0);

    const [playType,setPlayType]=useState(0);
    const [playTypeChangeTime,setPlayTypeChangeTime]=useState();
    // const [currentFrame,setCurrentFrame]=useState();
    const [record,setRecord]=useState([]);
    const [mikuResetter,setMikuResetter]=useState(0);
    const [stageBackground,setStageBackground]=useState(Object?.entries?.(config.background)?.[0]?.[1]||'#FFFFFF');
    const [layer,setLayer]=useState(0);
    const [editorTimestamp,setEditorTimestamp]=useState(0);
    const [runPhysics,setRunPhysics]=useState(true);
    const [audioFile,setAudioFile]=useState();

    const resetMiku=(rawControl={mouseX:W/2,mouseY:H/2,keyInput:[]})=>{
        latestMousePos.current=[rawControl.mouseX,rawControl.mouseY];
        setControl(config.parseControl(rawControl));
        setMikuResetter(i=>i+1);
    }

    const parseKeyMapping = (keyList, keyMapping) => keyList.map(o => keyMapping.filter(([k, v]) => v === o).map(([k, v]) => k))
        .reduce((p, c) => [...p, ...c], []);

    const togglePlayType=v=> {
        if (v === -1) {
            // setCurrentFrame(undefined);
            setRecord([]);
        }
        if (v === 1) {
            if (!record.length)return;
        }

        if(audioRef.current) {
            if (v === -1 || v === 1) {
                audioRef.current.currentTime = editorTimestamp / 1000;
                audioRef.current.play();
            } else {
                audioRef.current.pause();
            }
        }
        setPlayType(v || 0);
        setPlayTypeChangeTime(performance.now());
    }

    useEffect(() => {
        let frametime=0;
        const _waitUntilNextFrame = fpsTarget ? (f => setTimeout(f, 1000 / fpsTarget-frametime)) : requestAnimationFrame
        waitUntilNextFrame=cb=>{
            _waitUntilNextFrame((...args)=>{
                const tic= performance.now();
                cb(...args);
                const now = performance.now();
                frametime=now-tic;
                while (fpsArr.length > 0 && fpsArr[0] <= now - 1000) {
                    fpsArr.shift();
                }
                fpsArr.push(now);
                setFps((fpsArr.length-1)*1000/(now-fpsArr[0]));
            })
        }
    }, [fpsTarget]);

    useEffect(() => {
        if(playType===0||playType===-1) {
            if (!window.keyList) window.keyList = []
            const keyboardHandler = e => {
                if (e.type === 'keydown') {
                    if (!window.keyList.includes(e.key)) window.keyList.push(e.key);
                } else {
                    window.keyList = window.keyList.filter(o => o !== e.key);
                }
                e.preventDefault();
                console.log(window.keyList);
            };
            window.addEventListener('keydown', keyboardHandler);
            window.addEventListener('keyup', keyboardHandler);
            let lastTime = performance.now();
            let canceled = false;
            const updateControl = (timestamp = performance.now()) => {
                if (canceled) return;
                const dt = Math.min(timestamp - lastTime,50);
                lastTime = timestamp;
                const x = latestMousePos.current[0];
                const y = latestMousePos.current[1];
                const keyInput = parseKeyMapping(window.keyList, keyMapping);
                setControl(control => {
                    const ratio = Math.min(0.02 * dt, 1);
                    const easeX = control.mouseX * (1 - ratio) + x * ratio;
                    const easeY = control.mouseY * (1 - ratio) + y * ratio;
                    const distance = Math.sqrt((easeX - control.mouseX) * (easeX - control.mouseX) + (easeY - control.mouseY) * (easeY - control.mouseY))
                    const rawControl = (distance < 1) ?
                        {mouseX: x, mouseY: y, keyInput: keyInput} :
                        {mouseX: easeX, mouseY: easeY, keyInput: keyInput};
                    return config.parseControl({...control, ...rawControl , timestamp});
                })
                setTimestamp(timestamp);
                waitUntilNextFrame(updateControl);
            }
            waitUntilNextFrame(updateControl);
            return () => {
                window.removeEventListener('keydown', keyboardHandler);
                window.removeEventListener('keyup', keyboardHandler);
                canceled = true;
            }
        }
        if(playType===1){
            let canceled = false;
            console.log(record);
            const editorTimestampOnPlay=editorTimestamp;
            const updateControl = (timestamp = performance.now()) => {
                if (canceled) return;
                const targetTime=timestamp-playTypeChangeTime+editorTimestampOnPlay;
                // setControl(control => {
                //     // console.log(timestamp-playTypeChangeTime);
                //     const rawControlIndex=record[layer].reduce((p,c,i)=>c.t<=targetTime?i:p,undefined);
                //     const rawControl=record[layer][rawControlIndex]?.c;
                //     // console.log(rawControl);
                //     latestMousePos.current=[rawControl?.mouseX,rawControl?.mouseY];
                //     // setCurrentFrame(rawControlIndex);
                //     return config.parseControl({...control, ...rawControl});
                // })
                setEditorTimestamp(targetTime);
                setTimestamp(timestamp);
                waitUntilNextFrame(updateControl);
            }
            waitUntilNextFrame(updateControl);
            return () => {
                canceled = true;
            }
        }
    }, [playType,playTypeChangeTime]);

    useEffect(()=>{
        if (playType === -1) {
            const {mouseX,mouseY,timestamp,keyInput}=control;
            setRecord(record => {
                    if(!record[layer])record[layer]=[];
                    record[layer].push({
                        t: timestamp - playTypeChangeTime,
                        c: {mouseX,mouseY,keyInput:keyInput?.length?keyInput:undefined},
                    });
                    return record;
                }
            )
            setEditorTimestamp(timestamp - playTypeChangeTime);
        }
    },[control, layer, playType, playTypeChangeTime]);

    useEffect(()=>{
        if((playType===2||playType===0||playType===1)&&record?.length){
            const targetTime=editorTimestamp;
            setControl(control => {
                // console.log(timestamp-playTypeChangeTime);
                const rawControlIndex=record[layer].reduce((p,c,i)=>c.t<=targetTime?i:p,undefined);
                const rawControl={...record[layer][rawControlIndex]?.c};
                const rawControlNext=record[layer][rawControlIndex+1]?.c;
                // console.log(rawControl);
                if(rawControlNext){
                    // console.log(rawControl,rawControlNext);
                    const lt=record[layer][rawControlIndex]?.t;
                    const rt=record[layer][rawControlIndex+1]?.t;
                    const kl=(rt-targetTime)/(rt-lt);
                    const kr=(targetTime-lt)/(rt-lt);
                    rawControl.mouseX=rawControl?.mouseX*kl+rawControlNext?.mouseX*kr;
                    rawControl.mouseY=rawControl?.mouseY*kl+rawControlNext?.mouseY*kr;
                }
                latestMousePos.current=[rawControl?.mouseX,rawControl?.mouseY];
                // setCurrentFrame(rawControlIndex);
                return config.parseControl({...control, ...rawControl});
            })
            if(playType===2)setTimestamp(editorTimestamp);
        }
    },[playType,editorTimestamp,record])

    const handleMouseMove = useCallback((e) => {
        if(playType===0||playType===-1) {
            const stageRect = stageRef.current?.getBoundingClientRect();
            if (!stageRect) return;
            const mouseX = e.clientX - Math.floor(stageRect.x);
            const mouseY = e.clientY - Math.floor(stageRect.y);
            //setControl(getControl(mouseX,mouseY));
            latestMousePos.current = [mouseX, mouseY];
        }
    },[playType])



    return (<div className="App">
            <div
                className="stage"
                style={{width: W + 'px', height: H + 'px',backgroundColor:stageBackground,backgroundImage:'url("'+stageBackground+'")'}}
                ref={stageRef}
                onMouseMove={handleMouseMove}
                onMouseDown={()=>{latestMouseDown.current=true}}
                onMouseUp={()=>{latestMouseDown.current=false}}
                onMouseLeave={()=>{latestMouseDown.current=false}}
                onTouchMove={(e) => {
                    handleMouseMove(e.touches?.[0]);
                }}
            >
                <Miku control={control} timestamp={timestamp} model={config.model} runPhysics={runPhysics} key={mikuResetter}></Miku>
            </div>

        <div className='fps'>
            <b>FPS: </b>{Math.round(fps)}
        </div>
            <div className="controls">
                {/*<FormControlLabel control={<Checkbox checked={checked} onChange={e=>setChecked(e.target.checked)}/>} label="Label"/>*/}
                <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                    <Tabs value={tabPage} onChange={(e, v) => setTabPage(v)} aria-label="basic tabs example">
                        <Tab label="Control"/>
                        <Tab label="Info"/>
                        <Tab label="Background"/>
                        <Tab label="Settings"/>
                    </Tabs>
                </Box>

                {tabPage === 0 && <div className='controls-panel controls-panel-control'>
                    <ToggleButtonGroup
                        value={playType}
                        exclusive
                        onChange={(e, v) =>togglePlayType(v)}
                    >
                        <ToggleButton value={-1}>
                            <FiberManualRecord/>
                        </ToggleButton>
                        <ToggleButton value={1} disabled={record?.length===0}>
                            <PlayArrow/>
                        </ToggleButton>
                        <ToggleButton value={2}>
                            <Pause/>
                        </ToggleButton>
                    </ToggleButtonGroup>
                    &nbsp;
                    <ToggleButtonGroup>
                        <ToggleButton value={-1} onClick={e=>{setEditorTimestamp(x=>0)}}><FirstPage/></ToggleButton>
                        <ToggleButton value={-1} onClick={e=>{setEditorTimestamp(x=>Math.max(x-100,0))}}><FastRewind/></ToggleButton>
                        <ToggleButton value={1} onClick={e=>{setEditorTimestamp(x=>x+100)}}><FastForward/></ToggleButton>
                    </ToggleButtonGroup>
                    &nbsp;
                    <ToggleButtonGroup>
                        <ToggleButton value={1} onClick={()=>resetMiku()}><Refresh/></ToggleButton>
                    </ToggleButtonGroup>
                    &nbsp;
                    <ToggleButtonGroup
                        value={runPhysics}
                        exclusive
                        onChange={() =>setRunPhysics(x=>!x)}>
                        <ToggleButton value={false} ><Lock/></ToggleButton>
                    </ToggleButtonGroup>
                    &nbsp;
                    <ToggleButtonGroup>
                        <ToggleButton value={1} onClick={()=>{
                            try {
                                const input=document.createElement('input');
                                input.type='file';
                                input.onchange=(e)=>{
                                    console.log(e.target.files[0]);
                                    const fr=new FileReader();
                                    fr.onload=()=>setAudioFile(fr.result);
                                    fr.readAsDataURL(e.target.files[0]);
                                };
                                input.click();
                            }catch {}
                        }}><MusicNote/></ToggleButton>
                        <ToggleButton value={1} onClick={()=>{
                            try {
                                const input=document.createElement('input');
                                input.type='file';
                                input.onchange=(e)=>{
                                    const fr=new FileReader();
                                    fr.onload=()=>setRecord(JSON.parse(fr.result));
                                    fr.readAsText(e.target.files[0])
                                };
                                input.click();
                            }catch {}
                        }}><FileOpen/></ToggleButton>
                        <ToggleButton value={1} onClick={()=>{
                            const blob = new Blob([JSON.stringify(record)], {type: "text/plain;charset=utf-8"});
                            FileSaver.saveAs(blob, "HMSR.json");
                        }} disabled={record?.length===0}><Save/></ToggleButton>
                    </ToggleButtonGroup>
                    {audioFile?<audio src={audioFile} ref={audioRef}/>:null}
                    {/*<div className='timedisplay'>/</div>*/}
                    {/*<div className='timedisplay'>*/}
                    {/*    <b>{record.length?formatTime(record[layer][record.length-1].t):null}</b>*/}
                    {/*    <span className='small'>&nbsp;{record.length}</span>*/}
                    {/*</div>*/}
                    <TimeLine {...{editorTimestamp,setEditorTimestamp,record,setRecord,layer,setLayer}}/>
                </div>}
                {tabPage === 1 && <div className='controls-panel'>
                    {Object.entries(control).map(([k, v]) => <div key={k}><b>{k}</b>: {v}</div>)}
                </div>}
                {tabPage === 2 && <div className='controls-panel'>
                    <ToggleButtonGroup
                        value={stageBackground}
                        exclusive
                        onChange={(e, v) => setStageBackground(v || '#FFFFFF')}
                        label="Background"
                    >
                        <ToggleButton value={'#FFFFFF'} aria-label="White">
                            White
                        </ToggleButton>
                        <ToggleButton value={'#0000FF'} aria-label="Blue">
                            Blue
                        </ToggleButton>
                        <ToggleButton value={'#00FF00'} aria-label="Green">
                            Green
                        </ToggleButton>
                    </ToggleButtonGroup>
                    &nbsp;
                    <ToggleButtonGroup
                        value={stageBackground}
                        exclusive
                        onChange={(e, v) => setStageBackground(v || '#FFFFFF')}
                        label="Background"
                    >
                        {config.background?
                            Object.entries(config.background).map(([k,v])=>
                                <ToggleButton value={v} aria-label={k} key={k}>
                                    {k}
                                </ToggleButton>
                            )
                            :null}
                    </ToggleButtonGroup>
                </div>}{tabPage === 3 && <div className='controls-panel'>
                    <ToggleButtonGroup
                        value={fpsTarget}
                        exclusive
                        onChange={(e, v) => setFpsTarget(v || 0)}
                        label="FPS Limit"
                    >
                        <ToggleButton value={0} aria-label="OFF">
                            OFF
                        </ToggleButton>
                        <ToggleButton value={30} aria-label="30 FPS">
                            30 FPS
                        </ToggleButton>
                        <ToggleButton value={60} aria-label="60 FPS">
                            60 FPS
                        </ToggleButton>
                        <ToggleButton value={120} aria-label="120 FPS">
                            120 FPS
                        </ToggleButton>
                    </ToggleButtonGroup>
                </div>}
            </div>
        </div>);
}

export default App;
