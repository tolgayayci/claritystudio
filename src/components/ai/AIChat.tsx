import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Bot,
  Send,
  Trash2,
  Copy,
  Check,
  Loader2,
  Sparkles,
  User,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_URL } from '@/lib/config';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  error?: boolean;
}

const SUGGESTED_PROMPTS = [
  'How do I define a map in Clarity?',
  'What is tx-sender vs contract-caller?',
  'How do post-conditions work?',
  'Show me a SIP-010 fungible token example',
  'How do I handle errors in Clarity?',
];

// Markdown renderer — handles code blocks, headers, lists, inline code, bold, italic
function MarkdownContent({ text }: { text: string }) {
  const [copied, setCopied] = useState<number | null>(null);

  const handleCopy = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopied(idx);
    setTimeout(() => setCopied(null), 1500);
  };

  // Split on fenced code blocks first
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  const parts: Array<{ type: 'text' | 'code'; content: string; lang?: string }> = [];
  let lastIndex = 0;
  let match;
  let blockIndex = 0;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'code', content: match[2].trim(), lang: match[1] || 'clarity' });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }

  // Render inline markdown: bold, italic, inline code
  const renderInline = (raw: string, key: string) => {
    const inlineRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__)/g;
    const tokens = raw.split(inlineRegex);
    return (
      <span key={key}>
        {tokens.map((token, i) => {
          if (token.startsWith('`') && token.endsWith('`') && token.length > 2)
            return <code key={i} className="bg-muted px-1 py-0.5 rounded text-[11px] font-mono">{token.slice(1, -1)}</code>;
          if ((token.startsWith('**') && token.endsWith('**')) || (token.startsWith('__') && token.endsWith('__')))
            return <strong key={i}>{token.slice(2, -2)}</strong>;
          if (token.startsWith('*') && token.endsWith('*') && token.length > 2)
            return <em key={i}>{token.slice(1, -1)}</em>;
          return <span key={i}>{token}</span>;
        })}
      </span>
    );
  };

  // Render a block of text (not code), handling headers, lists, paragraphs
  const renderTextBlock = (raw: string, key: string) => {
    const lines = raw.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Skip empty lines
      if (!line.trim()) { i++; continue; }

      // Heading
      const h3 = line.match(/^###\s+(.*)/);
      const h2 = line.match(/^##\s+(.*)/);
      const h1 = line.match(/^#\s+(.*)/);
      if (h1) { elements.push(<p key={i} className="font-bold text-base mt-2">{renderInline(h1[1], `h${i}`)}</p>); i++; continue; }
      if (h2) { elements.push(<p key={i} className="font-semibold text-sm mt-2">{renderInline(h2[1], `h${i}`)}</p>); i++; continue; }
      if (h3) { elements.push(<p key={i} className="font-semibold text-xs mt-1.5 text-muted-foreground uppercase tracking-wide">{renderInline(h3[1], `h${i}`)}</p>); i++; continue; }

      // Unordered list — collect consecutive bullet lines
      if (/^[-*+]\s/.test(line)) {
        const items: string[] = [];
        while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
          items.push(lines[i].replace(/^[-*+]\s+/, ''));
          i++;
        }
        elements.push(
          <ul key={`ul-${i}`} className="space-y-0.5 ml-3 list-none">
            {items.map((item, j) => (
              <li key={j} className="flex gap-1.5 items-start">
                <span className="text-primary mt-0.5 flex-shrink-0">•</span>
                <span>{renderInline(item, `li${j}`)}</span>
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // Ordered list
      if (/^\d+\.\s/.test(line)) {
        const items: string[] = [];
        let n = 1;
        while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
          items.push(lines[i].replace(/^\d+\.\s+/, ''));
          i++;
        }
        elements.push(
          <ol key={`ol-${i}`} className="space-y-0.5 ml-3 list-none">
            {items.map((item, j) => (
              <li key={j} className="flex gap-1.5 items-start">
                <span className="text-primary font-mono text-[10px] mt-0.5 flex-shrink-0 min-w-[14px]">{j + n}.</span>
                <span>{renderInline(item, `oli${j}`)}</span>
              </li>
            ))}
          </ol>
        );
        continue;
      }

      // Table — collect all pipe-rows including separator
      if (/^\|/.test(line)) {
        const rows: string[][] = [];
        while (i < lines.length && /^\|/.test(lines[i])) {
          const cells = lines[i].split('|').slice(1, -1).map(c => c.trim());
          // skip separator rows like |---|---|
          if (!cells.every(c => /^[-:]+$/.test(c))) rows.push(cells);
          i++;
        }
        if (rows.length > 0) {
          const [head, ...body] = rows;
          elements.push(
            <div key={`tbl-${i}`} className="overflow-x-auto my-1">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/40">
                    {head.map((cell, j) => (
                      <th key={j} className="px-3 py-1.5 text-left font-semibold text-foreground whitespace-nowrap">
                        {renderInline(cell, `th${j}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {body.map((row, ri) => (
                    <tr key={ri} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-3 py-1.5 text-muted-foreground align-top">
                          {renderInline(cell, `td${ri}-${ci}`)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        continue;
      }

      // Horizontal rule
      if (/^---+$/.test(line.trim())) {
        elements.push(<hr key={i} className="border-border/50 my-1" />);
        i++; continue;
      }

      // Regular paragraph line
      elements.push(<p key={i} className="leading-relaxed">{renderInline(line, `p${i}`)}</p>);
      i++;
    }

    return <div key={key} className="space-y-1">{elements}</div>;
  };

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {parts.map((part, idx) => {
        if (part.type === 'code') {
          blockIndex++;
          const bi = blockIndex;
          return (
            <div key={idx} className="relative group rounded-md overflow-hidden border border-border/50">
              <div className="flex items-center justify-between px-3 py-1 bg-muted/60 border-b border-border/50">
                <span className="text-[10px] text-muted-foreground font-mono">{part.lang || 'code'}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 opacity-60 hover:opacity-100"
                  onClick={() => handleCopy(part.content, bi)}
                >
                  {copied === bi ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
              <pre className="p-3 text-[11px] font-mono overflow-x-auto bg-muted/30 text-foreground">
                <code>{part.content}</code>
              </pre>
            </div>
          );
        }
        return renderTextBlock(part.content, String(idx));
      })}
    </div>
  );
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim() };
    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = { id: assistantId, role: 'assistant', content: '', isStreaming: true };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInput('');
    setIsStreaming(true);

    abortRef.current = new AbortController();

    try {
      const response = await fetch(`${API_URL}/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() }),
        signal: abortRef.current.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let sseBuffer = '';

      const updateAssistant = (updater: (prev: string) => string, opts?: { error?: boolean; done?: boolean }) => {
        setMessages(prev => prev.map(m =>
          m.id === assistantId
            ? { ...m, content: updater(m.content), isStreaming: !opts?.done, error: opts?.error }
            : m
        ));
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        sseBuffer += decoder.decode(value, { stream: true });
        const lines = sseBuffer.split('\n');
        sseBuffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === 'chunk') {
              updateAssistant(prev => prev + event.text);
            } else if (event.type === 'done') {
              updateAssistant(prev => prev, { done: true });
              setIsStreaming(false);
            } else if (event.type === 'error') {
              updateAssistant(() => event.text, { error: true, done: true });
              setIsStreaming(false);
            }
          } catch {
            // skip malformed events
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, isStreaming: false } : m
        ));
      } else {
        setMessages(prev => prev.map(m =>
          m.id === assistantId
            ? { ...m, content: err.message || 'Request failed', isStreaming: false, error: true }
            : m
        ));
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [isStreaming]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
  };

  const clearHistory = () => {
    if (isStreaming) handleStop();
    setMessages([]);
  };

  return (
    <div className="h-full flex flex-col bg-background border rounded-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-md">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Clarity · Stacks · Clarinet expert</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={clearHistory}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center gap-5 py-8 text-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-medium mb-1">Ask anything about Clarity</p>
                <p className="text-xs text-muted-foreground">Smart contracts · Stacks blockchain · Clarinet</p>
              </div>
              <div className="w-full space-y-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="w-full text-left text-xs px-3 py-2 rounded-lg border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn('flex gap-2.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {msg.role === 'assistant' && (
                  <div className={cn(
                    'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5',
                    msg.error ? 'bg-red-500/10' : 'bg-primary/10'
                  )}>
                    {msg.error
                      ? <AlertCircle className="h-4 w-4 text-red-500" />
                      : <Bot className="h-4 w-4 text-primary" />}
                  </div>
                )}

                <div className={cn(
                  'max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : msg.error
                      ? 'bg-red-500/5 border border-red-500/20 text-red-600 dark:text-red-400 rounded-tl-sm'
                      : 'bg-muted/60 border border-border/40 rounded-tl-sm'
                )}>
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : msg.content ? (
                    <MarkdownContent text={msg.content} />
                  ) : null}

                  {msg.isStreaming && (
                    <span className="inline-flex items-center gap-1 mt-1">
                      <span className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:300ms]" />
                    </span>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-muted border flex items-center justify-center mt-0.5">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="px-3 pb-3 pt-2 border-t bg-background flex-shrink-0">
        <div className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about Clarity, Stacks, Clarinet…"
            className="min-h-[40px] max-h-[120px] resize-none text-sm py-2.5 flex-1"
            rows={1}
            disabled={isStreaming}
          />
          {isStreaming ? (
            <Button size="sm" variant="outline" onClick={handleStop} className="h-10 px-3 flex-shrink-0">
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="h-10 px-3 flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 px-0.5">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
