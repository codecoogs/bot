import http from "http";

const PORT = 6060;

const server = http.createServer(function (req: http.IncomingMessage, res: http.ServerResponse) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end("CoCo says Hi.");
})

export function keepAlive() {
  server.listen(PORT, function() {
    console.log(`CoCo is listening on port ${PORT}.`);
  });
}
