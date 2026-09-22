import mongoose, {connect, disconnect} from "mongoose"
process.loadEnvFile()

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

const productSchema = new mongoose.Schema<IProduct>({

        name: String,
        price: Number,
        stock: String,
        category: String
})

const Product = mongoose.model("product", productSchema)

const getProducts = async () => {
  return await Product.find()
}

const getProduct = async (id:string) => {

}

const createProduct = async (data: IProduct) => {

}

const updateProduct = async (id:string, updates: string[]) => {

}

const deleteProduct = async (id: string) => {

}

const args = process.argv.splice(2)
const action = args[0]



const main = async () => {
    connectDb(URI_DB)

    switch (action) {
        case "read":
            console.log(await getProducts())
            break

             
        default:
            break;
    }

  await disconnect()
}


main()