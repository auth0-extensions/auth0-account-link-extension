CURRENT_VERSION=$(node tools/attribute.js version)
EXTENSION_NAME="auth0-account-link-extension"

CDN_EXISTS=$(aws s3 ls s3://assets.us.auth0.com/css/$EXTENSION_NAME/$CURRENT_VERSION/ | grep "link.min.css")
ADMIN_CDN_EXISTS=$(aws s3 ls s3://assets.us.auth0.com/css/$EXTENSION_NAME/$CURRENT_VERSION/ | grep "admin.min.css")

if [ ! -z "$CDN_EXISTS" ]; then
  echo "There is already a version $CURRENT_VERSION in the cdn. Skipping cdn publish…"
else
  aws s3 cp public/css/link.min.css s3://assets.us.auth0.com/extensions/$EXTENSION_NAME/$CURRENT_VERSION/link.min.css --region us-west-1 --quiet --cache-control "max-age=86400" --acl public-read
  echo "$CURRENT_VERSION uploaded to the cdn"
fi

if [ ! -z "$ADMIN_CDN_EXISTS" ]; then
  echo "There is already a version $CURRENT_VERSION in the cdn. Skipping cdn publish…"
else
  aws s3 cp public/css/admin.min.css s3://assets.us.auth0.com/extensions/$EXTENSION_NAME/$CURRENT_VERSION/admin.min.css --region us-west-1 --quiet --cache-control "max-age=86400" --acl public-read
  echo "$CURRENT_VERSION uploaded to the cdn"
fi
