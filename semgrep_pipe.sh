#!/usr/bin/env bash
f=.github/workflows/pipeline.yml

for ref in \
  actions/checkout@v4 \
  gitleaks/gitleaks-action@v2 \
  actions/setup-python@v5 \
  sigstore/cosign-installer@v3 \
  actions/upload-artifact@v4 \
  actions/download-artifact@v4 \
  actions/configure-pages@v4 \
  actions/upload-pages-artifact@v3 \
  actions/deploy-pages@v4
do
  repo=${ref%@*}
  tag=${ref#*@}
  # tags anotadas: o commit real vem na linha com ^{}
  sha=$(git ls-remote "https://github.com/$repo" "refs/tags/$tag^{}" | cut -f1)
  # tags leves: sem ^{}
  [ -z "$sha" ] && sha=$(git ls-remote "https://github.com/$repo" "refs/tags/$tag" | cut -f1)

  if [ -z "$sha" ]; then echo "❌ não achei $ref"; continue; fi
  sed -i "s|$repo@$tag\b|$repo@$sha # $tag|g" "$f"
  echo "✅ $repo@$tag -> $sha"
done