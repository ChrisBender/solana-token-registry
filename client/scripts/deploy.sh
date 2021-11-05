aws s3 sync build/ s3://solanatokenregistry.com --delete --exclude "*.sw[a-p]"
aws cloudfront create-invalidation --distribution-id E2HH85CQDZTZGS --paths "/*"
