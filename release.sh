#!/bin/bash
# MAC用户安装gnu-sed
# brew install gnu-sed
# PATH="/usr/local/opt/gnu-sed/libexec/gnubin:$PATH"

if [[ ! -d ./build ]]; then
  mkdir ./build
fi

version=$1
desc=$2
if [[ -z $version ]]; then
  echo "build.sh [version] [desc(optional)]"
  exit 0;
fi

if [[ -z  desc ]]; then
  desc="Release v$version"
fi

cv=$(cat appcast.json | grep '"version"' | awk -F\" 'NR==1 {print $4}')
echo "Current version: $cv, build version: $version"
/bin/bash ./build.sh $version

ln=$(cat appcast.json | grep -n "\"$version\""|awk -F: 'NR==1{print $1}')
sha256=$(sha256sum ./build/bob-plugin-youdao-dict_v$version.bobplugin | awk '{print $1}')
echo "sha256: $sha256"
if [[ $ln -gt 0 ]]; then
  sha_ln=`expr $ln + 2`
  sed -i "${sha_ln}s/.*/      \"sha256\": \"$sha256\",/" appcast.json
  echo "The sha256 for $version has been updated"
else
  ln=$(cat appcast.json | grep -n '"versions"'| awk -F: 'NR==1{print $1}')
  ln=`expr $ln + 1`
  url="https://github.com/xingty/bob-plugin-youdao-dict-enhance/releases/download/v$version/bob-plugin-youdao-dict_v$version.bobplugin"
  content="\    {\n     \"version\": \"$version\",\n      \"desc\": \"$desc\",\n      \"sha256\": \"$sha256\",\n      \"url\": \"$url\",\n      \"minBobVersion\": \"0.5.0\"\n    },"
  sed -i "${ln}i$content" appcast.json
fi

vln=$(cat src/info.json | grep -n '"version"' | awk -F: 'NR==1{print $1}')
if [[ $vln -gt 0 ]]; then
  iv=$(cat src/info.json | grep -n '"version"' | awk -F\" 'NR==1{print $4}')
  if [ $version != $iv ]; then
    sed -i "${vln}s/.*/  \"version\": \"$version\",/" src/info.json
    echo "Updating the version of the info.json from => $iv to => $version"
  fi
fi

