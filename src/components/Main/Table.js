import React, { useContext } from "react"
import { TooltipContext } from "./Tooltip";

import "./table.css"

const tableActive = (tooltip) => {
  return(
    <div className = 'table-container'>
      <div className="table-row">
        <div className="wrapper text-4">
          <div className="wrapper text-2">
            <div className="num">ORDER</div>
            <div className="text">UNIT ID</div>
          </div>
        </div>
        <div className="wrapper text-4">
          <div className="wrapper text-2">
            <div className="text">CODER ID</div>
            <div className="text">CATEGORY</div>
          </div>
        </div>
      </div>
      {tooltip.details.map((d, i) => (
        <div className={"table-row" }>
          <div className="wrapper text-4">
            <div className="wrapper text-2">
              <div className="num">{d.order}</div>
              <div className="text">{d.unitID}</div>
            </div>
          </div>
          <div className="wrapper text-4">
            <div className="wrapper text-2">
              <div className="text">{d.coderID}</div>
              <div className="text">{d.category}</div>
            </div>
          </div>
        </div>
      ))}  
    </div>
  )
}

const tableEntityDefault = () => {
  return(
    <div className = 'Table__default'>
      <h4>Hover over or click a node to select all related papers</h4>
    </div> 
  )
}

const Table = () => {

  const tooltip = useContext(TooltipContext)

  return (
    <div className='Table'>
      { tooltip.show ? tableActive(tooltip) : tableEntityDefault() }
    </div>
  )
  
}

Table.propTypes = {

}

Table.defaultProps = {
  fill: 'white',
  stroke: 'none',
  textAnchor: 'left',
  fontSize: '10px',
}

export default Table