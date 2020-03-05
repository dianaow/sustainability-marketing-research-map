import React from "react"
import * as d3 from "d3"

import Chart from "./Chart"
import Board from "./Board"
import Axis from "./RadarAxis"
import Nodes from "./Nodes"

import { callAccessor, useChartDimensions }  from "./utils"
import { categories, colorScale, fillScale, bufferInRad, angleSlice, LEVELS, UPPER, LOWER } from "./consts"

const STEPS = UPPER / LEVELS
const range = d3.range(0, STEPS*LEVELS, STEPS).concat(STEPS*LEVELS)

const arc = (axis) => {

  var arc = d3.arc()
      .innerRadius(window.innerWidth*0.22)
      .outerRadius(window.innerWidth*0.22)
      .startAngle(angleSlice*axis + bufferInRad)
      .endAngle(angleSlice*(axis+1))

  return arc()

}

const getCoordsAlongArc = (data, rScale, config) => {

  var angle = angleSlice * data.axis
  var angleScale = d3.scaleLinear()
      .range([angle-angleSlice + bufferInRad, angle])
      .domain([config.lowerLimit, config.upperLimit])

  var line = d3.lineRadial()
    .radius(function(d,i) { return callAccessor(rScale, d.value, i) })
    .angle(function(d,i) { return angleScale(d.overall) })

  return line([data]).slice(1).slice(0, -1).split(',')

}

const getPolarScatterCoords = (data, rScale, config) => {

  const bandScale = d3.scaleThreshold()
    .domain(range)
    .range(range)

  data.forEach((a,i)=>{
    let val = bandScale(a.value)
    var rScaleNew = d3.scaleLinear()
      .range([rScale(UPPER-val+STEPS), rScale(UPPER-val)])
      .domain([val-STEPS, val])

    var coors = getCoordsAlongArc(a, rScaleNew, config)

    a.x = +coors[0]
    a.y = +coors[1]
  })

  return data

}

// Calculate the coordinates of each node
const getNewCoords = (data, version, direction, rScale, config) => {

  var bin
  if(version === '1') {
    bin = d3.histogram().value(d=>d.value)
  } else if(version === '2') {
    bin = d3.histogram().value(d=>d.value).domain([0.7, 1])
  }
  
  const binsAll = []
  const dataCoord = []
  data.map(a=>{
    a.values.map(b=>{
      b.values.map(c=>{

        let buckets = bin(c.values)

        var valueOrig, valueNew
        buckets.forEach((d,i)=>{
          let avg = d3.mean(d, f=>f.value)
          d.map(e=>{
            if(direction === '0'){
              valueOrig = avg
              valueNew = avg
            } else if(direction === '1'){
              valueOrig = e.value
              valueNew = avg
            } else if(direction === '2'){
              valueOrig = avg 
              valueNew = e.value            
            }
            let coordsOrig = getPolarScatterCoords([{value: valueOrig, overall: e.overall, axis: e.axis}], rScale, config)
            let coordsNew = getPolarScatterCoords([{value:  valueNew, overall: e.overall, axis: e.axis}], rScale, config)
            dataCoord.push({
              entity: e.entity,
              x0: coordsOrig[0].x,
              y0: coordsOrig[0].y,
              x1: coordsNew[0].x,
              y1: coordsNew[0].y,
              category: e.category,
              country: e.country,
              photo: e.photo,
              club: e.club, 
              name: e.name,
              overall: +b.key
            })
          })
          d.axis = a.key
          d.overall = b.key
          d.category = c.key
          d.value = avg
          d.count = d.length 
        })

        buckets.forEach((d,i)=>{
          if(d.count > 0){
            binsAll.push(d)
          }
        })
        
      })
    })
  })

  // Calculate the coordinates of each bin
  const binsCoord = getPolarScatterCoords(binsAll, rScale, config)

  return { bins: binsCoord, data: dataCoord }

}

const Radar = ({ data, config, ...props }) => {

  const dimensions = {'width': window.innerWidth*0.9, 'height': window.innerHeight*0.9}
  const radius = Math.min(dimensions.width/2, dimensions.height/2) - 30
  //const [ref, dms] = useChartDimensions({'width': window.innerWidth*0.9, 'height': window.innerHeight*0.9})
  //const radius = Math.min(dms.boundedWidth/2, dms.boundedHeight/2) - 30
  const DEFAULT_PIE = 0

  const rScale = d3.scalePow()
    .exponent(0.5)
    .range([radius, 0])
    .domain([LOWER, UPPER])

  // Standardize the scale amongst all versions and overall scores
  const binRadiusScale = d3.scaleSqrt()
    .range([3, 30])
    .domain([1, 60])

  // Calculate the placement of each axis arc label
  var axisData = [{overall: config.lowerLimit, axis: 1},{overall: config.upperLimit, axis: 1}]
  var labels = []
  axisData.forEach((a,i)=>{
    let coors = getCoordsAlongArc(a, rScale(DEFAULT_PIE)+10, config)
    labels.push({text: a.overall, x: +coors[0], y: +coors[1]})
  })

  // Bin nodes
  const dataMaxNested = d3.nest()
    .key(d=>d.axis)
    .key(d=>d.overall)
    .key(d=>d.category)
    .entries(data.playersMax)

  const data10 = getNewCoords(dataMaxNested, "1", "0", rScale, config)
  const data11 = getNewCoords(dataMaxNested, "1", "1", rScale, config) 
  const data12 = getNewCoords(dataMaxNested, "1", "2", rScale, config) 

  const rAccessor = d => rScale(d) 
  const binSizeAccessor = d => binRadiusScale(d.count)
  const nodeKeyAccessor = d => "entity-" + d.entity
  const binXAccessor = d => d.x
  const binYAccessor = d => d.y
  const x0Accessor = d => d.x0
  const y0Accessor = d => d.y0
  const x1Accessor = d => d.x1
  const y1Accessor = d => d.y1
  const fillAccessor = d => fillScale(d.category)
  const strokeAccessor = d => colorScale(d.category)

  const drawNodes = (data, dataAll, bins, direction) => {

    let accessors = { 
      key: nodeKeyAccessor,
      x: binXAccessor,
      y: binYAccessor,
      x0: x0Accessor,
      y0: y0Accessor,
      x1: x1Accessor,
      y1: y1Accessor,
      size: binSizeAccessor,
      fill: fillAccessor,
      stroke: strokeAccessor,
      strokeWidth: 1
    }

    const nodes = 
      <Nodes
        data={data} 
        dataAll={dataAll} 
        binnedData={bins}
        accessors={accessors}
        direction={direction}
      />

    return nodes

  }

  var NodesVersion
  if(config.toBin){
    if(config.initRender){
      NodesVersion = drawNodes(data10.data, data.players, data10.bins, "0")
    } else {
      NodesVersion = drawNodes(data11.data, data.players, data11.bins, "1")
    }
  } else {
    NodesVersion = drawNodes(data12.data, data.players, data12.bins, "2")
  }

  return (
    <div className="Radar" style={{'width': window.innerWidth*0.9, 'height': window.innerHeight*0.9}}>
      <Chart dimensions={dimensions}>
       <g transform={`translate(${dimensions.width/2}, ${dimensions.height/2})`}>
          <Board
            data={range}
            keyAccessor={(d, i) => 'board-' + i}
            rAccessor={rAccessor}
          />
          <Axis
            data={categories} 
            keyAccessor={(d, i) => 'axis-' + i}
            scale={rScale}
          />
          <path {...props}
            className="Radar__arc"
            d={arc(DEFAULT_PIE)}
          />
          {labels.map((label, i) => (
            <text {...props}
              className="Radar__arcText"
              key={"Radar__arcText-" + i}
              x={label.x}
              y={label.y}
            >
              { label.text }
            </text> 
          ))}
          {NodesVersion}
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
  fontSize: '11px',
}

export default Radar