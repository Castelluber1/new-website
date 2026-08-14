// Typed effect for dynamic word
const dynamicSpan = document.getElementById("dynamic-word");
if (dynamicSpan) {
	const words = ["Dreaming", "Waiting", "Worrying"];
	let wordIndex = 0;
	function cycleWords() {
		wordIndex = (wordIndex + 1) % words.length;
		dynamicSpan.textContent = words[wordIndex];
	}
	setInterval(cycleWords, 3000);
}
// Animated counters
const counters = document.querySelectorAll(".count");
const counterObserver = new IntersectionObserver(
	(entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				const counter = entry.target;
				const target = +counter.dataset.target;
				let current = 0;
				const increment = target / 100;
				const update = () => {
					current += increment;
					if (current < target) {
						counter.textContent = Math.floor(current);
						requestAnimationFrame(update);
					} else {
						counter.textContent = target;
					}
				};
				update();

				const icon = counter.closest(".stat-box")?.querySelector(".stat-icon");
				if (icon) icon.classList.add("active");

				counterObserver.unobserve(counter);
			}
		});
	},
	{ threshold: 0.2 }
);
counters.forEach((counter) => counterObserver.observe(counter));

// Fecha ao clicar em qualquer link do menu
document.querySelectorAll(".main-nav a").forEach((a) =>
	a.addEventListener("click", () => {
		document.body.classList.remove("menu-open");
		if (btn) btn.setAttribute("aria-expanded", "false");
	})
);

(function () {
	const header = document.querySelector("header");
	const btn = document.querySelector(".nav-toggle");
	const panel = document.getElementById("primary-menu");

	if (!btn || !panel || !header) return;

	function setOpen(isOpen) {
		header.classList.toggle("menu-open", isOpen);
		document.body.classList.toggle("menu-lock", isOpen);
		btn.setAttribute("aria-expanded", String(isOpen));
	}

	btn.addEventListener("click", () => {
		const open = header.classList.contains("menu-open");
		setOpen(!open);
	});

	// close on ESC
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape") setOpen(false);
	});

	// close after clicking any nav link
	panel.addEventListener("click", (e) => {
		const a = e.target.closest("a");
		if (a) setOpen(false);
	});
})();

(function () {
	const btn = document.getElementById("navToggle");
	const panel = document.getElementById("mobilePanel");
	if (!btn || !panel) return; // <- evita quebrar páginas que não têm esses elementos

	function toggleMenu() {
		const open = panel.classList.toggle("open");
		btn.classList.toggle("is-active", open);
		document.body.classList.toggle("menu-open", open);
		btn.setAttribute("aria-expanded", open ? "true" : "false");
		btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
	}

	btn.addEventListener("click", toggleMenu);

	// Close when clicking a link (good UX)
	panel.addEventListener("click", (e) => {
		if (e.target.closest("a")) toggleMenu();
	});

	// Close on ESC
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape" && panel.classList.contains("open")) toggleMenu();
	});
})();

const reviewsTrack = document.querySelector(".reviews-grid");
const reviewsPrev = document.querySelector(".reviews-footer .prev");
const reviewsNext = document.querySelector(".reviews-footer .next");

if (reviewsTrack && reviewsPrev && reviewsNext) {
	const card = reviewsTrack.querySelector(".review-card");
	if (card) {
		const gap = parseInt(getComputedStyle(reviewsTrack).gap) || 20;
		const cardWidth = card.offsetWidth + gap;

		reviewsPrev.addEventListener("click", () => {
			reviewsTrack.scrollBy({ left: -cardWidth, behavior: "smooth" });
		});

		reviewsNext.addEventListener("click", () => {
			reviewsTrack.scrollBy({ left: cardWidth, behavior: "smooth" });
		});
	}
}

document.addEventListener("scroll", () => {
	const sections = document.querySelectorAll(
		"#about, #testimonials, .mask, #study-permit-process"
	);

	sections.forEach((section) => {
		const rect = section.getBoundingClientRect();

		if (
			rect.top < window.innerHeight / 2 &&
			rect.bottom > window.innerHeight / 2
		) {
			section.classList.add("active");
		} else {
			section.classList.remove("active");
		}
	});
});

// FAQ

const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {
	const header = item.querySelector("h3");
	header.addEventListener("click", () => {
		faqItems.forEach((i) => i.classList.remove("open")); // fecha outros
		item.classList.toggle("open");
	});
});

// fechar ao clicar fora
document.addEventListener("click", (e) => {
	if (!e.target.closest(".faq-item")) {
		faqItems.forEach((i) => i.classList.remove("open"));
	}
});

// Smooth scroll with custom duration for anchor links
document.addEventListener('click', e => {
	const a = e.target.closest('a[href^="#"]');
	if (!a) return;
	const target = document.querySelector(a.getAttribute('href'));
	if (!target) return;
	e.preventDefault();
	const start = window.scrollY;
	const end = target.getBoundingClientRect().top + window.scrollY - 80;
	const duration = 900;
	const startTime = performance.now();
	function ease(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
	function step(now) {
		const elapsed = Math.min((now - startTime) / duration, 1);
		window.scrollTo(0, start + (end - start) * ease(elapsed));
		if (elapsed < 1) requestAnimationFrame(step);
	}
	requestAnimationFrame(step);
});

// Import Features
document.querySelectorAll("[data-include]").forEach((el) => {
	const file = el.getAttribute("data-include");
	fetch(file)
		.then((resp) => resp.text())
		.then((data) => {
			el.innerHTML = data;
			const isPt = location.pathname.startsWith('/pt/');
			const bookBtn = el.querySelector('#nav-book-btn');
			if (bookBtn && isPt) {
				bookBtn.href = '/pt/consulta-de-imigracao';
				bookBtn.textContent = 'Agendar Consulta';
			}
		})
		.catch((err) => console.error("Erro ao incluir:", file, err));
});

// AI-referral tracker — mede quanto tráfego vem de assistentes de IA (Perplexity,
// ChatGPT, Gemini, Copilot, etc.) via document.referrer. Ver TRACKING.md §3 (ai_referral).
// Só mede visitas que CHEGAM ao site — não vê AI Overview do Google (lá o clique nem acontece).
(function () {
	if (typeof gtag !== "function") return;
	var ref = document.referrer || "";
	if (!ref) return;
	var host = "";
	try { host = new URL(ref).hostname.replace(/^www\./, ""); } catch (e) { return; }
	// mapa host -> nome da fonte de IA
	var SOURCES = [
		["perplexity.ai", "perplexity"],
		["chatgpt.com", "chatgpt"], ["chat.openai.com", "chatgpt"], ["openai.com", "chatgpt"],
		["gemini.google.com", "gemini"], ["bard.google.com", "gemini"],
		["copilot.microsoft.com", "copilot"], ["bing.com", "copilot-or-bing"],
		["claude.ai", "claude"],
		["you.com", "you"], ["poe.com", "poe"], ["phind.com", "phind"]
	];
	for (var i = 0; i < SOURCES.length; i++) {
		if (host === SOURCES[i][0] || host.endsWith("." + SOURCES[i][0])) {
			gtag("event", "ai_referral", {
				ai_source: SOURCES[i][1],
				referrer_host: host,
				landing_page: location.pathname
			});
			break;
		}
	}
})();

// ── Journey tracker (HubSpot-like) ────────────────────────────────────────
// Registra a jornada da pessoa no site NESTA sessão: cada página visitada,
// tempo em cada uma, e como entrou (referrer/keyword). Fica em localStorage,
// anônimo, até a pessoa se identificar (formulário ou Calendly). Nesse momento
// o form/Calendly pega window.upJourney.get() e manda pro CRM, pra a Larissa
// ver o caminho ANTES da consulta. Ver TRACKING.md.
(function () {
	'use strict';
	var KEY = 'up_journey_v1';
	var MAX_PAGES = 40;         // teto de segurança
	var SESSION_GAP = 30 * 60000; // 30min sem atividade = nova sessão

	function load() {
		try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; }
	}
	function save(j) {
		try { localStorage.setItem(KEY, JSON.stringify(j)); } catch (e) {}
	}

	var now = Date.now();
	var j = load();

	// nova sessão se não existe ou ficou inativa demais
	if (!j || (now - (j.last || 0)) > SESSION_GAP) {
		var ref = document.referrer || '';
		var refHost = '';
		try { refHost = ref ? new URL(ref).hostname.replace(/^www\./, '') : ''; } catch (e) {}
		// tenta extrair keyword de busca do referrer (Google não passa mais, mas Bing/outros às vezes sim)
		var kw = '';
		try {
			var m = ref.match(/[?&](q|p|query)=([^&]+)/);
			if (m) kw = decodeURIComponent(m[2].replace(/\+/g, ' '));
		} catch (e) {}
		j = {
			started: now,
			entry_page: location.pathname,
			entry_referrer: refHost,
			entry_keyword: kw,
			utm: location.search || '',
			pages: []
		};
	}

	// fecha o tempo da página anterior (se houve) — usa o carimbo do pageshow anterior
	if (j._openPath && j._openAt) {
		var secs = Math.round((now - j._openAt) / 1000);
		if (secs >= 0 && secs < 3600) { // ignora abas esquecidas abertas horas
			var last = j.pages[j.pages.length - 1];
			if (last && last.path === j._openPath && !last.seconds) {
				last.seconds = secs;
			}
		}
	}

	// registra a página atual
	if (j.pages.length < MAX_PAGES) {
		j.pages.push({ path: location.pathname, title: (document.title || '').slice(0, 90), at: now });
	}
	j._openPath = location.pathname;
	j._openAt = now;
	j.last = now;
	save(j);

	// quando a pessoa sai da página, grava o tempo gasto
	function closePage() {
		var cur = load();
		if (!cur || cur._openPath !== location.pathname) return;
		var s = Math.round((Date.now() - cur._openAt) / 1000);
		if (s >= 0 && s < 3600) {
			var last = cur.pages[cur.pages.length - 1];
			if (last && last.path === location.pathname) last.seconds = s;
		}
		cur.last = Date.now();
		save(cur);
	}
	window.addEventListener('pagehide', closePage);
	window.addEventListener('beforeunload', closePage);
	document.addEventListener('visibilitychange', function () {
		if (document.visibilityState === 'hidden') closePage();
	});

	// API pública: o form e o Calendly chamam isto na hora de identificar a pessoa
	window.upJourney = {
		get: function () {
			var cur = load() || j;
			closePage(); // garante o tempo da página atual
			cur = load() || cur;
			return {
				entry_page: cur.entry_page,
				entry_referrer: cur.entry_referrer,
				entry_keyword: cur.entry_keyword,
				utm: cur.utm,
				started: cur.started,
				pages: (cur.pages || []).map(function (p) {
					return { path: p.path, title: p.title, seconds: p.seconds || 0 };
				})
			};
		},
		// versão compacta pra caber em campos/URLs: "spousal(8m)>processing(3m)"
		summary: function () {
			var d = this.get();
			return d.pages.map(function (p) {
				var slug = p.path.replace(/^\/(blog\/|permanent-residence\/)?/, '').replace(/\/$/, '') || 'home';
				var m = Math.floor(p.seconds / 60), s = p.seconds % 60;
				var t = m ? (m + 'm' + (s ? s + 's' : '')) : (p.seconds + 's');
				return slug.slice(0, 30) + '(' + t + ')';
			}).join(' > ');
		}
	};
})();
