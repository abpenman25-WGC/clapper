import React from "react"
// TEMPORARILY DISABLED FOR REACT 19 MIGRATION
// import { Plane, Text } from "@react-three/drei"

import {
useTimeline
} from "@/hooks"

import { leftBarTrackScaleWidth } from "@/constants/themes"
import { useHorizontaTrackLines } from "@/hooks/useHorizontalTrackLines"
import { LineGeometry } from "three/examples/jsm/Addons.js"
import { hslToHex } from "@/utils"

export function LeftBarTrackScale() {
  // TEMPORARILY DISABLED FOR REACT 19 MIGRATION
  return null;
};