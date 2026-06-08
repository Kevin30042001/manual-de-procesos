import { useState, useEffect, FormEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useSystems } from '../hooks/useSystems'
import { useAuth } from '../context/AuthContext'
import { StepDraft, Step, NewImage, SubStep } from '../types'
import { resizeAndConvertToWebP } from '../lib/imageUtils'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

const emptyStep = (order: number): StepDraft => ({
  order,
  text: '',
  warning: '',
  image_url: null,
  image_urls: [],
  newImages: [],
  substeps: [],
})

export function ProcessFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { systems } = useSystems()

  const [title, setTitle] = useState('')
  const [systemId, setSystemId] = useState('')
  const [category, setCategory] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [steps, setSteps] = useState<StepDraft[]>([emptyStep(0)])
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!id) return
    supabase
      .from('processes')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (!data) return
        setTitle(data.title)
        setSystemId(data.system_id)
        setCategory(data.category ?? '')
        setTagsInput(data.tags?.join(', ') ?? '')
      })
    supabase
      .from('steps')
      .select('*')
      .eq('process_id', id)
      .order('order')
      .then(({ data }) => {
        if (!data || data.length === 0) return
        setSteps(
          data.map((s: Step & Record<string, unknown>) => {
            const urls = Array.isArray(s.image_urls) ? (s.image_urls as string[]) : []
            const fallback = s.image_url ? [s.image_url] : []
            return {
              id: s.id,
              order: s.order,
              text: s.text,
              warning: s.warning ?? '',
              image_url: s.image_url,
              image_urls: urls.length > 0 ? urls : fallback,
              newImages: [],
              substeps: Array.isArray(s.substeps) ? (s.substeps as SubStep[]) : [],
            }
          })
        )
      })
  }, [id])

  const addStep = () => {
    setSteps((prev) => [...prev, emptyStep(prev.length)])
  }

  const removeStep = (index: number) => {
    setSteps((prev) =>
      prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i }))
    )
  }

  const moveStep = (index: number, dir: -1 | 1) => {
    setSteps((prev) => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next.map((s, i) => ({ ...s, order: i }))
    })
  }

  const updateStep = (index: number, field: 'text' | 'warning', value: string) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    )
  }

  // --- Imágenes (varias) ---
  const handleImagesSelect = (index: number, files: FileList | null) => {
    if (!files || files.length === 0) return
    const added: NewImage[] = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setSteps((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, newImages: [...s.newImages, ...added] } : s
      )
    )
  }

  const removeExistingImage = (index: number, url: string) => {
    setSteps((prev) =>
      prev.map((s, i) =>
        i === index
          ? { ...s, image_urls: s.image_urls.filter((u) => u !== url) }
          : s
      )
    )
  }

  const removeNewImage = (index: number, k: number) => {
    setSteps((prev) =>
      prev.map((s, i) =>
        i === index
          ? { ...s, newImages: s.newImages.filter((_, j) => j !== k) }
          : s
      )
    )
  }

  // --- Sub-pasos ---
  const addSubstep = (index: number) => {
    setSteps((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, substeps: [...s.substeps, { text: '' }] } : s
      )
    )
  }

  const updateSubstep = (index: number, k: number, value: string) => {
    setSteps((prev) =>
      prev.map((s, i) =>
        i === index
          ? {
              ...s,
              substeps: s.substeps.map((ss, j) =>
                j === k ? { text: value } : ss
              ),
            }
          : s
      )
    )
  }

  const removeSubstep = (index: number, k: number) => {
    setSteps((prev) =>
      prev.map((s, i) =>
        i === index
          ? { ...s, substeps: s.substeps.filter((_, j) => j !== k) }
          : s
      )
    )
  }

  const moveSubstep = (index: number, k: number, dir: -1 | 1) => {
    setSteps((prev) =>
      prev.map((s, i) => {
        if (i !== index) return s
        const next = [...s.substeps]
        const target = k + dir
        if (target < 0 || target >= next.length) return s
        ;[next[k], next[target]] = [next[target], next[k]]
        return { ...s, substeps: next }
      })
    )
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = 'El título es obligatorio.'
    if (!systemId) errs.system = 'Selecciona un sistema.'
    const hasValidStep = steps.some((s) => s.text.trim())
    if (!hasValidStep) errs.steps = 'Agrega al menos un paso con texto.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Sube las imágenes nuevas y devuelve sus URLs públicas
  const uploadNewImages = async (
    newImages: NewImage[],
    processId: string
  ): Promise<string[]> => {
    const urls: string[] = []
    for (const ni of newImages) {
      const blob = await resizeAndConvertToWebP(ni.file)
      const path = `${processId}/${uuid()}.webp`
      const { error } = await supabase.storage
        .from('screenshots')
        .upload(path, blob, { contentType: 'image/webp' })
      if (error) {
        toast.error('Error subiendo una imagen')
        continue
      }
      const { data } = supabase.storage.from('screenshots').getPublicUrl(path)
      urls.push(data.publicUrl)
    }
    return urls
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    const processPayload = {
      title: title.trim(),
      system_id: systemId,
      category: category.trim() || null,
      tags,
      updated_at: new Date().toISOString(),
      ...(!isEdit && { created_by: user!.id }),
    }

    let processId = id
    if (isEdit) {
      await supabase.from('processes').update(processPayload).eq('id', id!)
    } else {
      const { data } = await supabase
        .from('processes')
        .insert(processPayload)
        .select()
        .single()
      processId = data?.id
    }

    if (!processId) {
      toast.error('Error guardando proceso')
      setSaving(false)
      return
    }

    // Borra los pasos y reinserta (estrategia simple para reordenar)
    if (isEdit) {
      await supabase.from('steps').delete().eq('process_id', processId)
    }

    const validSteps = steps.filter((s) => s.text.trim())
    const stepsToInsert = await Promise.all(
      validSteps.map(async (s, i) => {
        const uploaded = await uploadNewImages(s.newImages, processId!)
        const finalUrls = [...s.image_urls, ...uploaded]
        return {
          process_id: processId,
          order: i,
          text: s.text.trim(),
          warning: s.warning.trim() || null,
          image_url: finalUrls[0] ?? null, // legado / compatibilidad
          image_urls: finalUrls,
          substeps: s.substeps
            .map((ss) => ({ text: ss.text.trim() }))
            .filter((ss) => ss.text),
        }
      })
    )

    await supabase.from('steps').insert(stepsToInsert)
    toast.success(isEdit ? 'Proceso actualizado' : 'Proceso creado')
    navigate(isEdit ? `/processes/${processId}` : '/')
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link
          to={isEdit ? `/processes/${id}` : '/'}
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-ink"
        >
          ← Cancelar
        </Link>
        <h1 className="mb-6 font-serif text-2xl font-bold text-ink">
          {isEdit ? 'Editar proceso' : 'Nuevo proceso'}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Input
            label="Título *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-ink">Sistema *</label>
            <select
              value={systemId}
              onChange={(e) => setSystemId(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">Seleccionar...</option>
              {systems.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.system && (
              <p className="text-xs text-red-600">{errors.system}</p>
            )}
          </div>

          <Input
            label="Categoría"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="ej. Mantenimiento de ubicaciones"
          />
          <Input
            label="Etiquetas (separadas por coma)"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="ej. slots, GLS, ubicaciones"
          />

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-serif font-semibold text-ink">Pasos</h2>
              <Button type="button" variant="secondary" size="sm" onClick={addStep}>
                + Paso
              </Button>
            </div>
            {errors.steps && (
              <p className="mb-2 text-xs text-red-600">{errors.steps}</p>
            )}
            <div className="flex flex-col gap-4">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-surface p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-bg text-xs font-bold text-accent">
                      {i + 1}
                    </span>
                    <div className="ml-auto flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveStep(i, -1)}
                        disabled={i === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveStep(i, 1)}
                        disabled={i === steps.length - 1}
                      >
                        ↓
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStep(i)}
                        disabled={steps.length === 1}
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                  <textarea
                    value={step.text}
                    onChange={(e) => updateStep(i, 'text', e.target.value)}
                    placeholder="Descripción del paso *"
                    rows={2}
                    className="w-full resize-none rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <input
                    type="text"
                    value={step.warning}
                    onChange={(e) => updateStep(i, 'warning', e.target.value)}
                    placeholder="Nota de advertencia (opcional)"
                    className="mt-2 w-full rounded-lg border border-warn/40 bg-warn-bg px-3 py-1.5 text-sm text-warn placeholder-warn/60 focus:outline-none focus:ring-1 focus:ring-warn"
                  />

                  {/* Sub-pasos */}
                  <div className="mt-3 rounded-lg border border-dashed border-border bg-bg/60 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                        Sub-pasos
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addSubstep(i)}
                      >
                        + Sub-paso
                      </Button>
                    </div>
                    {step.substeps.length === 0 ? (
                      <p className="text-xs text-muted">
                        Sin sub-pasos. Úsalos para detallar acciones dentro de este paso.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {step.substeps.map((sub, k) => (
                          <div key={k} className="flex items-center gap-2">
                            <span className="w-5 shrink-0 text-center font-serif text-sm font-semibold text-accent">
                              {String.fromCharCode(97 + k)}.
                            </span>
                            <input
                              type="text"
                              value={sub.text}
                              onChange={(e) =>
                                updateSubstep(i, k, e.target.value)
                              }
                              placeholder="Descripción del sub-paso"
                              className="flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-ink placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                            />
                            <button
                              type="button"
                              onClick={() => moveSubstep(i, k, -1)}
                              disabled={k === 0}
                              className="px-1 text-muted transition-colors hover:text-ink disabled:opacity-30"
                              title="Subir"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => moveSubstep(i, k, 1)}
                              disabled={k === step.substeps.length - 1}
                              className="px-1 text-muted transition-colors hover:text-ink disabled:opacity-30"
                              title="Bajar"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => removeSubstep(i, k)}
                              className="px-1 text-muted transition-colors hover:text-red-600"
                              title="Quitar"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Capturas (varias) */}
                  <div className="mt-3">
                    {(step.image_urls.length > 0 || step.newImages.length > 0) && (
                      <div className="mb-2 flex flex-wrap gap-2">
                        {step.image_urls.map((url) => (
                          <div
                            key={url}
                            className="relative h-20 w-20 overflow-hidden rounded-lg border border-border"
                          >
                            <img
                              src={url}
                              alt="Captura"
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(i, url)}
                              className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow hover:bg-red-600"
                              title="Quitar"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        {step.newImages.map((ni, k) => (
                          <div
                            key={k}
                            className="relative h-20 w-20 overflow-hidden rounded-lg border border-accent"
                          >
                            <img
                              src={ni.preview}
                              alt="Nueva captura"
                              className="h-full w-full object-cover"
                            />
                            <span className="absolute bottom-0 left-0 right-0 bg-accent/80 text-center text-[10px] text-white">
                              nueva
                            </span>
                            <button
                              type="button"
                              onClick={() => removeNewImage(i, k)}
                              className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow hover:bg-red-600"
                              title="Quitar"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <label className="cursor-pointer text-sm text-muted transition-colors hover:text-ink">
                      📎 Agregar captura(s)
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          handleImagesSelect(i, e.target.files)
                          e.target.value = ''
                        }}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving
                ? 'Guardando...'
                : isEdit
                  ? 'Guardar cambios'
                  : 'Crear proceso'}
            </Button>
            <Link to={isEdit ? `/processes/${id}` : '/'}>
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
