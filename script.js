// =====================================================================
// FraudSafe – main script (plain JavaScript, no framework)
// Login, registration, sessions and the database all use Supabase.
// The Supabase client is created in supabase.js (loaded before this file).
// =====================================================================

// ================= SHARED STATE & HELPERS =================

let currentUser = null;      // the logged-in Supabase user (or null)
let currentProfile = null;   // row from the "profiles" table (or null)

// Read the URL hash BEFORE Supabase cleans it. After clicking the link in a
// confirmation email, the browser opens the site with something like
// "#access_token=...&type=signup" (or "#error_description=..." if it failed).
const urlHashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
let justConfirmedEmail = urlHashParams.get("type") === "signup";
const urlHashError = urlHashParams.get("error_description");

function setMessage(element, text, type) {
    if (!element) {
        return;
    }
    element.textContent = text;
    if (type === "success") {
        element.style.color = "#16a34a";
    } else if (type === "error") {
        element.style.color = "#ef4444";
    } else {
        element.style.color = "";
    }
}

function setBusy(form, busy) {
    const button = form.querySelector('button[type="submit"]');
    if (!button) {
        return;
    }
    if (busy) {
        button.dataset.label = button.textContent;
        button.textContent = "Please wait...";
    } else if (button.dataset.label) {
        button.textContent = button.dataset.label;
    }
    button.disabled = busy;
}

let toastTimer = null;

function showToast(text) {
    const toast = document.getElementById("toast");
    if (!toast) {
        return;
    }
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function() {
        toast.classList.remove("show");
    }, 4000);
}

const NOT_CONFIGURED_MESSAGE =
    "Supabase is not set up yet. Open supabase.js and add your Project URL and publishable key.";

const NETWORK_MESSAGE =
    "Network problem. Please check your internet connection and try again.";

function isNetworkError(error) {
    const text = ((error && error.message) || "").toLowerCase();
    return (
        error instanceof TypeError ||
        text.includes("failed to fetch") ||
        text.includes("network") ||
        text.includes("fetch")
    );
}

// ================= PAGE SWITCHING =================

function showPage(pageId) {

    // The profile page is only for logged-in users (this just hides the page;
    // the database enforces who can really read the data).
    if (pageId === "profile" && !currentUser) {
        openLogin();
        return;
    }

    const pages = document.querySelectorAll(".page");

    pages.forEach(function(page) {
        page.classList.remove("active");
    });

    const selectedPage = document.getElementById(pageId);

    if (selectedPage) {
        selectedPage.classList.add("active");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
}

// ================= DARK MODE =================

function toggleTheme() {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
}


// Load saved theme
window.addEventListener("DOMContentLoaded", function() {

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark");
    }

});


// ================= SHARE WEBSITE =================

function shareWebsite() {

    const shareData = {
        title: "FraudSafe - Consumer Fraud Awareness Portal",
        text: "Learn how to stay safe from online fraud with FraudSafe.",
        url: window.location.href
    };

    if (navigator.share) {

        navigator.share(shareData)
            .then(function() {
                console.log("Website shared successfully.");
            })
            .catch(function(error) {
                console.log("Share cancelled.");
            });

    } else {

        navigator.clipboard.writeText(window.location.href)
            .then(function() {
                alert("Website link copied! You can now share it.");
            })
            .catch(function() {
                alert("Copy the website link from the browser address bar.");
            });

    }
}


// ================= FRAUD SEARCH =================

function searchFrauds() {

    const searchInput = document.getElementById("fraudSearch");

    if (!searchInput) {
        return;
    }

    const searchText = searchInput.value.toLowerCase();

    const cards = document.querySelectorAll(".fraud-card");

    cards.forEach(function(card) {

        const cardText = card.innerText.toLowerCase();

        if (cardText.includes(searchText)) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }

    });
}


// ================= FRAUD DETAILS =================

const fraudData = {

    "Online Shopping Fraud": {
        description:
            "Scammers create fake shopping websites or advertisements to collect money without delivering genuine products.",
        warning:
            "Very low prices, unknown websites, poor contact information and pressure to make immediate payment.",
        prevention:
            "Use trusted websites, check reviews and website addresses, and avoid suspicious payment requests."
    },

    "UPI / Payment Fraud": {
        description:
            "Fraudsters may trick users into approving unwanted UPI or digital payment transactions.",
        warning:
            "Unknown payment requests, fake refund messages and requests to enter a UPI PIN.",
        prevention:
            "Verify the receiver before paying. Never share your UPI PIN or approve an unknown request."
    },

    "Phishing": {
        description:
            "Phishing uses fake emails, messages or websites to steal passwords, account details or other information.",
        warning:
            "Urgent messages, suspicious links, spelling mistakes and requests for personal information.",
        prevention:
            "Do not click suspicious links. Verify the website and sender before providing information."
    },

    "Fake Customer Care": {
        description:
            "Scammers pretend to be customer-care representatives and ask for sensitive information or payments.",
        warning:
            "Unknown callers asking for OTPs, PINs, passwords or remote access to your device.",
        prevention:
            "Use customer-care details from the official website or application."
    },

    "OTP Scam": {
        description:
            "Fraudsters try to obtain a one-time password to complete unauthorized access or transactions.",
        warning:
            "Unexpected OTP messages or calls asking you to tell someone the OTP.",
        prevention:
            "Never share an OTP with anyone, even if the person claims to be from a trusted organization."
    },

    "Fake Offers": {
        description:
            "Fraudsters use fake discounts, prizes and promotional offers to collect money or personal information.",
        warning:
            "Unrealistic prizes, limited-time pressure and requests for advance payment.",
        prevention:
            "Verify offers through official sources and avoid paying unknown fees."
    },

    "Delivery Scam": {
        description:
            "Scammers may pretend to be delivery agents and ask for payment or personal information.",
        warning:
            "Unexpected delivery calls, suspicious links or requests for payment for an unknown parcel.",
        prevention:
            "Check your actual order through the official shopping application or website."
    },

    "Fake Job Scam": {
        description:
            "Fraudsters advertise fake jobs and ask applicants for registration, training or processing fees.",
        warning:
            "Guaranteed jobs, very high salaries and requests for money before employment.",
        prevention:
            "Verify the company and job vacancy through official sources."
    },

    "Impersonation Scam": {
        description:
            "Scammers pretend to be friends, family members, officials or representatives of organizations.",
        warning:
            "Urgent requests for money or sensitive information from an unknown number or account.",
        prevention:
            "Verify the person's identity using another trusted communication method."
    },

    "SIM Scam": {
        description:
            "Fraudsters may attempt to misuse mobile or SIM-related information to gain unauthorized access.",
        warning:
            "Unexpected SIM-related messages, loss of mobile service or suspicious requests.",
        prevention:
            "Contact your mobile operator through official channels if you notice suspicious activity."
    }

};


function showFraudDetails(fraudName) {

    const modal = document.getElementById("fraudModal");

    const title = document.getElementById("fraudTitle");
    const description = document.getElementById("fraudDescription");
    const warning = document.getElementById("fraudWarning");
    const prevention = document.getElementById("fraudPrevention");

    // Stop safely if the popup HTML is missing
    if (!modal || !title || !description || !warning || !prevention) {
        console.error("Fraud popup elements not found in index.html.");
        return;
    }

    const data = fraudData[fraudName];

    // Stop safely if the name does not match a key in fraudData
    if (!data) {
        console.error("No fraud data found for: " + fraudName);
        return;
    }

    title.textContent = fraudName;
    description.textContent = data.description;
    warning.textContent = data.warning;
    prevention.textContent = data.prevention;

    modal.classList.add("show");

}


function closeFraudDetails() {

    const modal = document.getElementById("fraudModal");

    if (modal) {
        modal.classList.remove("show");
    }

}


// ================= SAFETY CHECKLIST =================

function checkSafety() {

    const checkboxes = document.querySelectorAll(".safe-check");

    let completed = 0;

    checkboxes.forEach(function(box) {

        if (box.checked) {
            completed++;
        }

    });

    const result = document.getElementById("safetyResult");

    if (completed === checkboxes.length) {

        result.textContent =
            "Excellent! You completed the complete safety checklist. 🛡️";

        result.style.color = "#16a34a";

    } else {

        result.textContent =
            "You completed " +
            completed +
            " out of " +
            checkboxes.length +
            ". Complete all points to improve your safety.";

        result.style.color = "#ef4444";

    }
}


// ================= QUIZ =================

function submitQuiz() {

    const answers = ["q1", "q2", "q3", "q4", "q5"];

    let score = 0;

    answers.forEach(function(question) {

        const selected = document.querySelector(
            'input[name="' + question + '"]:checked'
        );

        if (selected && selected.value === "correct") {
            score++;
        }

    });

    const result = document.getElementById("quizResult");

    if (score === answers.length) {

        result.textContent =
            "🎉 Excellent! Your score is " +
            score +
            "/" +
            answers.length;

    } else {

        result.textContent =
            "Your score is " +
            score +
            "/" +
            answers.length +
            ". Keep learning about fraud safety!";

    }

}


// ================= REPORT FORM =================
// Reports are saved in the Supabase "reports" table.
// Anyone can submit one; a logged-in user's id is attached automatically.

async function submitReport(event) {

    event.preventDefault();

    const form = event.target;
    const result = document.getElementById("reportResult");

    const name = document.getElementById("reportName").value.trim();
    const email = document.getElementById("reportEmail").value.trim();
    const type = document.getElementById("reportType").value;
    const message = document.getElementById("reportMessage").value.trim();

    if (!name || !email || !type || !message) {
        setMessage(result, "Please fill in every field.", "error");
        return;
    }

    if (message.length < 5) {
        setMessage(result, "Please write a little more in your message.", "error");
        return;
    }

    if (message.length > 2000) {
        setMessage(result, "Your message is too long (maximum 2000 characters).", "error");
        return;
    }

    if (!supabaseClient) {
        setMessage(result, NOT_CONFIGURED_MESSAGE, "error");
        return;
    }

    setBusy(form, true);

    try {

        const { error } = await supabaseClient.from("reports").insert({
            user_id: currentUser ? currentUser.id : null,
            name: name,
            email: email,
            fraud_type: type,
            message: message
        });

        if (error) {
            setMessage(result, "Could not send your report. Please try again.", "error");
            console.error("Report error:", error.message);
        } else {
            setMessage(result, "Thank you! Your report/feedback has been recorded.", "success");
            form.reset();
            prefillReportForm();
        }

    } catch (error) {
        setMessage(result, NETWORK_MESSAGE, "error");
    }

    setBusy(form, false);

}


// If the user is logged in, fill in the name and email for them.
function prefillReportForm() {

    const nameInput = document.getElementById("reportName");
    const emailInput = document.getElementById("reportEmail");

    if (!currentUser || !nameInput || !emailInput) {
        return;
    }

    if (!nameInput.value) {
        nameInput.value = (currentProfile && currentProfile.name) || "";
    }

    if (!emailInput.value) {
        emailInput.value = currentUser.email || "";
    }

}


// ================= FAQ =================

function toggleFAQ(button) {

    const faqItem = button.parentElement;

    faqItem.classList.toggle("open");

    const symbol = button.querySelector("span");

    if (faqItem.classList.contains("open")) {
        symbol.textContent = "−";
    } else {
        symbol.textContent = "+";
    }

}


// ================= LOGIN / REGISTER MODALS =================

function openLogin() {

    closeRegister();

    setMessage(document.getElementById("loginMessage"), "");

    document.getElementById("loginModal").classList.add("show");

}


function closeLogin() {

    document.getElementById("loginModal").classList.remove("show");

}


function openRegister() {

    closeLogin();

    setMessage(document.getElementById("registerMessage"), "");

    document.getElementById("registerModal").classList.add("show");

}


function closeRegister() {

    document.getElementById("registerModal").classList.remove("show");

}


// ================= REGISTER (Supabase Auth) =================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const message = document.getElementById("registerMessage");

        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim().toLowerCase();
        const password = document.getElementById("registerPassword").value;

        // ----- validation -----
        if (!name || !email || !password) {
            setMessage(message, "Please fill in all fields.", "error");
            return;
        }

        if (name.length < 2 || name.length > 100) {
            setMessage(message, "Name must be between 2 and 100 characters.", "error");
            return;
        }

        if (password.length < 8) {
            setMessage(message, "Password must be at least 8 characters.", "error");
            return;
        }

        if (!supabaseClient) {
            setMessage(message, NOT_CONFIGURED_MESSAGE, "error");
            return;
        }

        setBusy(registerForm, true);
        setMessage(message, "Creating your account...");

        try {

            const { data, error } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    // Saved in the user's metadata; the database trigger copies it
                    // into the "profiles" table.
                    data: { name: name },
                    // Where the confirmation e-mail link brings the user back to.
                    emailRedirectTo: window.location.origin + window.location.pathname
                }
            });

            if (error) {

                const text = (error.message || "").toLowerCase();

                if (text.includes("already registered") || text.includes("already been registered")) {
                    setMessage(message, "This email is already registered. Please log in.", "error");
                } else if (text.includes("rate limit")) {
                    setMessage(message, "Too many attempts. Please wait a few minutes and try again.", "error");
                } else if (text.includes("password")) {
                    setMessage(message, error.message, "error");
                } else if (isNetworkError(error)) {
                    setMessage(message, NETWORK_MESSAGE, "error");
                } else {
                    setMessage(message, "Registration failed. Please try again.", "error");
                    console.error("Register error:", error.message);
                }

            } else if (data.user && data.user.identities && data.user.identities.length === 0) {

                // When "Confirm email" is ON, Supabase does not return an error for an
                // existing email (to protect privacy). It returns a user with no identities.
                setMessage(message, "This email is already registered. Please log in.", "error");

            } else if (data.session) {

                // "Confirm email" is OFF: the user is logged in immediately.
                setMessage(message, "Account created! Welcome to FraudSafe.", "success");
                registerForm.reset();

                setTimeout(closeRegister, 1200);

            } else {

                // "Confirm email" is ON: the user must click the link in their inbox.
                setMessage(
                    message,
                    "Account created! Check your email and click the confirmation link, then log in.",
                    "success"
                );
                registerForm.reset();

            }

        } catch (error) {

            setMessage(message, NETWORK_MESSAGE, "error");

        }

        setBusy(registerForm, false);

    });

}


// ================= LOGIN (Supabase Auth) =================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const message = document.getElementById("loginMessage");

        const email = document.getElementById("loginEmail").value.trim().toLowerCase();
        const password = document.getElementById("loginPassword").value;

        if (!email || !password) {
            setMessage(message, "Please enter your email and password.", "error");
            return;
        }

        if (!supabaseClient) {
            setMessage(message, NOT_CONFIGURED_MESSAGE, "error");
            return;
        }

        setBusy(loginForm, true);
        setMessage(message, "Logging in...");

        try {

            const { error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {

                const text = (error.message || "").toLowerCase();

                if (text.includes("invalid login credentials")) {
                    setMessage(message, "Invalid email or password.", "error");
                } else if (text.includes("email not confirmed")) {
                    setMessage(message, "Please confirm your email first. Check your inbox for the link.", "error");
                } else if (text.includes("rate limit")) {
                    setMessage(message, "Too many attempts. Please wait a few minutes and try again.", "error");
                } else if (isNetworkError(error)) {
                    setMessage(message, NETWORK_MESSAGE, "error");
                } else {
                    setMessage(message, "Login failed. Please try again.", "error");
                    console.error("Login error:", error.message);
                }

            } else {

                setMessage(message, "Login successful! Welcome to FraudSafe.", "success");
                loginForm.reset();

                setTimeout(closeLogin, 800);

            }

        } catch (error) {

            setMessage(message, NETWORK_MESSAGE, "error");

        }

        setBusy(loginForm, false);

    });

}


// ================= LOGOUT =================

async function logoutUser() {

    if (!supabaseClient) {
        return;
    }

    try {

        const { error } = await supabaseClient.auth.signOut();

        if (error) {
            showToast("Logout failed. Please try again.");
            console.error("Logout error:", error.message);
            return;
        }

        showPage("home");
        showToast("You have been logged out successfully.");

    } catch (error) {

        showToast(NETWORK_MESSAGE);

    }

}


// ================= SESSION & PROFILE =================
// Supabase keeps the session in the browser (localStorage) and renews it.
// onAuthStateChange runs on page load (restoring the session), after login,
// after logout, and after the user clicks the e-mail confirmation link.

async function loadProfile() {

    if (!supabaseClient || !currentUser) {
        currentProfile = null;
        return;
    }

    // Row Level Security guarantees this can only ever return the user's own row.
    const { data, error } = await supabaseClient
        .from("profiles")
        .select("id, name, email, created_at")
        .eq("id", currentUser.id)
        .maybeSingle();

    if (error) {
        console.error("Profile load error:", error.message);
        currentProfile = null;
    } else {
        currentProfile = data;
    }

}


async function handleSession(session) {

    currentUser = session && session.user ? session.user : null;

    if (currentUser) {
        await loadProfile();
    } else {
        currentProfile = null;
    }

    updateAuthUI();

    // Leaving a protected page after logout / session expiry
    const profilePage = document.getElementById("profile");

    if (!currentUser && profilePage && profilePage.classList.contains("active")) {
        showPage("home");
    }

    if (currentUser && profilePage && profilePage.classList.contains("active")) {
        renderProfile();
    }

}


function updateAuthUI() {

    const loginButton = document.getElementById("loginBtn");
    const accountButton = document.getElementById("accountBtn");
    const logoutButton = document.getElementById("logoutBtn");

    const loggedIn = Boolean(currentUser);

    loginButton.classList.toggle("hidden", loggedIn);
    accountButton.classList.toggle("hidden", !loggedIn);
    logoutButton.classList.toggle("hidden", !loggedIn);

    if (loggedIn) {

        const fullName =
            (currentProfile && currentProfile.name) ||
            (currentUser.user_metadata && currentUser.user_metadata.name) ||
            "Account";

        // textContent (not innerHTML) so a name can never inject HTML
        accountButton.textContent = "👤 " + fullName.split(" ")[0];

        prefillReportForm();

    }

}


// ================= PROFILE PAGE =================

function openProfile() {

    // This only decides what to SHOW. The real protection is Row Level
    // Security in the database (see supabase-schema.sql).
    if (!currentUser) {
        openLogin();
        return;
    }

    showPage("profile");
    renderProfile();

}


function renderProfile() {

    if (!currentUser) {
        return;
    }

    const name =
        (currentProfile && currentProfile.name) ||
        (currentUser.user_metadata && currentUser.user_metadata.name) ||
        "";

    const createdAt =
        (currentProfile && currentProfile.created_at) || currentUser.created_at;

    document.getElementById("profileNameText").textContent = name || "—";
    document.getElementById("profileEmailText").textContent = currentUser.email || "—";
    document.getElementById("profileJoinedText").textContent = createdAt
        ? new Date(createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric"
          })
        : "—";

    document.getElementById("profileNameInput").value = name;

}


const profileForm = document.getElementById("profileForm");

if (profileForm) {

    profileForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const message = document.getElementById("profileMessage");
        const newName = document.getElementById("profileNameInput").value.trim();

        if (!currentUser) {
            setMessage(message, "Please log in first.", "error");
            return;
        }

        if (newName.length < 2 || newName.length > 100) {
            setMessage(message, "Name must be between 2 and 100 characters.", "error");
            return;
        }

        setBusy(profileForm, true);

        try {

            // Only the logged-in user's own row can be changed (enforced by RLS).
            const { data, error } = await supabaseClient
                .from("profiles")
                .update({ name: newName })
                .eq("id", currentUser.id)
                .select("id, name, email, created_at")
                .maybeSingle();

            if (error || !data) {
                setMessage(message, "Could not update your profile. Please try again.", "error");
                if (error) {
                    console.error("Profile update error:", error.message);
                }
            } else {
                currentProfile = data;
                renderProfile();
                updateAuthUI();
                setMessage(message, "Profile updated.", "success");
            }

        } catch (error) {

            setMessage(message, NETWORK_MESSAGE, "error");

        }

        setBusy(profileForm, false);

    });

}


// ================= CLOSE MODALS BY CLICKING OUTSIDE =================

window.addEventListener("click", function(event) {

    const loginModal = document.getElementById("loginModal");
    const registerModal = document.getElementById("registerModal");
    const fraudModal = document.getElementById("fraudModal");

    if (event.target === loginModal) {
        closeLogin();
    }

    if (event.target === registerModal) {
        closeRegister();
    }

    if (event.target === fraudModal) {
        closeFraudDetails();
    }

});


// ================= CLOSE MODALS WITH ESCAPE KEY =================

window.addEventListener("keydown", function(event) {

    if (event.key === "Escape") {
        closeFraudDetails();
        closeLogin();
        closeRegister();
    }

});


// ================= INITIAL LOAD =================

document.addEventListener("DOMContentLoaded", function() {

    showPage("home");

    updateAuthUI();

    if (urlHashError) {
        showToast("Sign-in link problem: " + urlHashError.replace(/\+/g, " "));
    }

    if (!supabaseClient) {
        return;
    }

    // Restores the saved session on page reload and reacts to login/logout.
    // (setTimeout avoids calling Supabase inside its own callback.)
    supabaseClient.auth.onAuthStateChange(function(event, session) {

        setTimeout(async function() {

            await handleSession(session);

            if (event === "SIGNED_IN" && justConfirmedEmail && session) {
                justConfirmedEmail = false;
                showToast("Email confirmed! You are now logged in.");
            }

        }, 0);

    });

});
