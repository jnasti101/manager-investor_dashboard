#!/bin/bash

# Script to update a user's role to MANAGER
# Usage: ./scripts/update-user-role.sh <email> <role>
# Example: ./scripts/update-user-role.sh john@example.com MANAGER

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: ./scripts/update-user-role.sh <email> <role>"
  echo "Example: ./scripts/update-user-role.sh john@example.com MANAGER"
  echo ""
  echo "Available roles: CLIENT, MANAGER, ADMIN"
  exit 1
fi

EMAIL=$1
ROLE=$2

echo "Updating user role..."
echo "Email: $EMAIL"
echo "New Role: $ROLE"
echo ""

# Run Prisma Studio command to update the role
npx prisma db execute --stdin <<SQL
UPDATE "User" SET role = '$ROLE' WHERE email = '$EMAIL';
SQL

if [ $? -eq 0 ]; then
  echo "✅ User role updated successfully!"
  echo ""
  echo "You can now log in with this account and access the $ROLE dashboard."
else
  echo "❌ Failed to update user role"
  exit 1
fi
