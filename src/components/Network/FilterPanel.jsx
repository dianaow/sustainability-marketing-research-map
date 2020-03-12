import React, { useEffect, useContext } from "react"
import * as d3 from "d3"

import { NetworkContext } from "../../NetworkPage"
import { PanelContext } from "../contexts/PanelContext"
import { SceneContext } from "../contexts/SceneContext"

import * as Consts from "../consts"

const FilterPanel = () => {

  const { current } = useContext(NetworkContext)
  const { sceneState } = useContext(SceneContext)
  const { panelState, setPanelState } = useContext(PanelContext)
  const { colorScale, scoreScale } = Consts.scales

  let graphNodesGroup = d3.select('.Network').select('.nodes')
  let graphLinksGroup = d3.select('.Network').select('.links')
  
  //////////////// Control panel logic and set initial setting /////////////
  useEffect(() => {

    let val = panelState.clicked

    let nodesVisible
    let linksVisible
    if(sceneState.id) {
      nodesVisible = current.nodes.filter(o => isConnected(sceneState.id, o.id))
      linksVisible = current.links.filter(o => o.source.id === sceneState.id || o.target.id === sceneState.id)
    } else {
      nodesVisible = current.nodes
      linksVisible = current.links
    }

    // find all nodes in selected category except for the root node which can never be changed
    let nodesToRemove = nodesVisible.filter(d=>d.node_type==val & d.type!='root')

    let linksToRemove = []
    nodesToRemove.map(d=>{
      // find links connected to any node to be changed
      linksToRemove.push(...linksVisible.filter(o => o.source.id === d.id || o.target.id === d.id))
      graphNodesGroup.select('#node-' + d.id)
        .attr('fill-opacity', panelState[val] ? Consts.nodeOpacity : 0.2) // change opacity
        .attr('stroke-opacity', panelState[val] ? Consts.nodeOpacity : 0.2)
    })

    linksToRemove.map(d=>{
      graphLinksGroup.select('#path-' + d.source.id + "-" + d.target.id)
        .attr('opacity', panelState[val] ? 1 : 0.1)
        .attr('marker-mid', o => panelState[val] ? 'url(#arrowheadOpaque)' : 'url(#arrowheadTranparent)')
        
      graphLinksGroup.select('#path-' + d.source.id + "-" + d.target.id)
        .attr('opacity', panelState[val] ? 1 : 0.1)
        .attr('marker-mid', o => panelState[val] ? 'url(#arrowheadOpaque)' : 'url(#arrowheadTranparent)')
    })

  }, [panelState.person, panelState.organization])

  const checkActiveBtn = (name) => {
    let activeFilter = Object.keys(panelState).filter(id=>panelState[id])
    return (activeFilter.indexOf(name) != -1) ? "btn active" : "btn";
  }

  function updateGraphManually(colorAccessor) {

    graphNodesGroup.selectAll("circle")
      .transition().duration(Consts.transitionDuration)
      .attr('stroke', d => colorAccessor(d))
      .attr('fill', d => d.type==='parent' ? 'transparent' : colorAccessor(d))

    graphNodesGroup.selectAll("rect")
      .transition().duration(Consts.transitionDuration)
      .attr('stroke', d => colorAccessor(d))
      .attr('fill', d => d.type==='parent' ? 'transparent' : colorAccessor(d))
    
  }

  return(
    <div className='Chart_color_section'>
      <p>Color nodes by:</p>
      <input name="color_scale" 
             type="button" 
             className={checkActiveBtn('country')}
             onClick={() => {
              setPanelState({'country': true, 'score': false, 'person': panelState.person, 'organization': panelState.organization, 'clicked': 'country'})
              let colorAccessor =  d => colorScale(d.countries)
              updateGraphManually(colorAccessor)
             }}
             value="Country"/>
      <input name="color_scale" 
             type="button"
             className={checkActiveBtn('score')} 
             onClick={() => {
              setPanelState({'country': false, 'score': true, 'person': panelState.person, 'organization': panelState.organization, 'clicked': 'score'})
              let colorAccessor =  d => scoreScale(d.score)
              updateGraphManually(colorAccessor)
             }}
             value="Score"/>
      <p>Only show:</p>
      <input name="entity_filter" 
             type="button" 
             className={checkActiveBtn('person')}
             onClick={() => setPanelState({ 'country': panelState.country, 'score': panelState.score, 'person': !panelState.person, 'organization': panelState.organization, 'clicked': 'person'})}
             value="Person"/>
      <input name="entity_filter" 
             type="button" 
             className={checkActiveBtn('organization')}
             onClick={() => setPanelState({ 'country': panelState.country, 'score': panelState.score, 'person': panelState.person, 'organization': !panelState.organization, 'clicked': 'organization'})}
             value="Organization"/>
    </div>
  )

}

function isConnected(a, b) {
  return Consts.linkedByIndex[`${a},${b}`] || Consts.linkedByIndex[`${b},${a}`] || a === b;
}

export default FilterPanel