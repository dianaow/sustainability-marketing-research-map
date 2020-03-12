import React, { useContext } from "react"
import * as d3 from "d3"
import { Icon } from 'semantic-ui-react'

import { initialTooltipState, TooltipContext } from "../contexts/TooltipContext"
import { ZoomContext } from "../contexts/ZoomContext"
import { initialSceneState, SceneContext } from "../contexts/SceneContext"

import * as Consts from "../consts"

const ZoomPanel = () => {

  const { setTooltip } = useContext(TooltipContext)
  const { zoom, zoomState, setZoomState } = useContext(ZoomContext)
  const { setScene } = useContext(SceneContext)
  const svg = d3.selectAll('.networkWrapper')

  let graphNodesGroup = d3.select('.Network').select('.nodes')
  let graphLinksGroup = d3.select('.Network').select('.links')

  return(
    <div className='Chart_controls_section'>
      <div className="button zoom_in" onClick={ ()=> {
        setZoomState({ x:zoomState.x, y:zoomState.y, k:zoomState.k*1.2 })
        zoom.scaleBy(svg.transition().duration(750), 1.2);
       } }><Icon name='tiny plus' /></div>
      <div className="button zoom_out" onClick={ ()=> {
        setZoomState({ x:zoomState.x, y:zoomState.y, k:zoomState.k*0.8 })
        zoom.scaleBy(svg.transition().duration(750), 0.8);
      } }><Icon name='tiny minus' /></div>
      <div className="button reset" onClick={ ()=> {

        setTooltip(initialTooltipState)
        setScene(initialSceneState)

        d3.selectAll('.root-label circle')
          .transition().duration(350).delay(350)
          .attr('r', Consts.rootRadius)
      
        d3.selectAll('.root-label text')
          .transition().duration(350).delay(350)
          .attr("font-size", `${Consts.nodeTextSize*2}px`)
          .attr('x', 0)
          .attr('y', -Consts.rootRadius-10)

        d3.selectAll('.root-label-score')
          .transition().duration(350).delay(350)
          .attr("font-size", `${Consts.nodeTextSize*3}px`)
          .attr('y', 0)

        graphNodesGroup.selectAll('.node')
          .attr('stroke-opacity', Consts.nodeOpacity)
          .attr('fill-opacity', Consts.nodeOpacity)
          .style('pointer-events', 'auto')

        graphNodesGroup.selectAll('.root-label text').attr('opacity', 1)
        graphNodesGroup.selectAll('.parent-node-label').attr('opacity', Consts.nodeTextOpacity)
        graphNodesGroup.selectAll('.children-node-label').attr('opacity', Consts.nodeTextOpacity)

        graphLinksGroup.selectAll('.link').attr('opacity', Consts.linkOpacity)
        graphLinksGroup.selectAll('.edge-label').attr('opacity', Consts.linkTextOpacity)

        svg.transition().duration(350).delay(150).call(zoom.transform, d3.zoomIdentity)
      } }><Icon name='tiny redo' /></div>
    </div>
  )

}

export default ZoomPanel