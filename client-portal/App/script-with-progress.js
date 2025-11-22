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
// PROGRESS CONFIGURATION
// ========================================

const PROGRESS_CONFIG = {
	// Stage base values
	stages: {
		"Contract": 30,           // Client starts here
		"Invoice": 30,            // Same as Contract
		"Documentation": 30,      // Base, can go up to 60
		"Review": 70,             // All docs approved
		"Submission": 85,         // Application submitted
		"Final Decision": 100     // Process complete
	},
	
	// Documentation phase calculation
	documentation: {
		basePoints: 30,           // Starting points for Documentation stage
		maxPoints: 30,            // Maximum points this stage can add (30 → 60)
		submittedWeight: 0.6,     // x = 60% of points for submitted
		approvedWeight: 0.4       // y = 40% of points for approved (x > y)
	}
};

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

	// Load other data
	await loadDocuments();
	await loadHistory();
}

// ========================================
// CALCULATE DOCUMENTATION PROGRESS
// ========================================

async function calculateDocumentationProgress(clientId) {
	try {
		// Get all documents for this client
		const { data: documents, error } = await supabase
			.from("documents")
			.select("id, status")
			.eq("client_id", clientId);

		if (error) throw error;

		// If no documents, return base points
		if (!documents || documents.length === 0) {
			return {
				progress: PROGRESS_CONFIG.documentation.basePoints,
				allApproved: false,
				approved: 0,
				submitted: 0,
				total: 0
			};
		}

		const totalDocs = documents.length;
		const config = PROGRESS_CONFIG.documentation;
		
		// Calculate points per document
		const submittedPoints = (config.maxPoints * config.submittedWeight) / totalDocs;
		const approvedBonus = (config.maxPoints * config.approvedWeight) / totalDocs;
		
		// Calculate total earned points
		let earnedPoints = 0;
		let allApproved = true;
		
		documents.forEach(doc => {
			if (doc.status === "submitted") {
				earnedPoints += submittedPoints;
				allApproved = false;
			} else if (doc.status === "approved") {
				earnedPoints += (submittedPoints + approvedBonus);
			} else {
				// pending or rejected = 0 points
				allApproved = false;
			}
		});

		const totalProgress = config.basePoints + Math.round(earnedPoints);
		
		console.log(`Documentation Progress: ${totalProgress}% (${documents.filter(d => d.status === 'approved').length}/${totalDocs} approved, ${documents.filter(d => d.status === 'submitted').length}/${totalDocs} submitted)`);
		
		return {
			progress: totalProgress,
			allApproved: allApproved,
			approved: documents.filter(d => d.status === 'approved').length,
			submitted: documents.filter(d => d.status === 'submitted').length,
			total: totalDocs
		};
		
	} catch (error) {
		console.error("Error calculating documentation progress:", error);
		return {
			progress: PROGRESS_CONFIG.documentation.basePoints,
			allApproved: false,
			approved: 0,
			submitted: 0,
			total: 0
		};
	}
}

// ========================================
// CALCULATE OVERALL PROGRESS
// ========================================

async function calculateOverallProgress(clientId, currentStage) {
	try {
		let progress = 0;
		
		switch(currentStage) {
			case "Contract":
			case "Invoice":
				// Fixed 30% for these stages
				progress = PROGRESS_CONFIG.stages[currentStage];
				break;
				
			case "Documentation":
				// Dynamic calculation based on documents
				const docProgress = await calculateDocumentationProgress(clientId);
				progress = docProgress.progress;
				
				// If all documents approved, should move to Review
				if (docProgress.allApproved && docProgress.total > 0) {
					console.log("⚠️ All documents approved! Client should be moved to Review stage.");
				}
				break;
				
			case "Review":
				progress = PROGRESS_CONFIG.stages["Review"];
				break;
				
			case "Submission":
				progress = PROGRESS_CONFIG.stages["Submission"];
				break;
				
			case "Final Decision":
				progress = PROGRESS_CONFIG.stages["Final Decision"];
				break;
				
			default:
				progress = 30; // Default to Contract stage
		}
		
		return progress;
		
	} catch (error) {
		console.error("Error calculating overall progress:", error);
		return 30;
	}
}

// ========================================
// UPDATE PROGRESS IN DATABASE
// ========================================

async function updateProgressInDatabase(clientId, currentStage) {
	try {
		// Calculate current progress
		const progress = await calculateOverallProgress(clientId, currentStage);

		// Update the clients table
		const { error } = await supabase
			.from("clients")
			.update({ 
				progress: progress,
				updated_at: new Date().toISOString()
			})
			.eq("id", clientId);

		if (error) throw error;

		console.log(`✅ Progress updated: ${progress}% (Stage: ${currentStage})`);
		
		// Update local client object if it exists
		if (currentClient && currentClient.id === clientId) {
			currentClient.progress = progress;
		}
		
		return progress;
		
	} catch (error) {
		console.error("Error updating progress:", error);
		return null;
	}
}

// ========================================
// TRIGGER PROGRESS UPDATE
// ========================================

async function triggerProgressUpdate() {
	if (!currentClient) {
		console.error("No current client");
		return;
	}
	
	await updateProgressInDatabase(currentClient.id, currentClient.stage);
	
	// Refresh overview if it's currently visible
	const overviewContent = document.getElementById("overviewContent");
	if (overviewContent && !overviewContent.classList.contains("hidden")) {
		await populateOverview();
	}
}

// ========================================
// POPULATE OVERVIEW WITH DYNAMIC DATA
// ========================================

async function populateOverview() {
	try {
		if (!currentClient) {
			console.error("No client data available");
			return;
		}

		// ========================================
		// HEADER
		// ========================================
		const headerH1 = document.querySelector("#overviewContent .header h1");
		if (headerH1) {
			headerH1.textContent = `Hello, ${currentClient.name}`;
		}

		// ========================================
		// PROGRESS CIRCLE
		// ========================================
		const progressText = document.querySelector(
			"#overviewContent .progress-text"
		);

		if (progressText) {
			const progress = currentClient.progress || 0;
			progressText.textContent = `${progress}%`;

			const progressCircle = document.querySelector(
				"#overviewContent .progress-circle svg circle:nth-of-type(2)"
			);

			if (progressCircle) {
				const radius = 54;
				const circumference = 2 * Math.PI * radius;

				progressCircle.style.strokeDasharray = `${circumference}`;
				const targetOffset = circumference - (progress / 100) * circumference;

				// 1) RESET instantâneo (sem animação)
				progressCircle.style.transition = "none";
				progressCircle.style.strokeDashoffset = circumference;

				// 2) Forçar reflow (obrigatório para animar toda vez)
				progressCircle.getBoundingClientRect();

				// 3) Aplicar animação + valor final
				progressCircle.style.transition = "stroke-dashoffset 0.8s ease-out";
				progressCircle.style.strokeDashoffset = targetOffset;
			}
		}

		// ========================================
		// APPLICATION STAGE CARD
		// ========================================
		const stageHeading = document.querySelector(
			"#overviewContent .application-stage-document"
		);
		if (stageHeading) {
			stageHeading.textContent = currentClient.stage || "Unknown";
		}

		const stageDescription = document.querySelector(
			"#overviewContent .application-stage-description"
		);
		if (stageDescription) {
			const stageDescriptions = {
				Contract: "Your contract is being processed",
				Invoice: "Payment is being processed",
				Documentation:
					"Your documentation is being reviewed by our team and we will update you shortly",
				Review: "Your application is under review",
				Submission: "Your application is being submitted to authorities",
				"Final Decision": "Final decision is being made on your application",
			};

			stageDescription.textContent =
				stageDescriptions[currentClient.stage] ||
				"Your application is being processed";
		}

		// ========================================
		// DATES
		// ========================================
		const statNumbers = document.querySelectorAll(
			"#overviewContent .stats-row .stat-number"
		);
		if (statNumbers.length >= 2) {
			if (currentClient.start_date) {
				statNumbers[0].textContent = formatDateShort(currentClient.start_date);
			}

			if (currentClient.expected_completion) {
				statNumbers[1].textContent = formatDateShort(
					currentClient.expected_completion
				);
			}
		}

		// ========================================
		// MISSING DOCUMENTS COUNT
		// ========================================
		try {
			const { data: documents } = await supabase
				.from("documents")
				.select("id, status")
				.eq("client_id", currentClient.id);

			const missingCount = documents
				? documents.filter((doc) => doc.status !== "approved").length
				: 0;

			const missingDocsNumber = document.querySelector(
				"#overviewContent .missing-docs .stat-number"
			);
			if (missingDocsNumber) {
				missingDocsNumber.textContent = missingCount;
			}

			// Color code based on missing docs
			const missingDocsCard = document.querySelector(
				"#overviewContent .missing-docs"
			);
			if (missingDocsCard) {
				if (missingCount === 0) {
					missingDocsCard.style.background =
						"linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%)";
					missingDocsCard.style.borderColor = "#6ee7b7";
				} else if (missingCount <= 2) {
					missingDocsCard.style.background =
						"linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)";
					missingDocsCard.style.borderColor = "#fcd34d";
				} else {
					missingDocsCard.style.background =
						"linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)";
					missingDocsCard.style.borderColor = "#fca5a5";
				}
			}
		} catch (error) {
			console.error("Error loading documents for overview:", error);
		}

		// ========================================
		// STAGE OVERVIEW (Right Column)
		// ========================================
		const stagesOrder = [
			"Contract",
			"Invoice",
			"Documentation",
			"Review",
			"Submission",
			"Final Decision",
		];

		const currentStageIndex = stagesOrder.indexOf(
			currentClient.stage || "Documentation"
		);

		const stageItems = document.querySelectorAll(
			"#overviewContent .stage-item"
		);

		stageItems.forEach((item, index) => {
			// Remove all status classes
			item.classList.remove("completed", "active", "upcoming");

			// Add appropriate class
			if (index < currentStageIndex) {
				item.classList.add("completed");
				const icon = item.querySelector(".stage-icon");
				if (icon) icon.textContent = "✓";
			} else if (index === currentStageIndex) {
				item.classList.add("active");
				const icon = item.querySelector(".stage-icon");
				if (icon) icon.textContent = "✓";
			} else {
				item.classList.add("upcoming");
				const icon = item.querySelector(".stage-icon");
				if (icon) icon.textContent = index + 1;
			}

			// Update stage name
			const stageName = item.querySelector(".stage-name");
			if (stageName) {
				stageName.textContent = stagesOrder[index] || "";
			}

			// Update stage duration
			const duration = item.querySelector(".stage-duration");
			if (duration) {
				if (index < currentStageIndex) {
					duration.textContent = "Completed";
				} else if (index === currentStageIndex) {
					duration.textContent = "In Progress";
				} else {
					duration.textContent = "Coming up";
				}
			}
		});

		console.log("Overview populated successfully");
	} catch (error) {
		console.error("Error populating overview:", error);
	}
}

// ========================================
// DATE FORMATTING
// ========================================

function formatDateShort(dateString) {
	if (!dateString) return "N/A";
	const date = new Date(dateString);
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const year = String(date.getFullYear()).slice(-2);
	return `${month}/${day}/${year}`;
}

function formatDate(dateString) {
	if (!dateString) return "N/A";
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US");
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

// ========================================
// LOAD DOCUMENTS WITH SMART FEATURES
// ========================================

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

		// Just the title
		documentsContent.innerHTML = '<h1 class="section-title">Documents</h1>';

		if (data && data.length > 0) {
			// Check if user has already submitted any document
			const hasSubmittedAny = data.some(
				(d) => d.status === "analyzing" || d.status === "approved"
			);

			// Group by category
			const grouped = {};
			data.forEach((doc) => {
				if (!grouped[doc.category]) {
					grouped[doc.category] = [];
				}
				grouped[doc.category].push(doc);
			});

			// Find first document that needs action AFTER grouping (for auto-expand)
			let firstActionableId = null;
			if (!hasSubmittedAny) {
				// Loop through categories in order to find the first actionable
				for (const categoria of CATEGORY_ORDER) {
					const docs = grouped[categoria];
					if (!docs) continue;

					const firstActionable = docs.find(
						(d) => d.status === "pending" || d.status === "rejected"
					);
					if (firstActionable) {
						firstActionableId = `doc-${firstActionable.id}`;
						break; // Stop at first one found
					}
				}
			}

			let docsHTML = '<div class="documents-section">';

			CATEGORY_ORDER.forEach((categoria) => {
				const docs = grouped[categoria];
				if (!docs) return;

				docsHTML += `
					<div class="category-section">
						<h2 class="category-title">${categoria}</h2>
				`;

				docs.forEach((doc, index) => {
					const statusInfo = getDocStatusInfo(doc.status);
					const docId = `doc-${doc.id || index}`;

					// Check if document needs action (pending or rejected)
					const needsAction =
						doc.status === "pending" || doc.status === "rejected";

					// Check if has description
					const hasDescription =
						doc.description && doc.description.trim() !== "";

					// Check if document is new (less than 4 days old)
					const isNewDocument = isDocumentNew(doc.created_at);

					// Show badge only if NOT new OR status is not pending
					const showBadge = !isNewDocument || doc.status !== "pending";

					// Show chevron and allow expand ONLY if needs action AND has description
					const showChevron = needsAction && hasDescription;
					const canExpand = showChevron;

					// Auto-expand first actionable document
					const shouldAutoExpand = docId === firstActionableId;

					// Button text based on status
					const buttonText =
						doc.status === "rejected" ? "Re-upload" : "Upload Document";

					// If document is new and pending, button starts expanded
					const buttonClass =
						isNewDocument && doc.status === "pending"
							? "btn-upload-expand expanded"
							: "btn-upload-expand";

					docsHTML += `
						<div class="document-item">
							<div class="document-header ${canExpand ? "" : "no-expand"}" ${
						canExpand ? `onclick="toggleDocDetails('${docId}')"` : ""
					}>
								<div class="document-name-wrapper">
									<svg class="document-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
									</svg>
									<span class="document-name">${doc.name}</span>
								</div>
								<div class="document-meta" ${
									needsAction ? 'onclick="event.stopPropagation()"' : ""
								}>
									${
										showBadge
											? `
										<div class="document-status status-${doc.status}">
											${statusInfo.icon}
											<span>${statusInfo.text}</span>
										</div>
									`
											: ""
									}
									${
										needsAction
											? `
										<input type="file" id="file-${doc.id}" class="file-input-hidden" onchange="handleFileUpload(event, '${doc.id}')">
										<button class="${buttonClass}" onclick="document.getElementById('file-${doc.id}').click()">
											<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
													  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
											</svg>
											<span class="button-text">${buttonText}</span>
										</button>
									`
											: ""
									}
									${
										showChevron
											? `
										<svg class="document-chevron ${
											shouldAutoExpand ? "rotated" : ""
										}" id="chevron-${docId}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
										</svg>
									`
											: ""
									}
								</div>
							</div>
							${
								canExpand
									? `
								<div class="document-description ${
									shouldAutoExpand ? "visible" : ""
								}" id="${docId}">
									<p>${doc.description}</p>
									${
										doc.status === "rejected" && doc.admin_feedback
											? `
										<p style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
											<strong>Rejection reason:</strong> ${doc.admin_feedback}
										</p>
									`
											: ""
									}
								</div>
							`
									: ""
							}
						</div>
					`;
				});

				docsHTML += `</div>`;
			});

			docsHTML += "</div>";

			const section = document.createElement("div");
			section.innerHTML = docsHTML;
			documentsContent.appendChild(section);
		} else {
			console.log("No documents found");
			documentsContent.innerHTML +=
				'<div class="info-card" style="text-align: center;"><p style="color: #6b7280;">No documents found.</p></div>';
		}
	} catch (error) {
		console.error("Error loading documents:", error);
	}
}

// ========================================
// CHECK IF DOCUMENT IS NEW (< 4 DAYS)
// ========================================
function isDocumentNew(createdAt) {
	if (!createdAt) return false;

	const created = new Date(createdAt);
	const now = new Date();
	const diffInDays = (now - created) / (1000 * 60 * 60 * 24);

	return diffInDays < 4;
}

// ========================================
// FILE UPLOAD HANDLER
// ========================================

async function handleFileUpload(event, docId) {
	const file = event.target.files[0];
	if (!file) return;

	const uploadButton = document.querySelector(
		`button[onclick*="file-${docId}"]`
	);
	if (!uploadButton) {
		console.error("Upload button not found");
		return;
	}
	const originalButtonHTML = uploadButton.innerHTML;

	uploadButton.disabled = true;
	uploadButton.innerHTML = `
		<svg class="icon animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
				  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
		</svg>
		<span class="button-text">Uploading</span>
	`;

	console.log("Uploading file for document:", docId, file);

	try {
		// Create unique file path
		const timestamp = Date.now();
		const filePath = `${currentClient.id}/${docId}/${timestamp}_${file.name}`;

		// Upload to Supabase Storage
		const { data: storageData, error: storageError } = await supabase.storage
			.from("client-docs")
			.upload(filePath, file);

		if (storageError) throw storageError;

		// Get the document details
		const { data: documentData, error: docError } = await supabase
			.from("documents")
			.select("*")
			.eq("id", docId)
			.single();

		if (docError) throw docError;

		// Update database - change status to submitted
		const { error: dbError } = await supabase
			.from("documents")
			.update({
				status: "submitted",
				file_path: filePath,
				updated_at: new Date().toISOString(),
			})
			.eq("id", docId);

		if (dbError) throw dbError;

		// ✅ UPDATE PROGRESS AFTER DOCUMENT UPLOAD
		await updateProgressInDatabase(currentClient.id, currentClient.stage);

		// ========================================
		// ENVIAR WEBHOOK PARA GOOGLE DRIVE
		// ========================================
		try {
			const webhookData = {
				event: "document_uploaded",
				timestamp: new Date().toISOString(),
				client: {
					id: currentClient.id,
					name: currentClient.name,
					email: currentClient.email || currentUser.email,
					process: currentClient.process,
					drive_folder_id: currentClient.drive_folder_id || null,
				},
				document: {
					id: documentData.id,
					name: documentData.name,
					category: documentData.category,
					status: "submitted",
					file_path: filePath,
					file_name: file.name,
					file_size: file.size,
					file_type: file.type,
				},
				// URL pública do arquivo
				file_url: `${SUPABASE_URL}/storage/v1/object/public/client-docs/${filePath}`,
			};

			console.log("Sending webhook:", webhookData);

			const webhookResponse = await fetch(
				"https://webhook.upimmigrationconsulting.com/webhook/upload-document",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(webhookData),
				}
			);

			if (!webhookResponse.ok) {
				console.error(
					"Webhook failed:",
					webhookResponse.status,
					webhookResponse.statusText
				);
			} else {
				console.log("✅ Webhook sent successfully");
			}
		} catch (webhookError) {
			console.error("Error sending webhook:", webhookError);
			// Não bloqueia o upload se o webhook falhar
		}

		// Reload documents to show updated status
		await loadDocuments();

		console.log("✅ Document uploaded successfully!");
	} catch (error) {
		console.error("Upload error:", error);
		alert("Error uploading document: " + error.message);

		// Restore button
		uploadButton.disabled = false;
		uploadButton.innerHTML = originalButtonHTML;
	}
}

// ========================================
// TOGGLE DOCUMENT DETAILS
// ========================================
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

// ========================================
// GET DOCUMENT STATUS INFO
// ========================================
function getDocStatusInfo(status) {
	const icons = {
		approved:
			'<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
		submitted:
			'<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
		pending:
			'<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
		rejected:
			'<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 8l8 8M16 8l-8 8"/></svg>',
	};

	const texts = {
		approved: "Approved",
		submitted: "Submitted",
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
					.then((html) => {
						content.innerHTML = html;
						// POPULATE OVERVIEW AFTER HTML IS LOADED
						if (tab === "overview") {
							setTimeout(() => populateOverview(), 0);
						}
					})
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
