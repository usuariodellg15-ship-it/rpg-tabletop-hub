/**
 * SafeProfile represents a profile without sensitive fields (email).
 * Used when fetching profiles of other users (campaign members, creators, etc.)
 * Maps to the safe_profiles database view.
 */
export interface SafeProfile {
  id: string;
  user_id: string;
  name: string;
  avatar_url: string | null;
  subscription_plan: string;
  created_at: string;
  updated_at: string;
}
