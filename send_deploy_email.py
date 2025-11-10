#!/usr/bin/env python3
import smtplib
from email.message import EmailMessage
import sys

# Read arguments from bash
deploying_for = sys.argv[1]
status = sys.argv[2]
deployer = sys.argv[3]
branch = sys.argv[4]
timestamp = sys.argv[5]
commit_msg = sys.argv[6]
backup_folder = sys.argv[7]

# Email content
msg = EmailMessage()
msg['Subject'] = f"Deployment Report: {deploying_for} ({status})"
msg['From'] = "noreply@dev.sonicspace.sonic-hub.com"
msg['To'] = "trupti.pawar@gophygital.io, prashant.kashid@gophygital.io, shubham.salunkhe@gophygital.io, aditya.muthal@gophygital.io, viren.khembavi@gophygital.io, makarand.burud@gophygital.io, nikita.padekar@gophygital.io, roshan.chaudhari@gophygital.io, namrata.bandal@gophygital.io"


body = f"""
🚀 Frontend Deployment Report

Deployer        : {deployer}
Deploying For   : {deploying_for}
Branch          : {branch}
Environment     : dev
Deployed At     : {timestamp}
Commit Message  : {commit_msg}
Deploy Status   : {status}
Backed Up       : {backup_folder}
"""

msg.set_content(body)

# SMTP details
smtp_host = "smtp.zeptomail.com"
smtp_port = 587
smtp_user = "noreply@dev.sonicspace.sonic-hub.com"
smtp_pass = "wSsVR61+qx/2CPh5mGGtJL07kFwHDlL3FEh82FKjuSX5GPuQ8sc5lUKbDQWgSfccGWY4FTASrbx7nx4AhDYGjdUqnlAEDyiF9mqRe1U4J3x17qnvhDzOWWRfkxGNLIoNwwxpn2dmEMkn+g=="

try:
    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)
except Exception as e:
    print("❌ Failed to send email:", e)
    sys.exit(1)
