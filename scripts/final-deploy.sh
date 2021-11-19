# Deploy to devnet.
solana config set --url devnet

# Remove the current program build, and re-deploy.
rm -rf program/build
npm run program:build
npm run program:deploy

# Copy over the deployed keypair and build the JS package.
rm js/src/registryKeypair.ts
echo "export const registryPrivateKey = $(cat program/build/registry-keypair.json)" > js/src/registryKeypair.ts
npm run js:build

# Update the semver number and deploy the JS package.
pushd js > /dev/null
  npm version patch
popd > /dev/null
npm run js:deploy

# Upgrade the client version.
sleep 2
pushd client > /dev/null
  npm install --upgrade solana-token-registry
popd > /dev/null

# Initialize the registry, and add all tokens from original tokenlist.json
node ./client/initRegistry.js

