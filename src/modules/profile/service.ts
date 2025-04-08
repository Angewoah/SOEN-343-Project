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

export async function getUserProfilesWithInterests(interests: string | null) {
  if (!interests) return
  try {
    let interestsArray = interests.split(',');
    interestsArray = interestsArray.map(str => str.trim())

    if(interestsArray.length > 0)
    {
      let textQuery = "";
      interestsArray.forEach(function (tag, index) {
        if(!tag)
          return

        textQuery += ("'" + tag + "'");
        if(index != (interestsArray.length-1) )
          textQuery += "|"
      });

      const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .textSearch("interests", textQuery, {
        config: "english",
      });

      if (error) throw error
      return data;
    }
    
  } catch (error) {
    console.error('Error fetching user profile:', error)
    throw error
  }
}