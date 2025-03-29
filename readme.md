# QR Code Generator

A versatile QR Code Generator with both GUI and CLI interfaces. Generate QR codes easily from URLs, text, and UPI payment details, with options to display, save, download, and interactively generate them.

## Features

### GUI Application

- User-friendly web interface with modal dialogs for URL/Text and UPI QR code generation.
- Real-time QR code generation with fallback via Pyodide.
- Download generated QR codes.
- Cross-platform compatibility.

### CLI Application

- Quick QR code generation from the command line.
- Options to display and save QR codes.
- Interactive UPI QR code generation with prompts for payment details.
- Flexible file path specification.

## Installation

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
python gui.py
```

2. Or use the packaged executable:
   - Windows: Run `gui.exe`
   - macOS/Linux: Run `./gui`

Upon launching the web interface you’ll see two options:

- **URL/Text QR**: Enter a URL or text to generate a QR code.
- **UPI QR**: Enter your UPI ID, display name, and optionally set an amount to generate a UPI payment QR code.

### CLI Application

1. Run from source:

```bash
python cli.py [URL] [-s SAVE_PATH] [-d]
```

For UPI QR code generation, run:

```bash
python cli.py -upi [UPI_ID] [-s SAVE_PATH]
```

2. Or use the packaged executable:

```bash
./cli [URL] [-s SAVE_PATH] [-d]
```

Options:

- `URL`: The URL or text to encode (required for URL/Text QR).
- `-upi, --upi`: Generate a UPI QR code (or use interactive prompts if no value is provided).
- `-s, --save`: Save the QR code to a file (optional, defaults to qr_code.png).
- `-d, --display`: Display the QR code.

Examples:

```bash
# Generate and display a URL QR code
python cli.py https://tashif.codes -d

# Generate and save a URL QR code
python cli.py https://tashif.codes -s "/Users/taf/Desktop/My Website QR Code.png"

# Generate a UPI QR code interactively
python cli.py -upi
```

## Dependencies

- Python 3.13 or higher.
- Eel: Web GUI framework.
- PyQRCode and pypng: QR code generation.
- Pillow: Image processing.
- Rich, Colorama: CLI enhancements.
- Additional dependencies are listed in requirements.txt.

## Codebase Updates

- Added UPI payment QR code generation in both the GUI and CLI.
- Integrated modal dialogs in the GUI for both URL/Text and UPI QR code generation.
- Introduced a Pyodide fallback mechanism for QR code generation where the Eel backend is not available.
- Enhanced input validation (especially for UPI details) and improved UI styling.
- Updated the project to run on Python 3.13.

## Contributing

1. Fork the repository.
2. Create your feature branch.
3. Commit your changes.
4. Push to the branch.
5. Create a new Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
