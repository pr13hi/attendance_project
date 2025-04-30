# Attendance Management System using Face Recognition

This project is a facial recognition-based attendance management system built using Python, Flask, and OpenCV. It allows users to register faces, recognize attendees in real-time, and log attendance into a CSV or database.

## 🛠 Features
- Face registration & dataset creation
- Real-time face recognition using webcam
- Attendance logging with timestamps
- Multiple checkpoints: start, random, and end
- CSV/Database storage (future enhancement)
- Flask web interface (for future UI integration)

## 🧰 Tech Stack
- Python
- OpenCV
- face_recognition library
- Flask
- SQLite/MySQL (planned)

## 📁 Folder Structure
attendance_project/ │ 
├── app.py # Main Flask app 
├── attendance.csv # Logs attendance 
├── README.md # Project info 
├── .gitignore # Git ignored files │ 
├── static/ │ 
├── css/ │ 
├── js/ │ └── captured_faces/ # Stored face captures │ 
├── templates/ # HTML templates 
├── dataset/ # Collected face data 
├── trained_model/ # Face encodings └── utils/ 
├── face_recognition.py # Face processing logic └── scheduler.py # Scheduling checkpoints


## ✅ To-Do
- [ ] Build face registration UI
- [ ] Implement real-time recognition
- [ ] Add scheduler for checkpoint-based attendance
- [ ] Integrate DB storage
- [ ] Improve UI with Flask templates

---

### 🙋‍♀️ Contributing
To contribute, fork the repo and make a pull request. All help is welcome!

---

### 📄 `.gitignore`
```gitignore
# Byte-compiled / cache files
__pycache__/
*.py[cod]
*$py.class

# Virtual environment
venv/
env/

# OS files
.DS_Store
Thumbs.db

# Dataset and output folders
dataset/
trained_model/
static/captured_faces/
attendance.csv
