import http from "http"
import { Server } from "socket.io";
const server = http.createServer()

export class IoManager{

    private static io:Server;
    private static instance: IoManager 

    public static getIo(){
        if (this.io) {
            this.instance = new IoManager()            
            const io = new Server(server)
            this.io = io
        }
        return this.io
    }
}