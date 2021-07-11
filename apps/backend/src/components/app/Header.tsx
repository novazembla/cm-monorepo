import React from 'react';
import { NavLink } from "react-router-dom";


const Header = (/* props */) => {
  return (
    <header className="z-40 py-4 bg-white filter drop-shadow-md dark:bg-gray-800">
      <nav>
        <NavLink exact activeClassName="active" to="/">DashBoard</NavLink>
        <NavLink activeClassName="active" to="/login">Login</NavLink>
        <NavLink activeClassName="active" to="/profile">Profile</NavLink>
      </nav>
    </header>
  )
}

export default Header;