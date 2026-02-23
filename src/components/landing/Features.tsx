import { motion } from 'framer-motion';
import {
  Rocket,
  Code2,
  Terminal,
  Network,
  Share2,
  Zap,
  Blocks,
  PlayCircle,
  ArrowRight,
  Plus,
  FileCode2,
  GitBranch,
  Shield,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const FEATURES = [
  {
    icon: Shield,
    title: 'Decidable Language',
    description: 'Clarity guarantees program termination, eliminating entire classes of vulnerabilities.',
    color: 'from-emerald-500/20 via-transparent to-transparent',
    preview: (
      <div className="relative overflow-hidden rounded-lg border bg-muted h-[200px]">
        <div className="flex items-center justify-between px-4 py-2 border-b bg-background/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4" />
            Safety Guarantees
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs text-green-600 font-medium">No infinite loops</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs text-green-600 font-medium">No reentrancy attacks</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs text-green-600 font-medium">Predictable execution costs</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Blocks,
    title: 'Bitcoin Security',
    description: 'Smart contracts anchored to Bitcoin\'s proof-of-work through Proof of Transfer.',
    color: 'from-orange-500/20 via-transparent to-transparent',
    preview: (
      <div className="relative overflow-hidden rounded-lg border bg-muted h-[200px]">
        <div className="flex items-center justify-between px-4 py-2 border-b bg-background/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Blocks className="h-4 w-4" />
            Proof of Transfer
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-background/50 border">
              <div className="text-xs font-medium mb-1">Bitcoin Layer</div>
              <div className="text-[10px] text-muted-foreground">Settlement & security</div>
            </div>
            <div className="flex justify-center">
              <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
            </div>
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="text-xs font-medium mb-1">Stacks Layer</div>
              <div className="text-[10px] text-muted-foreground">Smart contracts & DApps</div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Eye,
    title: 'Interpreted On-Chain',
    description: 'Source code published and executed as-is — fully auditable and transparent.',
    color: 'from-blue-500/20 via-transparent to-transparent',
    preview: (
      <div className="relative overflow-hidden rounded-lg border bg-muted h-[200px]">
        <div className="flex items-center justify-between px-4 py-2 border-b bg-background/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Eye className="h-4 w-4" />
            On-Chain Source
          </div>
        </div>
        <div className="p-4 font-mono text-xs space-y-1">
          <div className="text-purple-500">(define-public (increment)</div>
          <div className="pl-4 text-blue-500">(let ((current (var-get counter)))</div>
          <div className="pl-8 text-green-500">(var-set counter</div>
          <div className="pl-12 text-green-500">(+ current u1))</div>
          <div className="pl-4 text-blue-500">(ok (var-get counter))))</div>
          <div className="mt-3 p-2 rounded bg-green-500/10 border border-green-500/20">
            <span className="text-[10px] text-green-600">Source verified on-chain</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Rocket,
    title: 'Instant Deployment',
    description: 'Deploy to Stacks testnet with a built-in pre-funded wallet in seconds.',
    color: 'from-red-500/20 via-transparent to-transparent',
    preview: (
      <div className="relative overflow-hidden rounded-lg border bg-muted h-[200px]">
        <div className="flex items-center justify-between px-4 py-2 border-b bg-background/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Rocket className="h-4 w-4" />
            Deploy
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between p-2 rounded-lg bg-background/50 border">
            <span className="text-xs">Network</span>
            <Badge variant="outline" className="text-[10px]">Stacks Testnet</Badge>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-background/50 border">
            <span className="text-xs">Wallet</span>
            <span className="text-[10px] font-mono text-muted-foreground">ST1PQHQ...3R</span>
          </div>
          <Button size="sm" className="w-full h-8 gap-1.5">
            <Rocket className="h-4 w-4" />
            Deploy to Testnet
          </Button>
        </div>
      </div>
    ),
  },
  {
    icon: PlayCircle,
    title: 'Auto-Generated Interface',
    description: 'Interact with any deployed contract through an auto-generated UI.',
    color: 'from-purple-500/20 via-transparent to-transparent',
    preview: (
      <div className="relative overflow-hidden rounded-lg border bg-muted h-[200px]">
        <div className="flex items-center justify-between px-4 py-2 border-b bg-background/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <PlayCircle className="h-4 w-4" />
            Contract Interface
          </div>
        </div>
        <div className="p-4 space-y-2">
          {[
            { name: 'increment', type: 'public', color: 'text-blue-500 bg-blue-500/10' },
            { name: 'get-count', type: 'read-only', color: 'text-green-500 bg-green-500/10' },
            { name: 'reset', type: 'public', color: 'text-orange-500 bg-orange-500/10' },
          ].map((fn, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-background/50 border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">{fn.name}</span>
              </div>
              <Badge variant="outline" className={cn("text-[10px]", fn.color)}>{fn.type}</Badge>
            </div>
          ))}
          <div className="mt-1 p-2 rounded bg-green-500/10 border border-green-500/20">
            <span className="text-[10px] text-green-600">Result: (ok u42)</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Share2,
    title: 'No Reentrancy',
    description: 'Structurally impossible reentrancy attacks — safe by design, not by convention.',
    color: 'from-pink-500/20 via-transparent to-transparent',
    preview: (
      <div className="relative overflow-hidden rounded-lg border bg-muted h-[200px]">
        <div className="flex items-center justify-between px-4 py-2 border-b bg-background/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4" />
            Security Model
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-xs font-medium text-red-600">Solidity (vulnerable)</span>
            </div>
            <div className="text-[10px] text-red-500 font-mono">withdraw() -&gt; callback -&gt; withdraw()</div>
          </div>
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-xs font-medium text-green-600">Clarity (safe)</span>
            </div>
            <div className="text-[10px] text-green-500 font-mono">Reentrancy structurally impossible</div>
          </div>
        </div>
      </div>
    ),
  },
];

export function Features() {
  return (
    <section id="features" className="container mx-auto py-24 lg:py-32">
      <motion.div
        className="text-center max-w-2xl mx-auto mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-bold tracking-tight mb-4">
          Everything You Need to Build on Stacks
        </h2>
        <p className="text-lg text-muted-foreground">
          A complete development environment for Clarity smart contracts,
          right in your browser.
        </p>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-2">
        {FEATURES.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            className="group relative"
          >
            <motion.div
              className={cn(
                "absolute inset-0 bg-gradient-to-br rounded-lg",
                feature.color
              )}
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 0.2 }}
              transition={{ duration: 0.2 }}
            />

            <div className="relative border rounded-lg bg-background/50 backdrop-blur-sm">
              {/* Header */}
              <div className="p-6 border-b">
                <div className="flex items-center gap-4">
                  <motion.div
                    className="flex-none p-3 rounded-lg bg-primary/10"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <feature.icon className="h-6 w-6 text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="p-6">
                {feature.preview}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
