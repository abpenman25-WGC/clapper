# Gemini/Vertex AI Configuration

## Date: February 8, 2026

## Current Status: CONFIGURED ✓

### Configuration Complete

Successfully configured Google Cloud Vertex AI integration with proper credentials.

### Setup Details:

1. **Vertex AI Configuration**:
   - Using `@langchain/google-vertexai` package with `ChatVertexAI`
   - Project ID: `gen-lang-client-0254625242`
   - Location: `us-central1` (default)
   - Credentials file: `C:\Users\Alex\.clapper\credentials\google-credentials.json`

2. **Environment Variable**:
   ```powershell
   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\Alex\.clapper\credentials\google-credentials.json"
   ```
   - Set permanently in user environment variables
   - May require VS Code restart to take effect

3. **Available Models**:
   - `gemini-1.5-flash-001` - Fast, efficient model
   - `gemini-1.5-pro-001` - Advanced reasoning
   - `gemini-1.0-vision-001` - Vision capabilities
   - `gemini-1.0-pro-002` - Previous generation
   - `claude-3-5-sonnet@20240620` - Via Vertex AI
   - `claude-3-opus@20240229` - Via Vertex AI
   - `claude-3-haiku@20240307` - Via Vertex AI

### Configuration Steps Completed:

1. ✅ Added Google Project ID and Location settings
2. ✅ Restored ChatVertexAI integration
3. ✅ Set up credentials file in permanent location
4. ✅ Configured GOOGLE_APPLICATION_CREDENTIALS environment variable
5. ✅ Restored all Vertex AI model workflows
6. ✅ Updated settings UI with Project ID and Location fields

### Settings to Configure in Clapper:

In Settings → AI Providers → Google:
- **Google Project ID**: `gen-lang-client-0254625242`
- **Google Location**: `us-central1`
- **Model**: Select from available Gemini or Claude models

### Files Modified:
- `packages/clapper-services/src/settings.ts` - Added Project ID and Location fields
- `packages/app/src/services/settings/getDefaultSettingsState.ts` - Added defaults
- `packages/app/src/services/settings/useSettings.ts` - Added setters
- `packages/app/src/app/api/assistant/askAnyAssistant.ts` - Restored ChatVertexAI
- `packages/app/src/services/editors/workflow-editor/workflows/google/index.ts` - Restored Vertex AI workflows
- `packages/app/src/components/settings/provider.tsx` - Added UI fields

### Resources:
- Google Cloud Console: https://console.cloud.google.com
- Vertex AI Documentation: https://cloud.google.com/vertex-ai/docs
- Model Versioning: https://cloud.google.com/vertex-ai/generative-ai/docs/learn/model-versioning
- LangChain Vertex AI: https://js.langchain.com/docs/integrations/chat/google_vertex_ai

### Previous Troubleshooting (February 7, 2026):

#### Error Message:
```
[GoogleGenerativeAI Error]: Error fetching from 
https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent: 
[404 Not Found] models/gemini-pro is not found for API version v1beta
```

**Resolution**: Switched from Google AI Studio (API key only) to Vertex AI (requires Project ID + credentials). This provides access to more models and enterprise features.
