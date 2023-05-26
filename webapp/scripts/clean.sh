#!/bin/sh

set -e

[ -z "$DIST_DIR" ] && echo "Missing DIST_DIR, use 'dist/'" && DIST_DIR='dist/'

rm -rf $DIST_DIR
