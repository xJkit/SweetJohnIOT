import React, { useState, useEffect, useCallback } from 'react';
import { AppState } from 'react-native';

export default function useAppState() {
  const [appState, setAppState] = useState(AppState.currentState);
  const handleAppStateChange = useCallback(() => {
    setAppState(AppState.currentState);
  }, []);
  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange);
    return () => AppState.removeEventListener('change', handleAppStateChange);
      }, [handleAppStateChange]
  );
  return appState;
}