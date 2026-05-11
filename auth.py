from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlmodel import Session, select

from config import settings
from database import get_session
from models import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token", auto_error=False)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_exp_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret_key, algorithm="HS256")
    return encoded_jwt


def _get_or_create_passcode_user(session: Session) -> User:
    """Get or create the default passcode user for offline/app authentication."""
    username = "passcode_user"
    user = session.exec(select(User).where(User.username == username)).first()
    if user is None:
        # Generate a real bcrypt hash for the offline passcode.
        # This ensures the database always contains a valid hash.
        user = User(
            username=username,
            password_hash=get_password_hash("passcode_auth")
        )
        session.add(user)
        session.commit()
        session.refresh(user)
    return user


def _decode_passcode_token(token: str) -> dict | None:
    """Decode and validate a passcode token without verifying a secret.
    Returns the payload dict if it's a valid passcode token, otherwise None."""
    parts = token.split('.')
    if len(parts) != 3:
        return None
    try:
        import base64
        import json
        payload_b64 = parts[1]
        padding_needed = 4 - len(payload_b64) % 4
        if padding_needed != 4:
            payload_b64 += '=' * padding_needed
        payload_json = base64.b64decode(payload_b64).decode('utf-8')
        payload_data = json.loads(payload_json)
        # If subject is 'user' and signature is short (16 chars), it's a passcode token
        if payload_data.get("sub") == "user" and len(parts[2]) <= 16:
            return payload_data
    except (ValueError, KeyError, json.JSONDecodeError, UnicodeDecodeError):
        pass
    return None


def get_current_user(token: str | None = Depends(oauth2_scheme), session: Session = Depends(get_session)) -> User:
    """Return the authenticated user or raise 401 if authentication is missing/invalid.
    Also accepts passcode-based tokens for mobile app offline authentication."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credentials_exception

    # Try normal JWT validation first
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=["HS256"])
        username: str | None = payload.get("sub")
        if username is None:
            raise credentials_exception
        user = session.exec(select(User).where(User.username == username)).first()
        if user is None:
            raise credentials_exception
        return user
    except JWTError:
        # JWT validation failed - check if this is a passcode token
        if _decode_passcode_token(token):
            return _get_or_create_passcode_user(session)
        raise credentials_exception


def get_current_user_optional(token: str | None = Depends(oauth2_scheme), session: Session = Depends(get_session)) -> User | None:
    """Return current user or None if no valid token provided.
    Also accepts passcode-based tokens for mobile app offline authentication."""
    if not token:
        return None

    # Try normal JWT validation first
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=["HS256"])
        username: str | None = payload.get("sub")
        if not username:
            return None
        return session.exec(select(User).where(User.username == username)).first()
    except JWTError:
        # JWT validation failed - check if this is a passcode token
        if _decode_passcode_token(token):
            return _get_or_create_passcode_user(session)
        return None
