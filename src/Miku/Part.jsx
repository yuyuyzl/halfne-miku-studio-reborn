export default function Part({renderState}) {
    if (!renderState) return null;
    const {
        id,
        x,
        y,
        components,
        resource,
        resourceCenterX,
        resourceCenterY,
        rotation,
        virtual,
        scaleY,
        scaleX,
        skewX,
        skewY,
        width,
        height,
        ...others
    } = renderState;
    if (virtual) return null;
    return <div data-id={id} style={{
        position: 'absolute',
        transform:
            (skewX ? ` skewX(${-skewX}deg)` : '') +
            (skewY ? ` skewY(${skewY}deg)` : '') +
            `translate(${x}px,${y}px) ` +
            (rotation ? `rotate(${rotation}deg)` : '') +
            (scaleY ? ` scaleY(${scaleY})` : '') +
            (scaleX ? ` scaleX(${scaleX})` : '')
        ,
        ...others,
    }}>
        {resource ? <img src={resource} style={{
            position: 'absolute',
            transform: `translate(${-resourceCenterX}px,${-resourceCenterY}px)`,
            width: width + 'px',
            height: height + 'px'
        }}/> : null}
        {components?.map((o, i) =>
            <Part renderState={o} key={i}/>
        )}
    </div>
}