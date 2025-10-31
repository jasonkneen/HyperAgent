/**
 * Debug writer utility for aiAction debugging
 * Creates a debug folder structure similar to the agent task debugging
 */

import fs from 'fs';
import path from 'path';

export interface DebugData {
  instruction: string;
  url: string;
  timestamp: string;
  domElementCount: number;
  domTree: string;
  screenshot?: Buffer;
  foundElement?: {
    elementId: string;
    method: string;
    arguments: any[];
    xpath?: string;
  };
  availableElements?: Array<{
    id: string;
    role: string;
    label: string;
  }>;
  llmResponse?: {
    rawText: string;
    parsed: unknown;
  };
  error?: {
    message: string;
    stack?: string;
  };
  success: boolean;
}

let actionCounter = 0;
let sessionId: string | null = null;

/**
 * Initialize a new debug session
 */
export function initDebugSession(): string {
  sessionId = new Date().toISOString().replace(/[:.]/g, '-');
  actionCounter = 0;
  return sessionId;
}

/**
 * Get current session ID (create one if doesn't exist)
 */
function getSessionId(): string {
  if (!sessionId) {
    sessionId = initDebugSession();
  }
  return sessionId;
}

/**
 * Write debug data for an aiAction call
 */
export async function writeAiActionDebug(
  debugData: DebugData,
  baseDir: string = 'debug/aiAction'
): Promise<string> {
  const session = getSessionId();
  const actionNum = actionCounter++;
  const debugDir = path.join(baseDir, session, `action-${actionNum}`);

  // Create debug directory
  fs.mkdirSync(debugDir, { recursive: true });

  // Write instruction and metadata
  const metadata = {
    actionNumber: actionNum,
    timestamp: debugData.timestamp,
    instruction: debugData.instruction,
    url: debugData.url,
    domElementCount: debugData.domElementCount,
    success: debugData.success,
  };
  fs.writeFileSync(
    path.join(debugDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );

  // Write DOM tree
  fs.writeFileSync(path.join(debugDir, 'dom-tree.txt'), debugData.domTree);

  // Write screenshot if available
  if (debugData.screenshot) {
    fs.writeFileSync(path.join(debugDir, 'screenshot.png'), debugData.screenshot);
  }

  // Write found element info
  if (debugData.foundElement) {
    fs.writeFileSync(
      path.join(debugDir, 'found-element.json'),
      JSON.stringify(debugData.foundElement, null, 2)
    );
  }

  // Write LLM response if available
  if (debugData.llmResponse) {
    fs.writeFileSync(
      path.join(debugDir, 'llm-response.json'),
      JSON.stringify(debugData.llmResponse, null, 2)
    );
    // Also write just the raw text for easy viewing
    fs.writeFileSync(
      path.join(debugDir, 'llm-response.txt'),
      debugData.llmResponse.rawText
    );
  }

  // Write available elements if provided (for debugging failures)
  if (debugData.availableElements) {
    const elementsText = debugData.availableElements
      .map((e) => `[${e.id}] ${e.role}: "${e.label}"`)
      .join('\n');
    fs.writeFileSync(path.join(debugDir, 'available-elements.txt'), elementsText);
    fs.writeFileSync(
      path.join(debugDir, 'available-elements.json'),
      JSON.stringify(debugData.availableElements, null, 2)
    );
  }

  // Write error if present
  if (debugData.error) {
    fs.writeFileSync(
      path.join(debugDir, 'error.json'),
      JSON.stringify(debugData.error, null, 2)
    );
  }

  return debugDir;
}

/**
 * Reset the action counter (useful for testing or new sessions)
 */
export function resetDebugSession(): void {
  actionCounter = 0;
  sessionId = null;
}
