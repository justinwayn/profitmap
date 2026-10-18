/* ProfitMap deploy-time configuration.
 *
 * HOW TO GO LIVE (Justin):
 *  1. Stripe Dashboard → Payment Links → create a $49 one-time link for
 *     "Niche Deep-Dive Report". Paste the URL below as paymentLinkUrl.
 *  2. Plausible → add your site → paste its domain below as plausibleDomain.
 *     Leave as "REPLACE_ME" to run the site without analytics.
 *
 * Never commit real URLs/tokens to a different environment's copy — this
 * file ships with the site, so edit it at deploy time (or per-environment).
 */
window.PROFITMAP_CONFIG = {
  paymentLinkUrl: "https://buy.stripe.com/cNi28r7Fa2j5aQw1oQdZ604",   // ProfitMap Niche Deep-Dive $49 one-time (wired 2026-10-18)
  profitmapProLinkUrl: "https://buy.stripe.com/cNifZh5x2f5R6Agd7ydZ605",   // ProfitMap Pro $12/mo (created 2026-10-18)
  plausibleDomain: "REPLACE_ME"                          // e.g. "profitmap.example.com"
};
