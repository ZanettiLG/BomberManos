import path from "path";
import certs from "./certs";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
const initialPort = parseInt(process.env.PORT || "4000");

const ports = {
    http:initialPort,
    https:initialPort+1
};

const postgres = process.env.POSTGRES;

export { certs, ports, postgres };