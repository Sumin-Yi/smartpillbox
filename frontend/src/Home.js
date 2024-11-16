import React, { useState } from 'react';
import { ReactComponent as PillIcon } from './icons/pill.svg';
import { ReactComponent as ProfileIcon } from './icons/profile.svg';
import { ReactComponent as MenuIcon } from './icons/menu.svg';
import pillboxIcon from './icons/pillbox.svg'; 
import './Home.css';

const Home = () => {
  const [pills, setPills] = useState([
    { name: 'Medicine A', status: 'taken' },
    { name: 'Medicine B', status: 'pending' },
    { name: 'Medicine C', status: 'missed' },
  ]);

  const [isEditing, setIsEditing] = useState(false); // Tracks edit mode

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const toggleStatus = (index) => {
    if (!isEditing) return; // Only allow changes in edit mode
    setPills((prevPills) =>
      prevPills.map((pill, i) =>
        i === index ? { ...pill, status: pill.status === 'taken' ? 'missed' : 'taken' } : pill
      )
    );
  };

  const [pillboxStatus, setPillboxStatus] = useState([
    'taken',  // Green light
    'taken',  // Green light
    'taken',  // Green light
    'taken'   // Green light (initial state for all)
  ]);

  return (
    <div className="home">
      {/* Header */}
      <header className="header">
        <button className="icon-button">
          <ProfileIcon className="icon" />
        </button>
        <h1 className="logo">Smart Pillbox</h1>
        <button className="icon-button">
          <MenuIcon className="icon" />
        </button>
      </header>

      {/* Dashboard */}
      <main className="dashboard">
        <h2>오늘 먹어야 할 약</h2>
        <div className="dashboard-content">
            <ul className="pill-list">
            {pills.map((pill, index) => (
                <li key={index} className="pill-item">
                <div className="pill-info">
                    <PillIcon className="pill-icon" />
                    <span>{pill.name}</span>
                </div>
                <div className="pill-status">
                    <span
                    className={`status ${pill.status === 'taken' ? 'taken' : 'missed'}`}
                    onClick={() => toggleStatus(index)} // Allow toggling during edit mode
                    >
                    {pill.status === 'taken' ? '✔️' : '❌'}
                    </span>
                </div>
                </li>
            ))}
            </ul>
            <button className="edit-button" onClick={toggleEditMode}>
            {isEditing ? 'Complete' : 'Edit'}
            </button>
        </div>
        </main>

      {/* Pillbox Status */}
      <div className="pillbox-grid">
        {pillboxStatus.map((status, index) => (
          <div key={index} className="pillbox-wrapper">
            <div className={`status-light ${status === 'taken' ? 'green' : 'red'}`}></div>
            <div className="pillbox">
              <img src={pillboxIcon} alt="Pillbox" className="pillbox-icon" />
            </div>
          </div>
        ))}
      </div>

      {/* Add pill */}
      <button className="AddPill">+</button>
    </div>
  );
};

export default Home;
