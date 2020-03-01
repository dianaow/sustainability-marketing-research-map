import React from "react"
import * as d3 from 'd3'
import { colorScale, fociRadius, categories } from "./consts"
import Axis from "./Axis"

const v_dist = 280
const h_dist = 80
const xScale = d3.scaleLinear()
  .range([0, v_dist])
  .domain([0, 1])

const dimensions = {'boundedWidth': v_dist, 'boundedHeight': h_dist}

const Distribution = ({ data, singleData, ...props }) => {

  const generateRect = (d) => {
    return (
      <rect
        key = {'entity' + d.entity}
        fill = {'none'}
        stroke = {colorScale(d.category)}
        x = {xScale(d.value) - fociRadius(d.overall)}
        y = {h_dist - fociRadius(d.overall)}
        width = {fociRadius(d.overall)*2}
        height = {fociRadius(d.overall)*2} 
      />
    )
  }

  const generateCircle = (d) => {
    return (
      <circle
        key = {'entity' + d.entity}
        fill = {d.category === 'Sub-Saharan Africa' ? 'none' : colorScale(d.category)}
        stroke = {colorScale(d.category)}
        cx = {xScale(d.value)}
        cy = {h_dist}
        r = {fociRadius(d.overall)} 
      />
    )
  }

  const generateLabels = (d) => {
    return (
      <text {...props}
        key = {'entity-label' + d.entity}
        fill = {colorScale(d.category)}
        x = {xScale(d.value)}
        y = {h_dist - fociRadius(d.overall) - 4}
      >
        {d.value.toFixed(2)}
      </text>
    ) 
  }

  return (
    <svg height={(h_dist+20)*(categories.length+1)}>
      {categories.map((d, i) => (
        <g 
          transform={`translate(${10}, ${i*(h_dist+25)})`} 
          className={"Distribution__" + i}
          key={"Distribution__" + i}
        >
          <path 
            className="Distribution__path"
            key={"Distribution__path_" + i}
            fill='white'
            fillOpacity={0.5}
            d={data[i].path}
          />
          <Axis
            className="Distribution__axis"
            dimensions={dimensions}
            dimension="x"
            scale={xScale}
            label={d}
          />
          { singleData.show && generateLabels(singleData.details[i])}
          { singleData.show && (singleData.details[i].category === 'East Asia & Pacific' ? generateRect(singleData.details[i]) : generateCircle(singleData.details[i])) }
        </g>
      ))}
    </svg>
  )
  
}

Distribution.propTypes = {

}

Distribution.defaultProps = {
  textAnchor: 'middle',
  fontSize: '12px',
}

export default Distribution