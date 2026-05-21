import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';

import Routes from "./router";
import Server from "./server";
import Connections from "./connection";

const app = express();
const clientBuildPath = path.resolve(__dirname, '../../client/build');

app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({ extended: true}))

const corsOptions : cors.CorsOptions = {
    origin: process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(",")
        : ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    credentials:true,
}
app.use(cors(corsOptions));

app.use(express.static(clientBuildPath));

app.use(Routes);

const server = new Server(app);
const connections = new Connections(server);

server.listen();
