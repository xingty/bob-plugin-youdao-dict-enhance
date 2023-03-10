#!/bin/bash

version=$1
if [[ -z $version ]]; then
  echo "build [version]"
  exit 0
fi

cd src
zip -r ../build/bob-plugin-youdao-dict_v$version.bobplugin . *
cd ..