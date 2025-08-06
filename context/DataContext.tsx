
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Territory, Street, House, Visit, VisitStatus, DataContextType } from '../types';

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY = 'visit_registry_app_data';

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        setTerritories(JSON.parse(data));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveData = (data: Territory[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setTerritories(data);
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  };

  const getTerritory = (id: string) => territories.find(t => t.id === id);
  const getStreet = (territoryId: string, streetId: string) => getTerritory(territoryId)?.streets.find(s => s.id === streetId);
  
  const addTerritory = (number: string, mapImage?: string) => {
    const newTerritory: Territory = { id: Date.now().toString(), number, mapImage, streets: [] };
    saveData([...territories, newTerritory]);
  };

  const updateTerritory = (id: string, number: string, mapImage?: string) => {
    const newTerritories = territories.map(t => t.id === id ? { ...t, number, mapImage: mapImage !== undefined ? mapImage : t.mapImage } : t);
    saveData(newTerritories);
  };

  const deleteTerritory = (id: string) => {
    saveData(territories.filter(t => t.id !== id));
  };
  
  const addStreet = (territoryId: string, name: string) => {
    const newStreet: Street = { id: Date.now().toString(), name, houses: [] };
    const newTerritories = territories.map(t => t.id === territoryId ? { ...t, streets: [...t.streets, newStreet] } : t);
    saveData(newTerritories);
  };

  const updateStreet = (territoryId: string, streetId: string, name: string) => {
    const newTerritories = territories.map(t => {
      if (t.id === territoryId) {
        const newStreets = t.streets.map(s => s.id === streetId ? { ...s, name } : s);
        return { ...t, streets: newStreets };
      }
      return t;
    });
    saveData(newTerritories);
  };

  const deleteStreet = (territoryId: string, streetId: string) => {
    const newTerritories = territories.map(t => {
      if (t.id === territoryId) {
        return { ...t, streets: t.streets.filter(s => s.id !== streetId) };
      }
      return t;
    });
    saveData(newTerritories);
  };

  const addHouse = (territoryId: string, streetId: string, houseNumber: string, data: { status: VisitStatus, name?: string, phone?: string, observation?: string }) => {
    const { status, name, phone, observation } = data;
    const newVisit: Visit = { id: Date.now().toString(), date: new Date().toISOString(), status };
    const newHouse: House = {
      id: Date.now().toString(),
      number: houseNumber,
      visits: [newVisit],
      name: status === VisitStatus.Answered ? name : undefined,
      phone: status === VisitStatus.Answered ? phone : undefined,
      observation: status === VisitStatus.Answered ? observation : undefined,
    };

    const newTerritories = territories.map(t => {
      if (t.id === territoryId) {
        const newStreets = t.streets.map(s => {
          if (s.id === streetId) {
            return { ...s, houses: [...s.houses, newHouse] };
          }
          return s;
        });
        return { ...t, streets: newStreets };
      }
      return t;
    });
    saveData(newTerritories);
  };
  
  const addVisitToHouse = (territoryId: string, streetId: string, houseId: string, data: { status: VisitStatus, name?: string, phone?: string, observation?: string }) => {
    const { status, name, phone, observation } = data;
    const newVisit: Visit = { id: Date.now().toString(), date: new Date().toISOString(), status };
    
    const newTerritories = territories.map(t => {
        if (t.id === territoryId) {
            const newStreets = t.streets.map(s => {
                if (s.id === streetId) {
                    const newHouses = s.houses.map(h => {
                        if (h.id === houseId) {
                            const updatedHouse: House = { 
                                ...h, 
                                visits: [...h.visits, newVisit] 
                            };
                            if (status === VisitStatus.Answered) {
                                updatedHouse.name = name;
                                updatedHouse.phone = phone;
                                updatedHouse.observation = observation;
                            }
                            return updatedHouse;
                        }
                        return h;
                    });
                    return { ...s, houses: newHouses };
                }
                return s;
            });
            return { ...t, streets: newStreets };
        }
        return t;
    });
    saveData(newTerritories);
  };

  const deleteHouse = (territoryId: string, streetId: string, houseId: string) => {
    const newTerritories = territories.map(t => {
      if (t.id === territoryId) {
        const newStreets = t.streets.map(s => {
          if (s.id === streetId) {
            return { ...s, houses: s.houses.filter(h => h.id !== houseId) };
          }
          return s;
        });
        return { ...t, streets: newStreets };
      }
      return t;
    });
    saveData(newTerritories);
  };


  return (
    <DataContext.Provider value={{ territories, loading, addTerritory, updateTerritory, deleteTerritory, getTerritory, addStreet, updateStreet, deleteStreet, getStreet, addHouse, addVisitToHouse, deleteHouse }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
