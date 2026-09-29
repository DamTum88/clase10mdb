import mongoose, {connect} from "mongoose"
import dotenv from "dotenv"
dotenv.config()

const URI_DB = process.env.URI_DB || ""

const connectDb = async (URI:string) =>{
    try {
        await connect(URI)
        //console.log("conectado exitosamente a mongodb")
    } catch (error) {
        console.log("error al conectarse")
    }
}

interface IBook {
    titulo: string
    autor: string
    precio: number
    stock: number
}

// CREACION DEL ESQUEMA PARA EL LIBRO
const bookSchema = new mongoose.Schema<IBook>({
        titulo: String,
        autor: String,
        precio: Number,
        stock: Number
}, {
    versionKey: false
})

// MODELO DEL LIBRO
const Book = mongoose.model("Book", bookSchema)

const generateError = (message: string, name: string) => {
   const error = new Error(message)
    error.name = name
    return error
}

const handleError = (error: Error) => {
        if(error.name === "CastError") {
            return "ID invalido"
        }
        return error.message
    }

const getBooks = async () => {
  return await Book.find()
}

const getBook = async (id:string | undefined) => {

    try {

    if (!id){
        return Book.find({},{titulo: 1, _id: 1})
    }

    const foundBook = await Book.findById(id)

    if(!foundBook) throw generateError("Book Not Found", "BookNotFound")
    return foundBook
    } catch (error) {
        const e = error as Error
        return handleError(e)
    }
}

const createBook = async (data: string[]) => {
    try {
        const newBook: IBook = {
        titulo: "sin titulo",
        autor: "desconocido",
        precio: 0,
        stock: 0
    }

    if (data[0]?.split("=")[0] !== "titulo") {
    return "Titulo is required"
    }

    for (let i = 0; i < data.length; i++) {
        const prop = data[i]?.split("=") as string[]
        const nameProp = prop[0]
        const value = prop[1]

    switch (nameProp) {
    case "titulo":
      newBook.titulo = value ? value : newBook.titulo
      break
    case "autor":
      newBook.autor = value ? value : newBook.autor
      break
    case "precio":
      newBook.precio = value ? Number(value) : newBook.precio
      break
    case "stock":
      newBook.stock = value ? Number(value) : newBook.stock
      break

      default:
        throw generateError("Invalid Data to create Book", "InvalidData")
        }
    }

        return Book.create(newBook)

    }   catch (error) {

        const e = error as Error
        return handleError(e)
    }

}

const updateBook = async (id: string | undefined, updates: string[]) => {

    try {
        const data: Partial<IBook> = {}


        for(const update of updates) {
            const [prop, value] = update.split("=")

            if(!value){
                throw generateError(`Invalid data for ${prop}`, "InvalidData")
            }

            switch (prop) {
                case "titulo":
                    data.titulo = value
                break
                case "autor":
                    data.autor = value
                break
                 case "precio":
                    data.precio = +value
                break
                 case "stock":
                    data.stock = +value
                    break;
                default:
                    throw generateError("Invalid data to update Book", "InvalidData")
                    break; }
                    }
                return await Book.findByIdAndUpdate(id, data, { returnDocument: "after" })
                }
                    catch (error) {
                    const e = error as Error
                    return handleError(e)
                }
}

const deleteBook = async (id: string | undefined) => {

    try {
        if(!id) {
            await Book.deleteMany({})
            return "Books deleted saccessfully"
        }

    const deletedBook = await Book.findByIdAndDelete(id)

    if(!deletedBook) throw generateError("Book Not Found", "BookNotFound")
    return deletedBook
    } catch (error) {
        const e = error as Error
        return handleError(e)
    }
}

const args = process.argv.splice(2)
const action = args[0]

const main = async () => {
    await connectDb(URI_DB)

    switch (action) {
        case "info":
        console.log(`
            show → para leer todos los libros
            showOne id → para leer un libro
            create data → para crear un libro
            update id data → para actualizar un libro
            delete id → para borrar un libro`)
  break
        case "create":
            console.log(await createBook(args.splice(1)))
            break
        case "show":
            console.log(await getBooks())
            break
        case "showOne":
            console.log(await getBook(args[1]))
            break
        case "update":
            console.log(await updateBook(args[1], args.slice(2)))
            break
        case "delete":
            console.log(await deleteBook(args[1]))
            break
        default:
            console.log("commands: < info | create | show | showOne | update | delete> ")
            break;
    }
        await mongoose.disconnect()
}


main()
