// Shared mapping between Supabase rows and the existing app's place shape.
export function fromDatabasePlace(row) {
  return { ...row, order: row.sort_order ?? row.order ?? 0, image_url: row.image_url || null };
}

export function toDatabasePlace(place) {
  return {
    id: place.id, icon: place.icon || "📍", category: place.category || "palace",
    sort_order: Number(place.order || place.sort_order || 1),
    floor: place.floor || {}, title: place.title || {}, summary: place.summary || {}, text: place.text || {},
    image_url: place.image_url || null, latitude: place.latitude ?? null, longitude: place.longitude ?? null
  };
}
