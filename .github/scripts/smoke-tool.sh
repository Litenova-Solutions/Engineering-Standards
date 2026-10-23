#!/usr/bin/env bash
# Proves the packed LiteSpec.Cli works the way a consumer installs it: from a package
# folder, as a local tool, in a folder outside this repository, against a copy of the
# Claimwick example, with no LITESPEC_HOME. The tool must find its release beside itself.
#
#   .github/scripts/smoke-tool.sh <package-folder>
set -euo pipefail

packages="$(cd "$1" && pwd)"
repository="$(cd "$(dirname "$0")/../.." && pwd)"
version="$(jq -r .version "$repository/litespec.manifest.json")"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

cp -R "$repository/examples/claimwick/." "$work/"
cd "$work"
unset LITESPEC_HOME

dotnet new tool-manifest >/dev/null
dotnet tool install LiteSpec.Cli --local --version "$version" --add-source "$packages" >/dev/null

dotnet litespec consumer
dotnet litespec ui
dotnet litespec model check
