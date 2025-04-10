import React from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import './Header.css';

function Header() {
  const { data: session } = useSession();

  return (
    <header className="site-header">
      <div className="logo">🤖 QuickQuote</div>
      <nav>
        <a href="#">Home</a>
        <a href="#">About</a>
        <a href="#">Contact</a>
        {session ? (
          <button onClick={() => signOut()}>Logout</button>
        ) : (
          <button onClick={() => signIn('google')}>Login</button>
        )}
      </nav>
    </header>
  );
}

export default Header;
