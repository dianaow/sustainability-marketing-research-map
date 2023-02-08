import React, { useContext } from "react"
import { TooltipContext } from "./Tooltip";

import "./table.css"

const tableActive = (data, value) => {

  const samePapers = data.filter(d => d.unitID === value)

  return(
    <div className = 'table-container'>
      <div className="table-row">
        <div className="wrapper text-4">
          <div className="wrapper text-2">
            <div className="text">PAPER</div>
            <div className="text">ACTOR</div>
          </div>
        </div>
        <div className="wrapper text-4">
          <div className="wrapper text-2">
            <div className="text">CATEGORY</div>
            <div className="num">VALUE</div>
          </div>
        </div>
      </div>
      {samePapers.map((d, i) => (
        <div className={"table-row" }>
          <div className="wrapper text-4">
            <div className="wrapper text-2">
              <div className="text">{d.unitID}</div>
              <div className="text">{d.topic}</div>
            </div>
          </div>
          <div className="wrapper text-4">
            <div className="wrapper text-2">
              <div className="text">{d.category}</div>
              <div className="num">{d.value}</div>
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
      <h4>Each node represents a paper.</h4>
      <h4>Hover over or click a node to view all scoring attributes related to the paper.</h4>
    </div> 
  )
}

const Table = ({data, search}) => {

  const tooltip = useContext(TooltipContext)
  const value = tooltip.info.unit || search.value
  return (
    <div className='Table'>
      { tooltip.show || (search.results && search.results.length > 0) ? tableActive(data, value) : tableEntityDefault() }
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