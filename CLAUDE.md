# Working in this repository

**Read `LEDGER.md` first. It is the only source of work and the only record of
it.** Do not create a second plan, roadmap, defect list or status file. One
ledger. That rule is the reason this repository exists apart from the last one.

This file is short on purpose: it is loaded into context on every turn, and
the owner pays for that. Everything that grows goes in the ledger.

## The five rules

1. **One step at a time.** `LEDGER.md` §2 is numbered and exactly one step is
   open. Nothing else gets touched while it is — no tidy-ups, no renames, no
   "while I was in there". A defect noticed mid-step is written into §3 and
   left alone.
2. **A step is not done until it is seen working.** "I wrote the code that
   should do this" and "I watched this happen" are different claims. Only the
   second closes a step, and the log records which was made.
3. **Nothing is invented.** No number on screen that nothing measured. No
   fallback that manufactures a result when the real one is unavailable — say
   it is unavailable. A missing take is recoverable; a fabricated one in the
   provenance chain is not.
4. **Every step ends in a commit** whose message says what changed and what
   was verified, plus one line in the ledger log.
5. **Scope is the owner's.** A step that needs something outside its stated
   scope stops and asks. Propose and hold; never propose and proceed.

## Before writing a new function

Check whether something here already does it. The platform is a studio, not a
pile of features, and a second implementation of anything is a defect however
good the code is. If a capability needs an engine, it goes through the
capability and provider layer described in `LEDGER.md` §4 — the UI never calls
an engine directly.

## Verification

```
npx tsc --noEmit     # must stay clean
npm run build        # must pass
npm run dev          # and then actually look at it
```

The third one is not optional. This codebase's worst defects all rendered
perfectly.

## Attribution

Commits carry the repository owner's authorship and nothing else. No
co-author trailers, no session links, no tool or vendor names in commit
messages, code comments, or any pushed artifact. This code is not yours.
