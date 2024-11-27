import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Register from './Register';
import Information from './Information';
import History from './History'
import InformationHistory from "./InformationHistory";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/information" element={<Information />} />
        <Route path='/history' element={<History />} />
        <Route path="/information-history" element={<InformationHistory />} />
      </Routes>
    </Router>
  );
}

export default App;
