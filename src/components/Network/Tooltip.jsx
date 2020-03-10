import React, { useContext } from "react"
import cx from 'classnames';

import { TooltipContext } from "../contexts/TooltipContext"

import { round }  from "../utils"

import "./card.css"
import './tooltip.scss';

const eventData = [
  {'entity':82007088, 'type': 'Has Bank Account', 'description': 'XXX-XXX-XXX', 'date': '03/04/09'},
  {'entity':82007088, 'type': 'Bank Account Transaction', 'description': 'Has Received: $10000', 'date': '26/03/09'},
  {'entity':82007088, 'type': 'Has Registered Address', 'description': 'Paris, France', 'date': '07/01/04'},
  {'entity':2019, 'type': 'Has Bank Account', 'description': 'XXX-XXX-XXX', 'date': '03/04/09'},
  {'entity':2019, 'type': 'Bank Account Transaction', 'description': 'Has Sent: $10000', 'date': '07/01/04'},
  {'entity':2019, 'type': 'Has Registered Address', 'description': 'Paris, France', 'date': '07/01/04'}
]

const TooltipEvent = (data) => {

  return(
    <div className='Tooltip'>
      <div className="name" style={{border:0, textAlign:'center'}}>{data[0].entity}</div>
      <div className="table-row-header">
        <div className="cell cell-50">
          <div className="value">TYPE</div>
        </div>
        <div className="cell cell-50">
          <div className="value">DESCRIPTION</div>
        </div>
        <div className="cell cell-20">
          <div className="value">DATE</div>
        </div>
      </div>
      <div className='table-row-contents'>
        {data.map((d,i)=>(
          <div className="row">
            <div className="cell cell-50">
              <div className="value">{d.type}</div>
            </div>
            <div className="cell cell-50">
              <div className="value">{d.description}</div>
            </div>
            <div className="cell cell-20">
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

  const { tooltipState } = useContext(TooltipContext)
  const { x, y, show, position, dimensions, content, type } = tooltipState
  const { width, height } = dimensions

  const events = eventData.filter(d=>d.entity == 82007088)

  return (
    <g
      transform={position=='left' ? `translate(${x-width-10}, ${y-height/2})` : `translate(${x+10}, ${y-height/2})`}
      style={{ visibility: show ? 'visible' : 'hidden' }}
    >
      <foreignObject width={width} height={height} className='tooltipFO'>
        <div className={cx('tooltipContent', position)}>
            <span className="arrow"></span>
            { type ? TooltipEvent(events) : TooltipEntity(content) }
        </div>
      </foreignObject>
    </g>
  )
}


export default Tooltip;
