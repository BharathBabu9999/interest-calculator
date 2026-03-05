import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import aiosmtplib


async def send_password_reset_email(to_email: str, reset_url: str) -> None:
    gmail_user = os.getenv("GMAIL_USER")
    gmail_password = os.getenv("GMAIL_APP_PASSWORD")

    if not gmail_user or not gmail_password:
        # Dev fallback: just print the link
        print(f"\n[DEV] Password reset link for {to_email}:\n  {reset_url}\n")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Reset your Interest Calculator password"
    msg["From"] = f"Interest Calculator <{gmail_user}>"
    msg["To"] = to_email

    text_body = (
        f"Hi,\n\n"
        f"We received a request to reset your password.\n\n"
        f"Click the link below to choose a new password (expires in 1 hour):\n\n"
        f"  {reset_url}\n\n"
        f"If you didn't request this, you can safely ignore this email.\n"
    )
    html_body = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f8fafc;">
      <h2 style="color:#1e293b;margin-bottom:8px;">Reset your password</h2>
      <p style="color:#475569;margin-bottom:24px;">
        We received a request to reset the password for your Interest Calculator account associated with <strong>{to_email}</strong>.
      </p>
      <a href="{reset_url}"
         style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
        Reset Password
      </a>
      <p style="color:#64748b;font-size:13px;margin-top:24px;">
        This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.
      </p>
    </div>
    """

    msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    await aiosmtplib.send(
        msg,
        hostname="smtp.gmail.com",
        port=587,
        start_tls=True,
        username=gmail_user,
        password=gmail_password,
    )
