// Toggle mobile menu
function toggleMenu() {
    document.getElementById("navbar").classList.toggle("active");
}

// API Configuration
const API_URL = 'http://localhost:5000/api';

// Contact form submission - sending to backend
const contactForm = document.getElementById("contactForm");

if (contactForm) {
    contactForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();
        
        // Validation
        if (!name || !email || !message) {
            alert("Please fill in all fields");
            return;
        }
        
        const submitButton = contactForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
        
        try {
            console.log("Attempting to send message to:", API_URL + "/users");
            console.log("Form data:", { name, email, message });
            
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, message })
            });
            
            console.log("Response status:", response.status);
            const data = await response.json();
            console.log("Response data:", data);
            
            if (response.ok) {
                alert("✅ Thank you! Your message has been sent successfully.\n\nYou can view it at: messages.html");
                contactForm.reset();
                submitButton.textContent = "Send Message";
                submitButton.disabled = false;
                console.log("Contact saved to database:", data);
            } else {
                alert("❌ Error: " + (data.error || "Failed to send message"));
                console.error("Server error:", data);
                submitButton.textContent = "Send Message";
                submitButton.disabled = false;
            }
        } catch (error) {
            alert("❌ Network error!\n\nMake sure the backend server is running:\ncd backend\nnpm start\n\nBackend URL: http://localhost:5000");
            console.error("Fetch error:", error);
            console.error("Error details:", {
                message: error.message,
                stack: error.stack
            });
            submitButton.textContent = "Send Message";
            submitButton.disabled = false;
        }
    });
} else {
    console.error("Contact form not found!");
}

// Load projects from database (optional enhancement)
async function loadProjects() {
    try {
        const response = await fetch(`${API_URL}/projects`);
        if (response.ok) {
            const projects = await response.json();
            console.log("Projects loaded from database:", projects);
            // You can render projects dynamically here
        }
    } catch (error) {
        console.log("Backend not available yet. Projects can be added via API.");
    }
}

// Check backend health on page load
window.addEventListener('load', async function() {
    try {
        const response = await fetch(`${API_URL}/health`);
        if (response.ok) {
            console.log("✅ Backend is running and ready");
            loadProjects();
        }
    } catch (error) {
        console.warn("⚠️ Backend is not running. Start the backend with: npm start");
    }
});