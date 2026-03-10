import React, { createContext, useContext, useState } from 'react';
import type { UserRole } from '@/data/mockData';

interface AppContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType>({
  currentRole: 'CHEW',
  setCurrentRole: () => {},
  sidebarOpen: true,
  setSidebarOpen: () => {},
});

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('CHEW');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AppContext.Provider value={{ currentRole, setCurrentRole, sidebarOpen, setSidebarOpen }}>
      {children}
    </AppContext.Provider>
  );
};
