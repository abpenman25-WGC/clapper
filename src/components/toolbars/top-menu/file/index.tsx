"use client"
import { useEffect } from "react"
import { useTimeline } from "@aitube/timeline"
import { useHotkeys } from "react-hotkeys-hook"

import { MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from "@/components/ui/menubar"
import { useOpenFilePicker, useQueryStringParams } from "@/lib/hooks"
import { IframeWarning } from "@/components/dialogs/iframe-warning"
import { useIO, useUI } from "@/services"

export function TopMenuFile() {
  const { clapUrl } = useQueryStringParams({
    // clapUrl: `/samples/test.clap`,
    // clapUrl: `/samples/Afterglow%20v10%20X%20Rewrite%20Bryan%20E.%20Harris%202023.clap`,
    clapUrl: '',
  })

  const isTimelineLoading: boolean = useTimeline(s => s.isLoading)
  const clap = useTimeline(s => s.clap)
  const setClap = useTimeline(s => s.setClap)
  //const saveClapAs = useTimeline(s => s.saveClapAs)
  //const setFullVideo = useTimeline(s => s.fullVideo)

  const { openFilePicker, isLoading: filePickerIsLoading } = useOpenFilePicker()

  //const isLoading = isTimelineLoading || filePickerIsLoading

  const openClapUrl = useIO(s => s.openClapUrl)
  const saveClap = useIO(s => s.saveClap)
  const saveVideoFile = useIO(s => s.saveVideoFile)
  const saveZipFile = useIO(s => s.saveZipFile)
  const saveKdenline = useIO(s => s.saveKdenline)

  const hasBetaAccess = useUI(s => s.hasBetaAccess)

  useEffect(() => {
    (async () => {
      if (!clapUrl) {
        console.log("No clap URL provided")
        return
      }
      await openClapUrl(clapUrl)
    })()
  }, [clapUrl])

  // const setShowSettings = useUISettings(s => s.setShowSettings)
  useHotkeys('ctrl+o', () => openFilePicker(), { preventDefault: true }, [])
  useHotkeys('meta+o', () => openFilePicker(), { preventDefault: true }, [])
  // useHotkeys('ctrl+s', () => saveClapAs({ embedded: true }), { preventDefault: true }, [])
  // useHotkeys('meta+s', () => saveClapAs({ embedded: true }), { preventDefault: true }, [])
  useHotkeys('ctrl+s', () => saveClap(), { preventDefault: true }, [])
  useHotkeys('meta+s', () => saveClap(), { preventDefault: true }, [])
  

  return (
    <>
    <MenubarMenu>
      <MenubarTrigger>File</MenubarTrigger>
      <MenubarContent>
        {hasBetaAccess &&
          <MenubarItem onClick={() => {
            openClapUrl('/samples/claps/empty_project.clap')
          }}>
            New Project<MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
        }
        <MenubarItem onClick={() => {
          openFilePicker()
        }}>
          Open file (.clap, .txt)<MenubarShortcut>⌘O</MenubarShortcut>
        </MenubarItem>
        <MenubarItem
        onClick={() => {
          saveClap()
        }}>
          Save project (.clap)<MenubarShortcut>⌘S</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarSub>
          <MenubarSubTrigger>Examples</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem onClick={() => {
              openClapUrl('/samples/claps/wasteland.clap')
            }}>
              Wasteland.clap
            </MenubarItem>
            <MenubarItem onClick={() => {
              openClapUrl('/samples/scripts/Citizen Kane.txt')
            }}>
              Citizen Kane.txt
            </MenubarItem>
            <MenubarItem onClick={() => {
              openClapUrl('/samples/scripts/The Wizard Of Oz.txt')
            }}>
              The Wizard Of Oz.txt
            </MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarSeparator />
        {/*
        <MenubarItem
        onClick={() => {
          saveVideoFile()
        }}>
          Export project to MP4
        </MenubarItem>
        <MenubarSeparator />
        */}
        <MenubarItem
        onClick={() => {
          saveZipFile()
        }}>
          Export project to .zip
        </MenubarItem>
        <MenubarSeparator />
        {/*
        <MenubarItem onClick={() => {
          saveKdenline()
        }}>
          Export .kdenlive
        </MenubarItem>
        <MenubarSeparator />
        */}
        {/*
        <MenubarItem
        disabled
        onClick={() => {
         
        }}>
          Import .fountain (not implemented)
        </MenubarItem>
        <MenubarItem
        disabled
        onClick={() => {
          
        }}>
          Export .fountain (not implemented)
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem
        disabled
        onClick={() => {
        
        }}>
          Import .fdx (not implemented)
        </MenubarItem>
        <MenubarItem
        disabled
        onClick={() => {

        }}>
          Export .fdx (not implemented)
        </MenubarItem>
        */}
      </MenubarContent>
    </MenubarMenu>
    {/*
    deprecated, this is the old design with progress bar
    <Loader isLoading={isLoading} /> */}
    <IframeWarning />
    </>
  )
}
