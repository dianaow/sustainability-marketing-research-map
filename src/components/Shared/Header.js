import React from "react"
import { Link } from "react-router-dom";
import { Icon } from 'semantic-ui-react'

const Header = () => (
  <div className="Header">
    <div className='headerWrapper'>
      <Link to='/'>
        <div className='home'><Icon name='home' /></div>
      </Link>
    </div>
  </div>
)

export default Header
