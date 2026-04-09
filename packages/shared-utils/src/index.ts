export function normalizeInputText(text: string): string {
  return text.replace(/\r\n/g, '\n').trim();
}

export function countWords(text: string): number {
  return normalizeInputText(text).split(/\s+/).filter(Boolean).length;
}

export function needsSummary(mode: 'full' | 'summary'): boolean {
  return mode === 'summary';
}
