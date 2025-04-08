import React from 'react';
import './Header.css';

function Header() {
  return (
    <header className="site-header">
      <div className="logo">🔧 BrokenDishwasher</div>
      <nav className="nav-links">
        <a href="#">Quotes</a>
        <a href="#">About</a>
        <a href="#">Login</a>
      </nav>
    </header>
  );
}

export default Header;
