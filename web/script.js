function generateQRCode() {
    let data = document.getElementById("data").value;
    if (!data) {
        alert("Please enter text or URL");
        return;
    }
    try {
        eel.generate_qr_web(data)(function(base64) {
            console.log(base64);
            if (base64) {
                setImage(base64);
            } else {
                alert("Failed to generate QR code");
            }
        });
    } catch (error) {
        if (error instanceof ReferenceError && error.message.includes("eel")) {
            generateQRWithPyodide(data)
                .then(base64 => setImage(base64))
                .catch(err => {
                    console.error("Error with Pyodide fallback:", err);
                    alert("Failed to generate QR code: " + err.message);
                });
        } else {
            console.error("Error generating QR code:", error);
            alert("Failed to generate QR code: " + error.message);
        }
    }
}

// New helper function to generate QR codes using Pyodide
async function generateQRWithPyodide(data) {
    // Check if we need to load Pyodide
    if (typeof pyodide === 'undefined') {
        // Add script to load Pyodide if not already present
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js";
        document.head.appendChild(script);
        
        // Wait for script to load
        await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
        });
    }
    
    try {
        const pyodide = await loadPyodide();
        await pyodide.loadPackage("micropip");
        await pyodide.runPythonAsync(`
            import micropip
            await micropip.install("qrcode")
            await micropip.install("pillow")
        `);
        
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
    
    try {
        eel.generate_qr_web(urlText)(function(base64) {
            if (base64) {
                setImage(base64, urlText);
                closeModal("urlModal");
            } else {
                alert("Failed to generate QR code");
            }
        });
    } catch (error) {
        if (error instanceof ReferenceError && error.message.includes("eel")) {
            generateQRWithPyodide(urlText)
                .then(base64 => {
                    setImage(base64, urlText);
                    closeModal("urlModal");
                })
                .catch(err => {
                    console.error("Error with Pyodide fallback:", err);
                    alert("Failed to generate QR code: " + err.message);
                });
        } else {
            console.error("Error generating URL QR code:", error);
            alert("Failed to generate QR code: " + error.message);
        }
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
    
    try {
        eel.generate_upi_qr_web(upiId, displayName, amount)(function(base64) {
            if (base64) {
                let filename = `upi-${upiId.replace('@', '-')}`;
                setImage(base64, filename);
                closeModal("upiModal");
            } else {
                alert("Failed to generate UPI QR code");
            }
        });
    } catch (error) {
        if (error instanceof ReferenceError && error.message.includes("eel")) {
            // Generate UPI QR code with Pyodide
            const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(displayName)}${amount ? '&am=' + encodeURIComponent(amount) : ''}`;
            
            generateQRWithPyodide(upiString)
                .then(base64 => {
                    let filename = `upi-${upiId.replace('@', '-')}`;
                    setImage(base64, filename);
                    closeModal("upiModal");
                })
                .catch(err => {
                    console.error("Error with Pyodide fallback:", err);
                    alert("Failed to generate UPI QR code: " + err.message);
                });
        } else {
            console.error("Error generating UPI QR code:", error);
            alert("Failed to generate UPI QR code: " + error.message);
        }
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

window.onload = function() {
    document.getElementById("qr").style.display = "none";
    document.getElementById("download-btn").style.display = "none";
    document.querySelector(".qr-section").style.display = "none";
    
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
