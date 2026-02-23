import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  RocketIcon,
  CheckCircle,
  Loader2,
  ExternalLink,
  Copy,
  AlertCircle,
  PlayCircle,
  Globe,
  Server,
} from 'lucide-react';
import { deployContract } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/App';
import { supabase } from '@/lib/supabase';
import { getExplorerTxUrl } from '@/lib/config';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

interface DeployDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  code: string;
  initialContractName: string;
  onDeploySuccess?: () => void;
}

export function DeployDialog({
  open,
  onOpenChange,
  projectId,
  code,
  initialContractName,
  onDeploySuccess,
}: DeployDialogProps) {
  const [contractName, setContractName] = useState(initialContractName);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployerAddress, setDeployerAddress] = useState<string>('');
  const [deployResult, setDeployResult] = useState<{ txId: string; contractAddress: string; explorerUrl: string } | null>(null);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Reset state when dialog opens, append unique suffix to avoid ContractAlreadyExists
  useEffect(() => {
    if (open) {
      const suffix = Math.random().toString(36).slice(2, 6);
      setContractName(`${initialContractName}-${suffix}`);
      setDeployResult(null);
      setDeployError(null);
      setIsDeploying(false);
    }
  }, [open, initialContractName]);

  // Fetch deployer wallet info
  useEffect(() => {
    if (!open) return;
    fetch(`${API_URL}/wallet/info`)
      .then(r => r.json())
      .then(d => { if (d.address) setDeployerAddress(d.address); })
      .catch(() => {});
  }, [open]);

  const handleDeploy = async () => {
    if (!user || !contractName.trim()) return;
    setIsDeploying(true);
    setDeployError(null);
    try {
      const result = await deployContract({ code, contractName: contractName.trim() });

      setDeployResult({ txId: result.txId, contractAddress: result.contractAddress, explorerUrl: result.explorerUrl });

      await supabase.from('deployments').insert({
        project_id: projectId,
        user_id: user.id,
        contract_address: result.contractAddress,
        contract_name: contractName.trim(),
        tx_id: result.txId,
        network: 'stacks-testnet',
        abi: {},
        metadata: { explorer_url: result.explorerUrl, network: 'testnet', wallet_type: 'playground' },
      });

      onDeploySuccess?.();
      toast({ title: 'Success', description: 'Contract deployed to Stacks testnet' });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Deployment failed';
      setDeployError(msg);
      toast({ title: 'Deployment Failed', description: msg, variant: 'destructive' });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast({ title: 'Copied', description: `${field === 'address' ? 'Contract address' : 'Transaction ID'} copied` });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isDeploying) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[680px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RocketIcon className="h-4 w-4" />
            Deploy Contract
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(85vh-140px)]">
          <div className="space-y-4 py-2 pr-1">

            {/* Network info */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/10 rounded-md">
                  <Globe className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Stacks Testnet</div>
                  <div className="text-xs text-muted-foreground">api.testnet.hiro.so</div>
                </div>
                <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-500 border-blue-500/30">testnet</Badge>
              </div>

              <div className="border-t" />

              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-500/10 rounded-md">
                  <Server className="h-4 w-4 text-purple-500" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Shared Deployer Wallet</div>
                  {deployerAddress ? (
                    <div className="text-xs font-mono text-muted-foreground mt-0.5">{deployerAddress}</div>
                  ) : (
                    <div className="text-xs text-muted-foreground">Loading...</div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t" />

            {/* Contract name input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Contract Name</label>
              <Input
                value={contractName}
                onChange={(e) => setContractName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                placeholder="my-contract"
                className="font-mono"
                disabled={isDeploying || !!deployResult}
              />
              <p className="text-xs text-muted-foreground">Lowercase letters, numbers, and hyphens only</p>
            </div>

            {/* Deploying state */}
            {isDeploying && (
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <div>
                  <p className="text-sm font-medium">Deploying to Stacks Testnet...</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Broadcasting transaction, this may take a few seconds</p>
                </div>
              </div>
            )}

            {/* Deploy error */}
            {deployError && (
              <div className="flex items-start gap-2 p-3 rounded-lg border border-red-500/50 bg-red-500/5">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-none" />
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Deployment Failed</p>
                  <p className="text-xs text-muted-foreground mt-1">{deployError}</p>
                </div>
              </div>
            )}

            {/* Deploy success */}
            {deployResult && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-lg border border-green-500/50 bg-green-500/5">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Deployment Submitted</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Transaction broadcast to Stacks testnet</p>
                  </div>
                </div>

                <div className="space-y-3 border rounded-lg p-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Contract Address</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 font-mono text-xs bg-muted/50 px-3 py-2 rounded border truncate">
                        {deployResult.contractAddress}
                      </code>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"
                        onClick={() => handleCopy(deployResult.contractAddress, 'address')}>
                        {copiedField === 'address'
                          ? <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                          : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"
                        onClick={() => window.open(`https://explorer.hiro.so/address/${deployResult.contractAddress}?chain=testnet`, '_blank')}>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Transaction ID</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 font-mono text-xs bg-muted/50 px-3 py-2 rounded border truncate">
                        {deployResult.txId}
                      </code>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"
                        onClick={() => handleCopy(deployResult.txId, 'tx')}>
                        {copiedField === 'tx'
                          ? <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                          : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"
                        onClick={() => window.open(deployResult.explorerUrl || getExplorerTxUrl(deployResult.txId), '_blank')}>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          {deployResult ? (
            <Button variant="outline" onClick={() => onOpenChange(false)} className="gap-2">
              <PlayCircle className="h-4 w-4" />
              View Contract Interface
            </Button>
          ) : deployError ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleDeploy} className="gap-2">
                <RocketIcon className="h-4 w-4" />
                Try Again
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeploying}>
                Cancel
              </Button>
              <Button onClick={handleDeploy} disabled={isDeploying || !contractName.trim()} className="gap-2">
                {isDeploying
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Deploying...</>
                  : <><RocketIcon className="h-4 w-4" /> Deploy</>}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
