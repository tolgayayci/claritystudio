import {
  Sparkles,
  Github,
  ExternalLink,
  BookOpen,
  MessageSquare,
  GraduationCap,
  Code2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FOOTER_LINKS = {
  resources: [
    {
      label: "Stacks Docs",
      href: "https://docs.stacks.co",
      external: true,
    },
    {
      label: "Clarity Book",
      href: "https://book.clarity-lang.org",
      external: true,
    },
    {
      label: "Stacks API Reference",
      href: "https://docs.hiro.so/stacks/api",
      external: true,
    },
    {
      label: "Stacks Discord",
      href: "https://discord.gg/stacks",
      external: true,
    },
    {
      label: "GitHub",
      href: "https://github.com/tolgayayci/claritystudio",
      external: true,
    },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Use", href: "#" },
  ],
};

const LEARNING_RESOURCES = [
  {
    icon: GraduationCap,
    title: "Clarity Tutorials",
    description: "Step-by-step guides for beginners",
    href: "https://docs.stacks.co/clarity/tutorials",
  },
  {
    icon: Code2,
    title: "Code Examples",
    description: "Real-world Clarity contract examples",
    href: "https://book.clarity-lang.org",
  },
  {
    icon: Users,
    title: "Community Support",
    description: "Get help from Stacks developers",
    href: "https://discord.gg/stacks",
  },
];

export function Footer() {
  return (
    <footer className="border-t mb-8 pt-16">
      <div className="container mx-auto">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950">
                <Sparkles className="h-5 w-5 text-orange-500 dark:text-orange-400" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Clarity Studio
                </span>
              </div>
            </div>
            <p className="text-muted-foreground mb-6 max-w-sm">
              The fastest way to write, validate, and deploy Clarity smart contracts on Stacks.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a
                  href="https://github.com/tolgayayci/claritystudio"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4" />
                  Open Source
                </a>
              </Button>
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a
                  href="https://book.clarity-lang.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <BookOpen className="h-4 w-4" />
                  Clarity Book
                </a>
              </Button>
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a
                  href="https://docs.stacks.co"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  Stacks Docs
                </a>
              </Button>
            </div>
          </div>

          {/* Resources Column */}
          <div className="lg:col-span-1">
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                  >
                    {link.label}
                    {link.external && <ExternalLink className="h-3 w-3" />}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Learning Resources Column */}
          <div className="lg:col-span-1">
            <h4 className="font-semibold mb-4">Learning Resources</h4>
            <div className="space-y-4">
              {LEARNING_RESOURCES.map((resource, index) => (
                <a
                  key={index}
                  href={resource.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 p-3 rounded-lg border bg-muted/20 hover:border-primary/50 transition-all cursor-pointer block"
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <resource.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium group-hover:text-primary transition-colors">
                      {resource.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {resource.description}
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; 2026 Clarity Studio. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {FOOTER_LINKS.legal.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
