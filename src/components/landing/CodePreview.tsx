import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const CODE_SNIPPETS = [
  {
    title: 'Digital Counter',
    description: 'A simple smart contract that counts. Increment, decrement, and check the current value!',
    explanation: [
      'Think of this like a shared counter anyone can use',
      'You can increment or read the current value',
      'Results are wrapped in Clarity response types',
      'Perfect for learning how Clarity contracts work',
    ],
    code: `;; A simple counter contract
(define-data-var counter uint u0)

;; Read the current count
(define-read-only (get-count)
  (ok (var-get counter)))

;; Increment the counter by 1
(define-public (increment)
  (begin
    (var-set counter (+ (var-get counter) u1))
    (ok (var-get counter))))

;; Reset the counter to zero
(define-public (reset)
  (begin
    (var-set counter u0)
    (ok true)))`
  },
  {
    title: 'Simple SIP-010 Token',
    description: 'Create your own fungible token on Stacks following the SIP-010 standard.',
    explanation: [
      'Implements the standard fungible token trait',
      'Mint, transfer, and check balances',
      'Uses Clarity built-in ft functions',
      'Great for building DeFi applications',
    ],
    code: `;; A simple fungible token
(define-fungible-token clarity-token)

;; Get token balance
(define-read-only (get-balance (account principal))
  (ok (ft-get-balance clarity-token account)))

;; Transfer tokens
(define-public (transfer
    (amount uint)
    (sender principal)
    (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) (err u1))
    (ft-transfer? clarity-token amount
      sender recipient)))

;; Mint tokens (owner only)
(define-public (mint (amount uint) (to principal))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) (err u2))
    (ft-mint? clarity-token amount to)))`
  }
];

interface CodePreviewProps {
  className?: string;
}

export function CodePreview({ className }: CodePreviewProps) {
  return (
    <div className={cn("grid gap-8 lg:grid-cols-2", className)}>
      {CODE_SNIPPETS.map((snippet, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.2 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold">{snippet.title}</h3>
            <p className="text-muted-foreground">{snippet.description}</p>
            <div className="space-y-3">
              {snippet.explanation.map((point, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 text-primary flex-none" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-lg border bg-muted">
            <div className="flex items-center justify-between border-b p-4">
              <h4 className="font-mono text-sm">Example Code</h4>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <div className="h-2 w-2 rounded-full bg-green-500" />
              </div>
            </div>
            <pre className="p-4 text-sm font-mono overflow-x-auto">
              <code>{snippet.code}</code>
            </pre>
          </div>

          <Button variant="outline" className="w-full">Try This Example</Button>
        </motion.div>
      ))}
    </div>
  );
}
