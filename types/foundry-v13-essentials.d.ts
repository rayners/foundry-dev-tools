/**
 * Essential Foundry VTT v13 Type Definitions
 *
 * This file provides minimal but complete type definitions for Foundry VTT v13
 * to replace the broken official fvtt-types package until it's stable.
 *
 * Only includes types actually used by FoundryVTT modules.
 */

// =============================================================================
// Browser API Extensions
// =============================================================================

declare global {
  interface Window {
    gc?: () => void; // Chrome garbage collection (when enabled with --enable-precise-memory-info)
  }
}

// =============================================================================
// GLOBAL FOUNDRY OBJECTS
// =============================================================================

declare global {
  const game: Game;
  const ui: UI;
  const Hooks: typeof HooksManager;
  const CONFIG: Config;
  const canvas: Canvas;
  const renderTemplate: (path: string, data?: any) => Promise<string>;

  // Foundry global namespace
  const foundry: FoundryNamespace;

  // Global performance API
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }

  // Make Foundry types available globally
  const JournalEntry: typeof FoundryJournalEntry;
  const Folder: typeof FoundryFolder;
  const Dialog: typeof FoundryDialog;
  const Application: typeof FoundryApplication;

  type Folder = FoundryFolder;
  type JournalEntry = FoundryJournalEntry;
  type User = FoundryUser;
}

// =============================================================================
// FOUNDRY NAMESPACE
// =============================================================================

declare global {
  interface FoundryNamespace {
    applications: {
      api: {
        ApplicationV2: typeof ApplicationV2;
        HandlebarsApplicationMixin: typeof HandlebarsApplicationMixin;
        DialogV2: typeof DialogV2;
      };
    };
    data: {
      fields: {
        StringField: any;
        NumberField: any;
        BooleanField: any;
        ObjectField: any;
        ArrayField: any;
        SchemaField: any;
      };
    };
    documents: {
      BaseDocument: any;
    };
    utils: {
      mergeObject: (original: any, other: any, options?: any) => any;
      duplicate: (original: any) => any;
      getProperty: (object: any, key: string) => any;
      setProperty: (object: any, key: string, value: any) => boolean;
      expandObject: (obj: any) => any;
      flattenObject: (obj: any) => any;
    };
  }
}

// =============================================================================
// CORE FOUNDRY TYPES
// =============================================================================

// Basic Foundry types used across modules
interface Game {
  ready: boolean;
  user?: FoundryUser;
  users?: Collection<FoundryUser>;
  settings: ClientSettings;
  i18n: Localization;
  modules: Map<string, Module>;
  system: System;
  time: WorldTime;
  socket?: any;
  documentTypes?: any;
  canvas?: Canvas;

  // Method signatures
  togglePause(): Promise<boolean>;
}

interface UI {
  notifications?: Notifications;
  controls?: SceneControls;
  nav?: any;
  sidebar?: any;
}

interface ClientSettings {
  get(module: string, key: string): any;
  set(module: string, key: string, value: any): Promise<any>;
  register(module: string, key: string, options: SettingConfig): void;
}

interface SettingConfig {
  name: string;
  hint?: string;
  scope: 'world' | 'client';
  config: boolean;
  type: any;
  default?: any;
  choices?: Record<string, string>;
  range?: { min: number; max: number; step: number };
  onChange?: (value: any) => void;
}

interface Localization {
  localize(key: string): string;
  format(key: string, data?: Record<string, any>): string;
}

interface Module {
  id: string;
  title: string;
  active: boolean;
  api?: any;
  version?: string;
}

interface System {
  id: string;
  title: string;
  version: string;
  data?: any;
}

interface WorldTime {
  worldTime: number;
  advance(seconds: number): Promise<void>;
}

interface Canvas {
  ready: boolean;
  stage?: any;
  app?: any;
}

interface Notifications {
  notify(message: string, type?: 'info' | 'warning' | 'error'): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

interface SceneControls {
  controls: any[];
  activeControl?: string;
  activeTool?: string;
}

// =============================================================================
// HOOKS SYSTEM
// =============================================================================

interface HooksManager {
  on(hook: string, callback: Function): number;
  once(hook: string, callback: Function): number;
  off(hook: string, id: number): void;
  call(hook: string, ...args: any[]): boolean;
  callAll(hook: string, ...args: any[]): boolean;
}

// =============================================================================
// COLLECTIONS
// =============================================================================

declare class Collection<T = any> extends Map<string, T> {
  constructor(entries?: readonly (readonly [string, T])[] | null);

  // Collection-specific methods
  getName(name: string): T | undefined;
  find(predicate: (value: T, key: string, collection: Collection<T>) => boolean): T | undefined;
  filter(predicate: (value: T, key: string, collection: Collection<T>) => boolean): T[];
  map<U>(callback: (value: T, key: string, collection: Collection<T>) => U): U[];
  some(predicate: (value: T, key: string, collection: Collection<T>) => boolean): boolean;
  every(predicate: (value: T, key: string, collection: Collection<T>) => boolean): boolean;
  reduce<U>(callback: (accumulator: U, value: T, key: string, collection: Collection<T>) => U, initialValue: U): U;

  // Array-like access
  contents: T[];

  // Iterator methods
  [Symbol.iterator](): IterableIterator<[string, T]>;
  values(): IterableIterator<T>;
  keys(): IterableIterator<string>;
  entries(): IterableIterator<[string, T]>;
}

// =============================================================================
// APPLICATION V2 FRAMEWORK
// =============================================================================

interface ApplicationV2Options {
  id?: string;
  classes?: string[];
  tag?: string;
  window?: {
    title?: string;
    icon?: string;
    minimizable?: boolean;
    resizable?: boolean;
    contentClasses?: string[];
  };
  position?: {
    width?: number | 'auto';
    height?: number | 'auto';
    top?: number;
    left?: number;
  };
  actions?: Record<string, Function>;
  form?: {
    handler?: Function;
    submitOnChange?: boolean;
    closeOnSubmit?: boolean;
  };
}

declare class ApplicationV2 {
  static DEFAULT_OPTIONS: ApplicationV2Options;

  constructor(options?: Partial<ApplicationV2Options>);

  // Properties
  id: string;
  element: HTMLElement;
  rendered: boolean;
  options: ApplicationV2Options;

  // Lifecycle methods
  render(options?: { force?: boolean }): Promise<this>;
  close(): Promise<void>;
  minimize(): Promise<void>;
  maximize(): Promise<void>;

  // Protected methods for subclasses
  protected _prepareContext(options: any): Promise<any> | any;
  protected _onRender(context: any, options: any): Promise<void> | void;
  protected _onClose(): Promise<void> | void;

  // Static factory method
  static create(options?: any): Promise<ApplicationV2>;

  // Position methods
  setPosition(position?: { top?: number; left?: number; width?: number; height?: number }): void;
}

interface HandlebarsApplicationMixin {
  static PARTS: Record<string, { template: string; id?: string }>;

  // Template methods
  _preparePartContext(partId: string, context: any, options: any): Promise<any> | any;
  _renderTemplate(template: string, context: any): Promise<string>;

  // Event handling  
  _attachPartListeners(partId: string, htmlElement: HTMLElement, options: any): void;
}

// =============================================================================
// DOCUMENT TYPES
// =============================================================================

interface FoundryJournalEntry {
  id: string;
  name: string;
  pages: Collection<any>;
  folder?: FoundryFolder;
  ownership: Record<string, number>;
  flags: Record<string, any>;

  // Static methods
  static create(data: any): Promise<FoundryJournalEntry>;
  static createDocuments(data: any[]): Promise<FoundryJournalEntry[]>;

  // Instance methods
  update(data: any): Promise<FoundryJournalEntry>;
  delete(): Promise<FoundryJournalEntry>;
  getFlag(module: string, key: string): any;
  setFlag(module: string, key: string, value: any): Promise<FoundryJournalEntry>;
  unsetFlag(module: string, key: string): Promise<FoundryJournalEntry>;

  // Ownership and permissions
  isOwner: boolean;
  canUserModify(user: FoundryUser, action: string): boolean;
}

interface FoundryFolder {
  id: string;
  name: string;
  type: string;
  parent?: FoundryFolder;
  children: Collection<FoundryFolder>;
  contents: Collection<any>;

  // Static methods
  static create(data: any): Promise<FoundryFolder>;

  // Instance methods
  update(data: any): Promise<FoundryFolder>;
  delete(): Promise<FoundryFolder>;
}

interface FoundryUser {
  id: string;
  name: string;
  isGM: boolean;
  active: boolean;
  role: number;
  character?: any;

  // Permission checking
  can(permission: string): boolean;
  hasRole(role: string | number): boolean;
}

// =============================================================================
// DIALOG AND APPLICATION CLASSES
// =============================================================================

declare class FoundryDialog {
  static confirm(options: {
    title: string;
    content: string;
    yes?: Function;
    no?: Function;
    defaultYes?: boolean;
  }): Promise<boolean>;

  static prompt(options: {
    title: string;
    content: string;
    callback: Function;
    render?: Function;
    options?: any;
  }): Promise<any>;

  constructor(data: any, options?: any);
  render(force?: boolean): Promise<this>;
  close(): Promise<void>;
}

// DialogV2 - Modern Foundry V13 dialog API
declare class DialogV2 {
  static confirm(options: {
    window?: { title: string };
    content: string;
    yes?: {
      label?: string;
      callback?: Function;
    };
    no?: {
      label?: string;
      callback?: Function;
    };
    defaultYes?: boolean;
  }): Promise<boolean>;

  static prompt(options: {
    window?: { title: string };
    content: string;
    callback?: Function;
  }): Promise<any>;

  static input(options: {
    window?: { title: string };
    content: string;
    ok?: {
      label?: string;
      callback?: Function;
    };
  }): Promise<string | null>;

  constructor(options?: {
    window?: { title: string };
    content?: string;
    buttons?: Array<{
      action: string;
      label: string;
      default?: boolean;
      callback?: Function;
    }>;
    submit?: Function;
  });

  render(options?: { force?: boolean }): Promise<this>;
  close(): Promise<void>;
}

declare class FoundryApplication {
  constructor(options?: any);
  
  // Properties
  rendered: boolean;
  element: HTMLElement | JQuery<HTMLElement>;
  
  // Methods
  render(force?: boolean): Promise<this>;
  close(): Promise<void>;
  setPosition(position?: any): void;
  activateListeners(html: JQuery<HTMLElement>): void;
  
  // Data methods
  getData(): any;
  
  // Static methods
  static get defaultOptions(): any;
}

// =============================================================================
// CONSTANTS AND ENUMS
// =============================================================================

interface Config {
  // Add CONFIG properties as needed by modules
  [key: string]: any;
}

// Ownership levels
enum OwnershipLevel {
  NONE = 0,
  LIMITED = 1,
  OBSERVER = 2,
  OWNER = 3,
  INHERIT = -1
}

// Common permission constants
declare const CONST: {
  DOCUMENT_OWNERSHIP_LEVELS: typeof OwnershipLevel;
  USER_ROLES: {
    NONE: 0;
    PLAYER: 1;
    TRUSTED: 2;
    ASSISTANT: 3;
    GAMEMASTER: 4;
  };
  [key: string]: any;
};

// Export everything for module use
export {};