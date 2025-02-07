import React from "react"
import * as d3 from "d3"

import Chart from "../Shared/Chart"
import Board from "./Board"
import Axis from "./RadarAxis"
import Nodes from "./Nodes"

import { callAccessor, onlyUnique }  from "../utils"
import { invisibleArc, colorScale, fillScale, tagCategories, topicCategories, scoreCategories, values, nodeRadiusScale, angleSlice, bufferInRad } from "../consts"

const getCoordsAlongArc = (data, rScale, label) => {

  const angle = angleSlice * (topicCategories.indexOf(data.topic))

  const angleScale = d3.scaleLinear()
    .range([angle + bufferInRad , angle+angleSlice - bufferInRad])
    .domain(data.topic === topicCategories.slice(-1) ? [5, 1] : [1, 5])

  const line = d3.lineRadial()
    .radius(function(d,i) { 
      const index = tagCategories.indexOf(d.category)
      const start = rScale.range()[index - 1] || 0
      return label ? 
      callAccessor(rScale, d.category, i) + 8 : 
      ((callAccessor(rScale, d.category, i) - (callAccessor(rScale, d.category, i) - start)/2 ) + ((index === 2 || index == 1) ? -50 : 40))
    })
    .angle(function(d,i) { return angleScale(+d.value) })

  return line([data]).slice(1).slice(0, -1).split(',')

}

const getPolarScatterCoords = (data, rScale) => {

  data.forEach(a => {
    const coors = getCoordsAlongArc(a, rScale)
    a.x = +coors[0]
    a.y = +coors[1]
    a.size = nodeRadiusScale(a.count)
    a.radius = rScale(a.category)
  })

  const simulation = d3
    .forceSimulation()
    .nodes(data)
    .force('charge', d3.forceManyBody().strength(-35))
    .force('x', d3.forceX().x(d => d.x).strength(0.9))
    .force('y', d3.forceY().y(d => d.y).strength(0.9))
    .force(
      'collision',
      d3.forceCollide().radius((d) => d.size * 0.4)
    )
    .force("r", d3.forceRadial(d => d.radius, 0, 0).strength(0.3))
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
const Radar = ({ data, search, journals, ...props }) => {

  fillScale.domain(journals)
  colorScale.domain(journals)

  const dimensions = {'width': window.innerWidth, 'height': window.innerHeight}
  const radius = Math.min(dimensions.width/2, dimensions.height/2) - 70

  const customBands = [
    { category: tagCategories[0], start: 0, end: radius * 0.6 },
    { category: tagCategories[1], start: radius * 0.6, end: radius * 0.75}, 
    { category: tagCategories[2], start: radius * 0.75, end: radius },
  ];
  
  // Create a custom scale mapping categories to their respective radii
  const rScale = d3.scaleOrdinal()
    .domain(tagCategories)
    .range(customBands.map((band) => band.end));

  // Calculate the placement of each axis arc label
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
  const fillAccessor = d => d.color === 'New paper' ? 'black' :fillScale(d.color)
  //const strokeAccessor = d => (d.color === 'Other journals' || d.color === 'New paper') ? 'black' : colorScale(d.color)
  const strokeAccessor = d => 'none'
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
       <g transform={`translate(${dimensions.width/2}, ${dimensions.height/2})`}>
          <Board
            data={tagCategories}
            keyAccessor={(d, i) => 'board-' + i}
            scale={rScale}
            range
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
              fontSize='11px'
              textAnchor="middle"
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
  fontSize: '12px',
}

export default Radar