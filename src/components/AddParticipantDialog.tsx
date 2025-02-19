import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { useQueryClient } from "@tanstack/react-query"

export function AddParticipantDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    level: '',
    gender: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      // Validate DUPR rating
      const level = parseFloat(formData.level)
      if (isNaN(level) || level < 2 || level > 8) {
        throw new Error('DUPR rating must be between 2 and 8')
      }

      // Create participant record
      const { error: participantError } = await supabase
        .from('participants')
        .insert([{
          name: `${formData.firstName} ${formData.lastName}`,
          level,
          gender: formData.gender,
          total_games_played: 0,
          wins: 0,
          losses: 0
        }])

      if (participantError) throw participantError

      toast({
        title: "Success",
        description: "Participant added successfully!",
      })

      // Reset form and close dialog
      setFormData({
        firstName: '',
        lastName: '',
        level: '',
        gender: ''
      })
      setIsOpen(false)

      // Refresh participants list
      queryClient.invalidateQueries({ queryKey: ["participants"] })
    } catch (error) {
      console.error('Error adding participant:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An error occurred while adding the participant',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Participant
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Participant</DialogTitle>
          <DialogDescription>
            Fill in the participant's details. All fields are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                name="firstName"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border rounded-md"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                name="lastName"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border rounded-md"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">DUPR Rating (2.00-8.00)</label>
            <input
              name="level"
              type="number"
              step="0.01"
              min="2"
              max="8"
              required
              className="mt-1 block w-full px-3 py-2 border rounded-md"
              value={formData.level}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              name="gender"
              required
              className="mt-1 block w-full px-3 py-2 border rounded-md"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Select gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Adding...' : 'Add Participant'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 