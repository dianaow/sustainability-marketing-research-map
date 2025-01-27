import React from "react"
import PropTypes from "prop-types"
import { invisibleArc, angleSlice } from "../consts"

export const max = Math.max;
export const sin = Math.sin;
export const cos = Math.cos;
export const HALF_PI = Math.PI / 2;

const Axis = ({ data, radius, innerRadius, keyAccessor, ...props }) => {
  return (
    <g className="Axis">
      {data.map((axis, i) => (
        <g key={keyAccessor(axis, i)}>
          <line
            className="Axis__line"
            x1={0}
            y1={0}
            x2={radius * cos(angleSlice * i - HALF_PI)}
            y2={radius * sin(angleSlice * i - HALF_PI)}
            stroke={props.stroke}
            strokeWidth={props.strokeWidth}
            strokeOpacity={props.strokeOpacity}
          />
          <path
            className="Axis__invisible_arc"
            id={"Axis__arc_" + i}
            d={invisibleArc(i, innerRadius, angleSlice)}
            strokeOpacity={0}
            fill='none'
          />
          <text 
            className="Axis__arcText"
            fill={props.textColor}
            fontSize={props.fontSize}
          >
            <textPath
              startOffset="50%"
              textAnchor={props.textAnchor}
              xlinkHref={"#Axis__arc_" + i}
            >
            { axis.toUpperCase() }
            </textPath>
          </text>
        </g>    
      ))}
        <text 
          className="Axis__arcText"
          fill={props.textColor}
          fontSize='18px'
          fontWeight='900'
          y={-radius}
          textAnchor="middle"
        >
          { 'Scope of Sustainability' }
        </text>
    </g>
  )
}

Axis.propTypes = {
  data: PropTypes.array,
  radius: PropTypes.number
}

Axis.defaultProps = {
  radius: 100,
  stroke: 'white',
  strokeWidth: '2px',
  strokeOpacity: 0.2,
  textColor: 'white',
  textAnchor: 'middle',
  fontSize: '11px',
  labelFactor: 1.1
}

export default Axis

