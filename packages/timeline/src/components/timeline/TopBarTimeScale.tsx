import React, { useEffect, useMemo, useRef } from "react"
// TEMPORARILY DISABLED FOR REACT 19 MIGRATION
// import { useThree } from "@react-three/fiber"
// import { Plane, Text } from "@react-three/drei"

import { useTimeline } from "@/hooks"
import { useTimeScaleGraduations } from "@/hooks/useTimeScaleGraduations"
import { formatTimestamp } from "@/utils/formatTimestamp"

import { leftBarTrackScaleWidth, topBarTimeScaleHeight } from "@/constants/themes"

export function TopBarTimeScale() {
  // TEMPORARILY DISABLED FOR REACT 19 MIGRATION
  return null;
};