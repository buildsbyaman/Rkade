import { getDb, toObjectId, transformMongoDocument } from "./mongodb-server";
import { Team, TeamMember } from "@/types/event";

export interface CreateTeamInput {
  eventId: string;
  teamName: string;
  creatorEmail: string;
}

export interface TeamWithMembers extends Team {
  members: TeamMember[];
}

// Helper to map DB team to Team interface
function mapToTeam(doc: any): Team {
  return {
    id: doc._id.toString(),
    event_id: doc.eventId?.toString() || doc.event_id?.toString(),
    team_name: doc.teamName || doc.team_name,
    team_code: doc.teamCode || doc.team_code,
    creator_email: doc.creatorEmail || doc.creator_email,
    created_at: doc.createdAt || doc.created_at,
    updated_at: doc.updatedAt || doc.updated_at,
  };
}

// Helper to map DB member to TeamMember interface
function mapToTeamMember(member: any, teamId: string): TeamMember {
  return {
    id: member._id?.toString() || member.id || "unknown", // Embedded members might not have IDs?
    team_id: teamId,
    user_email: member.userEmail || member.user_email,
    joined_at: member.joinedAt || member.joined_at,
  };
}

// Create a new team
export async function createTeam(input: CreateTeamInput): Promise<Team> {
  const db = await getDb();

  // Generate a unique 6-character team code
  const teamCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  const teamData = {
    eventId: toObjectId(input.eventId),
    teamName: input.teamName,
    teamCode,
    creatorEmail: input.creatorEmail,
    members: [
      {
        userEmail: input.creatorEmail,
        joinedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection("teams").insertOne(teamData);

  return mapToTeam({
    _id: result.insertedId,
    ...teamData,
  });
}

// Join a team using team code
export async function joinTeamByCode(
  teamCode: string,
  userEmail: string,
): Promise<void> {
  const db = await getDb();

  // First, get the team by code
  const team = await db
    .collection("teams")
    .findOne({ teamCode: teamCode.toUpperCase() });

  if (!team) {
    throw new Error("Invalid team code");
  }

  // Check if the user is already a member
  const existingMember = team.members?.find(
    (m: any) => m.userEmail === userEmail,
  );

  if (existingMember) {
    throw new Error("You are already a member of this team");
  }

  // Check current team size against max team size
  const event = await db.collection("events").findOne({ _id: team.eventId });

  const currentSize = team.members?.length || 0;

  if (event && currentSize >= (event.maxTeamSize || 10)) {
    throw new Error("Team is full");
  }

  // Add the user to the team
  await db.collection("teams").updateOne(
    { _id: team._id },
    {
      $push: {
        members: {
          userEmail,
          joinedAt: new Date(),
        },
      },
      $set: { updatedAt: new Date() },
    } as any,
  );
}

// Get teams for an event
export async function getTeamsForEvent(
  eventId: string,
): Promise<TeamWithMembers[]> {
  const db = await getDb();

  const teams = await db
    .collection("teams")
    .find({ eventId: toObjectId(eventId) })
    .toArray();

  if (!teams || teams.length === 0) return [];

  // Teams already have members embedded
  return teams.map((team) => {
    const mappedTeam = mapToTeam(team);
    return {
      ...mappedTeam,
      members: (team.members || []).map((m: any) =>
        mapToTeamMember(m, mappedTeam.id),
      ),
    };
  });
}

// Get user's team for a specific event
export async function getUserTeamForEvent(
  eventId: string,
  userEmail: string,
): Promise<TeamWithMembers | null> {
  const db = await getDb();

  // Find the team where user is a member and event matches
  const team = await db.collection("teams").findOne({
    eventId: toObjectId(eventId),
    "members.userEmail": userEmail,
  });

  if (!team) return null;

  const mappedTeam = mapToTeam(team);
  return {
    ...mappedTeam,
    members: (team.members || []).map((m: any) =>
      mapToTeamMember(m, mappedTeam.id),
    ),
  };
}

// Leave a team
export async function leaveTeam(
  teamId: string,
  userEmail: string,
): Promise<void> {
  const db = await getDb();

  // Check if user is the team creator
  const team = await db
    .collection("teams")
    .findOne({ _id: toObjectId(teamId) });

  if (!team) throw new Error("Team not found");

  if (team.creatorEmail === userEmail) {
    throw new Error(
      "Team creators cannot leave their team. You can delete the team instead.",
    );
  }

  // Remove the user from members array
  await db.collection("teams").updateOne(
    { _id: toObjectId(teamId) },
    {
      $pull: { members: { userEmail } },
      $set: { updatedAt: new Date() },
    } as any,
  );
}

// Delete a team (only creator can do this)
export async function deleteTeam(
  teamId: string,
  userEmail: string,
): Promise<void> {
  const db = await getDb();

  // Verify the user is the team creator
  const team = await db
    .collection("teams")
    .findOne({ _id: toObjectId(teamId) });

  if (!team) throw new Error("Team not found");

  if (team.creatorEmail !== userEmail) {
    throw new Error("Only team creators can delete their team");
  }

  // Delete the team
  await db.collection("teams").deleteOne({ _id: toObjectId(teamId) });
}
