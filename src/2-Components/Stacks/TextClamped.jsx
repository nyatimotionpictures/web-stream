import React from 'react'

const TextClamped = ({text, lines = 3}) => {
    const [isExpanded, setIsExpanded] = React.useState(false)
    const [isClamped, setIsClamped] = React.useState(false)
    const textRef = React.useRef(null)

    React.useEffect(() => {
        if (textRef?.current) {
           const fullHeight = textRef?.current?.scrollHeight;
           textRef?.current?.classList.add(`line-clamp-${lines}`)
           const clampedHeight = textRef?.current?.clientHeight;

           if (fullHeight > clampedHeight) {
              
               setIsClamped(true)
           } else {
              
               setIsClamped(false)
           }
         //  textRef?.current?.classList.remove(`line-clamp-${lines}`);
        }
    }, [lines, text])

    return (
        < p>
            <span ref={textRef} className={`${isExpanded ? "" : `line-clamp-${lines}`}`}>{text}  </span>
            {
                isClamped ? ( <span onClick={()=> setIsExpanded(!isExpanded)} className="italic text-primary-500">{isExpanded ? "Read less" : "Read more"}</span>) : null
            }
        </p>
    )
}

export default TextClamped