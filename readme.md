# QR Code Generator

A versatile QR Code Generator with both GUI and CLI interfaces. Generate QR codes easily from URLs or text, with options to display, save, and download the generated codes.

## Features

### GUI Application

- User-friendly web interface
- Real-time QR code generation
- Download generated QR codes
- Cross-platform compatibility

### CLI Application

- Quick QR code generation from command line
- Options to display and save QR codes
- Flexible file path specification

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

### CLI Application

1. Run from source:

```bash
python cli.py [URL] [-s SAVE_PATH] [-d]
```

2. Or use the packaged executable:

```bash
./cli [URL] [-s SAVE_PATH] [-d]
```

Options:

- `URL`: The URL or text to encode (required)
- `-s, --save`: Save the QR code to a file (optional, defaults to qr_code.png)
- `-d, --display`: Display the QR code

Examples:

```bash
# Generate and display a QR code
python cli.py https://tashif.codes -d

# Generate and save a QR code
python cli.py https://tashif.codes -s "/Users/taf/Desktop/My Website QR Code.png"
```

## Dependencies

- Eel: Web GUI framework
- PyQRCode: QR code generation
- Pillow: Image processing
- Additional dependencies in requirements.txt

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
