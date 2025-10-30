const { ApifyClient } = require("apify-client");
const Place = require("../models/placeModel");

exports.getAllPlaces = async (req, res) => {
  const places = await Place.find();
  res.status(200).json({
    message: "success",
    result: places.length,
    data: {
      places,
    },
  });
};

exports.createNewPlace = async (req, res) => {
  newPlace = await Place.create(req.body);
  res.status(202).json({
    message: "success",
    data: {
      newPlace,
    },
  });
};

exports.getPlace = async (req, res) => {
  const id = req.params.id;
  place = await Place.findById(id);
  if (place) {
    res.status(200).json({
      message: "success",
      data: {
        place,
      },
    });
  } else {
    res.status(404).json({
      message: "failed",
    });
  }
};

exports.updatePlace = async (req, res) => {
  const id = req.params.id;
  updatedPlace = await Place.findByIdAndUpdate(id, req.body, {
    runValidators: true,
  });
  if (updatedPlace) {
    res.status(202).json({
      message: "success",
    });
  } else {
    res.status(404).json({
      message: "failed",
    });
  }
};

exports.deletePlace = async (req, res) => {
  const id = req.params.id;
  deletedPlace = await Place.findByIdAndDelete(id);
  if (deletedPlace) {
    res.status(202).json({
      message: "success",
    });
  } else {
    res.status(404).json({
      message: "failed",
    });
  }
};

exports.searchPlaces = async (req, res) => {
  exports.searchPlaces = async (req, res) => {
    try {
      const {
        city,
        category,
        minPrice = 1,
        maxPrice = 4,
        limit = 20,
      } = req.query;

      console.log(`🔍 Search request:`, {
        city,
        category,
        minPrice,
        maxPrice,
        limit,
      });

      if (!city) {
        return res.status(400).json({
          message: "City is required",
          error: "Please provide a city parameter",
        });
      }

      const searchQuery = {
        city: { $regex: new RegExp(city, "i") },
        priceLevel: { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) },
      };

      if (category && category !== "all") {
        searchQuery.category = {
          $in: [new RegExp(category, "i")],
        };
      }

      console.log(`📊 Database search query:`, JSON.stringify(searchQuery));

      let places = await Place.find(searchQuery).limit(parseInt(limit)).lean();

      console.log(`📁 Found ${places.length} places in database`);

      // Step 2: If not enough places, fetch from Apify
      if (places.length < parseInt(limit)) {
        const neededPlaces = parseInt(limit) - places.length;
        console.log(
          `🔄 Need ${neededPlaces} more places, fetching from Apify...`
        );

        const newPlaces = await fetchPlacesFromApifyForSearch({
          city,
          category,
          limit: Math.min(neededPlaces + 5, 10),
          minPrice: parseInt(minPrice),
          maxPrice: parseInt(maxPrice),
        });

        places = [...places, ...newPlaces].slice(0, parseInt(limit));

        console.log(
          `✅ Final results: ${places.length} places (${newPlaces.length} from Apify)`
        );
      }

      if (places.length === 0) {
        return res.status(404).json({
          message: "No places found matching your criteria",
          searchCriteria: { city, category, minPrice, maxPrice },
          suggestion: "Try broadening your search criteria",
        });
      }

      res.status(200).json({
        message: "success",
        results: places.length,
        searchCriteria: {
          city,
          category: category || "all",
          priceRange: `${minPrice}-${maxPrice}`,
          limit: parseInt(limit),
        },
        data: {
          places,
          source: places.length > 0 ? "database" : "apify",
        },
      });
    } catch (error) {
      console.error("❌ Search error:", error.message);
      res.status(500).json({
        message: "Search failed",
        error: error.message,
      });
    }
  };
};

exports.getPlacesDistribution = async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query; // radius in meters

    const places = await Place.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(radius),
        },
      },
    });

    res.status(200).json({
      message: "success",
      results: places.length,
      data: { places },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching distribution",
      error: error.message,
    });
  }
};

async function fetchPlacesFromApifyForSearch({
  city,
  category,
  limit,
  minPrice,
  maxPrice,
}) {
  const client = new ApifyClient({
    token: process.env.APIFY_LOCATIONS_API_KEY,
  });

  try {
    console.log(
      `🎯 Fetching ${limit} places from Apify for ${city}, ${category}`
    );

    const actorId = process.env.LOCATION_ACTOR_ID;

    let searchStrings = [];
    if (category && category !== "all") {
      searchStrings.push(`${category} in ${city} Egypt`);
    } else {
      searchStrings.push(`restaurants in ${city} Egypt`);
      searchStrings.push(`cafes in ${city} Egypt`);
      searchStrings.push(`food places in ${city} Egypt`);
    }

    const run = await client.actor(actorId).call({
      searchStringsArray: searchStrings,
      maxCrawledPlaces: limit,
      includeOpeningHours: false,
      includePriceLevel: true,
      includeWebsites: true,
      includeImages: false,
      includeReviews: false,
      scrapeResponseFromWebsites: false,
      includePeopleAlsoSearch: false,
      language: "en",
      countryCode: "eg",
      maxImages: 0,
      maxReviews: 0,
    });

    console.log(`✅ Apify search run started. Run ID: ${run.id}`);

    let runStatus = await client.run(run.id).get();
    while (runStatus.status === "RUNNING") {
      console.log(
        `⏳ Apify search run status: ${runStatus.status}, waiting...`
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));
      runStatus = await client.run(run.id).get();
    }

    if (runStatus.status === "SUCCEEDED") {
      console.log("✅ Apify search run completed successfully");

      const { items } = await client
        .dataset(runStatus.defaultDatasetId)
        .listItems();
      console.log(`📊 Received ${items.length} places from Apify search`);

      if (!items || items.length === 0) {
        return [];
      }

      const savedPlaces = await storeApifyData(items);

      const filteredPlaces = savedPlaces.filter(
        (place) => place.priceLevel >= minPrice && place.priceLevel <= maxPrice
      );

      console.log(
        `💰 Price filtered: ${filteredPlaces.length} places match price range ${minPrice}-${maxPrice}`
      );

      return filteredPlaces;
    } else {
      throw new Error(
        `Apify search run failed with status: ${runStatus.status}`
      );
    }
  } catch (error) {
    console.error("❌ Apify search fetch error:", error.message);
    return [];
  }
}

// ####### Riching the database with places in Alexandria #######
exports.testApifyConnection = async (req, res) => {
  // 🎯 INITIALIZE THE CLIENT PROPERLY
  const client = new ApifyClient({
    token: process.env.APIFY_LOCATIONS_API_KEY,
  });

  console.log("🔧 Apify client initialized");
  try {
    console.log("🧪 Testing Apify connection...");

    // Test 1: Check environment variables
    console.log(
      "🔑 API Key:",
      process.env.APIFY_LOCATIONS_API_KEY ? "✅ Present" : "❌ Missing"
    );
    console.log(
      "🎬 Actor ID:",
      process.env.LOCATION_ACTOR_ID ? "✅ Present" : "❌ Missing"
    );

    if (!process.env.APIFY_LOCATIONS_API_KEY) {
      return res.status(500).json({
        message: "API key missing",
        error: "APIFY_LOCATIONS_API_KEY not found in environment variables",
      });
    }

    // Test 2: Get user info
    console.log("🔍 Getting user info...");
    const user = await client.user("me").get();
    console.log("✅ User:", user.username);

    // Test 3: Try to get actor info
    const actorId =
      process.env.LOCATION_ACTOR_ID || "drobnikj/crawler-google-places";
    console.log(`🔍 Checking actor: ${actorId}`);

    try {
      const actor = await client.actor(actorId).get();
      console.log("✅ Actor found:", actor.name);
      console.log("📝 Description:", actor.description);

      res.status(200).json({
        message: "Apify connection successful",
        user: user.username,
        actor: {
          id: actor.id,
          name: actor.name,
          description: actor.description,
        },
      });
    } catch (actorError) {
      console.log("❌ Actor not found, searching for alternatives...");

      // Search for Google Maps actors
      const searchResult = await client.actors().list({
        search: "google maps",
        limit: 5,
      });

      const availableActors = searchResult.items.map((actor) => ({
        id: actor.id,
        name: actor.name,
        username: actor.username,
      }));

      console.log("📋 Available Google Maps actors:", availableActors);

      res.status(404).json({
        message: "Specific actor not found, but here are alternatives",
        availableActors,
        error: actorError.message,
        solution:
          "Update LOCATION_ACTOR_ID in .env file with one of the available actors",
      });
    }
  } catch (error) {
    console.error("❌ Apify test failed:", error.message);
    res.status(500).json({
      message: "Apify connection failed",
      error: error.message,
      details: error.response?.data || "No additional details",
    });
  }
};

exports.fetchPlacesFromApify = async (req, res) => {
  // 🎯 INITIALIZE THE CLIENT PROPERLY
  const client = new ApifyClient({
    token: process.env.APIFY_LOCATIONS_API_KEY,
  });

  console.log("🎯 fetchPlacesFromApify called");

  try {
    console.log("Starting Apify data fetch...");

    const actorId = process.env.LOCATION_ACTOR_ID;
    console.log(`🎬 Using actor: ${actorId}`);

    // Use the correct Apify client method
    const run = await client.actor(actorId).call({
      // Input for the Google Maps Scraper - optimized for Alexandria
      searchStringsArray: [
        "restaurants in Stanley Alexandria",
        "cafes in Montaza Alexandria",
      ],
      maxCrawledPlaces: 10, // Start small for testing
      includeOpeningHours: false,
      includePriceLevel: true, // Your mandatory field
      includeWebsites: true,
      includeImages: false,
      includeReviews: false,
      scrapeResponseFromWebsites: false,
      includePeopleAlsoSearch: false,
      language: "en",
      countryCode: "eg",
      maxImages: 0,
      maxReviews: 0,
    });

    console.log(`✅ Apify run started. Run ID: ${run.id}`);
    console.log(
      `📊 Monitoring URL: https://console.apify.com/actors/runs/${run.id}`
    );

    // Wait for the run to complete and get results
    console.log("⏳ Waiting for Apify run to complete...");

    // Poll for completion
    let runStatus = await client.run(run.id).get();
    while (runStatus.status === "RUNNING") {
      console.log(`⏳ Run status: ${runStatus.status}, waiting...`);
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
      runStatus = await client.run(run.id).get();
    }

    if (runStatus.status === "SUCCEEDED") {
      console.log("✅ Apify run completed successfully");

      // Get the dataset items
      const { items } = await client
        .dataset(runStatus.defaultDatasetId)
        .listItems();
      console.log(`📊 Received ${items.length} places from Apify`);

      if (!items || items.length === 0) {
        return res.status(500).json({
          message: "No data received from Apify",
        });
      }

      // Log first item to see structure
      console.log(
        "📋 Sample data structure:",
        JSON.stringify(items[0], null, 2)
      );

      // Transform and store in database
      const savedPlaces = await storeApifyData(items);

      res.status(200).json({
        message: "success",
        results: savedPlaces.length,
        data: {
          savedPlaces,
          apifyRunId: run.id,
          totalReceived: items.length,
          sampleData: items[0], // Include sample to see structure
        },
      });
    } else {
      throw new Error(`Apify run failed with status: ${runStatus.status}`);
    }
  } catch (error) {
    console.error("Apify fetch error:", error.message);

    res.status(500).json({
      message: "Failed to fetch data from Apify",
      error: error.message,
      details: error.response?.data || "No additional details",
    });
  }
};

async function storeApifyData(apifyItems) {
  const savedPlaces = [];
  let duplicates = 0;
  let errors = 0;
  let validationErrors = 0;

  for (const item of apifyItems) {
    try {
      // Transforming Apify data to match the schema
      const placeData = transformApifyToSchema(item);

      if (!placeData) {
        console.log(`⚠️ Skipping item - missing critical data: ${item.title}`);
        continue;
      }

      // Validate the data before saving
      if (placeData.ratingsAverage < 1 || placeData.ratingsAverage > 5) {
        console.log(
          `⚠️ Invalid rating for ${item.title}: ${placeData.ratingsAverage}`
        );
        placeData.ratingsAverage = 4.0; // Set default
      }

      // upsert to avoid duplicates based on coordinates
      const savedPlace = await Place.findOneAndUpdate(
        {
          "location.coordinates": placeData.location.coordinates,
        },
        placeData,
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      );

      if (savedPlace) {
        savedPlaces.push(savedPlace);
      }
    } catch (error) {
      if (error.code === 11000) {
        duplicates++;
      } else if (error.name === "ValidationError") {
        validationErrors++;
        console.log(`❌ Validation error for ${item.title}:`, error.message);

        // Log the problematic data for debugging
        console.log("Problematic data:", {
          title: item.title,
          rating: item.totalScore,
          reviews: item.reviewsCount,
          price: item.price,
        });
      } else {
        console.error(`❌ Other error saving ${item.title}:`, error.message);
        errors++;
      }
    }
  }

  console.log(
    `💾 Database update: ${savedPlaces.length} saved, ${duplicates} duplicates, ${validationErrors} validation errors, ${errors} other errors`
  );
  return savedPlaces;
}

function transformApifyToSchema(apifyItem) {
  if (
    !apifyItem.title ||
    !apifyItem.location ||
    !apifyItem.location.lat ||
    !apifyItem.location.lng
  ) {
    return null;
  }

  // 🎯 Extract price level from price string
  let priceLevel = 1; // Default to $
  if (apifyItem.price) {
    if (apifyItem.price.includes("E£") || apifyItem.price.includes("£")) {
      // Convert price string to price level (1-4)
      if (apifyItem.price.includes("100") || apifyItem.price.includes("200")) {
        priceLevel = 2; // $$
      } else if (
        apifyItem.price.includes("300") ||
        apifyItem.price.includes("400")
      ) {
        priceLevel = 3; // $$$
      } else if (
        apifyItem.price.includes("500") ||
        apifyItem.price.includes("600")
      ) {
        priceLevel = 4; // $$$$
      }
    }
  }

  // 🎯 Handle ratings - use totalScore instead of rating
  let ratingsAverage = apifyItem.totalScore || 0;
  // Ensure rating is between 1-5, default to 4 if 0
  if (ratingsAverage === 0 || ratingsAverage < 1) {
    ratingsAverage = 4.0; // Default average rating
  }

  // 🎯 Handle reviews count
  const ratingsQuantity = apifyItem.reviewsCount || 0;

  return {
    priceLevel: priceLevel,
    name: apifyItem.title,
    category: apifyItem.categories || [apifyItem.categoryName] || ["Unknown"],
    ratingsAverage: ratingsAverage,
    ratingsQuantity: ratingsQuantity,
    location: {
      type: "Point",
      coordinates: [apifyItem.location.lng, apifyItem.location.lat],
    },
    website: apifyItem.website || "",
    address: apifyItem.address || "",
    phone: apifyItem.phone || apifyItem.phoneUnformatted || "",
    city: "Alexandria",
  };
}
