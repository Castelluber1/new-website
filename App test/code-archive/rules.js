// UI helpers
const sidebar = document.getElementById('sidebar');
const toggleSidebar = document.getElementById('toggleSidebar');
const formEl = document.getElementById('filter-form');
const resetBtn = document.getElementById('resetBtn');
const debugEl = document.getElementById('debugOut');

toggleSidebar?.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

resetBtn?.addEventListener('click', () => {
  formEl.reset();
  applyRules();
});

// Get current form as object
function getFormValues(){
  const data = new FormData(formEl);
  const form = {};
  for (const [k, v] of data.entries()) form[k] = v;
  return form;
}

// Core: apply visibility rules
function applyRules(){
  const form = getFormValues();
  const help = (form["How can we help you?"] || "").toLowerCase();

  // Start visible with always-on docs
  const visibleDocuments = ["passport", "photo", "representative"];

  // Regra 1: Study + PAL not "No" -> pal
  if (help.includes("study") && form.PAL !== "No") {
    visibleDocuments.push("pal");
  }

  // Regra 2: Married Yes -> marriage-certificate
  if (form.Married === "Yes") visibleDocuments.push("marriage-certificate");

  // Regra 3: Kids Yes -> birth-certificate
  if (form.Kids === "Yes") visibleDocuments.push("birth-certificate");

  // Regra 4: Application not Outland -> current-permit
  if (form.Application !== "Outland") visibleDocuments.push("current-permit");

  // Regra 5: Previous Refusal Yes -> refusal docs
  if (form["Previous Refusal"] === "Yes") {
    visibleDocuments.push("refusal-letter","explanation-letter","add-evidence");
  }

  // Regra 6: Previous Refusal Yes + Visitor -> travel-history
  if (form["Previous Refusal"] === "Yes" && help.includes("visitor")) {
    visibleDocuments.push("travel-history");
  }

  // Regra 7: Outland (or not Inland) + Visitor -> travel-history
  if (form.Application !== "Inland" && help.includes("visitor")) {
    visibleDocuments.push("travel-history");
  }

  // Regra 8: Application Outland -> ties
  if (form.Application === "Outland") {
    visibleDocuments.push("intent-letter","ties-proof","residence-proof","family-form");
  }

  // Regra 9: Restoration Yes OR mentioned
  if (form.Restoration === "Yes" || help.includes("restoration")) {
    visibleDocuments.push("restoration-letter","restoration-statement");
  }

  // Regra 10: Any Study -> study docs (not pal here)
  if (help.includes("study")) {
    visibleDocuments.push(
      "loa","enrollment-proof","school-receipt","tuition-first-year",
      "bank-statements","sponsor-bank-statements","sponsor-support-letter","sponsor-income"
    );
  }

  // Regra 11: Work + Closed -> professional docs
  if (help.includes("work") && help.includes("closed")) {
    visibleDocuments.push(
      "lmia","job-offer","job-contract","education-certificates","resume","language-proficiency"
    );
  }

  // Regra 12: Work + OWP variations
  if (help.includes("work") && form.OWP === "PGWP Spouse") {
    visibleDocuments.push("pgwp-spouse-proof","pgwp-spouse-employment","pgwp-spouse-payslips","pgwp-spouse-eligibility");
  }
  if (help.includes("work") && form.OWP === "Close WP - Spouse") {
    visibleDocuments.push("cwp-spouse-permit","cwp-spouse-employment","cwp-spouse-payslips","cwp-spouse-lmia");
  }
  if (help.includes("work") && form.OWP === "Student Spouse") {
    visibleDocuments.push("study-spouse-permit","study-spouse-loa","study-spouse-tuition","study-spouse-attendance");
  }

  // -----------------------
  // DOM filtering:
  // Hide all items first, then show the ones in visibleDocuments
  const allLis = document.querySelectorAll('li[data-document]');
  allLis.forEach(li => li.classList.add('hidden'));

  visibleDocuments.forEach(id => {
    document.querySelectorAll(`li[data-document="${id}"]`).forEach(li => li.classList.remove('hidden'));
  });

  // Hide sections with no visible li
  document.querySelectorAll('.doc-section').forEach(sec => {
    const visibleCount = sec.querySelectorAll('li[data-document]:not(.hidden)').length;
    sec.style.display = visibleCount > 0 ? '' : 'none';
  });

  // Debug
  const unique = Array.from(new Set(visibleDocuments));
  debugEl.textContent = JSON.stringify(unique, null, 2);
}

// Add .hidden style
const style = document.createElement('style');
style.textContent = `.hidden{ display:none !important; }`;
document.head.appendChild(style);

// Initial run & form submit
formEl.addEventListener('submit', (e) => {
  e.preventDefault();
  applyRules();
});
window.addEventListener('DOMContentLoaded', applyRules);
