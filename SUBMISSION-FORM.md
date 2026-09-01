# POC Submission Form

Two parts on this page:

1. **What each deliverable means** — read this first, in plain words.
2. **The form** — copy it, fill it in, paste it into your Fiverr delivery message.

Keep form answers short. Detailed evidence goes in [ASSESSMENT-RESPONSE-TEMPLATE.md](ASSESSMENT-RESPONSE-TEMPLATE.md), which you also deliver.

## What each deliverable means, in plain words

| # | Name | What you actually give us |
| --- | --- | --- |
| 1 | Runnable client source | Your app's code. We must be able to build it and run it ourselves. |
| 2 | Build/run procedure | The exact commands to build and start your app, written step by step. If we type exactly what you wrote, the app must start. Also name the device or emulator you used. |
| 3 | Acceptance scenario | Proof that you did every step of [docs/ACCEPTANCE-TEST-SCRIPT.md](docs/ACCEPTANCE-TEST-SCRIPT.md), with the evidence (screenshots/recordings) each step asks for. |
| 4 | Automated tests | Tests that run with one command and prove three things: (a) a saved observation is still there after the app is killed; (b) the operation ID never changes, even after retries; (c) determinations and observations are shown clearly differently. Tell us the command to run them. |
| 5 | Screen recording | A video of your app's screen showing the main scenario and the app-kill tests. A phone screen recording or emulator recording is fine. |
| 6 | Measurements | Numbers, not opinions. How many seconds to start the app. How the map performs with our normal test layer and with the big 3× layer. How much storage the offline data uses. What happens when connection returns. |
| 7 | Dependency and license inventory | A list of every library and plugin you used: name, version, license (MIT, Apache, GPL, commercial...), and whether it costs money now or later. |
| 8 | SPA reuse matrix | A table about our example web app (the code in this repository's root). For each part of it, say one of: used as-is / changed it / rebuilt it / skipped it — and one line why. |
| 9 | Risk register | An honest list of problems and unknowns. What can this platform not do? What did you assume but not prove? What could break in production? Short bullet points are fine. |
| 10 | Next-stage price | Your own price and time estimate for building the real production app, as a separate quote. This is NOT part of the $200 — it is your offer for the next contract. |

## Submission checklist — do these in order

On your final day (Friday Sept 18, or earlier if you finish early):

1. [ ] Run `node scripts/dry-run.mjs` one last time. All 16 checks pass.
2. [ ] Run your own automated tests with one command. They pass.
3. [ ] Do the full acceptance script (parts A–F). Save every screenshot and recording it asks for.
4. [ ] Fill in every section of [ASSESSMENT-RESPONSE-TEMPLATE.md](ASSESSMENT-RESPONSE-TEMPLATE.md). Write your limitations honestly — a named limitation is normal; a hidden one is disqualifying.
5. [ ] Check the deliverable table above: all ten exist, and each has a real file path in your workspace (or ZIP).
6. [ ] Push your final commit to your workspace repository, or build the ZIP with the same folder layout.
7. [ ] Copy the final commit SHA (or the ZIP filename).
8. [ ] Fill in the form below and paste it into the Fiverr delivery message.
9. [ ] Press deliver on Fiverr before the end of the day, your local time.

**After you deliver:** we confirm we received it within 24 hours. If something is missing, or we cannot build and run your app from your own instructions, we tell you exactly what — before evaluation starts, not after. Results are announced Friday Sept 25.

## The form

```
FLOODCASTER MOBILE POC — SUBMISSION

Name / Fiverr username:
Date:

1. DELIVERY METHOD (mark one)
   [ ] My private workspace repository — final commit SHA:
   [ ] ZIP attached to this Fiverr delivery — filename:

2. HOW TO RUN IT
   The exact commands we should type:

3. TEST ENVIRONMENT
   Device or emulator (model/image):
   OS and version:
   RAM:
   WebView / browser engine version (if you know it):
   Node.js version used for the mock:

4. DRY-RUN RESULT
   Paste the last line of `node scripts/dry-run.mjs`:

5. WHERE IS EACH DELIVERABLE (file path or folder, one per line;
   the table above explains what each one means)
   1. App code:
   2. Build/run steps:
   3. Acceptance script evidence:
   4. Automated tests (and the command to run them):
   5. Screen recording:
   6. Measurements:
   7. Library and license list:
   8. Example-app reuse table:
   9. Risk list:
   10. Your price for the next stage:

6. ACCEPTANCE SCRIPT RESULT
   Parts fully passed (A–F):
   Steps you could not do in your environment (list step numbers and why):

7. QUESTIONS YOU ASKED
   Fiverr conversation and/or GitHub issue links (if any):

8. CONFIRMATIONS (mark each)
   [ ] Everything I changed or could not do is written down in the
       response template. Nothing is hidden.
   [ ] The library list includes everything, including paid or trial ones.
   [ ] My app never creates or fakes a Floodcaster determination;
       every certified value on screen comes from the API response.
```

A submission without the completed [ASSESSMENT-RESPONSE-TEMPLATE.md](ASSESSMENT-RESPONSE-TEMPLATE.md) is incomplete. A ZIP delivery should contain the same folder layout you would have pushed to GitHub, including the response template.
