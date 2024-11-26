import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from './firebase'; // Import Firestore instance
import { doc, getDoc } from 'firebase/firestore'; // Firestore methods
import './Information.css'; // CSS file

const Information = () => {
  const location = useLocation(); // Access data passed via navigation
  const navigate = useNavigate();

  // Extract pill index from the navigation state
  const pillIndex = location.state?.pillIndex || 0; // Default to index 0 if none provided

  // State to hold pill data
  const [pill, setPill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Replace with the current user's ID or email
  const userId = "test1@gmail.com"; // This should be dynamically set based on the logged-in user

  useEffect(() => {
    const fetchPillData = async () => {
      try {
        setLoading(true);

        // Reference to the pillbox document in Firestore
        const pillDocRef = doc(db, 'users', userId, 'currentMeds', `pillbox_${pillIndex + 1}`);
        const pillDoc = await getDoc(pillDocRef);

        if (pillDoc.exists()) {
          setPill(pillDoc.data());
        } else {
          setError('No data found for this pill.');
        }
      } catch (err) {
        console.error('Error fetching pill data:', err);
        setError('Failed to fetch pill data.');
      } finally {
        setLoading(false);
      }
    };

    fetchPillData();
  }, [pillIndex, userId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="information-page">
      {/* Header */}
      <header className="information-header">
        <button className="icon-button" onClick={() => navigate(-1)}>
          &lt; Back
        </button>
        <h1 className="logo">약 세부사항</h1>
      </header>

      {/* Content */}
      <main className="content">
        <div className="pill-image-placeholder">
          <div className="pill-image"></div>
        </div>
        <h2>{pill.name}</h2>
        <p><strong>예상 복용 완료일:</strong> {pill.createdAt}</p>
        <p><strong>복용 방법:</strong> {pill.note}</p>
        <p><strong>복용 빈도:</strong> {pill.frequency}</p>
        <p>
          <strong>복용 시간:</strong> 
          {pill.time.morning && " 아침"}
          {pill.time.lunch && " 점심"}
          {pill.time.evening && " 저녁"}
        </p>
        
        {/* Progress Bar */}
        <div className="progress-bar">
          <div className="progress" style={{ width: `${pill.frequency}%` }}></div>
        </div>

        <button className="complete-button" disabled>복용완료하기</button>
      </main>
    </div>
  );
};

export default Information;
