export interface System {
  id: string
  name: string
  color: string
  created_at: string
}

export interface Process {
  id: string
  system_id: string
  title: string
  category: string | null
  tags: string[]
  is_favorite: boolean
  created_by: string
  created_at: string
  updated_at: string
  // joined
  system?: System
  step_count?: number
}

export interface Step {
  id: string
  process_id: string
  order: number
  text: string
  warning: string | null
  image_url: string | null
}

export interface StepDraft {
  id?: string           // present when editing existing step
  order: number
  text: string
  warning: string
  image_url: string | null
  imageFile?: File      // pending upload, not yet in Storage
  imagePreview?: string // local object URL for preview
}
