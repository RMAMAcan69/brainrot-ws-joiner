const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.post('/send', (req, res) => {
  try {
    const log = req.body;
    console.log('Primljen log:', log);

    const wsData = JSON.stringify({
      type: 'high_brainrot',
      brainrot: log.brainrot || log.value || log.genText,
      serverId: log.serverId || log.jobId,
      players: log.players || 0,
      joinScript: log.joinScript || log.join_script
    });

    let sent = 0;
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(wsData);
        sent++;
      }
    });

    res.json({ status: 'sent', clients: sent });
  } catch (e) {
    console.error('Greška:', e);
    res.status(500).json({ error: 'bad request' });
  }
});

wss.on('connection', (ws) => {
  console.log('Auto joiner spojio! Total:', wss.clients.size);
  ws.on('close', () => {
    console.log('Auto joiner odspojen. Total:', wss.clients.size);
  });
});

app.get('/', (req, res) => {
  res.send(`Brainrot WS Proxy OK! Aktivnih joinera: ${wss.clients.size}`);
});

server.listen(PORT, () => {
  console.log(`Server radi na portu ${PORT}`);
});
