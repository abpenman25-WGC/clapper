import React, { useMemo, useRef, useState } from "react"
import * as THREE from "three"

import { useAnimationFrame, useTimeline } from "@/hooks"
import { useCursorGeometry } from "@/hooks/useCursorGeometry"
import { leftBarTrackScaleWidth } from "@/constants/themes"

const CURSOR_WIDTH_IN_PX = 2

const SPEED_RESOLUTION = 50 // px/sec
const MAX_SPEED = 200
const GRADIENT_EXPONENT = 3

export function Cursor() {
  // TEMPORARILY DISABLED FOR REACT 19 MIGRATION
  return null;
};