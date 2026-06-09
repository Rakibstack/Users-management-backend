
import dotenv from "dotenv";
import path from "path";


  dotenv.config({
    path: path.join(process.cwd(), '.env')
  })

 const config = {

    connecting_string : process.env.CONNECTING_STRING as string,
    port : process.env.PORT
 }

  export default config;