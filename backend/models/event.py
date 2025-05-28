from datetime import datetime
import json
from models import db

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    _title = db.Column('title', db.Text, nullable=False) 
    _description = db.Column('description', db.Text)  
    date = db.Column(db.DateTime, nullable=False)
    _venue = db.Column('venue', db.Text, nullable=False)  
    category = db.Column(db.String(50), nullable=False)  # football, basketball, hockey, tennis
    image_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # relationships
    tickets = db.relationship('Ticket', backref='event', lazy=True, cascade='all, delete-orphan')
    bookings = db.relationship('Booking', backref='event', lazy=True)

    @property
    def title(self):
        try:
            return json.loads(self._title) if self._title else {'ru': '', 'en': ''}
        except:
            return {'ru': '', 'en': ''}

    @title.setter
    def title(self, value):
        self._title = json.dumps(value) if value else json.dumps({'ru': '', 'en': ''})

    @property
    def description(self):
        try:
            return json.loads(self._description) if self._description else {'ru': '', 'en': ''}
        except:
            return {'ru': '', 'en': ''}

    @description.setter
    def description(self, value):
        self._description = json.dumps(value) if value else json.dumps({'ru': '', 'en': ''})

    @property
    def venue(self):
        try:
            return json.loads(self._venue) if self._venue else {'ru': '', 'en': ''}
        except:
            return {'ru': '', 'en': ''}

    @venue.setter
    def venue(self, value):
        self._venue = json.dumps(value) if value else json.dumps({'ru': '', 'en': ''})
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'date': self.date.isoformat(),
            'venue': self.venue,
            'category': self.category,
            'image_url': self.image_url,
            'created_at': self.created_at.isoformat(),
            'tickets': [ticket.to_dict() for ticket in self.tickets],
            'available_tickets': self.get_available_tickets()
        }
    
    def get_available_tickets(self):
        # counting available tickets
        total = sum(ticket.capacity for ticket in self.tickets)
        
        # safely count booked places
        booked = 0
        for booking in self.bookings:
            try:
                if booking.status != 'cancelled':  # consider only active bookings
                    booked += len(booking.seats)
            except Exception:
                # if an error occurs when accessing seats, skip this booking
                pass
                
        return total - booked 