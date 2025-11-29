#!/bin/bash
set -e

# Cerebras Code Installer
# Downloads and installs the latest version from GitHub

REPO="arihantchoudhary/opencode"
INSTALL_DIR="/usr/local/bin"

# Detect platform
OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
    Darwin)
        PLATFORM="darwin"
        ;;
    Linux)
        PLATFORM="linux"
        ;;
    *)
        echo "❌ Unsupported OS: $OS"
        exit 1
        ;;
esac

case "$ARCH" in
    x86_64)
        ARCH_NAME="x64"
        ;;
    arm64|aarch64)
        ARCH_NAME="arm64"
        ;;
    *)
        echo "❌ Unsupported architecture: $ARCH"
        exit 1
        ;;
esac

PACKAGE="cerebras-${PLATFORM}-${ARCH_NAME}"

echo "🚀 Installing Cerebras Code..."
echo "Platform: ${PLATFORM}-${ARCH_NAME}"
echo ""

# Install version 0.0.4
echo "📦 Installing version 0.0.4..."
VERSION="0.0.4"

# Install via npm
echo "⏬ Installing ${PACKAGE}@${VERSION}..."
npm install -g ${PACKAGE}@${VERSION}

# Create symlink
NPM_ROOT=$(npm root -g)
BIN_DIR=$(dirname $(which npm))

if [ -f "${NPM_ROOT}/${PACKAGE}/bin/cerebras" ]; then
    echo "🔗 Creating symlink..."
    ln -sf "${NPM_ROOT}/${PACKAGE}/bin/cerebras" "${BIN_DIR}/cerebras"

    echo ""
    echo "✅ Cerebras Code installed successfully!"
    echo ""
    echo "Run 'cerebras --version' to verify"
    echo "Run 'cerebras' to get started"
else
    echo "❌ Installation failed - binary not found"
    exit 1
fi
