# SoulSonus — the ledger

**One file. Everything done, everything to do, in order.**

If you are an agent working in this repository, this is the only place you
take work from and the only place you record it. Do not open a second plan
file, a second defect list or a second roadmap. That is how the last attempt
became impossible to follow.

---

## 0. How this repository is worked

Five rules. They are not style preferences; they are why this repository
exists separately from the last one.

1. **One step at a time.** The work order in §2 is numbered. Exactly one step
   is IN PROGRESS. Nothing else is touched while it is open — not a tidy-up,
   not a rename, not "while I was in there". A defect noticed mid-step gets
   written into §3 and left alone.

2. **A step is not done until it is seen working.** "I wrote the code that
   should do this" and "I watched this happen" are different claims. Only the
   second closes a step, and §5 records which one was made.

3. **Nothing is invented.** No number on screen that nothing measured. No
   fallback that manufactures a result when the real one is unavailable — say
   it is unavailable. This rule has already been broken three times in this
   codebase and each one is in §3.

4. **Every step ends in a commit**, and the commit message says what changed
   and what was verified. §5 gets one line with the hash.

5. **Scope is the owner's.** A step that turns out to need something outside
   its stated scope stops and asks. It does not widen itself.

---

## 1. Where this stands

| | |
|---|---|
| Baseline | `e047bae` — the studio export, unpacked, unedited |
| Origin | Google AI Studio export, 46 files, 14,885 lines |
| Stack | React 19, Vite 8, Tailwind 4, TypeScript |
| Runs | `npm install` then `npm run dev` → `http://127.0.0.1:3000` |
| Backend | none, and none is needed yet — see §2 step 4 |

**What is genuinely working today**, verified in the source:

- Real microphone capture via `MediaRecorder`, with mimeType negotiation
- Real persistence: IndexedDB plus a `localStorage` fallback, SHA-256 digests
  over asset bytes (`src/services/assetStore.ts`)
- Clips carry `assetId`, so a clip can point at real audio
- Web Audio synth voices for the piano and the drum machine, and a step
  transport with a playhead callback
- Real waveform RMS and autocorrelation pitch estimation over decoded samples

**What is representation rather than function:** Basic Pitch, ACE-Step,
Demucs, Whisper, the capability registry and the 11-stage pipeline are UI and
types. No provider runs. There are zero `fetch` calls in the application.

---

## 2. The work order

One step IN PROGRESS at a time. Steps are ordered so each one makes the next
possible; do not reorder without the owner saying so.

### Step 0 — The export could not install · **DONE** `2026-09-17`

Not planned; found on the first `npm install`. `esbuild@^0.25.0` sat in
devDependencies against `vite@8.3.0`, which wants `^0.27.0 || ^0.28.0`.
Nothing in the project imports esbuild — the build is `vite build` — so the
package was removed rather than pinned. `express`, `dotenv`, `tsx`,
`autoprefixer` and `@google/genai` are also unused and were **left alone**;
they are §3.8, not this step.

### Step 1 — Stop the studio manufacturing performances · **DONE** `2026-09-17`

The highest-priority defect in the codebase (§3.1). When the microphone fails,
the studio synthesizes a WAV, hashes it, and files it as the creator's own
original work.

- Remove `synthesizeModeWavBlob` and its call site entirely.
- `startRealRecording` returns false when no recorder started.
- `stopRealRecording` returns a failure, never a substitute blob.
- Creator Training and the Booth say the microphone did not open, and offer to
  try again.

**Done when:** the microphone is denied in a browser, and the studio says so
and writes nothing. No asset is created.

### Step 2 — Make the analysis report only what it measured · **DONE** `2026-09-18`

§3.2. The autocorrelation is real; three things around it are not.

- `dominantKey` is a hardcoded `'C Minor (Cm9)'`. Either compute it or do not
  claim it.
- The "default notes if quiet" branch invents C3/Eb3/G3 and presents them as
  detected. A quiet take detected nothing; that is the answer.
- The `catch` returns a fabricated four-note analysis. A failed analysis is a
  failed analysis.

**Done when:** a silent recording produces an asset with no notes and a stated
reason, and nothing anywhere shows a key that was not derived.

**Closed.** Verified in the browser against three blobs built in the page:
silence reads no notes and states the measured peak against the floor;
undecodable bytes say so; a tone reports the notes it found. `dominantKey` is
null in all three — nothing establishes a key yet, and it says so instead of
answering "C Minor (Cm9)" as it did for every take before. The import path now
reads the file it imports rather than filing every one as 4.0 seconds at
48 kHz with the same eight waveform points.

### Step 3 — Prove the HUM slice end to end · **NEXT**

The first real vertical slice, and the one that forces the foundation to be
real. No new features — this step only proves what steps 1 and 2 left.

Hum → asset bytes → SHA-256 → IndexedDB → My Sounds entry → asset-backed clip
on the right track → **reload the browser** → everything still there and the
audio still plays.

**Done when:** that sequence is watched happening in a browser, with the
reload, and §5 records it as watched rather than written.

### Step 4 — Basic Pitch, in the browser

Replace the eight-slice autocorrelation with the real model. It is a 232 KB
ONNX file on `onnxruntime-web`; it needs no server, no GPU and no Python.

**Done when:** a hummed melody returns note events that match what was hummed,
judged by the owner's ear (Amendment B.v), and the studio still works with the
model absent.

### Step 5 — The mix desk reads the project

§3.3 and §3.4. The desk builds eight hardcoded channels and animates its
meters with `Math.random()`.

**Done when:** adding a track adds a channel, and every meter traces to a
measurement or is not drawn.

### Step 6 — Capability and provider registry, with licences

Capabilities name the job, never the vendor. Providers advertise what they
satisfy and carry code licence, weight licence, commercial status,
attribution, model version, model hash, hardware and restrictions. A licence
nobody has read is `UNVERIFIED`, never a guess.

ACE-Step registers as six capabilities, not one: `text2music`, `cover`,
`repaint`, `extract`, `lego`, `complete`. Four of those preserve source
duration, which is what makes a four-bar request return four bars.

**Done when:** the registry panel reports what is actually registered, says
plainly that it describes rather than dispatches until it does, and no
provider without a read licence is marked cleared for release.

### Step 7 and beyond — not scheduled

Demucs, ACE-Step adapters, Whisper/WhisperX, BeatNet, session-player planning,
BGV. Each is a step of its own and none is started before step 6 closes.

---

## 3. Defect register

Verified in the source at the line given. **Do not fix one because you read
it here** — it is fixed by the step that owns it.

### 3.1 The studio manufactures performances · **CLOSED** by Step 1

`src/services/audioEngine.ts` — `startRealRecording` catches a `getUserMedia`
or `MediaRecorder` failure, warns *"using pristine synthetic capture"*, and
returns `true`. `stopRealRecording` then does:

```ts
if (!audioBlob || audioBlob.size === 0) {
  audioBlob = this.synthesizeModeWavBlob(mode, elapsedSeconds);
}
```

`synthesizeModeWavBlob` generates a genuine 16-bit PCM WAV — a melody in C
minor for HUM, kick transients for BEATBOX. `CreatorTrainingView.tsx` then
registers it in the immutable asset store with a SHA-256, `originType:
'creator_hum'`, a `provenanceSeedSignature`, tags including `'creator-roots'`
and descriptors reading `'Original Performance'` and `'Verified SHA-256'`.

**Resolved.** `synthesizeModeWavBlob` and its WAV encoder are deleted, the
simulated monitoring waveform is deleted, and the capture path returns a
discriminated union so no caller can reach a take that does not exist without
the compiler stopping them. A denied microphone used to produce a performance
the creator never gave,
signed as their original work. Voice Profile, My Sounds, rights and
SeedSignature all inherit it. It exists because the generator runs in an
iframe where permission can be refused and the demo had to survive — an
understandable motive, and the wrong trade for a platform whose product is
creator origin.

### 3.2 The analysis states things it did not measure · **CLOSED** by Step 2

`src/services/audioEngine.ts`, `analyzeAudioBlob`:

- `dominantKey: 'C Minor (Cm9)'` — a literal. Never computed, always returned.
- "Default notes if quiet" pushes C3, Eb3, G3 as `detectedNotes` when
  detection found nothing.
- `pitchContour` falls back to a literal array.
- The `catch` returns a fabricated four-note analysis with frequencies.

The waveform RMS and the autocorrelation above them are real.

### 3.2b Detected notes are stringified objects · **CLOSED** by Step 2

`CreatorTrainingView` and `App` both build a take's note summary with
`detectedNotes.join(' → ')` over an array of objects, which renders
`[object Object] → [object Object]`. `App` is fixed as a side effect of Step 1
(it now maps `.note`); Creator Training still does it.

### 3.2c A provider that does not run is named in the result · **CLOSED** by Step 2

`CreatorTrainingView` labels an empty detection
`'C3 → Eb3 → G3 (Extracted via Basic Pitch)'`. Basic Pitch is not wired. The
notes are invented and the attribution is false.

### 3.2d The pitch estimator is octaves out · **OPEN, and it is the next decision**

Found by probing `analyzeAudioBlob` with known tones in the browser:

| fed | read |
|---|---|
| 220 Hz | 110 Hz — one octave low |
| 440 Hz | 110 Hz — **two octaves** low |
| 130.81 Hz | alternates 130.9 Hz and 65.3 Hz |

The autocorrelation takes the global maximum over lags, and for a periodic
signal the correlation at 2T and 3T is as strong as at T, so it settles on a
sub-harmonic. The pitch *class* comes out right; the octave does not.

Step 2 made the analysis stop inventing, and this is not an invention — it is
a real measurement of the wrong thing, which is a different defect. The basis
string now says so in as many words, so nothing downstream over-trusts a note
name. **Two ways to close it, and the owner picks:** normalise the correlation
and prefer the shortest lag within ~90% of the peak, which is roughly six
lines against code Step 4 deletes; or leave it and go straight to Basic Pitch,
accepting that Step 3 proves the pipeline with a reading that is octave-wrong.

### 3.2e Analysis literals in the seeded library and other rooms · unscheduled

Step 2 covered the capture and import path. These are the same defect class
elsewhere and were deliberately not touched:

- `CreatorTrainingView` seeded sounds carry `confidenceScore` 90–96
- `CreatorTrainingView:296` defaults `keySignature = 'C Minor'`
- `RhythmProfileSubView:590` states `4.8 syllables/sec`
- `SongwritingView:745` states `Key Lock: C Minor (Natural Scale)`
- `ReleaseRoomView:118` states `Neo-Soul / C Minor (110 BPM)`
- `StudioIntelligencePanel` answers a chord question with a canned progression

### 3.3 The mix desk is not the project · Step 5

`src/components/rooms/MixRoomView.tsx` — eight channels `ch_1`…`ch_8` declared
as a local constant. Project tracks are `t1`…`t5`. The desk and the session
cannot refer to the same channel.

### 3.4 Meters move on `Math.random()` · Step 5

- `MixRoomView.tsx:318, 325, 326`
- `CreatorTrainingView.tsx:367, 369`

### 3.5 Clips get a drawn-on waveform · folded into Step 3

Clips created at runtime receive a literal `waveformPoints` array. Real points
are available from `analyzeAudioBlob`; use those.

### 3.6 Project key disagrees with itself · folded into Step 5

`creator/ProjectContextSubView.tsx:74` defaults `keySignature = 'F Minor'`.
`services/initialData.ts:18` says `key: 'C MIN'`.

### 3.7 Unreachable rooms · unscheduled

`StudioRoom` declares `takes_revisions`, `native_brain`, `daw` and `lobby`.
The sidebar has no entry for them. A surface with no door is a surface nobody
can use.

### 3.8 Declared but unused dependency · unscheduled

`@google/genai` is in `package.json` and imported nowhere. `GEMINI_API_KEY` is
referenced only in `.env.example`. A dependency nothing imports is the same
defect as re-implementing something already installed.

---

## 4. The architecture, in one page

One studio. One persistent project. One DAW. One recording system. The creator
meets it through three relationships — **The Booth** (how I express and
record), **The Band** (who plays with me), **The Control Room** (where what
was recorded becomes editable). They are an organization of one studio, not
three applications.

Three objects stay separate, everywhere:

```
SOURCE            what the creator actually did
INTERPRETATION    what SoulSonus decided it meant
REALIZATION       what it currently sounds like
```

Changing the third never rewrites the first.

**Input modes are not destinations.** Record Audio, Beatbox, Clap, Hum, Mimic,
Sing, Speak, MIDI, Import, Melody answer one question: how should the studio
understand what is about to arrive? Everything lands on the armed track.

**Capabilities name jobs; providers name vendors.** `ACE-Step = AI music` is
not a registration. The UI never calls an engine — it requests a capability,
a resolver picks a provider, an adapter translates both ways, and
provider-shaped data stops at that boundary.

**SoulSonus owns the canonical representation.** Not ACE-Step's structures,
not MIDI, not Demucs output. External engines get adapters to and from our
objects.

**Open source observes and executes; SoulSonus interprets and governs.** Basic
Pitch can find notes. It does not decide that the hum was a bass line meant to
lock with the kick.

**Nothing generative runs in the audio callback,** and the studio stays a
working studio when every provider is down.

---

## 5. Log

Newest last. One line per closed step: what was done, whether it was watched
or only written, and the commit.

| Date | What | Evidence | Commit |
|---|---|---|---|
| 2026-09-17 | Studio export unpacked from the zip, unedited. Verified byte-identical to the archive reviewed. | watched — file count and diff | `e047bae` |
| 2026-09-17 | This ledger and the working rules. | written | `ce2a1fc` |
| 2026-09-17 | Step 0 — removed the unused `esbuild` that blocked `npm install`. | watched — install, tsc and build all pass | `pending` |
| 2026-09-17 | Step 1 — the studio no longer manufactures performances. | **watched** — microphone denied in Chromium: Creator Training and the Booth each state the reason, the badge reads MIC UNAVAILABLE, the record button stays offering to record, and IndexedDB holds **0** assets | `b43cc67` |
| 2026-09-18 | Step 2 — the analysis reports only what it measured, and the import reads its own file. | **watched** — silence, a 220 Hz tone and undecodable bytes each analysed in the browser; no notes invented, no key claimed, real sample rate and duration | `pending` |
