import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import Trip from "../classes/trip.class";
import {BaseQueryResult} from "@reduxjs/toolkit/dist/query/baseQueryTypes";
import ConfirmedTrip from "../classes/ConfirmedTrip.class";
import ToBeScheduledTrip, {ToBeScheduledTripApiInterface} from "../classes/ToBeScheduledTrip.class";
import {RootState} from "../stores/store";
import {prepareAuthentication} from "../stores/auth.store";
import Config from "../config";

interface RetrieveDetail {
    id: number;
}

export interface TripResult {
    id: number;
    from: string;
    to: string;
    initialAvailability?: Date;
    endAvailability?: Date;
    confirmedPickup?: Date;
    arrival: Date;
    shiftId?: number;
}

export interface TripListResult {
    toBeScheduledTrips: ToBeScheduledTrip[];
    confirmedTrips: ConfirmedTrip[];
}

type TripCreateRequest = ToBeScheduledTripApiInterface;

export const apiSlice = createApi({
    reducerPath: "api/trip",
    baseQuery: fetchBaseQuery({baseUrl: `${Config.baseUrl}/trip`, prepareHeaders: prepareAuthentication,}),
    endpoints: (builder) => ({
        tripList: builder.mutation<TripListResult, void>({
            query: (request) => ({
                url: "/",
                method: "GET",
            }),
            transformResponse: (response: { data: TripResult[] }) => {
                const trips = response.data.map(trip => fromTripResult(trip));
                return {
                    toBeScheduledTrips: trips.filter(trip => trip instanceof ToBeScheduledTrip) as ToBeScheduledTrip[],
                    confirmedTrips: trips.filter(trip => trip instanceof ConfirmedTrip) as ConfirmedTrip[],
                }
            }
        }),
        tripDetail: builder.mutation<ConfirmedTrip | ToBeScheduledTrip, RetrieveDetail>({
            query: (request) => ({
                url: `/${request.id}`,
                method: "GET",
            }),
            transformResponse: (response: { data: TripResult }) => {
                return fromTripResult(response.data);
            }
        }),
        createTrip: builder.mutation<ToBeScheduledTrip, TripCreateRequest>({
            query: (request) => ({
                url: '/',
                method: 'POST',
                body: request
            }),
            transformResponse: (response: { data: TripResult }) => {
                return ToBeScheduledTrip.fromTripResult(response.data);
            }
        })
    }),
});

export const {useTripListMutation, useTripDetailMutation, useCreateTripMutation} = apiSlice;


function fromTripResult(tripResult: TripResult) {
    if(tripResult.shiftId) {
        return ConfirmedTrip.fromTripResult(tripResult);
    } else {
        return ToBeScheduledTrip.fromTripResult(tripResult)
    }
}