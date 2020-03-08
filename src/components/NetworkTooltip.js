import React, { useContext } from "react"
import cx from 'classnames';

import { TooltipContext } from "./contexts/TooltipContext"

import './tooltip.scss';

const Tooltip = () => {

  const width = 200
  const height = 300
  const { tooltipState } = useContext(TooltipContext)
  const { x, y, show, position, content } = tooltipState

  return (
    <g
      transform={position=='left' ? `translate(${x-width-10}, ${y-height/2})` : `translate(${x+10}, ${y-height/2})`}
      style={{ visibility: show ? 'visible' : 'hidden' }}
    >
      <foreignObject width={width} height={height}>
        <div className={cx('tooltipContent', position)} >
            <span className="arrow"></span>
            {content.name}
        </div>
      </foreignObject>
    </g>
  )
}

Tooltip.defaultProps = {
};

export default Tooltip;
