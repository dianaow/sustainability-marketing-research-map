import React, { createContext, useState } from "react"

export const TooltipContext = createContext()

export function TooltipProvider(props) {

  const [tooltipState, setTooltip] = useState({ show: false, x: 0, y: 0, content: {}, position: 'right' })

  return(
    <TooltipContext.Provider value={{ tooltipState, setTooltip }}>
      { props.children }
    </TooltipContext.Provider>
  )

}