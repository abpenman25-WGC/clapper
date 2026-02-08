# Google Vertex AI Setup Guide

## ✅ Configuration Complete!

Your Clapper application is now configured to use Google Cloud Vertex AI with Gemini models.

## Current Configuration

### Credentials
- **File Location**: `C:\Users\Alex\.clapper\credentials\google-credentials.json`
- **Environment Variable**: `GOOGLE_APPLICATION_CREDENTIALS` (set permanently)
- **Project ID**: `gen-lang-client-0254625242`
- **Default Region**: `us-central1`

### Environment Variable Status
✅ Set for current session  
✅ Set permanently in user environment (restart VS Code for new terminals)

```powershell
# Already configured - no action needed
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\Alex\.clapper\credentials\google-credentials.json"
```

## Using Gemini in Clapper

### 1. Open Settings
In Clapper, go to Settings → AI Providers

### 2. Configure Google/Vertex AI Section
The following settings are already configured with defaults:
- **Google Project ID**: `gen-lang-client-0254625242` ✓
- **Google Location**: `us-central1` ✓

### 3. Select a Model
Choose from the available Gemini and Claude models:

#### Gemini Models (Google)
- **Gemini 1.5 Flash (001)** - Fast and efficient
- **Gemini 1.5 Pro (001)** - Most capable, best for complex tasks
- **Gemini 1.0 Vision (001)** - Image understanding
- **Gemini 1.0 Pro (002)** - Previous generation

#### Claude Models (via Vertex AI)
- **Claude 3.5 (Sonnet)** - Balanced performance
- **Claude 3 (Opus)** - Most capable Claude model
- **Claude 3 (Haiku)** - Fast and efficient

### 4. Set as Assistant Workflow
In Settings → AI Assistant, select your preferred Google/Vertex AI workflow

## What Changed

### Files Updated
1. **Settings Types** (`packages/clapper-services/src/settings.ts`)
   - Added `googleProjectId` field
   - Added `googleLocation` field

2. **Default Settings** (`packages/app/src/services/settings/getDefaultSettingsState.ts`)
   - Set default Project ID: `gen-lang-client-0254625242`
   - Set default Location: `us-central1`

3. **Assistant Integration** (`packages/app/src/app/api/assistant/askAnyAssistant.ts`)
   - Reverted to `ChatVertexAI` (from `ChatGoogleGenerativeAI`)
   - Configured to use Project ID and Location from settings
   - Credentials loaded automatically from environment variable

4. **Available Models** (`packages/app/src/services/editors/workflow-editor/workflows/google/index.ts`)
   - Restored all Vertex AI Gemini models (1.5 Flash, 1.5 Pro, 1.0 Vision, 1.0 Pro)
   - Restored Claude models available via Vertex AI

5. **Settings UI** (`packages/app/src/components/settings/provider.tsx`)
   - Added Project ID input field with link to Google Cloud Console
   - Added Location input field with placeholder

## Architecture

### Google AI Studio vs Vertex AI

We're now using **Vertex AI** (not Google AI Studio):

| Feature | Google AI Studio | Vertex AI (Current) |
|---------|------------------|---------------------|
| Authentication | API Key only | Project ID + Credentials |
| Models | Limited Gemini | Full Gemini + Claude suite |
| Enterprise | No | Yes |
| Regions | Global | Configurable |
| Quotas | Lower | Higher |
| Credentials | Simple | Service Account JSON |

## Troubleshooting

### If models aren't working:

1. **Restart VS Code**
   - Required for environment variable to take effect in all terminals

2. **Verify credentials file exists**
   ```powershell
   Test-Path "$env:USERPROFILE\.clapper\credentials\google-credentials.json"
   # Should return: True
   ```

3. **Check environment variable**
   ```powershell
   $env:GOOGLE_APPLICATION_CREDENTIALS
   # Should show the path to credentials file
   ```

4. **Verify Project ID in Settings**
   - Open Clapper Settings → AI Providers → Google
   - Ensure Project ID shows: `gen-lang-client-0254625242`

5. **Check Vertex AI API is enabled**
   - Visit: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com
   - Ensure it's enabled for your project

### Common Issues

**"Permission denied" errors:**
- Check that the service account has Vertex AI User role
- Verify the credentials file has correct permissions

**"Project not found" errors:**
- Verify the Project ID in settings matches: `gen-lang-client-0254625242`
- Check that you're logged into the correct Google Cloud account

**"Model not found" errors:**
- Ensure you're selecting models from the Google (VertexAI) provider
- Some models may not be available in all regions

## Next Steps

1. ✅ Credentials configured
2. ✅ Environment variable set
3. ✅ Code updated to use Vertex AI
4. ✅ Settings UI updated
5. ⏭️ Restart VS Code (recommended)
6. ⏭️ Open Clapper and test a Gemini model!

## Resources

- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Gemini Models](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/model-versioning)
- [LangChain Vertex AI Integration](https://js.langchain.com/docs/integrations/chat/google_vertex_ai)
- [Google Cloud Console](https://console.cloud.google.com)

---

**Date**: February 8, 2026  
**Status**: ✅ Ready to use
