import './App.less';
import Miku from "./Miku/Miku";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
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
import LockOpen from "@mui/icons-material/LockOpen";
import MusicNote from "@mui/icons-material/MusicNote";
import FirstPage from "@mui/icons-material/FirstPage";
import Mouse from "@mui/icons-material/MouseOutlined";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import Close from "@mui/icons-material/Close";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Camera from "@mui/icons-material/Camera";
import Videocam from "@mui/icons-material/Videocam";
import CopyAll from "@mui/icons-material/CopyAll";
import Timer from "@mui/icons-material/Timer";
import ContentCut from "@mui/icons-material/ContentCut";
import FileSaver from 'file-saver';

import defaultConfig from './defaultModel'
import {deepDiff, parseModelJS} from "./Engine/modelUtils";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import {getInitPhysics, parseConfig, work} from "./Engine/core";

const W = 800;
const H = 600;

let waitUntilNextFrame = requestAnimationFrame;

let fpsArr=[];

const formatTime=(millis)=>Math.floor(millis/1000/60)+':'+('00'+Math.floor(millis/1000%60)).slice(-2);

const getRawControl=(record,targetTime)=>{
    const layerControls=record.map(layer=>{
        if (layer.v===false)return {};
        const layerData=layer.a;
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
    if(newControl?.mouseX===undefined){
        delete newControl.mouseX;
        delete newControl.mouseY;
    }
    return newControl;
}

function TimeLine({editorTimestamp,setEditorTimestamp,record,setRecord,layer,setLayer,renderStart,renderEnd}){
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

    return useMemo(()=><div className='timeline'>
        <div className='timeline-L'>
            <div className='timeline-L-toolbar'>
                <div className='timedisplay' onWheel={e=>{setEditorTimestamp(x=>Math.max(x+e.deltaY,0))}}>
                    <b>{formatTime(editorTimestamp)}</b>
                    <span className='small'>&nbsp;{('000'+Math.floor(editorTimestamp%1000)).slice(-3)}</span>
                </div>
            </div>
            <div className='timeline-L-layer'>

                {record.map((o,i)=> {
                    const {l = false, v = true, n = `Layer ${i}`} = o;
                    return <div
                        className={'timeline-L-layer-item ' + (i === layer ? 'timeline-L-layer-item-selected' : "")}
                        onClick={() => setLayer(i)}
                    >
                        <span onDoubleClick={()=>{
                            setRecord(record => {
                                record[i].n = prompt('Layer name:',n)||n;
                                return [...record]
                            })
                        }}>{n}</span>
                        <div className='timeline-L-layer-item-options'>
                            {l ? null : <>
                                {i !== record.length - 1 ? <ArrowUpward onClick={() => setRecord(record => {
                                    [record[i],record[i+1]]=[record[i+1],record[i]]
                                    return [...record]
                                })} fontSize={'inherit'}/> : null}
                                {i !== 0 ? <ArrowDownward onClick={() => setRecord(record => {
                                    [record[i],record[i-1]]=[record[i-1],record[i]]
                                    return [...record]
                                })} fontSize={'inherit'}/> : null}
                                {v ? <Visibility onClick={() => setRecord(record => {
                                    record[i].v = false;
                                    return [...record]
                                })} fontSize={'inherit'}/> : <VisibilityOff onClick={() => setRecord(record => {
                                    record[i].v = true;
                                    return [...record]
                                })} fontSize={'inherit'}/>}
                                <CopyAll onClick={e=>{setRecord(record=>record.reduce((p,o,ii)=>  ii === i ? [...p, o, JSON.parse(JSON.stringify(o))] : [...p, o],[]));e.stopPropagation();}} fontSize={'inherit'}/>
                                <ContentCut onClick={e=>{setRecord(record=> {
                                    const layerLeft=record[i].a.filter(o=>o.t<=editorTimestamp);
                                    const layerRight=record[i].a.filter(o=>o.t>=editorTimestamp);
                                    if(layerLeft.length===0||layerRight.length===0)return record;
                                    return record.reduce((p, o, ii) => ii === i ? [...p, {...JSON.parse(JSON.stringify(o)),a:layerLeft}, {...JSON.parse(JSON.stringify(o)),a:layerRight}] : [...p, o], [])
                                });e.stopPropagation();}} fontSize={'inherit'}/>
                                <Timer onClick={e=>{setRecord(record=>{
                                    const delta=+prompt('Dt(ms)',0)||0;
                                    if(!+delta)return record;
                                    record[i].a=record[i].a.map(o=>({...o,t:o.t+delta}));
                                    return [...record];
                                });e.stopPropagation();}} fontSize={'inherit'}/>
                                <Close onClick={e=>{setRecord(record=>record.filter((o,ii)=>ii!==i));setLayer(undefined);e.stopPropagation();}} fontSize={'inherit'}/>
                            </>}
                            {l ? <Lock onClick={() => setRecord(record => {
                                record[i].l = false;
                                return [...record]
                            })} fontSize={'inherit'}/> : <LockOpen onClick={() => setRecord(record => {
                                record[i].l = true;
                                return [...record]
                            })} fontSize={'inherit'}/>}
                        </div>
                    </div>
                })}

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
                {(t2l(renderStart)>=0&&t2l(renderStart)<100)?<div className='timeline-R-time-render-L' style={{left:t2l(renderStart)+'%'}}/>:null}
                {(t2l(renderEnd)>=0&&t2l(renderEnd)<100)?<div className='timeline-R-time-render-R' style={{left:t2l(renderEnd)+'%'}}/>:null}
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
                                    for (let c of l.a) {
                                        if (c.selected) {
                                            shouldSort=true;
                                            c.t = newTS;
                                        }
                                    }
                                    if(shouldSort)l=l.a.sort((a,b)=>a.t-b.t);
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
                {record.map(({a:o=[],l=false},i)=>
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
                                    for (let c of l.a)
                                        if(c.selected)delete c.selected;
                                    if(!l)r.selected=true;
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
                                        if(!l)selectionDragging.current = true;
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
    </div>,[editorTimestamp,record,layer,renderStart,renderEnd,scale,centerOffset])
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
    const [renderFps, setRenderFps] = useState(60);
    const [fps,setFps]=useState(0);

    const [tabPage, setTabPage] = useState(0);

    const [playType,setPlayType]=useState(0);
    const playTypeChangeTime=useRef();
    // const [currentFrame,setCurrentFrame]=useState();
    const [record,setRecord]=useState([]);
    const [mikuResetter,setMikuResetter]=useState(0);
    const [stageBackground,setStageBackground]=useState((config.background&&Object?.entries?.(config.background)?.[0]?.[1])||'#FFFFFF');
    const [layer,setLayer]=useState();
    const [editorTimestamp,setEditorTimestamp]=useState(0);
    const [runPhysics,setRunPhysics]=useState(true);
    const [audioFile,setAudioFile]=useState();

    const [renderStart,setRenderStart]=useState(undefined);
    const [renderEnd,setRenderEnd]=useState(undefined);
    const [renderScale,setRenderScale]=useState(1);


    const resetMiku=(rawControl={mouseX:W/2,mouseY:H/2,keyInput:[]})=>{
        latestMousePos.current=[rawControl.mouseX,rawControl.mouseY];
        setControl(config.parseControl(rawControl));
        setMikuResetter(i=>i+1);
    }

    const parseKeyMapping = (keyList, keyMapping) => keyList.map(o => keyMapping.filter(([k, v]) => v === o).map(([k, v]) => k))
        .reduce((p, c) => [...p, ...c], []);

    const togglePlayType=(v,fromTimestamp=editorTimestamp)=> {
        editorTimestampOnPlay.current=fromTimestamp;
        if (v === -1) {
            // setCurrentFrame(undefined);
            if(layer===undefined)setLayer(record.length)
            else setRecord(record=>{
                record[layer]= {a:[]}
                return record;
            })
        }
        if (v === 1||v===3) {
            if (!record.length)return;
            setEditorTimestamp(fromTimestamp);
            resetMiku(getRawControl(record,fromTimestamp));
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
                record[layer].a.forEach((o,i)=>{
                    if(i===record[layer].a.length-1||i===0)return;
                    // debugger;
                    if(
                        (record[layer].a[i-1].c.mouseX===record[layer].a[i].c.mouseX)&&
                        (record[layer].a[i+1].c.mouseX===record[layer].a[i].c.mouseX)&&
                        (record[layer].a[i-1].c.mouseY===record[layer].a[i].c.mouseY)&&
                        (record[layer].a[i+1].c.mouseY===record[layer].a[i].c.mouseY)&&
                        (record[layer].a[i-1].c.keyInput?.join('||')===record[layer].a[i].c.keyInput?.join('||'))
                    )record[layer].a[i].del=true;
                })
                record[layer].a=record[layer].a.filter(o=>!o.del);
                return record;
            })
        }

        setPlayType(v || 0);
        playTypeChangeTime.current=performance.now();
    }

    useEffect(() => {
        let frametime=0;
        const _waitUntilNextFrame = fpsTarget ? (f => setTimeout(f, fpsTarget!==Infinity?(1000 / fpsTarget-frametime):0)) : requestAnimationFrame
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
                                for (let c of l.a){
                                    if(c.selected)delete c.selected
                                }
                            return [...record];
                        })
                        break;
                    case 'Delete':
                    case 'Backspace':
                        setRecord(record=>record.map(l=>({...l,a:l.a.filter(o => !o.selected)})));
                        break;
                    case 'Enter':
                        setRecord(record=>{
                            for (let l of record) {
                                for (let c of l.a) {
                                    if (c.selected) {
                                        c.c.keyInput=parseKeyMapping(window.keyList,keyMapping);
                                    }
                                }
                            }
                            return [...record];
                        })
                        break;
                    case '=':
                        if(!record?.[layer]?.l)
                            setRecord(record=> {
                                    if(layer===undefined) {
                                        record.push({a: [{t: editorTimestamp, c: {}}]});
                                        setLayer(record.length-1);
                                    }
                                    else {
                                        if(record[layer].a.filter(o=>o.t===editorTimestamp).length===0) {
                                            record[layer].a.push({t: editorTimestamp, c: {}});
                                            record[layer].a = record[layer].a.sort((a, b) => a.t - b.t);
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
                    case '[':
                        setRenderStart(Math.min(editorTimestamp,renderEnd||Infinity));
                        break;
                    case ']':
                        setRenderEnd(Math.max(editorTimestamp,renderStart||0));
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

    // Main Play Control
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
                setEditorTimestamp(targetTime);
                setTimestamp(targetTime);
                waitUntilNextFrame(updateControl);
            }
            waitUntilNextFrame(updateControl);
            return () => {
                canceled = true;
            }
        }
        if(playType===3){
            let canceled = false;
            console.log(record);
            let zip=new JSZip();
            let partCount=0;
            let size=0;
            const updateControl = (currentFrame) => {
                if (canceled) return;
                const now = performance.now();
                while (fpsArr.length > 0 && fpsArr[0] <= now - 1000) {
                    fpsArr.shift();
                }
                fpsArr.push(now);
                setFps((fpsArr.length-1)*1000/(now-fpsArr[0]));
                console.log(currentFrame);
                html2canvas(stageRef.current,{backgroundColor:null,removeContainer:false,scale:renderScale}).then(function(canvas) {
                    document.querySelectorAll('.html2canvas-container').forEach(el => {
                        const iframe = el.contentWindow;
                        if (el) {
                            el.src = 'about:blank';
                            iframe.document.write('');
                            iframe.document.clear();
                            iframe.close();
                            el.remove();
                        }
                    })
                    canvas.toBlob(o => {
                        size+=o.size;
                        if(size>1024*1024*1024) {
                            const currentPartCount = partCount;
                            partCount++;
                            zip.generateAsync({type: 'blob'}).then(o => {
                                    FileSaver.saveAs(o, `HMSR-Render-part${currentPartCount}.zip`);
                                }
                            )
                            zip = new JSZip();
                            size=0;
                        }
                        console.log(o.size);
                        zip.file(`HMSR-Render-${('00000'+currentFrame).slice(-5)}.png`,o);
                        // console.log(performance.memory.totalJSHeapSize/performance.memory.jsHeapSizeLimit);
                        // FileSaver.saveAs(o, `HMSR-Render-${('00000'+currentFrame).slice(-5)}.png`);
                        // console.log(o);
                        const targetTime = (currentFrame + 1) * 1000 / renderFps + editorTimestampOnPlay.current;
                        if (targetTime <= renderEnd) {
                            setEditorTimestamp(targetTime);
                            setTimestamp(targetTime);
                            setTimeout(() => updateControl(currentFrame + 1));
                        } else {
                            togglePlayType(2);
                        }
                    });

                });
            }
            setTimeout(()=>updateControl(0));
            return () => {
                canceled = true;
                zip.generateAsync({type:'blob'}).then(o=>
                    FileSaver.saveAs(o,partCount===0?'HMSR-Render.zip':`HMSR-Render-part${partCount}.zip`)
                )
            }
        }
    }, [playType]);

    // Recording Control
    useEffect(()=>{
        if (playType === -1) {
            const {mouseX,mouseY,timestamp,keyInput}=control;
            // debugger;
            setRecord(record => {
                    if(!record[layer])record[layer]={a:[]};
                    record[layer].a.push({
                        t: record[layer].a.length===0?editorTimestampOnPlay.current:timestamp - playTypeChangeTime.current+editorTimestampOnPlay.current,
                        c: {mouseX:latestMouseDown.current?mouseX:undefined,mouseY:latestMouseDown.current?mouseY:undefined,keyInput:keyInput?.length?keyInput:undefined},
                    });
                    return record;
                }
            )
            setEditorTimestamp(timestamp - playTypeChangeTime.current+editorTimestampOnPlay.current);
        }
    },[control, layer, playType]);

    // Editor Timestamp to Control Data
    useEffect(()=>{
        if((playType>=0)&&record?.length){
            const targetTime=editorTimestamp;
            setControl(control => {
                // console.log(timestamp-playTypeChangeTime);
                const newControl=getRawControl(record,targetTime);
                if(newControl?.mouseX) latestMousePos.current=[newControl?.mouseX,newControl?.mouseY];
                // console.log(newControl);
                return config.parseControl({...control,...newControl});
                // setCurrentFrame(rawControlIndex);
            })
            if(playType===2)setTimestamp(editorTimestamp);
        }
    },[playType,editorTimestamp,record])

    const handleMouseMove = useCallback((e) => {
        if(e===undefined){
            if(playType===2){
                setRecord(record=>{
                    for (let l of record) {
                        for (let c of l.a) {
                            if (c.selected) {
                                delete c.c.mouseX;
                                delete c.c.mouseY;
                            }
                        }
                    }
                    return [...record];
                })
            }
            return;
        }
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
                    for (let c of l.a) {
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
                onMouseLeave={()=>{latestMouseDown.current&&handleMouseMove();latestMouseDown.current=false}}
                onTouchStart={()=>{latestMouseDown.current=true}}
                onTouchEnd={()=>{latestMouseDown.current=false}}
                onTouchCancel={()=>{latestMouseDown.current=false}}
                onTouchMove={(e) => {
                    handleMouseMove(e.touches?.[0]);
                }}
            >
                {stageBackground===false?<div className='stage-transparent' data-html2canvas-ignore={true}/>:null}
                <Miku control={control} timestamp={timestamp} model={config.model} runPhysics={runPhysics} key={mikuResetter}/>
                {playType!==1&&<div className={'mouse'} data-html2canvas-ignore={true} style={{left: control.mouseX + 'px', top: control.mouseY + 'px'}}/>}
                {/*{playType===3?<div className='stage-debug'>{editorTimestamp}</div>:null}*/}
            </div>
            <div className='stage-bottom'/>
        {audioFile?<audio src={audioFile} ref={audioRef} onLoadedMetadata={e=> {
            console.log(audioRef.current);
            setRenderEnd(renderEnd=>renderEnd===undefined?audioRef.current.duration*1000:renderEnd);
            setRenderStart(renderStart=>renderStart===undefined?0:renderStart);
        }}/>:null}
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
                        <Tab label="Render"/>
                        <Tab label="Settings"/>
                    </Tabs>
                </Box>

                {tabPage === 0 && <div className='controls-panel controls-panel-control'>
                    <ToggleButtonGroup
                        value={playType}
                        exclusive
                        onChange={(e, v) =>togglePlayType(v)}
                    >
                        <ToggleButton value={-1} disabled={record[layer]?.l}>
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
                                    fr.onload=()=> {
                                        let _record=JSON.parse(fr.result);
                                        _record=_record.map(o=>Array.isArray(o)?{a:o}:o);
                                        setRecord(_record);
                                    };
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
                    {/*<div className='timedisplay'>/</div>*/}
                    {/*<div className='timedisplay'>*/}
                    {/*    <b>{record.length?formatTime(record[layer][record.length-1].t):null}</b>*/}
                    {/*    <span className='small'>&nbsp;{record.length}</span>*/}
                    {/*</div>*/}
                    <TimeLine {...{editorTimestamp,setEditorTimestamp,record,setRecord,layer,setLayer,renderStart,renderEnd}}/>
                </div>}
                {tabPage === 1 && <div className='controls-panel'>
                    {Object.entries(control).map(([k, v]) => <div key={k}><b>{k}</b>: {v}</div>)}
                </div>}
                {tabPage === 2 && <div className='controls-panel'>
                    <ToggleButtonGroup
                        value={stageBackground}
                        exclusive
                        onChange={(e, v) => setStageBackground(v||false)}
                        label="Background"
                    >
                        <ToggleButton value={false} aria-label="Transparent">
                            Transparent
                        </ToggleButton>
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
                        onChange={(e, v) => setStageBackground(v || false)}
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
                </div>}
                {tabPage === 3 && <div className='controls-panel controls-panel-control'>
                    <ToggleButtonGroup>
                        <ToggleButton value={1} onClick={()=>{
                            html2canvas(stageRef.current,{backgroundColor:null,scale:renderScale}).then(function(canvas) {
                                canvas.toBlob(o=>FileSaver.saveAs(o,'HMSR-Render.png'));
                            });
                        }}><Camera/></ToggleButton>
                    </ToggleButtonGroup>
                    &nbsp;
                    <ToggleButtonGroup
                        value={playType}
                        exclusive
                        onChange={(e,v)=> {
                            playType !== 3 ? togglePlayType(3, renderStart) : togglePlayType(2)
                        }}
                    >
                        <ToggleButton value={3} disabled={record?.length===0}><Videocam/></ToggleButton>
                    </ToggleButtonGroup>
                    &nbsp;
                    <ToggleButtonGroup>
                        <ToggleButton value={1} onClick={async ()=>{
                            let renderControl=config.parseControl(getRawControl(record,renderStart));
                            let renderPhysics=getInitPhysics(parseConfig(config.model,renderControl));
                            let renderStates=[];
                            const totFrame=Math.floor((renderEnd-renderStart)*renderFps/1000);
                            let lastReport=0;
                            for(let frame=0;frame<=totFrame;frame++) {
                                renderControl=config.parseControl({...renderControl,...getRawControl(record,renderStart+frame*1000/renderFps)})
                                work(frame===0?0:(1000/renderFps),
                                    config.model,
                                    renderControl,
                                    renderPhysics,
                                    p=>{renderPhysics=p},
                                    r=>renderStates.push(frame===0?r:deepDiff(renderStates[0],r)),
                                )
                                if(performance.now()-lastReport>100){
                                    lastReport=performance.now();
                                    document.querySelector('.rendertime').innerHTML=(100*frame/totFrame).toFixed(2)+'%';
                                    await new Promise(res=>setTimeout(res,0));
                                }
                            }
                            const outputData={
                                fps:renderFps,
                                background:stageBackground,
                                scale:renderScale,
                                renderStates,
                            }
                            const blob = new Blob([JSON.stringify(outputData)], {type: "text/plain;charset=utf-8"});
                            FileSaver.saveAs(blob, "HMSR-Render-Data.json");
                            document.querySelector('.rendertime').innerHTML='';
                            console.log(renderStates);
                        }} disabled={record?.length===0}><Save/></ToggleButton>
                    </ToggleButtonGroup>
                    &nbsp;
                    <ToggleButtonGroup
                        value={renderFps}
                        exclusive
                        onChange={(e, v) => setRenderFps(v || renderFps)}
                        label="Render FPS"
                    >
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
                    &nbsp;
                    <ToggleButtonGroup
                        value={renderScale}
                        exclusive
                        onChange={(e, v) => setRenderScale(v || renderScale)}
                        label="Render FPS"
                    >
                        <ToggleButton value={1} aria-label="1">
                            1x
                        </ToggleButton>
                        <ToggleButton value={1.8} aria-label="2">
                            1.8x
                        </ToggleButton>
                        <ToggleButton value={2} aria-label="2">
                            2x
                        </ToggleButton>
                        <ToggleButton value={2.4} aria-label="2">
                            2.4x
                        </ToggleButton>
                        <ToggleButton value={3} aria-label="3">
                            3x
                        </ToggleButton>
                    </ToggleButtonGroup>
                    &nbsp;
                    {<div className='timedisplay'>
                        <b className='rendertime'/>
                        {playType===3&&<>
                            <b>{Math.floor((editorTimestamp - renderStart) * renderFps / 1000)}/{Math.floor((renderEnd - renderStart) * renderFps / 1000)}</b>
                            <span className='small'>&nbsp;{(Math.floor((editorTimestamp-renderStart)*renderFps/1000)/Math.floor((renderEnd-renderStart)*renderFps/1000)*100).toFixed(2)}%</span>
                        {fps>0&&<span
                            className='small'>&nbsp;ETA:{formatTime((renderEnd - editorTimestamp) * renderFps / fps)}</span>}
                        </>}
                    </div>}
                </div>}
                {tabPage === 4 && <div className='controls-panel controls-panel-control'>
                <ToggleButtonGroup>
                    <ToggleButton value={1} onClick={()=>{
                        try {
                            const input=document.createElement('input');
                            input.type='file';
                            input.onchange=(e)=>{
                                const fr=new FileReader();
                                fr.onload=()=> {
                                    let newConfig=parseModelJS(fr.result);
                                    setConfig(newConfig);
                                    resetMiku();
                                };
                                fr.readAsText(e.target.files[0])
                            };
                            input.click();
                        }catch {}
                    }}><FileOpen/></ToggleButton>
                </ToggleButtonGroup>

                &nbsp;
                    <ToggleButtonGroup
                        value={fpsTarget}
                        exclusive
                        onChange={(e, v) => setFpsTarget(v || 0)}
                        label="FPS Limit"
                    >
                        <ToggleButton value={0} aria-label="OFF">
                            RAF
                        </ToggleButton>
                        <ToggleButton value={Infinity} aria-label="OFF">
                            Unlimited
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


