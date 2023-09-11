#!/bin/bash

set -e

# Pack packages
for PKG in packages/* ; do
  pushd $PKG
  echo "⚡ Packing $PKG ..."
  npm pack 
  popd > /dev/null
done

# Replace deps
npx jiti ./scripts/replaceDeps.ts

# show the diff of deps
git diff

pnpm setup:examples

# pnpm test
pnpm test:i18n8
