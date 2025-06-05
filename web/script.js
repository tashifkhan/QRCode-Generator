function generateQRCode() {
    let data = document.getElementById("data").value;
    if (!data) {
        alert("Please enter text or URL");
        return;
    }
    
    // Show loading spinner
    showLoader("main-loader");

    // Use eel if available, otherwise use Pyodide
    if (isEelAvailable) {
        try {
            eel.generate_qr_web(data)(function(base64) {
                // Hide loader
                hideLoader("main-loader");
                
                console.log(base64);
                if (base64) {
                    setImage(base64);
                } else {
                    alert("Failed to generate QR code");
                }
            });
        } catch (error) {
            // Hide loader
            hideLoader("main-loader");
            console.error("Error generating QR code with eel:", error);
            showUserFriendlyError("Failed to generate QR code: " + error.message);
        }
    } else {
        // Use Pyodide fallback
        generateQRWithPyodide(data)
            .then(base64 => {
                // Hide loader
                hideLoader("main-loader");
                setImage(base64);
            })
            .catch(err => {
                // Hide loader
                hideLoader("main-loader");
                console.error("Error with Pyodide fallback:", err);
                const isOffline = !navigator.onLine;
                showUserFriendlyError("Failed to generate QR code: " + err.message, isOffline);
            });
    }
}

// Global variables to track Pyodide loading
let pyodideReadyPromise = null;
let isPyodideLoading = false;
let isEelAvailable = false;
let deferredPrompt; // For PWA install prompt

// Function to check if eel is available
function checkEelAvailability() {
    try {
        // Check if eel object exists and has the expected methods
        if (typeof eel !== 'undefined' && 
            eel.generate_qr_web && 
            typeof eel.generate_qr_web === 'function') {
            console.log("Eel is available - desktop mode");
            return true;
        }
    } catch (error) {
        console.log("Eel is not available - web mode");
    }
    return false;
}

// Service Worker Registration
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered successfully:', registration);
            
            // Handle service worker updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New content is available, prompt user to refresh
                        showUpdateAvailable();
                    }
                });
            });
            
            return registration;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }
}

// PWA Install Prompt
function initializePWAInstall() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('PWA install prompt available');
        e.preventDefault();
        deferredPrompt = e;
        showInstallPrompt();
    });
    
    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
        console.log('PWA installed successfully');
        hideInstallPrompt();
        deferredPrompt = null;
    });
}

// Show install prompt
function showInstallPrompt() {
    const installButton = document.createElement('button');
    installButton.className = 'install-btn';
    installButton.innerHTML = '📱 Install App';
    
    installButton.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const result = await deferredPrompt.userChoice;
            console.log('PWA install result:', result);
            
            if (result.outcome === 'accepted') {
                console.log('User accepted PWA install');
            }
            
            deferredPrompt = null;
            hideInstallPrompt();
        }
    });
    
    document.body.appendChild(installButton);
}

// Hide install prompt
function hideInstallPrompt() {
    const installButton = document.querySelector('.install-btn');
    if (installButton) {
        installButton.remove();
    }
}

// Show update available notification
function showUpdateAvailable() {
    const updateNotification = document.createElement('div');
    updateNotification.className = 'update-notification';
    updateNotification.innerHTML = `
        <div>
            <span>🔄 New version available!</span>
            <button onclick="refreshApp()">Update</button>
            <button onclick="dismissUpdate()">Later</button>
        </div>
    `;
    document.body.appendChild(updateNotification);
    
    // Add class to body to adjust layout
    document.body.classList.add('has-update-notification');
}

// Refresh app to get updates
function refreshApp() {
    // Remove the notification class before refreshing
    document.body.classList.remove('has-update-notification');
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(registration => {
            if (registration && registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
            }
        });
    }
}

// Dismiss update notification
function dismissUpdate() {
    const updateNotification = document.querySelector('.update-notification');
    if (updateNotification) {
        updateNotification.remove();
    }
    
    // Remove class from body to restore layout
    document.body.classList.remove('has-update-notification');
}

// Enhanced Pyodide preloading with service worker support
async function preloadPyodide() {
    if (pyodideReadyPromise) return pyodideReadyPromise;
    
    // Set flag to indicate loading is in progress
    isPyodideLoading = true;
    
    // Create the promise for loading Pyodide
    pyodideReadyPromise = (async () => {
        try {
            console.log("Preloading Pyodide...");
            
            // Check if we're in a service worker environment
            const isOffline = !navigator.onLine;
            console.log("Network status:", isOffline ? "offline" : "online");
            
            // Add script to load Pyodide if not already present
            if (!document.querySelector('script[src*="pyodide.js"]')) {
                const script = document.createElement("script");
                script.src = "https://cdn.jsdelivr.net/pyodide/v0.27.4/full/pyodide.js";
                document.head.appendChild(script);
                
                // Wait for script to load
                await new Promise((resolve, reject) => {
                    script.onload = resolve;
                    script.onerror = reject;
                });
            }
            
            const pyodide = await loadPyodide();
            console.log("Pyodide loaded, installing packages...");
            
            // Load and install required packages
            await pyodide.loadPackage("micropip");
            
            // Install packages with better error handling
            try {
                await pyodide.runPythonAsync(`
                    import micropip
                    print("Installing qrcode package...")
                    await micropip.install("qrcode")
                    print("Installing pillow package...")
                    await micropip.install("pillow")
                    print("All packages installed successfully")
                `);
                
                // Notify service worker about successful package loading
                if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                    navigator.serviceWorker.controller.postMessage({
                        type: 'CACHE_PACKAGE',
                        packageName: 'qrcode'
                    });
                    navigator.serviceWorker.controller.postMessage({
                        type: 'CACHE_PACKAGE',
                        packageName: 'pillow'
                    });
                }
                
            } catch (packageError) {
                console.warn("Some packages may not have installed correctly:", packageError);
                // Continue anyway as basic functionality might still work
            }
            
            console.log("Pyodide and required packages are ready");
            return pyodide;
        } catch (error) {
            console.error("Failed to preload Pyodide:", error);
            // Reset the promise so we can try again later
            pyodideReadyPromise = null;
            throw error;
        } finally {
            isPyodideLoading = false;
        }
    })();
    
    return pyodideReadyPromise;
}

// New helper function to generate QR codes using Pyodide
async function generateQRWithPyodide(data) {
    try {
        // Use the preloaded Pyodide instance if available, otherwise load it
        const pyodide = await preloadPyodide();
        
        // Escape any quotes in the data to prevent Python syntax errors
        const safeData = data.replace(/"/g, '\\"');
        
        const base64 = await pyodide.runPythonAsync(`
            import qrcode
            import io
            from base64 import b64encode
            
            if "${safeData}" is None or "${safeData}" == "":
                raise ValueError("Error: QR code data cannot be empty")
            
            img = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            img.add_data("${safeData}")
            img.make(fit=True)
            
            # Create PIL image
            pil_img = img.make_image(fill_color="black", back_color="white")
            
            # Save to bytes buffer
            buffer = io.BytesIO()
            pil_img.save(buffer, format="PNG")
            buffer.seek(0)
            
            # Convert to base64
            encoded = b64encode(buffer.getvalue()).decode("ascii")
            "data:image/png;base64," + encoded
        `);
        
        return base64;
    } catch (pyodideError) {
        console.error("Failed to generate QR with Pyodide:", pyodideError);
        throw new Error("Failed to generate QR code: " + pyodideError.message);
    }
}

function showURLModal() {
    document.getElementById("urlModal").style.display = "block";
}

function showUPIModal() {
    document.getElementById("upiModal").style.display = "none";
    document.getElementById("upiModal").style.display = "block";
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

function generateURLQR() {
    let urlText = document.getElementById("url-text").value;
    
    if (!urlText) {
        alert("Please enter URL or text");
        return;
    }
    
    // Show loading spinner
    showLoader("url-loader");
    
    // Use eel if available, otherwise use Pyodide
    if (isEelAvailable) {
        try {
            eel.generate_qr_web(urlText)(function(base64) {
                // Hide loader
                hideLoader("url-loader");
                
                if (base64) {
                    setImage(base64, urlText);
                    closeModal("urlModal");
                } else {
                    alert("Failed to generate QR code");
                }
            });
        } catch (error) {
            // Hide loader
            hideLoader("url-loader");
            console.error("Error generating URL QR code with eel:", error);
            alert("Failed to generate QR code: " + error.message);
        }
    } else {
        // Use Pyodide fallback
        generateQRWithPyodide(urlText)
            .then(base64 => {
                // Hide loader
                hideLoader("url-loader");
                setImage(base64, urlText);
                closeModal("urlModal");
            })
            .catch(err => {
                // Hide loader
                hideLoader("url-loader");
                console.error("Error with Pyodide fallback:", err);
                alert("Failed to generate QR code: " + err.message);
            });
    }
}

function generateUPIQR() {
    let upiId = document.getElementById("upi-id").value;
    let displayName = document.getElementById("display-name").value;
    let amount = document.getElementById("amount").value;
    let amountToggleEnabled = document.getElementById("amount-toggle").checked;
    
    if (!upiId) {
        alert("Please enter UPI ID");
        return;
    }
    
    if (!displayName) {
        alert("Please enter Display Name");
        return;
    }
    
    // Only use amount if toggle is enabled
    if (!amountToggleEnabled) {
        amount = "";
    } else if (!amount) {
        amount = "0.00";
    } else if (!amount.includes(".")) {
        amount = amount + ".00";
    }
    
    // Show loading spinner
    showLoader("upi-loader");
    
    // Use eel if available, otherwise use Pyodide
    if (isEelAvailable) {
        try {
            eel.generate_upi_qr_web(upiId, displayName, amount)(function(base64) {
                // Hide loader
                hideLoader("upi-loader");
                
                if (base64) {
                    let filename = `upi-${upiId.replace('@', '-')}`;
                    setImage(base64, filename);
                    closeModal("upiModal");
                } else {
                    alert("Failed to generate UPI QR code");
                }
            });
        } catch (error) {
            // Hide loader
            hideLoader("upi-loader");
            console.error("Error generating UPI QR code with eel:", error);
            alert("Failed to generate UPI QR code: " + error.message);
        }
    } else {
        // Generate UPI QR code with Pyodide
        const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(displayName)}${amount ? '&am=' + encodeURIComponent(amount) : ''}`;
        
        generateQRWithPyodide(upiString)
            .then(base64 => {
                // Hide loader
                hideLoader("upi-loader");
                let filename = `upi-${upiId.replace('@', '-')}`;
                setImage(base64, filename);
                closeModal("upiModal");
            })
            .catch(err => {
                // Hide loader
                hideLoader("upi-loader");
                console.error("Error with Pyodide fallback:", err);
                alert("Failed to generate UPI QR code: " + err.message);
            });
    }
}

function setImage(base64, filename = "qr-code") {
    const qrImage = document.getElementById("qr");
    const downloadBtn = document.getElementById("download-btn");
    const qrSection = document.querySelector(".qr-section");
    
    qrImage.src = base64;
    qrImage.style.display = "block";
    qrImage.style.margin = "0 auto"; 
    downloadBtn.style.display = "block";
    qrSection.style.display = "flex"; 
    qrSection.style.flexDirection = "column";
    qrSection.style.alignItems = "center";
    qrSection.style.justifyContent = "center"; 
    
    downloadBtn.onclick = function() {
        const link = document.createElement("a");
        link.href = base64;
        link.download = `${filename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
}

// Helper functions for showing/hiding loader
function showLoader(loaderId) {
    const loaderWrapper = document.getElementById(loaderId);
    if (loaderWrapper) {
        loaderWrapper.style.display = "flex";
    }
}

function hideLoader(loaderId) {
    const loaderWrapper = document.getElementById(loaderId);
    if (loaderWrapper) {
        loaderWrapper.style.display = "none";
    }
}

// Network status handling
function initializeNetworkHandling() {
    // Show offline indicator when offline
    function showOfflineIndicator() {
        if (!document.querySelector('.offline-indicator')) {
            const offlineDiv = document.createElement('div');
            offlineDiv.className = 'offline-indicator';
            offlineDiv.innerHTML = '🔌 Offline Mode - Using cached resources';
            document.body.appendChild(offlineDiv);
        }
    }
    
    // Hide offline indicator when online
    function hideOfflineIndicator() {
        const offlineDiv = document.querySelector('.offline-indicator');
        if (offlineDiv) {
            offlineDiv.remove();
        }
    }
    
    // Initial check
    if (!navigator.onLine) {
        showOfflineIndicator();
    }
    
    // Listen for network changes
    window.addEventListener('online', () => {
        console.log('Back online');
        hideOfflineIndicator();
    });
    
    window.addEventListener('offline', () => {
        console.log('Gone offline');
        showOfflineIndicator();
    });
}

// Enhanced error handling for PWA
function showUserFriendlyError(message, isNetworkError = false) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    
    const icon = isNetworkError ? '🌐' : '❌';
    errorDiv.innerHTML = `
        <div style="font-size: 28px; margin-bottom: 15px;">${icon}</div>
        <div style="margin-bottom: 20px; font-size: 16px; line-height: 1.4;">${message}</div>
        <button onclick="this.parentElement.remove()">OK</button>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentElement) {
            errorDiv.remove();
        }
    }, 5000);
}

window.onload = function() {
    document.getElementById("qr").style.display = "none";
    document.getElementById("download-btn").style.display = "none";
    document.querySelector(".qr-section").style.display = "none";
    
    // Initialize PWA features
    registerServiceWorker();
    initializePWAInstall();
    initializeNetworkHandling();
    
    // Check eel availability on page load (useEffect-like behavior)
    isEelAvailable = checkEelAvailability();
    
    // Only preload Pyodide if eel is not available
    if (!isEelAvailable) {
        console.log("Eel not detected, preloading Pyodide for web mode...");
        document.body.classList.add('loading-pyodide');
        
        preloadPyodide()
            .then(() => {
                document.body.classList.remove('loading-pyodide');
                console.log("Pyodide ready for offline use");
            })
            .catch(err => {
                document.body.classList.remove('loading-pyodide');
                console.warn("Preloading Pyodide failed, will retry when needed:", err);
                if (!navigator.onLine) {
                    showUserFriendlyError("Offline mode setup failed. Some features may not work.", true);
                }
            });
    } else {
        console.log("Eel detected, skipping Pyodide preload - using desktop mode");
    }
    
    // Toggle functionality for amount field
    const amountToggle = document.getElementById("amount-toggle");
    const amountInput = document.getElementById("amount");
    
    // Fix: Make sure elements exist before adding event listeners
    if (amountToggle && amountInput) {
        // Initialize state based on checkbox
        amountInput.disabled = !amountToggle.checked;
        if (!amountToggle.checked) {
            amountInput.classList.add('disabled');
        }
        
        // Fix: Direct event listener on the checkbox
        amountToggle.addEventListener("change", function() {
            // Toggle the disabled state
            amountInput.disabled = !this.checked;
            
            if (this.checked) {
                amountInput.focus();
                amountInput.classList.remove('disabled');
            } else {
                amountInput.classList.add('disabled');
                amountInput.value = '';  // Clear amount when toggle is turned off
            }
            
            console.log("Toggle state changed:", this.checked);
        });
        
        // Fix: Prevent the change event from being stopped
        const toggleSwitch = document.querySelector(".toggle-switch");
        if (toggleSwitch) {
            toggleSwitch.addEventListener("click", function(e) {
                // Only preventDefault if clicking the switch itself, not the input
                if (e.target !== amountToggle) {
                    e.preventDefault();
                    // Toggle the checkbox programmatically
                    amountToggle.checked = !amountToggle.checked;
                    // Manually trigger change event
                    amountToggle.dispatchEvent(new Event('change'));
                }
            });
        }
    }
    
    // Modal close functionality
    const closeButtons = document.querySelectorAll(".close-modal");
    closeButtons.forEach(button => {
        button.addEventListener("click", function() {
            const modalId = this.getAttribute("data-modal");
            closeModal(modalId);
        });
    });
    
    // Close modals when clicking outside of them
    window.addEventListener("click", function(event) {
        if (event.target.classList.contains("modal")) {
            closeModal(event.target.id);
        }
    });
    
    // Close modals with ESC key
    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape") {
            const openModals = document.querySelectorAll(".modal");
            openModals.forEach(modal => {
                if (modal.style.display === "block") {
                    closeModal(modal.id);
                }
            });
        }
    });
};
