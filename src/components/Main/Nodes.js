import React, { useEffect, useRef, useContext } from "react"
import PropTypes from "prop-types"
import * as d3 from "d3"

import { accessorPropsType, callAccessor } from "../utils";
import { NODE_SIZE } from "../consts"
import Tooltip, { TooltipContext } from "./Tooltip";
import Network from "./Network";

const Nodes = ({data, dataAll, binnedData, accessors, direction}) => {

  const tooltip = useContext(TooltipContext)

  if(tooltip.info.name !== '' & tooltip.links.length === 0){
    tooltip.links = findConnections(data, tooltip.info.entity)
    tooltip.setTooltip(tooltip)
  }

  const updateSingle = (prevDirection) => {

    var nonselectedData = data.filter(d=>(d.category !== tooltip.info.category))
    var connectedPeople = tooltip.links.map(d=>d.targetName)
    var selectedData = data.filter(d=>connectedPeople.indexOf(d.name) !== -1) 
    selectedData.forEach((d,i)=>{
      d.x0 = d.x1
      d.y0 = d.y1
    })
    accessors.size = NODE_SIZE*4
    accessors.opacity = 0.8
    drawAllNodes(selectedData, accessors, 'entity__selected')
    
    let opacity
    if(direction === '0'){ // initial render
      opacity = [0, 0]
    } else if(direction === '2'){ // single entity view (only time where tooltips are shown)
      opacity = [0.5, 0]
    } else if(direction === '1'){ // binned entities view
      opacity = [0, 0.5]
    }

    if(tooltip.show){
      accessors.size = NODE_SIZE
      accessors.opacity = [0.1, 0.1]
      drawAllNodes(nonselectedData, accessors, 'entity__nonselected')
    } else { 
      if(prevDirection === direction){
        nonselectedData.forEach((d,i)=>{
          d.x0 = d.x1
          d.y0 = d.y1
        })   
      }
      accessors.size = NODE_SIZE
      accessors.opacity = opacity
      drawAllNodes(nonselectedData, accessors, 'entity__nonselected')
    }

  }

  const updateBin = (prevDirection) => {

    let size, opacity
    if(direction === '0'){
      size = [0, accessors.size]
      opacity = [0, 0.5]
    } else if(direction === '2'){
      size = [accessors.size, 0]
      opacity = [0.5, 0]
    } else if(direction === '1'){
      size = [0, accessors.size]
      opacity = [0, 0.5]
    }

    if(prevDirection !== direction | direction !== '2'){
      accessors.size = size
      accessors.opacity = opacity
      drawAllNodes(binnedData, accessors, 'binned_entities')
    } 
    
  }

  const drawAllNodes = (data, accessors, eleSelector) => {

    const others = data.filter(d=>d.category !== 'East Asia & Pacific' & d.category !== 'Sub-Saharan Africa')
    const africa = data.filter(d=>d.category === 'Sub-Saharan Africa')
    const asia = data.filter(d=>d.category === 'East Asia & Pacific')

    if(eleSelector === 'binned_entities'){

      updateCirclesBin(others, accessors, 'Nodes__Binned', 'Circle__'+eleSelector+'_others')
      updateCirclesBin(africa, accessors, 'Nodes__Binned', 'Circle__'+eleSelector+'_africa') 
      updateRectsBin(asia, accessors, 'Nodes__Binned', 'Rect__'+eleSelector+'_asia')

    } else {

      updateCircles(others, accessors, 'Nodes', 'Circle__'+eleSelector+'_others')
      updateCircles(africa, accessors, 'Nodes', 'Circle__'+eleSelector+'_africa')
      updateRects(asia, accessors, 'Nodes', 'Rect__'+eleSelector+'_asia')

      updateCircles(others, accessors, 'NodesMask', 'Circle__'+eleSelector+'_others')
      updateCircles(africa, accessors, 'NodesMask', 'Circle__'+eleSelector+'_africa')
      updateRects(asia, accessors, 'NodesMask', 'Rect__'+eleSelector+'_asia')

    }

  }

  const updateCircles = (data, accessors, eleWrapper, eleSelector) => {

    let { x0, y0, x1, y1, size, opacity, fill, stroke, strokeWidth } = accessors

    let circles = d3.select("." + eleWrapper).selectAll("." + eleSelector).data(data, d=>d.entity);

    circles.exit().remove()

    let circlesEnter = circles.enter().append('circle')
      .attr('class', eleSelector)
      .attr('cx', (d, i) => callAccessor(x0, d, i))
      .attr('cy', (d, i) => callAccessor(y0, d, i))
      .attr('r', (d, i) => callAccessor(size, d, i))
      .attr('opacity', (d, i) => callAccessor(opacity[0], d, i))
      .attr('fill', (d,i) => eleWrapper === 'NodesMask' ? 'transparent' : callAccessor(fill, d, i))
      .attr('stroke', (d,i) => eleWrapper === 'NodesMask' ? 'transparent' : callAccessor(stroke, d, i))
      .attr('strokeWidth', strokeWidth)
      .style('cursor', direction === "2" ? 'pointer': 'none')
      .attr('pointer-events', direction === "2" ? 'visible': 'none')

    circles = circles.merge(circlesEnter)

    circles.transition().duration(1000)
      .attr('cx', (d, i) => callAccessor(x1, d, i))
      .attr('cy', (d, i) => callAccessor(y1, d, i))
      .attr('r', (d, i) => callAccessor(size, d, i))
      .attr('opacity', (d, i) => callAccessor(opacity[0], d, i))
      .style('cursor', direction === "2" ? 'pointer': 'none')
      .attr('pointer-events', direction === "2" ? 'visible': 'none')

    circles
      .on("mouseover", d => direction === "2" ? mouseOver(d) : ()=>{} )
      .on("mouseout", d => direction === "2" ? mouseOut(d) : ()=>{} )

  }

  const updateRects = (data, accessors, eleWrapper, eleSelector) => {

    let { x0, y0, x1, y1, size, opacity, fill, stroke, strokeWidth } = accessors
    const width = size
    const height = size

    const WIDTH = (width, d, i) => typeof width === "function" ? width(d,i) : width*2
    const HEIGHT = (height, d, i) => typeof height === "function" ? height(d,i) : height*2

    let rects = d3.select("." + eleWrapper).selectAll("." + eleSelector).data(data, d=>d.entity);

    rects.exit().remove()

    let rectsEnter = rects.enter().append('rect')
      .attr('class', eleSelector)
      .attr('x', (d, i) => callAccessor(x0, d, i) - WIDTH(width, d, i)/2 )
      .attr('y', (d, i) => callAccessor(y0, d, i) - HEIGHT(height, d, i)/2)
      .attr('width', (d, i) => WIDTH(width, d, i))
      .attr('height', (d, i) => HEIGHT(height, d, i))
      .attr('opacity', (d, i) => callAccessor(opacity[0], d, i))
      .attr('fill', (d,i) => eleWrapper === 'NodesMask' ? 'transparent' : callAccessor(fill, d, i))
      .attr('stroke', (d,i) => eleWrapper === 'NodesMask' ? 'transparent' : callAccessor(stroke, d, i))
      .attr('strokeWidth', strokeWidth)
      .style('cursor', direction === "2" ? 'pointer': 'none')
      .attr('pointer-events', direction === "2" ? 'visible': 'none')
      
    rects = rects.merge(rectsEnter)

    rects.transition().duration(1000)
      .attr('x', (d, i) => callAccessor(x1, d, i) - WIDTH(width, d, i)/2)
      .attr('y', (d, i) => callAccessor(y1, d, i) - HEIGHT(height, d, i)/2)
      .attr('width', (d, i) => WIDTH(width, d, i))
      .attr('height', (d, i) => HEIGHT(height, d, i))
      .attr('opacity', (d, i) => callAccessor(opacity[0], d, i))
      .style('cursor', direction === "2" ? 'pointer': 'none')
      .attr('pointer-events', direction === "2" ? 'visible': 'none')

    rects
      .on("mouseover", d => direction === "2" ? mouseOver(d) : ()=>{} )
      .on("mouseout", d => direction === "2" ? mouseOut(d) : ()=>{} )

  }

  const mouseOver = (e) => {
    tooltip.setTooltip({
      show:true,
      info: {entity: e.entity, name: e.name, club: e.club, category: e.category, score: e.overall, photo: e.photo},
      links: findConnections(data, e.entity),
      details: dataAll.filter(d=>d.name === e.name) 
    })
  }
 
  const mouseOut = (e) => {
    tooltip.setTooltip({
      show: false,
      info: {entity: 0, name: "", club: "", category: "", score: "", photo: ""},
      links: [],
      details: {}
    })
  }

  const prevDirection = usePrevious(direction)

  useEffect(() => {
    updateBin(prevDirection)
  }, [])

  useEffect(() => {
    if(direction !== "0"){
      updateBin(prevDirection)
      updateSingle(prevDirection)
    }
  }, [data, dataAll, binnedData])

  useEffect(() => {
    if(tooltip.show){
      //updateSingle(prevDirection)
    }
  }, [tooltip])

  return(
    <g className="Radar__Elements">
      <g className="Nodes"></g>
      <g className="NodesMask"></g>
      <g className="Nodes__Binned"></g>
      <Tooltip/>
      <Network/> 
    </g>
  )

}


Nodes.propTypes = {
  data: PropTypes.array,
  keyAccessor: accessorPropsType,
  xAccessor: accessorPropsType,
  yAccessor: accessorPropsType,
  rAccessor: accessorPropsType,
  widthAccessor: accessorPropsType,
  heightAccessor: accessorPropsType,
  fillAccessor: accessorPropsType,
  strokeAccessor: accessorPropsType,
  opacityAccessor: accessorPropsType,
  strokeWidth: PropTypes.number,
  pointerEvents: PropTypes.string
}

Nodes.defaultProps = {

}

export default Nodes

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

function updateCirclesBin(data, accessors, eleWrapper, eleSelector) {

  let { x, y, size, opacity, fill, stroke, strokeWidth } = accessors

  let circles = d3.select("." + eleWrapper).selectAll("." + eleSelector).data(data, d=>d.category+d.overall+d.axis);

  circles.exit().remove()

  let circlesEnter = circles.enter().append('circle')
    .attr('class', eleSelector)
    .attr('cx', (d, i) => callAccessor(x, d, i))
    .attr('cy', (d, i) => callAccessor(y, d, i))
    .attr('r', (d, i) => callAccessor(size[0], d, i))
    .attr('opacity', (d, i) => callAccessor(opacity[0], d, i))
    .attr('fill', (d,i ) => callAccessor(fill, d, i))
    .attr('stroke', (d,i) => fill === 'transparent' ? fill : callAccessor(stroke, d, i))
    .attr('strokeWidth', strokeWidth)
    .style('cursor', 'none')
    .attr('pointer-events', "none")

  circles = circles.merge(circlesEnter)

  circles.transition().duration(1200)
    .attr('cx', (d, i) => callAccessor(x, d, i))
    .attr('cy', (d, i) => callAccessor(y, d, i))
    .attr('r', function(d, i) { 
      return callAccessor(size[1], d, i) })
    .attr('opacity', (d, i) => callAccessor(opacity[1], d, i))

}

function updateRectsBin(data, accessors, eleWrapper, eleSelector) {

  let { x, y, size, opacity, fill, stroke, strokeWidth } = accessors
  const width = size
  const height = size

  const WIDTH0 = (width, d, i) => typeof width[0] === "function" ? width[0](d,i) : width[0]*2
  const HEIGHT0 = (height, d, i) => typeof height[0] === "function" ? height[0](d,i) : height[0]*2
  const WIDTH1 = (width, d, i) => typeof width[1] === "function" ? width[1](d,i) : width[1]*2
  const HEIGHT1 = (height, d, i) => typeof height[1] === "function" ? height[1](d,i) : height[1]*2

  let rects = d3.select("." + eleWrapper).selectAll("." + eleSelector).data(data, d=>d.entity);

  rects.exit().remove()

  let rectsEnter = rects.enter().append('rect')
    .attr('class', eleSelector)
    .attr('x', (d, i) => x(d, i) - WIDTH0(width, d, i))
    .attr('y', (d, i) => y(d, i) - HEIGHT0(height, d, i))
    .attr('width', (d, i) => WIDTH0(width, d, i) * 2)
    .attr('height', (d, i) => HEIGHT0(height, d, i) * 2)
    .attr('opacity', (d, i) => callAccessor(opacity[0], d, i))
    .attr('fill', (d,i ) => callAccessor(fill, d, i))
    .attr('stroke', (d,i) => fill === 'transparent' ? fill : callAccessor(stroke, d, i))
    .attr('strokeWidth', strokeWidth)

  rects = rects.merge(rectsEnter)

  rects.transition().duration(1200)
    .attr('x', (d, i) => x(d, i) - WIDTH1(width, d, i))
    .attr('y', (d, i) => y(d, i) - HEIGHT1(height, d, i))
    .attr('width', function(d, i) { return WIDTH1(width, d, i) * 2})
    .attr('height', (d, i) => HEIGHT1(height, d, i) * 2)
    .attr('opacity', (d, i) => callAccessor(opacity[1], d, i))

}

function findConnections(data, id) {

  // Nest data by club
  var dataConn = d3.nest()
    .key(function(d) { return d.club })
    .entries(data)

  var links = []
  var player = data.find(a=>a.entity === id)
  var club = dataConn.find(d=>d.key === player.club).values

  club.map(d=>{
    links.push({
      sourceId: id,
      targetId: d.entity,
      source: [player.x0, player.y0],
      target: [d.x0, d.y0],
      targetName: d.name,
      photo: d.photo,
      overall_score: d.overall,
      country: d.country
    })
  })

  links.sort(function(a, b){ return b.overall_score - a.overall_score })

  return links

}