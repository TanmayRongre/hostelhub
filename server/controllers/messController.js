const Mess = require('../models/Mess');

const defaultWeeklyMenu = [
  { dayOfWeek: 'Monday', mealType: 'Breakfast', timing: '7:30 AM - 9:30 AM', menuItems: ['Poha with Chutney', 'Boiled Eggs / Sprouts', 'Tea / Coffee / Milk', 'Banana'], specialDiet: 'Gluten-free oats available' },
  { dayOfWeek: 'Monday', mealType: 'Lunch', timing: '12:30 PM - 2:30 PM', menuItems: ['Dal Tadka', 'Jeera Rice', 'Paneer Butter Masala', 'Chapati', 'Green Salad', 'Gulab Jamun'], specialDiet: 'Jain Dal available' },
  { dayOfWeek: 'Monday', mealType: 'Snacks', timing: '5:00 PM - 6:00 PM', menuItems: ['Veg Sandwich', 'Masala Chai', 'Biscuits'] },
  { dayOfWeek: 'Monday', mealType: 'Dinner', timing: '7:30 PM - 9:30 PM', menuItems: ['Mix Veg Curry', 'Roti', 'Steamed Rice', 'Moong Dal', 'Raita'] },

  { dayOfWeek: 'Tuesday', mealType: 'Breakfast', timing: '7:30 AM - 9:30 AM', menuItems: ['Idli & Sambar', 'Coconut Chutney', 'Tea / Coffee / Milk', 'Apple'] },
  { dayOfWeek: 'Tuesday', mealType: 'Lunch', timing: '12:30 PM - 2:30 PM', menuItems: ['Rajma Masala', 'Basmati Rice', 'Aloo Gobi', 'Phulka', 'Curd', 'Papad'] },
  { dayOfWeek: 'Tuesday', mealType: 'Snacks', timing: '5:00 PM - 6:00 PM', menuItems: ['Samosa with Imli Chutney', 'Adrak Chai'] },
  { dayOfWeek: 'Tuesday', mealType: 'Dinner', timing: '7:30 PM - 9:30 PM', menuItems: ['Palak Paneer', 'Chapati', 'Fried Rice', 'Dal Makhani', 'Kheer'] },

  { dayOfWeek: 'Wednesday', mealType: 'Breakfast', timing: '7:30 AM - 9:30 AM', menuItems: ['Aloo Paratha with Curd & Pickle', 'Tea / Coffee / Milk'] },
  { dayOfWeek: 'Wednesday', mealType: 'Lunch', timing: '12:30 PM - 2:30 PM', menuItems: ['Chole Bhature', 'Veg Biryani', 'Boondi Raita', 'Onion Salad'] },
  { dayOfWeek: 'Wednesday', mealType: 'Snacks', timing: '5:00 PM - 6:00 PM', menuItems: ['Bhel Puri', 'Cold Coffee / Lemon Tea'] },
  { dayOfWeek: 'Wednesday', mealType: 'Dinner', timing: '7:30 PM - 9:30 PM', menuItems: ['Egg Curry / Kadai Paneer', 'Roti', 'Jeera Rice', 'Yellow Dal'] },

  { dayOfWeek: 'Thursday', mealType: 'Breakfast', timing: '7:30 AM - 9:30 AM', menuItems: ['Upma with Sambar & Coconut Chutney', 'Boiled Eggs', 'Tea / Coffee'] },
  { dayOfWeek: 'Thursday', mealType: 'Lunch', timing: '12:30 PM - 2:30 PM', menuItems: ['Kadhi Pakora', 'Steamed Rice', 'Bhindi Masala', 'Chapati', 'Salad'] },
  { dayOfWeek: 'Thursday', mealType: 'Snacks', timing: '5:00 PM - 6:00 PM', menuItems: ['Pav Bhaji (2 pcs)', 'Filter Coffee'] },
  { dayOfWeek: 'Thursday', mealType: 'Dinner', timing: '7:30 PM - 9:30 PM', menuItems: ['Dum Aloo', 'Roti', 'Veg Pulao', 'Dal Fry', 'Custard'] },

  { dayOfWeek: 'Friday', mealType: 'Breakfast', timing: '7:30 AM - 9:30 AM', menuItems: ['Uttapam with Sambar', 'Tomato Chutney', 'Tea / Milk'] },
  { dayOfWeek: 'Friday', mealType: 'Lunch', timing: '12:30 PM - 2:30 PM', menuItems: ['Paneer Tikka Masala', 'Butter Naan / Roti', 'Peas Pulao', 'Dal Tadka'] },
  { dayOfWeek: 'Friday', mealType: 'Snacks', timing: '5:00 PM - 6:00 PM', menuItems: ['Dhokla with Green Chutney', 'Chai'] },
  { dayOfWeek: 'Friday', mealType: 'Dinner', timing: '7:30 PM - 9:30 PM', menuItems: ['Chicken Curry / Shahi Paneer', 'Rumali Roti', 'Biryani Rice', 'Ice Cream'] },

  { dayOfWeek: 'Saturday', mealType: 'Breakfast', timing: '7:30 AM - 9:30 AM', menuItems: ['Puri Bhaji (Aloo Curry)', 'Halwa', 'Tea / Coffee / Milk'] },
  { dayOfWeek: 'Saturday', mealType: 'Lunch', timing: '12:30 PM - 2:30 PM', menuItems: ['Sambhar Rice', 'Avial / Mix Veg', 'Curd Rice', 'Papad & Pickle'] },
  { dayOfWeek: 'Saturday', mealType: 'Snacks', timing: '5:00 PM - 6:00 PM', menuItems: ['Pasta / Macaroni', 'Hot Chocolate / Tea'] },
  { dayOfWeek: 'Saturday', mealType: 'Dinner', timing: '7:30 PM - 9:30 PM', menuItems: ['Malai Kofta', 'Chapati', 'Fried Rice', 'Dal Makhani', 'Rasgulla'] },

  { dayOfWeek: 'Sunday', mealType: 'Breakfast', timing: '8:00 AM - 10:00 AM', menuItems: ['Masala Dosa', 'Sambar & Chutney Trio', 'Filter Coffee / Milk'] },
  { dayOfWeek: 'Sunday', mealType: 'Lunch', timing: '12:30 PM - 2:30 PM', menuItems: ['Special Sunday Feast (Paneer Lababdar / Chicken Biryani)', 'Butter Roti', 'Raita', 'Sweet Lassi'] },
  { dayOfWeek: 'Sunday', mealType: 'Snacks', timing: '5:00 PM - 6:00 PM', menuItems: ['Kachori with Sweet Chutney', 'Masala Tea'] },
  { dayOfWeek: 'Sunday', mealType: 'Dinner', timing: '7:30 PM - 9:30 PM', menuItems: ['Light Khichdi / Veg Pulao', 'Kadhi', 'Papad', 'Fruit Salad'] },
];

/**
 * @desc    Get mess schedule / menus (auto-seed if empty)
 * @route   GET /api/mess
 * @access  Public
 */
const getMesses = async (req, res, next) => {
  try {
    const { dayOfWeek, mealType, hostel } = req.query;
    const filter = {};

    if (dayOfWeek) filter.dayOfWeek = dayOfWeek;
    if (mealType) filter.mealType = mealType;
    if (hostel) filter.hostel = hostel;

    let menus = await Mess.find(filter).populate('hostel', 'name code');

    // Auto-seed or refresh if database has incomplete mess records (< 28 entries for 7 days)
    if (menus.length < 28 && Object.keys(filter).length === 0) {
      await Mess.deleteMany({});
      await Mess.insertMany(defaultWeeklyMenu);
      menus = await Mess.find().populate('hostel', 'name code');
    }

    res.status(200).json({
      success: true,
      count: menus.length,
      data: menus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single mess menu entry by ID
 * @route   GET /api/mess/:id
 * @access  Public
 */
const getMessById = async (req, res, next) => {
  try {
    const menu = await Mess.findById(req.params.id).populate('hostel', 'name code');

    if (!menu) {
      res.status(404);
      throw new Error('Mess menu record not found');
    }

    res.status(200).json({
      success: true,
      data: menu,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create / Add mess menu
 * @route   POST /api/mess
 * @access  Private (Admin / Warden)
 */
const createMess = async (req, res, next) => {
  try {
    const { dayOfWeek, mealType, timing, menuItems, specialDiet, hostel } = req.body;

    if (!dayOfWeek || !mealType || !menuItems) {
      res.status(400);
      throw new Error('Please provide day, meal type, and menu items');
    }

    const items = Array.isArray(menuItems) ? menuItems : String(menuItems).split(',').map((i) => i.trim());

    // Update existing if exists for this day/meal
    let messMenu = await Mess.findOne({ dayOfWeek, mealType, ...(hostel ? { hostel } : {}) });
    if (messMenu) {
      messMenu.menuItems = items;
      if (timing) messMenu.timing = timing;
      if (specialDiet !== undefined) messMenu.specialDiet = specialDiet;
      await messMenu.save();
    } else {
      messMenu = await Mess.create({
        dayOfWeek,
        mealType,
        timing: timing || '7:30 AM - 9:30 AM',
        menuItems: items,
        specialDiet: specialDiet || '',
        hostel: hostel || null,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Mess menu scheduled successfully',
      data: messMenu,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update mess menu
 * @route   PUT /api/mess/:id
 * @access  Private (Admin / Warden)
 */
const updateMess = async (req, res, next) => {
  try {
    const menu = await Mess.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!menu) {
      res.status(404);
      throw new Error('Mess menu record not found');
    }

    res.status(200).json({
      success: true,
      message: 'Mess menu updated successfully',
      data: menu,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete mess menu
 * @route   DELETE /api/mess/:id
 * @access  Private (Admin)
 */
const deleteMess = async (req, res, next) => {
  try {
    const menu = await Mess.findById(req.params.id);

    if (!menu) {
      res.status(404);
      throw new Error('Mess menu record not found');
    }

    await menu.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Mess menu deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMesses,
  getMessById,
  createMess,
  updateMess,
  deleteMess,
};
