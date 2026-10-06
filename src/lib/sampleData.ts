import type { Player } from '@/lib/schemas/player'
import type { Team } from '@/lib/schemas/team'

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
