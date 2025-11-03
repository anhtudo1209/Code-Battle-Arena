import React from 'react';
import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <h1 className="logo">CODE BATTLE ARENA</h1>
      <div className="header-right">
        <input type="text" placeholder="Search..." className="search-bar" />
        <div className="icon-btn">⚙️</div>
        <div className="icon-btn">☰</div>
      </div>
    </header>
  );
}
