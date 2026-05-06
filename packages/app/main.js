const fs = require('fs')
const path = require('path')

// -----------------------------------------------------------
//
// attention: if you add dependencies here, you might have to edit
// forge.config.js, , the part about:
// '^\\/node_modules/(?!dotenv)$',
//
// if you have an idea  to do that automatically, let me know
const dotenv = require('dotenv')
//
// -----------------------------------------------------------

dotenv.config()

try {
  if (fs.existsSync(".env.local")) {
    const result = dotenv.config({ path: ".env.local" })
    console.log("using .env.local")
    process.env = {
      ...process.env,
      ...result.parsed,
    }
  }
} catch (err) {
  // do nothing
  console.log("using .env")
}

const { app, BrowserWindow, screen } = require('electron')
const { spawn } = require('child_process')

// Auto-launch local ComfyUI (CPU mode)
let comfyUiProcess = null

function startComfyUI() {
  const comfyUIPath = 'C:\\AI\\ComfyUI'
  const venvPython = path.join(comfyUIPath, 'venv', 'Scripts', 'python.exe')
  const mainPy = path.join(comfyUIPath, 'main.py')

  console.log('[ComfyUI] Starting local ComfyUI (CPU mode)...')

  comfyUiProcess = spawn(venvPython, [mainPy, '--cpu'], {
    cwd: comfyUIPath,
    stdio: 'pipe',
    detached: false,
  })

  comfyUiProcess.stdout.on('data', (data) => {
    console.log(`[ComfyUI] ${data.toString().trim()}`)
  })

  comfyUiProcess.stderr.on('data', (data) => {
    console.error(`[ComfyUI] ${data.toString().trim()}`)
  })

  comfyUiProcess.on('exit', (code) => {
    console.log(`[ComfyUI] Process exited with code ${code}`)
    comfyUiProcess = null
  })
}

function stopComfyUI() {
  if (comfyUiProcess) {
    console.log('[ComfyUI] Shutting down...')
    comfyUiProcess.kill()
    comfyUiProcess = null
  }
}

// Auto-launch local Bark TTS server
let barkTtsProcess = null

function startBarkTTS() {
  const barkPath = 'C:\\AI\\bark'
  const venvPython = path.join(barkPath, 'venv', 'Scripts', 'python.exe')
  const serverPy = path.join(barkPath, 'server.py')

  console.log('[BarkTTS] Starting local Bark TTS server...')

  barkTtsProcess = spawn(venvPython, [serverPy], {
    cwd: barkPath,
    stdio: 'pipe',
    detached: false,
  })

  barkTtsProcess.stdout.on('data', (data) => {
    console.log(`[BarkTTS] ${data.toString().trim()}`)
  })

  barkTtsProcess.stderr.on('data', (data) => {
    console.error(`[BarkTTS] ${data.toString().trim()}`)
  })

  barkTtsProcess.on('exit', (code) => {
    console.log(`[BarkTTS] Process exited with code ${code}`)
    barkTtsProcess = null
  })
}

function stopBarkTTS() {
  if (barkTtsProcess) {
    console.log('[BarkTTS] Shutting down...')
    barkTtsProcess.kill()
    barkTtsProcess = null
  }
}

// Auto-launch local AudioLDM server
let audioLdmProcess = null

function startAudioLDM() {
  const venvPython = 'C:\\AI\\audioldm_env\\Scripts\\python.exe'
  const serverPy = path.join(__dirname, '..', '..', 'local_ai_demo', 'audioldm_server.py')

  console.log('[AudioLDM] Starting local AudioLDM server...')

  audioLdmProcess = spawn(venvPython, [serverPy], {
    stdio: 'pipe',
    detached: false,
  })

  audioLdmProcess.stdout.on('data', (data) => {
    console.log(`[AudioLDM] ${data.toString().trim()}`)
  })

  audioLdmProcess.stderr.on('data', (data) => {
    console.error(`[AudioLDM] ${data.toString().trim()}`)
  })

  audioLdmProcess.on('exit', (code) => {
    console.log(`[AudioLDM] Process exited with code ${code}`)
    audioLdmProcess = null
  })
}

function stopAudioLDM() {
  if (audioLdmProcess) {
    console.log('[AudioLDM] Shutting down...')
    audioLdmProcess.kill()
    audioLdmProcess = null
  }
}

// Auto-launch local MusicGen server
let musicGenProcess = null

function startMusicGen() {
  const venvPython = 'C:\\AI\\musicgen_env\\Scripts\\python.exe'
  const serverPy = path.join(__dirname, '..', '..', 'local_ai_demo', 'musicgen_server.py')

  console.log('[MusicGen] Starting local MusicGen server...')

  musicGenProcess = spawn(venvPython, [serverPy], {
    stdio: 'pipe',
    detached: false,
  })

  musicGenProcess.stdout.on('data', (data) => {
    console.log(`[MusicGen] ${data.toString().trim()}`)
  })

  musicGenProcess.stderr.on('data', (data) => {
    console.error(`[MusicGen] ${data.toString().trim()}`)
  })

  musicGenProcess.on('exit', (code) => {
    console.log(`[MusicGen] Process exited with code ${code}`)
    musicGenProcess = null
  })
}

function stopMusicGen() {
  if (musicGenProcess) {
    console.log('[MusicGen] Shutting down...')
    musicGenProcess.kill()
    musicGenProcess = null
  }
}


try {
  // used when the app is built with `npm run electron:make`
  require(path.join(process.resourcesPath, 'standalone/server.js'))
} catch (err) {
  // used when the app is started with `npm run electron:start`
  require(path.join(process.cwd(), '.next/standalone/server.js'))
}

// TODO: load the proxy server (for AI providers that refuse browser-side clients)
// const proxyServerPath = path.join(currentDir, '.next/standalone/proxy-server.js')
// require(proxyServerPath)

const createWindow = () => {
  const mainScreen = screen.getPrimaryDisplay()
  const allScreens = screen.getAllDisplays()
  console.log("debug:", {
    mainScreen,
    allScreens
  })

  const mainWindow = new BrowserWindow({
    // copy the width and height
    ...mainScreen.workAreaSize,

    icon: './public/logos/clapper.png'
  })

  mainWindow.loadURL('http://0.0.0.0:3000/')

  mainWindow.on('closed', () => {
    app.quit()
  })
}

app.whenReady().then(() => {
  startComfyUI()
  startBarkTTS()
  startAudioLDM()
  startMusicGen()
  createWindow()
})

app.on('window-all-closed', () => {
  stopComfyUI()
  stopBarkTTS()
  stopAudioLDM()
  stopMusicGen()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})