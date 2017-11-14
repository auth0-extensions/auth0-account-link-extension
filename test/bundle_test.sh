#! /bin/bash
BUILD_OUTPUT=$(yarn extension:build)
ERROR_COUNT=$($BUILD_OUTPUT | grep -i error -c)

echo $BUILD_OUTPUT
exit $ERROR_COUNT