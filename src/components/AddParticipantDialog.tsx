import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { PlusIcon } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { useClub } from "@/contexts/ClubContext"
import { useAuth } from "@/contexts/AuthContext"

export function AddParticipantDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()
  const { selectedClubId, selectedClub } = useClub()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    message: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!selectedClubId || !selectedClub) {
        throw new Error('No club selected')
      }

      if (!formData.email) {
        throw new Error('Email is required')
      }

      // For now, we'll store the invitation data in the user_data field
      // In a real system, you'd want to have a proper invitation table or email service
      const invitationData = {
        email: formData.email,
        invited_by: user?.id,
        invited_by_name: user?.user_metadata?.full_name || user?.email,
        club_name: selectedClub.name,
        invitation_type: 'email_invite',
        personal_message: formData.message
      };

      // Since the current table requires a user_id and we don't have one for email invites,
      // we'll create the invitation record using the current user's ID as a placeholder
      // and mark it in the user_data that it's an outgoing invitation
      const { error: inviteError } = await supabase
        .from('club_join_requests')
        .insert([{
          club_id: selectedClubId,
          user_id: user?.id, // Use current user's ID as the creator of the invitation
          message: `Invitation created for ${formData.email}: ${formData.message || `Invited to join ${selectedClub.name}`}`,
          user_data: invitationData,
          status: 'pending'
        }])

      if (inviteError) throw inviteError

      toast.success(`Invitation record created for ${formData.email}!`)

      // Reset form and close dialog
      setFormData({
        email: '',
        message: ''
      })
      setIsOpen(false)

      // Refresh members list
      queryClient.invalidateQueries({ queryKey: ["club-members", selectedClubId] })
    } catch (error) {
      console.error('Error sending invitation:', error)
      toast.error(error instanceof Error ? error.message : 'An error occurred while sending the invitation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <PlusIcon className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite New Member</DialogTitle>
          <DialogDescription>
            Create an invitation record for this club. Note: Email delivery is not yet implemented.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="member@example.com"
              className="bg-background border-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Personal Message (Optional)</Label>
            <Textarea
              id="message"
              name="message"
              rows={3}
              value={formData.message}
              onChange={handleChange}
              placeholder="Add a personal message to the invitation..."
              className="bg-background border-input"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 