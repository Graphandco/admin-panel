"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function CheatSheet({ content }) {
   return (
      <article className="prose prose-invert prose-slate max-w-none dark:prose-invert prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-code:before:content-none prose-code:after:content-none prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-code:py-0.5 prose-code:text-sm prose-table:text-sm">
         <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </article>
   );
}
