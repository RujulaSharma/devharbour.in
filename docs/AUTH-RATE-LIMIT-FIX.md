# Authentication burst rate-limit correction

The reported screenshot is the Create Account form returning HTTP 429. Before this fix, signup was limited to 20 requests/15 minutes and login to 15/15 minutes per Express-visible IP. With trust proxy unset behind Render/Vercel, that address can represent a shared proxy. OTP sending also used an IP-wide 100/hour limit. This explains a plausible cross-user lockout, although the exact rejected production request and Render's private logs were not available for confirmation.

Changes:
- Account-specific credential keys run after JSON parsing. SHA-256 hashes of canonical login/email identifiers are used in memory, never raw passwords.
- Login: 15 failed attempts/15 minutes per identifier; successful responses do not consume that budget.
- Signup: five attempts/15 minutes per email. Other emails have independent budgets.
- A separate coarse 1,500 attempts/15 minutes per observed source protects authentication throughput. The general API overload guard is 3,000/minute per observed source. These are deliberately coarse guards because proxy source addresses may be shared; they are not precise per-visitor quotas.
- OTP transport limiter is per authenticated user (10/hour). Existing persistent database controls remain stricter: five sends/hour, one-minute resend delay, five incorrect codes and ten-minute expiry.
- JSON rate-limit errors include retryAfter and Retry-After. The account form displays an estimated wait.
- No blanket trust of forwarded IP headers was added. Proper deployment-specific proxy attribution remains a separate hardening task. In-memory middleware limits reset on restart and do not synchronize multiple instances; persistent OTP limits remain database-backed.

Validation: 30 isolated security/email tests passed, including 25 signup identifiers behind the same source and continued repeated-account throttling. Type-check, lint and build passed. No production signup/login/OTP attempts or database writes were made for validation. Deploy the backend on Render and frontend feedback on Vercel; do not claim production resolution until affected users retry after deployment.

Sources reviewed: https://render.com/articles/how-render-handles-ddos-attacks and https://express-rate-limit.github.io/ERR_ERL_UNEXPECTED_X_FORWARDED_FOR/ and https://vercel.com/docs/headers/request-headers
