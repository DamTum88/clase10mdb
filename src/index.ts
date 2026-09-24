import mongoose, {connect, disconnect} from "mongoose"
import dotenv from "dotenv"
dotenv.config()

const URI_DB = process.env.URI_DB || ""


const connectDb = async (URI:string) =>{
    try {
        await connect(URI)
        console.log("conectado exitosamente a mongodb")
    } catch (error) { 
        console.log("error al conectarse")
    }
}

interface IProduct {
    name: string
    price: number
    stock: number
    category: string
}

// CREACION DEL ESQUEMA PARA EL PRODUCTO
const productSchema = new mongoose.Schema<IProduct>({
        name: String,
        price: Number,
        stock: Number,
        category: String
})

// MODELO DEL PRODUCTO
const Product = mongoose.model("product", productSchema)

const generateError = (message: string, name: string) => {
   const error = new Error(message)
    error.name = name
    return error
}

const handleError = (error: Error) => {
        if(error.name === "CastError") {
            return "ID invalido" 
        } 

        if (error.name === "ProductNotFound"){
            return error.message
                }
}


const getProducts = async () => {
  return await Product.find()
}

const getProduct = async (id:string | undefined) => {

    try {
    const validateHex = /^[0-9a-fA-F]+$/
    if (!id){
        return Product.find({},{name: 1, _id: 1})
    }

   // if (id.length !== 24 || !validateHex.test(id)){
   //     return "Invalid ID"
   // }

    const foundProduct = await Product.findById(id)
    
    if(!foundProduct) throw generateError("Product Not Found", "ProductNotFound")
    return foundProduct
    } catch (error) {
        const e = error as Error
        handleError(e)
    
    }
}

const createProduct = async (data: IProduct) => {

}

const updateProduct = async (id:string, updates: string[]) => {

}

const deleteProduct = async (id: string | undefined) => {

    try { 
        if(!id) {
            await Product.deleteMany({})
            return "Products deleted saccefully"
        }

    const deletedProduct = await Product.findByIdAndDelete(id)    

    if(!deletedProduct) throw generateError("Product Not Found", "ProductNotFound")
    return deletedProduct
    } catch (error) {
        const e = error as Error
        handleError(e)



}

}

const args = process.argv.splice(2)
const action = args[0]



const main = async () => {
    await connectDb(URI_DB)

    switch (action) {
        case "showAll":
            console.log(await getProducts())
            break
        case "show":
            console.log(await getProduct(args[1]))
            break
        case "delete":
            console.log(await deleteProduct(args[1]))
            break

             
        default:
            break;
    }

  await disconnect()
}


main()