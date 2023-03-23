import React from "react"
import PropTypes from "prop-types"
import * as d3 from 'd3'
import { dimensionsPropsType } from "../utils";

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
  fill: 'black',
  textAnchor: 'middle',
  fontSize: '9px',
  stroke: 'black',
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
          />
          <text {...props}
            key={'h-tick-' + i}
            className="Axis__tick"
            transform={`translate(${scale(tick)}, 15)`}  
          >
            { formatTick(tick) }
          </text>
        </React.Fragment>
      ))}
    
      {label && (
        <text {...props}
          className="Axis__label"
          transform={`translate(${dimensions.boundedWidth / 2}, 30)`} 
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
          />
          <text {...props}
            key={'v-tick-' + i}
            className="Axis__tick"
            transform={`translate(-30, ${scale(tick)})`} 
          >
            { formatTick(tick) }
          </text>
        </React.Fragment>
      ))}

      {label && (
        <text {...props}
          className="Axis__label"
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