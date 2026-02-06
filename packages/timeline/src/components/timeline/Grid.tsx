import React from "react"

import { DEFAULT_NB_TRACKS } from "@/constants"
import {
  useAxis,
  useVerticalGridLines,
  useHorizontalGridLines,
  useTimeline
} from "@/hooks"

import { hslToHex } from "@/utils"

export function Grid() {
  // TEMPORARILY DISABLED FOR REACT 19 MIGRATION
  return null;
};