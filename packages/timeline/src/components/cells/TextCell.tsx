import React from 'react';

import { RoundedBox, Text } from "@react-three/drei"
import { a } from "@react-spring/three"

import { clampWebGLText } from "@/utils"

import { SpecializedCellProps } from "./types"

function TextCellComponent({
  segment: s,
  cellWidth,
  cellHeight,
  isHovered,
  setHoveredSegment,
  durationInSteps,
  startTimeInSteps,
  colorScheme,
  widthInPx,
  widthInPxAfterZoom,
  isResizing,
  track
}: SpecializedCellProps) {

  const padding = 4;
  const fontSize = 13;
  const lineHeight = 1.9;

  const text = s.label || s.prompt || "";

  // --- Prevent clipping: add descent padding ---
  const descentPadding = fontSize * 0.35;

  // Wrap text based on available width
  const lines = React.useMemo(() => {
    const availableWidth = widthInPx - padding * 6;
    const wrapped = clampWebGLText(text, availableWidth, Number.MAX_SAFE_INTEGER);

    console.log(`📝 Wrapped lines (${s.id.slice(0, 8)}):`, wrapped.length);
    return wrapped;
  }, [text, widthInPx, padding, s.id]);

  // Height calculation
  const lineSpacing = fontSize * lineHeight;
  const totalTextHeight = lines.length * lineSpacing;

  const calculatedHeight =
    totalTextHeight +
    padding * 8 +
    descentPadding;

  const dynamicCellHeight = Math.max(cellHeight, calculatedHeight);

  console.log(`📐 Height calc (${s.id.slice(0, 8)}):`, {
    lines: lines.length,
    totalTextHeight,
    descentPadding,
    calculatedHeight,
    dynamicCellHeight
  });

  return (
    <RoundedBox
      args={[
        widthInPx - padding,
        dynamicCellHeight,
        1
      ]}
      radius={8}
      smoothness={2}
      bevelSegments={1}
      creaseAngle={0.4}
    >
      <meshBasicMaterial
        color={
          track.visible ? (
            isHovered
              ? colorScheme.backgroundColorHover
              : colorScheme.backgroundColor
          ) : colorScheme.backgroundColorDisabled
        }
      />

      <a.mesh>
        {
          !track.visible || isResizing || widthInPxAfterZoom < 50 ? null : (
            <group>
              {lines.map((line, index) => {

                // Top of the box (y = +dynamicCellHeight / 2)
                // We add some padding so text doesn't touch the top edge
                const topPadding = padding * 3;
                const topY = dynamicCellHeight / 2 - topPadding;

                // Because anchorY="top", yPosition is the TOP of each line
                const yPosition = topY - index * lineSpacing;

                // Debug last line
                if (index === lines.length - 1) {
                  const bottomOfThisLine = yPosition - lineSpacing - descentPadding;
                  const boxBottom = -dynamicCellHeight / 2;
                  const spaceBelow = bottomOfThisLine - boxBottom;

                  console.log(`🔻 Last line metrics (${s.id.slice(0, 8)}):`, {
                    yPosition,
                    bottomOfThisLine,
                    boxBottom,
                    spaceBelow
                  });
                }

                return (
                  <Text
                    key={index}
                    position={[
                      (-widthInPx / 2) + padding * 3,
                      yPosition,
                      1
                    ]}
                    fontSize={fontSize}
                    color={isHovered ? colorScheme.textColorHover : colorScheme.textColor}
                    anchorX="left"
                    anchorY="top"
                    fontWeight={400}
                    renderOrder={999}
                    outlineWidth={0}
                  >
                    {line}
                  </Text>
                );
              })}
            </group>
          )
        }
      </a.mesh>
    </RoundedBox>
  )
}

// --- FIXED MEMO: allow re-renders when needed ---
export const TextCell = React.memo(TextCellComponent, (prev, next) => {
  return (
    prev.segment.id === next.segment.id &&
    prev.segment.label === next.segment.label &&
    prev.widthInPx === next.widthInPx &&
    prev.widthInPxAfterZoom === next.widthInPxAfterZoom &&
    prev.isHovered === next.isHovered &&
    prev.isResizing === next.isResizing &&
    prev.track.visible === next.track.visible
  );
});