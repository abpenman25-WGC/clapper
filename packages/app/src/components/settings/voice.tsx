import { FormArea, FormInput, FormSection } from '@/components/forms'
import { getDefaultSettingsState, useSettings } from '@/services/settings'

export function SettingsSectionVoice() {
  const defaultSettings = getDefaultSettingsState()

  const comfyWorkflowForVoice = useSettings((s) => s.comfyWorkflowForVoice)
  const setComfyWorkflowForVoice = useSettings(
    (s) => s.setComfyWorkflowForVoice
  )

  const barkTtsApiUrl = useSettings((s) => s.barkTtsApiUrl)
  const setBarkTtsApiUrl = useSettings((s) => s.setBarkTtsApiUrl)

  return (
    <div className="flex flex-col justify-between space-y-6">
      <FormSection label="Bark TTS (local)">
        <FormInput
          label="Bark server URL"
          value={barkTtsApiUrl}
          defaultValue={defaultSettings.barkTtsApiUrl}
          onChange={setBarkTtsApiUrl}
          placeholder="http://localhost:5001"
        />
      </FormSection>
      <FormSection label="Voice rendering">
        <FormArea
          label="Custom ComfyUI workflow for voice"
          value={comfyWorkflowForVoice}
          defaultValue={defaultSettings.comfyWorkflowForVoice}
          onChange={setComfyWorkflowForVoice}
          rows={8}
        />
      </FormSection>
    </div>
  )
}
