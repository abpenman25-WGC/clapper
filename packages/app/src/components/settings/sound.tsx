import { FormArea, FormInput, FormSection } from '@/components/forms'
import { getDefaultSettingsState, useSettings } from '@/services/settings'

export function SettingsSectionSound() {
  const defaultSettings = getDefaultSettingsState()

  const audioLdmApiUrl = useSettings((s) => s.audioLdmApiUrl)
  const setAudioLdmApiUrl = useSettings((s) => s.setAudioLdmApiUrl)

  const comfyWorkflowForSound = useSettings((s) => s.comfyWorkflowForSound)
  const setComfyWorkflowForSound = useSettings(
    (s) => s.setComfyWorkflowForSound
  )

  return (
    <div className="flex flex-col justify-between space-y-6">
      <FormSection label="AudioLDM (local)">
        <FormInput
          label="AudioLDM server URL"
          value={audioLdmApiUrl}
          defaultValue={defaultSettings.audioLdmApiUrl}
          onChange={setAudioLdmApiUrl}
        />
      </FormSection>
      <FormSection label="Sound rendering">
        <FormArea
          label="Custom ComfyUI workflow for sound"
          value={comfyWorkflowForSound}
          defaultValue={defaultSettings.comfyWorkflowForSound}
          onChange={setComfyWorkflowForSound}
          rows={8}
        />
      </FormSection>
    </div>
  )
}
