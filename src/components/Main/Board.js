import React from "react"
import PropTypes from "prop-types"
import { accessorPropsType, callAccessor } from "../utils";

const Board = ({ data, keyAccessor, scale, ...props }) => {
  return (
    <React.Fragment>
      <circle
        className="Board__circle"
        r={scale.range()[1]}
      />
      {data.map((d, i) => (
        <g key={keyAccessor(d, i)}>
          <circle
            className="Board__circle"
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
        x={scale.bandwidth()* 0.8}
        y={10}   
      >
        { "Self" }
      </text> 
      </g>
      <g transform="rotate(-30)">
      <text {...props}
        className="Board__label"
        textAnchor="end"
        x={-scale.bandwidth()* 0.8}
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
  fontSize: '10px',
}

export default Board

