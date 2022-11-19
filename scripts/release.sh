#!/bin/bash

VER=`node -p "require('./package.json').version"`
REPO="https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"

git config --local user.email "action@github.com"
git config --local user.name "GitHub Action"
git commit -a -m "v${VER} (auto-release)"
git tag "v${VER}" HEAD
git push "${REPO}" HEAD:master --follow-tags --tags
