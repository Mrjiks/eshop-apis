import React from "react";
import { Link } from "react-router-dom";

export const NavBar = () => {
  return (
    <nav className='navbar bg-dark container'>
      <Link className='link-unstyled' to='/'>
        Home
      </Link>
      <Link to='product'>Products</Link>
      <Link to='/additem'>Upload</Link>
    </nav>
  );
};
