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

# setup examples for e2e
pnpm setup:examples

# just do e2e!
pnpm test
