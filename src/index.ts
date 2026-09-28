import mongoose, {connect, disconnect} from "mongoose"
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
}, {
    versionKey: false
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

        return error.message
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
        return handleError(e)
    }
}

const createProduct = async (data: string[]) => {
    try {
        const newProduct: IProduct = {
        name: "producto",
        price: 0,
        stock: 0,
        category: "sin categoria"
    }
 
    if (data[0]?.split("=")[0] !== "name") {
    console.log("Name is required")
     return
    }
    
    for (let i = 0; i < data.length; i++) {
        const prop = data[i]?.split("=") as string[]
        const nameProp = prop[0]
        const value = prop[1]

    switch (nameProp) {
    case "name":
      newProduct.name = value ? value : newProduct.name
      break
    case "price":
      newProduct.price = value ? Number(value) : newProduct.price
      break
    case "stock":
      newProduct.stock = value ? Number(value) : newProduct.stock
      break
    case "category":
      newProduct.category = value ? value : newProduct.category
      break

      default:
        throw generateError("Invalidad Data to create Product", "InvalidadData")
        }
    }

        return Product.create(newProduct)
        
    }   catch (error) { 

        const e = error as Error
        return handleError(e)
    }



    
   
    /*   if (data[0]?.replace("--","") !== "name") {
       console.log("Name is required") 
       return
    }
    
    for (let index = 0; index < data.length; index += 2) {
        const prop = data[index]?.replace("--","")
        const value = data[index + 1] as string

        if (prop === "name") newProduct.name = value   
    }

       console.log(newProduct) */ 

}

const updateProduct = async (id: string | undefined, updates: string[]) => {
    
    try {
        const data: Partial<IProduct> = {} 
        console.log("dentro de update")

        for(const update of updates) {
            const [prop, value] = update.split("=")
            console.log(prop)
            console.log(value) 

        }


        //return await Product.findByIdAndUpdate(id, data)
    } catch (error) {
        
    }
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
        case "create":
            console.log(await createProduct(args.splice(1)))
            break
        case "show":
            console.log(await getProduct(args[1]))
            break
        case "update":
            console.log(updateProduct(args[1], args))
        case "delete":
            console.log(await deleteProduct(args[1]))
            break

           default:
            break;
    }
        await disconnect()
}


main()