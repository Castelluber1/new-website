// ========================================
// SUPABASE CONFIGURATION
// ========================================

const SUPABASE_URL = "https://lqyvatogkwndlpsetwie.supabase.co";
const SUPABASE_ANON_KEY =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxeXZhdG9na3duZGxwc2V0d2llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MTkwODAsImV4cCI6MjA3NzQ5NTA4MH0.-OOYSpIt9YcLiMt2RTlfY7KUQWHMnELf1OczPpb-2II";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentClient = null;
let currentUser = null;

// ========================================
// DOM ELEMENTS
// ========================================

const loginScreen = document.getElementById("loginScreen");
const dashboardScreen = document.getElementById("dashboardScreen");
const overlay = document.getElementById("overlay");
const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuBtn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const errorMessage = document.getElementById("errorMessage");
const errorText = document.getElementById("errorText");

// ========================================
// MOBILE MENU
// ========================================

function openDrawer() {
	sidebar.classList.remove("mobile-closed");
	overlay.classList.remove("hidden");
}

function closeDrawer() {
	sidebar.classList.add("mobile-closed");
	overlay.classList.add("hidden");
}

menuBtn.addEventListener("click", () => {
	if (sidebar.classList.contains("mobile-closed")) {
		openDrawer();
	} else {
		closeDrawer();
	}
});

overlay.addEventListener("click", closeDrawer);

// ========================================
// AUTHENTICATION
// ========================================

async function handleLogin() {
	const email = emailInput.value;
	const password = passwordInput.value;

	if (!email || !password) {
		errorText.textContent = "Please fill in all fields";
		errorMessage.classList.remove("hidden");
		return;
	}

	loginBtn.disabled = true;
	loginBtn.textContent = "Signing in...";

	try {
		const { data: authData, error: authError } =
			await supabase.auth.signInWithPassword({
				email: email,
				password: password,
			});

		if (authError) throw authError;

		currentUser = authData.user;

		const { data: clientData, error: clientError } = await supabase
			.from("clients")
			.select("*")
			.eq("user_id", currentUser.id)
			.single();

		if (clientError) throw new Error("Client data not found");

		currentClient = clientData;
		errorMessage.classList.add("hidden");
		await showDashboard();
	} catch (error) {
		console.error("Login error:", error);
		errorText.textContent = error.message || "Login error";
		errorMessage.classList.remove("hidden");
	} finally {
		loginBtn.disabled = false;
		loginBtn.textContent = "Sign In";
	}
}

async function handleLogout() {
	await supabase.auth.signOut();
	currentClient = null;
	currentUser = null;
	emailInput.value = "";
	passwordInput.value = "";
	loginScreen.classList.remove("hidden");
	dashboardScreen.classList.add("hidden");
}

passwordInput.addEventListener("keypress", (e) => {
	if (e.key === "Enter") handleLogin();
});

// ========================================
// DASHBOARD
// ========================================

async function showDashboard() {
	loginScreen.classList.add("hidden");
	dashboardScreen.classList.remove("hidden");

	// Sidebar
	document.getElementById("sidebarName").textContent = currentClient.name;
	document.getElementById("sidebarProcess").textContent = currentClient.process;

	// Load overview first
	await switchTab("overview");

	// Load data
	await loadDocuments();
	await loadHistory();
}

// ========================================
// DOCUMENTS TAB
// ========================================

const CATEGORY_ORDER = [
	"Personal Documents",
	"Academic Documents",
	"Professional Documents",
	"Financial Documents",
	"Sponsor Documents",
	"Partner's Support Documents",
	"Proof of Ties to Home Country",
	"Additional Documents for Previous Refusal",
	"Additional Documents for Loss of Status",
	"Official Forms",
];

async function loadDocuments() {
	try {
		const { data, error } = await supabase
			.from("documents")
			.select("*")
			.eq("client_id", currentClient.id)
			.order("category, priority, name", { ascending: true });

		if (error) throw error;

		console.log("Documents loaded:", data);

		const documentsContent = document.getElementById("documentsContent");
		if (!documentsContent) return;

		documentsContent.innerHTML = '<h1 class="section-title">Documents</h1>';

		if (data && data.length > 0) {
			const grouped = {};
			data.forEach((doc) => {
				if (!grouped[doc.category]) {
					grouped[doc.category] = [];
				}
				grouped[doc.category].push(doc);
			});

			let html = "";
			CATEGORY_ORDER.forEach((categoria) => {
				const docs = grouped[categoria];
				if (!docs) return;

				html += `
					<div class="category-section">
						<h2 class="category-title">${categoria}</h2>
				`;

				docs.forEach((doc, index) => {
					const statusInfo = getDocStatusInfo(doc.status);
					const hasDescription =
						doc.description && doc.description.trim() !== "";
					const docId = `doc-${doc.id || index}`;

					html += `
						<div class="document-item">
							<div class="document-header" ${
								hasDescription ? `onclick="toggleDocDetails('${docId}')"` : ""
							}>
								<div class="document-name-wrapper">
									<svg class="document-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
									</svg>
									<span class="document-name">${doc.name}</span>
								</div>
								<div class="document-meta">
									<div class="document-status status-${doc.status}">
										${statusInfo.icon}
										<span>${statusInfo.text}</span>
									</div>
									${
										hasDescription
											? `<svg class="document-chevron" id="chevron-${docId}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
									</svg>`
											: ""
									}
								</div>
							</div>
							${
								hasDescription
									? `<div class="document-description" id="${docId}">${doc.description}</div>`
									: ""
							}
						</div>
					`;
				});

				html += `</div>`;
			});

			const section = document.createElement("div");
			section.className = "documents-section";
			section.innerHTML = html;
			documentsContent.appendChild(section);
		} else {
			console.log("No documents found");
			documentsContent.innerHTML =
				'<div class="info-card" style="text-align: center;"><p style="color: #6b7280;">No documents found.</p></div>';
		}
	} catch (error) {
		console.error("Error loading documents:", error);
	}
}

function toggleDocDetails(docId) {
	const details = document.getElementById(docId);
	const chevron = document.getElementById(`chevron-${docId}`);

	if (details) {
		details.classList.toggle("visible");
		if (chevron) {
			chevron.classList.toggle("rotated");
		}
	}
}

function getDocStatusInfo(status) {
	const icons = {
		approved:
			'<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
		analyzing:
			'<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
		pending:
			'<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
		rejected:
			'<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 8l8 8M16 8l-8 8"/></svg>',
	};

	const texts = {
		approved: "Approved",
		analyzing: "Analyzing",
		pending: "Pending",
		rejected: "Rejected",
	};

	return {
		icon: icons[status] || icons.pending,
		text: texts[status] || "Unknown",
	};
}

// ========================================
// LOAD HISTORY
// ========================================

async function loadHistory() {
	try {
		const { data, error } = await supabase
			.from("history")
			.select("*")
			.eq("client_id", currentClient.id)
			.order("date", { ascending: false });

		if (error) throw error;

		const historyTimeline = document.getElementById("historyTimeline");
		if (!historyTimeline) return;

		historyTimeline.innerHTML = "";

		if (data && data.length > 0) {
			data.forEach((item, index) => {
				const isLast = index === data.length - 1;

				const div = document.createElement("div");
				div.className = "history-item";
				div.innerHTML = `
					<div class="history-dot">
						<div class="history-dot-circle"></div>
						${!isLast ? '<div class="history-dot-line"></div>' : ""}
					</div>
					<div class="history-content">
						<p class="history-date">${formatDate(item.date)}</p>
						<p class="history-event">${item.event}</p>
					</div>
				`;

				historyTimeline.appendChild(div);
			});
		} else {
			historyTimeline.innerHTML =
				'<p style="text-align: center; color: #6b7280; padding: 2rem;">No history available.</p>';
		}
	} catch (error) {
		console.error("Error loading history:", error);
	}
}

// ========================================
// TAB SWITCHING
// ========================================

function switchTab(tab) {
	const tabs = {
		overview: {
			content: "overviewContent",
			nav: "navOverview",
			file: "overview.html",
		},
		documents: { content: "documentsContent", nav: "navDocuments" },
		history: { content: "historyContent", nav: "navHistory" },
		faq: { content: "faqContent", nav: "navFaq", file: "faq.html" },
		settings: {
			content: "settingsContent",
			nav: "navSettings",
			file: "settings.html",
		},
		resources: {
			content: "resourcesContent",
			nav: "navResources",
			file: "resources.html",
		},
	};

	Object.entries(tabs).forEach(([key, ids]) => {
		const content = document.getElementById(ids.content);
		const navBtn = document.getElementById(ids.nav);

		if (key === tab) {
			if (content) {
				content.classList.remove("hidden");
			}
			if (navBtn) {
				navBtn.classList.add("nav-button-active");
			}

			// Load external file if specified
			if (ids.file && content) {
				fetch(ids.file)
					.then((r) => r.text())
					.then((html) => (content.innerHTML = html))
					.catch((err) => console.error("Error loading file:", err));
			}
		} else {
			if (content) {
				content.classList.add("hidden");
			}
			if (navBtn) {
				navBtn.classList.remove("nav-button-active");
			}
		}
	});

	if (window.innerWidth < 768) {
		closeDrawer();
	}
}

// ========================================
// HELPERS
// ========================================

function formatDate(dateString) {
	if (!dateString) return "N/A";
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US");
}

// ========================================
// SESSION CHECK
// ========================================

supabase.auth.getSession().then(({ data: { session } }) => {
	if (session) {
		currentUser = session.user;
		supabase
			.from("clients")
			.select("*")
			.eq("user_id", currentUser.id)
			.single()
			.then(({ data }) => {
				if (data) {
					currentClient = data;
					showDashboard();
				}
			})
			.catch((err) => console.error("Error fetching client:", err));
	}
});

// FAQ STarts here

// ========================================
// FAQ FUNCTIONS
// ========================================

function toggleFAQ(button) {
	const item = button.closest(".faq-item");
	const answer = item?.querySelector(".faq-answer");
	if (answer) {
		button.classList.toggle("open");
		answer.classList.toggle("open");
	}
}

function filterByCategory(category) {
	const items = document.querySelectorAll(".faq-item");
	const buttons = document.querySelectorAll(".faq-category-btn");

	buttons.forEach((btn) => btn.classList.remove("active"));
	if (event?.target) {
		event.target.classList.add("active");
	}

	items.forEach((item) => {
		if (category === "all") {
			item.classList.remove("hidden");
		} else if (item.dataset.category === category) {
			item.classList.remove("hidden");
		} else {
			item.classList.add("hidden");
		}
	});
}

function filterFAQ() {
	const searchInput = document.getElementById("faqSearch");
	if (!searchInput) return;

	const searchTerm = searchInput.value.toLowerCase();
	const items = document.querySelectorAll(".faq-item");

	items.forEach((item) => {
		const question =
			item.querySelector(".faq-question span")?.textContent.toLowerCase() || "";
		const answer =
			item.querySelector(".faq-answer")?.textContent.toLowerCase() || "";

		if (question.includes(searchTerm) || answer.includes(searchTerm)) {
			item.classList.remove("hidden");
		} else {
			item.classList.add("hidden");
		}
	});
}

// Initialize FAQ when tab loads
const originalSwitchTab = switchTab;
switchTab = function (tab) {
	originalSwitchTab(tab);

	if (tab === "faq") {
		setTimeout(() => {
			const items = document.querySelectorAll(".faq-item");
			items.forEach((item) => item.classList.remove("hidden"));
		}, 50);
	}
};
