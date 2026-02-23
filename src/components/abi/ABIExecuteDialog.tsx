import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Terminal,
  PlayCircle,
  Loader2,
  Info,
  Copy,
  FileText,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { ABIMethod } from '@/lib/types';
import { ABIMethodSignature } from './ABIMethodSignature';
import { executeClarityReadOnly, parseClarityValue } from '@/lib/stacksContract';
import { callPublicFunction } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { STACKS_TESTNET_API } from '@/lib/config';

interface ABIExecuteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  method: ABIMethod;
  contractAddress: string;
  projectId: string;
  onExecute: (result: any) => void;
}

type TxStatus = 'pending' | 'success' | 'abort_by_response' | 'abort_by_post_condition';

interface ExecutionResult {
  status: 'success' | 'error' | 'pending';
  result?: any;
  error?: string;
  txId?: string;
  explorerUrl?: string;
}

export function ABIExecuteDialog({
  open,
  onOpenChange,
  method,
  contractAddress,
  projectId,
  onExecute,
}: ABIExecuteDialogProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [txStatus, setTxStatus] = useState<TxStatus | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  const isReadOnly = method.stateMutability === 'view' || method.stateMutability === 'pure';

  // Stop polling on unmount or dialog close
  useEffect(() => {
    if (!open) {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [open]);

  const startPollingTxStatus = (txId: string) => {
    setTxStatus('pending');
    let attempts = 0;
    const maxAttempts = 30; // ~90s max

    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`${STACKS_TESTNET_API}/extended/v1/tx/${txId}`);
        if (!res.ok) return;
        const data = await res.json();
        const status: TxStatus = data.tx_status;

        if (status !== 'pending') {
          setTxStatus(status);
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          if (status === 'success') {
            toast({ title: 'Transaction Confirmed', description: 'State change is now on-chain.' });
          } else {
            toast({ title: 'Transaction Failed', description: `Status: ${status}`, variant: 'destructive' });
          }
        }
      } catch {
        // network error — keep polling
      }

      if (attempts >= maxAttempts) {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }, 3000);
  };

  const handleInputChange = (name: string, value: string) => {
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleExecute = async () => {
    if (!method || !contractAddress) return;

    setIsExecuting(true);
    setResult({ status: 'pending' });
    setTxStatus(null);
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }

    const dotIndex = contractAddress.indexOf('.');
    const addr = dotIndex !== -1 ? contractAddress.slice(0, dotIndex) : contractAddress;
    const name = dotIndex !== -1 ? contractAddress.slice(dotIndex + 1) : '';

    try {
      if (isReadOnly) {
        const args = (method.inputs || []).map(input => {
          const val = inputs[input.name] || '';
          return parseClarityValue(val, input.type);
        });

        const response = await executeClarityReadOnly(addr, name, method.name, args, addr);

        if (response.success) {
          const successResult: ExecutionResult = { status: 'success', result: response.result };
          setResult(successResult);
          onExecute(successResult);
          toast({ title: 'Success', description: 'Function called successfully' });
        } else {
          const errorResult: ExecutionResult = { status: 'error', error: response.error || 'Function call failed' };
          setResult(errorResult);
          toast({ title: 'Error', description: response.error, variant: 'destructive' });
        }
      } else {
        const argsPayload = (method.inputs || []).map(input => ({
          value: inputs[input.name] || '',
          type: input.type,
        }));

        const response = await callPublicFunction({
          contractAddress: addr,
          contractName: name,
          functionName: method.name,
          args: argsPayload,
        });

        const successResult: ExecutionResult = {
          status: 'success',
          txId: response.txId,
          explorerUrl: response.explorerUrl,
        };
        setResult(successResult);
        onExecute(successResult);
        toast({ title: 'Transaction Submitted', description: 'Waiting for confirmation…' });
        startPollingTxStatus(response.txId);
      }
    } catch (error) {
      const errorResult: ExecutionResult = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to call function',
      };
      setResult(errorResult);
      toast({ title: 'Error', description: errorResult.error, variant: 'destructive' });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopy = async (content: any) => {
    await navigator.clipboard.writeText(typeof content === 'string' ? content : JSON.stringify(content, null, 2));
    toast({ title: 'Copied', description: 'Result copied to clipboard' });
  };

  const explorerUrl = contractAddress
    ? `https://explorer.hiro.so/address/${contractAddress}?chain=testnet`
    : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{method.name}</span>
            <Badge variant="outline" className={cn(
              "text-xs",
              isReadOnly
                ? "bg-green-500/10 text-green-500 border-green-500/30"
                : "bg-orange-500/10 text-orange-500 border-orange-500/30"
            )}>
              {isReadOnly ? 'read-only' : 'public'}
            </Badge>
          </DialogTitle>
          <DialogDescription asChild>
            <div className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 bg-muted rounded mt-1">
              <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <span className="truncate flex-1">{contractAddress}</span>
              {explorerUrl && (
                <a href={explorerUrl} target="_blank" rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-5 py-2">
            {/* Signature */}
            <div className="space-y-1.5">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                Signature
              </h4>
              <div className="p-3 bg-muted rounded-lg">
                <ABIMethodSignature method={method} />
              </div>
            </div>

            {/* Public function notice */}
            {!isReadOnly && (
              <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20 text-xs text-muted-foreground">
                Public functions submit a transaction to the Stacks testnet. Execution uses the shared deployer wallet.
              </div>
            )}

            {/* Inputs */}
            {method.inputs && method.inputs.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Parameters</h4>
                {method.inputs.map((input, index) => (
                  <div key={index} className="space-y-1.5">
                    <label className="text-sm flex items-center gap-2">
                      <span className="font-medium">{input.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">{input.type}</span>
                      <Info className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
                    </label>
                    <Input
                      value={inputs[input.name] || ''}
                      onChange={(e) => handleInputChange(input.name, e.target.value)}
                      placeholder={`Enter ${input.type}`}
                      className="font-mono text-sm"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  Result
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn(
                      "text-xs",
                      result.status === 'success' && "bg-green-500/10 text-green-500",
                      result.status === 'error' && "bg-red-500/10 text-red-500",
                      result.status === 'pending' && "bg-yellow-500/10 text-yellow-500"
                    )}>
                      {result.status}
                    </Badge>
                    {result.status === 'pending' && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                  </div>

                  {result.status === 'success' && result.result !== undefined && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Return value</span>
                        <Button variant="ghost" size="sm" className="h-6 gap-1" onClick={() => handleCopy(result.result)}>
                          <Copy className="h-3 w-3" />
                          <span className="text-xs">Copy</span>
                        </Button>
                      </div>
                      <pre className="p-3 bg-muted rounded-lg font-mono text-xs whitespace-pre-wrap break-all">
                        {typeof result.result === 'string' ? result.result : JSON.stringify(result.result, null, 2)}
                      </pre>
                    </div>
                  )}

                  {result.status === 'success' && result.txId && (
                    <div className="space-y-2">
                      {/* TX confirmation status */}
                      <div className={cn(
                        "flex items-center gap-2 p-3 rounded-lg text-xs border",
                        txStatus === 'success' && "bg-green-500/5 border-green-500/20 text-green-600",
                        txStatus === 'pending' && "bg-yellow-500/5 border-yellow-500/20 text-yellow-600",
                        (txStatus === 'abort_by_response' || txStatus === 'abort_by_post_condition') && "bg-red-500/5 border-red-500/20 text-red-600",
                        !txStatus && "bg-muted border-border text-muted-foreground",
                      )}>
                        {txStatus === 'success' && <CheckCircle2 className="h-4 w-4 flex-shrink-0" />}
                        {txStatus === 'pending' && <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />}
                        {(txStatus === 'abort_by_response' || txStatus === 'abort_by_post_condition') && <XCircle className="h-4 w-4 flex-shrink-0" />}
                        {!txStatus && <Clock className="h-4 w-4 flex-shrink-0" />}
                        <span className="font-medium">
                          {txStatus === 'success' && 'Confirmed — state change is now on-chain'}
                          {txStatus === 'pending' && 'Pending — waiting for next Stacks block (~10s)'}
                          {txStatus === 'abort_by_response' && 'Aborted — contract returned an error'}
                          {txStatus === 'abort_by_post_condition' && 'Aborted — post-condition failed'}
                          {!txStatus && 'Transaction broadcast'}
                        </span>
                      </div>

                      {/* TX ID */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Transaction ID</span>
                          <Button variant="ghost" size="sm" className="h-6 gap-1" onClick={() => handleCopy(result.txId)}>
                            <Copy className="h-3 w-3" />
                            <span className="text-xs">Copy</span>
                          </Button>
                        </div>
                        <div className="p-2.5 bg-muted rounded-lg font-mono text-xs break-all">
                          {result.txId}
                        </div>
                      </div>

                      {result.explorerUrl && (
                        <a
                          href={result.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View on Hiro Explorer
                        </a>
                      )}
                    </div>
                  )}

                  {result.status === 'error' && result.error && (
                    <p className="text-xs text-red-500 p-3 bg-red-500/5 rounded-lg border border-red-500/20">
                      {result.error}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={isExecuting} onClick={handleExecute} className="gap-2">
            {isExecuting
              ? <><Loader2 className="h-4 w-4 animate-spin" /> {isReadOnly ? 'Calling...' : 'Submitting...'}</>
              : <><PlayCircle className="h-4 w-4" /> {isReadOnly ? 'Call' : 'Submit'}</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
