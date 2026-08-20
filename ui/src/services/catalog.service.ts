import { http } from './http';
import { trainingService } from './training.service';
import type { Catalog, CatalogOption, Result } from '../types';

/**
 * Everything the forms need to know that the api owns: the scenario and
 * framing lists, and how many photos a training run requires.
 *
 * This is two api calls behind one method. The catalog belongs to the
 * generation module and the photo requirement belongs to the training
 * module, so they are served by their own owners rather than merged into one
 * endpoint that would have to reach across both. The UI does not care, it
 * asks once and gets one object.
 */
export const catalogService = {
  async load(): Promise<Result<Catalog>> {
    const [catalog, requirements] = await Promise.all([
      http.get<{ scenarios: CatalogOption[]; framings: CatalogOption[] }>('/api/catalog'),
      trainingService.getRequirements(),
    ]);

    if (!catalog.ok) return catalog;
    if (!requirements.ok) return requirements;

    return {
      ok: true,
      value: {
        scenarios: catalog.value.scenarios,
        framings: catalog.value.framings,
        requiredPhotoCount: requirements.value.requiredPhotoCount,
      },
    };
  },
};
