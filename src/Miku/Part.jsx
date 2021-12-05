export default function Part({config}){
    const {id,x,y,components,resource,resourceCenterX,resourceCenterY,rotation,virtual}=config;
    if(virtual)return null;
    return <div data-id={id} style={{
        position:'absolute',
        transform:`translate(${x}px,${y}px) `+(rotation?`rotate(${rotation}deg)`:''),
    }}>
        <img src={resource} style={{
            position:'absolute',
            transform:`translate(${-resourceCenterX}px,${-resourceCenterY}px)`,
        }}/>
        {components?.map((o,i)=>
            <Part config={o} key={i}/>
        )}
    </div>
}