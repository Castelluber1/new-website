/***********************
 * VISA CHECKLIST → DOCS (n8n Code Node)
 * Source of truth: visa_checklist_app_claude (DB + logic)
 ***********************/

/* ========= 1) DB (EXATO) ========= */
const documents = {
	"Personal Documents": [
		{
			id: "passport",
			label: "Copy of passport pages",
			description:
				"Copy of the main pages of your passport (biographical data and visa stamps)",
			priority: 1,
		},
		{
			id: "photo",
			label: "Digital photo",
			description:
				"Digital photo according to Canadian government specifications. Must be color, white background, approximately 3x4 cm. <a href='https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-passports/photos.html' target='_blank'>More information</a>",
			priority: 2,
		},
		{
			id: "permit",
			label: "Copy of current Permit",
			description:
				"Copy of current valid permit (eTA, Visitor Record, Study Permit or Work Permit)",
			priority: 3,
		},
		{
			id: "marriage-certificate",
			label: "Marriage certificate",
			description:
				"Original or translated marriage certificate. Required for spouses applying together",
			priority: 4,
		},
		{
			id: "birth-certificate",
			label: "Birth certificate of the child",
			description: "Original or translated birth certificate of the child.",
			priority: 5,
		},
	],

	"Academic Documents": [
		{
			id: "loa",
			label: "Letter of Acceptance (LOA) from the institution",
			description:
				"Official acceptance letter from the educational institution. Must contain start date, program, and duration",
			priority: 1,
		},
		{
			id: "enrollment-proof",
			label: "Proof of enrollment or current studies",
			description:
				"Official proof of enrollment or confirmation of ongoing studies. Can be a substitute for LOA in certain cases",
			priority: 2,
		},
		{
			id: "coop-letter",
			label: "Co-op Letter",
			description:
				"Letter from your educational institution confirming that your program includes a co-op or internship component.",
			priority: 3,
		},
		{
			id: "school-receipt",
			label: "Tuition payment receipt issued by the school",
			description:
				"Proof of tuition payment issued by the school. For multi-year programs, IRCC requires proof that the first year’s tuition has been paid.",
			priority: 4,
		},
		{
			id: "pal",
			label: "Provincial Attestation Letter (PAL)",
			description:
				"Mandatory for Study Permit applications, except when extending your studies at the same institution and at the same level of education.",
			priority: 5,
		},
	],

	"Financial Documents": [
		{
			id: "bank-statements",
			label: "Bank statements for the last 4 months",
			description:
				"Bank statements from the past 4 months showing your financial activity and available funds.",
			priority: 1,
		},
	],

	"Sponsor Documents": [
		{
			id: "sponsor-bank-statements",
			label: "Bank statements for the last 4 months",
			description:
				"Sponsor's bank statements from the last 4 months proving financial capacity",
			priority: 1,
		},
		{
			id: "sponsor-support-letter",
			label: "Sponsor support letter",
			description:
				"Letter from sponsor confirming commitment of financial support to the applicant",
			priority: 2,
		},
		{
			id: "sponsor-income",
			label: "Proof of sponsor’s income",
			description:
				"Documents showing the sponsor’s current income and/or investments, such as recent pay stubs, employer letter, income tax return, or investment statements.",
			priority: 3,
		},
	],

	"Professional Documents": [
		{
			id: "lmia",
			label: "Document with the LMIA or Exemption number",
			description:
				"Document containing LMIA number or LMIA exemption number approved by Canadian government",
			priority: 1,
		},
		{
			id: "job-offer",
			label: "Signed job offer",
			description:
				"Signed job offer from employer with specification of salary, position, hours and workplace location",
			priority: 2,
		},
		{
			id: "job-contract",
			label: "Employment contract",
			description:
				"Formal employment contract signed between employer and applicant (if applicable)",
			priority: 3,
		},
		{
			id: "education-certificates",
			label: "Academic certificates and diplomas",
			description:
				"Academic certificates and diplomas from higher education and professional training",
			priority: 4,
		},
		{
			id: "resume",
			label: "Resume",
			description:
				"Updated resume or CV describing professional experience, education and skills",
			priority: 5,
		},
		{
			id: "language-proficiency",
			label: "Language proficiency test",
			description:
				"Proof of language proficiency (IELTS, TOEFL, etc.) if required by the program or employer",
			priority: 6,
		},
	],

	"Partner's Support Documents": [
		{
			id: "pgwp-spouse-proof",
			label: "Copy of spouse's PGWP",
			description: "Copy of spouse's Post-Graduation Work Permit (PGWP)",
			priority: 1,
		},
		{
			id: "pgwp-spouse-employment",
			label: "Current employment letter",
			description:
				"Current spouse employment letter issued within the last 3 months",
			priority: 2,
		},
		{
			id: "pgwp-spouse-payslips",
			label: "Payslips for the last 3–4 months",
			description: "Spouse payslips or paystubs for the last 3-4 months",
			priority: 3,
		},
		{
			id: "pgwp-spouse-eligibility",
			label: "Proof that spouse work eligibility",
			description: "Proof that spouse has work eligibility in Canada",
			priority: 4,
		},
		{
			id: "cwp-spouse-permit",
			label: "Copy of spouse's Closed Work Permit",
			description: "Copy of spouse's Closed Work Permit (CWP)",
			priority: 5,
		},
		{
			id: "cwp-spouse-employment",
			label: "Employment letter tied to the Closed Work Permit",
			description:
				"Employment letter specifically tied to the spouse's Closed Work Permit",
			priority: 6,
		},
		{
			id: "cwp-spouse-payslips",
			label: "Spouse payslips for the last 3–4 months",
			description: "Spouse paystubs for the last 3-4 months",
			priority: 7,
		},
		{
			id: "cwp-spouse-lmia",
			label: "LMIA or LMIA-exempt confirmation number",
			description:
				"LMIA number or LMIA exemption (LMIA-exempt) confirmation number for spouse",
			priority: 8,
		},
		{
			id: "study-spouse-permit",
			label: "Copy of spouse's Study Permit",
			description: "Copy of spouse's Study Permit",
			priority: 9,
		},
		{
			id: "study-spouse-loa",
			label: "Letter of enrolment/acceptance",
			description:
				"Letter of enrollment or acceptance from spouse's study program",
			priority: 10,
		},
		{
			id: "study-spouse-tuition",
			label: "Proof of payment of tuition",
			description: "Proof of tuition payment from spouse",
			priority: 11,
		},
		{
			id: "study-spouse-attendance",
			label: "Proof of attendance",
			description:
				"Proof of attendance/enrollment status from spouse's institution",
			priority: 12,
		},
	],

	"Proof of Ties to Home Country": [
		{
			id: "intent-letter",
			label: "Letter of Intent or Letter of Explanation",
			description:
				"Dated and signed Letter of Intent explaining reason for stay in Canada and plan to return",
			priority: 1,
		},
		{
			id: "ties-proof",
			label: "Proof of ties",
			description:
				"Proof of ties to home country (employment, property, family, etc.)",
			priority: 2,
		},
		{
			id: "residence-proof",
			label: "Proof of residence",
			description:
				"Proof of residence in home country (rental contract, deed, etc.)",
			priority: 3,
		},
	],

	"Additional Documents for Previous Refusal": [
		{
			id: "refusal-letter",
			label: "Copy of the refusal letter from IRCC",
			description:
				"Copy of the original refusal letter from IRCC explaining reasons for rejection",
			priority: 1,
		},
		{
			id: "explanation-letter",
			label: "Explanation letter addressing refusal reasons",
			description:
				"Letter explaining how the reasons for the previous refusal have been addressed and resolved",
			priority: 2,
		},
		{
			id: "add-evidence",
			label: "Evidence that strengthens your application",
			description:
				"Additional evidence that strengthens the application and addresses the concerns raised",
			priority: 3,
		},
		{
			id: "travel-history",
			label: "International travel history",
			description:
				"Complete international travel history, especially for visitor visas",
			priority: 4,
		},
	],

	"Additional Documents for Loss of Status": [
		{
			id: "restoration-letter",
			label: "Letter of Explanation - why the expired status",
			description:
				"Letter explaining the reasons why previous status was lost or expired",
			priority: 1,
		},
	],

	"Official Forms": [
		{
			id: "representative",
			label: "IMM 5476 – Use of Representative",
			description:
				"Form IMM 5476 - Authorization of representative (if using immigration services)",
			priority: 1,
		},
		{
			id: "family-form",
			label: "IMM 5645 – Family Information Form",
			description:
				"Form IMM 5645 - Family Information. Mandatory for families applying together",
			priority: 2,
		},
	],
};

/* ========= 2) OVERRIDES (EXATOS) ========= */
const OVERRIDE_SERVICES = [
	"Permanent Residence",
	"Permanent Residence Renewal",
	"Spousal Sponsorship",
	"LMIA",
];
const OVERRIDE_TOKEN = "__OVERRIDE__";
const OVERRIDE_MESSAGE = "Checklist not available";

/* ========= 3) HELPERS (index e sections) ========= */
function buildIndex(docs) {
	const byId = new Map();
	for (const [section, arr] of Object.entries(docs)) {
		for (const d of arr) byId.set(d.id, { ...d, section });
	}
	return { byId };
}

function buildSectionsForDocsAPI(visibleIds, docs) {
	if (visibleIds.includes(OVERRIDE_TOKEN)) {
		return [{ heading: "Checklist", items: [OVERRIDE_MESSAGE] }];
	}
	const { byId } = buildIndex(docs);
	const grouped = new Map(); // section -> [labels]

	for (const id of visibleIds) {
		const meta = byId.get(id);
		if (!meta) continue;
		if (!grouped.has(meta.section)) grouped.set(meta.section, []);
		grouped.get(meta.section).push(meta.label);
	}

	// mantém a ordem das chaves do DB
	const out = [];
	for (const sectionName of Object.keys(docs)) {
		const items = grouped.get(sectionName);
		if (items?.length) out.push({ heading: sectionName, items });
	}
	return out;
}

/* ========= 4) LÓGICA DE VISIBILIDADE (FIXED - MATCHING HTML EXACTLY) ========= */
function getVisibleDocumentsFromForm(form) {
	const visible = ["passport", "photo", "representative"];

	// Override por serviço indisponível
	if (OVERRIDE_SERVICES.includes(form.helpType)) {
		return [OVERRIDE_TOKEN];
	}
	if (form.helpType === "Open Work Permit" && !form.owp) {
		return [OVERRIDE_TOKEN];
	}

	// PAL logic
	if (form.helpType?.includes("Study") && form.pal === "Yes") {
		visible.push("pal");
	}
	if (form.helpType?.includes("Study") && form.application === "Outland") {
		visible.push("pal");
	}

	// Marriage and kids
	if (form.married === "Yes") {
		visible.push("marriage-certificate");
	}
	if (form.kids === "Yes") {
		visible.push("birth-certificate");
	}

	// Current permit
	if (form.application !== "Outland") {
		visible.push("permit");
	}

	// Previous refusal
	if (form.previousRefusal === "Yes") {
		visible.push("refusal-letter", "explanation-letter", "add-evidence");
	}
	if (form.previousRefusal === "Yes" && form.helpType?.includes("Visitor")) {
		visible.push("travel-history");
	}
	if (form.application !== "Inland" && form.helpType?.includes("Visitor")) {
		visible.push("travel-history");
	}

	// Outland application
	if (form.application === "Outland") {
		visible.push(
			"intent-letter",
			"ties-proof",
			"residence-proof",
			"family-form"
		);
	}

	// Restoration
	if (
		form.restoration === "Yes" ||
		form.helpType?.toLowerCase().includes("restoration")
	) {
		visible.push("restoration-letter");
	}

	// Study permit documents
	if (form.helpType?.toLowerCase().includes("study")) {
		visible.push(
			"loa",
			"enrollment-proof",
			"school-receipt",
			"coop-letter",
			"bank-statements",
			"sponsor-bank-statements",
			"sponsor-support-letter",
			"sponsor-income"
		);
	}

	// Closed work permit
	if (
		form.helpType?.toLowerCase().includes("work") &&
		form.helpType?.toLowerCase().includes("closed")
	) {
		visible.push(
			"lmia",
			"job-offer",
			"job-contract",
			"education-certificates",
			"resume",
			"language-proficiency"
		);
	}

	// Open work permit - PGWP Spouse
	if (
		form.helpType?.toLowerCase().includes("open") &&
		form.owp === "PGWP Spouse"
	) {
		visible.push(
			"pgwp-spouse-proof",
			"pgwp-spouse-employment",
			"pgwp-spouse-payslips",
			"pgwp-spouse-eligibility",
			"marriage-certificate"
		);
	}

	// Open work permit - Close WP Spouse
	if (
		form.helpType?.toLowerCase().includes("open") &&
		form.owp === "Close WP - Spouse"
	) {
		visible.push(
			"cwp-spouse-permit",
			"cwp-spouse-employment",
			"cwp-spouse-payslips",
			"cwp-spouse-lmia",
			"marriage-certificate"
		);
	}

	// Open work permit - Student Spouse
	if (
		form.helpType?.toLowerCase().includes("open") &&
		form.owp === "Student Spouse"
	) {
		visible.push(
			"study-spouse-permit",
			"study-spouse-loa",
			"study-spouse-tuition",
			"study-spouse-attendance",
			"marriage-certificate"
		);
	}

	return visible;
}

/* ========= 5) INPUT → FORM (NORMALIZED TO MATCH HTML) =========
 * Convert capitalized keys to lowercase camelCase to match HTML logic
 * Data comes from "Edit Fields" node which gets it from "Loop Over Items"
 */
const rawForm = {
	Service: $json["How can we help you?"],
	Married: $json["Married"],
	Kids: $json["Kids"],
	OWP: $json["OWP"],
	"Previous Refusal": $json["Previous Refusal"],
	Application: $json["Application"],
	PAL: $json["PAL"],
	Restoration: $json["Restoration"],
};

// Normalize to match HTML field names
const form = {
	helpType: rawForm["Service"],
	married: rawForm["Married"],
	kids: rawForm["Kids"],
	owp: rawForm["OWP"],
	previousRefusal: rawForm["Previous Refusal"],
	application: rawForm["Application"],
	pal: rawForm["PAL"],
	restoration: rawForm["Restoration"],
};

/* ========= 6) BUILD SECTIONS ========= */
const visibleIds = getVisibleDocumentsFromForm(form);
const sections = buildSectionsForDocsAPI(visibleIds, documents);

// Calculate total documents required
const totalDocuments = visibleIds.includes(OVERRIDE_TOKEN)
	? 0
	: visibleIds.length;

/* ========= 7) Tradução se Ncessário - I18N (PT/EN) ========= */
// defina langRaw ANTES de usar LOCALE
const langRaw = String($json["Preferred Language"] ?? "").trim();
// igualdade exata: só PT quando for exatamente "Portuguese"
const LOCALE = langRaw === "Portuguese" ? "pt" : "en";

// 1) Dicionário de headings e itens
const I18N = {
	headings: {
		"Personal Documents": {
			pt: "Documentos Pessoais",
			en: "Personal Documents",
		},
		"Academic Documents": {
			pt: "Documentos Acadêmicos",
			en: "Academic Documents",
		},
		"Financial Documents": {
			pt: "Comprovação Financeira",
			en: "Financial Documents",
		},
		"Sponsor Documents": {
			pt: "Documentos do Patrocinador",
			en: "Sponsor Documents",
		},
		"Professional Documents": {
			pt: "Documentos Profissionais",
			en: "Professional Documents",
		},
		"Partner's Support Documents": {
			pt: "Documentos do(a) Cônjuge",
			en: "Partner's Support Documents",
		},
		"Proof of Ties to Home Country": {
			pt: "Laços com o País de Origem",
			en: "Proof of Ties to Home Country",
		},
		"Additional Documents for Previous Refusal": {
			pt: "Documentos para Casos com Recusa Prévia",
			en: "Additional Documents for Previous Refusal",
		},
		"Additional Documents for Loss of Status": {
			pt: "Documentos para Restauração de Status",
			en: "Additional Documents for Loss of Status",
		},
		"Official Forms": { pt: "Formulários Oficiais", en: "Official Forms" },
		Checklist: { pt: "Lista", en: "Checklist" },
	},
	items: {
		"Copy of passport pages": {
			pt: "Cópia das páginas do passaporte",
			en: "Copy of passport pages",
		},
		"Digital photo": { pt: "Foto digital", en: "Digital photo" },
		"Copy of current Permit": {
			pt: "Cópia da permissão vigente",
			en: "Copy of current Permit",
		},
		"Marriage certificate": {
			pt: "Certidão de casamento",
			en: "Marriage certificate",
		},
		"Birth certificate of the child": {
			pt: "Certidão de nascimento do(a) filho(a)",
			en: "Birth certificate of the child",
		},

		"Letter of Acceptance (LOA) from the institution": {
			pt: "Carta de Aceitação (LOA) da instituição",
			en: "Letter of Acceptance (LOA) from the institution",
		},
		"Proof of enrollment or current studies": {
			pt: "Comprovante de matrícula ou estudos em andamento",
			en: "Proof of enrollment or current studies",
		},
		"Provincial Attestation Letter (PAL)": {
			pt: "Carta de Atestação Provincial (PAL)",
			en: "Provincial Attestation Letter (PAL)",
		},
		"Tuition payment receipt issued by the school": {
			pt: "Comprovante de pagamento de mensalidade emitido pela escola",
			en: "Tuition payment receipt issued by the school",
		},
		"Co-op Letter": { pt: "Carta de Co-op", en: "Co-op Letter" },

		"Bank statements for the last 4 months": {
			pt: "Extratos bancários dos últimos 4 meses",
			en: "Bank statements for the last 4 months",
		},

		"Document with the LMIA or Exemption number": {
			pt: "Documento com a LMIA ou número de isenção",
			en: "Document with the LMIA or Exemption number",
		},
		"Signed job offer": {
			pt: "Oferta de trabalho assinada",
			en: "Signed job offer",
		},
		"Employment contract": {
			pt: "Contrato de trabalho",
			en: "Employment contract",
		},
		"Academic certificates and diplomas": {
			pt: "Certificados e diplomas acadêmicos",
			en: "Academic certificates and diplomas",
		},
		Resume: { pt: "Currículo", en: "Resume" },
		"Language proficiency test": {
			pt: "Comprovante de proficiência linguística",
			en: "Language proficiency test",
		},

		"Copy of spouse's PGWP": {
			pt: "Cópia do PGWP do(a) cônjuge",
			en: "Copy of spouse's PGWP",
		},
		"Current employment letter": {
			pt: "Carta de emprego atual",
			en: "Current employment letter",
		},
		"Payslips for the last 3–4 months": {
			pt: "Holerites dos últimos 3–4 meses",
			en: "Payslips for the last 3–4 months",
		},
		"Proof that spouse work eligibility": {
			pt: "Comprovante de elegibilidade de trabalho do(a) cônjuge",
			en: "Proof that spouse work eligibility",
		},
		"Copy of spouse's Closed Work Permit": {
			pt: "Cópia do Closed Work Permit do(a) cônjuge",
			en: "Copy of spouse's Closed Work Permit",
		},
		"Employment letter tied to the Closed Work Permit": {
			pt: "Carta de emprego vinculada ao Closed Work Permit",
			en: "Employment letter tied to the Closed Work Permit",
		},
		"LMIA or LMIA-exempt confirmation number": {
			pt: "LMIA ou número de isenção (LMIA-exempt)",
			en: "LMIA or LMIA-exempt confirmation number",
		},
		"Copy of spouse's Study Permit": {
			pt: "Cópia do Study Permit do(a) cônjuge",
			en: "Copy of spouse's Study Permit",
		},
		"Letter of enrolment/acceptance": {
			pt: "Carta de matrícula/aceitação",
			en: "Letter of enrolment/acceptance",
		},
		"Proof of payment of tuition": {
			pt: "Comprovante de pagamento de mensalidade",
			en: "Proof of payment of tuition",
		},
		"Proof of attendance": {
			pt: "Comprovante de frequência",
			en: "Proof of attendance",
		},

		"Letter of Intent or Letter of Explanation": {
			pt: "Carta de Intenção ou Carta de Explicação",
			en: "Letter of Intent or Letter of Explanation",
		},
		"Proof of ties": { pt: "Comprovação de laços", en: "Proof of ties" },
		"Proof of residence": {
			pt: "Comprovante de residência",
			en: "Proof of residence",
		},

		"Copy of the refusal letter from IRCC": {
			pt: "Cópia da carta de recusa do IRCC",
			en: "Copy of the refusal letter from IRCC",
		},
		"Explanation letter addressing refusal reasons": {
			pt: "Carta explicando os motivos da recusa",
			en: "Explanation letter addressing refusal reasons",
		},
		"Evidence that strengthens your application": {
			pt: "Evidências que reforçam sua aplicação",
			en: "Evidence that strengthens your application",
		},
		"International travel history": {
			pt: "Histórico de viagens internacionais",
			en: "International travel history",
		},

		"Letter of Explanation - why the expired status": {
			pt: "Carta de Explicação — por que o status expirou",
			en: "Letter of Explanation - why the expired status",
		},

		"IMM 5476 – Use of Representative": {
			pt: "IMM 5476 – Uso de Representante",
			en: "IMM 5476 – Use of Representative",
		},
		"IMM 5645 – Family Information Form": {
			pt: "IMM 5645 – Formulário de Informações Familiares",
			en: "IMM 5645 – Family Information Form",
		},

		"Checklist not available": {
			pt: "Lista não disponível",
			en: "Checklist not available",
		},
	},
	misc: {
		titleFallback: {
			pt: "Lista de Documentos para Visto",
			en: "Visa Document Checklist",
		},
		totalRequired: {
			pt: "Total de Documentos Exigidos",
			en: "Total Required Documents",
		},
	},
};

const tHead = (h) => I18N.headings[h]?.[LOCALE] || h;
const tItem = (l) => I18N.items[l]?.[LOCALE] || l;

// 2) Traduzir as sections calculadas
const sectionsLocalized = sections.map((sec) => ({
	heading: tHead(sec.heading),
	items: (sec.items || []).map(tItem),
}));

// 3) Título + rótulo “Total”
const titleLocalized =
	$json.title ||
	$json["How can we help you?"] ||
	I18N.misc.titleFallback[LOCALE];

const totalLabel = I18N.misc.totalRequired[LOCALE];

/* ========= 8) GERAR REQUESTS p/ Google Docs ========= */
const title = titleLocalized;
let cursor = 1; // corpo do doc começa no índice 1
const requests = [];
const u16 = (s) => s.length;

// H1 (sem linha em branco antes; uma \n depois)
const firstChunk = `${title}\n`;
requests.push({
	insertText: { location: { index: cursor }, text: firstChunk },
});
requests.push({
	updateParagraphStyle: {
		range: { startIndex: cursor, endIndex: cursor + u16(firstChunk) },
		paragraphStyle: {
			namedStyleType: "HEADING_1",
			spaceAbove: { magnitude: 0, unit: "PT" },
			spaceBelow: { magnitude: 0, unit: "PT" },
			lineSpacing: 100,
		},
		fields: "namedStyleType,spaceAbove,spaceBelow,lineSpacing",
	},
});
cursor += u16(firstChunk);

// Add document count line
const countText = `${totalLabel}: ${totalDocuments}\n\n`;
requests.push({ insertText: { location: { index: cursor }, text: countText } });
requests.push({
	updateTextStyle: {
		range: { startIndex: cursor, endIndex: cursor + u16(countText) },
		textStyle: { bold: true, fontSize: { magnitude: 11, unit: "PT" } },
		fields: "bold,fontSize",
	},
});
cursor += u16(countText);

// H2 + lista para cada seção (com uma quebra ANTES do H2)
for (const sec of sectionsLocalized) {
	const headingText = `\n${sec.heading}\n`; // respiro antes do H2
	requests.push({
		insertText: { location: { index: cursor }, text: headingText },
	});
	requests.push({
		updateParagraphStyle: {
			range: { startIndex: cursor, endIndex: cursor + u16(headingText) },
			paragraphStyle: {
				namedStyleType: "HEADING_2",
				spaceAbove: { magnitude: 0, unit: "PT" },
				spaceBelow: { magnitude: 0, unit: "PT" },
				lineSpacing: 100,
			},
			fields: "namedStyleType,spaceAbove,spaceBelow,lineSpacing",
		},
	});
	cursor += u16(headingText);

	const itemsText = (sec.items || []).join("\n") + "\n";
	const itemsStart = cursor;
	requests.push({
		insertText: { location: { index: cursor }, text: itemsText },
	});

	const itemsEnd = itemsStart + u16(itemsText) - 1; // exclui o \n final
	if (itemsEnd > itemsStart) {
		requests.push({
			createParagraphBullets: {
				range: { startIndex: itemsStart, endIndex: itemsEnd },
				bulletPreset: "BULLET_CHECKBOX",
			},
		});
	}

	cursor += u16(itemsText);
}

/* ========= 9) SAÍDA ========= */
return [
	{
		json: {
			body: { requests },
			sections,
			visibleIds,
			form,
			totalDocuments,
			summary: `${totalDocuments} documents required for ${
				form.helpType || "Unknown Application"
			}`,
		},
	},
];
