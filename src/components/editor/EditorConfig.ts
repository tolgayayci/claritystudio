import * as monaco from 'monaco-editor';
import { registerClarityLanguage } from '@/lib/clarityLanguage';

// Initialize Monaco with Clarity support
export function initializeMonaco() {
  // Register Clarity language if not already registered
  if (!monaco.languages.getLanguages().some(lang => lang.id === 'clarity')) {
    registerClarityLanguage(monaco);
  }
}
