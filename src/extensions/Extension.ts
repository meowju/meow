import { Tool } from '../types/tool';

export interface Extension {
  name: string;
  description: string;
  tools: Tool[];
  onLoad?: (agent: any) => Promise<void>;
}
