import { scenarioCatalog } from '../../domain/catalog/scenario.catalog';
import { framingCatalog } from '../../domain/catalog/framing.catalog';

export interface CatalogOption {
  id: string;
  label: string;
}

export interface CatalogView {
  scenarios: CatalogOption[];
  framings: CatalogOption[];
}

/**
 * Exposes the scenario and framing lists so the UI can populate its dropdowns
 * without holding a second copy of them.
 *
 * Only id and label cross the wire. The prompt clause stays inside the
 * domain, because the UI has no business knowing how a prompt is assembled.
 */
export class GetCatalogQuery {
  execute(): CatalogView {
    return {
      scenarios: scenarioCatalog.map(({ id, label }) => ({ id, label })),
      framings: framingCatalog.map(({ id, label }) => ({ id, label })),
    };
  }
}
