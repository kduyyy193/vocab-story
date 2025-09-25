export interface Word {
  id: string; // Firestore document ID
  word: string;
  type: string;
  meaning: string;
  ipaUK: string;
  ipaUS: string;
  example1: string;
  example1Meaning: string;
  example2?: string;
  example2Meaning?: string;
  unit?: number;
}

export type NewWord = Omit<Word, 'id'>;

export enum LearningStatus {
  NotLearned = 'NotLearned',
  Learning = 'Learning',
  Mastered = 'Mastered',
}

export interface WordProgress {
  status: LearningStatus;
  nextReviewDate: string | null;
  stage: number; // For SRS algorithm
}

export enum Screen {
    Home = 'Home',
    AddWord = 'Add New Word',
    Scan = 'Scan Vocabulary',
    Learn = 'Learn New Words',
    WordList = 'Word List',
    Review = 'Review Words',
    Exercises = 'Exercises',
    Listening = 'Listening Practice',
    IpaChart = 'IPA Chart',
    Stats = 'Statistics',
    Settings = 'Settings'
}

export enum PronunciationVoice {
  UK = 'UK',
  US = 'US'
}

export interface AppSettings {
    theme: 'light' | 'dark';
    defaultVoice: PronunciationVoice;
    speechSpeed: number;
}

export interface IpaSymbol {
  symbol: string;
  type: 'vowel' | 'consonant' | 'diphthong';
  exampleWord: string;
  description: string;
}