import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

import CourtBooking from "./pages/booking/CourtBooking";
import BookingDetail from "./pages/booking/BookingDetail";
import CreateBooking from "./pages/booking/CreateBooking";

import EquipmentRental from "./pages/rental/EquipmentRental";
import RentalDetail from "./pages/rental/RentalDetail";
import CreateRental from "./pages/rental/CreateRental";

import Restringing from "./pages/restringing/Restringing";
import WorkOrderDetail from "./pages/restringing/WorkOrderDetail";
import CreateWorkOrder from "./pages/restringing/CreateWorkOrder";

import CoachingSession from "./pages/coaching/CoachingSession";
import SessionDetail from "./pages/coaching/SessionDetail";
import BookSession from "./pages/coaching/BookSession";

import POS from "./pages/pos/POS";
import Receipt from "./pages/pos/Receipt";

import SalesHistory from "./pages/sales/SalesHistory";
import PointsAnalysis from "./pages/sales/PointsAnalysis";

import DataMembers from "./pages/data/DataMembers";
import DataCourts from "./pages/data/DataCourts";
import DataAssets from "./pages/data/DataAssets";
import DataProducts from "./pages/data/DataProducts";
import DataCoaches from "./pages/data/DataCoaches";
import CreateMember from "./pages/data/CreateMember";
import CreateCourt from "./pages/data/CreateCourt";
import CreateAsset from "./pages/data/CreateAsset";
import CreateProduct from "./pages/data/CreateProduct";
import CreateCoach from "./pages/data/CreateCoach";
import CustomerEdit from "./pages/data/CustomerEdit";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/booking" replace />} />

        <Route path="booking" element={<CourtBooking />} />
        <Route path="booking/new" element={<CreateBooking />} />
        <Route path="booking/:id" element={<BookingDetail />} />

        <Route path="rental" element={<EquipmentRental />} />
        <Route path="rental/new" element={<CreateRental />} />
        <Route path="rental/:id" element={<RentalDetail />} />

        <Route path="restringing" element={<Restringing />} />
        <Route path="restringing/new" element={<CreateWorkOrder />} />
        <Route path="restringing/:id" element={<WorkOrderDetail />} />

        <Route path="coaching" element={<CoachingSession />} />
        <Route path="coaching/new" element={<BookSession />} />
        <Route path="coaching/:id" element={<SessionDetail />} />

        <Route path="pos" element={<POS />} />
        <Route path="pos/receipt/:id" element={<Receipt />} />

        <Route path="sales" element={<SalesHistory />} />
        <Route path="sales/points" element={<PointsAnalysis />} />

        <Route path="data" element={<Navigate to="/data/members" replace />} />
        <Route path="data/members" element={<DataMembers />} />
        <Route path="data/members/new" element={<CreateMember />} />
        <Route path="data/members/:id" element={<CustomerEdit />} />
        <Route path="data/courts" element={<DataCourts />} />
        <Route path="data/courts/new" element={<CreateCourt />} />
        <Route path="data/assets" element={<DataAssets />} />
        <Route path="data/assets/new" element={<CreateAsset />} />
        <Route path="data/products" element={<DataProducts />} />
        <Route path="data/products/new" element={<CreateProduct />} />
        <Route path="data/coaches" element={<DataCoaches />} />
        <Route path="data/coaches/new" element={<CreateCoach />} />
      </Route>
    </Routes>
  );
}
