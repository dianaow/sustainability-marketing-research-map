import React, { createContext, useState } from "react"
import * as d3 from "d3"

export const ZoomContext = createContext()

export function ZoomProvider(props) {

  const [zoomState, setZoomState] = useState({ x:0,y:0,k:1 })
  const zoom = d3.zoom().scaleExtent([0.5, 2]).on("zoom", ()=>setZoomState(d3.event.transform))
  
  return(
    <ZoomContext.Provider value={{ zoom, zoomState, setZoomState }}>
      { props.children }
    </ZoomContext.Provider>
  )

}