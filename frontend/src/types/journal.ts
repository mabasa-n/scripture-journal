export interface User {
  id: string; // UUID
  googleId: string;
  email: string;
  createdAt: string;
}

export interface ScriptureEntry {
  id: string; // UUID
  userId: string;
  heading: string;
  scriptureReference: string;
  scriptureText: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateScriptureInput = Omit<
  ScriptureEntry,
  'id' | 'userId' | 'createdAt' | 'updatedAt'
>;

export type UpdateScriptureInput = Partial<CreateScriptureInput>;