#!/usr/bin/env node

// Extracts text from the brand guide PDF into a Markdown-friendly file in docs/.
// Usage: node scripts/extract-brand-guide.js [inputPdf] [outputFile] [--txt]

const fs = require('fs/promises');
const path = require('path');
const { PDFParse } = require('pdf-parse');

async function main() {
  const defaultInput = path.join(
    __dirname,
    '..',
    'docs',
    'Guide de marque AGH-V1.pdf',
  );
  const defaultOutput = path.join(__dirname, '..', 'docs', 'guide-de-marque.md');

  const args = process.argv.slice(2);
  const inputPath = path.resolve(args[0] || defaultInput);
  const outputPath = path.resolve(args[1] || defaultOutput);
  const forceTxt = args.includes('--txt');

  console.log(`Reading PDF from ${inputPath}`);
  const pdfBuffer = await fs.readFile(inputPath);

  const parser = new PDFParse({ data: pdfBuffer });
  const result = await parser.getText();
  const rawText = (result.text || '').trim();

  const outputIsMd =
    (!forceTxt && outputPath.toLowerCase().endsWith('.md')) ||
    (forceTxt === false && !outputPath.toLowerCase().endsWith('.txt'));

  const text = outputIsMd ? toMarkdown(rawText) : rawText;

  if (!text) {
    console.warn('Warning: no text extracted from PDF.');
  }

  await fs.writeFile(outputPath, text, 'utf8');

  console.log(`Wrote extracted text to ${outputPath}`);
  if (result.numpages) {
    console.log(`Pages parsed: ${result.numpages}`);
  }
}

function toMarkdown(raw) {
  const skipPatterns = [
    /^--\s*\d+\s+of\s+\d+\s*--$/i, // page markers
    /^pf\b/i, // header fragment
    /^\d+\s+page$/i,
    /^page\s+\d+$/i,
    /^\d{1,3}$/i, // lone page number
    /^\d{1,3}\s+agh$/i, // header page + label
    /association de généalogie d’haïti - guide de marque/i, // footer line
  ];

  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(
      (line) => line && !skipPatterns.some((pattern) => pattern.test(line)),
    );

  let md = lines.join('\n');
  md = md.replace(/[ \t]+/g, ' '); // collapse runs of spaces
  md = md.replace(/\n{3,}/g, '\n\n'); // limit vertical whitespace
  return `${md.trim()}\n`;
}

main().catch((err) => {
  console.error('Extraction failed:', err);
  process.exit(1);
});
