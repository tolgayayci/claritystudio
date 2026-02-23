import { ValidationResult } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal, Loader2, AlertCircle, AlertTriangle, CheckCircle, Blocks, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ValidationConsoleProps {
  result?: ValidationResult | null;
  isChecking?: boolean;
}

export function ValidationConsole({ result, isChecking }: ValidationConsoleProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    if (!result) return;
    const lines = [
      result.success ? '✓ Validation passed' : '✗ Validation failed',
      ...result.errors.map(e => `ERROR${e.line ? ` (line ${e.line})` : ''}: ${e.message}`),
      ...result.warnings.map(w => `WARNING: ${w}`),
    ].join('\n');
    try {
      await navigator.clipboard.writeText(lines);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Copied', description: 'Console output copied to clipboard' });
    } catch {
      toast({ title: 'Error', description: 'Failed to copy', variant: 'destructive' });
    }
  };

  if (!result && !isChecking) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/40 rounded-md border">
        <div className="text-center">
          <div className="inline-flex p-3 bg-primary/10 rounded-lg mb-4">
            <Blocks className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <h3 className="font-medium text-sm mb-1">Ready to Check</h3>
          <p className="text-xs text-muted-foreground">Click Check to validate your Clarity contract</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background border rounded-md overflow-hidden">
      {/* Status bar */}
      <div className="flex-none flex items-center justify-between px-3 py-1.5 border-b bg-muted/40">
        <div className="flex items-center gap-2">
          {isChecking ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
              <span className="text-xs font-medium text-yellow-500">Checking...</span>
            </>
          ) : result && (
            <>
              <div className={cn("w-1.5 h-1.5 rounded-full", result.success ? "bg-green-500" : "bg-red-500")} />
              <span className={cn("text-xs font-medium", result.success ? "text-green-500" : "text-red-500")}>
                {result.success ? "Validation passed" : "Validation failed"}
              </span>
              {!result.success && (
                <span className="text-xs text-muted-foreground">
                  — {result.errors.length} error{result.errors.length !== 1 ? 's' : ''}
                  {result.warnings.length > 0 ? `, ${result.warnings.length} warning${result.warnings.length !== 1 ? 's' : ''}` : ''}
                </span>
              )}
            </>
          )}
        </div>
        {result && (
          <Button variant="ghost" size="sm" className="h-6 gap-1.5" onClick={handleCopy}>
            {copied ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            <span className="text-xs">{copied ? 'Copied!' : 'Copy'}</span>
          </Button>
        )}
      </div>

      {/* Output header */}
      <div className="flex-none flex items-center gap-2 px-4 py-2 border-b bg-muted/20">
        <div className="p-1.5 rounded-md bg-primary/10">
          <Terminal className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-sm font-medium">Console Output</h3>
      </div>

      {/* Output content */}
      <ScrollArea className="flex-1 h-full">
        <div className="p-4 font-mono text-xs space-y-1">
          {isChecking ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Checking contract syntax...</span>
            </div>
          ) : result ? (
            <>
              {result.success && result.errors.length === 0 && result.warnings.length === 0 && (
                <div className="flex items-start gap-2 py-0.5 px-1 rounded bg-green-500/5">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-none" />
                  <pre className="text-green-500/90 whitespace-pre-wrap">Contract is valid — no errors found</pre>
                </div>
              )}

              {result.errors.map((error, i) => (
                <div key={i} className="flex items-start gap-2 py-0.5 px-1 rounded bg-red-500/5">
                  <AlertCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-none" />
                  <pre className="text-red-500/90 whitespace-pre-wrap break-all">
                    {error.line ? `Line ${error.line}${error.column ? `:${error.column}` : ''} — ` : ''}{error.message}
                  </pre>
                </div>
              ))}

              {result.warnings.map((warning, i) => (
                <div key={i} className="flex items-start gap-2 py-0.5 px-1 rounded bg-yellow-500/5">
                  <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 mt-0.5 flex-none" />
                  <pre className="text-yellow-500/90 whitespace-pre-wrap break-all">{warning}</pre>
                </div>
              ))}
            </>
          ) : null}
        </div>
      </ScrollArea>
    </div>
  );
}
