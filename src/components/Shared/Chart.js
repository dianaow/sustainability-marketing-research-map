import React, { createContext } from "react"
import { dimensionsPropsType } from "../utils"

export const ChartContext = createContext()

const Chart = ({ dimensions, children }) => (
  <ChartContext.Provider value={{dimensions}}>
    <svg className="networkWrapper" width={dimensions.width} height={dimensions.height}>
      { children }
    </svg>
  </ChartContext.Provider>
)

Chart.propTypes = {
  dimensions: dimensionsPropsType
}

Chart.defaultProps = {
  dimensions: {}
}

export default Chart
