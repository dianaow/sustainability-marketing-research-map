import React from "react"
import { Icon } from 'semantic-ui-react'

const Header = () => (
  <div className="Header">
    <div className='headerWrapper'>
      <div class='home'><Icon name='home' /></div>
      <div class='logo'>RISK 360</div>
      <div class='menu'><Icon name='user outline' /></div>
      <div class='menu'><Icon name='bars' /></div>
    </div>
  </div>
)

export default Header
