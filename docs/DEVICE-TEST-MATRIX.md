# Device and OS Test Matrix

Contractor results are comparable only if measured on a frozen device set. Status: PROPOSED — Floodcaster confirms or amends before the paid milestone starts. Contractors who cannot access an exact device substitute the closest equivalent and record the substitution; unreported substitution invalidates the comparison.

## Required (full `ACCEPTANCE-TEST-SCRIPT.md` run on each)

| Slot | Device class | OS floor | Rationale |
| --- | --- | --- | --- |
| iOS-mid | iPhone 13 / SE 3rd gen class | iOS 16 | Common field-issued tier, not current flagship |
| Android-mid | Pixel 6a / Galaxy A54 class | Android 13 | Mid-tier GPU and memory pressure are the realistic constraint |

## Recommended (F2/F3 performance probe at minimum)

| Slot | Device class | OS floor | Rationale |
| --- | --- | --- | --- |
| Android-low | 3–4 GB RAM class device | Android 12 | Exposes memory behavior the mid tier hides |
| Tablet | iPad 9th gen or Android tablet class | current − 2 | Layout and map-surface scaling check |

## Reporting per device

Record: exact model, OS version, total RAM, free storage at test start, battery-saver state (must be off unless testing it), and network type used for the online parts. Emulators/simulators may be used during development but no acceptance evidence may come from them; every scripted step's evidence must originate on physical hardware.

## Environment conditions

- Offline steps: OS airplane mode on physical hardware.
- Process kills: OS-level force stop.
- Auth expiry: the mock's expiry simulation, not a wall-clock wait, unless the wait is recorded.
