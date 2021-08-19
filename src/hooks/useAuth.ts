import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function useAuth() {
  const userValue = useContext(AuthContext);
  return userValue;
}
