import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Code2,
  Sparkles,
  ArrowRight,
  AlertCircle,
  FileCode,
  Terminal,
  Braces,
  Plus,
  FileCode2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  name: z.string()
    .min(1, "Project name is required")
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens are allowed"),
  description: z.string().max(200).optional(),
});

// Combined template type for both local and database templates
export interface CombinedTemplate {
  id?: string;
  name: string;
  description: string;
  icon: any;
  code?: string;
  category: string;
  difficulty: string;
  isOfficial?: boolean;
}

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject: (data: {
    name: string;
    description: string;
    template?: CombinedTemplate;
    officialTemplateId?: string;
  }) => void;
}

const CLARITY_TEMPLATES: CombinedTemplate[] = [
  {
    name: 'Counter',
    description: 'A simple counter contract demonstrating state management with Clarity data variables and public functions.',
    icon: Code2,
    code: `;; Counter Contract
(define-data-var counter uint u0)

(define-public (increment)
  (begin
    (var-set counter (+ (var-get counter) u1))
    (ok (var-get counter))))

(define-public (decrement)
  (begin
    (var-set counter (- (var-get counter) u1))
    (ok (var-get counter))))

(define-read-only (get-counter)
  (ok (var-get counter)))`,
    category: 'Basic',
    difficulty: 'Beginner',
  },
  {
    name: 'Hello World',
    description: 'A minimal Clarity contract that stores and retrieves a greeting message. Great starting point for learning.',
    icon: Code2,
    code: `;; Hello World Contract
(define-data-var greeting (string-utf8 100) u"Hello, Stacks!")

(define-public (set-greeting (new-greeting (string-utf8 100)))
  (begin
    (var-set greeting new-greeting)
    (ok true)))

(define-read-only (get-greeting)
  (ok (var-get greeting)))`,
    category: 'Basic',
    difficulty: 'Beginner',
  },
  {
    name: 'SIP-010 Fungible Token',
    description: 'A fungible token contract following the SIP-010 standard. Implements minting, transferring, and balance queries.',
    icon: Code2,
    code: `;; SIP-010 Fungible Token
(impl-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

(define-fungible-token my-token)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-token-owner)
    (try! (ft-transfer? my-token amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)))

(define-read-only (get-name)
  (ok "My Token"))

(define-read-only (get-symbol)
  (ok "MYT"))

(define-read-only (get-decimals)
  (ok u6))

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance my-token who)))

(define-read-only (get-total-supply)
  (ok (ft-get-supply my-token)))

(define-read-only (get-token-uri)
  (ok none))

(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ft-mint? my-token amount recipient)))`,
    category: 'Token',
    difficulty: 'Intermediate',
  },
  {
    name: 'NFT Collection',
    description: 'A non-fungible token contract following the SIP-009 standard. Supports minting and ownership tracking.',
    icon: Code2,
    code: `;; SIP-009 NFT Contract
(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

(define-non-fungible-token my-nft uint)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))
(define-constant err-token-not-found (err u102))

(define-data-var last-token-id uint u0)

(define-read-only (get-last-token-id)
  (ok (var-get last-token-id)))

(define-read-only (get-token-uri (token-id uint))
  (ok none))

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? my-nft token-id)))

(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-token-owner)
    (nft-transfer? my-nft token-id sender recipient)))

(define-public (mint (recipient principal))
  (let ((next-id (+ (var-get last-token-id) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (try! (nft-mint? my-nft next-id recipient))
    (var-set last-token-id next-id)
    (ok next-id)))`,
    category: 'Token',
    difficulty: 'Intermediate',
  },
];

export function NewProjectDialog({
  open,
  onOpenChange,
  onCreateProject,
}: NewProjectDialogProps) {
  const [activeTab, setActiveTab] = useState<'blank' | 'template'>('blank');
  const [selectedTemplate, setSelectedTemplate] = useState<CombinedTemplate | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
      setSelectedTemplate(null);
      setActiveTab('blank');
    }
  }, [open, form]);

  // Auto-fill form when template is selected
  useEffect(() => {
    if (selectedTemplate) {
      form.setValue('name', selectedTemplate.name.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
      form.setValue('description', selectedTemplate.description);
    }
  }, [selectedTemplate, form]);

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    onCreateProject({
      name: data.name.trim(),
      description: data.description?.trim() || '',
      template: selectedTemplate || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Create a New Project</DialogTitle>
              <DialogDescription className="mt-1.5">
                Get started by choosing a template or create from scratch
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'blank' | 'template')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="blank" className="gap-2">
              <FileCode className="h-4 w-4" />
              Blank Project
            </TabsTrigger>
            <TabsTrigger value="template" className="gap-2">
              <Braces className="h-4 w-4" />
              Use Template
            </TabsTrigger>
          </TabsList>

          <TabsContent value="blank">
            <div className="space-y-6">
              {/* Project Info Card */}
              <div className="p-6 border rounded-lg bg-muted/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-md bg-primary/10">
                    <FileCode2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Blank Project</div>
                    <div className="text-sm text-muted-foreground">
                      Create a new Clarity smart contract from scratch
                    </div>
                  </div>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Terminal className="h-4 w-4" />
                              Project Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="my-clarity-project"
                                {...field}
                                className="font-mono"
                              />
                            </FormControl>
                            <FormDescription>
                              Only lowercase letters, numbers, and hyphens are allowed
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Code2 className="h-4 w-4" />
                              Description (Optional)
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="A brief description of your project"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Project
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>

              {/* Quick Tips */}
              <div className="p-4 rounded-lg border bg-blue-500/5 border-blue-500/20">
                <div className="flex items-center gap-2 text-sm text-blue-500 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Quick Tips</span>
                </div>
                <ul className="space-y-1 text-sm text-blue-500/80">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3.5 w-3.5" />
                    Use descriptive names for better organization
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3.5 w-3.5" />
                    Blank projects start with a Counter contract template
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="template">
            <div className="space-y-6">
              {/* Template Selection */}
              <div className="border rounded-lg overflow-hidden">
                <ScrollArea className="h-[400px]">
                  <div className="divide-y">
                    {CLARITY_TEMPLATES.map((template, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedTemplate(template)}
                        className={cn(
                          "p-4 flex items-center gap-4 transition-colors cursor-pointer hover:bg-accent",
                          selectedTemplate?.name === template.name && "bg-accent"
                        )}
                      >
                        <div className="flex-none p-3 rounded-lg bg-primary/10">
                          <template.icon className="h-5 w-5 text-primary" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-medium">{template.name}</h3>
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                              {template.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-xs px-1.5 py-0">
                              {template.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {template.description}
                          </p>
                        </div>

                        <ArrowRight className={cn(
                          "flex-none h-4 w-4 text-muted-foreground transition-opacity",
                          selectedTemplate?.name === template.name ? "opacity-100" : "opacity-0"
                        )} />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Project Details */}
              {selectedTemplate && (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Terminal className="h-4 w-4" />
                              Project Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="font-mono"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Code2 className="h-4 w-4" />
                              Description (Optional)
                            </FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="gap-2">
                        <Sparkles className="h-4 w-4" />
                        Create from Template
                      </Button>
                    </div>
                  </form>
                </Form>
              )}

              {/* Template Selection Prompt */}
              {!selectedTemplate && (
                <div className="flex items-center gap-2 p-4 text-sm bg-muted/50 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Select a template to continue</span>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
