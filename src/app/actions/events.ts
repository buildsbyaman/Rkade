"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { getDb, toObjectId } from "@/lib/mongodb-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isUserSuperAdmin } from "@/lib/admin-auth";

export async function createEvent(prevState: unknown, formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return { error: "Unauthorized" };
  }

  if (!isUserSuperAdmin(session.user.email, session.user.role)) {
    return { error: "Permission Denied: Only Super Admins can create events." };
  }

  const title = formData.get("title") as string;
  const date = formData.get("date") as string;
  const time = formData.get("time") as string;
  const location = formData.get("location") as string;
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;

  // New fields
  const duration = formData.get("duration") as string;
  const eventType = formData.get("eventType") as string;
  const ageRating = formData.get("ageRating") as string;
  const language = formData.get("language") as string;
  const price = formData.get("price") as string;
  const performers = formData.get("performers") as string;
  const landscapePoster = formData.get("landscapeImage") as string;
  const portraitPoster = formData.get("portraitImage") as string;
  const theme = formData.get("theme") as string;

  // PPT and Document fields
  const pptUrl = formData.get("pptUrl") as string;
  const pptTitle = formData.get("pptTitle") as string;
  const timelineDocumentUrl = formData.get("timelineDocumentUrl") as string;
  const timelineDocumentTitle = formData.get("timelineDocumentTitle") as string;
  const timelineDocumentType = formData.get("timelineDocumentType") as string;

  // Team event fields
  const isTeamEvent = formData.get("isTeamEvent") === "true";
  const minTeamSize = formData.get("minTeamSize") ? parseInt(formData.get("minTeamSize") as string) : undefined;
  const maxTeamSize = formData.get("maxTeamSize") ? parseInt(formData.get("maxTeamSize") as string) : undefined;

  const registrationStart = formData.get("registrationStart") as string;
  const registrationEnd = formData.get("registrationEnd") as string;
  const resultDate = formData.get("resultDate") as string;
  const timelineStr = formData.get("timeline") as string;
  let timeline = null;
  
  if (timelineStr) {
    try {
      timeline = JSON.parse(timelineStr);
    } catch (e) {
      console.error("Failed to parse timeline JSON:", e);
    }
  }

  // Build timeline document object if provided
  let timelineDocument = null;
  if (timelineDocumentUrl && timelineDocumentTitle) {
    timelineDocument = {
      url: timelineDocumentUrl,
      title: timelineDocumentTitle,
      type: timelineDocumentType || 'pdf'
    };
  }

  if (!title || !date || !time || !location || !category || !description) {
    return { error: "Missing required fields" };
  }

  // Generate slug
  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Date.now().toString().slice(-4);

  try {
    const db = await getDb();
    await db.collection("events").insertOne({
      eventName: title,
      slug,
      date,
      time,
      venue: location,
      category,
      description,
      creatorEmail: session.user.email,
      createdBy: (session.user as any).id,
      price: price || "Free",
      eventType: eventType || "event",
      language: language || "English",
      ageLimit: ageRating || "U",
      duration: duration || "60 min",
      landscapePoster: landscapePoster || "/default-landscape.jpg",
      portraitPoster: portraitPoster || "/default-portrait.jpg",
      performers: performers || null,
      theme: theme || null,
      registration_start: registrationStart || null,
      registration_end: registrationEnd || null,
      result_date: resultDate || null,
      timeline: timeline,
      pptUrl: pptUrl || null,
      pptTitle: pptTitle || null,
      timelineDocument: timelineDocument,
      isTeamEvent: isTeamEvent || false,
      minTeamSize: minTeamSize || null,
      maxTeamSize: maxTeamSize || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (err) {
    console.error("Server Error:", err);
    return { error: "Internal Server Error" };
  }

  revalidatePath("/admin/events");
  revalidatePath("/events");
  redirect("/admin/events");
}

export async function deleteEvent(eventId: string) {
  const session = await getServerSession(authOptions);

  if (!session || !isUserSuperAdmin(session.user?.email, session.user?.role)) {
    return { error: "Permission Denied: Only Super Admins can delete events." };
  }

  try {
    const db = await getDb();
    const result = await db.collection("events").deleteOne({ _id: toObjectId(eventId) });
    
    if (result.deletedCount === 0) {
      return { error: "Event not found" };
    }

    revalidatePath("/admin/events");
    revalidatePath("/events");
    return { success: true };
  } catch (err) {
    console.error("Error deleting event:", err);
    return { error: "Internal Server Error" };
  }
}

export async function updateEvent(eventId: string, data: any) {
  const session = await getServerSession(authOptions);

  if (!session || !isUserSuperAdmin(session.user?.email, session.user?.role)) {
    return { error: "Permission Denied: Only Super Admins can update events." };
  }

  try {
    const db = await getDb();
    await db.collection("events").updateOne(
      { _id: toObjectId(eventId) },
      { 
        $set: { 
          ...data,
          updatedAt: new Date()
        } 
      }
    );

    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/${eventId}`);
    revalidatePath("/events");
    return { success: true };
  } catch (err) {
    console.error("Error updating event:", err);
    return { error: "Internal Server Error" };
  }
}
