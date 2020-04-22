import React from "react"
import PropTypes from "prop-types"
import * as d3 from 'd3'
import { persona, fociRadius, fillScale, colorScale } from "../consts"

const size = 6
const keys = [0.75, 0.85, 1]
const asia = persona.filter(d=>d == 'East Asia & Pacific')
const others = persona.filter(d=>d != 'East Asia & Pacific')

const Legend = ({ ...props }) => {
  return (
    <div className="Legend">
       <div className="Legend__color">
        <h4>Nationality (by region)</h4>
        <svg height={persona.length*30}>
          {others.map((d, i) => (
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
          <React.Fragment>
            <rect
              key={asia[0]}
              className="Legend__radius_node"
              x={15-size}
              y={15 + others.length*20-size}
              width={size*2}
              height={size*2}
              fill={fillScale(asia[0])}
              stroke={colorScale(asia[0])}
              strokeWidth={props.strokeWidth}
              strokeOpacity={props.strokeOpacity}
            />
            <text {...props}
              className="Legend__radius_label"
              x={30}
              y={15 + others.length*20}    
            >
              { asia[0] }
            </text> 
          </React.Fragment>    
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
