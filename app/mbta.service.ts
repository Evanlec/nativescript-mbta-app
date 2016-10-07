import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable }     from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
const _ = require('lodash');

export class Alert {
    constructor(
        public message: string
    ) { }
}
export class Vehicle {
    constructor(
        public vehicle_id: string,
        public vehicle_lat: string,
        public vehicle_lon: string,
        public vehicle_bearing: string,
        public vehicle_timestamp: string
    ) { }
}
export class Trip {
    constructor(
        public trip_id: string,
        public trip_name: string,
        public trip_headsign: string,
        public pre_dt: string,
        public pre_away: string,
        public sch_arr_dt: string,
        public sch_dep_dt: string,
        public vehicle: Vehicle
    ) { }
}
export class RouteDirection {
    constructor(
        public direction_id: string,
        public direction_name: string,
        public trip: Trip[]
    ) { }
}
export class TransportRoute {
    constructor(
        public route_id: string,
        public route_name: string,
        public direction: RouteDirection[]
    ) { }
}
export class TransportMode {
    constructor(
        public route_type: string,
        public mode_name: string,
        public route: TransportRoute[]
    ) { }
}
export class PredictionsByStop {
    constructor(
        public stop_id: string,
        public stop_name: string,
        public alert_headers: Alert[],
        public mode: TransportMode[]
    ) { }
}

@Injectable()
export class MbtaService {
    constructor (private http: Http) {}
    private upstream_url: string = "http://realtime.mbta.com/developer/api/v2/predictionsbystop?api_key=wX9NwuHnZU2ToO7GmGR9uw&stop=place-andrw&format=json";

    public getPrediction(): Observable<TransportRoute[]> { 
        return this.http.get(this.upstream_url) 
        .map(this.extractData)
        .catch(this.handleError)
    };
    private extractData(res: Response): TransportRoute[] {
        let body = res.json();
        if (!body.mode) {
            return null;
        }
        let prediction = new PredictionsByStop(body.stop_id, body.stop_name, body.alert_headers, body.mode);
        let output = _.find(prediction.mode, (mode) => {
            return mode.route_type == '1';
        });
        return output && output.route ? output.route : null;
    };
    private handleError(error: any) {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console instead
        return Observable.throw(errMsg);
    };
}

