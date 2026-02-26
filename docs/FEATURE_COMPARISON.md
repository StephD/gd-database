# Feature Comparison: gd-database vs galaxydefense-webapp

gd-database is adapted to use the same Supabase project and auth logic as galaxydefense-webapp.

## Auth & Config Alignment

| Aspect | galaxydefense-webapp | gd-database |
|--------|----------------------|-------------|
| Profile table | `user_profiles` (user_id, is_admin) | Same |
| Admin check | `user_profiles.is_admin` | Same |
| Env vars | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | `SUPABASE_URL`, `SUPABASE_KEY` |
| Login | `signInWithPassword` | Same (via @nuxtjs/supabase) |
| Signup | `signUpWithEmail` | Same |
| Logout | `signOut` | Same |
| Password reset | `resetPasswordForEmail` | Same (added) |
| Auto profile on signup | Trigger on auth.users | Same (unchanged) |

---

## Feature Comparison

### galaxydefense-webapp

| Feature | Description |
|---------|-------------|
| **Cards** | Browse card database (turret relations) |
| **Chips** | Browse chips, add new chips (authenticated) |
| **Reports** | Submit reports (suggestions, translation, optimisation, other), voting, admin triage |
| **Boosters** | Admin-only Discord booster management |
| **ApiData** | API data view |
| **Auth** | Login modal, user_profiles, is_admin |

### gd-database

| Feature | Description |
|---------|-------------|
| **Turrets** | Browse turrets, propose edits (inline parent_id revisions) |
| **Chips** | Browse chips, propose edits |
| **Others** | Frames, Guardians, Rangers (star stats 1–5) |
| **Admin Review** | Approve/reject pending edits |
| **Auth** | Full login page, user_profiles, is_admin, password reset |

---

## Integration Candidates

### 1. Cards (High fit)

- **Table**: `cards` (id, name, type, tier, turret_id, combo_turret_id, parent_card_id, description)
- **Integration**: Add Cards as a new browse category under `/db/cards` or `/db/others/cards`
- **Notes**: Same pattern as turrets/chips; could support parent_id revision system

### 2. Reports (Medium fit)

- **Table**: `reports` (id, title, description, user_id, mod_id, type, votes)
- **Integration**: Add `/reports` page for authenticated users to submit reports (suggestions, translation, optimisation, other)
- **Notes**: Different from edit revisions; community feedback channel

### 3. Feature suggestions (Medium fit)

- **Table**: `upcoming_features` (id, title, description, votes, who_proposed)
- **Integration**: Add "Suggest feature" page with voting
- **Notes**: Lightweight; could reuse existing reports flow or separate page

### 4. Boosters (Low priority for gd-database)

- **Table**: `boosters` (Discord-related)
- **Integration**: Admin-only booster management page
- **Notes**: Likely better left in galaxydefense-webapp; niche admin tool

### 5. Gear types / Turret types (Reference data)

- **Tables**: `gear_types`, `turret_types`
- **Integration**: Use as dropdowns/filters when displaying or editing chips/turrets
- **Notes**: Already referenced by chips (compatible_gears, affected_turrets)

---

## Shared Supabase Setup

Both apps can use the same Supabase project:

1. Use the same `SUPABASE_URL` and `SUPABASE_KEY` (gd-database) / `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (galaxydefense-webapp)
2. `user_profiles` is shared — admin status set in one app applies in both
3. Run gd-database migration after galaxydefense migrations (user_profiles must exist)
