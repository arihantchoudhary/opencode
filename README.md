<p align="center">
  <a href="https://cerebras.dev">
    <picture>
      <source srcset="packages/console/app/src/asset/logo-ornate-dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset="packages/console/app/src/asset/logo-ornate-light.svg" media="(prefers-color-scheme: light)">
      <img src="packages/console/app/src/asset/logo-ornate-light.svg" alt="Cerebras Code logo">
    </picture>
  </a>
</p>
<p align="center">AI coding agent powered by Cerebras inference.</p>

---

## Installation

### One-Line Install (Easiest)

```bash
curl -fsSL https://raw.githubusercontent.com/arihantchoudhary/opencode/dev/install.sh | bash
```

This auto-detects your platform and installs the latest version.

### Homebrew (Alternative)

```bash
brew tap arihantchoudhary/tap
brew install cerebras
```

### Platform-Specific Packages

If Homebrew doesn't work, install the platform-specific package directly:

#### macOS Apple Silicon (M1/M2/M3/M4)

```bash
npm install -g cerebras-darwin-arm64@latest
ln -sf $(npm root -g)/cerebras-darwin-arm64/bin/cerebras $(dirname $(which npm))/cerebras
```

#### macOS Intel

```bash
npm install -g cerebras-darwin-x64@latest
ln -sf $(npm root -g)/cerebras-darwin-x64/bin/cerebras $(dirname $(which npm))/cerebras
```

#### Linux x64

```bash
npm install -g cerebras-linux-x64@latest
sudo ln -sf $(npm root -g)/cerebras-linux-x64/bin/cerebras /usr/local/bin/cerebras
```

#### Linux ARM64

```bash
npm install -g cerebras-linux-arm64@latest
sudo ln -sf $(npm root -g)/cerebras-linux-arm64/bin/cerebras /usr/local/bin/cerebras
```

#### Windows x64

```powershell
npm install -g cerebras-windows-x64@latest
# The cerebras.exe command should work automatically after installation
```

### Verify Installation

```bash
cerebras --version
```

### Getting Started

1. Run `cerebras` to start the interactive terminal UI
2. Configure your Cerebras API key when prompted
3. Start coding with AI assistance!

---

**Get your Cerebras API key:** [inference.cerebras.ai](https://inference.cerebras.ai)
