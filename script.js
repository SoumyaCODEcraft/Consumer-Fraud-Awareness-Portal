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
async function logoutUser() {
    try {
        const response = await fetch("/api/logout", {
            method: "POST",
            credentials: "same-origin"
        });

        if (response.ok) {
            alert("You have been logged out successfully!");
            location.reload();
        } else {
            alert("Logout failed. Please try again.");
        }
    } catch (error) {
        alert("Server connection failed. Please try again.");
    }
}
const fraudDetails = {
  shopping: {
    title: "Online Shopping Fraud",
    intro: "Online shopping fraud happens when dishonest sellers trick customers through fake websites, advertisements, or products.",
    examples: [
      "A fake website accepts payment but never delivers the product.",
      "A customer receives a counterfeit or completely different item.",
      "A seller asks for extra payment through an unofficial link."
    ],
    warning: [
      "Prices are unrealistically low.",
      "The website has no genuine contact details or return policy.",
      "The seller pressures you to pay immediately."
    ],
    prevention: [
      "Buy from trusted websites and official apps.",
      "Check seller reviews, return policies, and payment details.",
      "Keep the order confirmation and payment receipt."
    ]
  },

  phishing: {
    title: "Phishing Scams",
    intro: "Phishing is a scam in which criminals use fake emails, messages, or websites to steal personal or banking information.",
    examples: [
      "A message claims your bank account will be blocked.",
      "A fake delivery message asks you to open a link.",
      "A copied website asks for your password."
    ],
    warning: [
      "Unexpected messages asking for urgent action.",
      "Suspicious website addresses or spelling mistakes.",
      "Requests for passwords, PINs, or OTPs."
    ],
    prevention: [
      "Do not open suspicious links or attachments.",
      "Visit official websites by typing their address yourself.",
      "Never share passwords, PINs, or OTPs."
    ]
  },

  upi: {
    title: "UPI and Payment Fraud",
    intro: "UPI fraud occurs when scammers trick people into approving payments or sharing sensitive payment information.",
    examples: [
      "A fake buyer sends a collect request and asks you to approve it.",
      "A scammer asks you to scan a QR code to receive money.",
      "A fake payment screenshot is used to claim that money was sent."
    ],
    warning: [
      "An unexpected payment request appears in your UPI app.",
      "Someone asks for your UPI PIN to receive money.",
      "The payment status does not match the screenshot."
    ],
    prevention: [
      "Read the payment screen carefully before approving.",
      "You do not need to enter your UPI PIN to receive money.",
      "Verify transactions in your official payment app."
    ]
  },

  customerCare: {
    title: "Fake Customer Care Fraud",
    intro: "Scammers pretend to be customer support staff to steal money or access personal information.",
    examples: [
      "A fake support agent asks you to install a remote-access app.",
      "Someone requests your OTP to solve a banking issue.",
      "A fake helpline asks for a service fee."
    ],
    warning: [
      "The agent asks for your PIN or OTP.",
      "You are told to install an unknown app.",
      "The number comes from an unverified source."
    ],
    prevention: [
      "Find support numbers on the official website or app.",
      "Never share your banking PIN or OTP.",
      "Do not give strangers remote access to your phone."
    ]
  },

  otp: {
    title: "OTP and Password Safety",
    intro: "An OTP or password can protect your account. Scammers may try to trick you into sharing it.",
    examples: [
      "A caller pretends to be from a bank and asks for an OTP.",
      "A fake prize message requests account details.",
      "A scammer asks you to reveal a login verification code."
    ],
    warning: [
      "Someone asks you to read out an OTP.",
      "You receive an unexpected login verification code.",
      "You see unknown login alerts."
    ],
    prevention: [
      "Never share OTPs, passwords, or PINs with anyone.",
      "Use strong, unique passwords.",
      "Enable two-factor authentication where available."
    ]
  },

  jobs: {
    title: "Job and Internship Scams",
    intro: "Job scams use fake vacancies or internship offers to collect money or personal information.",
    examples: [
      "A recruiter demands a large registration fee for a guaranteed job.",
      "A fake employer offers unusually high pay for very little work.",
      "A recruiter asks for sensitive banking details."
    ],
    warning: [
      "There is no proper interview or company verification.",
      "You must pay before receiving a job offer.",
      "The email address or company details look suspicious."
    ],
    prevention: [
      "Verify the company and recruiter independently.",
      "Be cautious about upfront fees and guaranteed jobs.",
      "Do not send identity or banking documents to unverified people."
    ]
  },

  socialMedia: {
    title: "Social Media Fraud",
    intro: "Social media fraud involves fake profiles, impersonation, fraudulent offers, or links designed to steal information.",
    examples: [
      "A fake profile pretends to be your friend and asks for money.",
      "A giveaway account asks for payment to release a prize.",
      "A suspicious message directs you to a fake login page."
    ],
    warning: [
      "A newly created profile asks for money urgently.",
      "An offer seems too good to be true.",
      "A familiar account sends unusual messages."
    ],
    prevention: [
      "Verify unusual requests using another communication method.",
      "Use privacy settings and strong passwords.",
      "Report and block suspicious profiles."
    ]
  },

  lottery: {
    title: "Lottery and Prize Scams",
    intro: "Prize scams falsely claim that you have won money or a gift to make you pay fees or reveal personal details.",
    examples: [
      "A message claims you won a lottery you never entered.",
      "A caller asks for tax or processing fees in advance.",
      "A fake prize link requests banking information."
    ],
    warning: [
      "You are asked to pay money to claim an unexpected prize.",
      "The message creates pressure to act immediately.",
      "The sender cannot provide verifiable official details."
    ],
    prevention: [
      "Do not pay advance fees for unexpected prizes.",
      "Verify offers with the official organisation.",
      "Never share OTPs or banking credentials."
    ]
  },

  advertisements: {
    title: "Misleading Advertisements",
    intro: "Misleading advertisements use false or exaggerated claims to influence customers into buying products or services.",
    examples: [
      "An advertisement promises guaranteed results without reliable evidence.",
      "A seller hides extra charges until checkout.",
      "A product is advertised with false discounts."
    ],
    warning: [
      "Claims sound unrealistic or guaranteed.",
      "Important terms and conditions are hidden.",
      "The seller provides no clear refund policy."
    ],
    prevention: [
      "Compare prices and product information.",
      "Read terms, conditions, and refund policies.",
      "Save advertisements, receipts, and order details."
    ]
  },

  reporting: {
    title: "How to Report Fraud",
    intro: "Reporting fraud quickly can help you protect your money and create a record of the incident.",
    examples: [
      "Report suspicious banking transactions to your bank.",
      "Report online financial cybercrime through the official Indian cybercrime portal.",
      "Keep complaint numbers and transaction details for follow-up."
    ],
    warning: [
      "Money has been transferred without your permission.",
      "Someone has accessed your account.",
      "You have shared sensitive details with a suspected scammer."
    ],
    prevention: [
      "Contact your bank or payment provider immediately.",
      "In India, call 1930 for financial cyber fraud and report at cybercrime.gov.in.",
      "Save screenshots, transaction IDs, phone numbers, and messages."
    ]
  }
};

function showFraudDetails(topic) {
  const item = fraudDetails[topic];

  if (!item) {
    alert("Details for this topic are not available.");
    return;
  }

  const section = document.getElementById("fraudDetails");

  if (!section) {
    alert("Please add the fraudDetails section to index.html.");
    return;
  }

  section.innerHTML = `
    <h2>${item.title}</h2>
    <p>${item.intro}</p>

    <h3>Common Examples</h3>
    <ul>${item.examples.map(x => `<li>${x}</li>`).join("")}</ul>

    <h3>Warning Signs</h3>
    <ul>${item.warning.map(x => `<li>${x}</li>`).join("")}</ul>

    <h3>How to Stay Safe</h3>
    <ul>${item.prevention.map(x => `<li>${x}</li>`).join("")}</ul>
  `;

  section.hidden = false;
  section.scrollIntoView({ behavior: "smooth" });
}
