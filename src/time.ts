export class Time {
    public time: number = 0;

    public constructor(time: number) {
        this.time = time;
    }

    public days() {
        return Math.floor(this.time / 60 / 60 / 24);
    }

    public hours() {
        return Math.floor(this.time / 60 / 60) % 24;
    }

    public minutes() {
        return Math.floor(this.time / 60) % 60;
    }

    public seconds() {
        return Math.floor(this.time) % 60;
    }

    public decimals() {
        return this.time % 1;
    }

    public static fromHour(hour: number): Time {
        return new Time(hour * 60 * 60);
    }

    public add(time: Time) {
        return new Time(this.time + time.time);
    }

    public addMilliseconds(ms: number) {
        return new Time(this.time + ms / 1000);
    }

    public floorDay() {
        return new Time(this.time % (60 * 60 * 24))
    }

    public compareTo(b: Time) {
        return this.time - b.time;
    }

    public toString() {
        const hours = this.hours().toString().padStart(2, '0')
        const minutes = this.minutes().toString().padStart(2, '0')
        const seconds = this.seconds().toString().padStart(2, '0')

        let str = `${hours}:${minutes}:${seconds}.${this.decimals()}`
        if (this.days() > 0) {
            str = `${this.days()} days, ${str}`
        }

        return str;
    }
}
