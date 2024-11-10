export const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
};

export const injectCursorStyle = (clientId: number, color: string) => {
  const styleId = `cursor-style-${clientId}`;
  let styleEl = document.getElementById(styleId) as HTMLStyleElement;

  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }

  styleEl.innerHTML = `
    .cursor-${clientId} {
      border-left: 2px solid ${color};
      border-radius: 1px;
      animation: blink 1s ease infinite;
    }
    .monaco-editor .selected-text-${clientId} {
      background-color: ${color}40 !important;
    }
  `;
};

export const removeStyles = () => {
  document
    .querySelectorAll('[id^="cursor-style-"]')
    .forEach((el) => el.remove());
};
