from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from models.user import User
from models import db
import logging
import os
from datetime import datetime

# configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

profile_bp = Blueprint('profile', __name__)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif'}

@profile_bp.route('/api/users/profile', methods=['PUT'])
@login_required
def update_profile():
    try:
        if request.content_type and 'multipart/form-data' in request.content_type:
            # processing a form with a file
            name = request.form.get('name')
            email = request.form.get('email')
            current_password = request.form.get('currentPassword')
            new_password = request.form.get('newPassword')
            avatar = request.files.get('avatar')
        else:
            # processing JSON data
            data = request.get_json()
            if not data:
                return jsonify({'error': 'Data not received'}), 400
            name = data.get('name')
            email = data.get('email')
            current_password = data.get('currentPassword')
            new_password = data.get('newPassword')
            avatar = None

        # check email
        if email and email != current_user.email:
            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                return jsonify({'error': 'Email is already in use'}), 400

        # update basic data
        if name:
            current_user.name = name
        if email:
            current_user.email = email

        # update password if it was provided
        if current_password and new_password:
            if not current_user.check_password(current_password):
                return jsonify({'error': 'Invalid current password'}), 400
            current_user.set_password(new_password)

        # process avatar upload
        if avatar and avatar.filename:
            if not allowed_file(avatar.filename):
                return jsonify({'error': 'Invalid file format'}), 400

            # create a unique file name
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"{current_user.id}_{timestamp}_{secure_filename(avatar.filename)}"
            
            # save the file
            avatar_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            avatar.save(avatar_path)
            
            # update the URL in the database
            current_user.avatar_url = f'http://localhost:5000/static/avatars/{filename}'

        db.session.commit()
        return jsonify(current_user.to_dict())

    except Exception as e:
        logger.error(f'Error updating profile: {str(e)}', exc_info=True)
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/api/users/profile', methods=['GET'])
@login_required
def get_profile():
    try:
        return jsonify(current_user.to_dict())
    except Exception as e:
        logger.error(f'Error getting profile: {str(e)}', exc_info=True)
        return jsonify({'error': str(e)}), 500 