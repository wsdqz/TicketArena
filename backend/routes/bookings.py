from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import Booking, Event, db
import logging
from collections import Counter

# configure logging
logger = logging.getLogger(__name__)

bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route('/api/bookings')
@login_required
def get_bookings():
    # users see only their own bookings on this endpoint
    page = request.args.get('page', default=1, type=int)
    per_page = request.args.get('per_page', default=10, type=int)
    pagination = Booking.query.filter_by(user_id=current_user.id).order_by(Booking.id.desc()).paginate(page=page, per_page=per_page, error_out=False)
    bookings = pagination.items
    result = [booking.to_dict() for booking in bookings]
    return jsonify({
        'items': result,
        'total': pagination.total,
        'page': pagination.page,
        'per_page': pagination.per_page,
        'pages': pagination.pages
    })

@bookings_bp.route('/api/admin/bookings')
@login_required
def get_all_bookings_for_admin():
    # admins can access this endpoint to see all bookings
    if not current_user.is_admin():
        return jsonify({'error': 'Not enough rights'}), 403

    page = request.args.get('page', default=1, type=int)
    per_page = request.args.get('per_page', default=10, type=int)
    pagination = Booking.query.order_by(Booking.id.desc()).paginate(page=page, per_page=per_page, error_out=False)
    bookings = pagination.items
    result = [booking.to_dict() for booking in bookings]
    return jsonify({
        'items': result,
        'total': pagination.total,
        'page': pagination.page,
        'per_page': pagination.per_page,
        'pages': pagination.pages
    })

@bookings_bp.route('/api/bookings/<int:booking_id>')
@login_required
def get_booking(booking_id):
    booking = Booking.query.get_or_404(booking_id)
    
    # check access rights
    if not current_user.is_admin() and booking.user_id != current_user.id:
        return jsonify({'error': 'Not enough rights'}), 403
    
    return jsonify(booking.to_dict())

@bookings_bp.route('/api/bookings', methods=['POST'])
@login_required
def create_booking():
    data = request.get_json()
    logger.debug(f"Received booking data: {data}")
    
    try:
        # check if the event exists
        event_id = data.get('event_id')
        if not event_id:
            logger.error("Missing event_id in request")
            return jsonify({'error': 'Отсутствует ID события'}), 400
            
        event = Event.query.get_or_404(event_id)
        logger.debug(f"Found event: {event.id} - {event.title}")
        
        # check if required fields are present
        if 'seats' not in data or 'total_price' not in data:
            logger.error(f"Missing required fields: seats or total_price. Data: {data}")
            return jsonify({'error': 'Missing required fields'}), 400
        
        # check availability of tickets by categories
        ticket_categories = {}
        for seat_category in data['seats']:
            if seat_category in ticket_categories:
                ticket_categories[seat_category] += 1
            else:
                ticket_categories[seat_category] = 1
        
        logger.debug(f"Ticket categories requested: {ticket_categories}")
        
        # check availability of tickets by categories
        for category, count in ticket_categories.items():
            ticket = next((t for t in event.tickets if t.category == category), None)
            if not ticket:
                logger.error(f"Ticket category not found: {category}")
                return jsonify({'error': f'Ticket category not found: {category}'}), 400
                
            logger.debug(f"Found ticket category {category} with capacity {ticket.capacity}")
            
            if ticket.capacity < count:
                logger.warning(f"Not enough tickets for category {category}. Requested: {count}, Available: {ticket.capacity}")
                return jsonify({'error': f'Not enough tickets for category {category}'}), 400
        
        # update the number of available tickets
        for category, count in ticket_categories.items():
            ticket = next((t for t in event.tickets if t.category == category), None)
            ticket.capacity -= count
            logger.debug(f"Updated ticket capacity for {category}: {ticket.capacity}")
        
        # create a booking
        booking = Booking(
            user_id=current_user.id,
            event_id=event_id,
            seats=data['seats'],
            total_price=data['total_price']
        )
        
        db.session.add(booking)
        db.session.commit()
        logger.info(f"Booking created successfully: {booking.id}")
        
        # return the created booking
        result = booking.to_dict()
        logger.debug(f"Booking result: {result}")
        return jsonify(result), 201
        
    except Exception as e:
        logger.error(f"Error creating booking: {str(e)}", exc_info=True)
        db.session.rollback()
        return jsonify({'error': f'Error creating booking: {str(e)}'}), 500

@bookings_bp.route('/api/bookings/<int:booking_id>', methods=['PUT'])
@login_required
def update_booking(booking_id):
    try:
        # load the booking together with related models
        booking = Booking.query.options(
            db.joinedload(Booking.event),
            db.joinedload(Booking.user)
        ).get_or_404(booking_id)
        
        # check access rights
        if not current_user.is_admin() and booking.user_id != current_user.id:
            return jsonify({'error': 'Not enough rights'}), 403
        
        data = request.get_json()
        logger.debug(f"Received update data: {data}")
        
        # allow users to change status to 'confirmed' or 'cancelled', admins to any
        if 'status' in data and data['status'] in ['pending', 'confirmed', 'cancelled']:
            if current_user.is_admin() or data['status'] in ['confirmed', 'cancelled']:
                # additional check for users to only confirm or cancel their own bookings
                if current_user.is_admin() or booking.user_id == current_user.id:
                    booking.status = data['status']
                    logger.debug(f"Booking {booking.id} status updated to {booking.status} by user {current_user.id}")
                else:
                    return jsonify({'error': 'Dont have enough rights to change this reservation'}), 403 
            else:
                return jsonify({'error': 'Dont have enough rights to set this status.'}), 403 
        
        db.session.commit()
        
        # create a simplified response without related models
        response_data = {
            'id': booking.id,
            'status': booking.status,
            'total_price': booking.total_price,
            'seats': booking.seats,
            'created_at': booking.created_at.isoformat(),
            'user_name': booking.user.name if hasattr(booking, 'user') and booking.user else 'Unknown',
            'event_title': booking.event.title if hasattr(booking, 'event') and booking.event else {'ru': 'Неизвестное событие', 'en': 'Unknown event'}
        }
        
        logger.debug(f"Updated booking data: {response_data}")
        return jsonify(response_data), 200
    except Exception as e:
        logger.error(f"Error updating booking: {str(e)}", exc_info=True)
        db.session.rollback()
        return jsonify({'error': f'Error updating booking: {str(e)}'}), 500

@bookings_bp.route('/api/bookings/<int:booking_id>', methods=['DELETE'])
@login_required
def cancel_booking(booking_id):
    try:
        # load the booking together with related models
        booking = Booking.query.options(
            db.joinedload(Booking.event),
            db.joinedload(Booking.user)
        ).get_or_404(booking_id)
        
        # check access rights
        if not current_user.is_admin() and booking.user_id != current_user.id:
            return jsonify({'error': 'Not enough rights'}), 403
        
        # return tickets to the available pool
        event = booking.event
        if event:
            # count the number of tickets by categories
            seat_counts = Counter(booking.seats)
            for category, count in seat_counts.items():
                ticket = next((t for t in event.tickets if t.category == category), None)
                if ticket:
                    ticket.capacity += count
        
        # cancel the booking (soft delete)
        booking.status = 'cancelled'
        db.session.commit()
        
        # create a simplified response without related models
        response_data = {
            'id': booking.id,
            'status': booking.status,
            'total_price': booking.total_price,
            'seats': booking.seats,
            'created_at': booking.created_at.isoformat()
        }
        
        logger.debug(f"Cancelled booking data: {response_data}")
        return jsonify(response_data), 200
            
    except Exception as e:
        logger.error(f"Error cancelling booking: {str(e)}", exc_info=True)
        return jsonify({'error': f'Error cancelling booking: {str(e)}'}), 500 