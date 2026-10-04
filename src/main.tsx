// Install global cycle-safe JSON.stringify protection
const nativeStringify = JSON.stringify;
JSON.stringify = function (value: any, replacer?: any, space?: any) {
  try {
    return nativeStringify(value, replacer, space);
  } catch (err: any) {
    if (err instanceof TypeError && (err.message.includes('cyclic') || err.message.includes('circular'))) {
      const seen = new WeakSet();
      const safeReplacer = (k: string, v: any) => {
        if (typeof v === 'object' && v !== null) {
          if (seen.has(v)) {
            return undefined;
          }
          seen.add(v);
        }
        if (typeof replacer === 'function') {
          return replacer(k, v);
        }
        return v;
      };
      return nativeStringify(value, safeReplacer, space);
    }
    throw err;
  }
};

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
