import React, { useContext } from "react"
import * as d3 from "d3"

import { ZoomContext } from "../contexts/ZoomContext"

const ZoomPanel = () => {

  const { zoom, zoomState, setZoomState } = useContext(ZoomContext)
  const svg = d3.selectAll('.networkWrapper')

  return(
    <div className='Chart_controls_section'>
      <div className="button zoom_in" onClick={ ()=> {
        setZoomState({ x:zoomState.x, y:zoomState.y, k:zoomState.k*1.2 })
        zoom.scaleBy(svg.transition().duration(750), 1.2);
       } }>+</div>
      <div className="button zoom_out" onClick={ ()=> {
        setZoomState({ x:zoomState.x, y:zoomState.y, k:zoomState.k*0.8 })
        zoom.scaleBy(svg.transition().duration(750), 0.8);
      } }>-</div>
    </div>
  )

}

export default ZoomPanel