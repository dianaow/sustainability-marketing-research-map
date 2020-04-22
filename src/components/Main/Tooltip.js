import React, { useContext } from "react";
import PropTypes from "prop-types"
import { colorScale } from "../consts"

const TooltipContext = React.createContext({
  show: false,
  info: {name: "", club: "", category: "", score: "", photo: ""},
  links: []
})

const Tooltip = ({...props }) => {

  const { show, info } = useContext(TooltipContext)

  return (
    <g className="Tooltip" style={{ visibility: show ? 'visible' : 'hidden' }}>
      <circle
        className="Tooltip__circle"
        r={60}
        fill={colorScale(info.category)}  
        fillOpacity={0.1}
      />  
      <text {...props}
        className="Tooltip__name"
        y={50}  
        fill={colorScale(info.category)}  
        fontSize={16}    
      >
        { info.name }
      </text> 
      <text {...props}
        className="Tooltip__club"
        y={70}  
        fill={colorScale(info.category)}  
      >
        { info.club }
      </text> 
      <text {...props}
        className="Tooltip__label"
        y={-60}  
        fill={colorScale(info.category)}   
      >
        Overall Score:
      </text> 
      <text {...props}
        className="Tooltip__score"
        y={-30}  
        fill='white'  
        fontSize={32}  
      >
        { Math.round(info.score * 100) / 100 }
      </text> 
      <image
        className="Tooltip__image"
        x={-28}
        y={-20}  
        width={28*2}
        height={28*2}
        fill={colorScale(info.category)}  
        xlinkHref={info.photo}
      /> 
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