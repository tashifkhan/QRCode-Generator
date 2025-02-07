import sys
import os
import argparse
from modules.qrcode_genreator import generate_qr

def main():
    parser = argparse.ArgumentParser(description='Generate QR code from a URL')
    parser.add_argument('url', help='URL to encode in QR code')
    parser.add_argument('-s', '--save', nargs='?', const='qr_code.png',
                        help='Save the QR code to a file. If no path is specified, saves as qr_code.png in current directory')
    parser.add_argument('-d', '--display', action='store_true',
                        help='Display the QR code (default when no flags are specified)')
    
    args = parser.parse_args()
    
    # If neither save nor display is specified, set display to True
    should_display = args.display or (not args.save and not args.display)
    
    try:
        generate_qr(args.url, display=should_display, save_path=args.save)
        print(f"QR code generated successfully for: {args.url}")
    except Exception as e:
        print(f"Error generating QR code: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main()