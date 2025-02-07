import sys
import argparse
from modules.qrcode_genreator import generate_qr

def main():
    parser = argparse.ArgumentParser(description='Generate QR code from a URL')
    parser.add_argument('url', help='URL to encode in QR code')
    
    args = parser.parse_args()
    
    try:
        generate_qr(args.url, display=True)
        print(f"QR code generated successfully for: {args.url}")
    except Exception as e:
        print(f"Error generating QR code: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main()