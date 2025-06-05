#!/usr/bin/env python3
"""
Simple HTTPS server for testing PWA functionality locally.
PWA features require HTTPS, so this script serves the files over HTTPS.
"""

import http.server
import ssl
import socketserver
import os
import tempfile
from pathlib import Path

# Change to the web directory
web_dir = Path(__file__).parent
os.chdir(web_dir)

PORT = 8443
Handler = http.server.SimpleHTTPRequestHandler


# Create a simple self-signed certificate for testing
def create_self_signed_cert():
    """Create a self-signed certificate for HTTPS testing"""
    import subprocess
    import sys

    cert_file = "test-cert.pem"
    key_file = "test-key.pem"

    if os.path.exists(cert_file) and os.path.exists(key_file):
        return cert_file, key_file

    try:
        # Generate self-signed certificate
        cmd = [
            "openssl",
            "req",
            "-x509",
            "-newkey",
            "rsa:4096",
            "-keyout",
            key_file,
            "-out",
            cert_file,
            "-days",
            "30",
            "-nodes",
            "-subj",
            "/C=US/ST=Test/L=Test/O=Test/CN=localhost",
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        print(f"✓ Created self-signed certificate: {cert_file}")
        return cert_file, key_file
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("⚠ OpenSSL not found or failed. Using Python's built-in SSL context.")
        return None, None


class PWAHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler with PWA-friendly headers"""

    def end_headers(self):
        # Add PWA-friendly headers
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")

        # Security headers
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("X-XSS-Protection", "1; mode=block")

        # Service Worker headers
        if self.path.endswith("sw.js"):
            self.send_header("Service-Worker-Allowed", "/")

        super().end_headers()

    def log_message(self, format, *args):
        # Custom logging with emojis
        if args[1] == "200":
            emoji = "✓"
        elif args[1].startswith("3"):
            emoji = "↩"
        elif args[1].startswith("4"):
            emoji = "❌"
        else:
            emoji = "⚠"

        print(f"{emoji} {args[0]} - {args[1]} - {self.path}")


def main():
    print("🚀 Starting PWA Test Server...")
    print(f"📁 Serving files from: {os.getcwd()}")

    # Try to create SSL certificate
    cert_file, key_file = create_self_signed_cert()

    with socketserver.TCPServer(("", PORT), PWAHTTPRequestHandler) as httpd:
        if cert_file and key_file:
            # Use HTTPS with certificate files
            try:
                httpd.socket = ssl.wrap_socket(
                    httpd.socket, certfile=cert_file, keyfile=key_file, server_side=True
                )
                protocol = "HTTPS"
            except Exception as e:
                print(f"⚠ SSL setup failed: {e}")
                print("📡 Falling back to HTTP...")
                protocol = "HTTP"
                PORT_HTTP = 8080
                httpd = socketserver.TCPServer(("", PORT_HTTP), PWAHTTPRequestHandler)
                PORT = PORT_HTTP
        else:
            # Use HTTP only
            protocol = "HTTP"
            PORT_HTTP = 8080
            httpd = socketserver.TCPServer(("", PORT_HTTP), PWAHTTPRequestHandler)
            PORT = PORT_HTTP

        print(f"🌐 Server running at {protocol.lower()}://localhost:{PORT}/")
        print(f"📱 PWA Test: {protocol.lower()}://localhost:{PORT}/test-pwa.html")
        print(f"🎯 Main App: {protocol.lower()}://localhost:{PORT}/")
        print()
        print("📋 Available endpoints:")
        print(f"  • Main app: {protocol.lower()}://localhost:{PORT}/")
        print(f"  • PWA test: {protocol.lower()}://localhost:{PORT}/test-pwa.html")
        print(f"  • Manifest: {protocol.lower()}://localhost:{PORT}/manifest.json")
        print(f"  • Service Worker: {protocol.lower()}://localhost:{PORT}/sw.js")
        print()

        if protocol == "HTTPS":
            print(
                "⚠ Note: You'll see a security warning for the self-signed certificate."
            )
            print("   Click 'Advanced' and 'Proceed to localhost' to continue.")
        else:
            print("⚠ Note: Some PWA features require HTTPS and may not work over HTTP.")

        print("\n🛑 Press Ctrl+C to stop the server")
        print("=" * 60)

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n🛑 Server stopped by user")

            # Clean up certificate files
            if cert_file and os.path.exists(cert_file):
                os.remove(cert_file)
            if key_file and os.path.exists(key_file):
                os.remove(key_file)
                print("🧹 Cleaned up temporary certificate files")


if __name__ == "__main__":
    main()
