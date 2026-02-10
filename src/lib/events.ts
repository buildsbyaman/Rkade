export type EventRecord = { id: string; category: string; name: string; price?: string; img?: string };

export const baseEvents: EventRecord[] = [];

export function getEventById(id?: string) {
  if (!id) return undefined;
  return baseEvents.find((e) => e.id === id);
}
