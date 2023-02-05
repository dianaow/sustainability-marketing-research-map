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
          <text {...props}
            className="Board__label"
            textAnchor="end"
            x={-10}
            y={-callAccessor(scale, d, i) - scale.bandwidth() / 2}   
          >
            { d === 'Self-Profit-Growth' ? 'Profit' : d}
          </text> 
        </g>
      ))}
      <g transform="rotate(30)">
      <text {...props}
        className="Board__label"
        textAnchor="start"
        x={scale.bandwidth() * 1.25}
        y={-scale.bandwidth() * 0.2}   
      >
        { "Self" }
      </text> 
      </g>
      <g transform="rotate(-30)">
      <text {...props}
        className="Board__label"
        textAnchor="end"
        x={-scale.bandwidth() * 1.25}
        y={scale.bandwidth() * 0.25}     
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

