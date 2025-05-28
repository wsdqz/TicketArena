from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_models(app):
    db.init_app(app)
    return db

# import models after creating db
from .user import User
from .event import Event
from .booking import Booking
from .ticket import Ticket

__all__ = ['User', 'Event', 'Booking', 'Ticket', 'db', 'init_models'] 