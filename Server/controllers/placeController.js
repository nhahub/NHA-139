const { ApifyClient } = require("apify-client");
const Place = require("../models/placeModel");

exports.getAllPlaces = async (req, res) => {
  try {
    const places = await Place.find();
    res.status(200).json({
      message: "success",
      result: places.length,
      data: {
        places,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "failed",
      error: error.message,
    });
  }
};

exports.getFilteredPlaces = async (req, res) => {
  try {
    const { city, category, priceLevel, sortBy, lat, lng, placeIds } =
      req.query;

    const filter = {};

    if (placeIds) {
      const ids = Array.isArray(placeIds) ? placeIds : placeIds.split(",");
      filter._id = { $in: ids };
    } else {
      if (city) {
        filter.city = { $regex: new RegExp(`^${city}$`, "i") };
      }

      if (category) {
        const categories = Array.isArray(category) ? category : [category];
        filter.category = {
          $in: categories.map((cat) => new RegExp(`^${cat}$`, "i")),
        };
      }

      if (priceLevel) {
        filter.priceLevel = parseInt(priceLevel);
      }
    }

    const sortByLower = sortBy ? sortBy.toLowerCase() : null;

    if (sortByLower === "rating") {
      const places = await Place.find(filter)
        .sort({ ratingsAverage: -1, ratingsQuantity: -1 })
        .limit(placeIds ? undefined : 20);

      return res.status(200).json({
        message: "success",
        result: places.length,
        data: {
          places,
        },
      });
    } else if (sortByLower === "radius" && lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      const pipeline = [
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            distanceField: "distance",
            spherical: true,
            query: filter,
          },
        },
      ];

      if (!placeIds) {
        pipeline.push({ $limit: 20 });
      }

      const places = await Place.aggregate(pipeline);

      return res.status(200).json({
        message: "success",
        result: places.length,
        data: {
          places,
        },
      });
    }

    let query;

    if (placeIds) {
      query = Place.find(filter);
    } else {
      query = Place.aggregate([{ $match: filter }, { $sample: { size: 20 } }]);
    }

    const places = await query;

    res.status(200).json({
      message: "success",
      result: places.length,
      data: {
        places,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "failed",
      error: error.message,
    });
  }
};

exports.createNewPlace = async (req, res) => {
  try {
    const newPlace = await Place.create(req.body);
    res.status(201).json({
      message: "success",
      data: {
        newPlace,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: "failed",
      error: error.message,
    });
  }
};

exports.getPlace = async (req, res) => {
  try {
    const id = req.params.id;
    const place = await Place.findById(id);

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
        error: "Place not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "failed",
      error: error.message,
    });
  }
};

exports.updatePlace = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedPlace = await Place.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (updatedPlace) {
      res.status(200).json({
        message: "success",
        data: {
          place: updatedPlace,
        },
      });
    } else {
      res.status(404).json({
        message: "failed",
        error: "Place not found",
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "failed",
      error: error.message,
    });
  }
};

exports.deletePlace = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedPlace = await Place.findByIdAndDelete(id);

    if (deletedPlace) {
      res.status(204).json({
        message: "success",
        data: null,
      });
    } else {
      res.status(404).json({
        message: "failed",
        error: "Place not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "failed",
      error: error.message,
    });
  }
};

exports.getPlacesDistribution = async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;

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

// ####### Riching the database with places in Alexandria #######
exports.testApifyConnection = async (req, res) => {
  const client = new ApifyClient({
    token: process.env.APIFY_LOCATIONS_API_KEY,
  });

  console.log("🔧 Apify client initialized");
  try {
    console.log("🧪 Testing Apify connection...");

    if (!process.env.APIFY_LOCATIONS_API_KEY) {
      return res.status(500).json({
        message: "API key missing",
        error: "APIFY_LOCATIONS_API_KEY not found in environment variables",
      });
    }

    const user = await client.user("me").get();

    const actorId =
      process.env.LOCATION_ACTOR_ID || "drobnikj/crawler-google-places";

    try {
      const actor = await client.actor(actorId).get();

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
      console.log("Actor not found, searching for alternatives...");

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

      res.status(404).json({
        message: "Specific actor not found, but here are alternatives",
        availableActors,
        error: actorError.message,
        solution:
          "Update LOCATION_ACTOR_ID in .env file with one of the available actors",
      });
    }
  } catch (error) {
    console.error("Apify test failed:", error.message);
    res.status(500).json({
      message: "Apify connection failed",
      error: error.message,
      details: error.response?.data || "No additional details",
    });
  }
};

exports.fetchPlacesFromApify = async (req, res) => {
  const client = new ApifyClient({
    token: process.env.APIFY_LOCATIONS_API_KEY,
  });

  try {
    const actorId = process.env.LOCATION_ACTOR_ID;

    const run = await client.actor(actorId).call({
      searchStringsArray: [
        "restaurants in Stanley Alexandria",
        "cafes in Montaza Alexandria",
      ],
      maxCrawledPlaces: 10,
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

    let runStatus = await client.run(run.id).get();
    while (runStatus.status === "RUNNING") {
      console.log(`⏳ Run status: ${runStatus.status}, waiting...`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      runStatus = await client.run(run.id).get();
    }

    if (runStatus.status === "SUCCEEDED") {
      const { items } = await client
        .dataset(runStatus.defaultDatasetId)
        .listItems();

      if (!items || items.length === 0) {
        return res.status(500).json({
          message: "No data received from Apify",
        });
      }

      const savedPlaces = await storeApifyData(items);

      res.status(200).json({
        message: "success",
        results: savedPlaces.length,
        data: {
          savedPlaces,
          apifyRunId: run.id,
          totalReceived: items.length,
          sampleData: items[0],
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
      const placeData = transformApifyToSchema(item);

      if (!placeData) {
        console.log(`Skipping item - missing critical data: ${item.title}`);
        continue;
      }

      if (placeData.ratingsAverage < 1 || placeData.ratingsAverage > 5) {
        console.log(
          `Invalid rating for ${item.title}: ${placeData.ratingsAverage}`
        );
        placeData.ratingsAverage = 4.0;
      }

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
        console.log(`Validation error for ${item.title}:`, error.message);
      } else {
        console.error(`Other error saving ${item.title}:`, error.message);
        errors++;
      }
    }
  }

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

  let priceLevel = 1;
  if (apifyItem.price) {
    if (apifyItem.price.includes("E£") || apifyItem.price.includes("£")) {
      if (apifyItem.price.includes("100") || apifyItem.price.includes("200")) {
        priceLevel = 2;
      } else if (
        apifyItem.price.includes("300") ||
        apifyItem.price.includes("400")
      ) {
        priceLevel = 3;
      } else if (
        apifyItem.price.includes("500") ||
        apifyItem.price.includes("600")
      ) {
        priceLevel = 4;
      }
    }
  }

  let ratingsAverage = apifyItem.totalScore || 0;
  if (ratingsAverage === 0 || ratingsAverage < 1) {
    ratingsAverage = 4.0;
  }

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
