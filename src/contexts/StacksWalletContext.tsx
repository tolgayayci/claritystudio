import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface DeployerWallet {
  address: string;
  balance?: string;
}

interface StacksWalletContextType {
  wallet: DeployerWallet | null;
  balance: string;
  isLoadingBalance: boolean;
  isLoadingWallet: boolean;
  refreshBalance: () => Promise<void>;
  requestFaucet: () => Promise<{ success: boolean; txId?: string; error?: string }>;
}

const StacksWalletContext = createContext<StacksWalletContextType | undefined>(undefined);

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

export function StacksWalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<DeployerWallet | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);

  const refreshBalance = useCallback(async () => {
    if (!wallet?.address) return;
    setIsLoadingBalance(true);
    try {
      const res = await fetch(`${API_URL}/account/${wallet.address}`);
      const data = await res.json();
      if (data.balance !== undefined) {
        setBalance(data.balance);
      }
    } catch (err) {
      console.error('Failed to refresh balance:', err);
    } finally {
      setIsLoadingBalance(false);
    }
  }, [wallet?.address]);

  const requestFaucet = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/wallet/faucet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        setTimeout(() => refreshBalance(), 5000);
      }
      return data;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [refreshBalance]);

  useEffect(() => {
    const initWallet = async () => {
      setIsLoadingWallet(true);
      try {
        const res = await fetch(`${API_URL}/wallet/info`);
        const data = await res.json() as { address: string; balance: string };
        setWallet({ address: data.address });
        if (data.balance) setBalance(data.balance);
      } catch (err) {
        console.error('Failed to load deployer wallet info:', err);
      } finally {
        setIsLoadingWallet(false);
      }
    };

    initWallet();
  }, []);

  // Auto-refresh balance every 30s
  useEffect(() => {
    if (wallet?.address) {
      refreshBalance();
      const interval = setInterval(refreshBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [wallet?.address, refreshBalance]);

  return (
    <StacksWalletContext.Provider value={{
      wallet,
      balance,
      isLoadingBalance,
      isLoadingWallet,
      refreshBalance,
      requestFaucet,
    }}>
      {children}
    </StacksWalletContext.Provider>
  );
}

export function useStacksWallet() {
  const context = useContext(StacksWalletContext);
  if (!context) {
    throw new Error('useStacksWallet must be used within StacksWalletProvider');
  }
  return context;
}
