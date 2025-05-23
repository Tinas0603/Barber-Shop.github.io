const express = require("express");
const router = express.Router();
const Booking = require("../../model/booking");
const Barber = require("../../model/barber");


const isStaff = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'barber') {
        return next();
    } else {
        return res.status(403).send('Bạn không có quyền truy cập!');
    }
};

router.use(isStaff);

router.get("/appointment", (req, res) => {
    res.render("staff/appointment");
});


router.get("/", async (req, res) => {
    try {
        const barber = await Barber.findById(req.session.barberId).populate('userId', 'fullname');
        res.render("staff/appointment", { barber: barber.userId });
    } catch (error) {
        console.error("Lỗi khi render trang lịch hẹn:", error);
        res.status(500).send("Đã xảy ra lỗi khi render trang lịch hẹn");
    }
});

// API lấy danh sách lịch hẹn của barber
router.get("/appointments", async (req, res) => {
    try {
        const barberId = req.session.barberId;

        const appointments = await Booking.find({ barber: barberId })
            .populate("user", "fullname email phonenumber")
            .populate("service", "name price")
            .sort({ date: 1, time: 1 });

        const formattedAppointments = appointments.map(appointment => ({
            ...appointment.toObject(),
            date: appointment.date.toLocaleDateString(),
            time: appointment.time
        }));

        res.json(formattedAppointments);
    } catch (error) {
        console.error("Lỗi khi lấy lịch hẹn:", error);
        res.status(500).send("Đã xảy ra lỗi khi lấy lịch hẹn");
    }
});

router.put('/appointments/confirm/:id', async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const updatedAppointment = await Booking.findByIdAndUpdate(
            appointmentId,
            { status: 'Xác nhận' },
            { new: true }
        );

        if (!updatedAppointment) {
            return res.status(404).send('Lịch hẹn không tồn tại.');
        }

        res.status(200).json(updatedAppointment);
    } catch (error) {
        console.error("Lỗi khi xác nhận lịch hẹn:", error);
        res.status(500).send("Đã xảy ra lỗi khi xác nhận lịch hẹn");
    }
});

router.put('/appointments/cancel/:id', async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const updatedAppointment = await Booking.findByIdAndUpdate(
            appointmentId,
            { status: 'Đã hủy' },
            { new: true }
        );

        if (!updatedAppointment) {
            return res.status(404).send('Lịch hẹn không tồn tại.');
        }

        res.status(200).json(updatedAppointment);
    } catch (error) {
        console.error("Lỗi khi hủy lịch hẹn:", error);
        res.status(500).send("Đã xảy ra lỗi khi hủy lịch hẹn");
    }
});


module.exports = router;
