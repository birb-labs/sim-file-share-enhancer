# Sim File Share Enhancer

Idiomas: [English](README.md) | [Portugues (BR)](README.pt-BR.md) | **Espanol**

Un userscript que agrega tema moderno, filtros, ordenacion, columna de creadores y seleccion masiva segura a [Sim File Share](https://simfileshare.net).

## Instalacion

1. Instala un gestor de userscripts, como Tampermonkey o Violentmonkey.
2. Abre el instalador: [simfileshare-enhancer.user.js](https://raw.githubusercontent.com/birb-labs/sim-file-share-enhancer/main/simfileshare-enhancer.user.js)
3. Confirma la instalacion. El script se actualiza solo desde la misma direccion.

## Funciones

- Temas claro, oscuro y automatico.
- Filtros por nombre, tipo, tamano, fecha y creador, y ordenacion en todas las columnas.
- Columna de creadores con un chip por creador. Al hacer clic se abre un popup con los enlaces oficiales (Patreon, Tumblr, sitio propio y otros).
- Seleccion por rango con Shift y barra de acciones masivas.
- Exportar hashes: lee el MD5 de cada archivo desde el ETag del servidor, sin descargar el archivo.

## Base de datos

Las bases de creadores y de mods son archivos JSON en [`data/`](data) y se cargan desde este repositorio, por lo que se pueden actualizar sin reinstalar el script. El script guarda una copia en cache durante seis horas.

- [`data/creators.json`](data/creators.json): creadores, patrones de nombre, enlaces oficiales y foto.
- [`data/mods.json`](data/mods.json): una entrada por archivo, identificada por MD5.

Los archivos subidos por partes (normalmente los mas grandes) no traen MD5 en el ETag del servidor. La entrada guarda el ETag en el campo `etag` y `md5` queda `null`. El mismo MD5 puede aparecer con nombres distintos, por lo que las entradas se buscan primero por nombre de archivo.

Para contribuir, usa **Exportar hashes** en tu lista de archivos, completa creadores, categoria e imagen en el JSON generado y abre un pull request.

## Desarrollo

```sh
npm install
npm test      # genera el build y ejecuta las pruebas
npm run build # genera simfileshare-enhancer.user.js desde src/
```

Edita los modulos en `src/`. El `simfileshare-enhancer.user.js` de la raiz se genera y se versiona porque es el instalador.

## Licencia

MIT. Creado por Birb Labs, contacto@birblabs.com.
