#!/usr/bin/env bash

# Script runner
# Runs multiple jobs in parallel, with a failing exit code if any job fails.
# Example:
# $ ./run.sh 'npm run foo' 'npm run bar' 'npm run baz'

set -m
EXIT_CODE=0;

function runJobs() {
    for job in `jobs -p`; do
        # PID => ${job}
        if ! wait ${job}; then
            # At least one job failed
            EXIT_CODE=1;
        fi
    done
}

trap 'runJobs' CHLD
DIRN=$(dirname "$0");

for cmd in "$@"; do
    (echo "${cmd}" | bash) &
done

wait;

exit "$EXIT_CODE"
