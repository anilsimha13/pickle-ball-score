export type { Player, CreatePlayerInput } from '@/lib/schemas/player'
export type { Team, CreateTeamInput } from '@/lib/schemas/team'

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Pro'
export type TournamentStatus = 'Draft' | 'Drawn' | 'InProgress' | 'Completed' | 'Announced'
export type TournamentMatchType = 'Knockout' | 'ThirdPlace'
export type MatchStatus = 'Scheduled' | 'Live' | 'Completed'
export type ContactSubject = 'General' | 'TournamentEnquiry' | 'Sponsorship' | 'Support'
export type SponsorTier = 'Title' | 'Gold' | 'Silver'

export interface Session {
  email: string
  name: string
  expiresAt: string
}
