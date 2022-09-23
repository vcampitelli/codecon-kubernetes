#!/bin/sh
set -e
if [ -z "$URL_AUTH" ]; then
  URLS=$(./urls.sh)
  eval "${URLS}"
  echo "${URLS}" | grep "export URL"
fi
TOKEN=$(curl -s -X POST -u "admin:admin" "${URL_AUTH}/auth" | jq -r '.access_token')

echo export TOKEN="${TOKEN}"

echo "# Para executar o comando acima automaticamente, execute:"
echo "# eval \$($0)"
