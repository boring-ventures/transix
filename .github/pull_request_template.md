## Descripción
Se juntaron las ramas 142 y Master, se quitó todo lo relacionado con drizzle (Mudanza a Prisma debido a complicaciones del equipo de desarrollo). Cliente y schema prisma añadidos y la migración de drizzle a prisma completada.

## Tipo de Cambio
<!-- Marca con una 'x' los tipos que aplican -->
- [ ] 🐛 Corrección de Bug
- [ x ] ✨ Nueva Funcionalidad
- [ ] 💄 Actualización de UI/UX
- [ ] ♻️ Refactorización de Código
- [ x ] 📝 Documentación
- [ x ] 🔧 Configuración
- [ ] 🚀 Mejora de Rendimiento

## ¿Cómo se ha Probado?
Se han probado los cambios en la base de datos localmente, se hizo pull con prisma de lo actual que se tiene.

## Screenshots (si aplica)
No aplica

## Lista de Verificación
- [ x ] He realizado pruebas locales de los cambios
- [ ] He actualizado la documentación correspondiente
- [ ] Los cambios mantienen o mejoran la accesibilidad
- [ ] Los cambios no generan nuevas advertencias o errores
- [ x ] He verificado la compatibilidad con las funcionalidades existentes

## Notas Adicionales
Falta adaptar la logica o todo lo posible debido a la migración a prisma. Hay que ver el detalle del porqué de las 40 tablas que se han creado al hacer pull a la base de datos.