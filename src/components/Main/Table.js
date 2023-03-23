import React, { useContext } from "react"
import { TooltipContext } from "./Tooltip";

import "./table.css"

const tableActive = (data, value) => {

  const samePapers = data.filter(d => d.label === value)
  if(samePapers.length === 0) return
  return(
    <div className = 'table-container'>
      <div className="table-row">
        <div><a href={ samePapers[0].url }>Click here to view paper</a></div>
      </div>
      <div className="table-row">
        <div><b>Title of paper: </b>{ samePapers[0].title }</div>
      </div>
      <div className="table-row">
        <div><b>Authors: </b>{ samePapers[0].authors }</div>
      </div>
      <div className="table-row">
        <div><b>Journal: </b>{ samePapers[0].sourcetitle }</div>
      </div> 
      <div className="table-row">
        <div><b>Year: </b>{ samePapers[0].year }</div>
      </div> 
      <div className="table-row">
        <div><b>Cited by: </b>{ samePapers[0].count }</div>
      </div> 
      <div className="table-row">
        <div><b>Abstract : </b>{ samePapers[0].abstract }</div>
      </div> 
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
  const value = tooltip.info.label || search.value
  return (
    <>
     { tooltip.show || (!search.isOpen && search.results && search.results.length > 0) ? <p style={{fontWeight: 900}}>Once clicking on a node for more information, unselect that node by clicking the same node to return to the overall view</p>: <p></p> }
     <div className='Table'>
      { tooltip.show || (!search.isOpen && search.results && search.results.length > 0) ? tableActive(data, value) : tableEntityDefault() }
    </div>
    </>
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