from app import app, db
from models.user import User
from models.event import Event
from models.booking import Booking
from models.ticket import Ticket

def init_db():
    with app.app_context():
        # create all tables
        db.create_all()
        
        # check if the administrator exists
        admin = User.query.filter_by(email='admin@gmail.com').first()
        if not admin:
            # create an administrator
            admin = User(
                name='Admin',
                email='admin@gmail.com',
                role='admin'
            )
            admin.set_password('admin123')
            db.session.add(admin)
            
        try:
            db.session.commit()
            print('Database initialized successfully')
        except Exception as e:
            db.session.rollback()
            print(f'Database initialization error: {str(e)}')

if __name__ == '__main__':
    init_db() 