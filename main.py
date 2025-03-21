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
from datetime import datetime, timedelta, timezone
from password_strength import PasswordPolicy


app = Flask(__name__)

app.secret_key = secrets.token_hex(16)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///HealthAdviceGroupDatabase.db"
app.config["SECURITY_PASSWORD_SALT"] = secrets.token_hex(16)
app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 465
app.config["MAIL_USE_TLS"] = False
app.config["MAIL_USE_SSL"] = True


mail = Mail(app)
mail.init_app(app)
db.init_app(app)
migrate = Migrate(app, db)
login.login_view = "login"
login.init_app(app)

# initialises all configured settings #

tokenprotection = CSRFProtect(app)

class SignupForm(FlaskForm):
    recaptcha = RecaptchaField()



def database_reset():
    with app.app_context():
        db.drop_all()
        db.create_all()
        data = UserAccounts.query.all()
        for i in data:
            print(i.username)
            print(i.password_hash)


# database_reset()


@app.route("/")
def base():
    return render_template("index.html")


@app.route("/login", methods=['GET', 'POST'])
def login():
    if request.method == "GET":
        if current_user.is_authenticated:
            # redirects if user logged in #
            return redirect(url_for('index'))
        return render_template("login.html")
    if request.method == "POST":
        with app.app_context():
            try:
                email = request.form["email"]
                user_data = UserAccounts.query.filter_by(email=email).first()
                # checks database if username exists or not,
                # then checks password against stored hash and logs the user in if both checks are passed #
                if user_data is None or not user_data.check_password(user_password=request.form["password"]):
                    flash("Invalid credentials!")
                    return render_template('login.html')
                login_user(user_data)
                return redirect(url_for('base'))
            except Exception as e:
                flash("An unexpected error occurred when adding your account to our system")
                flash(f'{e}')
                return render_template('login.html')


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
            return redirect("index.html")
        return render_template("register.html", form=form)
    if request.method == "POST":
        if current_user.is_authenticated:
            # redirects if user logged in #
            return redirect("index.html")
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
                login_user(user)
                return redirect(url_for('base'))
            except Exception as e:
                flash("An unexpected error occurred when adding your account to our system")
                flash(f'{e}')
                return render_template('register.html')


if __name__ == '__main__':
    app.run(debug=True)

