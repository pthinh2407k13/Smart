import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClassRoom } from '../types';
import { dbService } from '../services/db';

interface ClassContextType {
  classes: ClassRoom[];
  selectedClassId: string;
  selectedClass: ClassRoom | undefined;
  setSelectedClassId: (id: string) => void;
  refreshClasses: () => void;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export const ClassProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [classes, setClasses] = useState<ClassRoom[]>(() => dbService.getClasses());
  const [selectedClassId, setSelectedClassIdState] = useState<string>(() => {
    const saved = localStorage.getItem('smart_class_active_id');
    const allClasses = dbService.getClasses();
    if (saved && allClasses.some((c) => c.id === saved)) {
      return saved;
    }
    return allClasses[0]?.id || '';
  });

  useEffect(() => {
    const unsubscribe = dbService.subscribe(() => {
      const updated = dbService.getClasses();
      setClasses(updated);
    });
    return unsubscribe;
  }, []);

  const setSelectedClassId = (id: string) => {
    setSelectedClassIdState(id);
    localStorage.setItem('smart_class_active_id', id);
  };

  const refreshClasses = () => {
    setClasses(dbService.getClasses());
  };

  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  return (
    <ClassContext.Provider
      value={{
        classes,
        selectedClassId,
        selectedClass,
        setSelectedClassId,
        refreshClasses,
      }}
    >
      {children}
    </ClassContext.Provider>
  );
};

export const useClass = () => {
  const context = useContext(ClassContext);
  if (!context) throw new Error('useClass must be used within ClassProvider');
  return context;
};
