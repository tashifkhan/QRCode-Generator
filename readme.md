# QR Code Generator

A versatile QR Code Generator with both GUI and CLI interfaces. Generate QR codes easily from URLs, text, and UPI payment details, with options to display, save, download, and interactively generate them.

## Features

#### Web Application

For instant QR code generation without installing anything, visit:
[qr.tashif.codes](https://qr.tashif.codes)

The online version offers:

- Instant QR code generation directly in your browser
- Support for URL/text and UPI payment QR codes
- No installation or dependencies required
- Mobile-friendly responsive design

### GUI Application

- User-friendly web interface with modal dialogs for URL/Text and UPI QR code generation.
- Real-time QR code generation with fallback via Pyodide.
- Download generated QR codes.
- Cross-platform compatibility.
- Also available as a web app at [qr.tashif.codes](https://qr.tashif.codes).

### CLI Application

- Quick QR code generation from the command line.
- Options to display and save QR codes.
- Interactive UPI QR code generation with prompts for payment details.
- Flexible file path specification.

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
pyinstaller --onefile --windowed --add-data "web:web" gui.py
```

3. Build CLI Application:

```bash
pyinstaller --onefile cli.py
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

- Python 3.13 or higher.
- Eel: Web GUI framework.
- PyQRCode and pypng: QR code generation.
- Pillow: Image processing.
- Rich, Colorama: CLI enhancements.
- Additional dependencies are listed in requirements.txt.

## Technologies

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

This dual approach (Eel + Pyodide fallback) ensures that the QR code generator works both as a desktop application and as a standalone web application at [qr.tashif.codes](https://qr.tashif.codes).

## Contributing

1. Fork the repository.
2. Create your feature branch.
3. Commit your changes.
4. Push to the branch.
5. Create a new Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
