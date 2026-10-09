// ================= PAGE SWITCHING =================

function showPage(pageId) {

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

    const data = fraudData[fraudName];

    if (!data) {
        return;
    }

    title.textContent = fraudName;
    description.textContent = data.description;
    warning.textContent = data.warning;
    prevention.textContent = data.prevention;

    modal.classList.add("show");
}


function closeFraudDetails() {

    document.getElementById("fraudModal").classList.remove("show");

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

function submitReport(event) {

    event.preventDefault();

    const name = document.getElementById("reportName").value;
    const email = document.getElementById("reportEmail").value;
    const type = document.getElementById("reportType").value;
    const message = document.getElementById("reportMessage").value;

    const report = {
        name: name,
        email: email,
        type: type,
        message: message,
        date: new Date().toLocaleString()
    };

    let reports =
        JSON.parse(localStorage.getItem("fraudReports")) || [];

    reports.push(report);

    localStorage.setItem(
        "fraudReports",
        JSON.stringify(reports)
    );

    document.getElementById("reportResult").textContent =
        "Thank you! Your report/feedback has been recorded.";

    document.getElementById("reportResult").style.color =
        "#16a34a";

    document.querySelector(".report-form form").reset();

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


// ================= LOGIN MODAL =================

function openLogin() {

    closeRegister();

    document.getElementById("loginModal").classList.add("show");

}


function closeLogin() {

    document.getElementById("loginModal").classList.remove("show");

}


// ================= REGISTER MODAL =================

function openRegister() {

    closeLogin();

    document.getElementById("registerModal").classList.add("show");

}


function closeRegister() {

    document.getElementById("registerModal").classList.remove("show");

}


// ================= REGISTER =================
// This connects to the Node.js backend.

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const name =
            document.getElementById("registerName").value;

        const email =
            document.getElementById("registerEmail").value;

        const password =
            document.getElementById("registerPassword").value;

        const message =
            document.getElementById("registerMessage");

        try {

            const response = await fetch("/api/register", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })

            });

            const data = await response.json();

            if (response.ok) {

                message.textContent =
                    "Registration successful! You can now login.";

                message.style.color = "#16a34a";

                registerForm.reset();

                setTimeout(function() {

                    closeRegister();
                    openLogin();

                }, 1200);

            } else {

                message.textContent =
                    data.message || "Registration failed.";

                message.style.color = "#ef4444";

            }

        } catch (error) {

            message.textContent =
                "Server connection failed. Start your Node.js server.";

            message.style.color = "#ef4444";

        }

    });

}


// ================= LOGIN =================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const email =
            document.getElementById("loginEmail").value;

        const password =
            document.getElementById("loginPassword").value;

        const message =
            document.getElementById("loginMessage");

        try {

            const response = await fetch("/api/login", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })

            });

            const data = await response.json();

            if (response.ok) {

                message.textContent =
                    "Login successful! Welcome to FraudSafe.";

                message.style.color = "#16a34a";

                loginForm.reset();

                setTimeout(function() {

                    closeLogin();

                    updateLoginButton();

                }, 1000);

            } else {

                message.textContent =
                    data.message || "Invalid email or password.";

                message.style.color = "#ef4444";

            }

        } catch (error) {

            message.textContent =
                "Server connection failed. Start your Node.js server.";

            message.style.color = "#ef4444";

        }

    });

}


// ================= CHECK LOGIN STATUS =================

async function checkLoginStatus() {

    try {

        const response = await fetch("/api/me");

        if (response.ok) {

            const data = await response.json();

            if (data.user) {
                updateLoginButton(data.user.name);
            }

        }

    } catch (error) {

        console.log("Login status unavailable.");

    }

}


function updateLoginButton(name = "Account") {

    const loginButton =
        document.querySelector(".login-btn");

    if (!loginButton) {
        return;
    }

    loginButton.textContent = name;

}


// ================= CLOSE MODALS BY CLICKING OUTSIDE =================

window.addEventListener("click", function(event) {

    const loginModal =
        document.getElementById("loginModal");

    const registerModal =
        document.getElementById("registerModal");

    const fraudModal =
        document.getElementById("fraudModal");

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


// ================= INITIAL LOAD =================

document.addEventListener("DOMContentLoaded", function() {

    showPage("home");

    checkLoginStatus();

});