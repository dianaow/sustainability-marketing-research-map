import React from "react"
import PropTypes from "prop-types"
import * as d3 from 'd3'
import { dimensionsPropsType } from "./utils";

const axisComponentsByDimension = {
  x: AxisHorizontal,
  y: AxisVertical,
}

const Axis = ({ dimension, ...props }) => {
  const Component = axisComponentsByDimension[dimension]
  if (!Component) return null

  return (
    <Component {...props} />
  )
}

Axis.propTypes = {
  dimension: PropTypes.oneOf(["x", "y"]),
  dimensions: dimensionsPropsType,
  scale: PropTypes.func,
  label: PropTypes.string,
  formatTick: PropTypes.func,
}

Axis.defaultProps = {
  dimension: "x",
  scale: null,
  formatTick: d3.format(","),
  label: null,
  fill: 'white',
  textAnchor: 'middle',
  fontSize: '9px',
  stroke: 'white',
  strokeWidth: '0.5px'
}

export default Axis


function AxisHorizontal ({ dimensions, label, formatTick, scale, ...props }) {
  const numberOfTicks = 5
  const ticks = scale.ticks(numberOfTicks)

  return (
    <g className="Axis AxisHorizontal" transform={`translate(0, ${dimensions.boundedHeight})`} >
      <line
        className="Axis__line"
        x2={dimensions.boundedWidth}
        stroke={props.stroke} 
        strokeWidth={props.strokeWidth}
      />

      {ticks.map((tick, i) => (
        <React.Fragment>  
          <line {...props}
            key={'h-line-' + i}
            className="Axis__line"
            transform={`translate(${scale(tick)}, 0)`}
            y2='10'
            fill={props.textColor} 
            textAnchor={props.textAnchor}
            fontSize={props.fontSize}    
          />
          <text
            key={'h-tick-' + i}
            className="Axis__tick"
            transform={`translate(${scale(tick)}, 20)`}
            fill={props.textColor} 
            textAnchor={props.textAnchor}
            fontSize={props.fontSize}    
          >
            { formatTick(tick) }
          </text>
        </React.Fragment>
      ))}
    
      {label && (
        <text
          className="Axis__label"
          transform={`translate(${dimensions.boundedWidth / 2}, 25)`} 
          fill={props.textColor} 
          textAnchor={props.textAnchor}
          fontSize={props.fontSize}  
        >
          { label }
        </text>
      )}
    </g>
  )
}

function AxisVertical ({ dimensions, label, formatTick, scale, ...props }) {
  const numberOfTicks = 3
  const ticks = scale.ticks(numberOfTicks)

  return (
    <g className="Axis AxisVertical">
      <line
        className="Axis__line"
        transform={`translate(-10, 0)`}
        y2={dimensions.boundedHeight}
        stroke={props.stroke} 
        strokeWidth={props.strokeWidth}
      />

      {ticks.map((tick, i) => (
        <React.Fragment> 
          <line {...props}
            key={'v-line-' + i}
            className="Axis__line"
            transform={`translate(-20, ${scale(tick)})`}
            x1='0'
            x2='10'
            fill={props.textColor} 
            textAnchor={props.textAnchor}
            fontSize={props.fontSize}    
          />
          <text
            key={'v-tick-' + i}
            className="Axis__tick"
            transform={`translate(-30, ${scale(tick)})`}
            fill={props.textColor} 
            textAnchor={props.textAnchor}
            fontSize={props.fontSize}    
          >
            { formatTick(tick) }
          </text>
        </React.Fragment>
      ))}

      {label && (
        <text
          className="Axis__label"
          fill={props.textColor} 
          textAnchor={props.textAnchor}
          fontSize={props.fontSize}  
          style={{
            transform: `translate(-56px, ${dimensions.boundedHeight / 2}px) rotate(-90deg)`
          }}
        >
          { label }
        </text>
      )}
    </g>
  )
}