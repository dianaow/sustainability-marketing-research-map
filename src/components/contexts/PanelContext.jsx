import React, { createContext, useState } from "react"

export const PanelContext = createContext()

export function PanelProvider(props) {

  const [panelState, setPanelState] = useState({ 'country': true, 'score': false, 'person': true, 'organization': true, 'clicked': null})

  const changeScale = () => {

    if(panelState.country){
      //scales.colorAccessor = d => regionScale(d.countries)
      //let newEle = updateAttributes(current.nodes, current.links, scales)
      //draw(newEle.nodes, newEle.links, newEle.accessors, Z)
    } else {
      //scales.colorAccessor = d => scoreScale(d.score)
      //et newEle = updateAttributes(current.nodes, current.links, scales)
      //draw(newEle.nodes, newEle.links, newEle.accessors, Z)
    }

  }

  return(
    <PanelContext.Provider value={{ panelState, setPanelState, changeScale }}>
      { props.children }
    </PanelContext.Provider>
  )

} 