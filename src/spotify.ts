import { Config, getConfig } from "./config"
import SpotifyWebApi from "spotify-web-api-node"
import express from "express"

const app = express()

export async function getSpotifyClient(config: Config): Promise<SpotifyWebApi> {
    const spotify = new SpotifyWebApi(config.api);

    // get user grant
    const grant = await spotify.clientCredentialsGrant();
    spotify.setAccessToken(grant.body.access_token);

    return spotify;
}
