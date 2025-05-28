from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import User, Event, Booking, db

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    @login_required
    def decorated_function(*args, **kwargs):
        if not current_user.is_admin():
            return jsonify({'error': 'Not enough rights'}), 403
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

@admin_bp.route('/api/admin/users')
@admin_required
def get_users():
    try:
        page = request.args.get('page', default=1, type=int)
        per_page = request.args.get('per_page', default=10, type=int)
        pagination = User.query.order_by(User.id.desc()).paginate(page=page, per_page=per_page, error_out=False)
        users = pagination.items
        result = [user.to_dict() for user in users]
        return jsonify({
            'items': result,
            'total': pagination.total,
            'page': pagination.page,
            'per_page': pagination.per_page,
            'pages': pagination.pages
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/api/admin/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        if 'name' in data:
            user.name = data['name']
        if 'email' in data:
            user.email = data['email']
        if 'role' in data and data['role'] in ['user', 'admin']:
            user.role = data['role']
        if 'is_active' in data:
            user.is_active = bool(data['is_active'])
        if 'avatar_url' in data:
            user.avatar_url = data['avatar_url']
            
        db.session.commit()
        return jsonify(user.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/api/admin/users/<int:user_id>/role', methods=['PUT'])
@admin_required
def update_user_role(user_id):
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        if 'role' not in data:
            return jsonify({'error': 'Role not specified'}), 400
            
        if data['role'] not in ['user', 'admin']:
            return jsonify({'error': 'Invalid role'}), 400
            
        user.role = data['role']
        db.session.commit()
        
        return jsonify(user.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        
        # do not allow to delete yourself
        if user.id == current_user.id:
            return jsonify({'error': 'errors.cannotDeleteOwnAccount'}), 400
            
        db.session.delete(user)
        db.session.commit()
        
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/api/admin/stats')
@admin_required
def get_stats():
    try:
        stats = {
            'users': User.query.count(),
            'events': Event.query.count(),
            'bookings': Booking.query.count()
        }
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500 