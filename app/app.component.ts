import {Component, ChangeDetectionStrategy} from "@angular/core";
import { PredictionsByStop, TransportMode, TransportRoute, RouteDirection, Vehicle, Alert, MbtaService } from './mbta.service';
const _ = require('lodash');
const moment = require('moment');

class Trip {
    constructor(public destination: string, public eta: string, public human: string) { }
}
class Direction {
    constructor(public direction: string, public trips: Array<Trip>) { }
}

@Component({
    selector: "my-app",
    templateUrl: "app.component.html",
    providers: [MbtaService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
    public directions: Array<Direction>;
    public trips: Array<Trip>;
    public output: string = null;
    public errorMsg: string = null;

    constructor(private mbtaService: MbtaService) {
        this.directions = [];
        this.trips = [];
    };

    public get data(): string {
        return this.output;
    };

    public onTap(): void {
        this.fetchData();
    };

    private fetchData() {
        this.mbtaService.getPrediction().subscribe(
            (result) => {
                if (! result) {
                    this.errorMsg = 'no trains found';
                    console.error(this.errorMsg);
                    return;
                }
                let output = result.map((route) => {
                    return route.direction.map((direction) => {
                        return new Direction(
                            direction.direction_name,
                            direction.trip.map((trip) => {
                                return new Trip(trip.trip_headsign || null, `${trip.pre_away} seconds`, moment.duration(Number(trip.pre_away), 'seconds').humanize(true) || null);
                            })
                        );
                    });
                });
                this.output = JSON.stringify(output[0], null, 2);
                this.directions = output[0];
                console.log('output', this.output);
                console.log('this.directions', JSON.stringify(this.directions, null, 2));
            },
            (error) => {
                this.output = JSON.stringify(error, null, 2);
                this.errorMsg = <any>error;
            });
    }
}
