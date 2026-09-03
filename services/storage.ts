import { useState, useEffect } from 'react';
import { AppData, INITIAL_DATA } from '../types';

const STORAGE_KEY = 'ricetta_facile_data_v1';

export const useAppStorage = () => {
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setData({ ...INITIAL_DATA, ...parsed });
      }
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      setLoaded(true);
    }
  }, []);

  const saveData = (newData: AppData) => {
    setData(newData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (e) {
      console.error("Failed to save data", e);
    }
  };

  const updateField = <K extends keyof AppData>(key: K, value: AppData[K]) => {
    setData(prev => {
      const newData = { ...prev, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      } catch (e) {
        console.error("Failed to save data", e);
      }
      return newData;
    });
  };

  return { data, saveData, updateField, loaded };
};
