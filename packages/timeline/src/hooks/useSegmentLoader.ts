import { useEffect, useRef } from "react"
import * as THREE from "three"
// TEMPORARILY DISABLED FOR REACT 19 MIGRATION
// import { useThree } from "@react-three/fiber"

import { similar, sliceSegments } from "@/utils"

import { useTimeline } from "./useTimeline"
import { TimelineSegment, TimelineStore } from "@/types"
import { leftBarTrackScaleWidth } from "@/constants/themes"

export const useSegmentLoader = ({
  refreshRateInMs,
}: {
  refreshRateInMs: number
}):
  {
    visibleSegments: TimelineSegment[]
    loadedSegments: TimelineSegment[]
  }=> {
  // TEMPORARILY DISABLED FOR REACT 19 MIGRATION
  // The 3D timeline visualization is temporarily disabled
  return {
    visibleSegments: [],
    loadedSegments: []
  };
};