export interface System {
  id: string
  name: string
  color: string
  created_by: string
  created_at: string
}

export interface Process {
  id: string
  system_id: string
  title: string
  category: string | null
  tags: string[]
  is_favorite: boolean
  is_shared: boolean
  created_by: string
  created_at: string
  updated_at: string
  // joined
  system?: System
  step_count?: number
}

export interface SubStep {
  text: string
}

export interface Step {
  id: string
  process_id: string
  order: number
  text: string
  warning: string | null
  image_url: string | null      // legado: primera imagen (se conserva por compatibilidad)
  image_urls: string[]          // varias capturas
  substeps: SubStep[]           // sub-pasos
}

// Imagen pendiente de subir (solo vive en el formulario, no se guarda así)
export interface NewImage {
  file: File
  preview: string // object URL local para vista previa
}

export interface StepDraft {
  id?: string                // presente al editar un paso existente
  order: number
  text: string
  warning: string
  image_url: string | null   // legado
  image_urls: string[]       // URLs ya subidas que se conservan
  newImages: NewImage[]      // archivos pendientes de subir
  substeps: SubStep[]
}
