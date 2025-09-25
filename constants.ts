
export const LOCAL_STORAGE_PROGRESS_KEY = 'vocabMasterProgress';
export const LOCAL_STORAGE_SETTINGS_KEY = 'vocabMasterSettings';

// SRS intervals in days for different stages
export const SRS_STAGES = [1, 2, 4, 8, 15, 30, 60, 120];

export enum ReviewAction {
    Again, // Reset to stage 0
    Hard,  // Stay at current stage or move back one
    Good,  // Move up one stage
    Easy   // Move up two stages
}
