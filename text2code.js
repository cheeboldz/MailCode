/**
 * A very rough Node.js server script to interact with 
 * the Repl.it interpreter API for remote code execution.
 * 
 * Author(s): Devin Kelly
 * Date: 03/04/2020
 * 
 * Expected Styling: Double quotes, 
 *                   Omit semicolon statement terminators,
 *                   Var variable preference
 * 
 * @Repl_Crosis_Docs https://crosis.turbio.repl.co/
 * 
 **/
global.WebSocket = require("ws");

const crosis = require("@replit/crosis")
const http = require("http")
const readline = require("readline")
const fetch = require("node-fetch")

// Client requires specific API key and repl instance IDs 
// Must be named { apiKey } for server recognition
const apiKey = "wjokOCTp3EkKMFrzrpYuRA==:BE7BPESUsn3ZbFje0qmy6g=="
const python3_repl_ID = "326fde4f-44ad-44ff-9626-4e2f046b667f"

// We need client connection to occur asynchronously to avoid client interruption
async function repl_client_connect() {
  // Create new client for repl API interactions
  const repl_client = new crosis.Client()

  // Acquire a token corresponding to an existing repl instance.
  const token = await get_repl_connection_token(apiKey, python3_repl_ID)

  // Connect our client to our intended repl instance
  // via the generated token
  await repl_client.connect({ token })

  // Open a client channel corresponding to the 
  // repl interpreter service { interp2 } which
  // directly implements Prybar
  const interpreter_channel = await repl_client.openChannel({
    name: "interper",
    service: "interp2"
  })

  repl_client.close()
}

repl_client_connect()

/**
 * get_connection_token is an asynchronous function
 * that processes a POST to the repl API in order to 
 * receive a JSON token corresponding to the provided
 * repl instance of the given repl ID
 * 
 * @param {api_key}: the key to interact with repl api
 * @param {repl_ID}: ID of a repl.it instance
 * @returns a JSON representation of the repl token
 **/
function get_repl_connection_token(apiKey, repl_ID) {
  return fetch(`https://repl.it/api/v0/repls/${repl_ID}/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ apiKey })
  }).then(res => res.json())
}

