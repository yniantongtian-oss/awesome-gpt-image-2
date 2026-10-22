const BLANK_PATTERN = /\[([^\]\n]+)\]/g;

export function listTemplateBlanks(prompt) {
  const labels = [];
  const seen = new Set();
  for (const match of String(prompt || '').matchAll(BLANK_PATTERN)) {
    const label = match[1].trim();
    if (!label || seen.has(label)) continue;
    seen.add(label);
    labels.push(label);
  }
  return labels;
}

export function fillTemplateBlanks(prompt, values = {}) {
  return String(prompt || '').replace(BLANK_PATTERN, (full, rawLabel) => {
    const label = rawLabel.trim();
    const value = String(values?.[label] ?? '').trim();
    return value || full;
  });
}
