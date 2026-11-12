import http from "k6/http";
import { check, group, sleep } from "k6";
import { Trend } from "k6/metrics";

// Darwinbox careers portal (QA) — API load test.
// Replays the API calls the Angular app makes for one candidate journey, in the
// same order and with the same payloads, as captured from the live page:
//   page load → search → clear search → sort → filter → load more → job details.
//
// Auth: optional. Set DBX_TOKEN to send `Authorization: Bearer <token>`; never
// commit a token. Profile: PROFILE=smoke|load (default smoke); VUS / DURATION
// tune the load profile.

const BASE = __ENV.DBX_BASE || "https://ta2.qa.darwinbox.io";
const CO = __ENV.DBX_COMPANY || "main";
const PROFILE = __ENV.PROFILE || "smoke";
const VUS = Number(__ENV.VUS || 5);
const DURATION = __ENV.DURATION || "2m";

export const options = {
  scenarios:
    PROFILE === "smoke"
      ? { smoke: { executor: "shared-iterations", vus: 1, iterations: 1 } }
      : {
          load: {
            executor: "ramping-vus",
            startVUs: 0,
            stages: [
              { duration: "30s", target: VUS }, // ramp up
              { duration: DURATION, target: VUS }, // hold
              { duration: "15s", target: 0 }, // ramp down
            ],
            gracefulRampDown: "30s",
          },
        },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    checks: ["rate>0.99"],
    "http_req_duration{step:page_load}": ["p(95)<8000"],
    "http_req_duration{step:search}": ["p(95)<3000"],
    "http_req_duration{step:jobs_list}": ["p(95)<3000"],
    "http_req_duration{step:job_details}": ["p(95)<3000"],
  },
  summaryTrendStats: ["min", "med", "avg", "p(90)", "p(95)", "p(99)", "max"],
};

const pageLoadTime = new Trend("journey_page_load_apis", true);
const jobDetailsTime = new Trend("journey_job_details_apis", true);

const headers: Record<string, string> = {
  accept: "application/json, text/plain, */*",
  "content-type": "application/json",
  origin: BASE,
  referer: `${BASE}/ms/candidatev2/${CO}/careers/allJobs`,
};
if (__ENV.DBX_TOKEN) headers.authorization = `Bearer ${__ENV.DBX_TOKEN}`;

const api = (path: string) => `${BASE}${path}${path.includes("?") ? "&" : "?"}companyId=${CO}`;
const tag = (step: string, name: string) => ({ headers, tags: { step, name } });

const AMPLIFY_PAGES = [
  "CANDIDATEJOBDETAILSPAGE",
  "CANDIDATEOFFERLETTER",
  "CANDIDATEPREOFFERDETAIL",
  "CANDIDATESEDITPROFILE",
  "CANDIDATESPROFILE",
  "CAREERSPAGEAPPLIEDJOBS",
  "CAREERSPAGECANDIDATEJOBAPPLICATION",
];

// The common bootstrap calls every candidate page makes (fired in parallel by the app).
function bootstrapRequests(step: string) {
  const reqs: Parameters<typeof http.batch>[0] = [
    ["GET", api("/ms/candidateapi/getCompanyConfig?is_preview=false"), null, tag(step, "getCompanyConfig")],
    ["GET", api("/ms/candidateapi/groupcompanycareersetting"), null, tag(step, "groupcompanycareersetting")],
    ["GET", api("/ms/candidateapi/getSpotlightToken"), null, tag(step, "getSpotlightToken")],
    ["GET", api("/ms/dboxuilibrary/getSpotlightConfig"), null, tag(step, "getSpotlightConfig")],
    ["GET", api("/ms/candidatev2/assets/langs/en.json"), null, tag(step, "langs_en.json")],
    [
      "POST",
      api("/TranslationApi/GetTranslations"),
      JSON.stringify({ language: "en", category: "candidate-web-v2-service" }),
      tag(step, "GetTranslations"),
    ],
  ];
  for (const p of AMPLIFY_PAGES) {
    reqs.push([
      "POST",
      `${BASE}/ms/candidateapi/candidate/getAmplifyScript`,
      JSON.stringify({ applied_page: p, get_all_script_keys: 1, get_amplify_script_details_for_candidate: true }),
      tag(step, "getAmplifyScript"),
    ]);
  }
  return reqs;
}

const allJobs = (body: object, step = "jobs_list") =>
  http.post(api("/ms/candidateapi/job/alljobs"), JSON.stringify({ companyId: CO, limit: 10, ...body }), tag(step, "alljobs"));

const ok = (r: { status: number }) => r.status === 200;

export default function () {
  let jobIds: string[] = [];
  let deptId: string | undefined;

  group("01 page load (allJobs)", () => {
    const t = Date.now();
    const res = http.batch([
      ...bootstrapRequests("page_load"),
      ["POST", api("/ms/candidateapi/job/newfilters"), JSON.stringify({ companyId: CO, id: [] }), tag("page_load", "newfilters")],
      ["POST", api("/ms/candidateapi/job/alljobs"), JSON.stringify({ companyId: CO, page: 1, sort_option: "new", limit: 10 }), tag("page_load", "alljobs")],
    ]);
    pageLoadTime.add(Date.now() - t);
    check(res, { "page load: all APIs 200": (rs) => rs.every(ok) });
    const jobs = res[res.length - 1];
    try {
      jobIds = (jobs.json("data") as { id: string }[]).map((j) => j.id);
    } catch {
      jobIds = [];
    }
    check(jobs, { "page load: jobs returned": () => jobIds.length > 0 });
    try {
      const depts = res[res.length - 2].json("message.department") as { _id: string }[] | undefined;
      deptId = depts && depts.length ? depts[Math.floor(Math.random() * depts.length)]._id : undefined;
    } catch {
      deptId = undefined;
    }
  });
  sleep(3);

  group("02 search 'Test'", () => {
    const r = http.batch([
      ["POST", api("/ms/candidateapi/search"), JSON.stringify({ search_text: "Test", companyId: CO, id: [] }), tag("search", "search")],
      ["POST", api("/ms/candidateapi/job/newfilters"), JSON.stringify({ companyId: CO, id: [] }), tag("search", "newfilters")],
    ]);
    check(r, { "search: 200": (rs) => rs.every(ok) });
  });
  sleep(2);

  group("03 clear search", () => {
    const r = http.batch([
      ["POST", api("/ms/candidateapi/search"), JSON.stringify({ search_text: "", companyId: CO, id: ["free_Test"] }), tag("search", "search")],
      ["POST", api("/ms/candidateapi/job/alljobs"), JSON.stringify({ companyId: CO, page: 1, sort_option: "new", limit: 10, id: [] }), tag("jobs_list", "alljobs")],
    ]);
    check(r, { "clear search: 200": (rs) => rs.every(ok) });
  });
  sleep(2);

  group("04 sort Oldest First", () => {
    check(allJobs({ page: 1, sort_option: "old", id: [] }), { "sort: 200": ok });
  });
  sleep(2);

  group("05 filter by department", () => {
    const r = allJobs({
      page: 1,
      sort_option: "old",
      id: [],
      department: deptId ? [deptId] : [],
      location: [],
      work_mode: [],
      capabilities: [],
      job_tags: [],
      functional_area: [],
      country: [],
      legal_entities: [],
    });
    check(r, { "filter: 200": ok });
  });
  sleep(2);

  group("06 load more (page 2)", () => {
    check(allJobs({ page: 2, sort_option: "new" }), { "load more: 200": ok });
  });
  sleep(3);

  group("07 job details", () => {
    const id = jobIds.length ? jobIds[Math.floor(Math.random() * jobIds.length)] : "5e611c61af9f0";
    const t = Date.now();
    const r = http.batch([
      ...bootstrapRequests("job_details"),
      ["GET", api(`/ms/candidateapi/job/${id}`), null, tag("job_details", "job_by_id")],
    ]);
    jobDetailsTime.add(Date.now() - t);
    check(r, { "job details: all APIs 200": (rs) => rs.every(ok) });
  });
  sleep(3);
}
