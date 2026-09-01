# Tips, Tricks, and Traps

Practical lessons for this POC. Every trap here corresponds to a disqualifying finding or a failed acceptance step — reading this list is cheaper than hitting them.

## Traps (these end bids)

1. **Showing "queued" before the write finishes.** The UI may only confirm an observation after it is durably saved with its operation ID. Kill-point tests C4/C5/C7 exist precisely to catch optimistic UIs. Persist first, confirm second.
2. **Minting a new operation ID on retry.** One observation, one operation ID, forever — across retries, restarts, re-login, and resubmission. A regenerated ID turns a safe replay into a duplicate application (script D4/D5), which is a disqualifying finding.
3. **Rendering "acknowledged" as "accepted".** The server saying "I received it" (transport) and the server saying "I applied it" (domain outcome) are different fields in the same response. Displaying the first as the second misleads the user and fails D2/D3.
4. **Hardcoding certified values.** The issuer name, engine identity, certificate ID, and issued time come from the API payload, every time. A constant in your config that "happens to match" is exactly the defect the review looks for.
5. **Letting logout clear the queue.** An expired session (`401 AUTH_EXPIRED`) is a transport condition, not a data-loss event. Queued observations survive it untouched (C6).
6. **Treating a stale determination as current.** After the mock reports `SUPERSEDED`, the cached result must be visibly demoted. "I didn't refresh so I still show the old one as current" fails E1/E2.

## Tricks (these save days)

7. **Run `node scripts/dry-run.mjs` before writing any code.** It proves the mock, the fixtures, and your Node environment in under a minute. If it fails, fix the environment — your client is not the problem yet.
8. **Wire the supersession header on day one.** `X-Floodcaster-Mock-Determination-State: superseded` is one request header; retrofitting stale-cache UI in the last two days is where bids die.
9. **Make process-kill part of your dev loop.** Force-stop the app after every meaningful change, not just during the final script run. Durability bugs found early are trivial; found late they are rewrites.
10. **Read the failure catalog in the README before the happy path.** The scoring weight is in the failure behavior, not in how pretty the map is.
11. **Use the layer index digests.** `/mobile/v1/layers` pins sha256 for every layer, and the bootstrap pins the map pack digest. Verifying them costs a few lines and gives you free integrity evidence for your submission.
12. **Do the day-2 restatement seriously.** Explaining the assignment back in your own words is not a formality — it is how a wrong mental model gets caught while it costs hours instead of weeks. If your restatement comes back corrected, you just saved your bid.
13. **Ask early.** Questions go in your Fiverr conversation (kit bugs can also be GitHub issues); answers that help everyone get published in the FAQ. One good question on day 2 is worth more than three days of guessing — and it never counts against you.

## Tips (worth knowing)

14. **The stress layer is a measurement, not a dare.** `flood-stress-3x` is ~27 MB of GeoJSON. Rendering it poorly with honest numbers and a named failure point is a *passing* result; claiming "smooth" without numbers is not. Consider rendering strategies (feature filtering by zoom, incremental loading) but report whatever is true.
15. **Mobile storage can be evicted.** WebView/browser storage (IndexedDB, OPFS, caches) may be cleared by the OS under pressure. If your stack offers persistent-storage requests or documented durability behavior, use them and report the limits you observed — that report is deliverable material.
16. **Report environment limitations by name.** A step your emulator or remote session cannot express (true airplane mode, OS force-stop) is reported as a named limitation, not silently skipped. Named limitations are normal; silent substitutions are disqualifying.
17. **The reference SPA is a workflow example, not a starter kit.** Reuse from it is welcome where justified (that is deliverable 8, the reuse matrix), but nothing obliges you to build on React/Leaflet.
18. **Budget the last two days for the script and the paperwork.** The acceptance script run, recordings, measurements, and the response template are half the deliverable. Code that works with missing evidence is an incomplete submission.
