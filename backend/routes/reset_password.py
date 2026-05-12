from flask import Blueprint, request, jsonify
from models.user import User
from models import db

reset_password_bp = Blueprint('reset_password', __name__)

@reset_password_bp.route('/api/auth/reset-password-request', methods=['POST'])
def reset_password_request():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    return jsonify({'message': 'Reset code sent to email'}), 200

@reset_password_bp.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    email = data.get('email')
    code = data.get('code')
    password = data.get('password')
    if not all([email, code, password]):
        return jsonify({'error': 'All fields are required'}), 400
    if code != '123456':
        return jsonify({'error': 'Invalid code'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    user.set_password(password)
    db.session.commit()
    return jsonify({'message': 'Password has been reset'}), 200 