import { getSupabaseClient } from "../../supabase/client";

const supabase = getSupabaseClient();

export async function getUserProfile(userId: string | null) {
    if (!userId) return
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
  
      if (error) throw error
  
      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      throw error
    }
  }