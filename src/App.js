import './App.less';
import Miku from "./Miku/Miku";
import {useCallback, useEffect, useRef, useState} from "react";
import {
    Box, Tab, Tabs, ToggleButton, ToggleButtonGroup
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
import Mouse from "@mui/icons-material/MouseOutlined";
import Key from "@mui/icons-material/KeyboardOutlined";
import FileSaver from 'file-saver';

import defaultConfig from './defaultModel'

const W = 800;
const H = 600;

let waitUntilNextFrame = requestAnimationFrame;

let fpsArr=[];

const formatTime=(millis)=>Math.floor(millis/1000/60)+':'+('00'+Math.floor(millis/1000%60)).slice(-2);

function TimeLine({editorTimestamp,setEditorTimestamp,record,setRecord,layer,setLayer}){
    const [scale,setScale]=useState(600);
    const [centerOffset,setCenterOffset]=useState(30000);
    const timelineRef=useRef();
    const selectionDragging=useRef(false);

    const t2l=(timestamp)=>((timestamp-centerOffset)/scale+50);
    const l2t = (left) => centerOffset+(left-50)*scale;
    const rulerScale=[1e2,2e2,5e2,1e3,2e3,5e3,1e4,2e4,6e4,12e4,3e5,6e5].reduce((p,c)=>p?p:c>=scale*5?c:0,0);
    const marks=(new Array(Math.floor(scale*100/rulerScale))).fill(0)
        .map((o,i)=>((Math.ceil(l2t(0)/rulerScale)+i)*rulerScale));
    useEffect(()=>{
        if((editorTimestamp-centerOffset)/scale+50<0){
            setCenterOffset(Math.max(scale*50,editorTimestamp-scale*40))
        }
        if((editorTimestamp-centerOffset)/scale+50>100){
            setCenterOffset(editorTimestamp+scale*40)
        }
    },[editorTimestamp,scale])
    useEffect(()=>{
        if((-centerOffset)/scale+50>0){
            setCenterOffset(scale*50);
        }
    },[scale])

    const handleTimelineMouse=e=>{
        const {x,width}=timelineRef.current.getBoundingClientRect();
        const {clientX}=e;
        setEditorTimestamp(Math.max(l2t(100*(clientX-x)/width),0));
    }

    return <div className='timeline'>
        <div className='timeline-L'>
            <div className='timeline-L-toolbar'>
                <div className='timedisplay' onWheel={e=>{setEditorTimestamp(x=>Math.max(x+e.deltaY,0))}}>
                    <b>{formatTime(editorTimestamp)}</b>
                    <span className='small'>&nbsp;{('000'+Math.floor(editorTimestamp%1000)).slice(-3)}</span>
                </div>
            </div>
            <div className='timeline-L-layer'>

                {record.map((o,i)=>
                    <div
                        className={'timeline-L-layer-item '+(i===layer?'timeline-L-layer-item-selected':"")}
                        onClick={()=>setLayer(i)}
                    >
                        Layer {i}
                    </div>
                )}

                <div
                    className={'timeline-L-layer-item '+(undefined===layer?'timeline-L-layer-item-selected':"")}
                    onClick={()=>setLayer(undefined)}
                >
                    New Layer
                </div>
            </div>
        </div>
        <div className='timeline-R'>
            <div
                ref={timelineRef}
                className='timeline-R-time'
                onWheel={e=>{setScale(x=>Math.max(x+e.deltaY,10))}}
                onClick={handleTimelineMouse}
                onMouseMove={e=>{e.buttons&&handleTimelineMouse(e)}}
            >
                {marks.map(o=><div className='timeline-R-time-mark' style={{left: t2l(o) + '%'}}/>)}
                {marks.map(o=>o%1000===0?<div className='timeline-R-time-time' style={{left: t2l(o)+'%'}}>{formatTime(o)}</div>:null)}
                {(t2l(editorTimestamp)>=0&&t2l(editorTimestamp)<100)?<div className='timeline-R-time-arrow' style={{left:t2l(editorTimestamp)+'%'}}/>:null}
            </div>
            <div
                className='timeline-R-content'
                // onMouseMove={e=>{e.buttons&&handleTimelineMouse(e)}}
                onWheel={e=>{setCenterOffset(x=>Math.max(x+e.deltaY*scale/100,scale*50))}}
                onMouseMove={e=>{
                    if(e.buttons&&selectionDragging.current){
                        const {x,width}=timelineRef.current.getBoundingClientRect();
                        const {clientX}=e;
                        const newTS=(Math.max(l2t(100*(clientX-x)/width),0));
                        setRecord(record=> {
                                for (let l of record) {
                                    let shouldSort=false;
                                    for (let c of l) {
                                        if (c.selected) {
                                            shouldSort=true;
                                            c.t = newTS;
                                        }
                                    }
                                    if(shouldSort)l=l.sort((a,b)=>a.t-b.t);
                                }
                                return [...record];
                            }
                        )
                    }
                }}
                onMouseUp={e=>{
                    selectionDragging.current=false;
                }}
            >
                {record.map((o,i)=>
                    <div className='timeline-R-content-layer'>
                        {(scale>=100&&o.length)?<div className='timeline-R-content-layer-block'
                              style={{left: t2l(o[0].t) + '%', right: 'calc( '+(100 - t2l(o[o.length - 1].t)) + '% - 1px '}}>
                        </div>:null}
                        {scale<100?o.map((r,i)=>(t2l(r.t)>=0&&t2l(r.t)<100)?
                            <div
                                className={'timeline-R-content-layer-control'+(r.selected?' timeline-R-content-layer-control-selected':'')}
                                style={{
                                    left: t2l(r.t) + '%',
                                    right: (o?.[i+1]?.t&&(r.c?.mouseX||r.c?.keyInput))?'calc( '+(100 - t2l(o?.[i+1]?.t)) + '% '+(r.selected?' + 2px':''):undefined,
                                    background:r.c.mouseX?'#efe':r.c.keyInput?'#eef':undefined,
                                }}
                                title={JSON.stringify(r.c)}
                                onMouseDown={(e)=>{
                                    for (let l of record)
                                    for (let c of l)
                                        if(c.selected)delete c.selected;
                                    r.selected=true;
                                    setRecord([...record]);
                                    // selectionDragging.current=true;
                                    // e.stopPropagation();
                                }}
                                onClick={()=>{
                                    setEditorTimestamp(r.t);
                                }}
                            >
                                <div
                                    className='timeline-R-content-layer-control-dragger'
                                    onMouseDown={(e) => {
                                        selectionDragging.current = true;
                                        // e.stopPropagation();
                                    }}
                                />
                                {r.c.mouseX!==undefined?<Mouse className='timeline-R-content-layer-control-icon'/>:null}
                                {r.c.keyInput!==undefined?r.c.keyInput.map(s=><div className='timeline-R-content-layer-control-key'>&nbsp;{s.replace(/[a-z ]/g,'')}</div>):null}
                            </div>
                            :null):null}
                    </div>
                )}
                <div className='timeline-R-content-layer'/>
            </div>
        </div>
    </div>
}

function App() {
    const stageRef = useRef();
    const latestMousePos = useRef([W/2, H/2]);
    const latestMouseDown = useRef(false);
    const audioRef = useRef();
    const editorTimestampOnPlay = useRef(0);
    const [timestamp, setTimestamp] = useState(performance.now());

    const [config, setConfig] = useState(defaultConfig);

    const [control, setControl] = useState(config.parseControl());
    const [keyMapping, setKeyMapping] = useState(config.defaultKeyMapping);

    const [fpsTarget, setFpsTarget] = useState(0);
    const [fps,setFps]=useState(0);

    const [tabPage, setTabPage] = useState(0);

    const [playType,setPlayType]=useState(0);
    const playTypeChangeTime=useRef();
    // const [currentFrame,setCurrentFrame]=useState();
    const [record,setRecord]=useState([]);
    const [mikuResetter,setMikuResetter]=useState(0);
    const [stageBackground,setStageBackground]=useState(Object?.entries?.(config.background)?.[0]?.[1]||'#FFFFFF');
    const [layer,setLayer]=useState();
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
        editorTimestampOnPlay.current=editorTimestamp;
        if (v === -1) {
            // setCurrentFrame(undefined);
            if(layer===undefined)setLayer(record.length)
            else setRecord(record=>{
                record[layer]=[]
                return record;
            })
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

        if(playType===-1){
            setRecord(record=>{
                record[layer].forEach((o,i)=>{
                    if(i===record[layer].length-1||i===0)return;
                    // debugger;
                    if(
                        (record[layer][i-1].c.mouseX===record[layer][i].c.mouseX)&&
                        (record[layer][i+1].c.mouseX===record[layer][i].c.mouseX)&&
                        (record[layer][i-1].c.mouseY===record[layer][i].c.mouseY)&&
                        (record[layer][i+1].c.mouseY===record[layer][i].c.mouseY)&&
                        (record[layer][i-1].c.keyInput?.join('||')===record[layer][i].c.keyInput?.join('||'))
                    )record[layer][i].del=true;
                })
                record[layer]=record[layer].filter(o=>!o.del);
                return record;
            })
        }

        setPlayType(v || 0);
        playTypeChangeTime.current=performance.now();
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

    useEffect(()=>{
        const editorKeyboardHandler=e=>{
            if (e.type === 'keydown') {
                console.log(e);
                switch (e.key){
                    case ' ':
                        if(playType===0||playType===2) {
                            if (e.shiftKey) togglePlayType(-1);
                            else togglePlayType(1);
                        }else {
                            togglePlayType(2);
                        }
                        break;
                    case 'Escape':
                        setRecord(record=>{
                            for (let l of record)
                                for (let c of l){
                                    if(c.selected)delete c.selected
                                }
                            return [...record];
                        })
                        break;
                    case 'Delete':
                        setRecord(record=>record.map(l=>l.filter(o=>!o.selected)));
                        break;
                    case 'Enter':
                        setRecord(record=>{
                            for (let l of record) {
                                for (let c of l) {
                                    if (c.selected) {
                                        c.c.keyInput=parseKeyMapping(window.keyList,keyMapping);
                                    }
                                }
                            }
                            return [...record];
                        })
                        break;
                    case '=':
                        setRecord(record=> {
                                if(layer===undefined)record.push([{t:editorTimestamp,c:{}}]);
                                else {
                                    if(record[layer].filter(o=>o.t===editorTimestamp).length===0) {
                                        record[layer].push({t: editorTimestamp, c: {}});
                                        record[layer] = record[layer].sort((a, b) => a.t - b.t);
                                    }
                                }
                                return [...record];
                            }
                        )
                        break;
                    case 'ArrowLeft':
                        setEditorTimestamp(x=>Math.max(x-100,0));
                        break;
                    case 'ArrowRight':
                        setEditorTimestamp(x=>Math.max(x+100,0));
                        break;
                }
            }
            e.preventDefault();
        }
        window.addEventListener('keydown', editorKeyboardHandler);
        window.addEventListener('keyup', editorKeyboardHandler);


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
        return ()=>{
            window.removeEventListener('keydown', editorKeyboardHandler);
            window.removeEventListener('keyup', editorKeyboardHandler);

            window.removeEventListener('keydown', keyboardHandler);
            window.removeEventListener('keyup', keyboardHandler);
        }
    },[playType, togglePlayType])

    useEffect(() => {
        if(playType===0||playType===-1) {
            if (!window.keyList) window.keyList = []
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
                        {mouseX: easeX.toFixed(1), mouseY: easeY.toFixed(1), keyInput: keyInput};
                    return config.parseControl({...control, ...rawControl , timestamp});
                })
                setTimestamp(timestamp);
                waitUntilNextFrame(updateControl);
            }
            waitUntilNextFrame(updateControl);
            return () => {
                canceled = true;
            }
        }
        if(playType===1){
            let canceled = false;
            console.log(record);
            const updateControl = (timestamp = performance.now()) => {
                if (canceled) return;
                const targetTime=timestamp-playTypeChangeTime.current+editorTimestampOnPlay.current;
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
    }, [playType]);

    useEffect(()=>{
        if (playType === -1) {
            const {mouseX,mouseY,timestamp,keyInput}=control;
            // debugger;
            setRecord(record => {
                    if(!record[layer])record[layer]=[];
                    record[layer].push({
                        t: record[layer].length===0?editorTimestampOnPlay.current:timestamp - playTypeChangeTime.current+editorTimestampOnPlay.current,
                        c: {mouseX:latestMouseDown.current?mouseX:undefined,mouseY:latestMouseDown.current?mouseY:undefined,keyInput:keyInput?.length?keyInput:undefined},
                    });
                    return record;
                }
            )
            setEditorTimestamp(timestamp - playTypeChangeTime.current+editorTimestampOnPlay.current);
        }
    },[control, layer, playType]);

    useEffect(()=>{
        if((playType===2||playType===0||playType===1)&&record?.length){
            const targetTime=editorTimestamp;
            setControl(control => {
                // console.log(timestamp-playTypeChangeTime);
                const layerControls=record.map(layerData=>{
                    const rawControlIndex=layerData?.reduce?.((p,c,i)=>c.t<=targetTime?i:p,undefined);
                    if(rawControlIndex===undefined)return {};
                    const rawControl={...layerData[rawControlIndex]?.c};
                    const rawControlNext=layerData[rawControlIndex+1]?.c;
                    // console.log(rawControl);
                    if(rawControlNext&&rawControl.mouseX!==undefined&&rawControlNext.mouseX!==undefined){
                        // console.log(rawControl,rawControlNext);
                        const lt=layerData[rawControlIndex]?.t;
                        const rt=layerData[rawControlIndex+1]?.t;
                        const kl=(rt-targetTime)/(rt-lt);
                        const kr=(targetTime-lt)/(rt-lt);
                        rawControl.mouseX=rawControl?.mouseX*kl+rawControlNext?.mouseX*kr;
                        rawControl.mouseY=rawControl?.mouseY*kl+rawControlNext?.mouseY*kr;
                    }
                    if(rawControl?.mouseX===undefined){
                        delete rawControl.mouseX;
                        delete rawControl.mouseY;
                    }
                    return rawControl;
                })
                // debugger;
                const newControl=layerControls.reduce((p,c)=>({...p,...c,keyInput:[...(p.keyInput||[]),...(c.keyInput||[])]}),{})
                if(newControl?.mouseX!==undefined)
                    latestMousePos.current=[newControl?.mouseX,newControl?.mouseY];
                else {
                    delete newControl.mouseX;
                    delete newControl.mouseY;
                }
                // console.log(newControl);
                return config.parseControl({...control,...newControl});
                // setCurrentFrame(rawControlIndex);
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
        if(playType===2&&e.buttons){
            const stageRect = stageRef.current?.getBoundingClientRect();
            if (!stageRect) return;
            const mouseX = e.clientX - Math.floor(stageRect.x);
            const mouseY = e.clientY - Math.floor(stageRect.y);
            //setControl(getControl(mouseX,mouseY));
            latestMousePos.current = [mouseX, mouseY];
            setRecord(record=>{
                for (let l of record) {
                    for (let c of l) {
                        if (c.selected) {
                            c.c.mouseX=mouseX;
                            c.c.mouseY=mouseY;
                        }
                    }
                }
                return [...record];
            })
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
                onTouchStart={()=>{latestMouseDown.current=true}}
                onTouchEnd={()=>{latestMouseDown.current=false}}
                onTouchCancel={()=>{latestMouseDown.current=false}}
                onTouchMove={(e) => {
                    handleMouseMove(e.touches?.[0]);
                }}
            >
                <Miku control={control} timestamp={timestamp} model={config.model} runPhysics={runPhysics} key={mikuResetter}/>
                {playType!==1&&<div className={'mouse'} style={{left: control.mouseX + 'px', top: control.mouseY + 'px'}}/>}
            </div>

        {playType!==2?<div className='fps'>
            <b>FPS: </b>{Math.round(fps)}
        </div>:null}
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
