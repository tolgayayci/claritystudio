import { Rocket, Globe, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Deployment } from '@/lib/types';
import { getExplorerAccountUrl } from '@/lib/config';

interface DeploymentInfoBarProps {
  deployment: Deployment;
  onVerifyClick?: () => void;
}

export function DeploymentInfoBar({
  deployment,
}: DeploymentInfoBarProps) {
  // Get deployer account from metadata
  const deployerAccount = deployment.metadata?.wallet_address || deployment.metadata?.deployer_account;

  const explorerUrl = getExplorerAccountUrl(deployment.contract_address);
  const deployerExplorerUrl = deployerAccount ? getExplorerAccountUrl(deployerAccount) : null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground">Deployed by:</span>

      {/* Deployer Account Badge */}
      {deployerAccount ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={deployerExplorerUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <Badge
                  variant="secondary"
                  className="gap-1.5 bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/15 border-green-500/20 cursor-pointer font-mono text-xs"
                >
                  <Rocket className="h-3 w-3" />
                  {deployerAccount}
                  <ExternalLink className="h-3 w-3" />
                </Badge>
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>View deployer account on Hiro Explorer</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="secondary"
                className="gap-1.5 bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/15 border-green-500/20"
              >
                <Rocket className="h-3 w-3" />
                Clarity Studio Wallet
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Contract deployed using Clarity Studio</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Network Badge */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Badge
                variant="secondary"
                className="gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/15 border-blue-500/20 cursor-pointer"
              >
                <Globe className="h-3 w-3" />
                Testnet
                <ExternalLink className="h-3 w-3" />
              </Badge>
            </a>
          </TooltipTrigger>
          <TooltipContent>
            <p>View contract on Hiro Explorer</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

    </div>
  );
}
