import React, { useEffect, useContext } from "react"
import * as d3 from "d3"

import { MyContext } from "../NetworkPage"
import { PanelContext } from "./contexts/PanelContext"

import * as Consts from "./consts"

const FilterPanel = () => {

  const { current } = useContext(MyContext)
  const { panelState, setPanelState } = useContext(PanelContext)

  //////////////// Control panel logic and set initial setting /////////////
  useEffect(() => {

    let val = panelState.clicked
    
    let graphNodesGroup = d3.select('.Network').select('.nodes')
    let graphLinksGroup = d3.select('.Network').select('.links')

    // find all nodes in selected category except for the root node which can never be changed
    let nodesToRemove = current.nodes.filter(d=>d.node_type==val & d.type!='root')

    let linksToRemove = []
    nodesToRemove.map(d=>{
      // find links connected to any node to be changed
      linksToRemove.push(...current.links.filter(o => o.source.id === d.id || o.target.id === d.id))
      graphNodesGroup.select('#node-' + d.id)
        .attr('fill-opacity', panelState[val] ? Consts.nodeOpacity : 0.2) // change opacity
        .attr('stroke-opacity', panelState[val] ? Consts.nodeOpacity : 0.2)
    })

    linksToRemove.map(d=>{
      graphNodesGroup.select('#path-' + d.source.id.toString() + "-" + d.target.id.toString())
        .attr('stroke-opacity', panelState[val] ? Consts.linkOpacity : 0.1) // change opacity
    })

  }, [panelState.person, panelState.organization])

  const checkActiveBtn = (name) => {
    let activeFilter = Object.keys(panelState).filter(id=>panelState[id])
    return (activeFilter.indexOf(name) != -1) ? "btn active" : "btn";
  }

  return(
    <div className='Chart_color_section'>
      <p>Color nodes by:</p>
      <input name="color_scale" 
             type="button" 
             className={checkActiveBtn('country')}
             onClick={() => {
              setPanelState({'country': true, 'score': false, 'person': panelState.person, 'organization': panelState.organization, 'clicked': 'country'})
             }}
             value="Country"/>
      <input name="color_scale" 
             type="button"
             className={checkActiveBtn('score')} 
             onClick={() => {
              setPanelState({'country': false, 'score': true, 'person': panelState.person, 'organization': panelState.organization, 'clicked': 'score'})
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

export default FilterPanel