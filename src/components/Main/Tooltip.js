import React, { useContext } from "react";
import PropTypes from "prop-types"
import { colorScale } from "../consts"

const TooltipContext = React.createContext({
  show: false,
  info: {},
  links: []
})

const Tooltip = ({...props }) => {

  const { show, info } = useContext(TooltipContext)

  return (
    <g className="Tooltip" style={{ visibility: show ? 'visible' : 'hidden' }}>
      <circle
        className="Tooltip__circle"
        r={60}
        fill={colorScale(info.unit)}  
        fillOpacity={0.2}
      />  
      <text {...props}
        className="Tooltip__unit"
        y={-40}  
        fill={colorScale(info.unit)}  
        fontSize={18}    
      >
        { "Unit Type:" + info.unit }
      </text>
      <text {...props}
        className="Tooltip__entity"
        y={-20}  
        fill={colorScale(info.unit)}  
        fontSize={18}    
      >
        { "Topic:" + info.topic }
      </text> 
      <text {...props}
        className="Tooltip__category"
        y={0}  
        fill={colorScale(info.unit)}  
        fontSize={18}  
      >
        { "Category:" + info.category }
      </text> 
      <text {...props}
        className="Tooltip__score"
        y={20}  
        fill='white'  
        fontSize={16}  
      >
        { "Score:" + info.value }
      </text> 
      <text {...props}
        className="Tooltip__count"
        y={40}  
        fill='white'  
        fontSize={16}  
      >
        { "No. of papers:" + info.count }
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