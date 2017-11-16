#! /bin/bash

ERROR_COUNT=$(yarn extension:build | grep ERROR -c)

if [ "$ERROR_COUNT" -ne "0" ]; then
    echo "Unbuildable extension.";
fi

exit $ERROR_COUNT