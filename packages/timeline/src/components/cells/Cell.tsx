import { Suspense, useMemo } from "react"
// TEMPORARILY DISABLED FOR REACT 19 MIGRATION
// import { a } from "@react-spring/three"
import { ClapSegmentCategory } from "@aitube/clap"

import { useTimeline } from "@/hooks"
import { useHoveredSegment } from "@/hooks/useHoveredSegment"
import { leftBarTrackScaleWidth, topBarTimeScaleHeight } from "@/constants/themes"
import { TimelineSegment } from "@/types"
import { useSegmentChanges } from "@/hooks/useSegmentChanges"

import { ImageCell } from "./ImageCell"
import { VideoCell } from "./VideoCell"
import { TextCell } from "./TextCell"
import { RedrawButton } from "./RedrawButton"
import { AudioCell } from "./AudioCell"
// TEMPORARILY DISABLED FOR REACT 19 MIGRATION
// import { useThree } from "@react-three/fiber"
import { SegmentArea, SegmentPointerEvent } from "@/types/timeline"
import { SegmentIcon } from "../icons/SegmentIcon"

import { getSegmentColorScheme } from "@/utils/getSegmentColorScheme"
import { setBodyCursor } from "@/utils"

export function Cell({
  segment: s
}: {
  segment: TimelineSegment
}) {
  // TEMPORARILY DISABLED FOR REACT 19 MIGRATION
  // const { size } = useThree()
  const showBetaFeatures = useTimeline(s => s.showBetaFeatures)

  // TODO JULIAN: we should optimize this component because it causes
  // some performance issues due to the numerous re-renders


  // this is only used to react to changes in the segment
  const segmentChanged = useSegmentChanges(s)
  
  const colorScheme = useMemo(() => getSegmentColorScheme(s), [segmentChanged])

  const cellWidth = useTimeline((s) => s.cellWidth)
  const getCellHeight = useTimeline((s) => s.getCellHeight)
  const getVerticalCellPosition = useTimeline((s) => s.getVerticalCellPosition)

  const cellHeight = getCellHeight(s.track)
  const verticalCellPosition = getVerticalCellPosition(0, s.track)

  const durationInMsPerStep = useTimeline(s => s.durationInMsPerStep)

  // used to react to changes impacting tracks
  const tracks = useTimeline(s => s.tracks)

  const durationInSteps = (
    (s.endTimeInMs - s.startTimeInMs) / durationInMsPerStep
  )

  const startTimeInSteps = (
    s.startTimeInMs / durationInMsPerStep
  )

  const widthInPx = durationInSteps * cellWidth

  const currentZoomLevel = useTimeline(s => s.currentZoomLevel)

  // we need to round this one to avoid *too* many re-renders
  const widthInPxAfterZoom = Math.round(currentZoomLevel * durationInSteps * cellWidth)

  const isHovered = useHoveredSegment(s.id)

  // note: this is not reactive (as a general rule, we never want to be reactive in here)
  // note: as a general rule, we should avoid "reactive" state updates like this
  const isResizing = useTimeline(s => s.isResizing)
  // const isResizing = useTimeline.getState().isResizing

  const SpecializedCell =
    s.assetUrl.startsWith("data:image/")
      ? ImageCell
      : s.assetUrl.startsWith("data:video/")
      ? VideoCell
    : s.assetUrl.startsWith("data:audio/")
      ? AudioCell
      : TextCell

  const setHoveredSegment = useTimeline(s => s.setHoveredSegment)
    
  const handleSegmentEvent = useTimeline(s => s.handleSegmentEvent)

  // cells are rendered often (eg. whenever we mouse the mouse from one cell to another)
  // because we need to handle their color change on hover / transition
  // console.log(`re-rendering a <Cell>`)

  const posX = 
    (startTimeInSteps * cellWidth) 

    // the position of a RoundedBox is defined from its center
    // so we have to shift its container (the a.mesh)
    // to the right, exactly one half of the RoundedBox's width
    + ((durationInSteps * cellWidth) / 2)

  const posY =
    -verticalCellPosition 
    + (cellHeight / 2)

  // TEMPORARILY DISABLED FOR REACT 19 MIGRATION - 3D TIMELINE RENDERING
  // The timeline visualization is temporarily disabled while we wait for
  // @react-three/fiber to support React 19
  return null;
}

