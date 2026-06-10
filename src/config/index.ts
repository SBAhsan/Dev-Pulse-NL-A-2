import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
    path: path.join(process.cwd(), '.env')
})

const config = {
    connection_string: process.env.CONNECTION_STRING as string,
    port: process.env.PORT
}

export default config;