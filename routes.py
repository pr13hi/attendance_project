from flask import render_template, request, redirect, url_for
from utils.face_recognition import register_face, mark_attendance

def init_routes(app):
    @app.route('/')
    def home():
        return render_template('dashboard.html')

    @app.route('/login', methods=['GET', 'POST'])
    def login():
        if request.method == 'POST':
            # Authenticate user logic here
            return redirect(url_for('home'))
        return render_template('login.html')

    @app.route('/register', methods=['GET', 'POST'])
    def register_face_page():
        if request.method == 'POST':
            # Register face logic
            return redirect(url_for('home'))
        return render_template('register_face.html')

    @app.route('/attendance')
    def attendance():
        # Show attendance logs
        return render_template('attendance.html')
