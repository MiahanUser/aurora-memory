
export interface LoveMessage {
  id: string;
  text: string;
  type: 'poem' | 'wish' | 'compliment';
  timestamp: number;
}

export enum GardenState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  REVEALED = 'REVEALED'
}
