import http from 'http'
import { IoManager } from './managers/IoManager'

const io = IoManager.getIo()

io.on('connection',(client) => {
    client.on('event' , data => {})
    client.on('disconnect' , data => {})
})

io.listen(3000)