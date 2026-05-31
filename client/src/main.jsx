import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, NavLink, Navigate, Outlet } from "react-router-dom";
import AssetListPage from "./pages/assets/AssetsList.jsx";
import AssetFormPage from "./pages/assets/AssetsPage.jsx";
import AssetRentsList from "./pages/assetrents/AssetRentsList.jsx";
import AssetRentsPage from "./pages/assetrents/AssetRentsPage.jsx";
import AssetReportsPage from "./pages/reports/AssetReportsPage.jsx"

function Navbar() {
    return (
        <>
            <nav>
                <NavLink to="/assets">Assets</NavLink>
                <NavLink to="/assetrents">Asset Rents</NavLink>
                <NavLink to="/reports">Reports</NavLink>
            </nav>
            <main>
                <Outlet />
            </main>
        </>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(
    <BrowserRouter>
        <Routes>
            <Route element={<Navbar />}>
                <Route path="/" element={<Navigate to="/assets" replace />} />
                <Route path="/assets" element={<AssetListPage />} />
                <Route path="/assets/new" element={<AssetFormPage mode="create" />} />
                <Route path="/assets/:code" element={<AssetFormPage mode="view" />} />
                <Route path="/assets/:code/edit" element={<AssetFormPage mode="edit" />} />
                <Route path="/assetrents" element={<AssetRentsList />} />
                <Route path="/assetrents/new" element={<AssetRentsPage mode="create" />} />
                <Route path="/assetrents/:rent_code" element={<AssetRentsPage mode="view" />} />
                <Route path="/assetrents/:rent_code/edit" element={<AssetRentsPage mode="edit" />} />
                <Route path="/reports" element={<AssetReportsPage />} />
            </Route>
        </Routes>
    </BrowserRouter>
);