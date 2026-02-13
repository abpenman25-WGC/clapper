import React from 'react';

import { GradientTexture, RoundedBox, Text } from "@react-three/drei"
import { useSpring, a, animated, config } from "@react-spring/three"

import { clampWebGLText } from "@/utils"

import { SpecializedCellProps } from "./types"

const MemoizedTextCell = React.memo(function TextCell({
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

  // Wrap text based on available width
  const lines = React.useMemo(() => {
    const availableWidth = widthInPx - padding * 6;
    const wrapped = clampWebGLText(text, availableWidth, Number.MAX_SAFE_INTEGER);

    if (wrapped.length > 1) {
      console.log(`📝 TextCell: ${wrapped.length} lines, segment ${s.id.slice(0, 8)}`);
    }

    return wrapped;
  }, [text, widthInPx, padding, s.id]);

  // Clean, predictable height calculation
  const lineSpacing = fontSize * lineHeight;
  const totalTextHeight = lines.length * lineSpacing;

  // Add modest padding above and below
  const verticalPadding = padding * 4;

  const calculatedHeight = totalTextHeight + verticalPadding * 2;

  // Final height is max of calculated or provided
  const dynamicCellHeight = Math.max(cellHeight, calculatedHeight);

  if (lines.length > 1) {
    console.log(`📐 Cell dimensions (${s.id.slice(0, 8)}):`, {
      cellH: cellHeight.toFixed(1),
      calcH: calculatedHeight.toFixed(1),
      finalH: dynamicCellHeight.toFixed(1),
      totalTextH: totalTextHeight.toFixed(1),
      lineSpace: lineSpacing.toFixed(1)
    });
  }

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

                // --- VERTICAL CENTERING MATH ---
                // Center of the box is y = 0
                // We want the block of text centered around y = 0
                const centerOffset = totalTextHeight / 2;

                // Because anchorY="top", yPosition must be the TOP of each line
                const yPosition = centerOffset - (index * lineSpacing);

                // Debug for last line
                if (index === lines.length - 1 && lines.length > 1) {
                  const bottomOfThisLine = yPosition - lineSpacing;
                  const boxBottom = -dynamicCellHeight / 2;
                  const spaceBelow = bottomOfThisLine - boxBottom;

                  console.log(`   Last line ${index + 1}/${lines.length}: yPos=${yPosition.toFixed(1)}`);
                  console.log(`   📏 Last line bottom: ${bottomOfThisLine.toFixed(1)}, Box bottom: ${boxBottom.toFixed(1)}`);
                  console.log(`   ${spaceBelow < 0 ? '❌ CLIPPED! Space:' : spaceBelow < 10 ? '⚠️ TIGHT! Space:' : '✅ OK! Space:'} ${spaceBelow.toFixed(1)}px`);
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
}, (prevProps, nextProps) => {
  return (
    prevProps.segment.id === nextProps.segment.id &&
    prevProps.segment.label === nextProps.segment.label &&
    prevProps.segment.prompt === nextProps.segment.prompt &&
    prevProps.segment.isActive === nextProps.segment.isActive &&
    prevProps.segment.visibility === nextProps.segment.visibility &&
    prevProps.segment.isSelected === nextProps.segment.isSelected &&
    prevProps.segment.isHovered === nextProps.segment.isHovered &&
    prevProps.segment.isHoveredOnBody === nextProps.segment.isHoveredOnBody &&
    prevProps.segment.isHoveredOnLeftHandle === nextProps.segment.isHoveredOnLeftHandle &&
    prevProps.segment.isHoveredOnRightHandle === nextProps.segment.isHoveredOnRightHandle &&
    prevProps.segment.isGrabbedOnBody === nextProps.segment.isGrabbedOnBody &&
    prevProps.segment.isGrabbedOnLeftHandle === nextProps.segment.isGrabbedOnLeftHandle &&
    prevProps.segment.isGrabbedOnRightHandle === nextProps.segment.isGrabbedOnRightHandle &&
    prevProps.segment.isActive === nextProps.segment.isActive &&
    prevProps.segment.isPlaying === nextProps.segment.isPlaying &&
    prevProps.segment.editionStatus === nextProps.segment.editionStatus &&

    prevProps.isHovered === nextProps.isHovered &&
    prevProps.widthInPx === nextProps.widthInPx &&
    prevProps.widthInPxAfterZoom === nextProps.widthInPxAfterZoom &&
    prevProps.isResizing === nextProps.isResizing &&
    prevProps.track.visible === nextProps.track.visible
  )
});

export { MemoizedTextCell as TextCell };