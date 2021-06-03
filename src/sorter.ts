import { trace } from "console";
import { monitorEventLoopDelay } from "perf_hooks";
import { Config } from "./config";
import { TrackWithFeatures } from "./spotify";
import { Time } from "./time";

type Sorter<T> = (a: T, b: T) => number;

const randomSorter = (a: any, b: any) => Math.random() < 0.5 ? -1 : 1;
const flipSorter = <T>(sorter: Sorter<T>) => (a: T, b: T) => -sorter(a, b);

const hypeSorter = (a: TrackWithFeatures, b: TrackWithFeatures) => {
    // high energy, high loudness, high danceability
    const energyDiff = a.features.energy - b.features.energy
    const loudDiff = a.features.loudness - b.features.loudness
    const danceDiff = a.features.danceability - b.features.danceability

    return -(energyDiff / 3 + loudDiff / 3 + danceDiff / 3)
};

const chillSorter = (a: TrackWithFeatures, b: TrackWithFeatures) => {
    // low energy, low loudness
    const energyDiff = a.features.energy - b.features.energy;
    const loudDiff = a.features.loudness - b.features.loudness;

    return energyDiff / 2 + loudDiff / 2
};

const morningSorter = (a: TrackWithFeatures, b: TrackWithFeatures) => {
    // high energy
    const energyDiff = a.features.energy - b.features.energy

    return -energyDiff
};

type Vibe = "hype" | "chill" | "morning"
const vibeSorter: { [vibe: string]: Sorter<TrackWithFeatures> } = {
    hype: hypeSorter,
    chill: chillSorter,
    morning: morningSorter
}

export type SortedTrack = {
    track: TrackWithFeatures,
    time: Time,
    vibe: Vibe
}

export function sortPlaylist(playlist: TrackWithFeatures[], { clock }: Config): (SortedTrack)[] {
    let time = Time.fromHour(clock.startTime);
    let vibe: Vibe = "hype"
    const vibeTimes = {
        "hype": new Time(clock.hypeVibes),
        "chill": new Time(clock.chillVibes),
        "morning": new Time(clock.morningVibes)
    }
    let unvisitedTracks = playlist.sort(randomSorter);     // randomise list to remove bias

    const playlistLength = playlist.reduce((acc, current) => acc.addMilliseconds(current.track.duration_ms), new Time(0));
    console.log(`!! Playlist is ${playlistLength} long.`)

    const targetPlaylist: (SortedTrack)[] = [];
    while (targetPlaylist.length < playlist.length) {
        // sort by target and take down a section
        const sectionLength = Math.min(unvisitedTracks.length, 20);
        const section = unvisitedTracks
            .sort(vibeSorter[vibe])
            .slice(0, sectionLength);
        unvisitedTracks = unvisitedTracks.filter(value => !section.includes(value));

        // randomise the list and add to target playlist
        targetPlaylist.push(...(section
            .sort(randomSorter)
            .map(track => { return { track, vibe, time } })));
        console.log(`${time} ~ ${targetPlaylist.length} tracks sorted. ${unvisitedTracks.length} left to go.`);

        // calculate time elapsed
        const playlistLength = section.reduce((acc, current) => acc.addMilliseconds(current.track.duration_ms), new Time(0));
        time = time.add(playlistLength);

        // update the vibe if needed
        switch (vibe) {
            case "hype":
                if (vibeTimes["chill"].compareTo(time.floorDay()) < 0) {
                    vibe = "chill";
                    console.log(`Changed vibe from "hype" to "chill".`)
                }
                break;

            case "chill":
                if (vibeTimes["morning"].compareTo(time.floorDay()) < 0) {
                    vibe = "morning"
                    console.log(`Changed vibe from "chill" to "morning".`)
                }
                break;

            case "morning":
                if (vibeTimes["hype"].compareTo(time.floorDay()) < 0) {
                    vibe = "hype"
                    console.log(`Changed vibe from "morning" to "hype".`)
                }
                break;

            default: throw new Error("you got bad vibes >:(")
        }
    }

    return targetPlaylist;
}
