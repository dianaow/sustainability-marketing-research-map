import React, { useContext } from "react";
import PropTypes from "prop-types"
import { colorScale } from "../consts"

const TooltipContext = React.createContext({
  show: false,
  info: {},
  details: []
})

const Tooltip = ({...props }) => {

  const { show, info } = useContext(TooltipContext)

  return (
    <g className="Tooltip" style={{ visibility: show ? 'visible' : 'hidden' }}>
      <circle
        className="Tooltip__circle"
        r={60}
        fill='blacck'  
        fillOpacity={0.2}
      />  
      <text {...props}
        className="Tooltip__unit"
        y={-20}  
        fill='black'  
        fontSize={16}    
      >
        { "Paper: " + info.label }
      </text>
      <text {...props}
        className="Tooltip__entity"
        y={0}  
        fill='black'  
        fontSize={16}    
      >
        { "Topic: " + info.topic }
      </text> 
      <text {...props}
        className="Tooltip__category"
        y={20}  
        fill='black'  
        fontSize={16}  
      >
        { "Category: " + info.category }
      </text> 
      <text {...props}
        className="Tooltip__score"
        y={40}  
        fill='black'  
        fontSize={16}  
      >
        { "Score: " + info.value }
      </text>  
    </g>
  )
}

Tooltip.propTypes = {
  show: PropTypes.bool,
  info: PropTypes.object,
}

Tooltip.defaultProps = {
  textAnchor: 'middle',
  fontSize: '12px'
}

export default Tooltip
export { TooltipContext } // makes it possible to share the same context between different consumers