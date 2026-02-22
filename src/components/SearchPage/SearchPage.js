import React, { useState } from "react";
import SearchLeftPanel from "./SearchLeftPanel";
import SearchRightPanel from "./SearchRightPanel";
import Sidebar from "../Sidebar/Sidebar";
import "../../styles/SearchPage.css";

export default function SearchPage() {
  const [selectedDish, setSelectedDish] = useState(null);

  return (
    <div className="search-layout-wrapper" style={{ display: 'flex' }}>
      <Sidebar />
      <div className="search-layout" style={{ flex: 1 }}>
        {/* LEFT: Instagram-style search */}
        <SearchLeftPanel onSelectDish={setSelectedDish} />

        {/* RIGHT: Dish detail preview */}
        <SearchRightPanel dish={selectedDish} />
      </div>
    </div>
  );
}
