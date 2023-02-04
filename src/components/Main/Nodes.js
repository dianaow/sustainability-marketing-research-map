import React, { useEffect, useContext } from "react"
import PropTypes from "prop-types"
import * as d3 from "d3"

import { accessorPropsType, callAccessor } from "../utils";
import Tooltip, { TooltipContext } from "./Tooltip";

const Nodes = ({data, accessors}) => {

  const tooltip = useContext(TooltipContext)

  const updateSingle = () => {

    var selectedData = data.filter(d=> d.entity === tooltip.info.entity) 
    var nonselectedData = data.filter(d=> d.entity !== tooltip.info.entity) 
    accessors.opacity = 1
    drawAllNodes(selectedData, accessors, 'entity__selected')
    
    if(tooltip.show){
      accessors.opacity = 0.1
      drawAllNodes(nonselectedData, accessors, 'entity__nonselected')
    } else { 
      accessors.opacity = 1
      drawAllNodes(nonselectedData, accessors, 'entity__nonselected')
    }

  }

  const drawAllNodes = (data, accessors, eleSelector) => {

    updateCircles(data, accessors, 'Nodes', 'Circle__'+eleSelector)

  }

  const updateCircles = (data, accessors, eleWrapper, eleSelector) => {

    let { x, y, size, opacity, fill, stroke, strokeWidth } = accessors

    let circles = d3.select("." + eleWrapper).selectAll("." + eleSelector).data(data, d=>d.entity);

    circles.exit().remove()

    let circlesEnter = circles.enter().append('circle')
      .attr('class', eleSelector)
      .attr('cx', (d, i) => callAccessor(x, d, i))
      .attr('cy', (d, i) => callAccessor(y, d, i))
      .attr('r', (d, i) => callAccessor(size, d, i))
      .attr('opacity', (d, i) => callAccessor(opacity, d, i))
      .attr('fill', (d,i) => eleWrapper === 'NodesMask' ? 'transparent' : callAccessor(fill, d, i))
      .attr('stroke', (d,i) => eleWrapper === 'NodesMask' ? 'transparent' : callAccessor(stroke, d, i))
      .attr('strokeWidth', strokeWidth)

    circles = circles.merge(circlesEnter)

    circles.transition().duration(500)
      .attr('opacity', (d, i) => callAccessor(opacity, d, i))
      .style('cursor', 'pointer')
      .attr('pointer-events', 'visible')

    circles
      .on("mouseover", d => mouseOver(d))
      .on("mouseout", d => mouseOut(d))

  }

  const mouseOver = (e) => {
    console.log(e)
    tooltip.setTooltip({
      show:true,
      info: {unit: e.unit, topic: e.topic, category: e.category, value: e.value, count: e.count},
      links: [],
      details: data.filter(d=>d.entity === e.entity) 
    })
  }
 
  const mouseOut = (e) => {
    tooltip.setTooltip({
      show: false,
      info: {},
      links: [],
      details: {}
    })
  }

  useEffect(() => {
    updateSingle()
  }, [data])

  return(
    <g className="Radar__Elements">
      <g className="Nodes"></g>
      <g className="NodesMask"></g>
      <g className="Nodes__Binned"></g>
      <Tooltip/>
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