import type { Player } from '@/lib/schemas/player'
import type { Team } from '@/lib/schemas/team'
import type { Tournament } from '@/lib/schemas/tournament'

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
]
