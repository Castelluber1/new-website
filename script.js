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

// Import Features
document.querySelectorAll("[data-include]").forEach((el) => {
	const file = el.getAttribute("data-include");
	fetch(file)
		.then((resp) => resp.text())
		.then((data) => (el.innerHTML = data))
		.catch((err) => console.error("Erro ao incluir:", file, err));
});

// -Typewqriter

const typedSpan = document.getElementById("typed-word");
if (typedSpan) {
	const words = [
		"Move to",
		"Visit",
		"Study in",
		"Stay in",
		"Work in",
		"Immigrate to",
	];
	let wordIndex = 0;
	let letterIndex = 0;
	let typing = true;
	function typeLoop() {
		const currentWord = words[wordIndex];
		if (typing) {
			if (letterIndex <= currentWord.length) {
				typedSpan.textContent = currentWord.substring(0, letterIndex);
				letterIndex++;
				setTimeout(typeLoop, 120);
			} else {
				typing = false;
				setTimeout(typeLoop, 1600);
			}
		} else {
			if (letterIndex >= 0) {
				typedSpan.textContent = currentWord.substring(0, letterIndex);
				letterIndex--;
				setTimeout(typeLoop, 60);
			} else {
				typing = true;
				wordIndex = (wordIndex + 1) % words.length;
				setTimeout(typeLoop, 200);
			}
		}
	}
	typeLoop();
}
