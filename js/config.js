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
  paymentLinkUrl: "https://buy.stripe.com/REPLACE_ME",   // e.g. "https://buy.stripe.com/3cs6oK..."
  plausibleDomain: "REPLACE_ME"                          // e.g. "profitmap.example.com"
};
