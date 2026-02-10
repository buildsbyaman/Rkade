// Client-side function to fetch events via API
export async function getEventsClient() {
  console.log("getEventsClient: Starting fetch...");
  try {
    const response = await fetch("/api/events/all");
    if (!response.ok) {
      throw new Error("Failed to fetch events");
    }
    const events = await response.json();
    console.log(
      "getEventsClient: Successfully fetched",
      events.length,
      "events",
    );
    return events;
  } catch (error) {
    console.error("getEventsClient: Error fetching events:", error);
    return [];
  }
}

// Client-side function to fetch events by category
export async function getEventsByCategoryClient(category: string) {
  try {
    const response = await fetch(
      `/api/events/category/${encodeURIComponent(category)}`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch events");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching events by category:", error);
    return [];
  }
}

// Client-side function to fetch events by event type
export async function getEventsByTypeClient(eventType: string) {
  console.log(
    `🔥 getEventsByTypeClient: Making API call for eventType='${eventType}'`,
  );

  try {
    const response = await fetch(
      `/api/events/type/${encodeURIComponent(eventType)}`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch events");
    }
    const events = await response.json();
    console.log(
      `🔥 getEventsByTypeClient: API call completed for eventType='${eventType}', found ${events.length} events`,
    );
    return events;
  } catch (error) {
    console.error(
      `🚨 getEventsByTypeClient: Error fetching events by type '${eventType}':`,
      error,
    );
    return [];
  }
}

// Client-side function to fetch events by campus slug
export async function getEventsByCampusClient(campusSlug: string) {
  console.log(
    `🔥 getEventsByCampusClient: Making API call for campusSlug='${campusSlug}'`,
  );

  try {
    const url = `/api/events/campus/${encodeURIComponent(campusSlug)}`;
    console.log("🔥 getEventsByCampusClient: URL:", url);
    const response = await fetch(url);
    console.log("🔥 getEventsByCampusClient: Response status:", response.status);

    if (!response.ok) {
      throw new Error("Failed to fetch events");
    }
    const events = await response.json();
    console.log(
      `🔥 getEventsByCampusClient: API call completed for campusSlug='${campusSlug}', found ${events.length} events`,
    );
    console.log("🔥 getEventsByCampusClient: Events data:", events.slice(0, 2));
    return events;
  } catch (error) {
    console.error(
      `🚨 getEventsByCampusClient: Error fetching events for campus '${campusSlug}':`,
      error,
    );
    return [];
  }
}

// Client-side function to fetch events by fest slug
export async function getEventsByFestClient(festSlug: string) {
  console.log(
    `🎉 getEventsByFestClient: Making API call for festSlug='${festSlug}'`,
  );

  try {
    const url = `/api/events/fest/${encodeURIComponent(festSlug)}`;
    console.log("🎉 getEventsByFestClient: URL:", url);
    const response = await fetch(url);
    console.log("🎉 getEventsByFestClient: Response status:", response.status);

    if (!response.ok) {
      throw new Error("Failed to fetch events");
    }
    const events = await response.json();
    console.log(
      `🎉 getEventsByFestClient: API call completed for festSlug='${festSlug}', found ${events.length} events`,
    );
    console.log("🎉 getEventsByFestClient: Events data:", events.slice(0, 2));
    return events;
  } catch (error) {
    console.error(
      `🚨 getEventsByFestClient: Error fetching events for fest '${festSlug}':`,
      error,
    );
    return [];
  }
}

// Add type definition
export type FeaturedEvent = {
  id: string;
  event_name: string;
  category?: string;
  event_type?: string;
  time?: string;
  date?: Date | string;
  venue?: string;
  language?: string;
  ageLimit?: string;
  portrait_poster?: string;
  landscape_poster?: string;
  slug?: string;
};

// Client-side function to fetch featured events
export async function getFeaturedEventsClient(
  limit: number = 3,
): Promise<FeaturedEvent[]> {
  try {
    const response = await fetch(`/api/events/featured?limit=${limit}`);
    if (!response.ok) {
      throw new Error("Failed to fetch featured events");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching featured events:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return [];
  }
}

// Add database event type definition
type DatabaseEvent = {
  id: string;
  eventName: string;
  category?: string;
  eventType?: string;
  price?: string;
  portraitPoster?: string;
  landscapePoster?: string;
  slug?: string;
  date?: Date | string | null;
  time?: string;
  duration?: string;
  language?: string;
  venue?: string;
  campus?: string | null;
  campusSlug?: string; // Keeping for backwards compatibility
  description?: string;
  performers?: string;
  ageLimit?: string;
  createdAt?: Date | string;
};

// Helper function to validate image URLs
function validateImageUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder.svg";

  // Check for invalid file system paths
  if (
    url.includes("/mnt/") ||
    url.includes("C:\\") ||
    url.includes("D:\\") ||
    url.includes("file://")
  ) {
    console.warn("Invalid image path detected in database:", url);
    return "/placeholder.svg";
  }

  // Check if it's a valid web URL or relative path
  if (url.startsWith("http") || url.startsWith("/") || url.startsWith("./")) {
    return url;
  }

  // If it doesn't look like a valid URL, use fallback
  console.warn("Suspicious image URL detected in database:", url);
  return "/placeholder.svg";
}

// Transform database event to frontend event format
export function transformEventToFrontend(dbEvent: DatabaseEvent) {
  const portraitImage = validateImageUrl(dbEvent.portraitPoster);
  const landscapeImage = validateImageUrl(dbEvent.landscapePoster);
  // Use 'campus' field (new) or fallback to 'campusSlug' (old)
  const campusSlug = dbEvent.campus || dbEvent.campusSlug;

  return {
    id: dbEvent.id,
    category: dbEvent.category || dbEvent.eventType || "Event",
    name: dbEvent.eventName,
    price: dbEvent.price || "FREE",
    img: portraitImage !== "/placeholder.svg" ? portraitImage : landscapeImage,
    href: `/events/${dbEvent.slug}`,
    slug: dbEvent.slug,
    date: dbEvent.date || undefined, // Convert null to undefined
    time: dbEvent.time,
    duration: dbEvent.duration,
    language: dbEvent.language || "English", // Provide default value
    venue: dbEvent.venue,
    campusSlug: campusSlug,
    description: dbEvent.description,
    performers: dbEvent.performers,
    ageLimit: dbEvent.ageLimit || "All", // Provide default value
    eventType: dbEvent.eventType || "events", // Provide default value
  };
}

// Example function with unknown parameter type
export function someFunction() {
  // Function implementation
}
