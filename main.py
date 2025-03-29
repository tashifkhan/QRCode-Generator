import sys
import os
import argparse
from qr_generator import generate_qr, generate_upi_qr
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.prompt import Prompt
import colorama

colorama.init()

console = Console()

def display_banner():
    banner = r"""
  ___  ___   ___ ___ ___  ___    
 / _ \| _ \ / __/ __|   \| __|   
| (_) |   /| (__| | | |) | _|    
 \__\_\_|_\ \___|___|___/|___|   
                                 
    QR Code Generator           

    """
    console.print(Panel(Text(banner, justify="center"), border_style="green"))

def main():
    display_banner()
    
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
        if Prompt.ask("[red]No URL or UPI ID provided.[/red] \n[cyan]Do you want to generate a UPI QR code?[/cyan]", choices=["y", "n"], default="y") == 'y':
            generate_upi_qr()
        else:
            if Prompt.ask("[cyan]Do you want to generate a QR code from a URL?[/cyan]", choices=["y", "n"], default="y") == 'y':
                args.url = Prompt.ask("[cyan]Enter the URL[/cyan]")
                with console.status("[bold green]Generating QR code...[/bold green]", spinner="dots"):
                    generate_qr(args.url, display=True)
                
                if Prompt.ask("[cyan]Do you want to save the QR code?[/cyan]", choices=["y", "n"], default="y") == 'y':
                    console.print("[yellow]The path should contain the file name and extension.[/yellow]")
                    console.print("[yellow]Example: ~/Downloads/qr_code.png or C:\\Users\\name\\Downloads\\qr_code.png[/yellow]")
                    console.print("[yellow]If no path is provided, the QR code will be saved in the Downloads folder.[/yellow]")
                    console.print()
                    
                    # Set default based on OS
                    default_path = os.path.join("~", "Downloads", "qr_code.png")
                    save_path = Prompt.ask("[cyan]Enter the path to save the QR code[/cyan]", default=default_path)
                    
                    if not save_path:
                        home_dir = os.path.expanduser("~")
                        downloads_folder = os.path.join(home_dir, "Downloads")
                        filename = f"qr_code_{args.url.replace('http://', '').replace('https://', '').replace('/', '_').replace(':', '_')}.png"
                        save_path = os.path.join(downloads_folder, filename)
                        try:
                            if not os.path.exists(downloads_folder):
                                os.makedirs(downloads_folder)
                        except OSError as e:
                            console.print(f"[bold red]Error creating directory:[/bold red] {str(e)}")
                            downloads_folder = os.getcwd()  # Fallback to current directory
                            save_path = os.path.join(downloads_folder, filename)
                            console.print(f"[yellow]Falling back to current directory: {downloads_folder}[/yellow]")
                    else:
                        # Expand user directory if path starts with ~
                        save_path = os.path.expanduser(save_path)
                        
                        # If path is not absolute, make it relative to current directory
                        if not os.path.isabs(save_path) and not save_path.startswith('~'):
                            save_path = os.path.join(os.getcwd(), save_path)
                            
                        # Ensure file has .png extension
                        if not save_path.lower().endswith(('.png', '.jpg', '.jpeg')):
                            save_path += '.png'
                            
                        try:
                            # Get the directory part of the provided path
                            dir_path = os.path.dirname(os.path.abspath(save_path))
                            # Create directory if it doesn't exist
                            if not os.path.exists(dir_path) and dir_path:
                                os.makedirs(dir_path)
                            save_path = os.path.abspath(save_path)
                        except OSError as e:
                            console.print(f"[bold red]Error with save path:[/bold red] {str(e)}")
                            filename = os.path.basename(save_path)
                            save_path = os.path.join(os.getcwd(), filename or "qr_code.png")
                            console.print(f"[yellow]Falling back to: {save_path}[/yellow]")
                    
                    with console.status("[bold green]Saving QR code...[/bold green]", spinner="dots"):
                        try:
                            generate_qr(args.url, display=False, save_path=save_path)
                            console.print(f"[bold green]✓[/bold green] QR code saved to: [blue]{save_path}[/blue]")
                        except Exception as e:
                            console.print(f"[bold red]Error saving QR code:[/bold red] {str(e)}")
                            console.print("[yellow]Trying alternative location...[/yellow]")
                            alt_path = os.path.join(os.getcwd(), "qr_code.png")
                            try:
                                generate_qr(args.url, display=False, save_path=alt_path)
                                console.print(f"[bold green]✓[/bold green] QR code saved to: [blue]{alt_path}[/blue]")
                            except Exception as e2:
                                console.print(f"[bold red]Failed to save QR code:[/bold red] {str(e2)}")
            else:
                console.print("[bold red]No URL or UPI ID provided. Exiting.[/bold red]")
                sys.exit(1)
    
    # If neither save nor display is specified, set display to True
    should_display = args.display or (not args.save and not args.display)
    
    try:
        if args.upi:
            generate_upi_qr()
            console.print("[bold green]✓[/bold green] UPI QR code generated successfully!")
        else:
            generate_qr(args.url, display=should_display, save_path=args.save)
            console.print(f"[bold green]✓[/bold green] QR code generated successfully for: [blue]{args.url}[/blue]")
    except Exception as e:
        console.print(f"[bold red]Error generating QR code:[/bold red] {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main()