import { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ABIMethod, Deployment } from '@/lib/types';
import { ABIMethodCard } from '@/components/abi/ABIMethodCard';
import { ABIEmptyState } from '@/components/abi/ABIEmptyState';
import { ABIContractSelector } from '@/components/abi/ABIContractSelector';
import { ABIExecuteDialog } from '@/components/abi/ABIExecuteDialog';
import { ABIExecutionHistory } from '@/components/abi/ABIExecutionHistory';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { History, PlayCircle, Loader2, Clock } from 'lucide-react';

const HIRO_API = 'https://api.testnet.hiro.so';

interface ABIViewProps {
  projectId: string;
  userId?: string;
  isSharedView?: boolean;
  onDeploy?: () => void;
  onRequestDeploy?: () => void;
  refreshTrigger?: number;
}

function formatClarityType(type: any): string {
  if (typeof type === 'string') return type;
  if (typeof type !== 'object' || type === null) return String(type);
  if ('optional' in type) return `(optional ${formatClarityType(type.optional)})`;
  if ('response' in type) return `(response ${formatClarityType(type.response.ok)} ${formatClarityType(type.response.error)})`;
  if ('buffer' in type) return `(buff ${type.buffer.length})`;
  if ('string-ascii' in type) return `(string-ascii ${type['string-ascii'].length})`;
  if ('string-utf8' in type) return `(string-utf8 ${type['string-utf8'].length})`;
  if ('list' in type) return `(list ${type.list.length} ${formatClarityType(type.list.type)})`;
  if ('tuple' in type) return `(tuple)`;
  if ('trait_reference' in type) return 'trait';
  return JSON.stringify(type);
}

function stacksFunctionToABIMethod(fn: any): ABIMethod {
  return {
    name: fn.name,
    type: 'function',
    stateMutability: fn.access === 'read_only' ? 'view' : 'nonpayable',
    inputs: (fn.args || []).map((arg: any) => ({
      name: arg.name,
      type: formatClarityType(arg.type),
      internalType: formatClarityType(arg.type),
    })),
    outputs: fn.outputs
      ? [{ name: 'output', type: formatClarityType(fn.outputs.type), internalType: formatClarityType(fn.outputs.type) }]
      : [],
  };
}

export function ABIView({ projectId, userId, isSharedView = false, onDeploy, onRequestDeploy, refreshTrigger }: ABIViewProps) {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null);
  const [contractMethods, setContractMethods] = useState<ABIMethod[]>([]);
  const [isFetchingInterface, setIsFetchingInterface] = useState(false);
  const [isWaitingForChain, setIsWaitingForChain] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const interfacePollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<ABIMethod | null>(null);
  const [activeView, setActiveView] = useState<'interface' | 'history'>('interface');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const stopInterfacePolling = () => {
    if (interfacePollRef.current) {
      clearInterval(interfacePollRef.current);
      interfacePollRef.current = null;
    }
  };

  const fetchContractInterface = async (contractAddress: string, pollUntilReady = false) => {
    if (!contractAddress) { setContractMethods([]); return; }
    const dotIndex = contractAddress.indexOf('.');
    if (dotIndex === -1) { setContractMethods([]); return; }
    const address = contractAddress.slice(0, dotIndex);
    const contractName = contractAddress.slice(dotIndex + 1);

    stopInterfacePolling();
    setIsFetchingInterface(true);
    setIsWaitingForChain(false);
    setError(null);

    const tryFetch = async (): Promise<boolean> => {
      try {
        const res = await fetch(`${HIRO_API}/v2/contracts/interface/${address}/${contractName}`);
        if (res.status === 404) return false; // not indexed yet
        if (!res.ok) throw new Error(`Failed to fetch contract interface (${res.status})`);
        const data = await res.json();
        const publicFunctions = (data.functions || [])
          .filter((fn: any) => fn.access !== 'private')
          .map(stacksFunctionToABIMethod);
        setContractMethods(publicFunctions);
        setIsFetchingInterface(false);
        setIsWaitingForChain(false);
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to fetch contract interface';
        setError(msg);
        setContractMethods([]);
        setIsFetchingInterface(false);
        setIsWaitingForChain(false);
        return true; // stop polling on real errors
      }
    };

    const ok = await tryFetch();
    if (ok || !pollUntilReady) {
      setIsFetchingInterface(false);
      return;
    }

    // 404 — contract not yet indexed, start polling
    setIsWaitingForChain(true);
    setIsFetchingInterface(false);
    let attempts = 0;
    const maxAttempts = 20; // ~60s

    interfacePollRef.current = setInterval(async () => {
      attempts++;
      const done = await tryFetch();
      if (done || attempts >= maxAttempts) {
        stopInterfacePolling();
        if (attempts >= maxAttempts) {
          setIsWaitingForChain(false);
          setError('Contract interface not yet available. Click Refresh to try again.');
        }
      }
    }, 3000);
  };

  const fetchDeployments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('deployments')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDeployments(data || []);

      if (data && data.length > 0) {
        const mostRecent = data[0];
        setSelectedDeployment(mostRecent);
        // poll if triggered by a fresh deploy (refreshTrigger > 0)
        await fetchContractInterface(mostRecent.contract_address, (refreshTrigger ?? 0) > 0);
      } else {
        setSelectedDeployment(null);
        setContractMethods([]);
      }
    } catch (error) {
      console.error('Error fetching deployments:', error);
      toast({ title: 'Error', description: 'Failed to load deployments', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployments();
  }, [projectId, refreshTrigger]);

  useEffect(() => {
    return () => stopInterfacePolling();
  }, []);

  const handleAddressChange = async (address: string) => {
    setError(null);
    const deployment = deployments.find(d => d.contract_address === address);
    if (!deployment) {
      setError('Deployment not found');
      return;
    }
    setSelectedDeployment(deployment);
    await fetchContractInterface(deployment.contract_address);
  };

  const handleExecute = (method: ABIMethod) => {
    if (isSharedView) {
      toast({ title: 'Read-only View', description: 'Contract execution is disabled in shared view' });
      return;
    }
    setSelectedMethod(method);
  };

  return (
    <div className="h-full flex flex-col bg-background border rounded-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-md">
            <PlayCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Contract Interface</h3>
            <p className="text-xs text-muted-foreground">
              {isSharedView
                ? 'View deployed contract methods'
                : 'Interact with your deployed contract on Stacks testnet'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={activeView === 'interface' ? 'secondary' : 'ghost'}
            size="sm"
            className="gap-2"
            onClick={() => setActiveView('interface')}
          >
            <PlayCircle className="h-4 w-4" />
            Interface
          </Button>
          <Button
            variant={activeView === 'history' ? 'secondary' : 'ghost'}
            size="sm"
            className="gap-2"
            onClick={() => setActiveView('history')}
          >
            <History className="h-4 w-4" />
            History
          </Button>
        </div>
      </div>

      {/* Contract selector */}
      <ABIContractSelector
        contractAddress={selectedDeployment?.contract_address || ''}
        onAddressChange={handleAddressChange}
        error={error}
        deployments={deployments}
        isLoading={isLoading}
        userId={userId}
        projectId={projectId}
        isSharedView={isSharedView}
      />

      {activeView === 'interface' ? (
        <>
          {selectedDeployment ? (
            <div className="flex-1 flex flex-col min-h-0">
              {(isFetchingInterface || isWaitingForChain) ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground px-6 text-center">
                    {isWaitingForChain
                      ? <Clock className="h-5 w-5 animate-pulse" />
                      : <Loader2 className="h-5 w-5 animate-spin" />}
                    <span className="text-sm">
                      {isWaitingForChain
                        ? 'Waiting for contract to be confirmed on-chain…'
                        : 'Loading contract interface…'}
                    </span>
                    {isWaitingForChain && (
                      <span className="text-xs">Stacks testnet blocks take ~10s. Checking every 3s.</span>
                    )}
                  </div>
                </div>
              ) : (
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-2">
                    {contractMethods.length > 0 ? (
                      <>
                        <div className="text-xs text-muted-foreground mb-3">
                          {contractMethods.length} {contractMethods.length === 1 ? 'function' : 'functions'} available
                        </div>
                        {contractMethods.map((method, index) => (
                          <ABIMethodCard
                            key={index}
                            method={method}
                            onExecute={handleExecute}
                            isContractVerified={true}
                            isSharedView={isSharedView}
                          />
                        ))}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-sm text-muted-foreground">No public functions found</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          This contract may still be pending on-chain. Try refreshing in a moment.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => fetchContractInterface(selectedDeployment.contract_address)}
                        >
                          Refresh
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </div>
          ) : (
            <div className="flex-1">
              <ABIEmptyState />
            </div>
          )}
        </>
      ) : (
        <ABIExecutionHistory
          projectId={projectId}
          contractAddress={selectedDeployment?.contract_address || ''}
        />
      )}

      {selectedMethod && selectedDeployment && !isSharedView && (
        <ABIExecuteDialog
          open={true}
          onOpenChange={(open) => !open && setSelectedMethod(null)}
          method={selectedMethod}
          contractAddress={selectedDeployment.contract_address}
          projectId={projectId}
          onExecute={() => {
            toast({ title: 'Success', description: 'Method executed successfully' });
          }}
        />
      )}
    </div>
  );
}
