import {useCalculateShiftMutation, useRetrieveShiftMutation} from "../../../services/shift.service";
import LoadingComponent from "../../../components/Loading.component";
import ErrorComponent from "../../../components/Error.component";
import moment from "moment";
import React, {useEffect, useState} from "react";
import Checkpoint, {HopType} from "../../../classes/Checkpoint.class";
import {Button} from "../../../components/system/InputText";
import {DirectionsRenderer, GoogleMap, useJsApiLoader} from "@react-google-maps/api";
import GoogleMapOption from "../../../config/MapOptions";
import {Col, Container, Row} from "react-bootstrap";
import DateFormat from "../../../utils/DateFormat";
import DirectionsIcon from "../../../components/DirectionsIcon";
import PhoneIcon from "../../../components/PhoneIcon";

type ShiftDetailPageProps = {
    id: number;
}

const ShiftDetailPage = (props: ShiftDetailPageProps) => {
        const [doShiftRetrieve, {
            isLoading: isRetrieveLoading,
            isError: isRetrieveError,
            data: shift
        }] = useRetrieveShiftMutation();
        const [doCalculateShift, {isLoading: isCalculateLoading, isError: isCalculateError}] = useCalculateShiftMutation();

        const {isLoaded, loadError} = useJsApiLoader({googleMapsApiKey: "AIzaSyAzxSHMke4V7MM3TfjToxzcSCVtQrTPe2g"});
        useEffect(() => {
            doShiftRetrieve(props.id);
        }, [doShiftRetrieve, props.id]);
        if (isRetrieveLoading) return <LoadingComponent/>
        if (isRetrieveError || !shift) return <ErrorComponent error="Error retrieving shift detail"/>

        function startCalculateShift() {
            doCalculateShift(props.id).unwrap().then(() => doShiftRetrieve(props.id));
        }


        return (
            <Container>
                {shift.checkpoints.length === 0 && !isCalculateLoading &&
                <Button className="float-end" onClick={startCalculateShift}>CALCULATE PATH</Button>}
                <div className="body1">
                    {DateFormat.toShortDateAndTime(shift.start)} - {DateFormat.toShortDateAndTime(shift.end)}</div>
                <h1 className="header1">{shift.startingPositionName}</h1>
                {shift.checkpoints.length > 0 && (
                    <>
                        {isLoaded && <Map checkpoints={shift.checkpoints}/>}
                        <br/>
                        <h2 className="header2">Checkpoints</h2>
                        {
                            shift.checkpoints.map(checkpoint => (
                                <div>
                                    <hr/>
                                    <Row key={checkpoint.id} className="align-items-center">
                                        <Col xs="auto" className="text-center">
                                            <div className="header3"> {moment(checkpoint.time).format('HH:mm')}</div>
                                            <div
                                                className="caption">{DateFormat.toShortDay(checkpoint.time)} {DateFormat.toShortMonth(checkpoint.time)}</div>
                                        </Col>
                                        <Col className="body1">{checkpoint.positionName}</Col>
                                        <Col className="text-center">
                                            <div className="caption">{checkpoint.hopType === HopType.PICKUP && "PICKUP"}
                                                {checkpoint.hopType === HopType.DROPOUT && "DROPOUT"}</div>
                                            <div className="body1">{checkpoint.user.name} {checkpoint.user.surname}
                                            </div>
                                        </Col>

                                        <Col xs="6" md="auto" className="d-flex justify-content-center body1">

                                            <a className="link-unstyled text-center"
                                               href={`tel:${checkpoint.user.phoneNumber}`}>
                                                <PhoneIcon/><br/>Call</a>
                                        </Col>
                                        <Col xs="6" md="auto" className=" d-flex justify-content-center body1">
                                            <a className="link-unstyled text-center" target="_blank"
                                               href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${checkpoint.position.lat},${checkpoint.position.lng}`)}&travelmode=driving`}>
                                                <DirectionsIcon/><br/>
                                                Directions
                                            </a>
                                        </Col>
                                    </Row>
                                </div>
                            ))
                        }
                    </>
                )}
                {shift.checkpoints.length === 0 && (
                    <>
                        {isCalculateLoading && <LoadingComponent/>}
                        {isRetrieveError && <ErrorComponent error="Error while calculating path"/>}
                    </>
                )}
            </Container>
        );

    }
;


const Map = ({checkpoints}: { checkpoints: Checkpoint[] }) => {
    useEffect(() => {
        const directionOption: google.maps.DirectionsRequest = {
            destination: {location: new google.maps.LatLng(checkpoints[checkpoints.length - 1].position.lat, checkpoints[checkpoints.length - 1].position.lng)},
            origin: {location: new google.maps.LatLng(checkpoints[0].position.lat, checkpoints[0].position.lng)},
            travelMode: google.maps.TravelMode.DRIVING,
            optimizeWaypoints: false,
            waypoints: checkpoints.slice(1, checkpoints.length - 1).map((checkpoint) => {
                return {location: new google.maps.LatLng(checkpoint.position.lat, checkpoint.position.lng)}
            }),
        }
        const DirectionsService = new google.maps.DirectionsService();

        DirectionsService.route(directionOption, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                setDirectionResult(result,);
            } else {
                console.error(`error fetching directions`, result);
            }
        });
    }, [])
    const [directionResult, setDirectionResult] = useState<google.maps.DirectionsResult | null>(null);
    return (<div className="map-container">
        <GoogleMap zoom={7}
                   options={{styles: GoogleMapOption}}
                   center={new google.maps.LatLng(0, 0)}>
            {directionResult && <DirectionsRenderer directions={directionResult}/>}
        </GoogleMap>
    </div>);
}

export default ShiftDetailPage;