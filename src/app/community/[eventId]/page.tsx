"use client";

import React from "react";
import EventCommunity from "@/components/EventCommunity";

export default function CommunityPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const resolvedParams = React.use(params);

  return <EventCommunity eventId={resolvedParams.eventId} />;
}
