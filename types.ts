
export type ViewState = 'auth' | 'onboarding' | 'dashboard' | 'live-chat';

export interface User {
  name: string;
  email: string;
}

export interface Flashcard {
  id: string;
  german: string;
  turkish: string;
  imageUrl?: string;
  exampleSentence?: string;
  sentenceTranslation?: string;
}

export interface CustomWord {
    id: string;
    german: string;
    turkish: string;
    exampleSentence?: string;
    sentenceTranslation?: string;
    synonyms?: string;
    image?: string;
}

export interface CustomPackage {
    id: string;
    name: string;
    words: CustomWord[];
}

export enum AspectRatio {
  Square = "1:1",
  Landscape = "16:9",
  Portrait = "9:16"
}

export enum ImageSize {
  OneK = "1K",
  TwoK = "2K",
  FourK = "4K"
}
