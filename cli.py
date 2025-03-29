import sys
import os
import argparse
from qr_generator import generate_qr, generate_upi_qr


def main():
    parser = argparse.ArgumentParser(description='Generate QR code from a URL or UPI payment')
    parser.add_argument('url', help='URL to encode in QR code', nargs='?')
    parser.add_argument('-s', '--save', nargs='?', const='qr_code.png',
                        help='Save the QR code to a file. If no path is specified, saves as qr_code.png in current directory')
    parser.add_argument('-d', '--display', action='store_true',
                        help='Display the QR code (default when no flags are specified)')
    parser.add_argument('-upi', '--upi', metavar='UPI_ID', nargs='?', const='default_upi_id',
                        help='Generate UPI payment QR code. If provided without value, uses default UPI ID')
    
    args = parser.parse_args()
    
    if not args.url and not args.upi:
        if input("No URL or UPI ID provided. \nDo you want to generate a UPI QR code? (y/n): ").lower().strip() == 'y':
            generate_upi_qr()
        else:
            if input("Do you want to generate a QR code from a URL? (y/n): ").lower().strip() == 'y':
                args.url = input("Enter the URL: ")
                generate_qr(args.url, display=True)
                if input("Do you want to save the QR code? (y/n): ").lower().strip() == 'y':
                    save_path = input("Enter the path to save the QR code: ")
                    generate_qr(args.url, display=False, save_path=save_path)
            else:
                print("No URL or UPI ID provided. Exiting.")
                sys.exit(1)
    
    # If neither save nor display is specified, set display to True
    should_display = args.display or (not args.save and not args.display)
    
    try:
        if args.upi:
            generate_upi_qr()
            print("UPI QR code generated successfully.")
        else:
            generate_qr(args.url, display=should_display, save_path=args.save)
            print(f"QR code generated successfully for: {args.url}")
    except Exception as e:
        print(f"Error generating QR code: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main()