#!/bin/bash

if [[ ! -d ./build ]]; then
  mkdir ./build
fi

version=$(cat appcast.json | grep '"version"' | awk -F: 'NR==1 {print $2}' | awk -F\" '{print $2}')
echo "Latest version number: $version"
cd src
zip -r ../build/bob-plugin-youdao-dict_v$version.bobplugin . * 
cd ..