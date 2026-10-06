import type { Player } from '@/lib/schemas/player'
import type { Team } from '@/lib/schemas/team'
import type { Tournament, Match } from '@/lib/schemas/tournament'

export const samplePlayers: Player[] = [
  { id: 'player-001', name: 'Arjun Sharma', age: 28, place: 'Hyderabad', level: 'Advanced', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'player-002', name: 'Priya Nair', age: 25, place: 'Bangalore', level: 'Intermediate', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'player-003', name: 'Rohan Mehta', age: 32, place: 'Mumbai', level: 'Pro', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'player-004', name: 'Sneha Reddy', age: 22, place: 'Hyderabad', level: 'Beginner', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'player-005', name: 'Kiran Patel', age: 30, place: 'Ahmedabad', level: 'Intermediate', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'player-006', name: 'Divya Iyer', age: 27, place: 'Chennai', level: 'Advanced', createdAt: '2026-01-01T00:00:00.000Z' },
]

export const sampleTeams: Team[] = [
  { id: 'team-001', name: 'Smash Bros', playerIds: ['player-001', 'player-002'], createdAt: '2026-01-02T00:00:00.000Z' },
  { id: 'team-002', name: 'Net Ninjas', playerIds: ['player-003', 'player-004'], createdAt: '2026-01-02T00:00:00.000Z' },
  { id: 'team-003', name: 'Dink Masters', playerIds: ['player-005', 'player-006'], createdAt: '2026-01-02T00:00:00.000Z' },
  { id: 'team-004', name: 'Kitchen Kings', playerIds: ['player-001', 'player-003'], createdAt: '2026-01-02T00:00:00.000Z' },
  // Extra teams for the Drawn tournament sample (players reused across different pairings)
  { id: 'team-005', name: 'Volley Vipers', playerIds: ['player-002', 'player-004'], createdAt: '2026-01-03T00:00:00.000Z' },
  { id: 'team-006', name: 'Ace Attackers', playerIds: ['player-002', 'player-005'], createdAt: '2026-01-03T00:00:00.000Z' },
  { id: 'team-007', name: 'Drop Shot Duo', playerIds: ['player-004', 'player-006'], createdAt: '2026-01-03T00:00:00.000Z' },
  { id: 'team-008', name: 'Spin Doctors', playerIds: ['player-001', 'player-006'], createdAt: '2026-01-03T00:00:00.000Z' },
]

// 8-team Drawn tournament sample bracket (fixed match IDs)
const drawnMatches: Match[] = [
  // Round 1 (Quarterfinals) — 4 matches, no byes
  { id: 'match-r1-p0', round: 1, position: 0, type: 'Knockout', isBye: false, isWalkover: false, teamAId: 'team-001', teamBId: 'team-002', games: [], status: 'Scheduled' },
  { id: 'match-r1-p1', round: 1, position: 1, type: 'Knockout', isBye: false, isWalkover: false, teamAId: 'team-003', teamBId: 'team-004', games: [], status: 'Scheduled' },
  { id: 'match-r1-p2', round: 1, position: 2, type: 'Knockout', isBye: false, isWalkover: false, teamAId: 'team-005', teamBId: 'team-006', games: [], status: 'Scheduled' },
  { id: 'match-r1-p3', round: 1, position: 3, type: 'Knockout', isBye: false, isWalkover: false, teamAId: 'team-007', teamBId: 'team-008', games: [], status: 'Scheduled' },
  // Round 2 (Semifinals) — 2 matches
  { id: 'match-r2-p0', round: 2, position: 0, type: 'Knockout', isBye: false, isWalkover: false, teamAId: null, teamBId: null, games: [], status: 'Scheduled' },
  { id: 'match-r2-p1', round: 2, position: 1, type: 'Knockout', isBye: false, isWalkover: false, teamAId: null, teamBId: null, games: [], status: 'Scheduled' },
  // Final
  { id: 'match-r3-p0', round: 3, position: 0, type: 'Knockout', isBye: false, isWalkover: false, teamAId: null, teamBId: null, games: [], status: 'Scheduled' },
  // 3rd Place
  { id: 'match-r3-p1', round: 3, position: 1, type: 'ThirdPlace', isBye: false, isWalkover: false, teamAId: null, teamBId: null, games: [], status: 'Scheduled' },
]

export const sampleTournaments: Tournament[] = [
  {
    id: 'tournament-001',
    name: 'Hyderabad Open 2026',
    venue: 'Lal Bahadur Stadium, Hyderabad',
    startDate: '2026-03-10',
    endDate: '2026-03-12',
    pointsPerGame: 11,
    bestOf: 3,
    prizes: { champion: 50000, runnerUp: 25000, thirdPlace: 10000 },
    teamIds: ['team-001', 'team-002', 'team-003', 'team-004'],
    status: 'Draft',
    matches: [],
    sponsors: [
      {
        id: 'sponsor-001',
        name: 'SportsFit India',
        tier: 'Title',
        website: 'https://sportsfit.example.com',
      },
      {
        id: 'sponsor-002',
        name: 'Pickle Pro Gear',
        tier: 'Gold',
        website: 'https://picklepro.example.com',
      },
    ],
    createdAt: '2026-01-10T00:00:00.000Z',
  },
  {
    id: 'tournament-002',
    name: 'Bangalore Cup 2026',
    venue: 'Kanteerava Indoor Stadium, Bangalore',
    startDate: '2026-04-05',
    endDate: '2026-04-06',
    pointsPerGame: 15,
    bestOf: 1,
    prizes: { champion: 30000, runnerUp: 15000, thirdPlace: 5000 },
    teamIds: ['team-001', 'team-002', 'team-003', 'team-004'],
    status: 'Draft',
    matches: [],
    sponsors: [
      // Same sponsor as tournament-001 but at Gold tier (case/spacing variant in name)
      {
        id: 'sponsor-003',
        name: 'Sportsfit  India', // extra space — will be normalised to same as sponsor-001
        tier: 'Gold',
      },
      // A sponsor at Silver tier
      {
        id: 'sponsor-004',
        name: 'Pickle Pro Gear', // same as sponsor-002 but at Silver tier
        tier: 'Silver',
        website: 'https://picklepro.example.com',
      },
      {
        id: 'sponsor-005',
        name: 'Court Vision Sports',
        tier: 'Title',
        website: 'https://courtvision.example.com',
      },
    ],
    createdAt: '2026-01-15T00:00:00.000Z',
  },
  {
    id: 'tournament-003',
    name: 'Chennai Classic 2026',
    venue: 'Jawaharlal Nehru Indoor Stadium, Chennai',
    startDate: '2026-05-15',
    endDate: '2026-05-17',
    pointsPerGame: 11,
    bestOf: 3,
    prizes: { champion: 75000, runnerUp: 35000, thirdPlace: 15000 },
    teamIds: ['team-001', 'team-002', 'team-003', 'team-004', 'team-005', 'team-006', 'team-007', 'team-008'],
    status: 'Drawn',
    matches: drawnMatches,
    sponsors: [
      { id: 'sponsor-006', name: 'Chennai Sports Club', tier: 'Title', website: 'https://csc.example.com' },
    ],
    createdAt: '2026-02-01T00:00:00.000Z',
  },
]
