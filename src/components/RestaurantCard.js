import { IoCheckmarkCircle } from "react-icons/io5";

export default function RestaurantCard({ restaurant }) {
  return (
    <div className="restaurant-card">
      <img src={restaurant.image} alt={restaurant.name} />
      <div className="restaurant-info">
        <h3>
          {restaurant.name}
          {restaurant.isVerified && (
            <IoCheckmarkCircle style={{ color: '#10B981', marginLeft: '5px' }} />
          )}
        </h3>
        <p>Rating: {restaurant.rating}</p>
        <p>Distance: {restaurant.distance}</p>
        <p>Platforms: {restaurant.platforms.join(", ")}</p>
      </div>
    </div>
  );
}
