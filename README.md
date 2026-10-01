CLI de Libros con MongoDB

Aplicación de consola hecha con **Node.js**, **TypeScript** y **Mongoose** que permite gestionar una colección de libros en MongoDB (crear, leer, actualizar y borrar) desde la terminal.

## Tecnologías

- Node.js
- TypeScript
- MongoDB + Mongoose
- dotenv

## Instalación

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/DamTum88/clase10mdb.git
   cd clase10mdb
   ```

2. Instalar las dependencias:

   ```bash
   npm install
   ```

3. Crear un archivo `.env` en la raíz (tomando como base `.env.example`) con la URI de tu base de datos:

   ```
   URI_DB=mongodb://localhost:27017/libreria
   ```

## Uso

Los comandos se ejecutan con `npm start --` seguido de la acción:

| Comando | Descripción |
|---|---|
| `info` | Muestra la ayuda con los comandos disponibles |
| `show` | Lista todos los libros |
| `showOne <id>` | Muestra un libro por su ID (sin ID, lista títulos e IDs) |
| `create titulo=... [autor=...] [precio=...] [stock=...]` | Crea un libro (`titulo` es obligatorio y va primero) |
| `update <id> campo=valor ...` | Actualiza uno o más campos de un libro |
| `delete <id>` | Borra un libro por su ID (sin ID, borra todos) |

### Ejemplos

```bash
npm start -- create titulo=Rayuela autor=Cortazar precio=15000 stock=5
npm start -- show
npm start -- showOne 66f1a2b3c4d5e6f7a8b9c0d1
npm start -- update 66f1a2b3c4d5e6f7a8b9c0d1 precio=18000 stock=3
npm start -- delete 66f1a2b3c4d5e6f7a8b9c0d1
```

> Si un valor tiene espacios, usá guiones o comillas: `titulo="Cien años de soledad"`.

## Modelo de datos

Cada libro tiene los siguientes campos:

| Campo | Tipo | Valor por defecto |
|---|---|---|
| `titulo` | String | "sin titulo" |
| `autor` | String | "desconocido" |
| `precio` | Number | 0 |
| `stock` | Number | 0 |

## Autor

Damián - [@DamTum88](https://github.com/DamTum88)
