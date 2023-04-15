import React from "react"
import PropTypes from "prop-types"
import { accessorPropsType, callAccessor } from "../utils";
import { colors } from "../consts";

const Board = ({ data, keyAccessor, scale, ...props }) => {

  const texts = ['Growth', 'Profit', 'Self']
  return (
    <React.Fragment>
      <circle
        className="Board__circle"
        r={scale.range()[1]}
      />
      {
        data.map((d, i) => {
          return (
            <g key={keyAccessor(d, i)}>
              {/* <linearGradient id={`linearColors${i}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={colors[i]} stopOpacity="0.2"></stop>
                <stop offset="33.3%" stopColor={colors[i]} stopOpacity="1"></stop>
                <stop offset="33.4%" stopColor={colors[i]} stopOpacity="0.2"></stop>
                <stop offset="66.6%" stopColor={colors[i]} stopOpacity="1"></stop>
                <stop offset="66.7%" stopColor={colors[i]} stopOpacity="0.2"></stop>
                <stop offset="100%" stopColor={colors[i]} stopOpacity="1"></stop>
              </linearGradient> */}
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
              {
                texts.map((text, t) => {
                  return (<g transform={`rotate(${-120 + (t* 120)})`}>
                    <text {...props}
                      className="Board__label"
                      textAnchor="start"
                      transform={`translate(${10},${-callAccessor(scale, d, i) - scale.bandwidth() * (t=== 2 ? 0.15 : 0.85)})rotate(${t === 2 ? 270 : 90})`}
                    >
                      { d === 'Self-Profit-Growth' ? text : d}
                    </text> 
                  </g>)
                })
              }
            </g>
          )
        })
      }
      <g transform="rotate(-90)">
        <text {...props}
          className="Board__label"
          textAnchor="start"
          x={scale.bandwidth()}
          y={-10} 
          fontSize='14px'
          fontWeight='900' 
        >
          { "Value Orientations" }
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

