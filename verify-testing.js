#!/usr/bin/env node

/**
 * verify-testing.js
 * Script de verificación rápida de la suite de testing
 * Ejecutar: node verify-testing.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 VERIFICANDO SUITE DE TESTING\n');
console.log('='.repeat(60));

let checks = 0;
let passed = 0;

function check(nombre, condicion) {
  checks++;
  if (condicion) {
    console.log(`✅ ${nombre}`);
    passed++;
  } else {
    console.log(`❌ ${nombre}`);
  }
}

// 1. Verificar archivos de configuración
console.log('\n📋 Archivos de configuración:');
check('jest.config.js existe', fs.existsSync('jest.config.js'));
check('playwright.config.js existe', fs.existsSync('playwright.config.js'));
check('package.json existe', fs.existsSync('package.json'));

// 2. Verificar archivos de tests
console.log('\n📝 Archivos de tests:');
check('tests/unit/validaciones.test.js existe', fs.existsSync('tests/unit/validaciones.test.js'));
check('tests/unit/auth.test.js existe', fs.existsSync('tests/unit/auth.test.js'));
check('tests/unit/financiero.test.js existe', fs.existsSync('tests/unit/financiero.test.js'));
check('tests/e2e/auth.spec.js existe', fs.existsSync('tests/e2e/auth.spec.js'));
check('tests/e2e/productos.spec.js existe', fs.existsSync('tests/e2e/productos.spec.js'));
check('tests/e2e/ventas.spec.js existe', fs.existsSync('tests/e2e/ventas.spec.js'));
check('tests/gas-validation.js existe', fs.existsSync('tests/gas-validation.js'));
check('tests/setup.js existe', fs.existsSync('tests/setup.js'));

// 3. Verificar CI/CD
console.log('\n🤖 Configuración CI/CD:');
check('.github/workflows/tests.yml existe', fs.existsSync('.github/workflows/tests.yml'));

// 4. Verificar documentación
console.log('\n📚 Documentación:');
check('TESTING.md existe', fs.existsSync('TESTING.md'));
check('README_TESTING.md existe', fs.existsSync('README_TESTING.md'));

// 5. Verificar dependencias
console.log('\n📦 Dependencias:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
check('jest en package.json', packageJson.devDependencies?.jest);
check('@playwright/test en package.json', packageJson.devDependencies?.['@playwright/test']);
check('Scripts de test configurados', packageJson.scripts?.test && packageJson.scripts?.['test:gas'] && packageJson.scripts?.['test:e2e']);

// 6. Contar tests
console.log('\n🧪 Conteo de tests:');

const unitDir = 'tests/unit';
const e2eDir = 'tests/e2e';
let unitTestCount = 0;
let e2eTestCount = 0;

if (fs.existsSync(unitDir)) {
  fs.readdirSync(unitDir).forEach(file => {
    if (file.endsWith('.test.js')) {
      const content = fs.readFileSync(path.join(unitDir, file), 'utf8');
      const testMatches = content.match(/test\('|test\("/g) || [];
      unitTestCount += testMatches.length;
    }
  });
}

if (fs.existsSync(e2eDir)) {
  fs.readdirSync(e2eDir).forEach(file => {
    if (file.endsWith('.spec.js')) {
      const content = fs.readFileSync(path.join(e2eDir, file), 'utf8');
      const testMatches = content.match(/test\('|test\("/g) || [];
      e2eTestCount += testMatches.length;
    }
  });
}

console.log(`📊 Tests unitarios encontrados: ${unitTestCount}`);
console.log(`📊 Tests E2E encontrados: ${e2eTestCount}`);

// Leer gas-validation
const gasFile = fs.readFileSync('tests/gas-validation.js', 'utf8');
const gasTests = (gasFile.match(/validator\.test\(/g) || []).length;
console.log(`📊 Validaciones GAS encontradas: ${gasTests}`);

// 7. Resumen final
console.log('\n' + '='.repeat(60));
console.log(`\n📈 RESUMEN: ${passed}/${checks} verificaciones pasadas\n`);

if (passed === checks) {
  console.log('✅ ¡Suite de testing COMPLETA y lista para usar!');
  console.log('\n🚀 Próximos pasos:');
  console.log('   npm test              # Ejecutar unit tests');
  console.log('   npm run test:gas      # Ejecutar validación GAS');
  console.log('   npm run test:e2e      # Ejecutar E2E tests');
  console.log('   npm run test:coverage # Ver cobertura');
  console.log('');
  process.exit(0);
} else {
  console.log('⚠️  Algunas verificaciones fallaron. Revisa los archivos faltantes.');
  console.log('');
  process.exit(1);
}
