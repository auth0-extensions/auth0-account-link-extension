CURRENT_VERSION=$(node tools/attribute.js version)
EXTENSION_NAME="auth0-account-link"

BUNDLE_EXISTS=$(aws s3 ls s3://assets.us.auth0.com/extensions/$EXTENSION_NAME/ | grep "$EXTENSION_NAME-$CURRENT_VERSION.js")
CDN_EXISTS=$(aws s3 ls s3://assets.us.auth0.com/extensions/$EXTENSION_NAME/assets/ | grep "link.$CURRENT_VERSION.min.css")
ADMIN_CDN_EXISTS=$(aws s3 ls s3://assets.us.auth0.com/extensions/$EXTENSION_NAME/assets/ | grep "admin.$CURRENT_VERSION.min.css")

if [ ! -z "$BUNDLE_EXISTS" ]; then
  echo "There is already a $EXTENSION_NAME-$CURRENT_VERSION.js in the cdn. Skipping cdn publish…"
else
  aws s3 cp build/bundle.js s3://assets.us.auth0.com/extensions/$EXTENSION_NAME/$EXTENSION_NAME-$CURRENT_VERSION.js --region us-west-1 --acl public-read
  echo "$EXTENSION_NAME-$CURRENT_VERSION.js uploaded to the cdn"
fi

if [ ! -z "$CDN_EXISTS" ]; then
  echo "There is already a link.$CURRENT_VERSION.min.css in the cdn. Skipping cdn publish…"
else
  aws s3 cp dist/assets/link.$CURRENT_VERSION.min.css s3://assets.us.auth0.com/extensions/$EXTENSION_NAME/assets/link.$CURRENT_VERSION.min.css --region us-west-1 --cache-control "max-age=86400" --acl public-read
  echo "link.$CURRENT_VERSION.min.css uploaded to the cdn"
fi

if [ ! -z "$ADMIN_CDN_EXISTS" ]; then
  echo "There is already a admin.$CURRENT_VERSION.min.css in the cdn. Skipping cdn publish…"
else
  aws s3 cp dist/assets/admin.$CURRENT_VERSION.min.css s3://assets.us.auth0.com/extensions/$EXTENSION_NAME/assets/admin.$CURRENT_VERSION.min.css --region us-west-1 --cache-control "max-age=86400" --acl public-read
  echo "admin.$CURRENT_VERSION.min.css uploaded to the cdn"
fi
