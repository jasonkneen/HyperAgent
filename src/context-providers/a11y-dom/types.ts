/**
 * Types for accessibility tree extraction using Chrome DevTools Protocol
 */

/**
 * Raw AX Node from CDP Accessibility.getFullAXTree
 * Matches Chrome DevTools Protocol format
 */
export interface AXNode {
  role?: { value: string };
  name?: { value: string };
  description?: { value: string };
  value?: { value: string };
  nodeId: string;
  backendDOMNodeId?: number;
  parentId?: string;
  childIds?: string[];
  properties?: Array<{
    name: string;
    value: {
      type: string;
      value?: string;
    };
  }>;
  ignored?: boolean;
  ignoredReasons?: Array<{
    name: string;
    value?: { value: string };
  }>;
}

/**
 * Simplified AccessibilityNode with parsed values
 * Used for tree building and filtering
 */
export interface AccessibilityNode {
  role: string;
  name?: string;
  description?: string;
  value?: string;
  children?: AccessibilityNode[];
  childIds?: string[];
  parentId?: string;
  nodeId?: string;
  backendDOMNodeId?: number;
  properties?: Array<{
    name: string;
    value: {
      type: string;
      value?: string;
    };
  }>;
}

/**
 * DOM Node from CDP DOM.getDocument
 */
export interface DOMNode {
  backendNodeId?: number;
  nodeName?: string;
  children?: DOMNode[];
  shadowRoots?: DOMNode[];
  contentDocument?: DOMNode;
  nodeType: number;
  frameId?: string;
}

/**
 * Maps for backend node IDs to tag names and xpaths
 * Built from the full DOM tree
 */
export interface BackendIdMaps {
  tagNameMap: Record<number, string>;
  xpathMap: Record<number, string>;
}

/**
 * Encoded ID format: frameIndex-nodeIndex
 * Used for stable element identification across frames
 */
export type EncodedId = `${number}-${number}`;

/**
 * Enhanced node with encodedId for element identification
 */
export interface RichNode extends AccessibilityNode {
  encodedId?: EncodedId;
}

/**
 * Result from accessibility tree extraction
 */
export interface TreeResult {
  tree: AccessibilityNode[];
  simplified: string;
  xpathMap: Record<EncodedId, string>;
  idToElement: Map<EncodedId, AccessibilityNode>;
}

/**
 * Configuration for A11y DOM extraction
 */
export interface A11yDOMConfig {
  /**
   * DOM extraction mode
   * - 'a11y': Pure text tree, no screenshot (fastest)
   * - 'hybrid': Text tree + clean screenshot
   * - 'visual-debug': Text tree + DOM injection + bounding boxes
   */
  mode?: 'a11y' | 'hybrid' | 'visual-debug';

  /**
   * Whether to inject data-hyperagent-id attributes into DOM
   * Required for visual-debug mode
   */
  injectIdentifiers?: boolean;

  /**
   * Whether to draw bounding boxes around elements
   * Only works if injectIdentifiers is true
   */
  drawBoundingBoxes?: boolean;

  /**
   * Whether to include ignored nodes in the tree
   * Default: false (exclude ignored nodes)
   */
  includeIgnored?: boolean;
}

/**
 * Accessibility DOM State returned to agent
 */
export interface A11yDOMState {
  /**
   * Map of encoded IDs to accessibility nodes
   */
  elements: Map<EncodedId, AccessibilityNode>;

  /**
   * Simplified text representation of the tree (sent to LLM)
   */
  domState: string;

  /**
   * Map of encoded IDs to XPaths for element location
   */
  xpathMap: Record<EncodedId, string>;

  /**
   * Optional screenshot (only in hybrid/visual-debug modes)
   */
  screenshot?: string;
}

/**
 * Interactive roles that should be included in the accessibility tree
 * Based on ARIA roles and common interactive elements
 */
export const INTERACTIVE_ROLES = new Set([
  'button',
  'link',
  'textbox',
  'searchbox',
  'combobox',
  'listbox',
  'option',
  'checkbox',
  'radio',
  'radiogroup',
  'switch',
  'tab',
  'tablist',
  'menu',
  'menubar',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'slider',
  'spinbutton',
  'grid',
  'gridcell',
  'tree',
  'treeitem',
  'row',
  'cell',
  'columnheader',
  'rowheader',
  'heading',
  'img',
  'figure',
]);

/**
 * Structural roles to replace with tag names
 */
export const STRUCTURAL_ROLES = new Set(['generic', 'none', 'StaticText']);

/**
 * Pattern to validate encoded IDs (frameIndex-nodeIndex)
 */
export const ID_PATTERN = /^\d+-\d+$/;

/**
 * Type guard to check if a string is a valid EncodedId
 */
export function isEncodedId(id: string): id is EncodedId {
  return ID_PATTERN.test(id);
}

/**
 * Type assertion to convert string to EncodedId with validation
 * @throws Error if the string is not a valid EncodedId format
 */
export function toEncodedId(id: string): EncodedId {
  if (!isEncodedId(id)) {
    throw new Error(`Invalid EncodedId format: "${id}". Expected format: "number-number"`);
  }
  return id;
}

/**
 * Safe conversion that returns undefined if invalid
 */
export function asEncodedId(id: string): EncodedId | undefined {
  return isEncodedId(id) ? id : undefined;
}
