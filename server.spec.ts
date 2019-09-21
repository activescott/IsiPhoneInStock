/* eslint-disable no-console */
import { Server, AvailabilityResponse } from "./server"
import * as fs from "fs"
const fsPromises = fs.promises

it.skip("should do something", async () => {
  const server = new Server()
  const json: AvailabilityResponse = await server.query({
    parts: ["Z0YQ"],
    location: "98033"
  })
  console.log("json:", json)
  for (const store of json.stores) {
    console.log("store:", store)
  }
})

it.skip("should write test data", async () => {
  const server = new Server()
  const json: AvailabilityResponse = await server.query({
    parts: ["Z0YQ"],
    location: "98033"
  })

  await fsPromises.writeFile(
    "data/pickup-message-response.json",
    JSON.stringify(json),
    "utf8"
  )
})
