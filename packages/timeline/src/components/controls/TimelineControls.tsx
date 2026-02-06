import { useEffect, useRef } from "react"
import * as THREE from "three"
// TEMPORARILY DISABLED FOR REACT 19 MIGRATION
// import { useFrame, useThree } from "@react-three/fiber"
// import { MapControls } from "@react-three/drei"

import { leftBarTrackScaleWidth, topBarTimeScaleHeight } from "@/constants/themes"
import { useTimeline } from "@/hooks"
import { clamp } from "@/utils/clamp"

export function TimelineControls(props: any) {
  // TEMPORARILY DISABLED FOR REACT 19 MIGRATION
  return null;
};