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

interface IMovie {
    title: string
    year: number
    director: string
    genre: string
}

// CREACION DEL ESQUEMA PARA LA PELICULA
const movieSchema = new mongoose.Schema<IMovie>({
        title: String,
        year: Number,
        director: String,
        genre: String
}, {
    versionKey: false
})

// MODELO DE LA PELICULA
const Movie = mongoose.model("Movie", movieSchema)

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

const getMovies = async () => {
  return await Movie.find()
}

const getMovie = async (id:string | undefined) => {

    try { 
        
    if (!id){
        return Movie.find({},{title: 1, _id: 1})
    }

    const foundMovie = await Movie.findById(id)
    
    if(!foundMovie) throw generateError("Movie Not Found", "MovieNotFound")
    return foundMovie
    } catch (error) {
        const e = error as Error
        return handleError(e)
    }
}

const createMovie = async (data: string[]) => {
    try {
        const newMovie: IMovie = {
        title: "sin titulo",
        year: 0,
        director: "desconocido",
        genre: "sin genero"
    }
 
    if (data[0]?.split("=")[0] !== "title") {
    return "Title is required"
    }
    
    for (let i = 0; i < data.length; i++) {
        const prop = data[i]?.split("=") as string[]
        const nameProp = prop[0]
        const value = prop[1]

    switch (nameProp) {
    case "title":
      newMovie.title = value ? value : newMovie.title
      break
    case "year":
      newMovie.year = value ? Number(value) : newMovie.year
      break
    case "director":
      newMovie.director = value ? (value) : newMovie.director
      break
    case "genre":
      newMovie.genre = value ? value : newMovie.genre
      break

      default:
        throw generateError("Invalid Data to create Movie", "InvalidData")
        }
    }

        return Movie.create(newMovie)
        
    }   catch (error) { 

        const e = error as Error
        return handleError(e)
    }

}

const updateMovie = async (id: string | undefined, updates: string[]) => {
    
    try {
        const data: Partial<IMovie> = {} 
    

        for(const update of updates) {
            const [prop, value] = update.split("=")
            
            if(!value){
                throw generateError(`Invalid data for ${prop}`, "InvalidData")
            }

            switch (prop) {
                case "title":
                    data.title = value
                break
                case "year":
                    data.year = +value                   
                break
                 case "director":
                    data.director = value
                break
                 case "genre":
                    data.genre = value
                    break;
                default:
                    throw generateError("Invalid data to update Movie", "InvalidData")
                    break; }
                    }
                return await Movie.findByIdAndUpdate(id, data, { returnDocument: "after" })
                }       
                    catch (error) {
                    const e = error as Error 
                    return handleError(e)
                }
}

const deleteMovie = async (id: string | undefined) => {

    try { 
        if(!id) {
            await Movie.deleteMany({})
            return "Movies deleted saccessfully"
        }

    const deletedMovie = await Movie.findByIdAndDelete(id)    

    if(!deletedMovie) throw generateError("Movie Not Found", "MovieNotFound")
    return deletedMovie
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
            show → para leer todas las películas
            showOne id → para leer una película
            create data → para crear una película
            update id data → para actualizar una película
            delete id → para borrar una película`)
  break
        case "create":
            console.log(await createMovie(args.splice(1)))
            break
        case "show":
            console.log(await getMovies())
            break
        case "showOne":
            console.log(await getMovie(args[1]))
            break
        case "update":
            console.log(await updateMovie(args[1], args.slice(2)))
            break
        case "delete":
            console.log(await deleteMovie(args[1]))
            break
        default:
            console.log("commands: < info | create | show | showOne | update | delete> ")
            break;
    }
        await mongoose.disconnect()
}


main()