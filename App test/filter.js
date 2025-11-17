const html = $item("0").$node["HTML1"].json["html"];
const form = $item("0").$node["Get user Info form Intake form1"].json;

const visibleDocuments = ["passport", "photo", "representative"]; // documentos sempre visíveis

// regra 1: quer estudar + não disse "No" em PAL
if (form["How can we help you?"]?.includes("Study") && form.PAL !== "No") {
	visibleDocuments.push("pal");
}

// regra 2: casado
if (form.Married === "Yes") {
	visibleDocuments.push("marriage-certificate");
}

// regra 3: filhos
if (form.Kids === "Yes") {
	visibleDocuments.push("birth-certificate");
}
// regra 4: Pedir permit se Application não for "Outland"
if (form.Application !== "Outland") {
	visibleDocuments.push("current-permit");
}

// regra 5: se Previous Refusal for "Yes", pedir documentos relacionados à recusa
if (form["Previous Refusal"] === "Yes") {
	visibleDocuments.push("refusal-letter");
	visibleDocuments.push("explanation-letter");
	visibleDocuments.push("add-evidence");
}

// regra 6: Previous Refusal "Yes" + "Visitor", pedir travel-history
if (
	form["Previous Refusal"] === "Yes" &&
	form["How can we help you?"]?.includes("Visitor")
) {
	visibleDocuments.push("travel-history");
}

// regra 7: Contain "Visitor" + Outland, pedir travel-history ok
if (
	form.Application !== "Inland" &&
	form["How can we help you?"]?.includes("Visitor")
) {
	visibleDocuments.push("travel-history");
}
// regra 8: Se a aplicação for "Outland", pedir Proof of Ties to Home Country
if (form.Application === "Outland") {
	visibleDocuments.push("intent-letter");
	visibleDocuments.push("ties-proof");
	visibleDocuments.push("residence-proof");
	visibleDocuments.push("family-form");
}

// regra 9: Restoration se marcado no formulário ou mencionado no serviço
if (
	form.Restoration === "Yes" ||
	form["How can we help you?"]?.toLowerCase().includes("restoration")
) {
	visibleDocuments.push("restoration-letter", "restoration-statement");
}
// regra 10: Contain Study add documents
if (form["How can we help you?"]?.toLowerCase().includes("Study")) {
	visibleDocuments.push(
		"loa",
		"enrollment-proof",
		"school-receipt",
		"tuition-first-year",
		"bank-statements",
		"sponsor-bank-statements",
		"sponsor-support-letter",
		"sponsor-income"
	);
}

// regra 11: Contain Work and Closed add documents
if (
	form["How can we help you?"]?.toLowerCase().includes("work") &&
	form["How can we help you?"]?.toLowerCase().includes("closed")
) {
	visibleDocuments.push(
		"lmia",
		"job-offer",
		"job-contract",
		"education-certificates",
		"resume",
		"language-proficiency"
	);
}

// regra 12: Work + PGWP Spouse
if (
	form["How can we help you?"]?.toLowerCase().includes("open") &&
	form.OWP === "PGWP Spouse"
) {
	visibleDocuments.push(
		"pgwp-spouse-proof",
		"pgwp-spouse-employment",
		"pgwp-spouse-payslips",
		"pgwp-spouse-eligibility"
	);
}

// regra 13: Work + CWP Spouse
if (
	form["How can we help you?"]?.toLowerCase().includes("open") &&
	form.OWP === "CWP Spouse"
) {
	visibleDocuments.push(
		"cwp-spouse-permit",
		"cwp-spouse-employment",
		"cwp-spouse-payslips",
		"cwp-spouse-lmia"
	);
}

// regra 14: Work + Student Spouse
if (
	form["How can we help you?"]?.toLowerCase().includes("open") &&
	form.OWP === "Student Spouse"
) {
	visibleDocuments.push(
		"study-spouse-permit",
		"study-spouse-loa",
		"study-spouse-tuition",
		"study-spouse-attendance"
	);
}

// regra 15: Work + Bridging OWP
if (
	form["How can we help you?"]?.toLowerCase().includes("open") &&
	form.OWP === "Bridging"
) {
	visibleDocuments.push("bridging-status", "bridging-employment");
}

// limpar os <li> indesejados
let cleanedHtml = html.replace(
	/<li[^>]+data-document=["']([^"']+)["'][\s\S]*?<\/li>/gi,
	(match, docId) => (visibleDocuments.includes(docId) ? match : "")
);

// remover seções (<div>) com <ul> vazio
cleanedHtml = cleanedHtml.replace(
	/<div[^>]*>\s*<h2>.*?<\/h2>\s*<ul>\s*<\/ul>\s*<\/div>/gi,
	""
);

// return [{ json: { cleanedHtml } }];

return [
	{
		json: {
			visibleDocuments: visibleDocuments.join(", "),
		},
	},
];
