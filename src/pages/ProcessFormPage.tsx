import { useState, useEffect, FormEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useSystems } from '../hooks/useSystems'
import { useAuth } from '../context/AuthContext'
import { StepDraft, Step } from '../types'
import { resizeAndConvertToWebP } from '../lib/imageUtils'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

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
  const [steps, setSteps] = useState<StepDraft[]>([
    { order: 0, text: '', warning: '', image_url: null },
  ])
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
          data.map((s: Step) => ({
            id: s.id,
            order: s.order,
            text: s.text,
            warning: s.warning ?? '',
            image_url: s.image_url,
          }))
        )
      })
  }, [id])

  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      { order: prev.length, text: '', warning: '', image_url: null },
    ])
  }

  const removeStep = (index: number) => {
    setSteps((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, order: i }))
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

  const updateStep = (
    index: number,
    field: keyof StepDraft,
    value: string | File | null | undefined
  ) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    )
  }

  const handleImageSelect = (index: number, file: File | undefined) => {
    if (!file) return
    const preview = URL.createObjectURL(file)
    setSteps((prev) =>
      prev.map((s, i) =>
        i === index
          ? {
              ...s,
              imageFile: file,
              imagePreview: preview,
              image_url: null,
            }
          : s
      )
    )
  }

  const removeImage = (index: number) => {
    setSteps((prev) =>
      prev.map((s, i) =>
        i === index
          ? {
              ...s,
              imageFile: undefined,
              imagePreview: undefined,
              image_url: null,
            }
          : s
      )
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

  const uploadImage = async (
    stepDraft: StepDraft,
    processId: string
  ): Promise<string | null> => {
    if (!stepDraft.imageFile) return stepDraft.image_url
    const blob = await resizeAndConvertToWebP(stepDraft.imageFile)
    const path = `${processId}/${uuid()}.webp`
    const { error } = await supabase.storage
      .from('screenshots')
      .upload(path, blob, { contentType: 'image/webp' })
    if (error) {
      toast.error('Error subiendo imagen')
      return null
    }
    const { data } = supabase.storage.from('screenshots').getPublicUrl(path)
    return data.publicUrl
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
      await supabase
        .from('processes')
        .update(processPayload)
        .eq('id', id!)
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

    // Delete all existing steps then re-insert (simplest strategy for reorder)
    if (isEdit) {
      await supabase.from('steps').delete().eq('process_id', processId)
    }

    const validSteps = steps.filter((s) => s.text.trim())
    const stepsToInsert = await Promise.all(
      validSteps.map(async (s, i) => {
        const imageUrl = await uploadImage(s, processId!)
        return {
          process_id: processId,
          order: i,
          text: s.text.trim(),
          warning: s.warning.trim() || null,
          image_url: imageUrl,
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
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addStep}
              >
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
                    onChange={(e) =>
                      updateStep(i, 'warning', e.target.value)
                    }
                    placeholder="Nota de advertencia (opcional)"
                    className="mt-2 w-full rounded-lg border border-warn/40 bg-warn-bg px-3 py-1.5 text-sm text-warn placeholder-warn/60 focus:outline-none focus:ring-1 focus:ring-warn"
                  />
                  <div className="mt-3">
                    {step.imagePreview || step.image_url ? (
                      <div className="flex items-start gap-3">
                        <img
                          src={step.imagePreview ?? step.image_url ?? ''}
                          alt="Preview"
                          className="h-20 w-auto rounded-lg border border-border object-cover"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeImage(i)}
                        >
                          Quitar imagen
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer text-sm text-muted transition-colors hover:text-ink">
                        📎 Agregar imagen
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleImageSelect(i, e.target.files?.[0])
                          }
                        />
                      </label>
                    )}
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
