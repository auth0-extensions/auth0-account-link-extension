CURRENT_VERSION=$(node tools/attribute.js version)
EXTENSION_NAME="auth0-account-link-extension"

CDN_EXISTS=$(aws s3 ls s3://assets.us.auth0.com/js/$EXTENSION_NAME/$CURRENT_VERSION/ | grep "link.min.css")

if [ ! -z "$CDN_EXISTS" ]; then
  echo "There is already a version $CURRENT_VERSION in the cdn. Skipping cdn publish…"
else
  aws s3 sync release s3://assets.us.auth0.com/js/$EXTENSION_NAME/$CURRENT_VERSION --region us-west-1 --quiet --cache-control "max-age=86400" --acl public-read
  echo "$CURRENT_VERSION uploaded to the cdn"
fi
