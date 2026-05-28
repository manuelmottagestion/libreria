#!/bin/bash
# setup-testing.sh - Setup inicial para testing

echo "🔧 Configurando Testing Suite..."

# 1. Instalar dependencias
echo ""
echo "📦 Instalando dependencias..."
npm install

if [ $? -eq 0 ]; then
  echo "✅ Dependencias instaladas correctamente"
else
  echo "❌ Error al instalar dependencias"
  exit 1
fi

# 2. Instalar Playwright browsers
echo ""
echo "🌐 Descargando navegadores para Playwright..."
npx playwright install

if [ $? -eq 0 ]; then
  echo "✅ Navegadores instalados"
else
  echo "⚠️  Error al instalar navegadores (continuando...)"
fi

# 3. Crear archivos de configuración
echo ""
echo "📋 Configurando archivos..."

if [ ! -f .env.test ]; then
  echo "Creando .env.test..."
  cat > .env.test << EOF
# Test configuration
NODE_ENV=test
TEST_TIMEOUT=10000
EOF
  echo "✅ .env.test creado"
fi

# 4. Ejecutar validación de GAS
echo ""
echo "✅ Setup completado!"
echo ""
echo "📚 Próximos pasos:"
echo ""
echo "  Ejecutar unit tests:"
echo "    npm test"
echo ""
echo "  Ejecutar GAS validation:"
echo "    npm run test:gas"
echo ""
echo "  Ejecutar E2E tests:"
echo "    npm run test:e2e"
echo ""
echo "  Ver documentación:"
echo "    cat TESTING.md"
echo ""
