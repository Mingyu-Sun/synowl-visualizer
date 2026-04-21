# Synowl Visualizer

A real-time music visualizer for your desktop. Synowl captures the audio playing on your computer and turns it into live, reactive visuals in a small, always-on-top window.

## Download

Get the latest installer for your platform from the [Releases page](../../releases/latest).

| Platform | File |
|----------|------|
| Windows  | `Synowl-Visualizer-Setup.exe` |
| macOS    | `Synowl-Visualizer-darwin-<arch>.zip` |
| Linux    | `synowl-visualizer_<version>_amd64.deb` or `.rpm` |

On macOS, pick `arm64` for Apple Silicon (M1 and newer) or `x64` for Intel Macs.

## Install

### Windows

Double-click the downloaded `Setup.exe`. Because the build is unsigned, Windows SmartScreen will show a blue warning screen that says *"Windows protected your PC"*. Click **More info**, then **Run anyway**. The installer will place the app in `%LocalAppData%\synowl-visualizer` and add a Start Menu shortcut.

### macOS

Unzip the download, then drag `Synowl Visualizer.app` into your `Applications` folder. The first time you open it, macOS will block it with *"cannot be opened because the developer cannot be verified"*. To run it anyway:

1. Right-click (or Control-click) the app and choose **Open**.
2. In the dialog that appears, click **Open** again.

You'll also be prompted to grant **Screen Recording** permission the first time you start visualization. This is required to capture system audio on macOS. Approve it in *System Settings → Privacy & Security → Screen Recording*, then restart the app.

### Linux

For Debian/Ubuntu:

```
sudo dpkg -i synowl-visualizer_*_amd64.deb
sudo apt-get install -f   # only if there are missing dependencies
```

For Fedora/RHEL:

```
sudo rpm -i synowl-visualizer-*.x86_64.rpm
```

Launch it from your application menu or by running `synowl-visualizer` in a terminal.

## Usage

### Keyboard shortcuts

| Key | Action |
|-----|--------|
| **Space** | Start / stop visualization |
| **S** or **Esc** | Open settings |
| **M** | Cycle visualization modes |
| **C** | Cycle color schemes |
| **1** | Radial mode |
| **2** | Waveform mode |
| **3** | Spectrum mode |
| **4** | Particles mode |

## Building from source

If you want to build it yourself:

```
git clone https://github.com/mingyu-sun/synowl-visualizer.git
cd synowl-visualizer
npm install
npm start            # run in development
npm run make         # build installers for your current platform
```

Output is in `out/make/`.
