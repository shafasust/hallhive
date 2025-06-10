
const express = require('express');
const cors = require('cors');
const app = express();
app.disable('etag');

app.use(cors());
app.use(express.json());



app.use('/api/auth', require('./routes/auth'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/events', require('./routes/events'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/student', require('./routes/student'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/allowed-students', require('./routes/allowedStudentUpload'));
app.use('/api/allowed-students', require('./routes/allowed_students'));
app.use('/api/room-availability', require('./routes/room_availability'));
app.use('/api/room-application', require('./routes/room_application'));
app.use('/api/admin/applications', require('./routes/admin_applications'));

app.listen(5000, () => {
    console.log('Server running at http://localhost:5000');
});