import React from "react"
import { Link } from "react-router-dom";
import { Icon } from 'semantic-ui-react'

const Header = () => (
  <div className="Header">
    <div className='headerWrapper'>
      <Link to='/'>
        <div class='home'><Icon name='home' /></div>
      </Link>
      <div class='logo'>RISK 360°</div>
      <div class='menu'><Icon name='user outline' /></div>
      <div class='menu'><Icon name='bars' /></div>
    </div>
  </div>
)

export default Header
