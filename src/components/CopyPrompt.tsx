import React, {useState} from 'react';

// A prompt a reader hands to their coding agent, with a copy button. The
// text is also visible and selectable, so a page without a clipboard
// (insecure context, some in-app browsers) still works.
export default function CopyPrompt({text}: {text: string}) {
  const [done, setDone] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {
      // Selectable as is.
    }
  }
  return (
    <div className="copyPrompt">
      <pre>{text}</pre>
      <button type="button" className="button button--primary button--sm" onClick={copy}>
        {done ? 'Copied ✓' : 'Copy'}
      </button>
    </div>
  );
}
