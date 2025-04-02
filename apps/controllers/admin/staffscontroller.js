const express = require('express');
const router = express.Router();
const Barber = require('../../model/barber'); // Model cho collection barbers
const User = require('../../model/user'); // Model cho collection users
const Service = require('../../model/service'); // Model cho collection services
const multer = require('multer');

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Specify your upload directory
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname); // Rename the file to avoid conflicts
  }
});

// Create the upload middleware
const upload = multer({ storage: storage });

// Route để lấy danh sách barber và trả về JSON
router.get('/staffs/data', async (req, res) => {
  try {
    // Lấy danh sách barber, đồng thời lấy tên dịch vụ từ collection Service và tên barber từ User
    const barbers = await Barber.find()
      .populate('service', 'name')
      .populate('userId', 'fullname'); // Populate để lấy tên từ bảng User

    res.json(barbers); // Trả về danh sách barber dưới dạng JSON
  } catch (error) {
    console.error('Lỗi khi lấy danh sách barber:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách barber' });
  }
});

// Route để lấy thông tin của một barber theo ID
router.get('/staffs/data/:id', async (req, res) => {
  try {
    const barberId = req.params.id;
    const barber = await Barber.findById(barberId)
      .populate('service', 'name')
      .populate('userId', 'fullname'); // Populate để lấy tên từ bảng User

    if (!barber) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên.' });
    }

    res.json(barber);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin nhân viên:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy thông tin nhân viên.' });
  }
});


router.get('/staffs-add', async (req, res) => {
  try {
      const services = await Service.find(); // Lấy danh sách dịch vụ
      const users = await User.find(); // Lấy danh sách người dùng

      res.render('admin/staffs-add', { services, users });
  } catch (error) {
      console.error('Lỗi khi tải trang thêm nhân viên:', error);
      res.status(500).send('Lỗi khi tải trang thêm nhân viên.');
  }
});


// Route để tạo mới nhân viên
router.post('/staffs/data', async (req, res) => {
  const { userId, experience, service, imageUrl } = req.body;

  try {
      const newBarber = new Barber({
          userId,
          experience,
          service,
          imageUrl // Lưu trực tiếp URL ảnh
      });

      await newBarber.save();
      res.redirect('/admin/staffs'); // Chuyển hướng về danh sách nhân viên
  } catch (error) {
      console.error('Lỗi khi tạo nhân viên:', error);
      res.status(500).send('Lỗi server khi tạo nhân viên.');
  }
});


// Trang cập nhật Barber
router.get('/staffs-update/:id', async (req, res) => {
  try {
    const barberId = req.params.id;
    const barber = await Barber.findById(barberId)
      .populate('service', 'name')
      .populate('userId', 'fullname'); // Populate để lấy tên từ bảng User

    if (!barber) {
      return res.status(404).send('Không tìm thấy nhân viên.');
    }

    res.render('admin/staffs-update', { barber });
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi khi tải trang sửa nhân viên.');
  }
});

// Route để cập nhật thông tin nhân viên
router.put('/staffs/update/:id', upload.single('image'), async (req, res) => {
  try {
    const barberId = req.params.id;
    const { userId, experience, service } = req.body;
    const imageUrl = req.file ? req.file.path : undefined;

    const updatedData = {
      userId,
      experience,
      service,
    };

    if (imageUrl) {
      updatedData.imageUrl = imageUrl;
    }

    const updatedBarber = await Barber.findByIdAndUpdate(
      barberId,
      updatedData,
      { new: true }
    ).populate('userId', 'fullname').populate('service', 'name');

    res.json({ message: 'Cập nhật nhân viên thành công!', barber: updatedBarber });
  } catch (error) {
    console.error('Lỗi khi cập nhật nhân viên:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật nhân viên.' });
  }
});

// Route để xóa nhân viên dựa trên ID
router.delete('/staffs/delete/:id', async (req, res) => {
  try {
    const barberId = req.params.id;
    const deletedBarber = await Barber.findByIdAndDelete(barberId);

    if (!deletedBarber) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên để xóa.' });
    }

    res.json({ message: 'Xóa nhân viên thành công!' });
  } catch (error) {
    console.error('Lỗi khi xóa nhân viên:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa nhân viên.' });
  }
});

module.exports = router;
