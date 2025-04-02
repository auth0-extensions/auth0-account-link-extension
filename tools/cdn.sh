VERSION="version"
MAJORMINOR="majorminor"

CURRENT_VERSION=$(node tools/attribute.js $VERSION)
EXTENSION_NAME="auth0-account-link"
PACKAGE_JSON='../package.json'
MAJORMINOR_VERSION=$(node tools/attribute.js $VERSION $PACKAGE_JSON $MAJORMINOR)

deploy_bundle() {
  BUNDLE_EXISTS=$(aws s3 ls s3://assets.us.auth0.com/extensions/$EXTENSION_NAME/ | grep "$EXTENSION_NAME-$1.js")
  CDN_EXISTS=$(aws s3 ls s3://assets.us.auth0.com/extensions/$EXTENSION_NAME/assets/ | grep "link.$1.min.css")
  ADMIN_CDN_EXISTS=$(aws s3 ls s3://assets.us.auth0.com/extensions/$EXTENSION_NAME/assets/ | grep "admin.$1.min.css")

  if [ ! -z "$BUNDLE_EXISTS" ]; then
    echo "There is already a $EXTENSION_NAME-$1.js in the cdn. Skipping cdn publish…"
  else
    aws s3 cp build/bundle.js s3://assets.us.auth0.com/extensions/$EXTENSION_NAME/$EXTENSION_NAME-$1.js --region us-west-1 --acl public-read
    echo "$EXTENSION_NAME-$1.js uploaded to the cdn"
  fi

  if [ ! -z "$CDN_EXISTS" ]; then
    echo "There is already a link.$1.min.css in the cdn. Skipping cdn publish…"
  else
    aws s3 cp dist/assets/link.$1.min.css s3://assets.us.auth0.com/extensions/$EXTENSION_NAME/assets/link.$1.min.css --region us-west-1 --cache-control "max-age=86400" --acl public-read
    echo "link.$1.min.css uploaded to the cdn"
  fi

  if [ ! -z "$ADMIN_CDN_EXISTS" ]; then
    echo "There is already a admin.$1.min.css in the cdn. Skipping cdn publish…"
  else
    aws s3 cp dist/assets/admin.$1.min.css s3://assets.us.auth0.com/extensions/$EXTENSION_NAME/assets/admin.$1.min.css --region us-west-1 --cache-control "max-age=86400" --acl public-read
    echo "admin.$1.min.css uploaded to the cdn"
  fi
}

deploy_bundle $CURRENT_VERSION
echo "Finished deploying $CURRENT_VERSION.js to the cdn"

deploy_bundle $MAJORMINOR_VERSION
echo "Finished deploying $MAJORMINOR_VERSION.js to the cdn"