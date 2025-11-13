'use client';

import React, { useEffect, useState, ReactNode } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/nextjs';
import { UserDetailsContext } from '@/context/UserDetailsContext';

// ✅ Define type properly
export interface UserDetails {
  name: string;
  email: string;
  credits: number;
}

// ✅ Define props interface instead of Readonly<...>
interface ProviderProps {
  children: ReactNode;
}

function Provider({ children }: ProviderProps) {
  const { user } = useUser();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  useEffect(() => {
    if (user) {
      createNewUser();
    }
  }, [user]);

  // ✅ Add type to async function and handle errors
  const createNewUser = async (): Promise<void> => {
    try {
      const result = await axios.post('/api/users');
      console.log('User created:', result.data);
      setUserDetails(result.data);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  return (
    <UserDetailsContext.Provider value={{ userDetails, setUserDetails }}>
      {children}
    </UserDetailsContext.Provider>
  );
}

export default Provider;
