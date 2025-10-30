#!/bin/bash

echo "🔍 Vérification de tous les fichiers..."

# Vérifier la structure des dossiers
echo "📁 Vérification des dossiers..."
mkdir -p src/lib
mkdir -p src/hooks
mkdir -p src/pages
mkdir -p src/components/game
mkdir -p src/components/ui
mkdir -p src/components/effects

# Liste des fichiers requis
declare -a required_files=(
    "src/lib/gameManager.ts"
    "src/lib/endGameManager.ts"
    "src/lib/gameEvents.ts"
    "src/lib/votingSystem.ts"
    "src/lib/missionValidator.ts"
    "src/hooks/useAllPlayers.ts"
    "src/hooks/useEndGameState.ts"
    "src/components/game/EndGameScreen.tsx"
)

missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Manquant: $file"
        missing_files+=("$file")
    else
        echo "✅ OK: $file"
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    echo ""
    echo "✅ Tous les fichiers sont présents !"
else
    echo ""
    echo "❌ Fichiers manquants: ${#missing_files[@]}"
fi
