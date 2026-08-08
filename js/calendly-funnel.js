/**
 * calendly-funnel.js
 *
 * Mede o MEIO do funil de agendamento, que hoje e cego.
 *
 * O PROBLEMA
 * ----------
 * Hoje so existem as duas pontas:
 *     page_view  ->  [??????????]  ->  consultation_booked
 * Nao da pra saber quantos abrem o overlay do Calendly e desistem, nem em que
 * passo desistem. Este arquivo preenche o meio.
 *
 * O FUNIL COMPLETO
 * ----------------
 *   1 calendly_overlay_opened     abriu o overlay            (nosso, via click)
 *   2 calendly_profile_viewed     carregou a pagina           (Calendly)
 *   3 calendly_eventtype_viewed   viu o tipo de consulta      (Calendly)
 *   4 calendly_datetime_selected  escolheu data e hora        (Calendly)
 *   5 consultation_booked         agendou                     (Calendly)
 *   X calendly_abandoned          fechou sem agendar          (nosso, via DOM)
 *
 * Os passos 2-4 sao postMessages que o Calendly JA MANDA pra pagina; ninguem
 * escutava. Verificado na doc oficial de embed avancado (2026-08-08).
 *
 * COMO "FECHOU SEM AGENDAR" E DETECTADO
 * -------------------------------------
 * O Calendly NAO avisa quando o overlay fecha. Nao existe evento pra isso.
 * Entao observamos o DOM: o widget insere .calendly-overlay no body e remove
 * quando fecha (botao X, clique fora, ou Esc). Um MutationObserver pega a
 * remocao. Se nesse momento a pessoa nao tinha agendado, e abandono, e a gente
 * registra ATE QUE PASSO ela chegou - que e a informacao que diz onde otimizar.
 *
 * LIMITES - ler antes de confiar no numero
 *   - Fechar a aba/navegar pra fora NAO remove o overlay via DOM, entao nao
 *     conta como abandono. O numero de abandono e um PISO, nao o total.
 *   - Se a pessoa reabre o overlay na mesma pagina, conta como nova sessao de
 *     funil (o estagio reseta). Isso e proposital: cada tentativa e uma.
 *   - Nao ha de-duplicacao entre abas.
 */
(function () {
	'use strict';

	if (typeof gtag !== 'function') return;

	// Em qual passo a pessoa esta nesta tentativa. 0 = nem abriu.
	var stage = 0;
	var STAGE_NAME = {
		1: 'overlay_opened',
		2: 'profile_viewed',
		3: 'eventtype_viewed',
		4: 'datetime_selected',
		5: 'booked'
	};
	var booked = false;
	var openedAt = 0;

	/** slug curto da pagina, pra casar com booking_source do TRACKING.md */
	function pageSlug() {
		var p = window.location.pathname;
		if (p.indexOf('/pt/') === 0 || p.indexOf('/pt') === 0) return 'consultation-pt';
		return 'consultation-en';
	}

	function send(eventName, extra) {
		var payload = { booking_source: pageSlug() };
		for (var k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) payload[k] = extra[k];
		gtag('event', eventName, payload);
	}

	function advance(to) {
		if (to > stage) stage = to;
	}

	// ── Passo 1: abriu o overlay ──────────────────────────────────────────
	// Envolve showPopupWidget porque e assim que as duas paginas abrem.
	function wrapOpen() {
		if (!window.Calendly || window.Calendly.__funnelWrapped) return false;
		var orig = window.Calendly.showPopupWidget;
		if (typeof orig !== 'function') return false;
		window.Calendly.showPopupWidget = function () {
			// nova tentativa: zera o estado
			stage = 0; booked = false; openedAt = Date.now();
			advance(1);
			send('calendly_overlay_opened');
			return orig.apply(window.Calendly, arguments);
		};
		window.Calendly.__funnelWrapped = true;
		return true;
	}
	if (!wrapOpen()) {
		var tries = 0;
		var t = setInterval(function () {
			if (wrapOpen() || ++tries > 100) clearInterval(t);
		}, 100);
	}

	// ── Passos 2-5: o que o Calendly posta ────────────────────────────────
	window.addEventListener('message', function (e) {
		if (!e.data || typeof e.data.event !== 'string') return;
		if (e.data.event.indexOf('calendly.') !== 0) return;

		switch (e.data.event) {
			case 'calendly.profile_page_viewed':
				advance(2); send('calendly_profile_viewed'); break;
			case 'calendly.event_type_viewed':
				advance(3); send('calendly_eventtype_viewed'); break;
			case 'calendly.date_and_time_selected':
				advance(4); send('calendly_datetime_selected'); break;
			case 'calendly.event_scheduled':
				advance(5); booked = true;
				// consultation_booked ja e disparado pelo listener da propria
				// pagina (TRACKING.md sec.3). Aqui so marcamos o estagio, pra
				// nao contar a conversao duas vezes.
				break;
		}
	});

	// ── Abandono: overlay saiu do DOM sem ter agendado ────────────────────
	function watchForClose() {
		var obs = new MutationObserver(function (muts) {
			for (var i = 0; i < muts.length; i++) {
				var removed = muts[i].removedNodes;
				for (var j = 0; j < removed.length; j++) {
					var n = removed[j];
					if (n.nodeType !== 1) continue;
					var isOverlay = n.classList && n.classList.contains('calendly-overlay');
					if (!isOverlay && n.querySelector) isOverlay = !!n.querySelector('.calendly-overlay');
					if (!isOverlay) continue;

					if (stage > 0 && !booked) {
						send('calendly_abandoned', {
							abandoned_at: STAGE_NAME[stage] || ('stage_' + stage),
							seconds_open: openedAt ? Math.round((Date.now() - openedAt) / 1000) : 0
						});
					}
					stage = 0; booked = false; openedAt = 0;
				}
			}
		});
		obs.observe(document.body, { childList: true, subtree: true });
	}
	if (document.body) watchForClose();
	else document.addEventListener('DOMContentLoaded', watchForClose);
})();
