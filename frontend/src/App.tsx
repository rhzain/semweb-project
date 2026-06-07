import { Route, Routes } from "react-router-dom";

import { AppHeader } from "@/components/layout/app-header";
import ComparePage from "@/pages/compare/page";
import DataPage from "@/pages/data/page";
import DetailPage from "@/pages/detail/page";
import GraphPage from "@/pages/graph/page";
import HomePage from "@/pages/home/page";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <Routes>
          <Route element={<HomePage />} path="/" />
          <Route element={<DataPage />} path="/data" />
          <Route element={<DetailPage />} path="/species/:speciesId" />
          <Route element={<ComparePage />} path="/compare" />
          <Route element={<GraphPage />} path="/graph" />
        </Routes>
      </main>
    </div>
  );
}

export default App;
