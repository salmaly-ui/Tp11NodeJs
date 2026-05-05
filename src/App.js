import React, { useState } from 'react';
import UserList from './components/UserList';
import ArticleViewer from './components/ArticleViewer';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="App">
      <header className="app-header">
        <h1>Application de Démonstration HTTP</h1>
        <p>Communication avec JSON Server (Mock API)</p>
      </header>
      
      <nav className="app-nav">
        <button 
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Gestion Utilisateurs
        </button>
        <button 
          className={activeTab === 'articles' ? 'active' : ''}
          onClick={() => setActiveTab('articles')}
        >
          Blog Articles
        </button>
      </nav>
      
      <main className="app-main">
        {activeTab === 'users' && <UserList />}
        {activeTab === 'articles' && <ArticleViewer />}
      </main>
    </div>
  );
}

export default App;