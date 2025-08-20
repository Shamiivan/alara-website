import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Design Guidelines | Alara',
  description: 'Comprehensive design guidelines for Alara including colors, typography, spacing, and components.'
};

export default async function DesignGuidelines() {
  // Read the markdown file
  const markdownContent = await fs.promises.readFile(
    path.join(process.cwd(), 'src/app/design-guidelines/design-guidelines.md'),
    'utf8'
  );

  // Simple function to convert markdown to HTML
  const markdownToHtml = (markdown: string): string => {
    // Convert headings
    let html = markdown
      .replace(/^# (.*$)/gm, '<h1 class="text-4xl font-bold mb-6 mt-10">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-3xl font-bold mb-4 mt-8">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-2xl font-bold mb-3 mt-6">$1</h3>')
      .replace(/^#### (.*$)/gm, '<h4 class="text-xl font-bold mb-2 mt-4">$1</h4>');

    // Convert paragraphs
    html = html.replace(/^(?!<h[1-6]|<ul|<ol|<li|<table|<blockquote|$)(.*$)/gm, '<p class="mb-4 text-foreground/90">$1</p>');

    // Better table handling
    const processTable = (tableContent: string): string => {
      const rows = tableContent.trim().split('\n');

      // Process header row
      const headerRow = rows[0];
      const headerCells = headerRow.split('|')
        .filter(cell => cell.trim() !== '')
        .map(cell => `<th class="border border-border p-2 text-left font-semibold bg-muted">${cell.trim()}</th>`)
        .join('');

      // Process divider row (skip it)

      // Process data rows
      const dataRows = rows.slice(2).map(row => {
        const cells = row.split('|')
          .filter(cell => cell.trim() !== '')
          .map(cell => `<td class="border border-border p-2">${cell.trim()}</td>`)
          .join('');
        return `<tr class="border-b border-border">${cells}</tr>`;
      }).join('');

      return `<div class="overflow-x-auto my-6">
        <table class="w-full border-collapse">
          <thead><tr>${headerCells}</tr></thead>
          <tbody>${dataRows}</tbody>
        </table>
      </div>`;
    };

    // Find and replace tables
    const tableRegex = /\|.*\|.*\|.*\|\n\|.*\|.*\|.*\|\n(?:\|.*\|.*\|.*\|\n)+/g;
    html = html.replace(tableRegex, match => processTable(match));

    // Convert lists
    html = html.replace(/^\s*-\s(.*$)/gm, '<li class="ml-6 mb-1 list-disc">$1</li>');
    html = html.replace(/(<li.*<\/li>\n)+/g, '<ul class="mb-4">$&</ul>');

    // Convert code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/gm, (match, language, code) => {
      return `<pre class="bg-muted p-4 rounded-md overflow-x-auto mb-6"><code class="text-sm font-mono">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
    });

    // Convert inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');

    // Convert links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary underline hover:text-primary-dark">$1</a>');

    // Convert bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    return html;
  };

  const htmlContent = markdownToHtml(markdownContent);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
        <article className="prose prose-slate max-w-none dark:prose-invert prose-headings:text-foreground prose-a:text-primary">
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </article>
      </div>
    </div>
  );
}