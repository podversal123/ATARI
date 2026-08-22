import { FORM_MANAGEMENT, type NavItem } from "./navigation";

export type GalleryLeaf = { slug: string; label: string; trail: string };

export type GalleryModule = { slug: string; label: string; leaves: GalleryLeaf[] };

/**
 * Flattens FORM_MANAGEMENT into the module -> leaf-photo-source tree the
 * real Gallery's left filter panel shows (confirmed via a client reference
 * the reference of /gallery: a "MODULES" list with "ABOUT KVKS" expanded into
 * its 8 leaves as one flat list, not nested sub-groups). Any intermediate
 * sub-groups (e.g. Achievements -> Special Days ->...) are flattened the
 * same way, matching that confirmed shape.
 */
function collectLeaves(items: NavItem[], moduleLabel: string): GalleryLeaf[] {
  const leaves: GalleryLeaf[] = [];
  for (const item of items) {
    if (item.type === "leaf") {
      leaves.push({ slug: item.slug, label: item.label, trail: `${moduleLabel} > ${item.label}` });
    } else {
      leaves.push(...collectLeaves(item.children, moduleLabel));
    }
  }
  return leaves;
}

export const GALLERY_MODULES: GalleryModule[] = FORM_MANAGEMENT.map((item) => ({
  slug: item.slug,
  label: item.label,
  leaves:
    item.type === "group"
      ? collectLeaves(item.children, item.label)
      : [{ slug: item.slug, label: item.label, trail: item.label }],
}));
