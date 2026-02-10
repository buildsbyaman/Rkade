import React from 'react';
import { getEventBySlug } from '@/lib/event';
import EventDetailWrapper from '@/components/events/EventDetailWrapper';

interface Props {
  params: Promise<{ slug: string }>;
}

// Helper function to serialize MongoDB data for client components
function serializeEvent(event: any) {
  if (!event) return undefined;
  
  return JSON.parse(JSON.stringify(event, (key, value) => {
    // Convert ObjectId and Date objects to strings
    if (value && typeof value === 'object') {
      if (value._bsontype === 'ObjectID' || value.constructor?.name === 'ObjectId') {
        return value.toString();
      }
      if (value instanceof Date) {
        return value.toISOString();
      }
    }
    return value;
  }));
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  // try to fetch server-side; if not found, client wrapper will check localStorage
  const event = await getEventBySlug(slug).catch(() => null);
  const serializedEvent = serializeEvent(event);
  
  return (
    <EventDetailWrapper slug={slug} serverEvent={serializedEvent} />
  );
}


