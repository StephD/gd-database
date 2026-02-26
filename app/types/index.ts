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
  name: string
  description: string | null
  image_url: string | null
  hp_star1: number | null
  hp_star2: number | null
  hp_star3: number | null
  hp_star4: number | null
  hp_star5: number | null
  def_star1: number | null
  def_star2: number | null
  def_star3: number | null
  def_star4: number | null
  def_star5: number | null
  parent_id: string | null
  submitted_by: string | null
  created_at: string
  updated_at: string | null
}

export interface Guardian {
  id: string
  name: string
  description: string | null
  image_url: string | null
  hp_star1: number | null
  hp_star2: number | null
  hp_star3: number | null
  hp_star4: number | null
  hp_star5: number | null
  def_star1: number | null
  def_star2: number | null
  def_star3: number | null
  def_star4: number | null
  def_star5: number | null
  parent_id: string | null
  submitted_by: string | null
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

export type EntityTable = 'turrets' | 'chips' | 'frames' | 'guardians' | 'rangers'
export type OthersSubtype = 'frames' | 'guardians' | 'rangers'
export type EntityRow = Turret | Chip | Frame | Guardian | Ranger
