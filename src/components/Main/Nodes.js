import React, { useEffect, useContext, useState } from "react"
import PropTypes from "prop-types"
import * as d3 from "d3"

import { accessorPropsType, callAccessor, onlyUnique } from "../utils";
import Tooltip, { TooltipContext } from "./Tooltip";

const Nodes = ({data, dataAll, accessors, search}) => {

  const tooltip = useContext(TooltipContext)
  const [clicked, setClicked] = useState(false)
  
  const updateCircles = (data, accessors, clicked) => {
    console.log('update circles')
    let { x, y, key, size, fill, stroke, strokeWidth } = accessors

    let circles = d3.select(".Nodes").selectAll("circle").data(data, d=>d.entity);

    if(search.results.length === 0){

      circles.exit().remove()
  
      let circlesEnter = circles.enter().append('circle')
        .attr('class', (d, i) => callAccessor(key, d, i))
        .attr('cx', (d, i) => callAccessor(x, d, i))
        .attr('cy', (d, i) => callAccessor(y, d, i))
        .attr('r', (d, i) => callAccessor(size, d, i))
        .attr('fill', (d,i) => callAccessor(fill, d, i))
        .attr('stroke', (d,i) => callAccessor(stroke, d, i))
        .attr('opacity', 1)
        .attr('strokeWidth', strokeWidth)
        .style('cursor', 'pointer')
        .attr('pointer-events', 'visible')
  
      circles = circles.merge(circlesEnter)
    }

    circles
      .on("click", d => {
        mouseOver(d, clicked, search)
        setClicked(!clicked)
      })
      .on("mouseover", d => mouseOver(d, clicked, search))
      .on("mouseout", d => mouseOut(d, clicked, search))

  }

  const mouseOver = (e, clicked, search) => {
    if(clicked || search.results.length > 0) return
    d3.select(".Nodes").selectAll('circle').attr('opacity', 0.1)
    d3.select(".Nodes").selectAll(".entity-" + e.entity).attr('opacity', 1)
    tooltip.setTooltip({
      show:true,
      info: {unit: e.unit, topic: e.topic, category: e.category, value: e.value, count: e.count, entity: e.entity},
      details: dataAll.filter(d=>d.entity === e.entity) 
    })
  }
 
  const mouseOut = (e, clicked) => {
    if(clicked || search.results.length > 0) return
    d3.select(".Nodes").selectAll('circle').attr('opacity', 1)
    tooltip.setTooltip({
      show: false,
      info: {},
      details: []
    })
  }

  useEffect(() => {
    if(search.isLoading===false & search.isOpen===false && search.results){ // prevents chart from re-rendering each time search value changes and after search
      if(data.length > 0) updateCircles(data, accessors, clicked, search)
    }
  }, [data, clicked, search])

  useEffect(() => {
    if(search.isLoading===false & search.isOpen===false && search.results && search.results.length > 0){ // prevents chart from re-rendering each time search value changes. only runs after one search result is chosen
      const filtered = dataAll.filter(d => d.unitID === search.value).map(d => d.entity).filter(onlyUnique)
      d3.select(".Nodes").selectAll('circle').attr('opacity', 0.1)
      filtered.map(d => {
        d3.select(".Nodes").selectAll(".entity-" + d).attr('opacity', 1)
      })
    }
    if(search.results && search.results.length === 0){
      d3.select(".Nodes").selectAll('circle').attr('opacity', 1)
    }
  }, [search])

  return(
    <g className="Radar__Elements">
      <g className="Nodes"></g>
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