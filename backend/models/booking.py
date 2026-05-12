from datetime import datetime
from models import db
import json

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    _seats = db.Column('seats', db.Text, nullable=False)  # JSON string with list of booked seats
    total_price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending / confirmed / cancelled
    created_at = db.Column(db.DateTime, default=datetime.now)
    
    @property
    def seats(self):
        try:
            return json.loads(self._seats) if self._seats else []
        except:
            return []
            
    @seats.setter
    def seats(self, value):
        self._seats = json.dumps(value) if value else json.dumps([])
    
    def to_dict(self):
        result = {
            'id': self.id,
            'user_id': self.user_id,
            'event_id': self.event_id,
            'seats': self.seats,
            'total_price': self.total_price,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }
        
        # safely add data from related models
        try:
            if hasattr(self, 'event') and self.event:
                result['event_title'] = self.event.title
        except Exception:
            result['event_title'] = 'Unknown event'
            
        try:
            if hasattr(self, 'user') and self.user:
                result['user_name'] = self.user.name
        except Exception:
            result['user_name'] = 'Unknown user'
            
        return result 