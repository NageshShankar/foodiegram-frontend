import React, { useState, useEffect } from "react";
import { useSearch } from "../../context/SearchContext";
import api from "../../utils/api";
import { getAssetUrl } from "../../config";
import "../../styles/SearchPage.css";

export default function SearchLeftPanel({ onSelectDish }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);

  const { recentSearches, addSearch, removeSearch } = useSearch();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [reelsRes, restRes] = await Promise.all([
          api.get('/reels'),
          api.get('/restaurants')
        ]);

        const formattedReels = (reelsRes.data.data || []).map(reel => ({
          ...reel,
          id: reel._id,
          type: 'dish',
          dishName: reel.foodName || reel.caption || 'Tasty Dish',
          creatorName: reel.creator?.name || reel.creatorName,
          restaurantName: reel.restaurant?.restaurantName || reel.restaurant?.name || 'Unknown Restaurant',
          zomatoLink: reel.restaurant?.zomatoLink,
          swiggyLink: reel.restaurant?.swiggyLink,
          prices: reel.prices || [],
          displayImage: getAssetUrl(reel.videoUrl || reel.videoSrc)
        }));

        const formattedRestaurants = (restRes.data.data || []).map(rest => {
          const apps = [];
          if (rest.zomatoLink) apps.push({ appName: 'Zomato', rating: rest.rating || 4.2 });
          if (rest.swiggyLink) apps.push({ appName: 'Swiggy', rating: rest.rating || 4.1 });

          return {
            ...rest,
            id: rest._id,
            type: 'restaurant',
            dishName: rest.name || rest.restaurantName,
            deliveryApps: apps,
            creatorName: apps.length > 0 ? apps.map(a => a.appName).join(' & ') : 'Delivery Available',
            displayImage: rest.restaurantPhoto ? getAssetUrl(rest.restaurantPhoto)
              : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
            zomatoLink: rest.zomatoLink,
            swiggyLink: rest.swiggyLink
          };
        });

        setAllData([...formattedReels, ...formattedRestaurants]);
      } catch (error) {
        console.error("Search fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData([]);
      return;
    }

    const lower = searchTerm.toLowerCase();
    const matches = allData.filter(item =>
      item.dishName?.toLowerCase().includes(lower) ||
      item.creatorName?.toLowerCase().includes(lower) ||
      (item.type === 'restaurant' && item.name?.toLowerCase().includes(lower))
    );
    setFilteredData(matches);
  }, [searchTerm, allData]);

  const handleSelectItem = (item) => {
    if (item.type === 'restaurant') {
      // For restaurants, we might want a different view or just show their best dish
      // For now, let's map it to a format the right panel understands
      onSelectDish({
        ...item,
        id: item.id,
        dishName: item.dishName,
        image: item.displayImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
        rating: item.rating || 4.2,
        bestApp: item.deliveryApps?.[0]?.appName || "Various",
        price: "Menu varies",
        isRestaurant: true,
        deliveryApps: item.deliveryApps,
        zomatoLink: item.zomatoLink,
        swiggyLink: item.swiggyLink
      });
      return;
    }

    // Existing reel/dish logic (prices now come from reel.prices which is an object)
    let bestApp = "Zomato";
    let bestPrice = "199";
    let bestRating = 4.5;

    const prices = item.prices || {};
    if (prices.zomatoPrice) {
      bestApp = "Zomato";
      bestPrice = prices.zomatoPrice;
    } else if (prices.swiggyPrice) {
      bestApp = "Swiggy";
      bestPrice = prices.swiggyPrice;
    }

    const dish = {
      id: item._id || item.id,
      dishName: item.dishName,
      restaurantName: item.restaurantName,
      type: 'dish',
      image: item.displayImage,
      rating: bestRating,
      bestApp: bestApp,
      price: `₹${bestPrice}`,
      zomatoLink: item.zomatoLink,
      swiggyLink: item.swiggyLink,
      prices: prices // Pass object-based prices to Right Panel
    };

    addSearch(dish);
    onSelectDish(dish);
    setSearchTerm("");
  };

  const handleSearchSubmit = () => {
    if (filteredData.length > 0) {
      handleSelectItem(filteredData[0]);
    }
  };

  return (
    <div className="search-left">
      {/* HEADER */}
      <div className="search-left-header">
        <div>
          <h2 className="search-title">Discovery</h2>
          <p className="search-subtitle">
            Find the best food and restaurants on Zomato & Swiggy.
          </p>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="search-input-wrapper">
        <span className="search-input-icon">🔍</span>
        <input
          type="text"
          placeholder="Search dishes, restaurants..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
        />
        <button
          className="search-input-btn"
          onClick={handleSearchSubmit}
          disabled={!searchTerm.trim()}
        >
          Search
        </button>
      </div>

      {/* SEARCH RESULTS */}
      {searchTerm !== "" && (
        <div className="recent-searches">
          {filteredData.length > 0 ? (
            filteredData.map((item, index) => (
              <div
                key={`${item.type}-${item.id}`}
                className={`recent-item ${item.type}-item animate-up`}
                onClick={() => handleSelectItem(item)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="recent-image-wrapper">
                  {item.type === 'restaurant' ? (
                    <img src={item.displayImage} alt={item.dishName} className="recent-image" />
                  ) : (
                    <video src={item.displayImage} className="recent-image" muted autoPlay loop playsInline />
                  )}
                </div>
                <div className="recent-info">
                  <div className="recent-title">
                    {item.dishName || item.name}
                    {item.type === 'restaurant' && <span className="type-badge">Restaurant</span>}
                  </div>
                  <div className="recent-subtitle">
                    {item.type === 'restaurant'
                      ? `Available on: ${item.deliveryApps?.map(a => a.appName).join(', ') || 'Online Order'}`
                      : `at ${item.restaurantName || 'Restaurant'} · by ${item.creatorName}`}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="no-results">No matches found.</p>
          )}
        </div>
      )}

      {/* RECENT SEARCHES */}
      {searchTerm === "" && recentSearches.length > 0 && (
        <div className="recent-searches">
          <div className="recent-header">
            <span className="recent-title-label">Recent searches</span>
            <span className="recent-hint">Tap to quickly reopen</span>
          </div>

          {recentSearches.map((item, index) => {
            return (
              <div
                key={item.id}
                className="recent-item animate-up"
                onClick={() => onSelectDish(item)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="recent-image-wrapper">
                  {item.image?.match(/\.(mp4|mov|avi|wmv|mkv)$/) || item.type === 'dish' ? (
                    <video src={item.image} className="recent-image" muted autoPlay loop playsInline />
                  ) : (
                    <img src={item.image} alt={item.dishName} className="recent-image" />
                  )}
                </div>

                <div className="recent-info">
                  <div className="recent-title">{item.dishName}</div>
                  <div className="recent-subtitle">
                    {item.restaurantName ? `at ${item.restaurantName} · ` : ''}
                    ⭐ {item.rating} · Best on {item.bestApp}
                  </div>
                </div>

                <button
                  className="recent-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSearch(item.id);
                  }}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
