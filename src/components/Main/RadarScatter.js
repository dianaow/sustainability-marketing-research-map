import React from "react"
import * as d3 from "d3"

import Chart from "../Shared/Chart"
import Board from "./Board"
import Axis from "./RadarAxis"
import Nodes from "./Nodes"

import { callAccessor, onlyUnique }  from "../utils"
import { invisibleArc, colorScale, fillScale, tagCategories, topicCategories, scoreCategories, nodeRadiusScale, angleSlice, bufferInRad } from "../consts"

const getCoordsAlongArc = (data, rScale, label) => {

  const angle = angleSlice * (topicCategories.indexOf(data.topic))

  const angleScale = d3.scaleLinear()
    .range([angle + bufferInRad , angle+angleSlice - bufferInRad])
    .domain(data.topic === topicCategories.slice(-1) ? [5, 1] : [1, 5])

  const line = d3.lineRadial()
    .radius(function(d,i) { return label ? callAccessor(rScale, d.category, i) + rScale.bandwidth() + 8 : callAccessor(rScale, d.category, i) + rScale.bandwidth() / 2})
    .angle(function(d,i) { return angleScale(+d.value) })

  return line([data]).slice(1).slice(0, -1).split(',')

}

const getPolarScatterCoords = (data, rScale) => {

  data.forEach(a => {
    const coors = getCoordsAlongArc(a, rScale)
    a.x = +coors[0]
    a.y = +coors[1]
    a.size = nodeRadiusScale(a.count)
  })

  const simulation = d3
    .forceSimulation()
    .nodes(data)
    .force('charge', d3.forceManyBody().strength(-20))
    .force('x', d3.forceX().x(d => d.x).strength(window.innerHeight < 800 ? 0.75 : 0.55))
    .force('y', d3.forceY().y(d => d.y).strength(window.innerHeight < 800 ? 0.75 : 0.55))
    .force(
      'collision',
      d3.forceCollide().radius((d) => d.size * 0.45)
    )
    .stop();

    for (
      let i = 0,
        n = Math.ceil(
          Math.log(simulation.alphaMin()) /
            Math.log(1 - simulation.alphaDecay())
        );
      i < n;
      ++i
    ) {
      simulation.tick();
    }

  return data

}
const Radar = ({ data, search, ...props }) => {

  const colorCategories = data.map(d => d.color).filter(onlyUnique).filter(d => d !== 'Other papers').sort()
  fillScale.domain(colorCategories)
  colorScale.domain(colorCategories)

  const dimensions = {'width': window.innerWidth * 0.8 * 0.6, 'height': window.innerHeight*0.9}
  const radius = Math.min(dimensions.width/2, dimensions.height/2) - 18

  const rScale = d3.scaleBand()
    .range([radius, (radius/tagCategories.length)* 0.3])
    .domain(tagCategories)

  // Calculate the placement of each axis arc label
  const values = ['Not Applicable', 'Very weak', 'Weak', 'Moderate', 'Strong', 'Very Strong']
  const labels = []
  topicCategories.forEach((topic)=>{
    scoreCategories.forEach((score)=>{
      const datum = {
        topic : topic,
        category: tagCategories[0],
        value : score
      } 
      let coors = getCoordsAlongArc(datum, rScale, true)
      labels.push({text: values[score], x: +coors[0], y: +coors[1]})
    })
  })

  const radialData = getPolarScatterCoords(data, rScale)

  const nodeKeyAccessor = d => "entity-" + d.entity
  const xAccessor = d => d.x
  const yAccessor = d => d.y
  const fillAccessor = d => d.color === 'New paper' ? 'black' : (d.color === 'Other papers' ? 'transparent' : fillScale(d.color))
  const strokeAccessor = d => (d.color === 'Other papers' || d.color === 'New paper') ? 'black' : colorScale(d.color)
  const radiusAccessor = d => nodeRadiusScale(d.size)
  //const opacityAccessor = d => nodeOpacityScale(d.value)
  const opacityAccessor = d => d.opacity
  const accessors = { 
    key: nodeKeyAccessor,
    x: xAccessor,
    y: yAccessor,
    fill: fillAccessor,
    stroke: strokeAccessor,
    size: radiusAccessor,
    opacity: opacityAccessor,
    strokeWidth: 1
  }

  return (
    <div className="Radar">
      <Chart dimensions={dimensions}>
       <g transform={`translate(${dimensions.width/2}, ${dimensions.height/2 + 30})`}>
          <Board
            data={tagCategories}
            keyAccessor={(d, i) => 'board-' + i}
            scale={rScale}
          />
          <Axis
            data={topicCategories} 
            keyAccessor={(d, i) => 'axis-' + i}
            radius={radius + 20}
            innerRadius = {(radius/tagCategories.length)* 0.28}
          />
          {labels.map((label, i) => (
            <>
            <path
              className="Radar__invisible_arc"
              id={"Radar__arc_" + i}
              d={invisibleArc(i, radius, (Math.PI * 2) / (labels.length))}
              strokeOpacity={0}
              fill='none'
            />
            <text 
              className="Radar__arcText"
              key={"Radar__arcText-" + i}
              fontSize='10px'
            >
              <textPath
                startOffset="50%"
                xlinkHref={"#Radar__arc_" + i}
              >
              { label.text }
              </textPath>
            </text>
            </>
          ))}
          <text 
            className="Radar__centerText"
            key={"Radar__centerText"}
            fontSize='14px'
            textAlign='center'
            x={-20}
          >
            ACTORS
          </text>
          <Nodes
            data={radialData} 
            accessors={accessors}
            search={search}
          />
        </g>
      </Chart>
    </div>
  )
}


Radar.propTypes = {

}

Radar.defaultProps = {
  stroke: 'white',
  strokeWidth: '2px',
  strokeOpacity: 0.2,
  fill: 'white',
  textAnchor: 'middle',
  fontSize: '10px',
}

export default Radar