import express from "express";
import ResponseAdapterMiddleware from "../../middlewares/response-adapter-middleware";
import ControllerProvider from "../../controllers/provider";
import TripController from "../../controllers/trip-controller";
import ShiftController from "../../controllers/shift-controller";

const router = express.Router();

const shiftController: ShiftController =
    ControllerProvider.getShiftController();

router.post(
    "/",
    new ResponseAdapterMiddleware(shiftController.createShift).handler
);

router.get(
    "/path/:shiftId",
    new ResponseAdapterMiddleware(shiftController.calculatePath).handler
);

router.get(
    "/:shiftId",
    new ResponseAdapterMiddleware(shiftController.retrieveShiftDetail).handler
);
router.get(
    "/",
    new ResponseAdapterMiddleware(shiftController.retrieveShifts).handler
);

export default router;
