#!/bin/bash
set -e

AUTH=$(minikube service auth-service --url)
if [ "$AUTH" = "" ]; then
    echo "Serviço Auth ainda não está pronto"
    exit 1
fi
echo "export URL_AUTH=${AUTH}"

POSTS=$(minikube service posts-service --url)
if [ "$POSTS" = "" ]; then
    echo "Serviço Posts ainda não está pronto"
    exit 1
fi
echo "export URL_POSTS=${POSTS}"

USERS=$(minikube service users-service --url)
if [ "$USERS" = "" ]; then
    echo "Serviço Users ainda não está pronto"
    exit 1
fi
echo "export URL_USERS=${USERS}"

GATEWAY=$(minikube service -n istio-system istio-ingressgateway list | grep "http2/80" | awk '{print $6}')
if [ "$GATEWAY" != "" ]; then
    echo "export URL_GATEWAY=${GATEWAY}"
fi

echo "# Para executar os comandos acima automaticamente, execute:"
echo "# eval \$($0)"
