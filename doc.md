
Database Schema: Tables & Columns
boosters — discord_name, game_id, active, discord_nickname, premium_since, discord_id, updated_at

cards — id, name, type, tier, turret_id, combo_turret_id, parent_card_id, description, created_at, updated_at

chips — id, name, description, compatible_gears, affected_turrets, boost_type, value_common, value_fine, value_rare, value_epic, value_legendary, value_supreme, value_ultimate, created_at, updated_at, valuable

code-redeem — id, created_at, updated_at, code, expired_date, game_version

gear_types — id, name, created_at, updated_at

monster — id, created_at, name, race, weakness, strength, feature, comments

reports — id, created_at, title, description, user_id, mod_id, type, votes

turret_types — id, name, created_at, updated_at

turrets — id, name, description, created_at, type, dmg_type, duration, cooldown, atk_range, explosion_dmg, dmg_range, dmg_interval, penetration

upcoming_features — id, created_at, title, description, votes, who_proposed

decrypted_secrets — id, name, description, secret, decrypted_secret, key_id, nonce, created_at, updated_at

secrets — id, name, description, secret, key_id, nonce, created_at, updated_at