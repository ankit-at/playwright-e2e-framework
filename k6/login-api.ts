import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate } from "k6/metrics";

// Custom metrics
const loginDuration = new Trend("login_duration", true);
const loginSuccess = new Rate("login_success");

// Load profile: ramp 0->10 VUs, hold, ramp down.
export const options = {
  stages: [
    { duration: "10s", target: 10 }, // ramp up
    { duration: "20s", target: 10 }, // steady load
    { duration: "5s", target: 0 }, // ramp down
  ],
  // Pass/fail gates — k6 exits non-zero if any threshold is breached (great for CI).
  thresholds: {
    http_req_duration: ["p(95)<2000"], // 95% of logins under 2s
    http_req_failed: ["rate<0.01"], // <1% network errors
    login_success: ["rate>0.99"], // >99% logins pass all checks
  },
};

const URL = "https://rahulshettyacademy.com/api/ecom/auth/login";
// Credentials come from env only (k6 reads -e RSA_EMAIL=... or the shell env).
const payload = JSON.stringify({
  userEmail: __ENV.RSA_EMAIL,
  userPassword: __ENV.RSA_PASSWORD,
});
const params = { headers: { "Content-Type": "application/json" } };

export default function () {
  const res = http.post(URL, payload, params);
  loginDuration.add(res.timings.duration);

  const ok = check(res, {
    "status is 200": (r) => r.status === 200,
    "has token": (r) => r.json("token") !== undefined,
    "message is Login Successfully": (r) => r.json("message") === "Login Successfully",
  });
  loginSuccess.add(ok);

  sleep(1); // think time between iterations
}
