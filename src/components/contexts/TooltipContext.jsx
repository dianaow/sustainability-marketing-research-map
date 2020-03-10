import React, { createContext, useState } from "react"

export const initialTooltipState = { show: false, x: 0, y: 0, content: {}, position: 'right', dimensions: {width: 300, height: 200} }

export const TooltipContext = createContext()

export function TooltipProvider(props) {

  const [tooltipState, setTooltip] = useState(initialTooltipState)

  return(
    <TooltipContext.Provider value={{ tooltipState, setTooltip }}>
      { props.children }
    </TooltipContext.Provider>
  )

}