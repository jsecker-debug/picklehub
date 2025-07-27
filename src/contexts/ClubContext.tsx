import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

type Club = {
  id: string
  name: string
  description?: string
  location?: string
  status: string
  role?: string
  member_count?: number
}

type ClubContextType = {
  selectedClub: Club | null
  selectedClubId: string | null
  setSelectedClub: (club: Club | null) => void
  setSelectedClubId: (id: string | null) => void
  userClubs: Club[]
  loading: boolean
  refreshClubs: () => Promise<void>
}

const ClubContext = createContext<ClubContextType>({
  selectedClub: null,
  selectedClubId: null,
  setSelectedClub: () => {},
  setSelectedClubId: () => {},
  userClubs: [],
  loading: true,
  refreshClubs: async () => {},
})

export function ClubProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [userClubs, setUserClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  
  const selectedClubId = selectedClub?.id || null
  
  const setSelectedClubId = (id: string | null) => {
    const club = userClubs.find(c => c.id === id) || null
    setSelectedClub(club)
  }

  const fetchUserClubs = async () => {
    if (!user) {
      setUserClubs([])
      setSelectedClub(null)
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('club_memberships')
        .select(`
          club_id,
          role,
          status,
          clubs!inner (
            id,
            name,
            description,
            location,
            status
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
      
      if (error) {
        console.error('Error fetching user clubs:', error)
        return
      }
      
      const clubs = data?.map(membership => ({
        id: membership.clubs.id,
        name: membership.clubs.name,
        description: membership.clubs.description,
        location: membership.clubs.location,
        role: membership.role,
        member_count: 0,
        status: membership.clubs.status
      })) || []
      
      setUserClubs(clubs)
      
      // Set first club as selected if none selected and clubs exist
      if (clubs.length > 0 && !selectedClub) {
        setSelectedClub(clubs[0])
      }
      
      // Clear selected club if it's no longer in user's clubs
      if (selectedClub && !clubs.find(c => c.id === selectedClub.id)) {
        setSelectedClub(clubs.length > 0 ? clubs[0] : null)
      }
    } catch (error) {
      console.error('Error fetching user clubs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserClubs()
  }, [user])

  const refreshClubs = async () => {
    await fetchUserClubs()
  }

  return (
    <ClubContext.Provider 
      value={{ 
        selectedClub,
        selectedClubId,
        setSelectedClub,
        setSelectedClubId, 
        userClubs, 
        loading,
        refreshClubs 
      }}
    >
      {children}
    </ClubContext.Provider>
  )
}

export const useClub = () => {
  const context = useContext(ClubContext)
  if (context === undefined) {
    throw new Error('useClub must be used within a ClubProvider')
  }
  return context
}