import React, { createContext, useContext } from "react"
import { dimensionsPropsType } from "./utils"

const ChartContext = createContext()
export const useChartDimensions = () => useContext(ChartContext)

const Chart = ({ dimensions, children }) => (
  <ChartContext.Provider value={dimensions}>
    <svg className="Chart" width={dimensions.width} height={dimensions.height}>
      <g>
        { children }
      </g>
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
