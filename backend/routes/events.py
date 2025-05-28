from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import Event, Ticket, Booking, db
from datetime import datetime
import traceback

events_bp = Blueprint('events', __name__)

@events_bp.route('/api/events')
def get_events():
    try:
        print("Received request to get events")
        # get filtering parameters
        category = request.args.get('category')
        date = request.args.get('date')
        page = request.args.get('page', default=1, type=int)
        per_page = request.args.get('per_page', default=8, type=int)
        
        query = Event.query
        
        if category:
            query = query.filter_by(category=category)
        if date:
            date_obj = datetime.strptime(date, '%Y-%m-%d')
            query = query.filter(Event.date >= date_obj, 
                               Event.date < date_obj.replace(hour=23, minute=59, second=59))
        
        pagination = query.order_by(Event.date.desc()).paginate(page=page, per_page=per_page, error_out=False)
        events = pagination.items
        print(f"Found events: {len(events)}")
        
        result = []
        for event in events:
            try:
                event_dict = event.to_dict()
                result.append(event_dict)
            except Exception as e:
                print(f"Error serializing event {event.id}: {str(e)}")
                print(traceback.format_exc())
        
        return jsonify({
            'items': result,
            'total': pagination.total,
            'page': pagination.page,
            'per_page': pagination.per_page,
            'pages': pagination.pages
        })
    except Exception as e:
        print("Error fetching events:", str(e))
        print(traceback.format_exc())
        return jsonify({'error': 'Error loading events'}), 500

@events_bp.route('/api/events/<int:event_id>')
def get_event(event_id):
    try:
        event = Event.query.get_or_404(event_id)
        return jsonify(event.to_dict())
    except Exception as e:
        print(f"Error fetching event {event_id}:", str(e))
        print(traceback.format_exc())
        return jsonify({'error': 'Error loading event'}), 500

@events_bp.route('/api/events', methods=['POST'])
@login_required
def create_event():
    if not current_user.is_admin():
        return jsonify({'error': 'Not enough rights'}), 403
    
    try:
        print("Received request to create event")
        data = request.get_json()
        print("Request data:", data)
        
        if not data:
            return jsonify({'error': 'Event data is missing'}), 400
            
        required_fields = ['title', 'date', 'venue', 'category', 'tickets']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field {field}'}), 400
        
        # check the structure of multi-language fields
        for field in ['title', 'description', 'venue']:
            if field in data and not isinstance(data[field], dict):
                return jsonify({'error': f'Field {field} must be an object with ru and en keys'}), 400
            if field in data and not all(key in data[field] for key in ['ru', 'en']):
                return jsonify({'error': f'Field {field} must contain ru and en keys'}), 400
        
        # check the date
        try:
            event_date = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid date format'}), 400
        
        event = Event(
            title=data['title'],
            description=data.get('description', {'ru': '', 'en': ''}),
            date=event_date,
            venue=data['venue'],
            category=data['category'],
            image_url=data.get('image_url')
        )
        
        # create ticket categories
        if not isinstance(data['tickets'], list):
            return jsonify({'error': 'Field tickets must be an array'}), 400
            
        for ticket_data in data['tickets']:
            if not all(key in ticket_data for key in ['category', 'price', 'capacity']):
                return jsonify({'error': 'Each ticket must contain category, price and capacity'}), 400
                
            try:
                price = float(ticket_data['price'])
                capacity = int(ticket_data['capacity'])
                if price < 0 or capacity < 0:
                    raise ValueError
            except (ValueError, TypeError):
                return jsonify({'error': 'Invalid price or capacity format'}), 400
                
            ticket = Ticket(
                category=ticket_data['category'],
                price=price,
                capacity=capacity,
                age_restriction=ticket_data.get('ageRestriction', '0+')
            )
            event.tickets.append(ticket)
        
        print("Saving event to database...")
        db.session.add(event)
        db.session.commit()
        
        result = event.to_dict()
        print("Event successfully created:", result)
        return jsonify(result), 201
        
    except Exception as e:
        print("Error creating event:", str(e))
        print(traceback.format_exc())
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@events_bp.route('/api/events/<int:event_id>', methods=['PUT'])
@login_required
def update_event(event_id):
    if not current_user.is_admin():
        return jsonify({'error': 'Not enough rights'}), 403
    
    event = Event.query.get_or_404(event_id)
    data = request.get_json()
    
    event.title = data.get('title', event.title)
    event.description = data.get('description', event.description)
    if 'date' in data:
        event.date = datetime.fromisoformat(data['date'])
    event.venue = data.get('venue', event.venue)
    event.category = data.get('category', event.category)
    event.image_url = data.get('image_url', event.image_url)
    
    db.session.commit()
    
    return jsonify(event.to_dict())

@events_bp.route('/api/events/<int:event_id>', methods=['DELETE'])
@login_required
def delete_event(event_id):
    print(f"Received request to delete event {event_id}")
    print(f"Current user: {current_user.id}, is_admin: {current_user.is_admin()}")
    
    if not current_user.is_admin():
        print("Access denied: user is not an administrator")
        return jsonify({'error': 'Not enough rights'}), 403
    
    try:
        event = Event.query.get_or_404(event_id)
        print(f"Event found: {event.id}")
        
        # Check for related bookings
        bookings = Booking.query.filter_by(event_id=event_id).first()
        if bookings:
            print(f"Found related bookings for event {event_id}")
            return jsonify({'error': 'Cannot delete event because there are related bookings'}), 400
        
        print("Deleting event (tickets will be deleted automatically)")
        db.session.delete(event)
        db.session.commit()
        
        print("Event successfully deleted")
        return jsonify({'message': 'Event successfully deleted'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting event: {str(e)}")
        print("Full error stack:")
        print(traceback.format_exc())
        return jsonify({'error': f'Error deleting event: {str(e)}'}), 500

# routes for working with event tickets
@events_bp.route('/api/events/<int:event_id>/tickets')
def get_event_tickets(event_id):
    event = Event.query.get_or_404(event_id)
    return jsonify([ticket.to_dict() for ticket in event.tickets])

@events_bp.route('/api/events/<int:event_id>/tickets', methods=['POST'])
@login_required
def add_event_ticket(event_id):
    if not current_user.is_admin():
        return jsonify({'error': 'Not enough rights'}), 403
    
    event = Event.query.get_or_404(event_id)
    data = request.get_json()
    
    ticket = Ticket(
        event_id=event_id,
        category=data['category'],
        price=data['price'],
        capacity=data['capacity']
    )
    
    db.session.add(ticket)
    db.session.commit()
    
    return jsonify(ticket.to_dict()), 201 