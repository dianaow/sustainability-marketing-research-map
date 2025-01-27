import React from "react"
import { fillScale, colorScale } from "../consts"

const size = 6

const Legend = ({ ...props }) => {
  const data = props.data || []
  return (
    <div className="Legend">
       <div className="Legend__color">
        <h4>Paper name</h4>
        <svg height={(data.length)*30}>
          {data.map((d, i) => (
            <React.Fragment>
              <circle
                key={d}
                className="Legend__radius_node"
                cx={15}
                cy={15 + i*20}
                r={size}
                fill={fillScale(d)}
                stroke={d === 'Other journals' ? 'black' : colorScale(d)}
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
