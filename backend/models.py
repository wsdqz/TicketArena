class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.JSON, nullable=False)
    description = db.Column(db.JSON) 
    date = db.Column(db.DateTime, nullable=False)
    venue = db.Column(db.JSON, nullable=False) 
    category = db.Column(db.String(50), nullable=False)
    image_url = db.Column(db.String(500))
    
    # add cascade='all, delete-orphan' for automatic ticket deletion
    tickets = db.relationship('Ticket', backref='event', lazy=True, cascade='all, delete-orphan')
    bookings = db.relationship('Booking', backref='event', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'date': self.date.isoformat(),
            'venue': self.venue,
            'category': self.category,
            'image_url': self.image_url,
            'tickets': [ticket.to_dict() for ticket in self.tickets]
        }

class Ticket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id', ondelete='CASCADE'), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Float, nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    age_restriction = db.Column(db.String(10), default='0+')

    def to_dict(self):
        return {
            'id': self.id,
            'category': self.category,
            'price': self.price,
            'capacity': self.capacity,
            'age_restriction': self.age_restriction
        } 