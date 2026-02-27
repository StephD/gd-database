/**
 * Color and style constants sourced from galaxydefense-webapp.
 * Used to visually identify game element types across the app.
 */

// --- Turret Types ---

export const TURRET_TYPE_CLASSES: Record<string, string> = {
  Physical: 'bg-sky-200 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
  Energy: 'bg-green-300 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  Electric: 'bg-purple-300 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  Fire: 'bg-amber-300 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  'Force-field': 'bg-indigo-300 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
}

export const TURRET_TYPE_BORDER: Record<string, string> = {
  Physical: 'border-l-sky-400',
  Energy: 'border-l-green-400',
  Electric: 'border-l-purple-400',
  Fire: 'border-l-amber-400',
  'Force-field': 'border-l-indigo-400',
}

// --- Chip Rarities ---

export const CHIP_RARITY_CLASSES: Record<string, string> = {
  Common: 'bg-zinc-300 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200',
  Fine: 'bg-green-400 text-green-900 dark:bg-green-800 dark:text-green-100',
  Rare: 'bg-blue-400 text-blue-900 dark:bg-blue-800 dark:text-blue-100',
  Epic: 'bg-purple-400 text-purple-900 dark:bg-purple-800 dark:text-purple-100',
  Legendary: 'bg-orange-400 text-orange-900 dark:bg-orange-800 dark:text-orange-100',
  Supreme: 'bg-red-400 text-red-900 dark:bg-red-800 dark:text-red-100',
  Ultimate: 'bg-gradient-to-r from-red-400 via-green-400 to-blue-400 text-white',
}

export const CHIP_RARITY_ORDER = ['Common', 'Fine', 'Rare', 'Epic', 'Legendary', 'Supreme', 'Ultimate'] as const
export type ChipRarity = typeof CHIP_RARITY_ORDER[number]

// --- Gear Types ---

export const GEAR_TYPE_CLASSES: Record<string, string> = {
  Armor: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
  Helmet: 'bg-amber-200 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  'Energy Core': 'bg-cyan-200 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300',
  Boots: 'bg-lime-200 text-lime-800 dark:bg-lime-900/50 dark:text-lime-300',
  Shield: 'bg-indigo-200 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
  Weapon: 'bg-rose-200 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300',
}

// --- Helpers ---

const DEFAULT_BADGE = 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
const DEFAULT_BORDER = 'border-l-zinc-300 dark:border-l-zinc-600'

export function getTurretTypeClasses(type: string | null | undefined): string {
  if (!type) return DEFAULT_BADGE
  return TURRET_TYPE_CLASSES[type] ?? DEFAULT_BADGE
}

export function getTurretTypeBorderClass(type: string | null | undefined): string {
  if (!type) return DEFAULT_BORDER
  return TURRET_TYPE_BORDER[type] ?? DEFAULT_BORDER
}

export function getChipRarityClasses(rarity: string | null | undefined): string {
  if (!rarity) return DEFAULT_BADGE
  return CHIP_RARITY_CLASSES[rarity] ?? DEFAULT_BADGE
}

export function getGearTypeClasses(gearType: string | null | undefined): string {
  if (!gearType) return DEFAULT_BADGE
  return GEAR_TYPE_CLASSES[gearType] ?? DEFAULT_BADGE
}
