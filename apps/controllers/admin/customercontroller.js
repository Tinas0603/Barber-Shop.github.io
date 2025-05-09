const express = require('express');
const router = express.Router();
const User = require('../../model/user');

// Route lấy danh sách khách hàng dưới dạng JSON (AJAX)
router.get('/customers/data', async (req, res) => {
  try {
    const search = req.query.search || '';
    const searchQuery = {
      role: 'user',
      $or: [
        { fullname: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phonenumber: new RegExp(search, 'i') }
      ]
    };

    // Lấy danh sách từ MongoDB
    const customers = await User.find(searchQuery);
    
    // Trả về JSON cho AJAX
    res.json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// Route xóa khách hàng (AJAX)
router.delete('/customers/delete/:id', async (req, res) => {
  try {
    const customerId = req.params.id;
    await User.findByIdAndDelete(customerId);
    res.json({ message: 'Xóa khách hàng thành công!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi xóa khách hàng.' });
  }
});

// router.put('/customers/update/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { fullname, email, phonenumber } = req.body;

//     // Kiểm tra xem dữ liệu có hợp lệ không
//     if (!fullname || !email || !phonenumber) {
//       return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin.' });
//     }

//     const customer = await Customer.findByIdAndUpdate(id, { fullname, email, phonenumber }, { new: true });

//     if (!customer) {
//       return res.status(404).json({ message: 'Khách hàng không tồn tại.' });
//     }

//     res.json({ message: 'Cập nhật thành công!', customer });
//   } catch (error) {
//     console.error('Lỗi server:', error);
//     res.status(500).json({ message: 'Lỗi server khi cập nhật khách hàng.' });
//   }
// });



module.exports = router;
