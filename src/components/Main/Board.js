import React from "react"
import PropTypes from "prop-types"
import { accessorPropsType, callAccessor } from "../utils";
import { UPPER } from "../consts"

const Board = ({ data, keyAccessor, rAccessor, ...props }) => {

  return (
    <React.Fragment>
      {data.map((d, i) => (
        <g key={keyAccessor(d, i)}>
          <circle
            className="Board__circle"
            r={callAccessor(rAccessor, d, i)}
          />
          <text {...props}
            className="Board__label"
            x={10}
            y={-callAccessor(rAccessor, d, i)}   
          >
            { Math.round((UPPER - d) * 100) / 100 }
          </text> 
        </g>
      ))}
    </React.Fragment>
  )
}

Board.propTypes = {
  data: PropTypes.array,
  keyAccessor: accessorPropsType,
  rAccessor: accessorPropsType
}

Board.defaultProps = {
  fill: 'white',
  textAnchor: 'left',
  fontSize: '10px',
}

export default Board

