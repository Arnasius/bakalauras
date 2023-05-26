#!/bin/sh

set -e

[ -z "$NODE_ENV" ] && echo "Missing NODE_ENV, force 'development'" && NODE_ENV='development'
[ -z "$DIST_DIR" ] && echo "Missing DIST_DIR, use 'dist/'" && DIST_DIR='dist/'
[ -z "$BRAND" ] && echo "Missing BRAND, use 'generic'" && BRAND='generic'

if [ "$NODE_ENV" = "production" ]; then
	[ -z "$MINIFY" ] && echo "Missing MINIFY, use 'y'" && MINIFY=y
	EXEC=webpack
else
	MINIFY=n
	EXEC=webpack-dev-server
fi
mkdir -p $DIST_DIR
cp src/index.html $DIST_DIR
BRAND=$BRAND MINIFY=$MINIFY $EXEC --mode $NODE_ENV --output-path $DIST_DIR

if [ "$NODE_ENV" = "production" ]; then
	sed -i "s/__HASH__/$(md5sum $DIST_DIR/app.jsx | awk '{print substr($1,1,8)}')/g" $DIST_DIR/index.html
fi