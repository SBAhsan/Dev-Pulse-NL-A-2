import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
    path: path.join(process.cwd(), '.env')
})

const config = {
    connection_string: process.env.CONNECTION_STRING as string,
    port: process.env.PORT,
    access_key: process.env.ACCESS_KEY as string,
    access_token_expires_in: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
    refresh_key: process.env.REFRESH_KEY as string,
    refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN as string
}

export default config;