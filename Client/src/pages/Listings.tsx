
import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,

} from "@/components/ui/card"
import { Link } from "react-router-dom"
import img from '../assets/Cardimg.png'
import axios from "axios";
import { Star, MapPin, Phone, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";




interface Restaurant {
   _id: string;
  name: string;
  city: string;
  category: string[];
  phone?: string;
  priceLevel?: number;
  ratingsAverage?: number;
  ratingsQuantity?: number;
  address?: string;
  website?: string;
}

const Listings: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
 const [isFavorite, setIsFavorite] = useState<Record<string, boolean>>({});
  const [sortOption, setSortOption] = useState<string>("default");
  const [viewType, setViewType] = useState<string>("grid");
  const [visibleCount, setVisibleCount] = useState(20);
  const [originalRestaurants, setOriginalRestaurants] = useState<Restaurant[]>([]);


  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/api/v1/places")
      .then((res) => {
      setRestaurants(res.data.data.places);
      setOriginalRestaurants(res.data.data.places); 
    })
      
      .catch((err) => console.log("Error:", err))
  }, [])

 const togglefavorite = (id: string) => {
  setIsFavorite(prev => ({
    ...prev,
    [id]: !prev[id]
  }));
};
// 

const getLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation not supported");
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => reject(err)
      );
    }
  });
};


const handleSort = async (option: string) => {
  setSortOption(option);

  try {
    if (option === "nearest") {
      const { lat, lng } = await getLocation();

      const res = await axios.get(
        `http://127.0.0.1:5000/api/v1/places/search?sortBy=radius&lat=${lat}&lng=${lng}`
      );

      setRestaurants(res.data.data.places);
    } 
    else if (option === "highRating") {
      const sorted = [...originalRestaurants].sort(
        (a, b) => (b.ratingsAverage ?? 0) - (a.ratingsAverage ?? 0)
      );
      setRestaurants(sorted);
    } 
    else {
      const res = await axios.get("http://127.0.0.1:5000/api/v1/places");
      setRestaurants(res.data.data.places);
    }
  } catch (err) {
    console.error("Error while sorting:", err);
    alert("Error while sorting");
  }
};
//load
const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 8);
  };


 
  return (
    <>
 <Header/>
      <div className="flex flex-col w-full h-[132px] bg-gray-100 ">
       
        <div className="container mx-auto">
          <h2 className='text-black font-bold text-4xl mt-5 ml-20'>All Listings</h2>
          <span className='text-gray-400  text-2xl mt-2 ml-[60px]'>Showing All results</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 mt-7">
        {/* Dropdown */}
        <select
          className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ef4343]"
          value={sortOption}
          onChange={(e) => handleSort(e.target.value)}
        >
          <option value="default">Default</option>
          <option value="nearest">Nearest</option>
          <option value="highRating">Highest Rating</option>
        </select>

        {/* View toggle buttons */}
        <div className="flex gap-2">
          {/* Grid View Button */}
          <button
            onClick={() => setViewType("grid")}
            className={`p-3 rounded-xl shadow-md transition-all duration-200 cursor-pointer
      ${viewType === "grid"
                ? "bg-[#ef4343] text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-[#ffe1e1] hover:text-[#ef4343]"
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
              fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 6h4V4H4v2zm6 0h4V4h-4v2zm6 0h4V4h-4v2zM4 12h4v-2H4v2zm6 0h4v-2h-4v2zm6 0h4v-2h-4v2zM4 18h4v-2H4v2zm6 0h4v-2h-4v2zm6 0h4v-2h-4v2z" />
            </svg>
          </button>

          {/* List View Button */}
          <button
            onClick={() => setViewType("list")}
            className={`p-3 rounded-xl shadow-md transition-all duration-200 cursor-pointer
      ${viewType === "list"
                ? "bg-[#ef4343] text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-[#ffe1e1] hover:text-[#ef4343]"
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
              fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

      </div>

      <div
        className={
          viewType === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 p-6"
            : "grid grid-cols-1 gap-6 p-15 md:w-[40%] mr-auto ml-auto mt-4"
        }
      >

        {restaurants.slice(0, visibleCount).map((item)  => (
          <Link key={item._id} to={`/Listing/${item._id}`}>
            <Card className="group overflow-hidden transition-all hover:shadow-lg border-none p-0 pb-5">
              <CardContent className="p-0">
                <div className="relative aspect-4/3 overflow-hidden">
                  <img
                    src={img}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-110"
                  />
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-3 right-3 h-9 w-9 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => {
                      e.preventDefault();
                      togglefavorite(item._id);
                    }}
                  >
                    <Heart
                      className={`h-5 w-5 transition-colors ${isFavorite[item._id]
                        ? "fill-red-600 text-red-600"
                        : "fill-none text-gray-100"
                        }`}
                    />
                  </Button>
                </div>
              </CardContent>

              <CardHeader>
                <CardTitle>
                  <div className="flex justify-between items-center ">
                    <div className="hover:text-[#ef4343]">
                      {item.name}
                    </div>

                    <span className="inline-block border border-gray-400 text-gray-700 text-sm font-medium px-1  rounded-full">
                      {item.category && item.category.length > 0 ? item.category[0] : "Not Found"}
                    </span>
                  </div>
                </CardTitle>
                <CardDescription className="text-gray-500">{item.city}</CardDescription>
              </CardHeader>

              <CardFooter>
                <div className="flex flex-col">
                  <h5 className="text-gray-500">{item.address}</h5>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4  text-[#ef4343]" stroke="currentColor" fill="currentColor" />
                      <span className="font-semibold">{item.ratingsAverage}</span>
                    </div>
                    <div className="text-lg font-bold text-gray-500 ">
                      Price Level {"\u2191"}:
                      <span className='text-[#ef4343]'>{item.priceLevel}</span>
                    </div>
                  </div>

                  {item.phone ? (
                    <div className="mt-3 flex items-center space-x-2 text-sm  text-gray-500">
                      <Phone className="h-3 w-3 text-[#ef4343]" />
                      <span>{item.phone}</span>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center space-x-2 text-sm  text-gray-500">
                      <Phone className="h-3 w-3" />
                      <span>SOON!</span>
                    </div>
                  )}

                </div>

              </CardFooter>
            </Card>
          </Link>

        ))}


      </div>
      {visibleCount < restaurants.length && (
        <div className="flex justify-center mt-8 mb-10">
          <button
            onClick={handleLoadMore}
            className="px-5 py-2 bg-[#ef4343] text-white rounded-lg hover:bg-[#ff7e7e] transition"
          >
            Load More
          </button>
        </div>
      )}
 <Footer/>
    </>
  )
}

export default Listings
