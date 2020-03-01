import React, { useContext } from "react"
import PropTypes from "prop-types"
import Tooltip, { TooltipContext } from "./Tooltip";

import "./table.css"

const Table = () => {

  const tooltip = useContext(TooltipContext)

  return (
    <div className='Table'>
      {tooltip.show ? (
        <div className = 'container-fluid'>
          <div className="table-row header">
            <div className="wrapper text-4">
              <div className="wrapper text-2">
                <div className="num"></div>
                <div className="text">PLAYER</div>
              </div>
            </div>
            <div className="wrapper num-4">
              <div className="wrapper num-2">
                <div className="text">COUNTRY</div>
                <div className="num">OVERALL</div>
              </div>
            </div>
          </div>
          {tooltip.links.map((d, i) => (
            <div className={d.targetName === tooltip.info.name ? "table-row selected" : "table-row" }>
              <div className="wrapper text-4">
                <div className="wrapper text-2">
                  <img src={`${d.photo}`} height='25' width='25' />
                  <div className="text">{d.targetName}</div>
                </div>
              </div>
              <div className="wrapper num-4">
                <div className="wrapper num-2">
                  <div className="text">{d.country}</div>
                  <div className="num">{d.overall_score.toFixed(2)}</div>
                </div>
              </div>
            </div>
          ))}  
        </div>
      ) : (
        <div className = 'Table__default'>
          <h4>Hover over a node to select a player and see his statistics and connections</h4>
          <h4>Player is marked in category with highest sub-score</h4>
        </div> 
      )}
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