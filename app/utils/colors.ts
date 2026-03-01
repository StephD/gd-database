/**
 * Color and style constants sourced from galaxydefense-webapp.
 * Used to visually identify game element types across the app.
 */

// --- Turret Types ---

export const TURRET_TYPE_CLASSES: Record<string, string> = {
  "Physical": 'bg-sky-200 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
  "Energy": 'bg-green-300 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  "Electric": 'bg-purple-300 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  "Fire": 'bg-blue-300 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  "Force-field": 'bg-slate-300 text-slate-800 dark:bg-slate-900/50 dark:text-slate-300',
  "Other": 'bg-gray-200 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300',
}

export const TURRET_TYPE_BORDER: Record<string, string> = {
  "Physical": 'border-l-sky-400',
  "Energy": 'border-l-green-400',
  "Electric": 'border-l-purple-400',
  "Fire": 'border-l-amber-400',
  "Force-field": 'border-l-indigo-400',
}

// --- Chip Rarities ---

export const CHIP_RARITY_CLASSES: Record<string, string> = {
  "Common": 'bg-zinc-300 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200',
  "Fine": 'bg-green-400 text-green-900 dark:bg-green-800 dark:text-green-100',
  "Rare": 'bg-blue-400 text-blue-900 dark:bg-blue-800 dark:text-blue-100',
  "Epic": 'bg-purple-400 text-purple-900 dark:bg-purple-800 dark:text-purple-100',
  "Legendary": 'bg-orange-400 text-orange-900 dark:bg-orange-800 dark:text-orange-100',
  "Supreme": 'bg-red-400 text-red-900 dark:bg-red-800 dark:text-red-100',
  "Ultimate": 'bg-gradient-to-r from-red-400 via-green-400 to-blue-400 text-white',
  "Other": 'bg-gray-200 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300',
}

export const CHIP_RARITY_ORDER = ["Common", "Fine", "Rare", "Epic", "Legendary", "Supreme", "Ultimate"] as const
export type ChipRarity = typeof CHIP_RARITY_ORDER[number]

// --- Gear Types ---
export const GEAR_TYPE_CLASSES: Record<string, string> = {
  "Armor": 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
  "Helmet": 'bg-amber-200 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  "Energy Core": 'bg-cyan-200 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300',
  "Boots": 'bg-lime-200 text-lime-800 dark:bg-lime-900/50 dark:text-lime-300',
  "Shield": 'bg-indigo-200 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
  "Weapon": 'bg-rose-200 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300',
  "Other": 'bg-gray-200 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300',
}

export const CARD_TYPE_CLASSES: Record<string, string> = {
  "Normal": 'bg-cyan-200 text-black dark:bg-cyan-900/50 dark:text-cyan-300',
  "Chain": 'bg-cyan-400 text-black dark:bg-cyan-900/50 dark:text-cyan-300',
  "Combo": 'bg-cyan-600 text-white dark:bg-cyan-900/50 dark:text-cyan-300',
  "Elite": 'bg-purple-500 text-white dark:bg-purple-900/50 dark:text-purple-300',
  "Other": 'bg-gray-200 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300',
}

// --- Card Tiers ---

export const CARD_TIER_CLASSES: Record<string, string> = {
  "T1": 'text-muted-foreground',
  "T2": 'text-primary',
  "T3": 'text-black',
}

// --- Quality (Frames / Guardians / Liveries) ---
// Reuses chip rarity palette for consistency
export const QUALITY_CLASSES: Record<string, string> = {
  "Common": 'bg-zinc-300 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200',
  "Fine": 'bg-green-400 text-green-900 dark:bg-green-800 dark:text-green-100',
  "Rare": 'bg-blue-400 text-blue-900 dark:bg-blue-800 dark:text-blue-100',
  "Epic": 'bg-purple-400 text-purple-900 dark:bg-purple-800 dark:text-purple-100',
  "Legendary": 'bg-orange-400 text-orange-900 dark:bg-orange-800 dark:text-orange-100',
  "Supreme": 'bg-red-400 text-red-900 dark:bg-red-800 dark:text-red-100',
  "Ultimate": 'bg-gradient-to-r from-red-400 via-green-400 to-blue-400 text-white',
  "Other": 'bg-gray-200 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300',
}

/** Left border for row/card overlay by quality */
export const QUALITY_BORDER: Record<string, string> = {
  "Common": 'border-l-zinc-400',
  "Fine": 'border-l-green-500',
  "Rare": 'border-l-blue-500',
  "Epic": 'border-l-purple-500',
  "Legendary": 'border-l-orange-500',
  "Supreme": 'border-l-red-500',
  "Ultimate": 'border-l-amber-400',
  "Other": 'border-l-gray-400',
}

/** Very soft background for table row / card by quality */
export const QUALITY_SOFT_BG: Record<string, string> = {
  "Common": 'bg-zinc-100/80 dark:bg-zinc-800/30',
  "Fine": 'bg-green-50/90 dark:bg-green-900/20',
  "Rare": 'bg-blue-50/90 dark:bg-blue-900/20',
  "Epic": 'bg-purple-50/90 dark:bg-purple-900/20',
  "Legendary": 'bg-orange-50/90 dark:bg-orange-900/20',
  "Supreme": 'bg-red-50/90 dark:bg-red-900/20',
  "Ultimate": 'bg-amber-50/80 dark:bg-amber-900/20',
  "Other": 'bg-gray-100/80 dark:bg-gray-800/25',
}

/** Soft pill/badge by quality (lighter than QUALITY_CLASSES) */
export const QUALITY_SOFT_PILL: Record<string, string> = {
  "Common": 'bg-zinc-200/80 text-zinc-700 dark:bg-zinc-700/40 dark:text-zinc-300',
  "Fine": 'bg-green-200/70 text-green-800 dark:bg-green-800/35 dark:text-green-200',
  "Rare": 'bg-blue-200/70 text-blue-800 dark:bg-blue-800/35 dark:text-blue-200',
  "Epic": 'bg-purple-200/70 text-purple-800 dark:bg-purple-800/35 dark:text-purple-200',
  "Legendary": 'bg-orange-200/70 text-orange-800 dark:bg-orange-800/35 dark:text-orange-200',
  "Supreme": 'bg-red-200/70 text-red-800 dark:bg-red-800/35 dark:text-red-200',
  "Ultimate": 'bg-amber-200/70 text-amber-900 dark:bg-amber-800/35 dark:text-amber-200',
  "Other": 'bg-gray-200/80 text-gray-700 dark:bg-gray-700/40 dark:text-gray-300',
}

const DEFAULT_BADGE = 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
const DEFAULT_BORDER = 'border-l-zinc-300 dark:border-l-zinc-600'
const DEFAULT_SOFT_BG = 'bg-transparent'
const DEFAULT_SOFT_PILL = 'bg-zinc-200/80 text-zinc-700 dark:bg-zinc-700/40 dark:text-zinc-300'

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

export function getQualityClasses(quality: string | null | undefined): string {
  if (!quality) return DEFAULT_BADGE
  return QUALITY_CLASSES[quality] ?? DEFAULT_BADGE
}

export function getQualityBorderClass(quality: string | null | undefined): string {
  if (!quality) return DEFAULT_BORDER
  return QUALITY_BORDER[quality] ?? DEFAULT_BORDER
}

export function getQualitySoftBgClass(quality: string | null | undefined): string {
  if (!quality) return DEFAULT_SOFT_BG
  return QUALITY_SOFT_BG[quality] ?? DEFAULT_SOFT_BG
}

export function getQualitySoftPillClass(quality: string | null | undefined): string {
  if (!quality) return DEFAULT_SOFT_PILL
  return QUALITY_SOFT_PILL[quality] ?? DEFAULT_SOFT_PILL
}

export function getGearTypeClasses(gearType: string | null | undefined): string {
  if (!gearType) return DEFAULT_BADGE
  return GEAR_TYPE_CLASSES[gearType] ?? DEFAULT_BADGE
}
