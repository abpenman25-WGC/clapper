'use client'

import { useEffect, useState } from 'react'
import { ClapSegmentCategory, ClapEntity, ClapSegment } from '@aitube/clap'
import { useTimeline } from '@aitube/timeline'
import { useTheme } from '@/services/ui/useTheme'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PromptBookSection {
  category: ClapSegmentCategory
  segments: ClapSegment[]
}

export function PromptBookEditor() {
  const theme = useTheme()
  const [sections, setSections] = useState<PromptBookSection[]>([])
  const [entities, setEntities] = useState<ClapEntity[]>([])
  const [projectInfo, setProjectInfo] = useState<{
    title: string
    description: string
    width: number
    height: number
    frameRate: number
  }>({
    title: '',
    description: '',
    width: 0,
    height: 0,
    frameRate: 0,
  })

  useEffect(() => {
    const timeline = useTimeline.getState()
    const clap = timeline.getClap()

    if (clap) {
      // Get project info
      setProjectInfo({
        title: clap.meta.title || 'Untitled Project',
        description: clap.meta.description || '',
        width: clap.meta.width,
        height: clap.meta.height,
        frameRate: clap.meta.frameRate,
      })

      // Get entities (characters, locations)
      const allEntities = Object.values(clap.entities)
      setEntities(allEntities)

      // Group segments by category
      const segmentsByCategory: Record<ClapSegmentCategory, ClapSegment[]> = {} as any

      clap.segments.forEach((segment) => {
        if (!segmentsByCategory[segment.category]) {
          segmentsByCategory[segment.category] = []
        }
        segmentsByCategory[segment.category].push(segment)
      })

      // Convert to array and sort
      const sectionsArray = Object.entries(segmentsByCategory).map(([category, segs]) => ({
        category: category as ClapSegmentCategory,
        segments: segs.sort((a, b) => a.startTimeInMs - b.startTimeInMs),
      }))

      setSections(sectionsArray)
    }
  }, [])

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

  const characters = entities.filter((e) => e.category === ClapSegmentCategory.CHARACTER)
  const locations = entities.filter((e) => e.category === ClapSegmentCategory.LOCATION)

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
                <span className="font-semibold">Title:</span> {projectInfo.title}
              </div>
              {projectInfo.description && (
                <div>
                  <span className="font-semibold">Description:</span> {projectInfo.description}
                </div>
              )}
              <div className="flex gap-4 text-sm">
                <span>
                  <span className="font-semibold">Resolution:</span> {projectInfo.width}x
                  {projectInfo.height}
                </span>
                <span>
                  <span className="font-semibold">Frame Rate:</span> {projectInfo.frameRate} fps
                </span>
              </div>
            </CardContent>
          </Card>

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
                                  theme.editorAccentColor ||
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
          {sections.length === 0 && characters.length === 0 && locations.length === 0 && (
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
