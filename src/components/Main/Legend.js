import React from "react"
import { unitType, fillScale, colorScale } from "../consts"

const size = 6

const Legend = ({ ...props }) => {
  return (
    <div className="Legend">
       <div className="Legend__color">
        <h4>Unit Type</h4>
        <svg height={unitType.length*30}>
          {unitType.map((d, i) => (
            <React.Fragment>
              <circle
                key={d}
                className="Legend__radius_node"
                cx={15}
                cy={15 + i*20}
                r={size}
                fill={fillScale(d)}
                stroke={colorScale(d)}
                strokeWidth={props.strokeWidth}
                strokeOpacity={props.strokeOpacity}
              />
              <text {...props}
                className="Legend__radius_label"
                x={30}
                y={15 + i*20}   
              >
                { d }
              </text> 
            </React.Fragment>    
          ))}    
        </svg>
      </div>     
    </div>
  )
}

Legend.propTypes = {

}

Legend.defaultProps = {
  fill: 'white',
  textAnchor: 'left',
  alignmentBaseline: 'middle',
  fontSize: '10px',
}

export default Legend
