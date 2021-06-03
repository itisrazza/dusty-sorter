import { Config, getConfig } from "./config"
import SpotifyApi from "spotify-web-api-node"

export type TrackWithFeatures = {
    id: string,
    track: SpotifyApi.TrackObjectFull,
    features: SpotifyApi.AudioFeaturesObject
};

export async function getSpotifyClient(config: Config): Promise<SpotifyApi> {
    const spotify = new SpotifyApi(config.api);

    // get user grant
    const grant = await spotify.clientCredentialsGrant();
    spotify.setAccessToken(grant.body.access_token);

    return spotify;
}

export async function getPlaylistTracksWithFeatures(spotify: SpotifyApi, playlist: string): Promise<TrackWithFeatures[]> {
    // get all the songs from the playlist
    const tracks: SpotifyApi.PlaylistTrackObject[] = []
    let playlistTotal = (await spotify.getPlaylist(playlist)).body.tracks.total;
    while (tracks.length < playlistTotal) {
        const offset = tracks.length
        const limit = tracks.length + 100 < playlistTotal
            ? 100
            : playlistTotal - tracks.length;

        const data = await spotify.getPlaylistTracks(playlist, {
            offset, limit, fields: "items"
        })
        tracks.push(...data.body.items);
    }

    // get the track features
    const features: { [key: string]: SpotifyApi.AudioFeaturesObject } = {}
    let start = 0;
    const limit = 100;
    while (Object.keys(features).length < playlistTotal) {
        const end = Math.min(start + limit, playlistTotal);

        const data = await spotify.getAudioFeaturesForTracks(tracks
            .slice(start, end)
            .map(track => track.track.id));
        data.body.audio_features.map(feature => features[feature.id] = feature);

        start = end;
    }

    // combine them
    return tracks.map(track => {
        return {
            id: track.track.id,
            track: track.track,
            features: features[track.track.id]
        };
    });
}
