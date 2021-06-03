import express from "express"
import SpotifyApi from "spotify-web-api-node"

export async function runCallbackServer(): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            const app = express()
            const server = app.listen(8080)

            app.get("/callback", (req, res) => {
                res.contentType("text")

                if (req.query["state"] !== "bender-sorter-ftw") {
                    res.status(400);
                    res.write("The state didn't match expected one.")
                    return
                }

                if (typeof req.query["code"] !== "string") {
                    res.status(400)
                    res.write("The code is not a string.")
                    return
                }

                res.write("We've got your Spotify login. You're good to go!")
                server.close();
                resolve(req.query["code"])
            });
        } catch (e: unknown) {
            reject(e)
        }
    });
}
