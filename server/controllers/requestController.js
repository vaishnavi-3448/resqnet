const Request = require('../models/Request');

// @desc Create a new relief request
// @route POST /api/requests
// @access victim only
const createRequest = async (req, res) => {
  try {
    const { type, description, coordinates, address, priority, peopleCount } = req.body;

    const request = await Request.create({
      victim: req.user._id,
      type,
      description,
      location: {
        type: 'Point',
        coordinates, // [longitude, latitude]
        address
      },
      priority,
      peopleCount
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all pending requests (for volunteers/ngos)
// @route GET /api/requests
// @access volunteer, ngo, admin
const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find({ status: 'pending' })
      .populate('victim', 'name phone email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get requests by the logged in victim
// @route GET /api/requests/my
// @access victim only
const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ victim: req.user._id })
      .populate('claimedBy', 'name phone email role')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get a single request by ID
// @route GET /api/requests/:id
// @access protected
const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('victim', 'name phone email')
      .populate('claimedBy', 'name phone email role');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Claim a request (volunteer/ngo)
// @route PUT /api/requests/:id/claim
// @access volunteer, ngo
const claimRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is no longer available' });
    }

    request.status = 'claimed';
    request.claimedBy = req.user._id;
    request.updatedAt = Date.now();

    await request.save();

    const populated = await request.populate('claimedBy', 'name phone email role');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Mark a request as resolved
// @route PUT /api/requests/:id/resolve
// @access volunteer, ngo, admin
const resolveRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'claimed') {
      return res.status(400).json({ message: 'Only claimed requests can be resolved' });
    }

    request.status = 'resolved';
    request.updatedAt = Date.now();

    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get nearby requests within a radius
// @route GET /api/requests/nearby?lng=xx&lat=xx&radius=xx
// @access volunteer, ngo
const getNearbyRequests = async (req, res) => {
  try {
    const { lng, lat, radius = 10000 } = req.query; // radius in meters, default 10km

    const requests = await Request.find({
      status: 'pending',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(radius)
        }
      }
    }).populate('victim', 'name phone email');

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRequest,
  getAllRequests,
  getMyRequests,
  getRequestById,
  claimRequest,
  resolveRequest,
  getNearbyRequests
};