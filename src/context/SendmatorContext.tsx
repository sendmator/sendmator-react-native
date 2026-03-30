/**
 * Sendmator Context Provider
 */

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { SendmatorApiClient } from '../api/client';
import type { SendmatorConfig } from '../types';

interface SendmatorContextType {
  client: SendmatorApiClient;
  config: SendmatorConfig;
}

const SendmatorContext = createContext<SendmatorContextType | null>(null);

export interface SendmatorProviderProps {
  config: SendmatorConfig;
  children: ReactNode;
}

export function SendmatorProvider({
  config,
  children,
}: SendmatorProviderProps) {
  const client = new SendmatorApiClient(config.apiUrl, config.apiKey);

  return (
    <SendmatorContext.Provider value={{ client, config }}>
      {children}
    </SendmatorContext.Provider>
  );
}

export function useSendmator(): SendmatorContextType {
  const context = useContext(SendmatorContext);

  if (!context) {
    throw new Error('useSendmator must be used within a SendmatorProvider');
  }

  return context;
}
