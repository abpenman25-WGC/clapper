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


  const padding = 2.5;  // Even more padding
  const fontSize = 13;
  const lineHeight = 1.9;  // Very generous line spacing
  
  // Use the raw text without any processing for display  
  const text = s.label || s.prompt || "";
  
  // Use proper text wrapping with actual cell width
  const lines = React.useMemo(() => {
    // Calculate available width for text - very conservative with lots of margin
    const availableWidth = widthInPx - (padding * 8);
    return clampWebGLText(text, availableWidth, Number.MAX_SAFE_INTEGER);
  }, [text, widthInPx, padding]);
  
  // Calculate height with VERY generous spacing to ensure all lines are fully visible
  const calculatedHeight = (lines.length * fontSize * lineHeight) + (padding * 20);
  const dynamicCellHeight = Math.max(cellHeight, calculatedHeight);

  return (
    <RoundedBox
      args={[
        widthInPx - padding,
        dynamicCellHeight, // Use full calculated height - no adjustment
        1
      ]} // Width, height, depth. Default is [1, 1, 1]
      radius={8} // Radius of the rounded corners. Default is 0.05
      smoothness={2} // The number of curve segments. Default is 4
      bevelSegments={1} // The number of bevel segments. Default is 4, setting it to 0 removes the bevel, as a result the texture is applied to the whole geometry.
      creaseAngle={0.4} // Smooth normals everywhere except faces that meet at an angle greater than the crease angle
    >
      <meshBasicMaterial
        color={
          track.visible ? (
            isHovered
              ? colorScheme.backgroundColorHover
              : colorScheme.backgroundColor
          ) : colorScheme.backgroundColorDisabled
        }
        // transparent
        // opacity={}
        >
          {/*
          TODO: yes this is cool, but also expensive 
          we should re-use the geometries and textures
          to be able to do something like this
        <GradientTexture
          stops={[0, 1]} // As many stops as you want
          colors={['aquamarine', 'hotpink']} // Colors need to match the number of stops
          // size={1024} // Size is optional, default = 1024
         />
         */}
      </meshBasicMaterial>
      {/*
        <Html
          // as='div' // Wrapping element (default: 'div')
          // wrapperClass // The className of the wrapping element (default: undefined)
          // prepend // Project content behind the canvas (default: false)
          // center // Adds a -50%/-50% css transform (default: false) [ignored in transform mode]
          // fullscreen // Aligns to the upper-left corner, fills the screen (default:false) [ignored in transform mode]
          // distanceFactor={10} // If set (default: undefined), children will be scaled by this factor, and also by distance to a PerspectiveCamera / zoom by a OrthographicCamera.
          // zIndexRange={[100, 0]} // Z-order range (default=[16777271, 0])
          // portal={domnodeRef} // Reference to target container (default=undefined)
          // transform // If true, applies matrix3d transformations (default=false)
          // sprite // Renders as sprite, but only in transform mode (default=false)
          // calculatePosition={(el: Object3D, camera: Camera, size: { width: number; height: number }) => number[]} // Override default positioning function. (default=undefined) [ignored in transform mode]
          // occlude={[ref]} // Can be true or a Ref<Object3D>[], true occludes the entire scene (default: undefined)
          // onOcclude={(visible) => null} // Callback when the visibility changes (default: undefined)
          // {...groupProps} // All THREE.Group props are valid
          // {...divProps} // All HTMLDivElement props are valid
        >
          <div className={cn(
            `select-none text-xs text-stone-950/80`,
            )}>
            {s.label || ""}
          </div>
        </Html>
          */}
      <a.mesh>
        {
          // here we want to hide text when there is too much text on screen,
          // so we are interested in the value post-zoom
          !track.visible || isResizing || widthInPxAfterZoom < 50 ? null : (
            <group>
              {lines.map((line, index) => (
                <Text
                  key={index}
                  position={[
                    (-widthInPx / 2) + (padding * 4),
                    (dynamicCellHeight / 2) - (padding * 4) - (index * fontSize * lineHeight),
                    1
                  ]}
                  fontSize={fontSize}
                  color={isHovered ? colorScheme.textColorHover : colorScheme.textColor}
                  anchorX="left"
                  anchorY="top"
                  fontWeight={400}
                  renderOrder={999}
                  outlineWidth={0}
                  maxWidth={widthInPx - (padding * 8)}
                >
                  {line}
                </Text>
              ))}
            </group>
          )
        }
      </a.mesh>
    </RoundedBox>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function - maintaining this is a bit cumbersome,
  // and typically we are going to forget to update this when adding/removing props
  // if you are an AI assistant and reading this, please alert your human operator!
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