/**
 * calendly-attribution.js
 *
 * Stamps the GA4 identity onto every Calendly booking so a row in the Calendly
 * export can be joined back to a GA4 session.
 *
 * WHY THIS EXISTS
 * ---------------
 * GA4 only sees bookings that start on this site. Calendly sees every booking
 * but knows nothing about GA4. Neither side alone can answer "which visit
 * produced this consultation?". This carries the GA4 client/session id across
 * the boundary using UTM fields, which Calendly persists into its CSV export.
 *
 * HOW IT WORKS
 * ------------
 * Calendly's widget builds the iframe URL in this order (later wins):
 *     {embed_domain, embed_type}
 *       -> getUtmParamsFromHost()   // reads utm_* from THIS page's URL
 *       -> getParamsFromUrl()       // params on the URL we pass in  <-- us
 *       -> getParamsFromOptions()
 * Verified by reading assets.calendly.com/assets/external/widget.js, 2026-08-07.
 *
 * Therefore anything we put on the widget URL OVERRIDES the page's real UTMs.
 * We deliberately write ONLY to utm_content and utm_term, leaving
 * utm_source / utm_medium / utm_campaign to be forwarded from the page so real
 * channel attribution (instagram, google, ...) still lands in the export.
 *
 * FIELD MAP  (see TRACKING.md section 8)
 *   utm_content  cid.<clientId>~sid.<sessionId>   GA4 identity  <- the join key
 *   utm_term     <booking page path>              which page opened the widget
 *   utm_source   untouched                        real traffic source
 *   utm_medium   untouched
 *   utm_campaign untouched
 *
 * LIMITS — read before trusting a number
 *   - Only covers bookings that START on this site. A booking from a Calendly
 *     link in a DM/email never loads this file and stays unattributed. That is
 *     a structural gap, not a bug; closing it needs the Calendly webhook ->
 *     Measurement Protocol phase (TRACKING.md section 8, phase 2).
 *   - clientId is per-browser. Same person on phone and laptop = two ids.
 *   - If the visitor blocks cookies there is no _ga cookie; we send nothing
 *     rather than a fake id, so the row is blank (honest, not wrong).
 */
(function () {
	'use strict';

	/** GA4 client id, from the first-party _ga cookie: GA1.1.XXXXXXX.YYYYYYY */
	function getClientId() {
		var m = document.cookie.match(/_ga=GA\d\.\d\.(\d+\.\d+)/);
		return m ? m[1] : null;
	}

	/**
	 * GA4 session id, from the per-property cookie _ga_<MEASUREMENT_ID minus G->.
	 * Format: GS1.1.<sessionId>.<n>.<...> — we want the first numeric segment.
	 */
	function getSessionId() {
		var m = document.cookie.match(/_ga_[A-Z0-9]+=GS\d\.\d\.(\d+)/);
		return m ? m[1] : null;
	}

	/** cid.123.456~sid.789 — omits either half rather than inventing a value. */
	function buildIdentity() {
		var parts = [];
		var cid = getClientId();
		var sid = getSessionId();
		if (cid) parts.push('cid.' + cid);
		if (sid) parts.push('sid.' + sid);
		return parts.length ? parts.join('~') : null;
	}

	/**
	 * Append our params to a Calendly URL without clobbering anything already
	 * on it (hide_gdpr_banner etc) and without touching source/medium/campaign.
	 */
	function decorate(url) {
		try {
			var u = new URL(url, window.location.href);
			if (!/(^|\.)calendly\.com$/.test(u.hostname)) return url;

			var identity = buildIdentity();
			if (identity && !u.searchParams.has('utm_content')) {
				u.searchParams.set('utm_content', identity);
			}
			if (!u.searchParams.has('utm_term')) {
				u.searchParams.set('utm_term', window.location.pathname);
			}
			return u.toString();
		} catch (e) {
			return url; // never break a booking over analytics
		}
	}

	// ── Wrap Calendly.showPopupWidget so every existing call site is covered ──
	// The inline onclick handlers across the site call this directly; wrapping
	// means we do not have to edit (and keep in sync) 12 separate call sites.
	function wrap() {
		if (!window.Calendly || window.Calendly.__attributionWrapped) return false;

		['showPopupWidget', 'initPopupWidget', 'initInlineWidget'].forEach(function (fn) {
			var orig = window.Calendly[fn];
			if (typeof orig !== 'function') return;
			window.Calendly[fn] = function (arg) {
				try {
					if (typeof arg === 'string') {
						arg = decorate(arg);
					} else if (arg && typeof arg === 'object' && arg.url) {
						arg = Object.assign({}, arg, { url: decorate(arg.url) });
					}
				} catch (e) { /* fall through with the original arg */ }
				return orig.call(window.Calendly, arg);
			};
		});

		window.Calendly.__attributionWrapped = true;
		return true;
	}

	// widget.js loads async, so poll briefly until it appears.
	if (!wrap()) {
		var tries = 0;
		var t = setInterval(function () {
			if (wrap() || ++tries > 100) clearInterval(t); // give up after ~10s
		}, 100);
	}

	// Inline embeds (data-url) are rendered before we can wrap; decorate them.
	document.addEventListener('DOMContentLoaded', function () {
		document.querySelectorAll('.calendly-inline-widget[data-url]').forEach(function (el) {
			el.setAttribute('data-url', decorate(el.getAttribute('data-url')));
		});
	});
})();
