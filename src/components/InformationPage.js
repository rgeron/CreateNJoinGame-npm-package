import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { createNJoin } from '../App';

function InformationPage() {
  const navigate = useNavigate();
  const { pin } = useParams();
  const { state } = useLocation();
  const [name, setName] = useState('');
  const [celebrity, setCelebrity] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const playerKey = await createNJoin.handleSubmitAsync(pin, name, { celebrity });
      navigate(`/waiting/${pin}`, { state: { playerKey, playerName: name } });
    } catch (error) {
      console.error('Error submitting information:', error);
    }
  };

  return (
    <div>
      <h2>Enter Your Information</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
          required
        />
        <input
          type="text"
          value={celebrity}
          onChange={(e) => setCelebrity(e.target.value)}
          placeholder="Celebrity Name"
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default InformationPage;