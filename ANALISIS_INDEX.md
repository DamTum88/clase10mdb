# Análisis de `src/index.ts` en 10 pasos

`src/index.ts` es una aplicación de consola (CLI) que hace un CRUD de productos sobre MongoDB usando Mongoose. Se ejecuta pasando una acción y sus argumentos por la terminal, por ejemplo:

```bash
npx tsx src/index.ts create name=Mouse price=1500 stock=10 category=perifericos
npx tsx src/index.ts show <id>
npx tsx src/index.ts delete <id>
```

---

## Paso 1: Imports y variables de entorno (líneas 1-6)

```ts
import mongoose, {connect, disconnect} from "mongoose"
import dotenv from "dotenv"
import { off } from "node:cluster"
dotenv.config()
const URI_DB = process.env.URI_DB || ""
```

- Importa `mongoose` y sus funciones `connect` y `disconnect`.
- `dotenv.config()` carga el archivo `.env`, y de ahí se lee `URI_DB`.
- Si `URI_DB` no existe se usa `""`, así que la conexión falla más adelante.

⚠️ `import { off } from "node:cluster"` no se usa en ningún lado y se puede borrar.

---

## Paso 2: Conexión a la base de datos (líneas 8-15)

```ts
const connectDb = async (URI:string) => {
    try { await connect(URI) }
    catch (error) { console.log("error al conectarse") }
}
```

- Intenta conectarse a MongoDB con la URI recibida.
- Si falla, muestra un mensaje **pero el programa sigue**. Después, cualquier consulta queda esperando unos 10 segundos (el buffering de Mongoose) y termina en error.

💡 Mejora: cortar la ejecución si no hay conexión (`process.exit(1)` o relanzar el error).

---

## Paso 3: Interfaz, esquema y modelo (líneas 17-35)

```ts
interface IProduct { name: string; price: number; stock: number; category: string }
const productSchema = new mongoose.Schema<IProduct>({...}, { versionKey: false })
const Product = mongoose.model("product", productSchema)
```

- `IProduct` define el tipo en TypeScript.
- `productSchema` define la estructura del documento en Mongo. `versionKey: false` quita el campo `__v`.
- `Product` es el modelo, y Mongoose lo guarda en la colección **`products`** (pasa el nombre a plural).

💡 El esquema no tiene validaciones (`required`, `min`, etc.), así que Mongo acepta cualquier valor.

---

## Paso 4: Manejo de errores (líneas 37-49)

```ts
const generateError = (message, name) => { const error = new Error(message); error.name = name; return error }
const handleError = (error) => error.name === "CastError" ? "ID invalido" : error.message
```

- `generateError` crea errores propios con un `name` personalizado (`ProductNotFound`, `InvalidadData`).
- `handleError` convierte un error en un mensaje de texto:
  - `CastError` (el ID no tiene formato de ObjectId): devuelve `"ID invalido"`.
  - Cualquier otro error: devuelve su `message`.

---

## Paso 5: Leer productos, `getProducts` / `getProduct` (líneas 52-76)

- `getProducts()` devuelve todos los productos. **No se usa en ningún lado.**
- `getProduct(id)`:
  1. Sin `id`: devuelve solo `name` y `_id` de todos los productos (proyección `{name: 1, _id: 1}`).
  2. Con `id`: busca con `findById`.
  3. Si no lo encuentra, lanza `ProductNotFound`.
  4. El `catch` pasa el error por `handleError` y devuelve el mensaje.

⚠️ `validateHex` se declara pero la validación está comentada, así que es código muerto. De todas formas, el `CastError` ya cubre los IDs inválidos.

---

## Paso 6: Crear productos, `createProduct` (líneas 78-142)

Recibe los argumentos con formato `clave=valor`:

1. Arma un producto con valores por defecto (`"producto"`, `0`, `0`, `"sin categoria"`).
2. Exige que el **primer** argumento sea `name=...`. Si no lo es, muestra `"Name is required"` y devuelve `undefined`.
3. Recorre cada argumento, lo separa por `=` y asigna el valor según la clave. `price` y `stock` se convierten con `Number()`.
4. Si aparece una clave desconocida, lanza `InvalidadData`.
5. Guarda el producto con `Product.create(newProduct)`.

⚠️ Problemas:
- `return Product.create(...)` va **sin `await`** dentro del `try`. Si Mongo rechaza la operación, el `catch` no la captura. Debería ser `return await Product.create(...)`.
- `price=abc` da `NaN`, y eso no se valida.
- Un valor que contenga `=` (por ejemplo `name=a=b`) se corta.
- El mensaje dice "Invalidad", con errata.
- Al final queda un bloque grande de código comentado de una versión anterior.

---

## Paso 7: Actualizar productos, `updateProduct` (líneas 144-158), **incompleto**

```ts
const data: Partial<IProduct> = {}
for (const update of updates) console.log(update)
return await Product.findByIdAndUpdate(id, data)
```

- Solo imprime los argumentos. **Nunca llena `data`**, así que la actualización se hace con un objeto vacío y no cambia nada.
- El `catch` está vacío, así que los errores se pierden sin aviso.
- `findByIdAndUpdate` devuelve el documento **anterior**. Para obtener el nuevo hace falta `{ new: true }`.

💡 Para terminarlo se puede reutilizar la lógica `clave=valor` del `createProduct`.

---

## Paso 8: Eliminar productos, `deleteProduct` (líneas 160-176)

- **Sin `id`: borra TODOS los productos** (`deleteMany({})`). Es muy peligroso porque basta con olvidarse de pasar el ID.
- Con `id`: usa `findByIdAndDelete`. Si no encuentra nada, lanza `ProductNotFound`.

⚠️ Problemas:
- En el `catch` se llama `handleError(e)` **sin `return`**, así que la función devuelve `undefined` y el usuario no ve el error.
- El mensaje dice "saccefully", que debería ser "successfully".

---

## Paso 9: Lectura de argumentos de la CLI (líneas 178-179)

```ts
const args = process.argv.splice(2)
const action = args[0]
```

- `process.argv` trae `[node, script, ...argumentos]`. Con `splice(2)` quedan solo los argumentos del usuario.
- `args[0]` es la acción (`create`, `show`, `update`, `delete`).
- Nota: `splice` modifica el array original. `slice` sería la opción más limpia (en `main` se mezclan los dos).

---

## Paso 10: Función principal `main` (líneas 181-204)

1. Se conecta a la base con `connectDb`.
2. Según la `action`, llama a la función que corresponde e imprime el resultado:

   | Acción   | Función llamada                          |
   |----------|------------------------------------------|
   | `create` | `createProduct(args.splice(1))`          |
   | `show`   | `getProduct(args[1])`                    |
   | `update` | `updateProduct(args[1], args.slice(2))`  |
   | `delete` | `deleteProduct(args[1])`                 |

3. Se desconecta con `disconnect()`.

🚨 **Bug grave en `update`:**

```ts
case "update":
    console.log(updateProduct(args[1], args.slice(2)))   // falta await
case "delete":                                           // falta break antes
    console.log(await deleteProduct(args[1]))
```

- Falta `await`, así que se imprime `Promise { <pending> }`.
- **Falta `break`**, así que la ejecución sigue en el `case "delete"`. Resultado: **`update <id>` borra el producto**, y si no se pasa ID, **borra todos los productos**.

Además, si la acción no existe (`default`), no se muestra ningún mensaje de ayuda.

---

## Resumen de mejoras prioritarias

| Prioridad | Problema | Solución |
|-----------|----------|----------|
| 🔴 Alta | `update` sigue de largo hasta `delete` | Agregar `await` y `break` |
| 🔴 Alta | `delete` sin ID borra toda la colección | Pedir confirmación o exigir el ID |
| 🟠 Media | `updateProduct` no actualiza nada | Parsear `clave=valor` y usar `{ new: true }` |
| 🟠 Media | `deleteProduct` no devuelve el error | `return handleError(e)` |
| 🟠 Media | `Product.create` sin `await` en el `try` | `return await Product.create(...)` |
| 🟡 Baja | El programa sigue sin conexión | Cortar la ejecución si `connectDb` falla |
| 🟡 Baja | Código muerto (`off`, `validateHex`, `getProducts`, bloque comentado) | Borrarlo |
| 🟡 Baja | Erratas ("Invalidad", "saccefully") | Corregirlas |
