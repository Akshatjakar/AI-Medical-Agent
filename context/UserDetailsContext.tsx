'use client';

import { createContext, Dispatch, SetStateAction } from 'react';
import { UserDetails } from '@/app/provider';

// ✅ Define a proper type for the context value
export interface UserDetailsContextType {
  userDetails: UserDetails | null;
  setUserDetails: Dispatch<SetStateAction<UserDetails | null>>;
}

// ✅ Create the context with an initial undefined value
export const UserDetailsContext = createContext<UserDetailsContextType | undefined>(undefined);
