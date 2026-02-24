import { useEffect } from 'react';
import './App.css';
import Login from './components/Login';

function App() {
    useEffect(() => {
    window.onbeforeunload = () => true;
    return () => {
      window.onbeforeunload = null;
    };
  }, []);

  return (
    <div>
      <Login />
    </div>
  );
}

export default App;