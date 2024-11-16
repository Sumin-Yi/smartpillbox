import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './Home'; // Import your HomePage component

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route for the home screen */}
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
