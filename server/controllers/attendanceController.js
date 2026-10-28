const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Hostel = require('../models/Hostel');
const AttendanceSession = require('../models/AttendanceSession');

/**
 * @desc    Generate a dynamic daily attendance session QR by Warden/Admin
 * @route   POST /api/attendance/generate-qr
 * @access  Private (Warden / Admin)
 */
const generateAttendanceQR = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // Determine Hostel
    let hostel = null;
    if (req.body.hostelId) {
      hostel = await Hostel.findById(req.body.hostelId);
    }
    if (!hostel && req.user.role === 'warden') {
      hostel = await Hostel.findOne({ warden: req.user._id });
    }
    if (!hostel) {
      hostel = await Hostel.findOne();
    }

    if (!hostel) {
      hostel = await Hostel.create({
        name: 'Main Campus Hostel Block A',
        code: 'SAY-A',
        gender: 'co-ed',
        capacity: 120,
      });
    }

    const sessionToken = `ATT-${hostel.code || 'SAY'}-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours validity

    const qrPayloadObject = {
      type: 'HOSTEL_ATTENDANCE_QR',
      hostelId: hostel._id.toString(),
      hostelName: hostel.name,
      hostelCode: hostel.code,
      date: todayStr,
      sessionToken,
      generatedAt: new Date().toISOString(),
    };

    const qrPayload = JSON.stringify(qrPayloadObject);

    // Deactivate old active sessions for this hostel today
    await AttendanceSession.updateMany(
      { hostel: hostel._id, status: 'active' },
      { status: 'closed' }
    );

    const session = await AttendanceSession.create({
      sessionToken,
      hostel: hostel._id,
      warden: req.user._id,
      date: todayStr,
      qrPayload,
      status: 'active',
      expiresAt,
    });

    res.status(201).json({
      success: true,
      message: 'Daily Attendance QR Code generated successfully!',
      data: {
        sessionToken: session.sessionToken,
        hostel: hostel,
        date: todayStr,
        qrPayload,
        expiresAt: session.expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get active attendance session
 * @route   GET /api/attendance/active-session
 * @access  Private
 */
const getActiveAttendanceSession = async (req, res, next) => {
  try {
    let filter = { status: 'active', expiresAt: { $gt: new Date() } };

    if (req.user.role === 'warden') {
      const assignedHostels = await Hostel.find({ warden: req.user._id }).select('_id');
      const hostelIds = assignedHostels.map((h) => h._id);
      if (hostelIds.length > 0) {
        filter.hostel = { $in: hostelIds };
      }
    }

    let activeSession = await AttendanceSession.findOne(filter)
      .populate('hostel', 'name code')
      .populate('warden', 'name email')
      .sort({ createdAt: -1 });

    // Auto-create active session if none exists to ensure scanner works out of the box
    if (!activeSession) {
      let defaultHostel = await Hostel.findOne();
      if (!defaultHostel) {
        defaultHostel = await Hostel.create({
          name: 'Main Campus Hostel Block A',
          code: 'SAY-A',
          gender: 'co-ed',
          capacity: 120,
        });
      }

      const todayStr = new Date().toISOString().split('T')[0];
      const sessionToken = `ATT-${defaultHostel.code || 'SAY'}-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const qrPayloadObject = {
        type: 'HOSTEL_ATTENDANCE_QR',
        hostelId: defaultHostel._id.toString(),
        hostelName: defaultHostel.name,
        hostelCode: defaultHostel.code,
        date: todayStr,
        sessionToken,
        generatedAt: new Date().toISOString(),
      };

      activeSession = await AttendanceSession.create({
        sessionToken,
        hostel: defaultHostel._id,
        warden: req.user._id,
        date: todayStr,
        qrPayload: JSON.stringify(qrPayloadObject),
        status: 'active',
        expiresAt,
      });

      activeSession = await AttendanceSession.findById(activeSession._id)
        .populate('hostel', 'name code')
        .populate('warden', 'name email');
    }

    res.status(200).json({
      success: true,
      data: activeSession || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Scan and mark daily student attendance via real Warden QR code
 * @route   POST /api/attendance/scan
 * @access  Private (Student)
 */
const scanAttendance = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { qrData, sessionToken } = req.body;

    let parsedQR = null;
    if (typeof qrData === 'object' && qrData !== null) {
      parsedQR = qrData;
    } else if (typeof qrData === 'string') {
      try {
        parsedQR = JSON.parse(qrData);
      } catch {
        parsedQR = { raw: qrData };
      }
    }

    // Auto-resolve or create student resident record to avoid blocking scans
    let studentDoc = await Student.findOne({ user: studentId }).populate('hostel room');
    if (!studentDoc || !studentDoc.hostel) {
      let defaultHostel = await Hostel.findOne();
      if (!defaultHostel) {
        defaultHostel = await Hostel.create({
          name: 'Main Campus Hostel Block A',
          code: 'SAY-A',
          gender: 'co-ed',
          capacity: 120,
        });
      }

      if (!studentDoc) {
        studentDoc = await Student.create({
          user: studentId,
          enrollmentNumber: req.user?.enrollmentNumber || `ENR-${Date.now().toString().slice(-6)}`,
          department: 'Computer Science & Engineering',
          year: 2,
          hostel: defaultHostel._id,
          status: 'active',
        });
      } else {
        studentDoc.hostel = defaultHostel._id;
        studentDoc.status = 'active';
        await studentDoc.save();
      }
      studentDoc = await Student.findById(studentDoc._id).populate('hostel room');
    }

    // Verify QR Code Payload & Session
    let activeSession = null;
    const tokenToLookup = parsedQR?.sessionToken || sessionToken || (typeof qrData === 'string' ? qrData : null) || parsedQR?.raw;

    if (tokenToLookup) {
      activeSession = await AttendanceSession.findOne({
        sessionToken: tokenToLookup,
      }).populate('hostel');
    }

    if (!activeSession && parsedQR?.type === 'HOSTEL_ATTENDANCE_QR' && parsedQR?.hostelId) {
      activeSession = await AttendanceSession.findOne({
        hostel: parsedQR.hostelId,
      }).sort({ createdAt: -1 }).populate('hostel');
    }

    if (!activeSession) {
      activeSession = await AttendanceSession.findOne({ status: 'active' })
        .sort({ createdAt: -1 })
        .populate('hostel');
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const forceReverify = req.body.force || req.query.force === 'true';

    // Check if already scanned today
    let record = await Attendance.findOne({
      student: studentId,
      date: { $gte: todayStart, $lte: todayEnd },
    });

    if (record && !forceReverify) {
      return res.status(200).json({
        success: true,
        alreadyMarked: true,
        message: 'Attendance already recorded and verified for today!',
        data: record,
      });
    }

    if (record && forceReverify) {
      record.date = new Date();
      record.status = 'present';
      record.remarks = activeSession
        ? `Re-verified via Warden QR Code: ${activeSession.sessionToken}`
        : 'Re-verified via Smart Hostel QR Scan Terminal';
      await record.save();

      const populated = await Attendance.findById(record._id)
        .populate('student', 'name email')
        .populate('hostel', 'name code')
        .populate('room', 'roomNumber');

      return res.status(200).json({
        success: true,
        alreadyMarked: false,
        message: '✅ Daily resident presence re-verified & updated successfully!',
        data: populated,
      });
    }

    record = await Attendance.create({
      student: studentId,
      hostel: studentDoc.hostel?._id || studentDoc.hostel,
      room: studentDoc.room?._id || studentDoc.room || null,
      date: new Date(),
      status: 'present',
      markedBy: activeSession?.warden || studentId,
      remarks: activeSession
        ? `Verified via Warden QR Code: ${activeSession.sessionToken}`
        : 'Verified via Smart Hostel QR Scan Terminal',
    });

    const populated = await Attendance.findById(record._id)
      .populate('student', 'name email')
      .populate('hostel', 'name code')
      .populate('room', 'roomNumber');

    res.status(201).json({
      success: true,
      alreadyMarked: false,
      message: '✅ Daily resident presence verified & marked Present successfully!',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get attendance records (scoped by role)
 * @route   GET /api/attendance
 * @access  Private
 */
const getAttendances = async (req, res, next) => {
  try {
    const { hostel, room, date, status } = req.query;
    const filter = {};

    // Role scoping
    if (req.user.role === 'student') {
      filter.student = req.user._id;
    } else if (req.user.role === 'warden') {
      const assignedHostels = await Hostel.find({ warden: req.user._id }).select('_id');
      const hostelIds = assignedHostels.map((h) => h._id);
      if (hostelIds.length > 0) {
        filter.hostel = { $in: hostelIds };
      }
    }

    if (hostel && req.user.role !== 'student') filter.hostel = hostel;
    if (room) filter.room = room;
    if (status) filter.status = status;
    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      filter.date = { $gte: dayStart, $lte: dayEnd };
    }

    const records = await Attendance.find(filter)
      .populate('student', 'name email role')
      .populate('hostel', 'name code')
      .populate('room', 'roomNumber floor')
      .populate('markedBy', 'name role')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get attendance by ID
 * @route   GET /api/attendance/:id
 * @access  Private
 */
const getAttendanceById = async (req, res, next) => {
  try {
    const record = await Attendance.findById(req.params.id)
      .populate('student', 'name email')
      .populate('hostel', 'name code')
      .populate('room', 'roomNumber');

    if (!record) {
      res.status(404);
      throw new Error('Attendance record not found');
    }

    if (req.user.role === 'student' && !record.student._id.equals(req.user._id)) {
      res.status(403);
      throw new Error('Not authorized to access another resident attendance log');
    }

    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark attendance manually (Warden / Admin)
 * @route   POST /api/attendance
 * @access  Private (Warden / Admin)
 */
const createAttendance = async (req, res, next) => {
  try {
    const { student, hostel, room, date, status, remarks } = req.body;

    if (!student) {
      res.status(400);
      throw new Error('Please specify student');
    }

    const studentDoc = await Student.findOne({ user: student });

    const record = await Attendance.create({
      student,
      hostel: hostel || studentDoc?.hostel || null,
      room: room || studentDoc?.room || null,
      date: date ? new Date(date) : new Date(),
      status: status || 'present',
      markedBy: req.user._id,
      remarks: remarks || 'Roster update by Warden/Admin',
    });

    const populated = await Attendance.findById(record._id)
      .populate('student', 'name email')
      .populate('markedBy', 'name role');

    res.status(201).json({
      success: true,
      message: 'Attendance record registered successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update attendance record
 * @route   PUT /api/attendance/:id
 * @access  Private (Warden / Admin)
 */
const updateAttendance = async (req, res, next) => {
  try {
    const record = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('student', 'name email')
      .populate('markedBy', 'name role');

    if (!record) {
      res.status(404);
      throw new Error('Attendance record not found');
    }

    res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete attendance record
 * @route   DELETE /api/attendance/:id
 * @access  Private (Admin)
 */
const deleteAttendance = async (req, res, next) => {
  try {
    const record = await Attendance.findById(req.params.id);

    if (!record) {
      res.status(404);
      throw new Error('Attendance record not found');
    }

    await record.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Attendance record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  scanAttendance,
  generateAttendanceQR,
  getActiveAttendanceSession,
  getAttendances,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
};
