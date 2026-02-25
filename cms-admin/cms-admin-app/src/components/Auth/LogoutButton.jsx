import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LogoutButton() {
  const { logout, loading } = useAuth();
  const navigate = useNavigate();

  const onClick = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <button onClick={onClick} disabled={loading} style={{ marginLeft: 12 }}>
      Sign out
    </button>
  );
}

