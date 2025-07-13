/**
 * Trusted Types API declarations
 * Extends the global Window interface to include Trusted Types
 */

declare global {
  interface Window {
    trustedTypes?: {
      createPolicy: (name: string, rules: {
        createHTML?: (input: string) => string;
        createScript?: (input: string) => string;
        createScriptURL?: (input: string) => string;
      }) => {
        createHTML: (input: string) => TrustedHTML;
        createScript: (input: string) => TrustedScript;
        createScriptURL: (input: string) => TrustedScriptURL;
      };
      isHTML: (value: any) => value is TrustedHTML;
      isScript: (value: any) => value is TrustedScript;
      isScriptURL: (value: any) => value is TrustedScriptURL;
    };
  }
}

declare type TrustedHTML = string & { __brand: 'TrustedHTML' };
declare type TrustedScript = string & { __brand: 'TrustedScript' };
declare type TrustedScriptURL = string & { __brand: 'TrustedScriptURL' };

export {};
