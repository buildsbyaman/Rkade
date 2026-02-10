'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TeamWithMembers } from '@/lib/teams';

interface TeamManagementProps {
  eventId: string;
  isTeamEvent: boolean;
  minTeamSize?: number;
  maxTeamSize?: number;
}

export function TeamManagement({ eventId, isTeamEvent, minTeamSize = 1, maxTeamSize = 10 }: TeamManagementProps) {
  const { data: session } = useSession();
  const [userTeam, setUserTeam] = useState<TeamWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showJoinTeam, setShowJoinTeam] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [error, setError] = useState<string>('');

  const fetchTeamData = useCallback(async () => {
    if (!session?.user?.email) return;

    setLoading(true);
    try {
      // Fetch user's team for this event
      const userTeamRes = await fetch(`/api/teams?eventId=${eventId}&userEmail=${session.user.email}`);
      if (userTeamRes.ok) {
        const userData = await userTeamRes.json();
        setUserTeam(userData.userTeam);
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
      setError('Failed to load team information');
    } finally {
      setLoading(false);
    }
  }, [eventId, session?.user?.email]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchTeamData();
    }
  }, [fetchTeamData, session?.user?.email]);

  // If not a team event, don't render anything
  if (!isTeamEvent) {
    return null;
  }

  // If user is not signed in, show sign-in prompt
  if (!session?.user?.email) {
    return (
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Please sign in to create or join a team for this event.</p>
      </div>
    );
  }

  const createTeam = async () => {
    if (!teamName.trim()) {
      setError('Team name is required');
      return;
    }

    setActionLoading(true);
    setError('');

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          teamName: teamName.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowCreateTeam(false);
        setTeamName('');
        await fetchTeamData();
      } else {
        setError(data.error || 'Failed to create team');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      setError('Failed to create team');
    } finally {
      setActionLoading(false);
    }
  };

  const joinTeam = async () => {
    if (!teamCode.trim()) {
      setError('Team code is required');
      return;
    }

    setActionLoading(true);
    setError('');

    try {
      const response = await fetch('/api/teams/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamCode: teamCode.trim().toUpperCase(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowJoinTeam(false);
        setTeamCode('');
        await fetchTeamData();
      } else {
        setError(data.error || 'Failed to join team');
      }
    } catch (error) {
      console.error('Error joining team:', error);
      setError('Failed to join team');
    } finally {
      setActionLoading(false);
    }
  };

  const leaveTeam = async () => {
    if (!userTeam || !confirm('Are you sure you want to leave this team?')) return;

    setActionLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/teams/${userTeam.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        await fetchTeamData();
      } else {
        setError(data.error || 'Failed to leave team');
      }
    } catch (error) {
      console.error('Error leaving team:', error);
      setError('Failed to leave team');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteTeam = async () => {
    if (!userTeam || !confirm('Are you sure you want to delete this team? All members will be removed.')) return;

    setActionLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/teams/${userTeam.id}?action=delete`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        await fetchTeamData();
      } else {
        setError(data.error || 'Failed to delete team');
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      setError('Failed to delete team');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl animate-pulse">
        <p className="text-gray-400">Loading team information...</p>
      </div>
    );
  }

  return (
    <div className="mt-0">
      {/* <h3 className="text-xl font-semibold mb-4 text-white">Team Management</h3> -- Handled by parent */}

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="mb-6 p-4 bg-electric-indigo/10 border border-electric-indigo/20 rounded-xl backdrop-blur-sm">
        <p className="text-electric-indigo-400 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">groups</span>
          <span><strong>Team Requirements:</strong> {minTeamSize} - {maxTeamSize} members</span>
        </p>
      </div>

      {userTeam ? (
        // User has a team
        <div className="space-y-4">
          <div className="p-6 bg-acid/5 border border-acid/20 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <span className="material-symbols-outlined text-6xl text-acid">diversity_3</span>
            </div>

            <div className="relative z-10">
              <h4 className="font-bold text-xl text-white mb-1 font-display uppercase italic">{userTeam.team_name}</h4>
              <p className="text-acid text-sm mb-4 font-mono bg-acid/10 inline-block px-2 py-1 rounded border border-acid/20">
                CODE: <span className="font-bold tracking-widest">{userTeam.team_code}</span>
              </p>

              <p className="text-gray-400 text-sm mb-3 border-b border-white/10 pb-2">
                Members: <span className="text-white font-bold">{userTeam.members.length}</span> / {maxTeamSize}
              </p>

              <div className="space-y-2 mb-6">
                {userTeam.members.map((member) => (
                  <div key={member.id} className="text-sm text-gray-300 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-acid"></div>
                    {member.user_email}
                    {member.user_email === userTeam.creator_email && <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-400 ml-1">Creator</span>}
                    {member.user_email === session?.user?.email && <span className="text-xs bg-acid/20 text-acid px-2 py-0.5 rounded ml-1 font-bold">You</span>}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                {userTeam.creator_email === session?.user?.email ? (
                  <Button
                    onClick={deleteTeam}
                    disabled={actionLoading}
                    variant="outline"
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/50"
                  >
                    {actionLoading ? 'Deleting...' : 'Delete Team'}
                  </Button>
                ) : (
                  <Button
                    onClick={leaveTeam}
                    disabled={actionLoading}
                    variant="outline"
                    className="bg-transparent border-white/20 text-gray-300 hover:text-white hover:bg-white/10"
                  >
                    {actionLoading ? 'Leaving...' : 'Leave Team'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // User doesn't have a team
        <div className="space-y-6">
          <div className="flex gap-4">
            <button
              onClick={() => {
                setShowCreateTeam(true); // Always switch to create specific
                setShowJoinTeam(false);
                setError('');
              }}
              className={`flex-1 py-4 px-4 rounded-xl border transition-all duration-300 text-left relative overflow-hidden group ${showCreateTeam ? 'border-acid bg-acid/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
            >
              <span className="relative z-10 flex flex-col gap-1">
                <span className={`font-bold uppercase tracking-wider text-sm ${showCreateTeam ? 'text-acid' : 'text-gray-400 group-hover:text-white'}`}>Create Team</span>
                <span className="text-xs text-gray-500">Start a new squad</span>
              </span>
              <div className={`absolute bottom-2 right-2 transition-transform duration-300 ${showCreateTeam ? 'scale-110' : 'scale-100 opacity-50'}`}>
                <span className={`material-symbols-outlined text-3xl ${showCreateTeam ? 'text-acid' : 'text-gray-600'}`}>add_circle</span>
              </div>
            </button>

            <button
              onClick={() => {
                setShowJoinTeam(true);
                setShowCreateTeam(false);
                setError('');
              }}
              className={`flex-1 py-4 px-4 rounded-xl border transition-all duration-300 text-left relative overflow-hidden group ${showJoinTeam ? 'border-electric-purple bg-electric-purple/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
            >
              <span className="relative z-10 flex flex-col gap-1">
                <span className={`font-bold uppercase tracking-wider text-sm ${showJoinTeam ? 'text-electric-purple' : 'text-gray-400 group-hover:text-white'}`}>Join Team</span>
                <span className="text-xs text-gray-500">Enter a code</span>
              </span>
              <div className={`absolute bottom-2 right-2 transition-transform duration-300 ${showJoinTeam ? 'scale-110' : 'scale-100 opacity-50'}`}>
                <span className={`material-symbols-outlined text-3xl ${showJoinTeam ? 'text-electric-purple' : 'text-gray-600'}`}>group_add</span>
              </div>
            </button>
          </div>

          {showCreateTeam && (
            <div className="p-6 bg-white/5 border border-white/10 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
              <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-acid rounded-full" /> Create New Team
              </h4>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="teamName" className="text-gray-400 mb-2 block">Team Name</Label>
                  <Input
                    id="teamName"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter team name"
                    disabled={actionLoading}
                    className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-acid focus:ring-1 focus:ring-acid"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={createTeam} disabled={actionLoading} className="bg-acid text-black hover:bg-acid-hover font-bold">
                    {actionLoading ? 'Creating...' : 'Create Team'}
                  </Button>
                  <Button
                    onClick={() => setShowCreateTeam(false)}
                    variant="outline"
                    disabled={actionLoading}
                    className="bg-transparent border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {showJoinTeam && (
            <div className="p-6 bg-white/5 border border-white/10 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
              <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-electric-purple rounded-full" /> Join Existing Team
              </h4>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="teamCode" className="text-gray-400 mb-2 block">Team Code</Label>
                  <Input
                    id="teamCode"
                    value={teamCode}
                    onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-digit team code"
                    maxLength={6}
                    disabled={actionLoading}
                    className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 font-mono uppercase tracking-widest focus:border-electric-purple focus:ring-1 focus:ring-electric-purple"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={joinTeam} disabled={actionLoading} className="bg-electric-purple text-white hover:bg-electric-purple/80 font-bold">
                    {actionLoading ? 'Joining...' : 'Join Team'}
                  </Button>
                  <Button
                    onClick={() => setShowJoinTeam(false)}
                    variant="outline"
                    disabled={actionLoading}
                    className="bg-transparent border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}