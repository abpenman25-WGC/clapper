import { FormArea, FormInput, FormSection } from '@/components/forms'
import { getDefaultSettingsState, useSettings } from '@/services/settings'

export function SettingsSectionMusic() {
  const defaultSettings = getDefaultSettingsState()

  const musicGenApiUrl = useSettings((s) => s.musicGenApiUrl)
  const setMusicGenApiUrl = useSettings((s) => s.setMusicGenApiUrl)

  const comfyWorkflowForMusic = useSettings((s) => s.comfyWorkflowForMusic)
  const setComfyWorkflowForMusic = useSettings(
    (s) => s.setComfyWorkflowForMusic
  )

  return (
    <div className="flex flex-col justify-between space-y-6">
      <FormSection label="MusicGen (local)">
        <FormInput
          label="MusicGen server URL"
          value={musicGenApiUrl}
          defaultValue={defaultSettings.musicGenApiUrl}
          onChange={setMusicGenApiUrl}
        />
      </FormSection>
      <FormSection label="Music rendering">
        <FormArea
          label="Custom ComfyUI workflow for music"
          value={comfyWorkflowForMusic}
          defaultValue={defaultSettings.comfyWorkflowForMusic}
          onChange={setComfyWorkflowForMusic}
          rows={8}
        />
      </FormSection>
    </div>
  )
}
