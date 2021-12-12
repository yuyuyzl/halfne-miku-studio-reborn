export default function Part({renderState}){
    if (!renderState)return null;
    const {id,x,y,components,resource,resourceCenterX,resourceCenterY,rotation,virtual,scaleY}=renderState;
    if(virtual)return null;
    return <div data-id={id} style={{
        position:'absolute',
        transform:`translate(${x}px,${y}px) `+(rotation?`rotate(${rotation}deg)`:''),
    }}>
        <img src={resource} style={{
            position:'absolute',
            transform:`translate(${-resourceCenterX}px,${-resourceCenterY}px)`+(scaleY?` scaleY(${scaleY})`:''),
        }}/>
        {components?.map((o,i)=>
            <Part renderState={o} key={i}/>
        )}
    </div>
}