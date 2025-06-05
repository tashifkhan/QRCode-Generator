# QR Code Generator

A versatile QR Code Generator with both GUI and CLI interfaces. Generate QR codes easily from URLs, text, and UPI payment details, with options to display, save, download, and interactively generate them.

## Features

### Progressive Web App (PWA)

For instant QR code generation without installing anything, visit:
[qr.tashif.codes](https://qr.tashif.codes)

The web application is a full Progressive Web App (PWA) that offers:

- **Installable**: Install on any device (mobile, tablet, desktop) for native app-like experience
- **Offline Functionality**: Works completely offline after first visit - no internet required
- **Instant Loading**: Cached resources ensure lightning-fast startup
- **UPI ID Store**: Automatically saves and caches your UPI IDs/ Adresses for quick reuse
- **Auto-Updates**: Automatically updates to the latest version with user notification
- **Native Experience**: Full-screen mode, app icon on home screen, and native navigation
- **Cross-Platform**: Works on iOS, Android, Windows, macOS, and Linux
- **Smart Caching**: Intelligent caching of QR codes and Python runtime for offline use

#### PWA Features:

- **Offline QR Generation**: Uses cached Pyodide runtime to generate QR codes without internet
- **UPI ID Memory**: Remembers your frequently used UPI IDs, names, and amounts
- **Background Updates**: Downloads updates in background and notifies when ready
- **Native Install**: Add to home screen on mobile or install as desktop app
- **Service Worker**: Advanced caching strategy for optimal performance

### GUI Application

- User-friendly web interface with modal dialogs for URL/Text and UPI QR code generation
- Real-time QR code generation with dual-mode support (Eel backend + Pyodide fallback)
- Download generated QR codes as PNG files
- Cross-platform compatibility (Windows, macOS, Linux)
- **UPI History Management**: Automatically saves up to 10 recent UPI payment configurations
- **Smart Caching**: Remembers frequently used UPI IDs, display names, and amounts
- Progressive Web App capabilities when accessed via browser
- Also available as a PWA at [qr.tashif.codes](https://qr.tashif.codes)

### CLI Application

- Quick QR code generation from the command line.
- Options to display and save QR codes.
- Interactive UPI QR code generation with prompts for payment details.
- Flexible file path specification.

## Progressive Web App Installation

### Installing the PWA

The web version at [qr.tashif.codes](https://qr.tashif.codes) can be installed as a native app on any device:

#### On Mobile Devices (iOS/Android):

1. Open [qr.tashif.codes](https://qr.tashif.codes) in your mobile browser
2. Look for the "📱 Install App" button (usually bottom-left corner)
3. Tap it and follow the installation prompts
4. The app will be added to your home screen with a native icon
5. Launch from home screen for full-screen, app-like experience

#### On Desktop (Windows/macOS/Linux):

1. Open [qr.tashif.codes](https://qr.tashif.codes) in Chrome, Edge, or other PWA-supported browser
2. Look for the install icon in the address bar or the "📱 Install App" button
3. Click "Install" to add it to your desktop/applications folder
4. Launch like any native desktop application

### Offline Functionality

Once installed or after the first visit, the PWA works completely offline:

- **Complete Offline Operation**: Generate QR codes without any internet connection
- **Cached Python Runtime**: Uses Pyodide WebAssembly runtime cached locally
- **Persistent Storage**: Your UPI history and preferences are saved locally
- **Background Updates**: When online, automatically downloads updates
- **Smart Caching Strategy**: Intelligently caches resources for optimal performance

#### What Works Offline:

- URL/Text QR code generation
- UPI payment QR code generation
- Access to saved UPI ID's / adresses (up to 10 recent entries)
- Download generated QR codes
- Full app functionality and interface
- Automatic data persistence

## Installation

### Pre-packaged Applications

For convenience, pre-built executable files are available in the [Releases](https://github.com/tashifkhan/QRCode-Generator/releases) section of the GitHub repository. These executables require no installation or dependencies:

1. Go to the [Releases](https://github.com/tashifkhan/QRCode-Generator/releases) page
2. Download the appropriate version for your operating system:
   - **Windows**: Download `QRCode-Generator-Windows.zip`
   - **macOS**: Download `QRCode-Generator-macOS.zip`
   - **Linux**: Download `QRCode-Generator-Linux.zip`
3. Extract the downloaded archive
4. Run the application:
   - **GUI**: Run `qrcode-generator-gui` (or `qrcode-generator-gui.exe` on Windows)
   - **CLI**: Run `qrcode-generator-cli` (or `qrcode-generator-cli.exe` on Windows) from the terminal

#### Note for macOS Users

macOS may apply quarantine attributes to downloaded applications. If you encounter security warnings when trying to run the application, you have two options:

1. **Remove quarantine attribute using Terminal**:

   ```bash
   xattr -d com.apple.quarantine /path/to/qrcode-generator-gui
   xattr -d com.apple.quarantine /path/to/qrcode-generator-cli
   ```

   Replace `/path/to/` with the actual path to the extracted executables.

2. **Using GUI**:
   - Right-click (or Control+click) on the application
   - Select "Open" from the context menu
   - When the security warning appears, click "Open"
   - The application will be saved as an exception to your security settings

### From Source

1. Clone the repository:

```bash
git clone https://github.com/tashifkhan/QRCode-Generator.git
cd QRCode-Generator
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

### Using PyInstaller (Packaged Executables)

#### Build Executables

1. Install PyInstaller:

```bash
pip install pyinstaller
```

2. Build GUI Application:

```bash
pyinstaller --onefile --windowed --add-data "web:web" app.py
```

3. Build CLI Application:

```bash
pyinstaller --onefile main.py
```

The executables will be available in the `dist` directory.

## Usage

### GUI Application

1. Run from source:

```bash
python app.py
```

2. Or use the packaged executable:
   - Windows: Run `app.exe`
   - macOS/Linux: Run `./app`

Upon launching the web interface you'll see two options:

- **URL/Text QR**: Enter a URL or text to generate a QR code.
- **UPI QR**: Enter your UPI ID, display name, and optionally set an amount to generate a UPI payment QR code.
  - **History Feature**: Previously used UPI details are automatically saved and can be quickly reused from the dropdown history
  - **Smart Suggestions**: Access up to 10 recent UPI configurations with one click
  - **Privacy**: All history stored locally on your device

### CLI Application

1. Run from source:

```bash
python main.py [URL] [-s SAVE_PATH] [-d]
```

For UPI QR code generation, run:

```bash
python main.py -upi
```

2. Or use the packaged executable:

```bash
./main [URL] [-s SAVE_PATH] [-d]
```

Options:

- `URL`: The URL or text to encode (required for URL/Text QR).
- `-upi, --upi`: Generate a UPI QR code (or use interactive prompts if no value is provided).
- `-s, --save`: Save the QR code to a file (optional, defaults to qr_code.png).
- `-d, --display`: Display the QR code.

Examples:

```bash
# Generate and display a URL QR code
python main.py https://tashif.codes -d

# Generate and save a URL QR code
python main.py https://tashif.codes -s "/Users/taf/Desktop/My Website QR Code.png"

# Generate a UPI QR code interactively
python main.py -upi
```

## Dependencies

- Python 3.13 or higher
- Eel: Web GUI framework
- PyQRCode and pypng: QR code generation
- Pillow: Image processing
- Rich, Colorama: CLI enhancements
- Additional dependencies are listed in requirements.txt

### Web/PWA Dependencies (Auto-loaded):

- Pyodide: Python runtime in browser (cached for offline use)
- qrcode: QR code generation library for Pyodide
- pillow: Image processing for Pyodide
- Service Worker API: For offline functionality and caching
- Web Storage API: For UPI history persistence

## Technologies

### Progressive Web App (PWA)

The web version implements modern PWA standards for native app-like experience:

- **Service Worker**: Advanced caching strategy with cache-first for static assets and network-first for dynamic content
- **Web App Manifest**: Proper PWA metadata for installation and theming
- **Offline-First Architecture**: Complete functionality without internet after initial load
- **Background Sync**: Automatic updates with user notification system
- **Local Storage**: Persistent UPI history and user preferences using browser storage
- **Responsive Design**: Adaptive interface for all screen sizes and orientations

### Eel

This project uses [Eel](https://github.com/ChrisKnott/Eel), a Python library for creating simple Electron-like offline HTML/JS GUI applications. Eel hosts a local web server and allows for:

- Bidirectional communication between Python backend and JavaScript frontend
- Native GUI capabilities using web technologies
- Easy deployment as a standalone desktop application

### Pyodide

[Pyodide](https://pyodide.org/) is used as a fallback mechanism when the Eel backend is not available (such as when running in browsers without the Python backend). It:

- Brings the Python runtime to the browser via WebAssembly
- Allows Python code execution directly in the browser
- Enables generation of QR codes on the client side when accessing the web version
- Provides seamless functionality between desktop application and web version
- **Cached Offline**: Complete Pyodide runtime and required packages cached for offline use

### UPI History & Caching

The application implements intelligent caching for user convenience:

- **Local Storage**: UPI payment details stored securely in browser's local storage
- **History Management**: Automatically saves up to 10 most recent UPI configurations
- **Quick Access**: Dropdown history for instant reuse of previous UPI details
- **Privacy First**: All data stored locally on device, never transmitted to servers
- **Cross-Session**: History persists across browser sessions and app restarts

This dual approach (Eel + Pyodide fallback) with PWA capabilities ensures that the QR code generator works as a desktop application, web application, and installable PWA with full offline functionality.

## Contributing

1. Fork the repository.
2. Create your feature branch.
3. Commit your changes.
4. Push to the branch.
5. Create a new Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
