import { getSpotifyClient, getPlaylistTracksWithFeatures, TrackWithFeatures } from "./spotify"
import { getConfig } from "./config"
import fs from "fs/promises"
import SpotifyApi from "spotify-web-api-node"
import { sortPlaylist } from "./sorter"

async function main() {
    const config = await getConfig()
    const spotify = await getSpotifyClient(config)
    const tracks = await getPlaylistTracksWithFeatures(spotify, config.playlist);

    const sorted = sortPlaylist(tracks, config);
    const sortedTitles = sorted
        .map(track => `${track.track.name} ~ ${track.track.artists.map(artist => artist.name).join(", ")}`)
        .join("\n");
    await fs.writeFile("playlist.txt", sortedTitles)
}

main()
