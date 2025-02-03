from flask import Flask, render_template, redirect, flash, get_flashed_messages, url_for, request
from model import *
from flask_migrate import Migrate
from flask_wtf import *
from flask_mail import *
from itsdangerous import URLSafeTimedSerializer
import base64
import secrets
from functools import wraps
from sqlalchemy import update
import pytz
from datetime import datetime, timedelta, timezone
from password_strength import PasswordPolicy

# establishing password policy for password checks #


app = Flask(__name__)

# establishes setting and configurations needed for the running of the site#

app.secret_key = secrets.token_hex(16)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///HealthAdviceGroupDatabase.db"
app.config["SECURITY_PASSWORD_SALT"] = secrets.token_hex(16)
app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 465
app.config["DEFAULT_SENDER"] = "contact.us.cbbb@gmail.com"
app.config["MAIL_USERNAME"] = "contact.us.cbbb@gmail.com"
app.config["MAIL_PASSWORD"] = "ibclqtbpldsaduam"
app.config["MAIL_USE_TLS"] = False
app.config["MAIL_USE_SSL"] = True
app.config['RECAPTCHA_PUBLIC_KEY'] = '6LdwgXQkAAAAAME9GrFMARDO_qEXUGMt2wOqIEyL'
app.config['RECAPTCHA_PRIVATE_KEY'] = '6LdwgXQkAAAAAGXaBHLxm2-tT6nprMzNZ5bCfVyQ'

mail = Mail(app)
mail.init_app(app)
db.init_app(app)
migrate = Migrate(app, db)
login.login_view = "login"
login.init_app(app)

# initialises all configured settings #

tokenprotection = CSRFProtect(app)


# only for development, used for resetting or creating the database if needed #
# if a database needs to be reset, uncomment drop all, create all, then run once and visit the page #
# Then end script, and re-comment out the code instructions (the database is stored in the 'instance' file #


def database_reset():
    with app.app_context():
        db.drop_all()
        db.create_all()
        data = UserAccounts.query.all()
        for i in data:
            print(i.username)
            print(i.password_hash)


database_reset()


@app.route("/")
def base():
    return render_template("base.html")


# form = MyForm()
#     if form.validate_on_submit():
#         return redirect('/weather')
# form=form


@app.route("/dashboard", methods=['GET'])
@login_required
def dashboard():
    if request.method == "GET":
        user_data = UserAccounts.query.filter_by(username=current_user.username).first()
        return render_template("homedashboard.html", data=user_data)


@app.route("/login", methods=['GET', 'POST'])
def login():
    if request.method == "GET":
        if current_user.is_authenticated:
            # redirects if user logged in #
            return redirect(url_for('dashboard'))
        return render_template("login.html")
    if request.method == "POST":
        with app.app_context():
            try:
                username = request.form["username"]
                user_data = UserAccounts.query.filter_by(username=username).first()
                # checks database if username exists or not,
                # then checks password against stored hash and logs the user in if both checks are passed #
                if user_data is None or not user_data.check_password(user_password=request.form["password"]):
                    flash("Invalid credentials!")
                    return render_template('login.html')
                login_user(user_data)
                return redirect(url_for('dashboard'))
            except:
                flash("An unexpected error occurred when attempting to login")
                return render_template('login.html')


class SignupForm(FlaskForm):
    recaptcha = RecaptchaField()


# sets a policy to be used in registration to ensure password security #


policy = PasswordPolicy.from_names(
    length=8,  # min length: 8
    uppercase=1,  # need min. 1 uppercase letters
    nonletters=2,  # need min. 2 non-letter characters (digits, specials, anything)
)


@app.route("/register", methods=['GET', 'POST'])
def register():
    if request.method == "GET":
        form = SignupForm()
        if current_user.is_authenticated:
            # redirects if user logged in #
            return redirect("homedashboard.html")
        return render_template("register.html", form=form)
    if request.method == "POST":
        if current_user.is_authenticated:
            # redirects if user logged in #
            return redirect("homedashboard.html")
        with app.app_context():
            try:
                # requests all data from register form #
                username = request.form["username"]
                email = request.form["email"]
                user_password = request.form["password"]
                confirm_password = request.form["confirm_password"]
                username_presence_check = UserAccounts.query.filter_by(username=username).first()
                email_presence_check = UserAccounts.query.filter_by(username=email).first()
                if username_presence_check is not None or email_presence_check is not None:
                    flash("email or username is already in use")
                    return render_template('register.html')
                # checks no other accounts with same details exist #
                # set of if checks to verify password security #
                password_check = policy.test(user_password)
                if len(password_check) != 0:
                    flash(
                        "passwords must be at least 8 characters, and contain 1 uppercase letter with 2 "
                        "non-alphabetic characters")
                    return render_template('register.html')
                if user_password != confirm_password:
                    flash("Both passwords do not match")
                    return render_template('register.html')
                # adds user to db, but with confirmed and staff set to false #
                user = UserAccounts(username=username, email=email)
                user.set_password(user_password)
                db.session.add(user)
                db.session.commit()
                # adds user to the database, then logs in (verified = false), #
                # and generates a token, and redirects for email confirmation #
                login_user(user)
                email_token = generate_token(email)
                link = url_for("confirm_email", token=email_token, _external=True)
                template = render_template("emailstyle.html", url=link, user=user.username)
                send_email("Email Confirmation", template, user.email)
                flash("A confirmation E-mail has been sent to your Address")
                return redirect(url_for('base'))
            except:
                flash("An unexpected error occurred when adding your account to our system")
                return render_template('register.html')


# logs the user out #

@app.route("/logout")
def logout():
    logout(current_user)
    return redirect(url_for('base'))


def generate_token(email):
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    # creates and returns a serializer using the current user email and a random salt #
    return serializer.dumps(email, salt=app.config['SECURITY_PASSWORD_SALT'])


# functions to create a new validation token, and to confirm the validity of a received token #

def validate_token(token, expiration=3600):
    try:
        serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
        # checks and returns the provided token is valid time-wise and all details match #
        email = serializer.loads(token, salt=app.config['SECURITY_PASSWORD_SALT'], max_age=expiration)
        return email
    except:
        return False


# email sending function for email verification #
def send_email(subject, template, user):
    msg = Message(
        subject,
        html=template,
        sender="contact.us.cbbb@gmail.com",
        recipients=[user]
    )
    mail.send(msg)


# routing function to check if a user is confirmed by email verification #

def check_is_confirmed(func):
    @wraps(wraps)
    def decorated_function(*args, **kwargs):
        if not current_user.verified:
            return redirect(url_for('base'))
        return func(*args, **kwargs)

    return decorated_function()


# route for confirming a provided token, using the previously mentioned validation functions #

@app.route("/confirm/<token>")
@login_required
def confirm_email(token):
    with app.app_context():
        email = validate_token(token)
        user = UserAccounts.query.filter_by(email=current_user.email).first_or_404()
        # checks that a user accessing the confirmation page is registered #
        if email == user.email:
            user.verified = True
            db.session.add(user)
            db.session.commit()
            # adds a user if the token matches the current email #
            flash("Your Account Has been successfully verified!")
            return redirect(url_for('base'))
        else:
            flash("There was an error in verifying your account")
            return redirect(url_for('base'))


# route for profile/profile picture configuration #

@app.route("/profile", methods=['GET', 'POST'])
@login_required
def profile():
    if request.method == "GET":
        return render_template("profile.html")
    if request.method == "POST":
        with app.app_context():
            try:
                uploaded_picture = request.files["uploaded_image"]
                encoded_image = base64.b64encode(uploaded_picture.read())
                string_for_database = encoded_image.decode('utf-8')
                update_query = (update(UserAccounts).where(UserAccounts.id == current_user.id).values(
                    profile_image=string_for_database))
                db.session.execute(update_query)
                db.session.commit()
                return 'uploaded'
            except:
                flash("there was an error when attempting to upload your picture")
                return redirect(url_for('dashboard'))


def hour_rounder(time):
    return (time.replace(second=0, microsecond=0, minute=0, hour=time.hour) + timedelta(hours=time.minute // 30))


@app.route("/tracker", methods=['GET', 'POST'])
@login_required
def tracker():
    if request.method == 'GET':
        user_table_data = Logs.query.filter_by(made_by=current_user.id)
        return render_template("healthtracker.html", Logs=user_table_data, user_name=current_user.username)
    if request.method == 'POST':
        logger_data = request.get_json()
        with app.app_context():
            try:
                symptoms = logger_data['symptoms']
                description = logger_data['loggerDescription']
                api_data = logger_data['api']
                # fetches sent  JSON data from JS
                now = datetime.now()
                rounded_time = (hour_rounder(now))
                iso_date = rounded_time.isoformat(timespec='minutes')
                # gets api data based off current time #
                current_api_index = (api_data['hourly']['time'].index(iso_date))
                N02 = (api_data['hourly']['nitrogen_dioxide'][current_api_index])
                alder = (api_data['hourly']['alder_pollen'][current_api_index])
                # uses these two as air quality/pollen values #
                new_entry = Logs(made_by=current_user.id, symptom_rating=symptoms, air_quality=N02, pollen_level=alder,
                                 user_description=description)
                db.session.add(new_entry)
                db.session.commit()
                return redirect(url_for('tracker'))
            except:
                flash("there was an unexpected error adding your log")
                return redirect(url_for('base'))
    return render_template('healthtracker.html')


@app.route("/createlog", methods=['GET', 'POST'])
@login_required
def createlog():
    if request.method == "GET":
        return render_template("createhealthlog.html")
    if request.method == "POST":
        return render_template("createhealthlog.html")


if __name__ == '__main__':
    app.run(debug=True)

# turn to False in production environment #
