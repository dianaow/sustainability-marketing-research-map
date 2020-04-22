import React, { useContext } from "react";
import { arc } from '../utils'
import Tooltip, { TooltipContext } from "./Tooltip";

const Network = ({ ...props }) => {

  const tooltip = useContext(TooltipContext)
  const data = tooltip.links
  
  const dataFilt = data.filter(d=>d.sourceId !== d.targetId)

  return (
    <g className="Network">
      {dataFilt.map((d, i) => 
        <React.Fragment>
          <path
            key={d.sourceId + '-' + d.targetId}
            className="Network__path"
            d={arc(d, 'source', 'target')}
            fill='none'
            stroke={props.stroke}
            strokeWidth={props.strokeWidth}
            strokeOpacity={props.strokeOpacity}
          />
          <image
            className="Network__image"
            x={d.target[0]-10}
            y={d.target[1]-10}
            width={10*2}
            height={10*2}
            xlinkHref={d.photo}
          /> 
        </React.Fragment>    
      )}
    </g>
  )
}

Network.propTypes = {

}

Network.defaultProps = {
  stroke: 'white',
  strokeWidth: '0.5px',
  strokeOpacity: 0.8,
  textColor: 'white',
  textAnchor: 'middle',
  fontSize: '10px'
}

export default Network