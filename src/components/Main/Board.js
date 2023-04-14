import React from "react"
import PropTypes from "prop-types"
import { accessorPropsType, callAccessor } from "../utils";
import { colors } from "../consts";

const Board = ({ data, keyAccessor, scale, ...props }) => {
  return (
    <React.Fragment>
      <circle
        className="Board__circle"
        r={scale.range()[1]}
      />
      <g transform="rotate(90)">
        <text {...props}
          className="Board__label"
          textAnchor="start"
          x={scale.bandwidth()* 0.5}
          y={10} 
          fontSize={14}  
        >
          { "Value Orientation" }
        </text> 
      </g>
      {data.map((d, i) => (
        <g key={keyAccessor(d, i)}>
          <linearGradient id={`linearColors${i}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colors[i]} stopOpacity="0.2"></stop>
            <stop offset="33.3%" stopColor={colors[i]} stopOpacity="1"></stop>
            <stop offset="33.4%" stopColor={colors[i]} stopOpacity="0.2"></stop>
            <stop offset="66.6%" stopColor={colors[i]} stopOpacity="1"></stop>
            <stop offset="66.7%" stopColor={colors[i]} stopOpacity="0.2"></stop>
            <stop offset="100%" stopColor={colors[i]} stopOpacity="1"></stop>
          </linearGradient>
          <circle
            className="Board__circle"
            fill={colors[i] || "none"}
            r={callAccessor(scale, d, i) + scale.bandwidth()}
          />
          <circle
            className="Board__circle_stroke"
            r={callAccessor(scale, d, i) + scale.bandwidth()}
            fill='none'
            stroke='white'
            strokeWidth='0.5'
          />
          <text {...props}
            className="Board__label"
            textAnchor="start"
            x={5}
            y={-callAccessor(scale, d, i) - scale.bandwidth() * 0.8} 
          >
            { d === 'Self-Profit-Growth' ? 'Profit' : d}
          </text> 
        </g>
      ))}
      <g transform="rotate(30)">
      <text {...props}
        className="Board__label"
        textAnchor="start"
        x={scale.bandwidth()* 0.5}
        y={10}   
      >
        { "Self" }
      </text> 
      </g>
      <g transform="rotate(-30)">
      <text {...props}
        className="Board__label"
        textAnchor="end"
        x={-scale.bandwidth()* 0.5}
        y={-10}     
      >
        { "Growth" }
      </text> 
      </g>
    </React.Fragment>
  )
}

Board.propTypes = {
  data: PropTypes.array,
  keyAccessor: accessorPropsType,
  scale: accessorPropsType
}

Board.defaultProps = {
  fill: 'white',
  textAnchor: 'left',
  fontSize: '12px',
}

export default Board

