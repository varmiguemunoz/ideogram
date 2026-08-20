/**
 * What the UI renders. Nothing more.
 *
 * This file was 117 lines of which the UI used seven. The rest was api
 * internals that had drifted across: the IPC channel map, the raw SQL row
 * shapes AppStateRow and GenerationRow for a database a browser cannot see,
 * the isScenario and isFraming guards which are api validation, and
 * CongenApi, an eleven method bridge interface that no longer exists.
 *
 * Scenario and Framing are no longer literal unions here either. The real
 * list comes from GET /api/catalog at run time, so hardcoding it in the UI
 * would be a second copy of something the api owns.
 */

export type ErrCode =
  | 'E_NO_KEYCHAIN'
  | 'E_NO_CREDS'
  | 'E_NO_MODEL'
  | 'E_NOT_TRAINED'
  | 'E_UPSTREAM'
  | 'E_INVALID_INPUT';

/** The envelope every api and bridge call returns. */
export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; code: ErrCode; message: string };

export type Scenario = string;
export type Framing = string;

export type TrainingStatus = 'idle' | 'pending' | 'processing' | 'succeeded' | 'failed';
export type GenerationStatus = 'pending' | 'processing' | 'succeeded' | 'failed';

export interface CredentialsStatus {
  replicate: boolean;
  blob: boolean;
}

/** GET /api/state */
export interface AppState {
  triggerWord: string | null;
  destinationModel: string | null;
  trainedVersion: string | null;
  trainingStatus: TrainingStatus;
  trainingPredictionId: string | null;
  trainingZipUrl: string | null;
  trainingStartedAt: number | null;
}

/** An entry in GET /api/generations */
export interface Generation {
  id: number;
  scenario: Scenario;
  framing: Framing;
  clothingDescription: string;
  prompt: string;
  predictionId: string | null;
  outputUrl: string | null;
  error: string | null;
  status: GenerationStatus;
  createdAt: number;
  updatedAt: number;
}

/** An option in one of the catalog dropdowns. */
export interface CatalogOption {
  id: string;
  label: string;
}

/** GET /api/catalog, merged with the training requirements. */
export interface Catalog {
  scenarios: CatalogOption[];
  framings: CatalogOption[];
  requiredPhotoCount: number;
}

/** What the api returns after a photo selection changes. */
export interface PhotoSelection {
  selectionId: string;
  fileNames: string[];
}
