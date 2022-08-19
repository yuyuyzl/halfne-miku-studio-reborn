export default function Part({renderState}){
    if (!renderState)return null;
    const {id,x,y,components,resource,resourceCenterX,resourceCenterY,rotation,virtual,scaleY,scaleX}=renderState;
    if(virtual)return null;
    return <div data-id={id} style={{
        position:'absolute',
        transform:`translate(${x}px,${y}px) `+(rotation?`rotate(${rotation}deg)`:'')+(scaleY?` scaleY(${scaleY})`:'')+(scaleX?` scaleX(${scaleX})`:''),
    }}>
        <img src={resource} style={{
            position:'absolute',
            transform:`translate(${-resourceCenterX}px,${-resourceCenterY}px)`,
        }}/>
        {components?.map((o,i)=>
            <Part renderState={o} key={i}/>
        )}
    </div>
}