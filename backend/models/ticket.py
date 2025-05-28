from models import db

class Ticket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    category = db.Column(db.String(50), nullable=False)  # VIP, standard, child
    price = db.Column(db.Float, nullable=False)
    capacity = db.Column(db.Integer, nullable=False)  # number of places in this category
    age_restriction = db.Column(db.String(10), nullable=False, default='0+')  # age restriction
    
    def to_dict(self):
        return {
            'id': self.id,
            'event_id': self.event_id,
            'category': self.category,
            'price': self.price,
            'capacity': self.capacity,
            'ageRestriction': self.age_restriction
        } 