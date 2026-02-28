/** Auth roles: guest (not logged in), user (logged in, not admin), admin */
export type UserRole = 'guest' | 'user' | 'admin'

/** Matches galaxydefense-webapp user_profiles table */
export interface UserProfile {
  id: string
  username: string
  email: string
  user_id: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Turret {
  id: string
  name: string
  description: string | null
  type: string | null
  dmg_type: string | null
  duration: number | null
  cooldown: number | null
  atk_range: number | null
  explosion_dmg: number | null
  dmg_range: number | null
  dmg_interval: number | null
  penetration: number | null
  image_url: string | null
  parent_id: string | null
  submitted_by: string | null
  created_at: string
}

export interface Chip {
  id: string
  name: string
  description: string | null
  compatible_gears: string | null
  affected_turrets: string | null
  boost_type: string | null
  value_common: number | null
  value_fine: number | null
  value_rare: number | null
  value_epic: number | null
  value_legendary: number | null
  value_supreme: number | null
  value_ultimate: number | null
  valuable: boolean | null
  image_url: string | null
  parent_id: string | null
  submitted_by: string | null
  created_at: string
  updated_at: string | null
}

export interface Frame {
  id: string
  name: string | null
  description: string | null
  quality: string | null
  stars: StarLevel[] | null
  created_at: string
  updated_at: string | null
}

/** One star level: object with arbitrary key → string value (e.g. "CRIT DMG": "60%") */
export type StarLevel = Record<string, string> | null

export interface Guardian {
  id: string
  turret_id: string
  name: string | null
  description: string | null
  quality: string | null
  stars: StarLevel[] | null
  created_at: string
  updated_at: string | null
}

export interface Livery {
  id: string
  turret_id: string
  turret_name?: string
  name: string | null
  description: string | null
  quality: string | null
  stars: StarLevel[] | null
  created_at: string
  updated_at: string | null
}

export interface Ranger {
  id: string
  name: string
  description: string | null
  image_url: string | null
  atk_star1: number | null
  atk_star2: number | null
  atk_star3: number | null
  atk_star4: number | null
  atk_star5: number | null
  spd_star1: number | null
  spd_star2: number | null
  spd_star3: number | null
  spd_star4: number | null
  spd_star5: number | null
  parent_id: string | null
  submitted_by: string | null
  created_at: string
  updated_at: string | null
}

export interface TurretType {
  id: string
  name: string
}

export type TurretTypeName = 'Physical' | 'Energy' | 'Electric' | 'Fire' | 'Force-field'

export type EntityTable = 'turrets' | 'chips' | 'frames' | 'guardians' | 'liveries' | 'rangers'
export type OthersSubtype = 'frames' | 'guardians' | 'liveries'
export type EntityRow = Turret | Chip | Frame | Guardian | Livery | Ranger
