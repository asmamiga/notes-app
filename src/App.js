import React, { useState } from 'react';
import Navbar from './components/navbar/navbar';
import Login from './components/login/login';
import NotesList from './components/noteslist/noteslist';
import ThemeSwitcher from './components/themeSwitcher/themeSwitcher';

function App() {
  const [userInfo, setUserInfo] = useState({
    userfirstname: '',
    userlastname: ''
  });
  const [token, setToken] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="App">
      {isConnected ? (
        <>
          <Navbar 
            userInfo={userInfo} 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          <NotesList 
            token={token}
            searchQuery={searchQuery}
            setLoading={setLoading}
          />
        </>
      ) : (
        <Login 
          setToken={setToken}
          setIsConnected={setIsConnected}
          setUserInfo={setUserInfo}
          setLoading={setLoading}
        />
      )}
      {loading && <div>Loading...</div>}
    </div>
  );
}

export default App;
