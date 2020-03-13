import React, { useContext, useState, useEffect } from "react"
import cx from 'classnames';

import { NetworkContext } from "../../NetworkPage"
import { initialTooltipState, TooltipContext } from "../contexts/TooltipContext"
import { SceneContext } from "../contexts/SceneContext"

import { round }  from "../utils"

import "./card.css"
import './tooltip.scss';

const TooltipEvent = (data, selected_entity, page_entity) => {

  return( 
    <div className='Tooltip'>
      <div style={{border:0, textAlign:'center', fontWeight: 900, padding: '4px'}}>{`Events of ${selected_entity}`}</div>
      <div style={{border:0, textAlign:'center', padding: '0px'}}>{`associated with ${page_entity}`}</div>
      <div className="table-row-header">
        <div className="cell cell-20">
          <div className="value">TYPE</div>
        </div>
        <div className="cell cell-60">
          <div className="value">DESCRIPTION</div>
        </div>
        <div className="cell cell-15">
          <div className="value">DATE</div>
        </div>
      </div>
      <div className='table-row-contents'>
        {data.map((d,i)=>(
          <div className="row">
            <div className="cell cell-20">
              <div className="value">{d.type}</div>
            </div>
            <div className="cell cell-60">
              <div className="value">{d.description}</div>
            </div>
            <div className="cell cell-15">
              <div className="value">{d.date}</div>
            </div>
          </div>  
        ))}
      </div>
    </div>   
  )

}

const TooltipEntity = (d) => {

  return(
    <div className='Tooltip'>
      <div className="name">{d.name}</div>
      <div className='tooltipContent_grid'>
        <div className="cell cell-50">
          <div className="title">Entity ID</div>
          <div className="value">{d.id}</div>
        </div>
        <div className="cell cell-50">
          <div className="title">Overall Score</div>
          <div className="value">{round(d.score)}</div>
        </div>
        <div className="cell cell-50">
          <div className="title">Country</div>
          <div className="value">{d.countries}</div>
        </div>
        <div className="cell cell-50">
          <div className="title">Relationship Type</div>
          <div className="value">Shareholder Of</div>
        </div>
      </div>
    </div>   
  )

}

const Tooltip = () => {

  const { current } = useContext(NetworkContext)
  const { sceneState } = useContext(SceneContext)
  const { tooltipState, setTooltip } = useContext(TooltipContext)
  const { x, y, position, show, content } = tooltipState
  const radius = content.radius ? content.radius : 0
  const events = content.events ? content.events : []

  let xNew, yNew, width, height
  if(sceneState.scene === 0){
    width = 250
    height = 150
    if(position==='left'){
      xNew = x-width-10-radius
    } else {
      xNew = x+10+radius 
    }
    yNew = y-height/2  
  } else {
    width = 500
    height = 240
    xNew = x-width
    yNew = y-height/2-20
  }

  return (
    <g
      transform={`translate(${xNew}, ${yNew})`}
      style={{ visibility: show ? 'visible' : 'hidden' }}
    >
      <foreignObject width={width} height={height} className='tooltipFO'>
        <div className={cx('tooltipContent', position)}>
            { (sceneState.scene !== 0) ? <span className="close" onClick={()=>setTooltip(initialTooltipState)}>X</span> : <span className="arrow"></span> }
            { (sceneState.scene !== 0 ) ? TooltipEvent(events, content.name, current.name) : TooltipEntity(content) }
        </div>
      </foreignObject>
    </g>
  )
}


export default Tooltip;
