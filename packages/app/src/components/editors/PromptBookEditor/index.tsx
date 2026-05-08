'use client'

import { useMemo } from 'react'
import { ClapSegmentCategory } from '@aitube/clap'
import { useTimeline } from '@aitube/timeline'
import { useTheme } from '@/services/ui/useTheme'
import { useScriptEditor } from '@/services/editors'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type ParsedScriptPromptKind = 'image' | 'voice' | 'sound' | 'music' | 'camera' | 'other'

type ParsedScriptPrompt = {
  id: string
  label: string
  kind: ParsedScriptPromptKind
  content: string
}

type PromptBookSegment = {
  id: string
  category: ClapSegmentCategory
  startTimeInMs: number
  endTimeInMs: number
  prompt?: string
  entityId?: string
  label?: string
  assetUrl?: string
}

type PromptBookEntity = {
  id: string
  category: ClapSegmentCategory
  label?: string
  age?: number
  gender?: string
  description?: string
  appearance?: string
  imagePrompt?: string
  audioPrompt?: string
}

export function PromptBookEditor() {
  const theme = useTheme()

  const title = useTimeline((s) => s.title)
  const description = useTimeline((s) => s.description)
  const synopsis = useTimeline((s) => s.synopsis)
  const width = useTimeline((s) => s.width)
  const height = useTimeline((s) => s.height)
  const frameRate = useTimeline((s) => s.frameRate)
  const bpm = useTimeline((s) => s.bpm)
  const imagePrompt = useTimeline((s) => s.imagePrompt)
  const storyPrompt = useTimeline((s) => s.storyPrompt)
  const systemPrompt = useTimeline((s) => s.systemPrompt)
  const currentScript = useScriptEditor((s) => s.current)
  const allSegments = useTimeline((s) => s.segments) as PromptBookSegment[]
  const allEntities = useTimeline((s) => s.entities) as PromptBookEntity[]
  // subscribe to change counters so the view updates reactively even if array refs are mutated in place
  const allSegmentsChanged = useTimeline((s) => s.allSegmentsChanged)
  const entitiesChanged = useTimeline((s) => s.entitiesChanged)

  const sections = useMemo(() => {
    const segmentsByCategory: Record<string, PromptBookSegment[]> = {}
    allSegments.forEach((segment) => {
      if (!segmentsByCategory[segment.category]) {
        segmentsByCategory[segment.category] = []
      }
      segmentsByCategory[segment.category].push(segment)
    })
    return Object.entries(segmentsByCategory).map(([category, segs]) => ({
      category: category as ClapSegmentCategory,
      segments: [...segs].sort((a, b) => a.startTimeInMs - b.startTimeInMs),
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSegments, allSegmentsChanged])

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getCategoryIcon = (category: ClapSegmentCategory) => {
    const icons: Record<string, string> = {
      CHARACTER: '👤',
      LOCATION: '📍',
      DIALOGUE: '💬',
      ACTION: '🎬',
      CAMERA: '🎥',
      LIGHTING: '💡',
      WEATHER: '🌤️',
      MUSIC: '🎵',
      SOUND: '🔊',
      STYLE: '🎨',
      TIME: '⏰',
      ERA: '📅',
      TRANSITION: '⚡',
      VIDEO: '🎞️',
      IMAGE: '🖼️',
    }
    return icons[category] || '📝'
  }

  const characters = useMemo(
    () => allEntities.filter((e) => e.category === ClapSegmentCategory.CHARACTER),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allEntities, entitiesChanged]
  )
  const locations = useMemo(
    () => allEntities.filter((e) => e.category === ClapSegmentCategory.LOCATION),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allEntities, entitiesChanged]
  )

  const entityById = useMemo(() => {
    return allEntities.reduce<Record<string, PromptBookEntity>>((acc, entity) => {
      acc[entity.id] = entity
      return acc
    }, {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allEntities, entitiesChanged])

  const promptFocusedCategories: ClapSegmentCategory[] = [
    ClapSegmentCategory.IMAGE,
    ClapSegmentCategory.VIDEO,
    ClapSegmentCategory.DIALOGUE,
    ClapSegmentCategory.SOUND,
    ClapSegmentCategory.MUSIC,
    ClapSegmentCategory.CAMERA,
    ClapSegmentCategory.STYLE,
    ClapSegmentCategory.LIGHTING,
  ]

  const segmentHasPromptData = ({
    category,
    prompt,
    entityId,
  }: {
    category: ClapSegmentCategory
    prompt?: string
    entityId?: string
  }) => {
    const linkedEntity = entityId ? entityById[entityId] : undefined
    const hasSegmentPrompt = !!prompt?.trim()

    if (hasSegmentPrompt) {
      return true
    }

    if (
      category === ClapSegmentCategory.IMAGE ||
      category === ClapSegmentCategory.VIDEO ||
      category === ClapSegmentCategory.CAMERA ||
      category === ClapSegmentCategory.STYLE ||
      category === ClapSegmentCategory.LIGHTING
    ) {
      return !!linkedEntity?.imagePrompt?.trim()
    }

    if (
      category === ClapSegmentCategory.DIALOGUE ||
      category === ClapSegmentCategory.SOUND ||
      category === ClapSegmentCategory.MUSIC
    ) {
      return !!linkedEntity?.audioPrompt?.trim()
    }

    return false
  }

  const promptSections = useMemo(() => {
    return sections
      .filter((section) => promptFocusedCategories.includes(section.category))
      .map((section) => ({
        ...section,
        segments: section.segments.filter((segment) =>
          segmentHasPromptData({
            category: section.category,
            prompt: segment.prompt,
            entityId: segment.entityId,
          })
        ),
      }))
      .filter((section) => section.segments.length > 0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections, entityById])

  const getPromptRoleLabel = (category: ClapSegmentCategory) => {
    if (category === ClapSegmentCategory.IMAGE || category === ClapSegmentCategory.VIDEO) {
      return 'Visual prompt'
    }
    if (category === ClapSegmentCategory.DIALOGUE) {
      return 'Voice/Dialogue prompt'
    }
    if (category === ClapSegmentCategory.SOUND) {
      return 'Sound prompt'
    }
    if (category === ClapSegmentCategory.MUSIC) {
      return 'Music prompt'
    }
    if (category === ClapSegmentCategory.CAMERA) {
      return 'Camera cue'
    }
    if (category === ClapSegmentCategory.LIGHTING) {
      return 'Lighting cue'
    }
    if (category === ClapSegmentCategory.STYLE) {
      return 'Style cue'
    }
    return 'Prompt'
  }

  const parsedScriptPrompts = useMemo<ParsedScriptPrompt[]>(() => {
    const screenplaySource = (currentScript || storyPrompt || '').trim()

    if (!screenplaySource) {
      return []
    }

    const classifyPromptKind = (label: string, content: string): ParsedScriptPromptKind => {
      const text = `${label} ${content}`.toLowerCase()

      if (text.includes('camera')) {
        return 'camera'
      }
      if (text.includes('speech') || text.includes('voice') || text.includes('tts')) {
        return 'voice'
      }
      if (text.includes('audioldm') || text.includes('sound') || text.includes('sfx')) {
        return 'sound'
      }
      if (text.includes('music')) {
        return 'music'
      }
      if (
        text.includes('image') ||
        text.includes('visual') ||
        text.includes('render') ||
        /^prompt\s*\d+$/i.test(label.trim())
      ) {
        return 'image'
      }

      return 'other'
    }

    const parsed: ParsedScriptPrompt[] = []
    const seen = new Set<string>()

    // Matches patterns like:
    // (Prompt 1 = """...""")
    // (Bark (Suno) Speech Prompt = """...""")
    const blockRegex = /\(?\s*([^=\n]+?)\s*=\s*"""([\s\S]*?)"""\s*\)?/g

    let match: RegExpExecArray | null = null
    while ((match = blockRegex.exec(screenplaySource)) !== null) {
      const rawLabel = match[1]?.trim() || 'Prompt'
      const rawContent = match[2]?.trim() || ''

      if (!rawContent) {
        continue
      }

      const normalizedContent = rawContent
        .split('|')
        .map((part) => part.trim())
        .filter(Boolean)
        .join('\n')

      const dedupeKey = `${rawLabel}::${normalizedContent}`
      if (seen.has(dedupeKey)) {
        continue
      }
      seen.add(dedupeKey)

      parsed.push({
        id: `${rawLabel}-${parsed.length}`,
        label: rawLabel,
        kind: classifyPromptKind(rawLabel, normalizedContent),
        content: normalizedContent,
      })
    }

    return parsed
  }, [currentScript, storyPrompt])

  const promptKindBadge = (kind: ParsedScriptPromptKind) => {
    if (kind === 'image') return 'IMAGE'
    if (kind === 'voice') return 'VOICE'
    if (kind === 'sound') return 'SOUND'
    if (kind === 'music') return 'MUSIC'
    if (kind === 'camera') return 'CAMERA'
    return 'OTHER'
  }

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden"
      style={{
        background: theme.editorBgColor || theme.defaultBgColor || '#ffffff',
        color: theme.editorTextColor || theme.defaultTextColor || '#000000',
      }}
    >
      {/* Header */}
      <div
        className="flex flex-col gap-2 border-b p-4"
        style={{
          borderBottomColor: theme.editorBorderColor || theme.defaultBorderColor || '#e5e7eb',
        }}
      >
        <h1 className="text-2xl font-bold">📖 Prompt Book</h1>
        <p className="text-sm opacity-70">
          A comprehensive theatrical-style production guide containing all prompts, cues, and
          production information
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-6 p-6">
          {/* Project Information */}
          <Card>
            <CardHeader>
              <CardTitle>🎬 Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-semibold">Title:</span> {title || 'Untitled Project'}
              </div>
              {description && (
                <div>
                  <span className="font-semibold">Description:</span> {description}
                </div>
              )}
              {synopsis && (
                <div>
                  <span className="font-semibold">Synopsis:</span> {synopsis}
                </div>
              )}
              <div className="flex gap-4 text-sm">
                <span>
                  <span className="font-semibold">Resolution:</span> {width}x{height}
                </span>
                <span>
                  <span className="font-semibold">Frame Rate:</span> {frameRate} fps
                </span>
                <span>
                  <span className="font-semibold">BPM:</span> {Math.round(bpm * 100) / 100}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Global Prompt Settings */}
          {(imagePrompt || systemPrompt || storyPrompt) && (
            <Card>
              <CardHeader>
                <CardTitle>🧠 Global Generation Prompts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {imagePrompt && (
                  <div>
                    <p className="text-sm font-semibold">Global Image Prompt</p>
                    <p className="whitespace-pre-wrap text-sm opacity-90">{imagePrompt}</p>
                  </div>
                )}
                {systemPrompt && (
                  <div>
                    <p className="text-sm font-semibold">System Prompt</p>
                    <p className="whitespace-pre-wrap text-sm opacity-90">{systemPrompt}</p>
                  </div>
                )}
                {storyPrompt && (
                  <p className="text-xs opacity-65">
                    Story prompt detected and kept in project metadata; Prompt Book now focuses on
                    per-cue image/voice/sound/music/camera prompts.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Script-embedded prompts */}
          {parsedScriptPrompts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>🧾 Extracted Script Prompt Blocks</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {parsedScriptPrompts.map((item, index) => (
                    <AccordionItem key={item.id} value={`script-prompt-${index}`}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{promptKindBadge(item.kind)}</Badge>
                          <span className="text-sm font-semibold">{item.label}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="rounded border p-3 text-sm">
                          <p className="whitespace-pre-wrap opacity-90">{item.content}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}

          {/* Characters Section */}
          {characters.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>👥 Characters & Cast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {characters.map((char) => (
                    <div
                      key={char.id}
                      className="rounded-lg border p-4"
                      style={{
                        borderColor:
                          theme.editorBorderColor || theme.defaultBorderColor || '#e5e7eb',
                      }}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-lg font-bold">{char.label}</span>
                        {char.age && <Badge variant="secondary">{char.age}yo</Badge>}
                        {char.gender && char.gender !== 'object' && (
                          <Badge variant="secondary">{char.gender}</Badge>
                        )}
                      </div>
                      {char.description && (
                        <p className="mb-2 text-sm opacity-80">{char.description}</p>
                      )}
                      {char.appearance && (
                        <p className="text-sm">
                          <span className="font-semibold">Appearance:</span> {char.appearance}
                        </p>
                      )}
                      {char.audioPrompt && (
                        <p className="text-sm">
                          <span className="font-semibold">Voice:</span> {char.audioPrompt}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prompt-centric cue extraction */}
          {promptSections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>🎛️ Image, Voice, Sound, Music & Camera Prompts</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {promptSections.map((section, index) => (
                    <AccordionItem key={`prompt-${index}`} value={`prompt-section-${index}`}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <span>{getCategoryIcon(section.category)}</span>
                          <span className="font-semibold">{section.category}</span>
                          <Badge variant="outline">{section.segments.length} cues</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pt-2">
                          {section.segments.map((segment) => {
                            const linkedEntity = segment.entityId ? entityById[segment.entityId] : undefined
                            return (
                              <div
                                key={`prompt-cue-${segment.id}`}
                                className="rounded border-l-4 bg-opacity-10 p-3"
                                style={{
                                  borderLeftColor:
                                    theme.defaultPrimaryColor ||
                                    '#3b82f6',
                                }}
                              >
                                <div className="mb-2 flex items-center justify-between">
                                  <span className="text-sm font-semibold">
                                    {formatTime(segment.startTimeInMs)} - {formatTime(segment.endTimeInMs)}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {segment.label && (
                                      <Badge variant="secondary" className="text-xs">
                                        {segment.label}
                                      </Badge>
                                    )}
                                    {linkedEntity?.label && (
                                      <Badge variant="outline" className="text-xs">
                                        {linkedEntity.label}
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                {segment.prompt && (
                                  <div className="mb-2">
                                    <p className="text-xs font-semibold opacity-70">
                                      {getPromptRoleLabel(section.category)}
                                    </p>
                                    <p className="whitespace-pre-wrap text-sm">{segment.prompt}</p>
                                  </div>
                                )}

                                {(section.category === ClapSegmentCategory.IMAGE ||
                                  section.category === ClapSegmentCategory.VIDEO ||
                                  section.category === ClapSegmentCategory.CAMERA ||
                                  section.category === ClapSegmentCategory.STYLE) &&
                                  linkedEntity?.imagePrompt && (
                                    <div className="mb-2">
                                      <p className="text-xs font-semibold opacity-70">
                                        Linked Entity Visual Prompt
                                      </p>
                                      <p className="whitespace-pre-wrap text-sm opacity-90">
                                        {linkedEntity.imagePrompt}
                                      </p>
                                    </div>
                                  )}

                                {(section.category === ClapSegmentCategory.DIALOGUE ||
                                  section.category === ClapSegmentCategory.SOUND ||
                                  section.category === ClapSegmentCategory.MUSIC) &&
                                  linkedEntity?.audioPrompt && (
                                    <div className="mb-2">
                                      <p className="text-xs font-semibold opacity-70">
                                        Linked Entity Voice Prompt
                                      </p>
                                      <p className="whitespace-pre-wrap text-sm opacity-90">
                                        {linkedEntity.audioPrompt}
                                      </p>
                                    </div>
                                  )}

                              </div>
                            )
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}

          {/* Locations Section */}
          {locations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>📍 Locations & Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {locations.map((loc) => (
                    <div
                      key={loc.id}
                      className="rounded-lg border p-4"
                      style={{
                        borderColor:
                          theme.editorBorderColor || theme.defaultBorderColor || '#e5e7eb',
                      }}
                    >
                      <div className="mb-2 text-lg font-bold">{loc.label}</div>
                      {loc.description && (
                        <p className="text-sm opacity-80">{loc.description}</p>
                      )}
                      {loc.imagePrompt && (
                        <p className="mt-2 text-sm">
                          <span className="font-semibold">Visual Description:</span>{' '}
                          {loc.imagePrompt}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Production Cues & Segments */}
          {sections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>📋 Production Cues & Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {sections.map((section, index) => (
                    <AccordionItem key={index} value={`section-${index}`}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <span>{getCategoryIcon(section.category)}</span>
                          <span className="font-semibold">{section.category}</span>
                          <Badge variant="outline">{section.segments.length} cues</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pt-2">
                          {section.segments.map((segment) => (
                            <div
                              key={segment.id}
                              className="rounded border-l-4 bg-opacity-10 p-3"
                              style={{
                                borderLeftColor:
                                  theme.defaultPrimaryColor ||
                                  '#3b82f6',
                              }}
                            >
                              <div className="mb-1 flex items-center justify-between">
                                <span className="text-sm font-semibold">
                                  {formatTime(segment.startTimeInMs)} -{' '}
                                  {formatTime(segment.endTimeInMs)}
                                </span>
                                {segment.label && (
                                  <Badge variant="secondary" className="text-xs">
                                    {segment.label}
                                  </Badge>
                                )}
                              </div>
                              {segment.prompt && (
                                <p className="text-sm">
                                  <span className="font-semibold">Prompt:</span> {segment.prompt}
                                </p>
                              )}
                              {segment.assetUrl && (
                                <p className="mt-1 text-xs opacity-60">
                                  Asset: {segment.assetUrl.substring(0, 50)}...
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {sections.length === 0 &&
            characters.length === 0 &&
            locations.length === 0 &&
            parsedScriptPrompts.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-lg opacity-60">
                  No prompt book data available yet. Start by creating a project or importing a
                  script.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
