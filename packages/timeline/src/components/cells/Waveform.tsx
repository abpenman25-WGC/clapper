import React, { useRef, useEffect, useMemo } from 'react';
// TEMPORARILY DISABLED FOR REACT 19 MIGRATION
// import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ClapTrack } from '@aitube/clap';

import { TimelineSegment } from '@/types';

type WaveformVariant = 'stereo' | 'mono' | 'compact';

type WaveformProps = {
  segment: TimelineSegment;
  track: ClapTrack;
  cellWidth: number;
  cellHeight: number;
  durationInSteps: number;
  opacity?: number;
  color?: string;
  variant?: WaveformVariant;
  lineSpacing?: number;
  thickness?: number;
  topOrBottomFillOpacity?: number;
  middleFillOpacity?: number;
  isHovered?: boolean;
};

export const Waveform: React.FC<WaveformProps> = (props: WaveformProps) => {
  // TEMPORARILY DISABLED FOR REACT 19 MIGRATION
  return null;
};