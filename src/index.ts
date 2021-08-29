import WebSocket from 'ws'
import env from 'env-var'
import { HomeAssistantMessage } from './types/homeAssistant'
import express from 'express'
import { Server } from 'socket.io'
import http from 'http'
import path from 'path'

const haHost = env.get('HA_HOST').required().asString()
const haToken = env.get('HA_ACCESS_TOKEN').required().asString()
const port = env.get('PORT').default(3000).asPortNumber()

const app = express()
const ws = new WebSocket(`wss://${haHost}/api/websocket`)
const server = http.createServer(app)
const io = new Server(server)

const sensorName = 'sensor.desk_height'

let messageId: number = 1
let deskHeight: number | null = null

io.on('connection', (socket) => {
  socket.emit('height', deskHeight)
})

app.get('/standing', (_req, res) => {
  res.sendFile(path.resolve('static/standing.html'))
})

server.listen(port, () => {
  console.log(`listening on *:${port}`)
})

ws.on('message', function incoming (message) {
  if (message instanceof Buffer) {
    const json = JSON.parse(message.toString())

    if (json.type !== undefined) {
      handleHomeAssistantMessage(json as HomeAssistantMessage)
    }
  }
})

function handleHomeAssistantMessage (data: HomeAssistantMessage): void {
  switch (data.type) {
    case 'auth_required': {
      authenticate()
      break
    }
    case 'auth_invalid': {
      exitWithError(new Error(`Authentication failed with reason: ${data.message}`))
      break
    }
    case 'auth_ok': {
      subscribeToEvents()
      break
    }
    case 'result': {
      if (data.success && data.result != null) {
        const deskEntity = data.result.find((entity) => entity.entity_id === sensorName)
        if (deskEntity !== undefined) {
          updateDeskHeight(deskEntity.state)
        }
      }
      break
    }
    case 'event': {
      if (data.event.event_type === 'state_changed' && data.event.data.entity_id === sensorName) {
        updateDeskHeight(data.event.data.new_state.state)
      }

      break
    }
    default: {
      console.log('Unknown message type received', data)
      break
    }
  }
}

function authenticate (): void {
  ws.send(JSON.stringify({
    type: 'auth',
    access_token: haToken
  }))
}

function exitWithError (error: Error): void {
  console.error(error)

  process.exit(1)
}

function subscribeToEvents (): void {
  // Get initial state
  ws.send(JSON.stringify({
    id: messageId,
    type: 'get_states'
  }))
  messageId++

  // Subscribe to ongoing changes
  ws.send(JSON.stringify({
    id: messageId,
    type: 'subscribe_events',
    event_type: 'state_changed'
  }))
  messageId++
}

function updateDeskHeight (rawHeight: string): void {
  deskHeight = parseInt(rawHeight, 10)
  io.emit('height', deskHeight)

  console.log(deskHeight)
}
