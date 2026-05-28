@echo off
REM setup-testing.bat - Setup inicial para testing (Windows)

echo.
echo 🔧 Configurando Testing Suite...
echo.

REM 1. Instalar dependencias
echo 📦 Instalando dependencias...
call npm install

if errorlevel 1 (
  echo ❌ Error al instalar dependencias
  exit /b 1
)
echo ✅ Dependencias instaladas correctamente
echo.

REM 2. Instalar Playwright browsers
echo 🌐 Descargando navegadores para Playwright...
call npx playwright install

if errorlevel 1 (
  echo ⚠️  Error al instalar navegadores (continuando...)
) else (
  echo ✅ Navegadores instalados
)
echo.

REM 3. Crear archivos de configuración
echo 📋 Configurando archivos...

if not exist .env.test (
  echo Creando .env.test...
  (
    echo # Test configuration
    echo NODE_ENV=test
    echo TEST_TIMEOUT=10000
  ) > .env.test
  echo ✅ .env.test creado
)

echo.
echo ✅ Setup completado!
echo.
echo 📚 Próximos pasos:
echo.
echo   Ejecutar unit tests:
echo     npm test
echo.
echo   Ejecutar GAS validation:
echo     npm run test:gas
echo.
echo   Ejecutar E2E tests:
echo     npm run test:e2e
echo.
echo   Ver documentación:
echo     type TESTING.md
echo.
