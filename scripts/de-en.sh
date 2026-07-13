#!/usr/bin/env bash

cd ../../vocably-reverse-translations && npm run download-prod
cd -
sync de
./build-seo-search-data.mts
cd ../
git add .
git commit -m "feat(www-seo): regenerate seo pages"
git push
