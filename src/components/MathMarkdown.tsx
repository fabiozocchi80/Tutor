import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { cn } from '@/src/lib/utils';

interface MathMarkdownProps {
  content: string;
  className?: string;
}

export default function MathMarkdown({ content, className }: MathMarkdownProps) {
  return (
    <div className={cn("prose prose-lg max-w-none dark:prose-invert break-words font-serif", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed text-[#1A1A1A] text-xl">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
          li: ({ children }) => <li className="pl-1 italic">{children}</li>,
          h1: ({ children }) => <h1 className="text-3xl font-serif italic mb-4 border-b border-[#1A1A1A]/10 pb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-2xl font-serif italic mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xl font-serif italic mb-2">{children}</h3>,
          strong: ({ children }) => <strong className="font-bold text-[#1A1A1A] underline decoration-[#1A1A1A]/20 underline-offset-4">{children}</strong>,
          code: ({ children }) => (
            <code className="bg-[#1A1A1A]/5 px-2 py-0.5 rounded text-[#1A1A1A] font-mono text-sm border border-[#1A1A1A]/10">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-[#1A1A1A] text-[#FDFCF9] p-6 rounded-none overflow-x-auto my-6 text-sm selection:bg-white/20">
              {children}
            </pre>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
