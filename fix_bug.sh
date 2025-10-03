#!/usr/bin/env bash

set -ex

codex e --full-auto \
    "Look at the next bug listed in TODO.md and implement a fix for it. \
    A development server is already running in the background so you \
    don't need to start it. Just make the code changes needed to fix the bug. \
    Before you finish run bunx tsc --noEmit to make sure there are no type errors. \
    After making the changes remove the TODO item from TODO.md."