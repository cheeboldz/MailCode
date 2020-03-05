/**
 * A very rough Node.js server script to interact with 
 * the Repl.it interpreter API for remote code execution.
 * 
 * Author(s): Devin Kelly
 * Date: 03/05/2020
 * 
 * Expected Styling: Double quotes, 
 *                   Omit semicolon statement terminators,
 *                   const variable preference,
 *                   JavaDoc comment preference
 * 
 * Repl Crosis Docs https://crosis.turbio.repl.co/
 * 
 * TODO: Process output from sent program
 * TODO: Implement email server interaction
 */
global.WebSocket = require("ws");
const crosis = require("@replit/crosis")
const http = require("http")
const readline = require("readline")
const fetch = require("node-fetch")
const file_system = require("fs")

/**
 * constants.json specifies our { apiKey } as well as
 * repl instance IDs indicated by their language
 * file extension (eg: py, js, r, etc.)
 */
const constants = require("./constants.json")

const cmd_input = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                  })
cmd_input.setPrompt("(interp2) > ")

/**
 * repl_client_process() specifies the creation of a repl
 * client, it's connection orientation to the repl api servers,
 * and executes provided code snippets
 * 
 * function must be asynchronous to { await } the { Promise }
 * of each client call (ie: callback response). This is to 
 * ensure that commands are executed in order and that a 
 * command's result is known prior to the next command.
 */
async function repl_client_process() {

  const repl_client = new crosis.Client()

  /**
   * Acquire a token corresponding to an existing repl instance.
   */
  const token = await get_repl_connection_token(constants.apiKey, constants.py)

  /**
   * Connect our created client to the repl instance
   * corresponding to our generated { token }
   */
  await repl_client.connect({ token })

  /**
   * Open a client channel corresponding to the 
   * repl interpreter service { interp2 } which
   * directly implements Prybar -- the middleware
   * interpretation framework for Repl
   */
  const interpreter_channel = repl_client.openChannel({
                                name: "interper",
                                service: "interp2"
                              })

  /**
   * Specify what we want to occur once a command
   * response is received from the interpretation
   * channel
   */
  interpreter_channel.on("command", (command) => {
    console.log(command)
  })

  /**
   * Specify what we want to occur once a command
   * is input to the command line 
   */
  cmd_input.on("line", (line) => {
    if(!line) {
      cmd_input.close()
      repl_client.close()
      process.exit()
    } else {
      interpreter_channel.send({ input: `${line}\n`})
    }
  })
}

repl_client_process()


/**
 * get_connection_token is an asynchronous function
 * that processes a POST to the repl API in order to 
 * receive a JSON token corresponding to the provided
 * repl instance of the given repl ID
 * 
 * @param {api_key}: the key to interact with repl api
 * @param {repl_ID}: ID of a repl.it instance
 * @returns a JSON representation of the repl token
 */
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

