from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from models.user import User
from models import db
import logging

# configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    try:
        logger.debug('Start processing registration request')
        data = request.get_json()
        logger.debug(f'Received data: {data}')
        
        if not data:
            logger.error('No data received')
            return jsonify({'error': 'No data received'}), 400
            
        if not all(k in data for k in ['name', 'email', 'password']):
            logger.error(f'Missing required fields. Received fields: {list(data.keys())}')
            return jsonify({'error': 'Not all fields are filled'}), 400

        # check if a user exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            logger.warning(f'Attempt to register with an existing email: {data["email"]}')
            return jsonify({'error': 'Email is already registered'}), 400
        
        # create a new user
        logger.debug('Creating a new user')
        user = User(
            name=data['name'],
            email=data['email']
        )
        user.set_password(data['password'])
        
        logger.debug('Adding user to database')
        db.session.add(user)
        db.session.commit()
        
        # automatically log in after registration
        logger.debug('Executing user login')
        login_user(user)
        
        logger.debug('Registration completed successfully')
        return jsonify({
            'user': user.to_dict(),
            'message': 'Registration successful'
        }), 201

    except Exception as e:
        logger.error(f'Registration error: {str(e)}', exc_info=True)
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ['email', 'password']):
            return jsonify({'error': 'Not all fields are filled'}), 400

        user = User.query.filter_by(email=data['email']).first()
        
        if user and user.check_password(data['password']):
            login_user(user)
            return jsonify({
                'user': user.to_dict(),
                'message': 'Login successful'
            })
        
        return jsonify({'error': 'errors.loginError'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/api/auth/logout', methods=['POST'])
@login_required
def logout():
    try:
        logout_user()
        return jsonify({'message': 'Logout successful'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/api/auth/me')
@login_required
def me():
    try:
        return jsonify({
            'user': current_user.to_dict(),
            'isAuthenticated': True
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/api/auth/check', methods=['GET'])
def check_auth():
    try:
        if current_user.is_authenticated:
            return jsonify({
                'user': current_user.to_dict(),
                'isAuthenticated': True
            })
        return jsonify({
            'isAuthenticated': False,
            'error': 'Not authenticated'
        }), 401
    except Exception as e:
        logger.error(f'Error checking authentication: {str(e)}', exc_info=True)
        return jsonify({'error': str(e)}), 500 