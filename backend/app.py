from flask import Flask, jsonify
from flask_login import LoginManager
from flask_cors import CORS
from dotenv import load_dotenv
import os
import logging
from models import init_models

# configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# load environment variables
load_dotenv()

# initialize the application
app = Flask(__name__, static_folder='static', static_url_path='/static')

# create a folder for avatars if it doesn't exist
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'avatars')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# configure CORS
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept"],
        "supports_credentials": True,
        "expose_headers": ["Content-Type", "Authorization"],
        "max_age": 3600,
        "send_wildcard": False
    }
})

# configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///instance/ticketarena.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_SECURE'] = False  # for development
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = 3600  # 1 hour

# initialize extensions
db = init_models(app)
login_manager = LoginManager(app)
login_manager.login_view = 'auth.login'
login_manager.session_protection = "strong"

# import models
from models.user import User
from models.event import Event
from models.booking import Booking
from models.ticket import Ticket

@login_manager.user_loader
def load_user(user_id):
    try:
        return User.query.get(int(user_id))
    except Exception as e:
        logger.error(f"Error loading user: {str(e)}")
        return None

# error handler
@app.errorhandler(Exception)
def handle_error(error):
    logger.error(f"Unhandled error: {str(error)}", exc_info=True)
    return jsonify({'error': str(error)}), 500

# register blueprints
from routes.auth import auth_bp
from routes.events import events_bp
from routes.bookings import bookings_bp
from routes.admin import admin_bp
from routes.profile import profile_bp
from routes.reset_password import reset_password_bp

app.register_blueprint(auth_bp)
app.register_blueprint(events_bp)
app.register_blueprint(bookings_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(reset_password_bp)

@app.route('/api/test')
def test():
    return {'message': 'API works!'}

if __name__ == '__main__':
    app.run(debug=True) 