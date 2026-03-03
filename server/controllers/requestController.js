const Request = require('../models/Request');

const createRequest = async (req, res) => {
  try {
    const { type, description, coordinates, address, priority, peopleCount } = req.body;

    const request = await Request.create({
      victim: req.user._id,
      type,
      description,
      location: {
        type: 'Point',
        coordinates,
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

    // Save victim ID before populating
    const victimId = request.victim.toString();

    await request.save();

    const populated = await request.populate([
      { path: 'claimedBy', select: 'name phone email role' },
      { path: 'victim', select: 'name phone email' }
    ]);

    const io = req.app.get('io');
    console.log('Emitting to room:', victimId);
    console.log('IO:', io ? 'exists' : 'not found');
    const sockets = await io.in(victimId).fetchSockets();
    console.log('Sockets in room:', sockets.length);

    io.to(victimId).emit('requestClaimed', {
      message: `Your ${request.type} request has been claimed by ${req.user.name}`,
      request: populated
    });

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resolveRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'claimed') {
      return res.status(400).json({ message: 'Only claimed requests can be resolved' });
    }

    const victimId = request.victim.toString();

    request.status = 'resolved';
    request.updatedAt = Date.now();

    await request.save();

    const populated = await request.populate([
      { path: 'claimedBy', select: 'name phone email role' },
      { path: 'victim', select: 'name phone email' }
    ]);

    const io = req.app.get('io');
    console.log('Emitting to room:', victimId);
    const sockets = await io.in(victimId).fetchSockets();
    console.log('Sockets in room:', sockets.length);

    io.to(victimId).emit('requestResolved', {
      message: `Your ${request.type} request has been resolved!`,
      request: populated
    });

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNearbyRequests = async (req, res) => {
  try {
    const { lng, lat, radius = 10000 } = req.query;

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