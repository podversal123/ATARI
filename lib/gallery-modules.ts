import { FORM_MANAGEMENT, flattenLeafPaths, type NavItem } from "./navigation";

/** `path` is the same full slug path ModuleImage.categoryPath stores (e.g. "achievements/oft") - real photos are matched against this, not the bare leaf slug, which collides across modules that happen to share a leaf name. */
export type GalleryLeaf = { slug: string; path: string; label: string; trail: string };

export type GalleryModule = { slug: string; label: string; leaves: GalleryLeaf[] };

/**
 * Flattens FORM_MANAGEMENT into the module -> leaf-photo-source tree the
 * real Gallery's left filter panel shows (confirmed via a client reference
 * the reference of /gallery: a "MODULES" list with "ABOUT KVKS" expanded into
 * its 8 leaves as one flat list, not nested sub-groups). Any intermediate
 * sub-groups (e.g. Achievements -> Special Days ->...) are flattened the
 * same way, matching that confirmed shape.
 */
function collectLeaves(items: NavItem[], moduleSlug: string, moduleLabel: string): GalleryLeaf[] {
  return flattenLeafPaths(items, moduleSlug).map((leaf) => ({
    slug: leaf.path.slice(leaf.path.lastIndexOf("/") + 1),
    path: leaf.path,
    label: leaf.label,
    trail: `${moduleLabel} > ${leaf.label}`,
  }));
}

export const GALLERY_MODULES: GalleryModule[] = FORM_MANAGEMENT.map((item) => ({
  slug: item.slug,
  label: item.label,
  leaves:
    item.type === "group"
      ? collectLeaves(item.children, item.slug, item.label)
      : [{ slug: item.slug, path: item.slug, label: item.label, trail: item.label }],
}));
