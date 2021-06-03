import { getSpotifyClient } from "./spotify"
import { getConfig } from "./config"
import { argv } from "process"

async function main() {
    const config = await getConfig()
    const spotify = await getSpotifyClient(config)

    // get all the songs from the playlist
    const playlistTracks = []
    let playlistTotal = (await spotify.getPlaylist(config.playlist)).body.tracks.total;
    while (playlistTracks.length < playlistTotal) {
        const offset = playlistTracks.length
        const limit = playlistTracks.length + 100 < playlistTotal
            ? 100
            : playlistTotal - playlistTracks.length

        console.log(`fetching ${offset}..${offset + limit} -- ${playlistTotal}`)

        const data: any = await spotify.getPlaylistTracks(config.playlist, {
            offset, limit
        })
        playlistTracks.push(...data.body.tracks.items);
    }

    let i = 0;
    for (const track of playlistTracks) {
        console.log(`${i++} - ${track.track.name} ~ ${track.track.artists.map(artist => artist.name)}`)
    }
}

main()
